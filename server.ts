import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools, registerConditionalTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

export const createServer = () => {
  const server = new McpServer(
    {
      name: "mcp-maintainer-toolkit",
      version: "0.1.5",
    },
    {
      capabilities: {
        resources: { subscribe: true },
      },
    }
  );

  // Register tools
  registerTools(server);

  // Register resources (includes pagination override and subscriptions)
  const { cleanup: cleanupResources } = registerResources(server);

  // Register prompts
  registerPrompts(server);

  // Register conditional tools after initialization (when client capabilities are known)
  server.server.oninitialized = async () => {
    registerConditionalTools(server);
  };

  const cleanup = async () => {
    await cleanupResources();
  };

  return { server, cleanup };
};
