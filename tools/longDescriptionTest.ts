import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

const LongDescriptionTestSchema = z.object({
  message: z.string().describe("A simple message to echo back"),
});

const longDescription = `Tool to test long description rendering improvements (https://github.com/modelcontextprotocol/inspector/pull/823)

This tool has an intentionally verbose description to test the following rendering improvements in the Inspector UI:

LIST VIEW TESTING:
- In the tools list (left pane), descriptions should be truncated after 3 lines using line-clamp-3
- This prevents long descriptions from dominating the list view
- You should see an ellipsis (...) at the end of the truncated text

DETAIL VIEW TESTING:
When you select this tool (right pane), the following features should be visible:

1. WHITESPACE PRESERVATION (whitespace-pre-wrap):
   - Line breaks should be respected (like this multi-line list)
   - Indentation should be preserved
   - The text should wrap naturally at the container width

2. SCROLLABLE OVERFLOW (max-h-48 + overflow-y-auto):
   - If the description is very tall, it should be limited to max-height of 12rem (48 * 0.25rem)
   - A vertical scrollbar should appear when content exceeds this height
   - This prevents extremely long descriptions from pushing inputs/outputs off screen

3. VISUAL SEPARATION:
   - There should be a horizontal rule (border) separating the description from inputs/outputs
   - Clear section headings should help organize the interface

ADDITIONAL CONTEXT:
This is particularly useful for MCP servers with detailed tool documentation, complex parameter explanations, or tools that need to provide extensive usage examples directly in the description field. Without these improvements, such descriptions would either be truncated awkwardly or consume too much screen space, making the Inspector harder to use.

The improvements balance readability with screen real estate, ensuring users can:
- Quickly scan available tools in the list
- Read full descriptions when needed (with scroll)
- Maintain focus on the tool's actual inputs and outputs

Try scrolling this description in the detail view to see the overflow handling in action!`;

export const registerLongDescriptionTestTool = (server: McpServer) => {
  server.registerTool("longDescriptionTest", {
    description: longDescription,
    inputSchema: LongDescriptionTestSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = LongDescriptionTestSchema.parse(args);
    return {
      content: [
        {
          type: "text",
          text: `Long description rendering test completed!\n\nYour message: "${validatedArgs.message}"\n\nDid you notice the following improvements in the Inspector UI?\n\nLIST VIEW (left pane):\n  - Tool description truncated after 3 lines with ellipsis\n  - Clean, scannable list without overwhelming detail\n\nDETAIL VIEW (right pane):\n  - Description respects newlines and indentation (whitespace-pre-wrap)\n  - Scrollable if content exceeds max-height of 12rem (max-h-48)\n  - Horizontal rule separating description from inputs/outputs\n\nThese improvements from PR #823 make the Inspector more usable for tools with detailed documentation!`,
        },
      ],
    };
  });
};
