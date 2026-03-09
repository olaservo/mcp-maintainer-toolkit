import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const PersonSchema = z.object({
  firstName: z.string().describe("Person's first name"),
  lastName: z.string().describe("Person's last name"),
}).describe("A person object");

const JSONRefTestSchema = z.object({
  husband: PersonSchema,
  wife: PersonSchema,
}).describe("Tool to test JSON schema $ref support. Requires husband and wife Person objects.");

export const registerJsonRefTestTool = (server: McpServer) => {
  server.registerTool("jsonRefTest", {
    description: "Tests JSON schema $ref support with nested Person objects",
    inputSchema: JSONRefTestSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = JSONRefTestSchema.parse(args);
    return {
      content: [
        {
          type: "text",
          text: `JSON ref test completed!\n\nHusband: ${validatedArgs.husband.firstName} ${validatedArgs.husband.lastName}\nWife: ${validatedArgs.wife.firstName} ${validatedArgs.wife.lastName}\n\nThis tool tested if the input schema correctly uses $ref for the Person object.`,
        },
      ],
    };
  });
};
