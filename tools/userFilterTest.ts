import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

const UserRoleSchema = z.enum(["customer", "admin", "moderator"]);

const UserFilterSchema = z.object({
  role: UserRoleSchema.nullable().describe("Filter by role"),
  is_active: z.union([z.boolean(), z.null()]).describe("Filter by active status"),
});

export const registerUserFilterTestTool = (server: McpServer) => {
  server.registerTool("userFilterTest", {
    description: "Tests JSON schema with $ref to $defs and nullable types",
    inputSchema: UserFilterSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = UserFilterSchema.parse(args);
    return {
      content: [
        {
          type: "text",
          text: `User Filter Test: role=${validatedArgs.role}, is_active=${validatedArgs.is_active}`,
        },
      ],
    };
  });
};
