#!/usr/bin/env node

// Export the createServer function for programmatic usage
export { createServer } from './server.js';

// Only run the CLI when this file is executed directly
// Normalize paths for cross-platform compatibility
const normalizedImportUrl = import.meta.url;
const normalizedArgvPath = `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (normalizedImportUrl === normalizedArgvPath) {
    // Parse command line arguments first
    const args = process.argv.slice(2);
    const scriptName = args[0] || 'stdio';

    async function run() {
        try {
            // Dynamically import only the requested module to prevent all modules from initializing
            switch (scriptName) {
                case 'stdio':
                    // Import and run the default server
                    await import('./stdio.js');
                    break;
                case 'sse':
                    // Import and run the SSE server
                    await import('./sse.js');
                    break;
                case 'streamableHttp':
                    // Import and run the streamable HTTP server
                    await import('./streamableHttp.js');
                    break;
                default:
                    console.error(`Unknown script: ${scriptName}`);
                    console.log('Available scripts:');
                    console.log('- stdio');
                    console.log('- sse');
                    console.log('- streamableHttp');
                    process.exit(1);
            }
        } catch (error) {
            console.error('Error running script:', error);
            process.exit(1);
        }
    }

    run();
}
