import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

export const registerResourcePrompt = (server: McpServer) => {
  server.registerPrompt(
    "resource_prompt",
    {
      description: "A prompt that includes an embedded resource reference",
      argsSchema: z.object({
        resourceId: z.string().describe("Resource ID to include (1-100)"),
      }),
    },
    ({ resourceId }) => {
      const id = parseInt(resourceId, 10);

      if (isNaN(id) || id < 1 || id > 100) {
        throw new Error(
          `Invalid resourceId: ${resourceId}. Must be a number between 1 and 100.`
        );
      }

      const resourceUri = `test://static/resource/${id}`;

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `This prompt includes Resource ${id}. Please analyze the following resource:`,
            },
          },
          {
            role: "user" as const,
            content: {
              type: "resource" as const,
              resource: {
                uri: resourceUri,
                name: `Resource ${id}`,
                mimeType: "text/plain",
                text: `Resource ${id}: This is a plaintext resource referenced from a prompt`,
              },
            },
          },
        ],
      };
    }
  );
};
