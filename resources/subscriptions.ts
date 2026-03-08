import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export function setupSubscriptions(server: McpServer) {
  const subscriptions = new Set<string>();

  const subsUpdateInterval = setInterval(() => {
    for (const uri of subscriptions) {
      server.server.notification({
        method: "notifications/resources/updated",
        params: { uri },
      });
    }
  }, 10000);

  server.server.setRequestHandler(SubscribeRequestSchema, async (request) => {
    const { uri } = request.params;
    subscriptions.add(uri);
    return {};
  });

  server.server.setRequestHandler(UnsubscribeRequestSchema, async (request) => {
    subscriptions.delete(request.params.uri);
    return {};
  });

  return {
    cleanup: async () => {
      clearInterval(subsUpdateInterval);
    },
  };
}
