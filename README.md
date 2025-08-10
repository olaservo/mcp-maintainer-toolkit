# MCP Maintainer Toolkit

[![npm version](https://badge.fury.io/js/mcp-maintainer-toolkit.svg)](https://badge.fury.io/js/mcp-maintainer-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server with utilities to help with maintaining MCP repositories. This toolkit provides various tools and utilities for repository maintenance, testing, and development workflows.

## Features

- **Multiple Transport Support**: STDIO, SSE, and Streamable HTTP transports
- **Comprehensive Testing Tools**: Tools for testing various MCP features and edge cases
- **Schema Validation**: Robust parameter validation using Zod schemas
- **Progress Notifications**: Support for long-running tasks with progress updates
- **Rich Parameter Types**: Support for complex nested objects, arrays, and conditional parameters

## Installation

```bash
npm install -g mcp-maintainer-toolkit
```

Or install locally:

```bash
npm install mcp-maintainer-toolkit
```

## Usage

### Command Line

After global installation, you can run the server directly:

```bash
# Start with STDIO transport (default)
mcp-maintainer-toolkit

# Start with SSE transport
mcp-maintainer-toolkit sse

# Start with Streamable HTTP transport
mcp-maintainer-toolkit streamableHttp
```

### Programmatic Usage

```javascript
import { createServer } from 'mcp-maintainer-toolkit';

const { server, cleanup } = createServer();
// Use the server with your preferred transport
```

### NPM Scripts

If installed locally, you can use the npm scripts:

```bash
# Build the project
npm run build

# Start development server with watch mode
npm run watch

# Start with different transports
npm run start          # STDIO
npm run start:sse      # SSE on port 3001
npm run start:streamableHttp  # Streamable HTTP on port 3002
```

## Available Tools

The toolkit includes various testing and utility tools:

- **Basic Tools**: Echo, Add, Get Current Time
- **Data Tools**: Format Data (JSON, YAML, Table)
- **Advanced Features**: Long Running Tasks, Annotated Responses
- **Testing Tools**: Complex schema validation, type testing, parameter submission testing

## Configuration

### Environment Variables

- `PORT`: Port for SSE and Streamable HTTP servers (default: 3001 for SSE, 3002 for Streamable HTTP)

### MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "maintainer-toolkit": {
      "command": "mcp-maintainer-toolkit",
      "args": []
    }
  }
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/olaservo/mcp-maintainer-toolkit.git
cd mcp-maintainer-toolkit

# Install dependencies
npm install

# Build the project
npm run build

# Start development with watch mode
npm run watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Ola Hungerford](https://www.olahungerford.com)

## Links

- [GitHub Repository](https://github.com/olaservo/mcp-maintainer-toolkit)
- [npm Package](https://www.npmjs.com/package/mcp-maintainer-toolkit)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Author's Website](https://www.olahungerford.com)
