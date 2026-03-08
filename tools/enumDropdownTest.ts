import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const EnumDropdownTestSchema = z.object({
  outputFormat: z.enum(["json", "xml", "csv", "yaml", "markdown", "html"]).describe("Select the desired output format"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium").describe("Task priority level"),
  environment: z.enum(["development", "staging", "production"]).describe("Deployment environment"),
  logLevel: z.enum(["debug", "info", "warn", "error", "fatal"]).optional().describe("Optional logging level"),
  colorScheme: z.enum(["light", "dark", "auto", "high-contrast", "solarized-light", "solarized-dark", "monokai", "dracula"]).default("auto").describe("UI color scheme preference"),
}).describe("Tool to test enum dropdown rendering in Inspector UI (https://github.com/modelcontextprotocol/inspector/issues/755, https://github.com/modelcontextprotocol/inspector/pull/823)");

export const registerEnumDropdownTestTool = (server: McpServer) => {
  server.registerTool("enumDropdownTest", {
    description: "Tests enum dropdown rendering in Inspector UI (https://github.com/modelcontextprotocol/inspector/issues/755, https://github.com/modelcontextprotocol/inspector/pull/823)",
    inputSchema: EnumDropdownTestSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = EnumDropdownTestSchema.parse(args);
    const details = [
      `Output Format: ${validatedArgs.outputFormat}`,
      `Priority: ${validatedArgs.priority}`,
      `Environment: ${validatedArgs.environment}`,
      validatedArgs.logLevel ? `Log Level: ${validatedArgs.logLevel}` : "Log Level: (not specified)",
      `Color Scheme: ${validatedArgs.colorScheme}`,
    ];

    return {
      content: [
        {
          type: "text",
          text: `Enum dropdown test completed successfully!\n\nSelected values:\n${details.map(d => `  - ${d}`).join('\n')}\n\nThis tool tests enum parameter rendering with:\n  - Required enums (outputFormat, priority, environment)\n  - Optional enum (logLevel)\n  - Enums with defaults (priority, colorScheme)\n  - Various option counts (3-8 options)`,
        },
      ],
    };
  });
};
