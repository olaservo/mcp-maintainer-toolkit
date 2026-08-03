import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

// `.meta({ id })` is what makes zod 4 hoist this subschema into `$defs` and
// reference it with `$ref` instead of inlining it at every use site. Without the
// id, zod 4's default `reused: "inline"` policy would inline both copies and this
// fixture would stop exercising `$ref` at all. (SDK v1 + zod 3 emitted the
// positional form `{"$ref": "#/properties/husband"}` for the second use.)
const PersonSchema = z.object({
  firstName: z.string().describe("Person's first name"),
  lastName: z.string().describe("Person's last name"),
}).describe("A person object").meta({ id: "Person" });

const JSONRefTestSchema = z.object({
  husband: PersonSchema,
  wife: PersonSchema,
}).describe("Tool to test JSON schema $ref support. Requires husband and wife Person objects.");

export const registerJsonRefTestTool = (server: McpServer) => {
  server.registerTool("jsonRefTest", {
    description: "Tests JSON schema $ref support with nested Person objects",
    inputSchema: JSONRefTestSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = JSONRefTestSchema.parse(args);
    return {
      content: [
        {
          type: "text",
          text: `JSON ref test completed!\n\nHusband: ${validatedArgs.husband.firstName} ${validatedArgs.husband.lastName}\nWife: ${validatedArgs.wife.firstName} ${validatedArgs.wife.lastName}\n\nThis tool tested if the input schema correctly uses $ref for the Person object.`,
        },
      ],
    };
  });
};
