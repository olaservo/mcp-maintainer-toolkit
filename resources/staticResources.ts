import { McpServer, ResourceTemplate, Resource } from "@modelcontextprotocol/server";

const PAGE_SIZE = 10;

const ALL_RESOURCES: Resource[] = Array.from({ length: 100 }, (_, i) => {
  const uri = `test://static/resource/${i + 1}`;
  if (i % 2 === 0) {
    return {
      uri,
      name: `Resource ${i + 1}`,
      mimeType: "text/plain",
      text: `Resource ${i + 1}: This is a plaintext resource`,
    };
  } else {
    const buffer = Buffer.from(`Resource ${i + 1}: This is a base64 blob`);
    return {
      uri,
      name: `Resource ${i + 1}`,
      mimeType: "application/octet-stream",
      blob: buffer.toString("base64"),
    };
  }
});

export function registerStaticResources(server: McpServer) {
  server.registerResource(
    "Static Resource",
    new ResourceTemplate("test://static/resource/{id}", { list: undefined }),
    { description: "A static resource with a numeric ID" },
    async (_uri, variables) => {
      const index = parseInt(String(variables.id), 10) - 1;
      if (index >= 0 && index < ALL_RESOURCES.length) {
        const resource = ALL_RESOURCES[index];
        const text = (resource as any).text as string | undefined;
        const blob = (resource as any).blob as string | undefined;
        if (text !== undefined) {
          return { contents: [{ uri: resource.uri, mimeType: resource.mimeType, text }] };
        } else if (blob !== undefined) {
          return { contents: [{ uri: resource.uri, mimeType: resource.mimeType, blob }] };
        }
      }
      throw new Error(`Unknown resource: test://static/resource/${variables.id}`);
    }
  );
}

export function getStaticResourcesPage(cursor?: string) {
  let startIndex = 0;

  if (cursor) {
    const decodedCursor = parseInt(atob(cursor), 10);
    if (!isNaN(decodedCursor)) {
      startIndex = decodedCursor;
    }
  }

  const endIndex = Math.min(startIndex + PAGE_SIZE, ALL_RESOURCES.length);
  const resources = ALL_RESOURCES.slice(startIndex, endIndex);

  let nextCursor: string | undefined;
  if (endIndex < ALL_RESOURCES.length) {
    nextCursor = btoa(endIndex.toString());
  }

  return { resources, nextCursor };
}
