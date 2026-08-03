import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

// `.meta({ id })` makes zod 4 hoist this reused subschema into `$defs` and reference it
// with `$ref` instead of inlining a copy at every use site. Without it, zod 4's default
// `reused: "inline"` policy inlines both and this fixture stops exercising `$ref`
// rendering. (SDK v1 + zod 3 emitted the positional form `{"$ref": "#/properties/a"}`.)
const number = z.number().describe("A number to add").meta({ id: "AddOperand" });

const AddSchema = z.object({
  a: number,
  b: number,
});

export const registerAddTool = (server: McpServer) => {
  server.registerTool("add", {
    description: "Adds two numbers together",
    inputSchema: AddSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = AddSchema.parse(args);
    const sum = validatedArgs.a + validatedArgs.b;
    return {
      content: [
        {
          type: "text",
          text: `The sum of ${validatedArgs.a} and ${validatedArgs.b} is ${sum}.`,
        },
      ],
    };
  });
};
