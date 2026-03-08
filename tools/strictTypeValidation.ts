import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const StrictTypeValidationSchema = z.object({
  stringField: z.string().min(1).describe("Must be a string (test entering numbers like 123321)"),
  numberField: z.number().describe("Must be a number (test entering text like 'abc')"),
  integerField: z.number().int().describe("Must be a whole number (test entering 3.14)"),
  booleanField: z.boolean().describe("Must be true or false (test entering 'yes' or 1)"),
  emailField: z.string().email().describe("Must be a valid email format"),
  urlField: z.string().url().describe("Must be a valid URL format"),
  enumField: z.enum(["option1", "option2", "option3"]).describe("Must be one of the predefined options"),
  dateField: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Must be a date in YYYY-MM-DD format"),
  positiveNumber: z.number().positive().describe("Must be a positive number (test entering -5)"),
  stringWithLength: z.string().min(5).max(20).describe("String must be between 5 and 20 characters"),
}).describe("Tool to test strict type validation and error handling (https://github.com/modelcontextprotocol/inspector/issues/187)");

export const registerStrictTypeValidationTool = (server: McpServer) => {
  server.registerTool("strictTypeValidation", {
    description: "Tests strict type validation and error handling (https://github.com/modelcontextprotocol/inspector/issues/187)",
    inputSchema: StrictTypeValidationSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = StrictTypeValidationSchema.parse(args);
    return {
      content: [
        {
          type: "text",
          text: `All fields validated successfully. String: "${validatedArgs.stringField}", Number: ${validatedArgs.numberField}, Integer: ${validatedArgs.integerField}`,
        },
      ],
    };
  });
};
