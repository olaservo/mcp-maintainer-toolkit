import { McpServer, CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

const address = z.object({
  street: z.string().describe("Street address"),
  city: z.string().describe("City name"),
  state: z.string().describe("State or province"),
  zipCode: z.string().describe("ZIP or postal code"),
  country: z.string().default("US").describe("Country code (ISO 3166-1 alpha-2)"),
}).describe("Address details").meta({ id: "Address" });

const ComplexOrderSchema = z.object({
  customerName: z.string().describe("Full customer name for the order"),
  customerTaxId: z.string().describe("Tax identification number (e.g., 123-45-6789)"),
  customerEmail: z.string().email().describe("Customer's email address for notifications"),
  billingAddress: address,
  shippingAddress: address,
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
}).describe("Complex order with nested objects and arrays to test form rendering (https://github.com/modelcontextprotocol/inspector/issues/332)");

export const registerComplexOrderTool = (server: McpServer) => {
  server.registerTool("complexOrder", {
    description: "Tests complex nested objects and arrays (https://github.com/modelcontextprotocol/inspector/issues/332)",
    inputSchema: ComplexOrderSchema,
  }, async (args): Promise<CallToolResult> => {
    const validatedArgs = ComplexOrderSchema.parse(args);
    return {
      content: [
        {
          type: "text",
          text: `Complex order processed successfully for ${validatedArgs.customerName}. Total: $${validatedArgs.total}. Items: ${validatedArgs.items.length}`,
        },
      ],
    };
  });
};
