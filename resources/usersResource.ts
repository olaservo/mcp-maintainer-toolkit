import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

function generateUsers(nameFilter?: string, limit: number = 10, offset: number = 0): any[] {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin", active: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user", active: true },
    { id: 3, name: "Laura Palmer", email: "laura@example.com", role: "user", active: true }
  ];

  let filteredUsers = users;

  if (nameFilter) {
    filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }

  return filteredUsers.slice(offset, offset + limit);
}

export function registerUsersResource(server: McpServer) {
  server.registerResource(
    "User List Resource",
    new ResourceTemplate("test://users{?name,limit,offset}", { list: undefined }),
    { description: "List users with filtering and pagination parameters" },
    async (uri, variables) => {
      const nameFilter = variables.name ? String(variables.name) : undefined;
      const limit = parseInt(String(variables.limit || "10"), 10);
      const offset = parseInt(String(variables.offset || "0"), 10);

      if (limit < 1 || limit > 100) {
        throw new Error("Limit must be between 1 and 100");
      }
      if (offset < 0) {
        throw new Error("Offset must be non-negative");
      }

      const users = generateUsers(nameFilter, limit, offset);

      return {
        contents: [
          {
            uri: uri.toString(),
            name: "User List",
            mimeType: "application/json",
            text: JSON.stringify({
              filters: { name: nameFilter || null },
              pagination: { limit, offset },
              total: users.length,
              users
            }, null, 2),
          },
        ],
      };
    }
  );
}
