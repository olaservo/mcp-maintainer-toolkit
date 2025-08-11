import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { setupToolHandlers } from "./handlers/tools.js";
import { setupResourceHandlers } from "./handlers/resources.js";

export const createServer = () => {
  const server = new Server(
    {
      name: "mcp-maintainer-toolkit",
      version: "0.1.2",
    },
    {
      capabilities: {
        tools: {},
        resources: { subscribe: true },
      },
    }
  );

  // Setup tool handlers
  setupToolHandlers(server);

  // Setup resource handlers
  const { cleanup: cleanupResources } = setupResourceHandlers(server);

  const cleanup = async () => {
    await cleanupResources();
  };

  return { server, cleanup };
};