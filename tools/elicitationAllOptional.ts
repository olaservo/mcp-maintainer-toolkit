import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ElicitResultSchema,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";

export const registerElicitationAllOptionalTool = (server: McpServer) => {
  const clientCapabilities = server.server.getClientCapabilities() || {};
  if (clientCapabilities.elicitation === undefined) {
    return;
  }

  server.registerTool("elicitationAllOptional", {
    description: "Tests elicitation with all optional fields (https://github.com/modelcontextprotocol/inspector/pull/926)",
    inputSchema: {},
  }, async (_args, extra): Promise<CallToolResult> => {
    const elicitationResult = await extra.sendRequest({
      method: 'elicitation/create',
      params: {
        message: 'This elicitation form has ALL OPTIONAL fields. Try submitting without filling in any fields to test PR #926!',
        requestedSchema: {
          type: 'object',
          properties: {
            preference: {
              type: 'string',
              description: 'Optional preference (you can leave this blank)',
            },
            notes: {
              type: 'string',
              description: 'Optional notes (you can leave this blank too)',
            },
            optionalNumber: {
              type: 'number',
              description: 'Optional number field',
            },
            optionalBoolean: {
              type: 'boolean',
              description: 'Optional boolean checkbox',
            },
          },
        },
      },
    }, ElicitResultSchema, { timeout: 10 * 60 * 1000 });

    const content: CallToolResult["content"] = [];

    if (elicitationResult.action === 'accept' && elicitationResult.content) {
      content.push({
        type: "text",
        text: `Elicitation with all optional fields completed successfully!\n\nThis tests the fix from PR #926 where submitting a form with no required fields would previously fail with "Validation Error: data should be object".`,
      });

      const userData = elicitationResult.content;
      const lines = [];
      if (userData.preference) lines.push(`- Preference: ${userData.preference}`);
      if (userData.notes) lines.push(`- Notes: ${userData.notes}`);
      if (userData.optionalNumber !== undefined) lines.push(`- Number: ${userData.optionalNumber}`);
      if (userData.optionalBoolean !== undefined) lines.push(`- Boolean: ${userData.optionalBoolean}`);

      if (lines.length > 0) {
        content.push({
          type: "text",
          text: `User provided:\n${lines.join('\n')}`,
        });
      } else {
        content.push({
          type: "text",
          text: `User submitted the form empty (all fields left blank). This is the exact scenario that PR #926 fixes!`,
        });
      }
    } else if (elicitationResult.action === 'decline') {
      content.push({
        type: "text",
        text: `User declined to provide information.`,
      });
    } else if (elicitationResult.action === 'cancel') {
      content.push({
        type: "text",
        text: `User cancelled the elicitation dialog.`,
      });
    }

    return { content };
  });
};
