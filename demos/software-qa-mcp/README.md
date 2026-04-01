# Software Q&A with MCP Servers Demo

This demo is an `Agent Source Directory` bundle for the OpenClaw installer.

It provisions a single agent that can answer questions about software using live documentation from two MCP servers:

- **DeepWiki** — AI-powered docs for any GitHub repository
- **Context7** — Current docs for popular libraries and frameworks

## What's included

| File | Purpose |
|------|---------|
| `mcp.json` | Configures DeepWiki and Context7 as streamable HTTP MCP servers |
| `exec-approvals.json` | Sets baseline tool approval policy |
| `workspace-main/AGENTS.md` | Agent identity and instructions |
| `workspace-main/SOUL.md` | Agent persona |

## How to use it

1. Open the OpenClaw installer
2. Set **Agent Source Directory** to this folder (e.g., `demos/software-qa-mcp`)
3. Deploy as usual — the MCP servers are configured automatically

After deployment, ask your agent questions like:

- "How does the Next.js App Router handle layouts?"
- "What's the API for the octokit/rest.js GitHub client?"
- "How does Django's ORM handle migrations?"

The agent will use its MCP tools to fetch current documentation before answering.

## Customizing

Edit `mcp.json` to add or remove MCP servers. The format follows the OpenClaw `mcpServers` convention:

```json
{
  "mcpServers": {
    "server-name": {
      "url": "https://your-server.example.com/mcp"
    }
  }
}
```

For stdio-based servers, use `command` and `args` instead of `url`:

```json
{
  "mcpServers": {
    "local-server": {
      "command": "npx",
      "args": ["-y", "@some/mcp-server"]
    }
  }
}
```
