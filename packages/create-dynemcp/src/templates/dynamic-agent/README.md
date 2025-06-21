# Dynamic Agent Example

This template demonstrates the advanced dynamic capabilities of the `dynemcp` framework.

## Features Showcased

- **Dynamic Tool Registration**: The agent starts with no tools. After 10 seconds, it dynamically registers a new tool called `get-system-load` using `server.registry.addTool()`. This shows how an agent can learn new abilities while it's running.

- **Sampling**: Every 20 seconds, the agent proactively asks the language model for a status update using the `server.sample()` method. This allows the server to initiate conversations with the model, a core feature for building autonomous agents.

## How to Run

Simply run `pnpm start` and observe the console output. You will see the agent learn a new tool and then periodically interact with the model.
