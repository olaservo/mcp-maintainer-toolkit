import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

/* Input schemas for tools */

// Basic Tools
const EchoSchema = z.object({
  message: z.string().describe("Message to echo back"),
});

const AddSchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
});

const GetCurrentTimeSchema = z.object({
  timezone: z.string().optional().describe("Timezone (e.g., 'UTC', 'America/New_York'). Defaults to local timezone."),
});

// Data Tools
const FormatDataSchema = z.object({
  data: z.any().describe("Data to format"),
  format: z.enum(["json", "yaml", "table"]).default("json").describe("Output format"),
});

// Advanced Features
const LongRunningTaskSchema = z.object({
  duration: z.number().default(5).describe("Duration of the task in seconds"),
  steps: z.number().default(3).describe("Number of steps in the task"),
  taskName: z.string().default("Processing").describe("Name of the task"),
});

const AnnotatedResponseSchema = z.object({
  messageType: z.enum(["info", "warning", "error", "success"]).describe("Type of message"),
  includeMetadata: z.boolean().default(true).describe("Whether to include metadata"),
});

// Testing Tools
const ComplexOrderSchema = z.object({
  customerName: z.string().describe("Full customer name for the order"),
  customerTaxId: z.string().describe("Tax identification number (e.g., 123-45-6789)"),
  customerEmail: z.string().email().describe("Customer's email address for notifications"),
  shippingAddress: z.object({
    street: z.string().describe("Street address"),
    city: z.string().describe("City name"),
    state: z.string().describe("State or province"),
    zipCode: z.string().describe("ZIP or postal code"),
    country: z.string().default("US").describe("Country code (ISO 3166-1 alpha-2)"),
  }).describe("Shipping address details"),
  items: z.array(z.object({
    productName: z.string().describe("Name of the product"),
    productSku: z.string().describe("Product SKU or identifier"),
    quantity: z.number().min(1).describe("Number of items (must be positive)"),
    unitPrice: z.number().min(0).describe("Price per unit in USD"),
    category: z.enum(["electronics", "clothing", "books", "home", "other"]).describe("Product category"),
    metadata: z.object({
      weight: z.number().optional().describe("Weight in pounds"),
      dimensions: z.object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
      }).optional().describe("Dimensions in inches"),
    }).optional().describe("Additional product metadata"),
  })).min(1).describe("List of items in the order (at least one required)"),
  discounts: z.array(z.object({
    code: z.string().describe("Discount code"),
    amount: z.number().describe("Discount amount"),
    type: z.enum(["percentage", "fixed"]).describe("Type of discount"),
  })).optional().describe("Applied discount codes"),
  total: z.number().min(0).describe("Total order amount in USD"),
  notes: z.string().optional().describe("Special instructions or notes"),
}).describe("Complex order with nested objects and arrays to test form rendering (Issue #332)");

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
}).describe("Tool to test strict type validation and error handling (Issue #187)");

const UnionTypeTestSchema = z.object({
  optionalString: z.string().optional().describe("Optional string parameter (like category: str | None = None)"),
  optionalNumber: z.number().optional().describe("Optional number parameter"),
  optionalBoolean: z.boolean().optional().describe("Optional boolean parameter"),
  requiredString: z.string().describe("Required string parameter"),
}).describe("Tool to test union type support for optional parameters (Issue #672)");

export enum ToolName {
  // Basic Tools
  ECHO = "echo",
  ADD = "add", 
  GET_CURRENT_TIME = "getCurrentTime",
  
  // Data Tools
  FORMAT_DATA = "formatData",
  
  // Advanced Features
  LONG_RUNNING_TASK = "longRunningTask",
  ANNOTATED_RESPONSE = "annotatedResponse",
  
  // Testing Tools
  COMPLEX_ORDER = "complexOrder",
  STRICT_TYPE_VALIDATION = "strictTypeValidation",
  UNION_TYPE_TEST = "unionTypeTest",
}

// Helper functions
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

export function setupToolHandlers(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
      {
        name: ToolName.ECHO,
        description: "Echoes back the input message",
        inputSchema: zodToJsonSchema(EchoSchema) as ToolInput,
      },
      {
        name: ToolName.ADD,
        description: "Adds two numbers together",
        inputSchema: zodToJsonSchema(AddSchema) as ToolInput,
      },
      {
        name: ToolName.GET_CURRENT_TIME,
        description: "Gets the current date and time",
        inputSchema: zodToJsonSchema(GetCurrentTimeSchema) as ToolInput,
      },
      {
        name: ToolName.FORMAT_DATA,
        description: "Formats data in different output formats",
        inputSchema: zodToJsonSchema(FormatDataSchema) as ToolInput,
      },
      {
        name: ToolName.LONG_RUNNING_TASK,
        description: "Demonstrates a long-running task with progress updates",
        inputSchema: zodToJsonSchema(LongRunningTaskSchema) as ToolInput,
      },
      {
        name: ToolName.ANNOTATED_RESPONSE,
        description: "Demonstrates annotated responses with metadata",
        inputSchema: zodToJsonSchema(AnnotatedResponseSchema) as ToolInput,
      },
      {
        name: ToolName.COMPLEX_ORDER,
        description: "Tests complex nested objects and arrays (Issue #332)",
        inputSchema: zodToJsonSchema(ComplexOrderSchema) as ToolInput,
      },
      {
        name: ToolName.STRICT_TYPE_VALIDATION,
        description: "Tests strict type validation and error handling (Issue #187)",
        inputSchema: zodToJsonSchema(StrictTypeValidationSchema) as ToolInput,
      },
      {
        name: ToolName.UNION_TYPE_TEST,
        description: "Tests union type support for optional parameters (PR #673)",
        inputSchema: zodToJsonSchema(UnionTypeTestSchema) as ToolInput,
      },
    ];

    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Basic Tools
    if (name === ToolName.ECHO) {
      const validatedArgs = EchoSchema.parse(args);
      return {
        content: [{ type: "text", text: `Echo: ${validatedArgs.message}` }],
      };
    }

    if (name === ToolName.ADD) {
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
    }

    if (name === ToolName.GET_CURRENT_TIME) {
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
    }

    if (name === ToolName.FORMAT_DATA) {
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
    }

    if (name === ToolName.LONG_RUNNING_TASK) {
      const validatedArgs = LongRunningTaskSchema.parse(args);
      const { duration, steps, taskName } = validatedArgs;
      const stepDuration = duration / steps;
      const progressToken = request.params._meta?.progressToken;

      for (let i = 1; i <= steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration * 1000));

        if (progressToken !== undefined) {
          await server.notification({
            method: "notifications/progress",
            params: {
              progress: i,
              total: steps,
              progressToken,
            },
          });
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
    }

    if (name === ToolName.ANNOTATED_RESPONSE) {
      const validatedArgs = AnnotatedResponseSchema.parse(args);
      const { messageType, includeMetadata } = validatedArgs;
      
      const content = [];
      
      const priorities = { info: 0.5, warning: 0.7, error: 1.0, success: 0.6 };
      const audiences = { 
        info: ["user", "assistant"], 
        warning: ["user"], 
        error: ["user", "assistant"], 
        success: ["user"] 
      };
      
      content.push({
        type: "text",
        text: `This is a ${messageType} message demonstrating annotations.`,
        annotations: {
          priority: priorities[messageType],
          audience: audiences[messageType],
          messageType: messageType,
        },
      });
      
      if (includeMetadata) {
        content.push({
          type: "text",
          text: `Metadata: Generated at ${new Date().toISOString()}`,
          annotations: {
            priority: 0.2,
            audience: ["assistant"],
            category: "metadata",
          },
        });
      }
      
      return { content };
    }

    if (name === ToolName.COMPLEX_ORDER) {
      const validatedArgs = ComplexOrderSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `Complex order processed successfully for ${validatedArgs.customerName}. Total: $${validatedArgs.total}. Items: ${validatedArgs.items.length}`,
          },
        ],
      };
    }

    if (name === ToolName.STRICT_TYPE_VALIDATION) {
      const validatedArgs = StrictTypeValidationSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `All fields validated successfully. String: "${validatedArgs.stringField}", Number: ${validatedArgs.numberField}, Integer: ${validatedArgs.integerField}`,
          },
        ],
      };
    }

    if (name === ToolName.UNION_TYPE_TEST) {
      const validatedArgs = UnionTypeTestSchema.parse(args);
      const optionals = [];
      if (validatedArgs.optionalString !== undefined) {
        optionals.push(`optionalString: "${validatedArgs.optionalString}"`);
      }
      if (validatedArgs.optionalNumber !== undefined) {
        optionals.push(`optionalNumber: ${validatedArgs.optionalNumber}`);
      }
      if (validatedArgs.optionalBoolean !== undefined) {
        optionals.push(`optionalBoolean: ${validatedArgs.optionalBoolean}`);
      }
      
      const optionalText = optionals.length > 0 ? `Optional parameters provided: ${optionals.join(', ')}` : "No optional parameters provided";
      
      return {
        content: [
          {
            type: "text",
            text: `Union type test completed! Required: "${validatedArgs.requiredString}". ${optionalText}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });
}