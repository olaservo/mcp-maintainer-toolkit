import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

const MCP_TINY_IMAGE =
  "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAKsGlDQ1BJQ0MgUHJvZmlsZQAASImVlwdUU+kSgOfe9JDQEiIgJfQmSCeAlBBaAAXpYCMkAUKJMRBU7MriClZURLCs6KqIgo0idizYFsWC3QVZBNR1sWDDlXeBQ9jdd9575805c+a7c+efmf+e/z9nLgCdKZDJMlF1gCxpjjwyyI8dn5DIJvUABRiY0kBdIMyWcSMiwgCTUft3+dgGyJC9YzuU69/f/1fREImzhQBIBMbJomxhFsbHMe0TyuQ5ALg9mN9kbo5siK9gzJRjDWL8ZIhTR7hviJOHGY8fjomO5GGsDUCmCQTyVACaKeZn5wpTsTw0f4ztpSKJFGPsGbyzsmaLMMbqgiUWI8N4KD8n+S95Uv+WM1mZUyBIVfLIXoaF7C/JlmUK5v+fn+N/S1amYrSGOaa0NHlwJGaxvpAHGbNDlSxNnhI+yhLRcPwwpymCY0ZZmM1LHGWRwD9UuTZzStgop0gC+co8OfzoURZnB0SNsnx2pLJWipzHHWWBfKyuIiNG6U8T85X589Ji40Y5VxI7ZZSzM6JCx2J4Sr9cEansXyzl+4zFxCjjZTl+ylqyzAqlc9H/VaRZYjBKrtXR8tlwumcFgeMWRbZpA9ORQWfVm8A/FsrLaxebd5wAAAABJRU5ErkJggg==";

export const registerComplexPrompt = (server: McpServer) => {
  server.registerPrompt(
    "complex_prompt",
    {
      description: "A prompt with arguments for customization",
      argsSchema: z.object({
        temperature: z.string().describe("Temperature setting (0-1.0)"),
        style: z.string().optional().describe("Output style preference"),
      }),
    },
    ({ temperature, style }) => {
      const temp = temperature || "0.7";
      const st = style || "casual";

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `This is a complex prompt with customizable arguments:\n\nTemperature: ${temp}\nStyle: ${st}\n\nYou can use these parameters to customize the behavior of your prompts.`,
            },
          },
          {
            role: "assistant" as const,
            content: {
              type: "text" as const,
              text: `I understand. You've provided a complex prompt with temperature=${temp} and style=${st}. How would you like me to proceed?`,
            },
          },
          {
            role: "user" as const,
            content: {
              type: "image" as const,
              data: MCP_TINY_IMAGE,
              mimeType: "image/png",
            },
          },
        ],
      };
    }
  );
};
