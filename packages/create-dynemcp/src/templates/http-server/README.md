# HTTP Server Example

This template demonstrates how to set up a basic MCP server that communicates over HTTP instead of the default stdio.

## How it works

The `dynemcp.config.json` file is configured to use the `http-stream` transport:

```json
"transport": {
  "type": "http-stream",
  "options": {
    "port": 3000
  }
}
```

When you run `pnpm start`, the framework automatically starts an HTTP server on port 3000. You can then connect to it using any MCP client that supports the Streamable HTTP transport.
