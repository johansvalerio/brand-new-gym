# Supabase MCP Server (local stdio + PAT)

This directory documents the **local stdio** Supabase MCP server configured for this project.

## Server

- **Name**: `supabase` (registered in `cline_mcp_settings.json` at repo root)
- **Type**: `stdio`
- **Command**: `npx -y @supabase/mcp-server-supabase@latest --project-ref wknacbyqqpsvswjhwrbx`
- **Project ref**: `wknacbyqqpsvswjhwrbx`

## Configuration

The block lives at the repo root in `cline_mcp_settings.json`. Tokens are read from
**process environment variables** — never committed to disk.

```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref",
        "wknacbyqqpsvswjhwrbx"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

## One-time setup

1. Generate a Supabase Personal Access Token (PAT) at
   <https://supabase.com/dashboard/account/tokens>. Scope: only this project.
2. Export it as a **user-level environment variable** in PowerShell:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', '<paste-token>', 'User')
   ```
3. **Restart VSCode** (or Devin / Cline host) so the new env var is inherited.
4. From the MCP panel, run a `SELECT 1;` query to verify the connection.

## Notes

- We use the local stdio variant (not the hosted HTTP one) because the PAT
  stays inside the OS env and never travels through the network.
- The PAT can read/write everything for this project; scope down in the future
  if the team grows.
- Rotate the PAT periodically and re-export the env var.

## Reference

- Server repo: <https://github.com/supabase-community/supabase-mcp>
- Setup docs: <https://supabase.com/docs/guides/getting-started/mcp>
- Security risks: <https://supabase.com/docs/guides/ai-tools/mcp#security-risks>
