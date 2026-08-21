# Supabase MCP Server

This directory documents the Supabase MCP server configured for this project.

## Server

- **Name**: `github.com/supabase-community/supabase-mcp`
- **Type**: `http`
- **URL**: `https://mcp.supabase.com/mcp`

## Configuration (cline_mcp_settings.json)

```json
{
  "mcpServers": {
    "github.com/supabase-community/supabase-mcp": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

## Notes

- This is a hosted (HTTP) MCP server. No local binary install is required.
- On first use, Cline will prompt you to log in to Supabase via OAuth 2.1.
- Choose the organization that contains the project you wish to work with.

## Reference

- Repo: https://github.com/supabase-community/supabase-mcp
- Setup docs: https://supabase.com/docs/guides/getting-started/mcp
- Security best practices: https://supabase.com/docs/guides/ai-tools/mcp#security-risks