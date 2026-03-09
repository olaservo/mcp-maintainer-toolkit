import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const EchoSchema = z.object({
  message: z.string().describe("Message to echo back"),
  numberList: z.array(z.number()).nullable().default(null).describe("Nullable List of numbers"),
});

export const registerEchoTool = (server: McpServer) => {
  server.registerTool("echo", {
    description: "Echoes back the input message",
    inputSchema: EchoSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = EchoSchema.parse(args);
    return {
      content: [{ type: "text", text: `Echo: ${validatedArgs.message}, Number List: ${validatedArgs.numberList === null ? "null" : validatedArgs.numberList?.join(", ")}` }],
    };
  });
};
