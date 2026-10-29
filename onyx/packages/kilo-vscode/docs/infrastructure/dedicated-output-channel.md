# Dedicated Output Channel

**Priority:** P2

Agent Manager has its own output channel. No general "Onyx" output channel exists.

## Remaining Work

- Create `vscode.window.createOutputChannel("Onyx")` during activation
- Centralized logging utility with log levels (debug, info, warn, error)
- Route all `[Kilo New]` log messages to this channel
- Dispose on deactivation
- Migrate existing `console.log("[Kilo New] ...")` calls to the logger
