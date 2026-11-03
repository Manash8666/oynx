/**
 * @file colibri_somatic.h
 * @brief Topological Expert Co-Activation Clustering & Somatic Disk Layout for Colibri MoE
 * 
 * Instead of storing weights sequentially by layer_id/expert_id (which forces random 4K scatter-gather reads),
 * this engine clusters frequently co-activated experts into contiguous super-clusters on disk.
 * Enables sequential NVMe read saturation (up to 7,000+ MB/s) instead of random 4K reads (<100 MB/s).
 */

#ifndef COLIBRI_SOMATIC_H
#define COLIBRI_SOMATIC_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define COLIBRI_MAX_EXPERTS_PER_LAYER 256
#define COLIBRI_MAX_LAYERS 80
#define COLIBRI_CLUSTER_BLOCK_SIZE (64 * 1024 * 1024) // 64 MB Super-cluster blocks
#define COLIBRI_MAX_CLUSTERS_PER_LAYER 16

typedef struct {
    uint32_t expert_id;
    uint32_t cluster_id;
    uint64_t disk_offset;
    uint32_t byte_length;
    uint8_t  precision_tier; // 0 = int8, 1 = int4, 2 = ternary/2-bit
    float    coactivation_score;
} ColibriExpertLocation;

typedef struct {
    uint32_t cluster_id;
    uint32_t layer_id;
    uint64_t disk_offset;
    uint32_t total_bytes;
    uint32_t expert_count;
    uint32_t expert_ids[32]; // Expert IDs bundled in this contiguous super-cluster
} ColibriSuperCluster;

typedef struct {
    uint32_t num_layers;
    uint32_t total_experts;
    uint32_t top_k;
    float coactivation_matrix[COLIBRI_MAX_LAYERS][COLIBRI_MAX_EXPERTS_PER_LAYER][COLIBRI_MAX_EXPERTS_PER_LAYER];
    ColibriExpertLocation expert_map[COLIBRI_MAX_LAYERS][COLIBRI_MAX_EXPERTS_PER_LAYER];
    ColibriSuperCluster clusters[COLIBRI_MAX_LAYERS][COLIBRI_MAX_CLUSTERS_PER_LAYER];
    uint32_t cluster_counts[COLIBRI_MAX_LAYERS];
} ColibriSomaticLayout;

/**
 * Initialize somatic layout state for an MoE model architecture
 */
ColibriSomaticLayout* colibri_somatic_create(uint32_t num_layers, uint32_t experts_per_layer, uint32_t top_k);

/**
 * Record an empirical co-activation event across chosen top_k experts
 */
void colibri_somatic_record_activation(ColibriSomaticLayout* layout, uint32_t layer_id, const uint32_t* active_experts, uint32_t count);

/**
 * Run spectral/Louvain community clustering to generate contiguous disk layout super-clusters
 */
void colibri_somatic_cluster_experts(ColibriSomaticLayout* layout);

/**
 * Resolve whether requested experts can be serviced by a single contiguous super-cluster read
 */
bool colibri_somatic_find_optimal_cluster(
    const ColibriSomaticLayout* layout,
    uint32_t layer_id,
    const uint32_t* requested_experts,
    uint32_t count,
    uint32_t* out_cluster_id,
    uint64_t* out_offset,
    uint32_t* out_bytes
);

/**
 * Free somatic layout
 */
void colibri_somatic_destroy(ColibriSomaticLayout* layout);

#ifdef __cplusplus
}
#endif

#endif // COLIBRI_SOMATIC_H
