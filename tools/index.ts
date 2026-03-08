import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerEchoTool } from "./echo.js";
import { registerAddTool } from "./add.js";
import { registerGetCurrentTimeTool } from "./getCurrentTime.js";
import { registerFormatDataTool } from "./formatData.js";
import { registerLongRunningTaskTool } from "./longRunningTask.js";
import { registerAnnotatedResponseTool } from "./annotatedResponse.js";
import { registerComplexOrderTool } from "./complexOrder.js";
import { registerStrictTypeValidationTool } from "./strictTypeValidation.js";
import { registerUnionTypeTestTool } from "./unionTypeTest.js";
import { registerEnumDropdownTestTool } from "./enumDropdownTest.js";
import { registerLongDescriptionTestTool } from "./longDescriptionTest.js";
import { registerElicitationAllOptionalTool } from "./elicitationAllOptional.js";

export const registerTools = (server: McpServer) => {
  registerEchoTool(server);
  registerAddTool(server);
  registerGetCurrentTimeTool(server);
  registerFormatDataTool(server);
  registerLongRunningTaskTool(server);
  registerAnnotatedResponseTool(server);
  registerComplexOrderTool(server);
  registerStrictTypeValidationTool(server);
  registerUnionTypeTestTool(server);
  registerEnumDropdownTestTool(server);
  registerLongDescriptionTestTool(server);
};

export const registerConditionalTools = (server: McpServer) => {
  registerElicitationAllOptionalTool(server);
};
