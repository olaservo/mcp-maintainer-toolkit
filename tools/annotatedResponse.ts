import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const AnnotatedResponseSchema = z.object({
  messageType: z.enum(["info", "warning", "error", "success"]).describe("Type of message"),
  includeMetadata: z.boolean().default(true).describe("Whether to include metadata"),
});

export const registerAnnotatedResponseTool = (server: McpServer) => {
  server.registerTool("annotatedResponse", {
    description: "Demonstrates annotated responses with metadata",
    inputSchema: AnnotatedResponseSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = AnnotatedResponseSchema.parse(args);
    const { messageType, includeMetadata } = validatedArgs;

    const content: CallToolResult["content"] = [];

    const priorities = { info: 0.5, warning: 0.7, error: 1.0, success: 0.6 };
    const audiences: Record<string, ("user" | "assistant")[]> = {
      info: ["user", "assistant"],
      warning: ["user"],
      error: ["user", "assistant"],
      success: ["user"]
    };

    content.push({
      type: "text",
      text: `This is a ${messageType} message demonstrating annotations.`,
      annotations: {
        priority: priorities[messageType],
        audience: audiences[messageType],
      },
    });

    if (includeMetadata) {
      content.push({
        type: "text",
        text: `Metadata: Generated at ${new Date().toISOString()}`,
        annotations: {
          priority: 0.2,
          audience: ["assistant"] as ("user" | "assistant")[],
        },
      });
    }

    return { content };
  });
};
