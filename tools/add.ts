import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

const number = z.number().describe("A number to add");

const AddSchema = z.object({
  a: number,
  b: number,
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
