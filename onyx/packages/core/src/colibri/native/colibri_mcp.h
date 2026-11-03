/**
 * @file colibri_mcp.h
 * @brief Native Model Context Protocol (MCP) Server for Colibri Engine
 * 
 * Capability 2:
 * Exposes Colibri MoE and System One decision routing directly over stdio MCP (coli mcp)
 * and HTTP /v1 endpoints. Allows seamless agent swapping with zero glue code.
 */

#ifndef COLIBRI_MCP_H
#define COLIBRI_MCP_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    const char* name;
    const char* description;
    const char* schema_json;
} ColibriMcpToolDef;

typedef struct {
    bool is_running;
    int stdio_in;
    int stdio_out;
    uint32_t active_sessions;
} ColibriMcpServer;

/**
 * Initialize and start the Colibri MCP Server listening on stdio
 */
ColibriMcpServer* colibri_mcp_server_init(void);

/**
 * Process a single JSON-RPC MCP request and produce JSON-RPC response
 */
int colibri_mcp_handle_request(
    ColibriMcpServer* server,
    const char* json_request,
    char* out_response,
    size_t max_out_len
);

/**
 * Terminate Colibri MCP server
 */
void colibri_mcp_server_shutdown(ColibriMcpServer* server);

#ifdef __cplusplus
}
#endif

#endif // COLIBRI_MCP_H
