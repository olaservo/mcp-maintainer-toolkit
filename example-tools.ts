import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ProgressNotificationSchema,
  Tool,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

/* Input schemas for tools implemented in this server */

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

// Issue #332: Complex nested objects (structured form regression)
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

// Issue #187: Strict type validation
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

// Issue #429: Schema edge cases (schema placement in annotations vs inputSchema)
const SchemaEdgeCasesSchema = z.object({
  basicString: z.string().min(1).max(100).describe("Basic string with length constraints"),
  enumWithDescriptions: z.enum(["small", "medium", "large"]).describe("Size selection with enum values"),
  nestedObject: z.object({
    level1: z.object({
      level2: z.object({
        deepValue: z.string().describe("Deeply nested string value"),
        deepNumber: z.number().min(0).max(100).describe("Deeply nested number with range"),
      }).describe("Second level nesting"),
      siblingValue: z.boolean().describe("Boolean at level 1"),
    }).describe("First level nesting"),
    parallelBranch: z.array(z.string()).describe("Array of strings in parallel branch"),
  }).describe("Complex nested object structure"),
  arrayOfObjects: z.array(z.object({
    id: z.number().describe("Unique identifier"),
    name: z.string().describe("Display name"),
    active: z.boolean().default(true).describe("Whether item is active"),
    tags: z.array(z.string()).optional().describe("Optional array of tags"),
  })).describe("Array containing objects with various field types"),
  conditionalField: z.union([
    z.string().describe("String value"),
    z.number().describe("Numeric value"),
    z.boolean().describe("Boolean value"),
  ]).describe("Field that accepts multiple types (union)"),
  optionalComplex: z.object({
    requiredSub: z.string().describe("Required sub-field"),
    optionalSub: z.number().optional().describe("Optional sub-field"),
  }).optional().describe("Optional complex object"),
}).describe("Tool with complex schema to test proper schema placement and rendering (Issue #429)");

// Issue #385/#308: Rich parameter descriptions
const RichDescriptionSchema = z.object({
  userEmail: z.string().email().describe("A valid email address (e.g., user@example.com). This will be used for notifications, account recovery, and important updates. Make sure you have access to this email."),
  userAge: z.number().int().min(18).max(120).describe("Age in years (must be between 18 and 120). Used for age verification, demographic analysis, and compliance with age-restricted features. This information is kept confidential."),
  preferences: z.object({
    theme: z.enum(["light", "dark", "auto"]).default("auto").describe("UI theme preference. 'light' for bright interface, 'dark' for dark mode, 'auto' will follow your system settings automatically."),
    notifications: z.boolean().default(true).describe("Whether to receive email notifications about important updates, security alerts, and feature announcements. You can change this later in settings."),
    language: z.enum(["en", "es", "fr", "de", "ja"]).default("en").describe("Preferred language for the interface. Supports English (en), Spanish (es), French (fr), German (de), and Japanese (ja)."),
    timezone: z.string().default("UTC").describe("Your timezone for displaying dates and times correctly (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo'). Uses IANA timezone database names."),
  }).describe("User preference settings that control application behavior, appearance, and communication. These can be modified later in your account settings."),
  securitySettings: z.object({
    twoFactorEnabled: z.boolean().default(false).describe("Enable two-factor authentication for enhanced security. Highly recommended for protecting your account from unauthorized access."),
    sessionTimeout: z.number().min(15).max(1440).default(60).describe("Session timeout in minutes (15-1440). How long you stay logged in when inactive. Shorter times are more secure but less convenient."),
    allowedIpRanges: z.array(z.string()).optional().describe("Optional list of IP address ranges allowed to access your account (CIDR notation, e.g., '192.168.1.0/24'). Leave empty to allow access from any IP."),
  }).describe("Security configuration options to protect your account and data. These settings help prevent unauthorized access and maintain account security."),
}).describe("Tool with extensive parameter descriptions to test UI display of help text and documentation (Issues #385/#308)");

// Array manipulation and complex data structures
const ArrayManipulationSchema = z.object({
  tags: z.array(z.string()).min(1).max(10).describe("List of tags to apply (1-10 tags, each as a separate string)"),
  coordinates: z.array(z.number()).length(3).describe("Exactly 3 coordinates: [X, Y, Z] as decimal numbers"),
  matrix: z.array(z.array(z.number())).describe("2D matrix represented as array of arrays (e.g., [[1,2],[3,4]])"),
  userList: z.array(z.object({
    id: z.number().int().positive().describe("Unique user ID (positive integer)"),
    name: z.string().min(1).describe("User's full name"),
    email: z.string().email().describe("User's email address"),
    active: z.boolean().default(true).describe("Whether user account is active"),
    roles: z.array(z.enum(["admin", "user", "moderator", "guest"])).describe("User's assigned roles"),
    metadata: z.record(z.string(), z.any()).optional().describe("Additional user metadata as key-value pairs"),
  })).describe("List of user objects with various field types"),
  nestedArrays: z.array(z.object({
    groupName: z.string().describe("Name of the group"),
    members: z.array(z.object({
      memberId: z.string().describe("Member identifier"),
      permissions: z.array(z.string()).describe("List of permissions for this member"),
    })).describe("Array of group members"),
  })).describe("Nested arrays: groups containing arrays of members with arrays of permissions"),
}).describe("Tool for testing complex array handling and nested data structures");

// Conditional and optional parameters
const ConditionalParametersSchema = z.object({
  mode: z.enum(["simple", "advanced", "expert"]).describe("Operation mode - determines which additional fields are required"),
  basicField: z.string().describe("Always required field regardless of mode"),
  advancedField: z.string().optional().describe("Required when mode is 'advanced' or 'expert'"),
  expertField: z.string().optional().describe("Required only when mode is 'expert'"),
  optionalWithDefault: z.string().default("default_value").describe("Optional field with a default value"),
  conditionalNumber: z.number().optional().describe("Optional number field"),
  dependentField: z.string().optional().describe("Required only if conditionalNumber is provided"),
  arrayField: z.array(z.string()).optional().describe("Optional array field"),
  objectField: z.object({
    requiredSub: z.string().describe("Required sub-field"),
    optionalSub: z.string().optional().describe("Optional sub-field"),
  }).optional().describe("Optional complex object with mixed required/optional fields"),
}).describe("Tool to test conditional requirements and optional parameter handling");

// Large complex schema for performance testing
const LargeComplexSchema = z.object({
  // Basic fields (5)
  field1: z.string().describe("Basic string field 1"),
  field2: z.number().describe("Basic number field 2"),
  field3: z.boolean().describe("Basic boolean field 3"),
  field4: z.string().email().describe("Email field 4"),
  field5: z.enum(["a", "b", "c"]).describe("Enum field 5"),
  
  // Complex nested objects (3)
  complexObject1: z.object({
    sub1: z.string().describe("Sub-field 1"),
    sub2: z.number().describe("Sub-field 2"),
    sub3: z.object({
      deepSub1: z.string().describe("Deep sub-field 1"),
      deepSub2: z.boolean().describe("Deep sub-field 2"),
    }).describe("Nested object in complex object 1"),
  }).describe("Complex nested object 1"),
  
  complexObject2: z.object({
    subArray: z.array(z.string()).describe("Array of strings"),
    subEnum: z.enum(["x", "y", "z"]).describe("Enum in complex object 2"),
  }).describe("Complex nested object 2"),
  
  complexObject3: z.object({
    mixedArray: z.array(z.object({
      itemId: z.number().describe("Item ID"),
      itemName: z.string().describe("Item name"),
    })).describe("Array of objects"),
  }).describe("Complex nested object 3"),
  
  // Arrays (4)
  stringArray: z.array(z.string()).describe("Array of strings"),
  numberArray: z.array(z.number()).describe("Array of numbers"),
  booleanArray: z.array(z.boolean()).describe("Array of booleans"),
  objectArray: z.array(z.object({
    id: z.number().describe("Object ID"),
    value: z.string().describe("Object value"),
  })).describe("Array of objects"),
  
  // Optional fields (8)
  optional1: z.string().optional().describe("Optional string 1"),
  optional2: z.number().optional().describe("Optional number 2"),
  optional3: z.boolean().optional().describe("Optional boolean 3"),
  optional4: z.array(z.string()).optional().describe("Optional array 4"),
  optional5: z.object({
    optSub1: z.string().describe("Optional sub 1"),
    optSub2: z.number().describe("Optional sub 2"),
  }).optional().describe("Optional object 5"),
  optional6: z.string().default("default6").describe("Optional with default 6"),
  optional7: z.number().default(42).describe("Optional with default 7"),
  optional8: z.enum(["opt1", "opt2"]).optional().describe("Optional enum 8"),
}).describe("Large schema with 25+ fields to test UI performance and form rendering");

// Issue #393: Parameter submission testing
const ParameterSubmissionTestSchema = z.object({
  requiredString: z.string().describe("Required string field - must be submitted"),
  optionalString: z.string().optional().describe("Optional string - test if submitted when filled"),
  requiredNumber: z.number().describe("Required number field"),
  optionalNumber: z.number().optional().describe("Optional number - test submission behavior"),
  booleanField: z.boolean().describe("Boolean field - test checkbox submission"),
  defaultValueField: z.string().default("default_value").describe("Field with default value"),
  enumField: z.enum(["option1", "option2", "option3"]).describe("Enum selection field"),
}).describe("Tool to test parameter submission and form behavior (Issue #393)");

// Issues #353/#328: Null vs undefined regression testing
const NullUndefinedRegressionSchema = z.object({
  requiredField: z.string().describe("Required field for comparison"),
  optionalString: z.string().optional().describe("Optional string (should be undefined when empty, not null)"),
  optionalNullableString: z.string().optional().nullable().describe("Optional nullable string (can accept null)"),
  optionalNumber: z.number().optional().describe("Optional number (test null vs undefined behavior)"),
  optionalBoolean: z.boolean().optional().describe("Optional boolean (test null vs undefined)"),
}).describe("Tool to test null vs undefined handling for optional parameters (Issues #353/#328)");

// Issue #154: Integer type regression testing
const IntegerRegressionSchema = z.object({
  integerField: z.number().int().describe("Must be integer (test: 42, should not accept '42' as string)"),
  numberField: z.number().describe("Can be any number (test: 3.14)"),
  positiveInteger: z.number().int().positive().describe("Must be positive integer (test: -5 should fail)"),
  integerWithRange: z.number().int().min(1).max(100).describe("Integer between 1-100"),
  stringField: z.string().describe("String field for comparison (should accept '42' as string)"),
}).describe("Tool to test integer type validation and string/number coercion (Issue #154)");

enum ToolName {
  // Basic Tools
  ECHO = "echo",
  ADD = "add", 
  GET_CURRENT_TIME = "getCurrentTime",
  
  // Data Tools
  FORMAT_DATA = "formatData",
  
  // Advanced Features
  LONG_RUNNING_TASK = "longRunningTask",
  ANNOTATED_RESPONSE = "annotatedResponse",
  
  // Testing Tools for GitHub Issues
  COMPLEX_ORDER = "complexOrder",
  STRICT_TYPE_VALIDATION = "strictTypeValidation",
  SCHEMA_EDGE_CASES = "schemaEdgeCases",
  RICH_DESCRIPTION = "richDescription",
  ARRAY_MANIPULATION = "arrayManipulation",
  CONDITIONAL_PARAMETERS = "conditionalParameters",
  LARGE_COMPLEX_SCHEMA = "largeComplexSchema",
  PROGRESS_NOTIFICATION = "progressNotification",
  
  // New Testing Tools
  PARAMETER_SUBMISSION_TEST = "parameterSubmissionTest",
  NULL_UNDEFINED_REGRESSION = "nullUndefinedRegression",
  INTEGER_REGRESSION = "integerRegression",
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
  // Simple YAML-like formatting
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

export const createServer = () => {
  const server = new Server(
    {
      name: "example-servers/example-tools",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
      // Basic Tools
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
      
      // Data Tools
      {
        name: ToolName.FORMAT_DATA,
        description: "Formats data in different output formats",
        inputSchema: zodToJsonSchema(FormatDataSchema) as ToolInput,
      },
      
      // Advanced Features
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
      
      // Testing Tools for GitHub Issues
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
        name: ToolName.SCHEMA_EDGE_CASES,
        description: "Tests complex schema placement and rendering (Issue #429)",
        inputSchema: zodToJsonSchema(SchemaEdgeCasesSchema) as ToolInput,
      },
      {
        name: ToolName.RICH_DESCRIPTION,
        description: "Tests rich parameter descriptions and help text (Issues #385/#308)",
        inputSchema: zodToJsonSchema(RichDescriptionSchema) as ToolInput,
      },
      {
        name: ToolName.ARRAY_MANIPULATION,
        description: "Tests complex array handling and nested data structures",
        inputSchema: zodToJsonSchema(ArrayManipulationSchema) as ToolInput,
      },
      {
        name: ToolName.CONDITIONAL_PARAMETERS,
        description: "Tests conditional requirements and optional parameter handling",
        inputSchema: zodToJsonSchema(ConditionalParametersSchema) as ToolInput,
      },
      {
        name: ToolName.LARGE_COMPLEX_SCHEMA,
        description: "Tests UI performance with large schemas (25+ fields)",
        inputSchema: zodToJsonSchema(LargeComplexSchema) as ToolInput,
      },
      {
        name: ToolName.PROGRESS_NOTIFICATION,
        description: "Tests progress notifications and list change events (Issue #378)",
        inputSchema: zodToJsonSchema(ProgressNotificationSchema) as ToolInput,
      },
      
      // New Testing Tools
      {
        name: ToolName.PARAMETER_SUBMISSION_TEST,
        description: "Tests parameter submission and form behavior (Issue #393)",
        inputSchema: zodToJsonSchema(ParameterSubmissionTestSchema) as ToolInput,
      },
      {
        name: ToolName.NULL_UNDEFINED_REGRESSION,
        description: "Tests null vs undefined handling for optional parameters (Issues #353/#328)",
        inputSchema: zodToJsonSchema(NullUndefinedRegressionSchema) as ToolInput,
      },
      {
        name: ToolName.INTEGER_REGRESSION,
        description: "Tests integer type validation and string/number coercion (Issue #154)",
        inputSchema: zodToJsonSchema(IntegerRegressionSchema) as ToolInput,
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

    // Data Tools
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

    // Advanced Features
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
      
      // Main message with annotations based on type
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

    // Testing Tools - These don't need full implementations, just return success messages with parameter logging
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

    if (name === ToolName.SCHEMA_EDGE_CASES) {
      const validatedArgs = SchemaEdgeCasesSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `Schema edge cases processed. Basic string: "${validatedArgs.basicString}", Enum: ${validatedArgs.enumWithDescriptions}`,
          },
        ],
      };
    }

    if (name === ToolName.RICH_DESCRIPTION) {
      const validatedArgs = RichDescriptionSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `User profile created for ${validatedArgs.userEmail}, age ${validatedArgs.userAge}. Theme: ${validatedArgs.preferences.theme}`,
          },
        ],
      };
    }

    if (name === ToolName.ARRAY_MANIPULATION) {
      const validatedArgs = ArrayManipulationSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `Array manipulation completed. Tags: ${validatedArgs.tags.length}, Users: ${validatedArgs.userList.length}, Coordinates: [${validatedArgs.coordinates.join(', ')}]`,
          },
        ],
      };
    }

    if (name === ToolName.CONDITIONAL_PARAMETERS) {
      const validatedArgs = ConditionalParametersSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `Conditional parameters processed in ${validatedArgs.mode} mode. Basic field: "${validatedArgs.basicField}". Optional with default: "${validatedArgs.optionalWithDefault}".`,
          },
        ],
      };
    }

    if (name === ToolName.LARGE_COMPLEX_SCHEMA) {
      const validatedArgs = LargeComplexSchema.parse(args);
      return {
        content: [
          {
            type: "text",
            text: `Large complex schema processed successfully. Field1: "${validatedArgs.field1}", Field2: ${validatedArgs.field2}, Field3: ${validatedArgs.field3}.`,
          },
        ],
      };
    }

    if (name === ToolName.PARAMETER_SUBMISSION_TEST) {
      const validatedArgs = ParameterSubmissionTestSchema.parse(args);
      const receivedParams = {
        requiredString: validatedArgs.requiredString,
        optionalString: validatedArgs.optionalString,
        requiredNumber: validatedArgs.requiredNumber,
        optionalNumber: validatedArgs.optionalNumber,
        booleanField: validatedArgs.booleanField,
        defaultValueField: validatedArgs.defaultValueField,
        enumField: validatedArgs.enumField,
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Parameter submission test completed. Required string: "${validatedArgs.requiredString}", Boolean: ${validatedArgs.booleanField}, Enum: ${validatedArgs.enumField}. Received parameters: ${JSON.stringify(receivedParams, null, 2)}`,
          },
        ],
      };
    }

    if (name === ToolName.NULL_UNDEFINED_REGRESSION) {
      const validatedArgs = NullUndefinedRegressionSchema.parse(args);
      const receivedParams = {
        requiredField: validatedArgs.requiredField,
        optionalString: validatedArgs.optionalString,
        optionalNullableString: validatedArgs.optionalNullableString,
        optionalNumber: validatedArgs.optionalNumber,
        optionalBoolean: validatedArgs.optionalBoolean,
      };
      
      // Log the types for debugging
      const typeInfo = {
        optionalString: typeof validatedArgs.optionalString,
        optionalNullableString: typeof validatedArgs.optionalNullableString,
        optionalNumber: typeof validatedArgs.optionalNumber,
        optionalBoolean: typeof validatedArgs.optionalBoolean,
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Null/undefined regression test completed. Required: "${validatedArgs.requiredField}". Type info: ${JSON.stringify(typeInfo)}. Received parameters: ${JSON.stringify(receivedParams, null, 2)}`,
          },
        ],
      };
    }

    if (name === ToolName.INTEGER_REGRESSION) {
      const validatedArgs = IntegerRegressionSchema.parse(args);
      const receivedParams = {
        integerField: validatedArgs.integerField,
        numberField: validatedArgs.numberField,
        positiveInteger: validatedArgs.positiveInteger,
        integerWithRange: validatedArgs.integerWithRange,
        stringField: validatedArgs.stringField,
      };
      
      // Log the types for debugging
      const typeInfo = {
        integerField: typeof validatedArgs.integerField,
        numberField: typeof validatedArgs.numberField,
        positiveInteger: typeof validatedArgs.positiveInteger,
        integerWithRange: typeof validatedArgs.integerWithRange,
        stringField: typeof validatedArgs.stringField,
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Integer regression test completed. Integer: ${validatedArgs.integerField}, Number: ${validatedArgs.numberField}, String: "${validatedArgs.stringField}". Type info: ${JSON.stringify(typeInfo)}. Received parameters: ${JSON.stringify(receivedParams, null, 2)}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const cleanup = async () => {
    // No cleanup needed for this server
  };

  return { server, cleanup };
};
