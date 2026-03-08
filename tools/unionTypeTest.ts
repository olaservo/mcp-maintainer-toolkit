import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const UnionTypeTestSchema = z.object({
  optionalString: z.string().nullable().default(null).describe("Optional string parameter with None default (like category: str | None = None)"),
  optionalNumber: z.number().nullable().default(null).describe("Optional number parameter with None default"),
  optionalBoolean: z.boolean().nullable().default(null).describe("Optional boolean parameter with None default"),
  requiredString: z.string().describe("Required string parameter"),
}).describe("Tool to test union type support for optional parameters (https://github.com/modelcontextprotocol/inspector/issues/672)");

export const registerUnionTypeTestTool = (server: McpServer) => {
  server.registerTool("unionTypeTest", {
    description: "Tests union type support for optional parameters (https://github.com/modelcontextprotocol/inspector/issues/672)",
    inputSchema: UnionTypeTestSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = UnionTypeTestSchema.parse(args);
    const optionals = [];
    if (validatedArgs.optionalString !== null) {
      optionals.push(`optionalString: "${validatedArgs.optionalString}"`);
    }
    if (validatedArgs.optionalNumber !== null) {
      optionals.push(`optionalNumber: ${validatedArgs.optionalNumber}`);
    }
    if (validatedArgs.optionalBoolean !== null) {
      optionals.push(`optionalBoolean: ${validatedArgs.optionalBoolean}`);
    }

    const optionalText = optionals.length > 0 ? `Optional parameters provided: ${optionals.join(', ')}` : "All optional parameters are null (default)";

    return {
      content: [
        {
          type: "text",
          text: `Union type test completed! Required: "${validatedArgs.requiredString}". ${optionalText}`,
        },
      ],
    };
  });
};
