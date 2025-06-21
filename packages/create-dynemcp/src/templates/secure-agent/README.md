# Secure Agent Example

This template demonstrates how to create a production-ready, secure MCP agent.

It builds upon the `http-server` example and adds several key features:

- **Authentication**: The server is protected by an API key middleware. Clients must provide a valid `x-api-key` header to connect.
- **Session Management**: Sessions are enabled to maintain a consistent context for each client.
- **Resumability**: The connection can be resumed after a temporary disruption.
- **Documentation URL**: A custom documentation URL is provided in the server's metadata.

## How to use

1.  **Start the server**: `pnpm start`
2.  **Connect with a client**: Use an MCP client (like the MCP Inspector) to connect to `http://localhost:4000`.
3.  **Set the `x-api-key` header**: You must provide a header `x-api-key` with the value `my-secret-key` to authenticate successfully.
