import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getWeather } from "../tools/getWeather";
import { getSerperWebData } from "../tools/getSerperWebData";
import { getFirecrawlWebsiteDetails } from "../tools/getFirecrawlWebsiteDetails";
import { randomUUID } from "crypto";

function buildServer(): McpServer {
  const server = new McpServer({
    name: "MoAI-mcp-server",
    version: "1.0.0",
  });

  server.tool("getWeather", "Get weather", getWeather.schema, getWeather.handler);
  server.tool(
    "getSerperWebData",
    "Get serper web data",
    getSerperWebData.schema,
    getSerperWebData.handler
  );
  server.tool(
    "getFirecrawlWebsiteDetails",
    "Get firecrawl website details",
    getFirecrawlWebsiteDetails.schema,
    getFirecrawlWebsiteDetails.handler
  );

  return server;
}

const router = express.Router();

const server = buildServer();
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // or your session ID generator
});

// Connect once, not per request!
server.connect(transport).catch((err) => {
  console.error("Failed to connect MCP server to transport:", err);
});

router.post("/", async (req: Request, res: Response) => {
  try {
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      console.log("Request closed");
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

export default router;
