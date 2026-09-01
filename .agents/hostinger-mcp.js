const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const server = new McpServer({
  name: "hostinger-email",
  version: "1.0.0",
});

const TOKEN = "cb00e117064d3a75aa4b64e055a15330ca8b7f0752841e8fc4fc759d1badf5aa";
const BASE_URL = "https://api.mail.hostinger.com/api/v1";

async function fetchAPI(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch(e) {
        throw new Error(`API Error ${res.status}: ${text}`);
    }
    if (!res.ok) {
        throw new Error(data && data.message ? data.message : `API Error ${res.status}: ${text}`);
    }
    return data;
}

// Read Tool
server.tool(
  "email_call_api_read",
  "Hostinger Mail API - Read endpoint",
  {
    endpoint: z.string().describe("The API endpoint path (e.g. /mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/folders)"),
  },
  async ({ endpoint }) => {
    try {
        const data = await fetchAPI(endpoint, { method: "GET" });
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    } catch (e) {
        return {
            content: [{ type: "text", text: `Error: ${e.message}` }],
            isError: true
        };
    }
  }
);

// Write Tool
server.tool(
  "email_call_api_write",
  "Hostinger Mail API - Write endpoint",
  {
    endpoint: z.string().describe("The API endpoint path"),
    payload: z.string().describe("JSON payload as string")
  },
  async ({ endpoint, payload }) => {
    try {
        const data = await fetchAPI(endpoint, { 
            method: "POST",
            body: payload
        });
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    } catch (e) {
        return {
            content: [{ type: "text", text: `Error: ${e.message}` }],
            isError: true
        };
    }
  }
);

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
