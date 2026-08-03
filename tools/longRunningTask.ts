import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

const LongRunningTaskSchema = z.object({
  duration: z.number().default(5).describe("Duration of the task in seconds"),
  steps: z.number().default(3).describe("Number of steps in the task"),
  taskName: z.string().default("Processing").describe("Name of the task"),
});

export const registerLongRunningTaskTool = (server: McpServer) => {
  server.registerTool("longRunningTask", {
    description: "Demonstrates a long-running task with progress updates",
    inputSchema: LongRunningTaskSchema,
  }, async (args, ctx): Promise<CallToolResult> => {
    const validatedArgs = LongRunningTaskSchema.parse(args);
    const { duration, steps, taskName } = validatedArgs;
    const stepDuration = duration / steps;
    const progressToken = ctx.mcpReq._meta?.progressToken;

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration * 1000));

      if (progressToken !== undefined) {
        await server.server.notification(
          {
            method: "notifications/progress",
            params: {
              progress: i,
              total: steps,
              progressToken,
            },
          },
          { relatedRequestId: ctx.mcpReq.id }
        );
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `${taskName} completed! Duration: ${duration} seconds, Steps: ${steps}.`,
        },
      ],
    };
  });
};
