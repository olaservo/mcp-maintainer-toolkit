import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const AddSchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
});

export const registerAddTool = (server: McpServer) => {
  server.registerTool("add", {
    description: "Adds two numbers together",
    inputSchema: AddSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = AddSchema.parse(args);
    const sum = validatedArgs.a + validatedArgs.b;
    return {
      content: [
        {
          type: "text",
          text: `The sum of ${validatedArgs.a} and ${validatedArgs.b} is ${sum}.`,
        },
      ],
    };
  });
};
