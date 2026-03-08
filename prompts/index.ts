import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSimplePrompt } from "./simplePrompt.js";
import { registerComplexPrompt } from "./complexPrompt.js";
import { registerResourcePrompt } from "./resourcePrompt.js";

export const registerPrompts = (server: McpServer) => {
  registerSimplePrompt(server);
  registerComplexPrompt(server);
  registerResourcePrompt(server);
};
