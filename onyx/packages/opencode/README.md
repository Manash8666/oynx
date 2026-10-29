# Onyx CLI

The AI coding agent built for the terminal. Generate code from natural language, automate tasks, and run terminal commands -- powered by 500+ AI models.

![Onyx CLI showing code edits in a terminal](https://raw.githubusercontent.com/Manash8666/oynx/main/packages/kilo-docs/public/img/npm-package-readme/kilo-cli.png)

Kilo is the all-in-one agentic engineering platform. Build, ship, and iterate faster with the most popular open source coding agent.

[Website](https://oynx.si) · [Install](https://oynx.si/install) · [IDE](https://oynx.si/landing/vs-code) · [CLI](https://oynx.si/cli) · [Docs](https://oynx.si/docs) · [Models](https://oynx.si/leaderboard) · [Gateway](https://oynx.si/gateway) · [Pricing](https://oynx.si/pricing) · [Onyx Pass](https://oynx.si/pricing/kilo-pass)

[500+ models](https://oynx.si/leaderboard). One open source agent in [VS Code](https://oynx.si/vscode-marketplace), [JetBrains](https://plugins.jetbrains.com/plugin/27133-kilo-code), [CLI](https://www.npmjs.com/package/@kilocode/cli), [Slack](https://oynx.si/slack), and [Cloud](https://oynx.si/cloud).

## Install

```bash
npm install -g @kilocode/cli
```

Or run directly with npx:

```bash
npx --package @kilocode/cli kilo
```

## Getting Started

Run `kilo` in any project directory to launch the interactive TUI:

```bash
kilo
```

Run a one-off task:

```bash
kilo run "add input validation to the signup form"
```

## Features

- **Code generation** -- describe what you want in natural language
- **Terminal commands** -- the agent can run shell commands on your behalf
- **500+ AI models** -- use models from OpenAI, Anthropic, Google, and more
- **MCP servers** -- extend agent capabilities with the Model Context Protocol
- **Multiple modes** -- Plan with Architect, code with Coder, debug with Debugger, or create your own
- **Sessions** -- resume previous conversations and export transcripts
- **API keys optional** -- bring your own keys or use Kilo credits

## Commands

| Command               | Description                |
| --------------------- | -------------------------- |
| `kilo`                | Launch interactive TUI     |
| `kilo run "<task>"`   | Run a one-off task         |
| `kilo auth`           | Manage authentication      |
| `kilo models`         | List available models      |
| `kilo mcp`            | Manage MCP servers         |
| `kilo session list`   | List sessions              |
| `kilo session delete` | Delete a session           |
| `kilo export`         | Export session transcripts |

Run `kilo --help` for the full list.

## Alternative Installation

### Homebrew (macOS/Linux)

```bash
brew install Kilo-Org/tap/kilo
```

### GitHub Releases

Download pre-built binaries from the [Releases page](https://github.com/Manash8666/oynx.git/releases).

## Documentation

- [Docs](https://oynx.si/docs)
- [Getting Started](https://oynx.si/docs/getting-started)

## Links

- [GitHub](https://github.com/Manash8666/oynx.git)
- [Discord](https://oynx.si/discord)
- [VS Code Extension](https://oynx.si/vscode-marketplace)
- [Website](https://oynx.si)

## License

MIT
