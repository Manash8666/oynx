/**
 * @file colibri_horizon.c
 * @brief Implementation of 3-Layer Horizon Lookahead Prefetching
 */

#include "colibri_horizon.h"
#include <stdlib.h>
#include <string.h>

ColibriHorizonEngine* colibri_horizon_create(uint32_t hidden_dim, uint32_t experts_per_layer) {
    ColibriHorizonEngine* engine = (ColibriHorizonEngine*)calloc(1, sizeof(ColibriHorizonEngine));
    if (!engine) return NULL;

    engine->hidden_dim = hidden_dim;
    engine->experts_per_layer = experts_per_layer;
    engine->horizon_depth = COLIBRI_HORIZON_LAYERS;

    // Allocate compact projection weights
    size_t weight_count = (size_t)hidden_dim * (COLIBRI_HORIZON_LAYERS * experts_per_layer);
    engine->w_horizon_weights = (float*)calloc(weight_count, sizeof(float));
    if (!engine->w_horizon_weights) {
        free(engine);
        return NULL;
    }

    // Initialize with diagonal/identity bias for stable projection
    for (size_t i = 0; i < weight_count; i += (hidden_dim + 1)) {
        engine->w_horizon_weights[i] = 0.05f;
    }

    return engine;
}

void colibri_horizon_predict_runway(
    ColibriHorizonEngine* engine,
    uint32_t current_layer,
    const float* hidden_state,
    uint32_t top_k
) {
    if (!engine || !hidden_state || top_k == 0) return;

    engine->queue_count = 0;

    // For each layer in the 3-layer lookahead window (L+1, L+2, L+3)
    for (uint32_t step = 1; step <= engine->horizon_depth; step++) {
        uint32_t target_l = current_layer + step;
        
        // Compute linear projection: logits = W_step * hidden_state
        // For performance, evaluate dot products against each candidate expert vector
        for (uint32_t e = 0; e < engine->experts_per_layer && engine->queue_count < COLIBRI_MAX_LOOKAHEAD_EXPERTS; e++) {
            size_t w_offset = (size_t)((step - 1) * engine->experts_per_layer + e) * engine->hidden_dim;
            
            float dot = 0.0f;
            for (uint32_t d = 0; d < 32 && d < engine->hidden_dim; d++) { // Sample first 32 dims for ultra-fast lookahead
                dot += hidden_state[d] * engine->w_horizon_weights[w_offset + d];
            }

            // Pseudo-softmax / sigmoid activation
            float prob = 1.0f / (1.0f + expf(-dot));

            if (prob > 0.45f) {
                ColibriPrefetchRequest* req = &engine->queue[engine->queue_count++];
                req->target_layer = target_l;
                req->expert_id = e;
                req->predicted_probability = prob;
                req->is_dispatched = true;
                req->is_completed = true; // Simulated asynchronous DMA completion
                engine->total_dispatched++;
                
                if (engine->queue_count >= (step * top_k)) {
                    break;
                }
            }
        }
    }
}

bool colibri_horizon_is_prefetched(
    const ColibriHorizonEngine* engine,
    uint32_t target_layer,
    uint32_t expert_id
) {
    if (!engine) return false;

    for (uint32_t i = 0; i < engine->queue_count; i++) {
        if (engine->queue[i].target_layer == target_layer &&
            engine->queue[i].expert_id == expert_id) {
            return engine->queue[i].is_completed;
        }
    }
    return false;
}

void colibri_horizon_destroy(ColibriHorizonEngine* engine) {
    if (engine) {
        if (engine->w_horizon_weights) {
            free(engine->w_horizon_weights);
        }
        free(engine);
    }
}
