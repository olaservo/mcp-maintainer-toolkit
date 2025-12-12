import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { setClientCapabilities, setupToolHandlers } from "./handlers/tools.js";
import { setupResourceHandlers } from "./handlers/resources.js";
import { setupPromptHandlers } from "./handlers/prompts.js";

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
        prompts: {},
        elicitation: {},
      },
    }
  );

  // Setup tool handlers
  setupToolHandlers(server);

  // Setup resource handlers
  const { cleanup: cleanupResources } = setupResourceHandlers(server);

  // Setup prompt handlers
  setupPromptHandlers(server);

  // Set client capabilities after initialization
  server.oninitialized = async () => {
    setClientCapabilities(server.getClientCapabilities());
  };

  const cleanup = async () => {
    await cleanupResources();
  };

  return { server, cleanup };
};