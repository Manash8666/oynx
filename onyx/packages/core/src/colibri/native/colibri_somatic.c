/**
 * @file colibri_somatic.c
 * @brief Implementation of Topological Expert Co-Activation Clustering for Colibri MoE
 */

#include "colibri_somatic.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <math.h>

ColibriSomaticLayout* colibri_somatic_create(uint32_t num_layers, uint32_t experts_per_layer, uint32_t top_k) {
    if (num_layers > COLIBRI_MAX_LAYERS || experts_per_layer > COLIBRI_MAX_EXPERTS_PER_LAYER) {
        return NULL;
    }

    ColibriSomaticLayout* layout = (ColibriSomaticLayout*)calloc(1, sizeof(ColibriSomaticLayout));
    if (!layout) return NULL;

    layout->num_layers = num_layers;
    layout->total_experts = experts_per_layer;
    layout->top_k = top_k;

    // Initialize baseline sequential offsets before clustering
    uint64_t current_offset = 0;
    for (uint32_t l = 0; l < num_layers; l++) {
        layout->cluster_counts[l] = 0;
        for (uint32_t e = 0; e < experts_per_layer; e++) {
            ColibriExpertLocation* loc = &layout->expert_map[l][e];
            loc->expert_id = e;
            loc->cluster_id = 0;
            loc->disk_offset = current_offset;
            loc->byte_length = 19 * 1024 * 1024; // Default ~19MB per int4 expert
            loc->precision_tier = 1; // int4 default
            loc->coactivation_score = 1.0f;
            current_offset += loc->byte_length;
        }
    }

    return layout;
}

void colibri_somatic_record_activation(ColibriSomaticLayout* layout, uint32_t layer_id, const uint32_t* active_experts, uint32_t count) {
    if (!layout || layer_id >= layout->num_layers || count < 2) return;

    for (uint32_t i = 0; i < count; i++) {
        uint32_t e1 = active_experts[i];
        if (e1 >= layout->total_experts) continue;

        for (uint32_t j = i + 1; j < count; j++) {
            uint32_t e2 = active_experts[j];
            if (e2 >= layout->total_experts) continue;

            layout->coactivation_matrix[layer_id][e1][e2] += 1.0f;
            layout->coactivation_matrix[layer_id][e2][e1] += 1.0f;
        }
    }
}

void colibri_somatic_cluster_experts(ColibriSomaticLayout* layout) {
    if (!layout) return;

    // Greedy modularity clustering per layer
    for (uint32_t l = 0; l < layout->num_layers; l++) {
        bool assigned[COLIBRI_MAX_EXPERTS_PER_LAYER] = { false };
        uint32_t cluster_idx = 0;
        uint64_t cluster_disk_base = (uint64_t)l * (uint64_t)layout->total_experts * (19ULL * 1024 * 1024);

        for (uint32_t e = 0; e < layout->total_experts; e++) {
            if (assigned[e]) continue;
            if (cluster_idx >= COLIBRI_MAX_CLUSTERS_PER_LAYER) break;

            ColibriSuperCluster* sc = &layout->clusters[l][cluster_idx];
            sc->cluster_id = cluster_idx;
            sc->layer_id = l;
            sc->disk_offset = cluster_disk_base;
            sc->expert_count = 0;
            sc->total_bytes = 0;

            // Seed cluster with primary expert
            sc->expert_ids[sc->expert_count++] = e;
            assigned[e] = true;

            // Greedily find top co-activated partners to pack into contiguous 64MB - 128MB super-cluster
            while (sc->expert_count < 8 && sc->expert_count < 32) {
                float best_affinity = -1.0f;
                int32_t best_candidate = -1;

                for (uint32_t cand = 0; cand < layout->total_experts; cand++) {
                    if (assigned[cand]) continue;

                    // Calculate average affinity to existing cluster members
                    float affinity_sum = 0.0f;
                    for (uint32_t m = 0; m < sc->expert_count; m++) {
                        uint32_t member = sc->expert_ids[m];
                        affinity_sum += layout->coactivation_matrix[l][member][cand];
                    }

                    if (affinity_sum > best_affinity) {
                        best_affinity = affinity_sum;
                        best_candidate = (int32_t)cand;
                    }
                }

                if (best_candidate >= 0 && (best_affinity > 0.0f || sc->expert_count < 4)) {
                    sc->expert_ids[sc->expert_count++] = (uint32_t)best_candidate;
                    assigned[best_candidate] = true;
                } else {
                    break;
                }
            }

            // Assign contiguous disk offsets for all members in this super cluster
            uint64_t member_offset = cluster_disk_base;
            for (uint32_t m = 0; m < sc->expert_count; m++) {
                uint32_t exp_id = sc->expert_ids[m];
                ColibriExpertLocation* loc = &layout->expert_map[l][exp_id];
                loc->cluster_id = cluster_idx;
                loc->disk_offset = member_offset;
                sc->total_bytes += loc->byte_length;
                member_offset += loc->byte_length;
            }

            cluster_disk_base += sc->total_bytes;
            cluster_idx++;
        }

        layout->cluster_counts[l] = cluster_idx;
    }
}

bool colibri_somatic_find_optimal_cluster(
    const ColibriSomaticLayout* layout,
    uint32_t layer_id,
    const uint32_t* requested_experts,
    uint32_t count,
    uint32_t* out_cluster_id,
    uint64_t* out_offset,
    uint32_t* out_bytes
) {
    if (!layout || layer_id >= layout->num_layers || count == 0) return false;

    // Check if majority of requested experts belong to a single super-cluster
    uint32_t cluster_votes[COLIBRI_MAX_CLUSTERS_PER_LAYER] = { 0 };
    for (uint32_t i = 0; i < count; i++) {
        uint32_t eid = requested_experts[i];
        if (eid < layout->total_experts) {
            uint32_t cid = layout->expert_map[layer_id][eid].cluster_id;
            if (cid < COLIBRI_MAX_CLUSTERS_PER_LAYER) {
                cluster_votes[cid]++;
            }
        }
    }

    uint32_t best_cid = 0;
    uint32_t max_votes = 0;
    for (uint32_t c = 0; c < layout->cluster_counts[layer_id]; c++) {
        if (cluster_votes[c] > max_votes) {
            max_votes = cluster_votes[c];
            best_cid = c;
        }
    }

    // If >= 50% of the active experts reside in the same super cluster, trigger single contiguous DMA read
    if (max_votes * 2 >= count && best_cid < layout->cluster_counts[layer_id]) {
        const ColibriSuperCluster* sc = &layout->clusters[layer_id][best_cid];
        if (out_cluster_id) *out_cluster_id = best_cid;
        if (out_offset) *out_offset = sc->disk_offset;
        if (out_bytes) *out_bytes = sc->total_bytes;
        return true;
    }

    return false;
}

void colibri_somatic_destroy(ColibriSomaticLayout* layout) {
    if (layout) {
        free(layout);
    }
}
