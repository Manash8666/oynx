/**
 * @file colibri_speculative.c
 * @brief Implementation of I/O-Aware Speculative Pruning & Layer-Skipped Verification
 */

#include "colibri_speculative.h"
#include <string.h>
#include <math.h>

void colibri_lru_init(ColibriLruCache* cache) {
    if (!cache) return;
    memset(cache, 0, sizeof(ColibriLruCache));
}

bool colibri_lru_is_cached(const ColibriLruCache* cache, uint32_t layer_id, uint32_t expert_id) {
    if (!cache) return false;
    for (uint32_t i = 0; i < cache->count; i++) {
        if (cache->entries[i].is_in_ram &&
            cache->entries[i].layer_id == layer_id &&
            cache->entries[i].expert_id == expert_id) {
            return true;
        }
    }
    return false;
}

void colibri_lru_touch(ColibriLruCache* cache, uint32_t layer_id, uint32_t expert_id) {
    if (!cache) return;
    cache->current_clock++;

    // Check if already in cache
    for (uint32_t i = 0; i < cache->count; i++) {
        if (cache->entries[i].layer_id == layer_id && cache->entries[i].expert_id == expert_id) {
            cache->entries[i].last_used_timestamp = cache->current_clock;
            cache->entries[i].is_in_ram = true;
            return;
        }
    }

    // Insert new entry if space available
    if (cache->count < COLIBRI_LRU_CACHE_CAPACITY) {
        ColibriLruEntry* entry = &cache->entries[cache->count++];
        entry->layer_id = layer_id;
        entry->expert_id = expert_id;
        entry->last_used_timestamp = cache->current_clock;
        entry->is_in_ram = true;
        return;
    }

    // Evict least recently used entry
    uint32_t lru_idx = 0;
    uint64_t oldest = cache->entries[0].last_used_timestamp;
    for (uint32_t i = 1; i < cache->count; i++) {
        if (cache->entries[i].last_used_timestamp < oldest) {
            oldest = cache->entries[i].last_used_timestamp;
            lru_idx = i;
        }
    }

    cache->entries[lru_idx].layer_id = layer_id;
    cache->entries[lru_idx].expert_id = expert_id;
    cache->entries[lru_idx].last_used_timestamp = cache->current_clock;
    cache->entries[lru_idx].is_in_ram = true;
}

void colibri_speculative_prune_candidates(
    const ColibriSpeculativeConfig* config,
    const ColibriLruCache* cache,
    ColibriDraftCandidate* candidates,
    uint32_t candidate_count,
    uint32_t* out_selected_index
) {
    if (!config || !cache || !candidates || candidate_count == 0) return;

    float best_score = -1e9f;
    uint32_t best_idx = 0;

    for (uint32_t i = 0; i < candidate_count; i++) {
        ColibriDraftCandidate* cand = &candidates[i];
        cand->cache_hits = 0;
        cand->cache_misses = 0;

        for (uint32_t e = 0; e < cand->expert_count; e++) {
            // Assume evaluation against lookahead layer 0/1
            if (colibri_lru_is_cached(cache, 0, cand->required_experts[e])) {
                cand->cache_hits++;
            } else {
                cand->cache_misses++;
            }
        }

        // Apply Breakthrough 2: I/O-Constrained Scoring
        // Raw Logit adjusted by cache residency
        float hit_bonus = (float)cand->cache_hits * config->cache_hit_bonus;
        float miss_penalty = (float)cand->cache_misses * config->cold_expert_penalty;
        
        // If candidate has cold disk misses, require confidence threshold to branch
        float adjusted = cand->raw_logit + hit_bonus - miss_penalty;
        if (cand->cache_misses > 0 && cand->raw_logit < config->confidence_threshold) {
            adjusted -= 2.0f; // Strongly suppress speculative cold stalls
        }

        cand->adjusted_score = adjusted;

        if (adjusted > best_score) {
            best_score = adjusted;
            best_idx = i;
        }
    }

    if (out_selected_index) {
        *out_selected_index = best_idx;
    }
}

bool colibri_should_skip_layer(
    const ColibriSpeculativeConfig* config,
    uint32_t layer_id,
    bool is_speculative_verification
) {
    if (!config || !is_speculative_verification) return false;

    // Breakthrough 3: Skip routed experts on even intermediate layers
    if (layer_id >= config->skip_layer_start && layer_id <= config->skip_layer_end) {
        if ((layer_id % 2) == 0) {
            return true; // Skip routed MoE experts, run dense attention + shared only
        }
    }
    return false;
}

bool colibri_verify_draft_with_layer_skipping(
    const ColibriSpeculativeConfig* config,
    float draft_entropy,
    float top_logit_diff,
    bool* out_requires_full_reanchor
) {
    if (!config) return false;

    // If entropy is low and margin between top candidate and runner-up is wide:
    // Accept token immediately without full intermediate layer re-evaluation
    if (draft_entropy <= config->entropy_threshold && top_logit_diff >= 1.5f) {
        if (out_requires_full_reanchor) *out_requires_full_reanchor = false;
        return true; // Accept draft token directly
    }

    // Borderline case: triggers delayed re-anchoring
    if (out_requires_full_reanchor) *out_requires_full_reanchor = true;
    return false;
}
