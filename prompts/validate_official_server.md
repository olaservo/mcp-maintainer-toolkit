We maintain a repository containing a collection of reference implementations for the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), as well as a Readme containing a list of links to community built MCP servers, official MCP servers and additional resources: https://github.com/modelcontextprotocol/servers

OUR CURRENT TASK:

Since this is an official repository for MCP, our job is to review this link to make sure that the server we add to this list meets the following guidelines at minimum:

- The link MUST go to a code repository for an MCP Server OR documentation on how to configure the server
- Any images or icons used in links must point to a valid image (i.e. it must not return a 404)
- The organization maintaining or owning the repository is valid as the owner/maintainer of the official repository
- There are no red flags related to security or other aspects of the repo
- There MUST be documentation that indicates what it does and how to install it

## PR Information

- **PR URL**: {{pr_url}}

## Instructions

1. First, use the `gh` CLI tool to fetch PR details:
   - Use `gh pr view {{pr_url}} --json author,body,files` to get PR metadata and file changes
   - Extract the author and any server URLs mentioned in the PR

2. Identify the server repository URL from the PR changes (typically added to README.md)

3. Use the `fetch` tool to examine the server repository's README and code to validate it meets the minimum requirements listed above.

4. For official servers, pay special attention to:
   - Verifying the organization is legitimate
   - Checking that any linked images or icons are accessible
   - Ensuring the quality and completeness of documentation

5. If we are over 90% confident the link is for a legitimate server, mark it as **Valid**. Otherwise, mark it as either **Potentially Valid** or **Invalid** corresponding to your confidence level.

## Output

Provide your validation result with the following information:

- **PR Author**: (from gh CLI)
- **Server Name**: (extracted from PR changes)
- **Server URL**: (extracted from PR changes)
- **Validation Status**: Valid / Potentially Valid / Invalid
- **Confidence Level**: Percentage (0-100%)
- **Validation Notes**: Brief explanation of your findings and reasoning, including verification of organization legitimacy and any image/icon checks

Please provide a clear, concise validation result.
