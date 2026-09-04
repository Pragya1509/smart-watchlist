#!/usr/bin/env node
"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const yargs_1 = __importDefault(require("yargs"));
const mcp_server_js_1 = require("../mcp/server/mcp-server.js");
// MCP Server handler function
function startMCPServer() {
    console.log('🚀 Starting MCP stdio server...');
    try {
        // Create and start the MCP server directly
        const server = new mcp_server_js_1.MCPServer();
        console.log('📡 MCP stdio server is running. Connect your MCP client to this process.');
        console.log('💡 Use Ctrl+C to stop the server.');
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down MCP server...');
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down MCP server...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error(`❌ Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
const _argv = yargs_1.default
    .command('$0', 'the default command', {}, api_1.showMarketStatus)
    .command('equity <symbol>', 'Get details of the symbol', (yargsBuilder) => {
    yargsBuilder.positional('symbol', {
        type: 'string',
        demandOption: true,
        describe: 'Symbol of NSE equities.'
    });
}, api_1.showEquityDetails)
    .command('historical <symbol>', 'Get historical chart of the symbol', (yargsBuilder) => {
    yargsBuilder.positional('symbol', {
        type: 'string',
        demandOption: true,
        describe: 'Symbol of NSE equities.'
    });
}, api_1.showHistorical)
    .command('index [indexSymbol]', 'Get details of the index.', (yargsBuilder) => {
    yargsBuilder.positional('indexSymbol', {
        type: 'string',
        demandOption: true,
        describe: 'Symbol of NSE Indices.'
    });
}, (argv) => {
    const { indexSymbol: index } = argv;
    if (index)
        (0, api_1.showIndexDetails)(argv);
    else
        (0, api_1.showIndexOverview)();
})
    .command('mcp', 'Start MCP stdio server', (yargsBuilder) => {
    yargsBuilder
        .example('$0 mcp', 'Start MCP stdio server')
        .example('npx . mcp', 'Start MCP stdio server via npx');
}, startMCPServer)
    .argv;
//# sourceMappingURL=index.js.map