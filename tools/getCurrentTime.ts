import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const GetCurrentTimeSchema = z.object({
  timezone: z.string().optional().describe("Timezone (e.g., 'UTC', 'America/New_York'). Defaults to local timezone."),
});

export const registerGetCurrentTimeTool = (server: McpServer) => {
  server.registerTool("getCurrentTime", {
    description: "Gets the current date and time",
    inputSchema: GetCurrentTimeSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = GetCurrentTimeSchema.parse(args);
    const now = new Date();

    let timeString: string;
    if (validatedArgs.timezone) {
      try {
        timeString = now.toLocaleString("en-US", { timeZone: validatedArgs.timezone });
      } catch (error) {
        throw new Error(`Invalid timezone: ${validatedArgs.timezone}`);
      }
    } else {
      timeString = now.toLocaleString();
    }

    return {
      content: [
        {
          type: "text",
          text: `Current time: ${timeString}${validatedArgs.timezone ? ` (${validatedArgs.timezone})` : " (local timezone)"}`,
        },
      ],
    };
  });
};
