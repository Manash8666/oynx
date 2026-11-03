/**
 * @file colibri_system_one.h
 * @brief Fast Deterministic System One Decision Head for Agent Lucifer
 * 
 * Capability 3:
 * In a code IDE, the agent performs micro-decisions thousands of times per session:
 * - Intent classification
 * - Next file to edit
 * - Sub-agent triage (Backend vs Frontend vs Security)
 * - Test pass/fail verification
 * 
 * Instead of waiting 800ms-2500ms for a full LLM chat round-trip,
 * Colibri System One evaluates direct logprob probability distributions on CPU
 * in 1ms to 4ms with ZERO token cost.
 */

#ifndef COLIBRI_SYSTEM_ONE_H
#define COLIBRI_SYSTEM_ONE_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define COLIBRI_MAX_DECISION_CLASSES 16

typedef struct {
    char class_name[32];
    float logprob;
    float probability;
} ColibriDecisionClass;

typedef struct {
    char chosen_action[32];
    float confidence;
    uint32_t latency_microseconds;
    uint32_t class_count;
    ColibriDecisionClass classes[COLIBRI_MAX_DECISION_CLASSES];
} ColibriDecisionResult;

typedef struct {
    uint32_t vocab_size;
    uint32_t embedding_dim;
    float* action_prototypes; // Centroid embeddings for decision classes [16 * embedding_dim]
    char action_names[COLIBRI_MAX_DECISION_CLASSES][32];
    uint32_t num_actions;
} ColibriSystemOneEngine;

/**
 * Create System One Decision Engine with standard agent actions
 */
ColibriSystemOneEngine* colibri_system_one_create(uint32_t embedding_dim);

/**
 * Register a target decision action (e.g., "AST_FIX", "BACKEND_AGENT", "RUN_TESTS")
 */
bool colibri_system_one_register_action(ColibriSystemOneEngine* engine, const char* action_name, const float* prototype_embedding);

/**
 * Compute instantaneous logprob distribution on CPU (<5ms)
 */
ColibriDecisionResult colibri_system_one_route(
    const ColibriSystemOneEngine* engine,
    const float* query_embedding,
    const char** candidate_actions,
    uint32_t candidate_count
);

/**
 * Destroy System One Engine
 */
void colibri_system_one_destroy(ColibriSystemOneEngine* engine);

#ifdef __cplusplus
}
#endif

#endif // COLIBRI_SYSTEM_ONE_H
