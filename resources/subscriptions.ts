import { McpServer } from "@modelcontextprotocol/server";

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

  server.server.setRequestHandler('resources/subscribe', async (request) => {
    const { uri } = request.params;
    subscriptions.add(uri);
    return {};
  });

  server.server.setRequestHandler('resources/unsubscribe', async (request) => {
    subscriptions.delete(request.params.uri);
    return {};
  });

  return {
    cleanup: async () => {
      clearInterval(subsUpdateInterval);
    },
  };
}
