import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const registerSimplePrompt = (server: McpServer) => {
  server.registerPrompt(
    "simple_prompt",
    {
      description: "A simple prompt without arguments",
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "This is a simple prompt without arguments. It provides a basic template for getting started with prompts.",
          },
        },
      ],
    })
  );
};
