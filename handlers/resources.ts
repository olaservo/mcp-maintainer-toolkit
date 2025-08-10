import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  Resource,
} from "@modelcontextprotocol/sdk/types.js";

// Helper function to parse query parameters from URIs
function parseQueryParams(uri: string): Record<string, string> {
  try {
    const url = new URL(uri);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

// Helper function to generate search results
function generateSearchResults(query: string): any[] {
  const searchTerms = [
    "javascript", "typescript", "python", "react", "node", "api", "database", 
    "authentication", "security", "performance", "testing", "deployment"
  ];
  
  const results = searchTerms
    .filter(term => term.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(term.toLowerCase()))
    .map((term, index) => ({
      id: index + 1,
      title: `${term.charAt(0).toUpperCase() + term.slice(1)} Guide`,
      description: `Comprehensive guide about ${term} development and best practices`,
      url: `https://example.com/${term}`,
      relevance: Math.random() * 100
    }));

  if (results.length === 0) {
    return [
      {
        id: 1,
        title: `Search results for "${query}"`,
        description: `No exact matches found for "${query}", showing related content`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        relevance: 50
      }
    ];
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

// Helper function to generate user data
function generateUsers(nameFilter?: string, limit: number = 10, offset: number = 0): any[] {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin", active: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user", active: true },
    { id: 3, name: "Laura Palmer", email: "laura@example.com", role: "user", active: true }
  ];

  let filteredUsers = users;
  
  if (nameFilter) {
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }

  return filteredUsers.slice(offset, offset + limit);
}

// Helper function to generate post data
function generatePost(id: string, includes: string[] = [], format: string = "json"): any {
  const post: any = {
    id: parseInt(id),
    title: `Sample Post ${id}`,
    content: `This is the content of post ${id}. It contains some sample text to demonstrate the post resource functionality.`,
    author: {
      id: 1,
      name: "John Doe",
      email: "john@example.com"
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:45:00Z",
    tags: ["sample", "demo", "test"],
    published: true
  };

  if (includes.includes("comments")) {
    post.comments = [
      {
        id: 1,
        content: "Great post!",
        author: "Jane Smith",
        createdAt: "2024-01-15T11:00:00Z"
      }
    ];
  }

  if (includes.includes("author")) {
    post.author.bio = "Experienced developer and technical writer";
    post.author.avatar = "https://example.com/avatars/john.jpg";
    post.author.socialLinks = {
      twitter: "@johndoe",
      github: "johndoe"
    };
  }

  if (includes.includes("stats")) {
    post.stats = {
      views: 1250,
      likes: 89,
      shares: 23,
      comments: post.comments?.length || 0
    };
  }

  return post;
}

export class ResourceManager {
  private subscriptions: Set<string> = new Set();
  private subsUpdateInterval: NodeJS.Timeout | undefined;
  private readonly ALL_RESOURCES: Resource[];
  private readonly PAGE_SIZE = 10;

  constructor() {
    this.ALL_RESOURCES = Array.from({ length: 100 }, (_, i) => {
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
  }

  startSubscriptionUpdates(server: Server) {
    this.subsUpdateInterval = setInterval(() => {
      for (const uri of this.subscriptions) {
        server.notification({
          method: "notifications/resources/updated",
          params: { uri },
        });
      }
    }, 10000);
  }

  stopSubscriptionUpdates() {
    if (this.subsUpdateInterval) {
      clearInterval(this.subsUpdateInterval);
    }
  }

  addSubscription(uri: string) {
    this.subscriptions.add(uri);
  }

  removeSubscription(uri: string) {
    this.subscriptions.delete(uri);
  }

  listResources(cursor?: string) {
    let startIndex = 0;

    if (cursor) {
      const decodedCursor = parseInt(atob(cursor), 10);
      if (!isNaN(decodedCursor)) {
        startIndex = decodedCursor;
      }
    }

    const endIndex = Math.min(startIndex + this.PAGE_SIZE, this.ALL_RESOURCES.length);
    const resources = this.ALL_RESOURCES.slice(startIndex, endIndex);

    let nextCursor: string | undefined;
    if (endIndex < this.ALL_RESOURCES.length) {
      nextCursor = btoa(endIndex.toString());
    }

    return {
      resources,
      nextCursor,
    };
  }

  getResourceTemplates() {
    return {
      resourceTemplates: [
        {
          uriTemplate: "test://static/resource/{id}",
          name: "Static Resource",
          description: "A static resource with a numeric ID",
        },
        {
          uriTemplate: "test://search{?q}",
          name: "Search Resource",
          description: "Search resources with a query parameter",
        },
        {
          uriTemplate: "test://users{?name,limit,offset}",
          name: "User List Resource",
          description: "List users with filtering and pagination parameters",
        },
        {
          uriTemplate: "test://api/v1/posts/{id}{?include,format}",
          name: "Post Resource",
          description: "Get a post with optional include and format parameters",
        },
      ],
    };
  }

  readResource(uri: string) {
    // Handle static resources
    if (uri.startsWith("test://static/resource/")) {
      const index = parseInt(uri.split("/").pop() ?? "", 10) - 1;
      if (index >= 0 && index < this.ALL_RESOURCES.length) {
        const resource = this.ALL_RESOURCES[index];
        return {
          contents: [resource],
        };
      }
    }

    // Handle search resources
    if (uri.startsWith("test://search")) {
      const params = parseQueryParams(uri);
      const query = params.q || "";
      
      if (!query) {
        throw new Error("Search query parameter 'q' is required");
      }

      const results = generateSearchResults(query);
      
      return {
        contents: [
          {
            uri,
            name: `Search Results for "${query}"`,
            mimeType: "application/json",
            text: JSON.stringify({
              query,
              total: results.length,
              results
            }, null, 2),
          },
        ],
      };
    }

    // Handle user list resources
    if (uri.startsWith("test://users")) {
      const params = parseQueryParams(uri);
      const nameFilter = params.name;
      const limit = parseInt(params.limit || "10", 10);
      const offset = parseInt(params.offset || "0", 10);

      if (limit < 1 || limit > 100) {
        throw new Error("Limit must be between 1 and 100");
      }
      if (offset < 0) {
        throw new Error("Offset must be non-negative");
      }

      const users = generateUsers(nameFilter, limit, offset);
      
      return {
        contents: [
          {
            uri,
            name: "User List",
            mimeType: "application/json",
            text: JSON.stringify({
              filters: { name: nameFilter || null },
              pagination: { limit, offset },
              total: users.length,
              users
            }, null, 2),
          },
        ],
      };
    }

    // Handle post resources
    if (uri.startsWith("test://api/v1/posts/")) {
      const pathParts = uri.split("/");
      const postId = pathParts[pathParts.length - 1].split("?")[0];
      const params = parseQueryParams(uri);
      
      const includes = params.include ? params.include.split(",") : [];
      const format = params.format || "json";

      if (!["json", "xml", "yaml"].includes(format)) {
        throw new Error("Format must be one of: json, xml, yaml");
      }

      const id = parseInt(postId, 10);
      if (isNaN(id) || id < 1) {
        throw new Error("Invalid post ID");
      }

      const post = generatePost(postId, includes, format);
      
      let content: string;
      let mimeType: string;

      switch (format) {
        case "xml":
          content = `<?xml version="1.0" encoding="UTF-8"?>
<post>
  <id>${post.id}</id>
  <title>${post.title}</title>
  <content>${post.content}</content>
  <published>${post.published}</published>
</post>`;
          mimeType = "application/xml";
          break;
        case "yaml":
          content = `id: ${post.id}
title: "${post.title}"
content: "${post.content}"
published: ${post.published}`;
          mimeType = "application/yaml";
          break;
        default:
          content = JSON.stringify(post, null, 2);
          mimeType = "application/json";
      }

      return {
        contents: [
          {
            uri,
            name: `Post ${postId}`,
            mimeType,
            text: content,
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  }
}

export function setupResourceHandlers(server: Server) {
  const resourceManager = new ResourceManager();
  resourceManager.startSubscriptionUpdates(server);

  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    return resourceManager.listResources(request.params?.cursor);
  });

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return resourceManager.getResourceTemplates();
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return resourceManager.readResource(request.params.uri);
  });

  server.setRequestHandler(SubscribeRequestSchema, async (request) => {
    const { uri } = request.params;
    resourceManager.addSubscription(uri);
    return {};
  });

  server.setRequestHandler(UnsubscribeRequestSchema, async (request) => {
    resourceManager.removeSubscription(request.params.uri);
    return {};
  });

  return {
    cleanup: async () => {
      resourceManager.stopSubscriptionUpdates();
    }
  };
}