import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const FormatDataSchema = z.object({
  data: z.any().describe("Data to format"),
  format: z.enum(["json", "yaml", "table"]).default("json").describe("Output format"),
});

function formatAsTable(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return "Empty array";

    const headers = Object.keys(data[0]);
    let table = headers.join(" | ") + "\n";
    table += headers.map(() => "---").join(" | ") + "\n";

    for (const row of data) {
      table += headers.map(h => String(row[h] || "")).join(" | ") + "\n";
    }

    return table;
  } else if (typeof data === 'object' && data !== null) {
    let table = "Key | Value\n--- | ---\n";
    for (const [key, value] of Object.entries(data)) {
      table += `${key} | ${String(value)}\n`;
    }
    return table;
  }

  return String(data);
}

function formatAsYaml(data: any): string {
  function yamlify(obj: any, indent = 0): string {
    const spaces = "  ".repeat(indent);

    if (Array.isArray(obj)) {
      return obj.map(item => `${spaces}- ${yamlify(item, 0)}`).join("\n");
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${spaces}${key}:\n${yamlify(value, indent + 1)}`;
          } else {
            return `${spaces}${key}: ${String(value)}`;
          }
        })
        .join("\n");
    } else {
      return String(obj);
    }
  }

  return yamlify(data);
}

export const registerFormatDataTool = (server: McpServer) => {
  server.registerTool("formatData", {
    description: "Formats data in different output formats",
    inputSchema: FormatDataSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = FormatDataSchema.parse(args);
    let formatted: string;

    switch (validatedArgs.format) {
      case "json":
        formatted = JSON.stringify(validatedArgs.data, null, 2);
        break;
      case "yaml":
        formatted = formatAsYaml(validatedArgs.data);
        break;
      case "table":
        formatted = formatAsTable(validatedArgs.data);
        break;
      default:
        formatted = String(validatedArgs.data);
    }

    return {
      content: [
        {
          type: "text",
          text: `Data formatted as ${validatedArgs.format}:\n\n${formatted}`,
        },
      ],
    };
  });
};
