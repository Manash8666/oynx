/**
 * @file colibri_speculative.h
 * @brief I/O-Aware Speculative Decoding & Layer-Skipped Verification for Colibri MoE
 * 
 * Breakthrough 2: Cache-Constrained Speculative Pruning.
 * Draft beam sampler penalizes paths requiring cold experts from NVMe and gives probability
 * bonuses to tokens whose required experts already reside in RAM/VRAM LRU cache.
 * 
 * Breakthrough 3: Layer-Skipped Speculative Verification with Delayed Re-Anchoring.
 * During verification, intermediate even-numbered layers (20-60) route only through
 * dense attention and shared experts, cutting I/O bandwidth requirements in half.
 */

#ifndef COLIBRI_SPECULATIVE_H
#define COLIBRI_SPECULATIVE_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define COLIBRI_MAX_BEAMS 8
#define COLIBRI_MAX_SPEC_TOKENS 16
#define COLIBRI_LRU_CACHE_CAPACITY 64

typedef struct {
    uint32_t layer_id;
    uint32_t expert_id;
    uint64_t last_used_timestamp;
    bool is_in_ram;
} ColibriLruEntry;

typedef struct {
    ColibriLruEntry entries[COLIBRI_LRU_CACHE_CAPACITY];
    uint32_t count;
    uint64_t current_clock;
} ColibriLruCache;

typedef struct {
    uint32_t token_id;
    float raw_logit;
    float adjusted_score;
    uint32_t required_experts[8];
    uint32_t expert_count;
    uint32_t cache_hits;
    uint32_t cache_misses;
} ColibriDraftCandidate;

typedef struct {
    float cold_expert_penalty;  // Penalty factor for experts on disk (e.g. 0.35)
    float cache_hit_bonus;       // Bonus factor for in-RAM experts (e.g. 0.20)
    float confidence_threshold;  // Threshold tau to allow cold disk read branching (e.g. 0.88)
    float entropy_threshold;     // Threshold epsilon for layer-skipped verification (e.g. 0.12)
    uint32_t skip_layer_start;   // Default: 20
    uint32_t skip_layer_end;     // Default: 60
} ColibriSpeculativeConfig;

/**
 * Initialize LRU cache state
 */
void colibri_lru_init(ColibriLruCache* cache);

/**
 * Check if expert is resident in RAM cache
 */
bool colibri_lru_is_cached(const ColibriLruCache* cache, uint32_t layer_id, uint32_t expert_id);

/**
 * Touch or insert expert into LRU cache
 */
void colibri_lru_touch(ColibriLruCache* cache, uint32_t layer_id, uint32_t expert_id);

/**
 * Score candidate draft tokens with I/O-aware penalty and cache affinity bonus
 */
void colibri_speculative_prune_candidates(
    const ColibriSpeculativeConfig* config,
    const ColibriLruCache* cache,
    ColibriDraftCandidate* candidates,
    uint32_t candidate_count,
    uint32_t* out_selected_index
);

/**
 * Check if layer should skip routed MoE experts during speculative verification
 */
bool colibri_should_skip_layer(
    const ColibriSpeculativeConfig* config,
    uint32_t layer_id,
    bool is_speculative_verification
);

/**
 * Delayed re-anchoring verification check
 * Evaluates whether draft token can be accepted or requires fallback full evaluation
 */
bool colibri_verify_draft_with_layer_skipping(
    const ColibriSpeculativeConfig* config,
    float draft_entropy,
    float top_logit_diff,
    bool* out_requires_full_reanchor
);

#ifdef __cplusplus
}
#endif

#endif // COLIBRI_SPECULATIVE_H
