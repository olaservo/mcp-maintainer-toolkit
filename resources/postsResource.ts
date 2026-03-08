import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

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

export function registerPostsResource(server: McpServer) {
  server.registerResource(
    "Post Resource",
    new ResourceTemplate("test://api/v1/posts/{id}{?include,format}", { list: undefined }),
    { description: "Get a post with optional include and format parameters" },
    async (uri, variables) => {
      const postId = String(variables.id);
      const includes = variables.include ? String(variables.include).split(",") : [];
      const format = String(variables.format || "json");

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
            uri: uri.toString(),
            name: `Post ${postId}`,
            mimeType,
            text: content,
          },
        ],
      };
    }
  );
}
