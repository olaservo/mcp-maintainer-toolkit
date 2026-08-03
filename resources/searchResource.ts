import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";

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

export function registerSearchResource(server: McpServer) {
  server.registerResource(
    "Search Resource",
    new ResourceTemplate("test://search{?q}", { list: undefined }),
    { description: "Search resources with a query parameter" },
    async (uri, variables) => {
      const query = String(variables.q || "");

      if (!query) {
        throw new Error("Search query parameter 'q' is required");
      }

      const results = generateSearchResults(query);

      return {
        contents: [
          {
            uri: uri.toString(),
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
  );
}
