import { McpServer } from "@modelcontextprotocol/server";
import { registerStaticResources, getStaticResourcesPage } from "./staticResources.js";
import { registerSearchResource } from "./searchResource.js";
import { registerUsersResource } from "./usersResource.js";
import { registerPostsResource } from "./postsResource.js";
import { setupSubscriptions } from "./subscriptions.js";

export function registerResources(server: McpServer) {
  // Register all resource templates (this triggers McpServer's internal handler setup)
  registerStaticResources(server);
  registerSearchResource(server);
  registerUsersResource(server);
  registerPostsResource(server);

  // Override the list handler to support cursor-based pagination for static resources
  server.server.setRequestHandler('resources/list', async (request) => {
    return getStaticResourcesPage(request.params?.cursor);
  });

  // Setup subscriptions (low-level handlers)
  const { cleanup } = setupSubscriptions(server);

  return { cleanup };
}
