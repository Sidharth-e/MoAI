import { parseResume } from "../tools/parseResume";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { parseJD } from "../tools/parseJD";
import { matchResumeToJd } from "../tools/matchResumeToJd";
import { summarizeGap } from "../tools/summarizeGap";

dotenv.config();
const router = express.Router();

// Helper to create a new MCP server instance and register tools
function getServer() {
  const server = new McpServer({
    name: "streamable-mcp-server",
    version: "1.0.0",
  });

  server.tool(
    parseResume.name,
    "Resume parser",
    parseResume.schema,
    parseResume.handler
  );
  server.tool(parseJD.name, "JD parser", parseJD.schema, parseJD.handler);
  server.tool(
    matchResumeToJd.name,
    "Match Resume to jd",
    matchResumeToJd.schema,
    matchResumeToJd.handler
  );
  server.tool(
    summarizeGap.name,
    "Summarize gap between Resume and jd",
    summarizeGap.schema,
    summarizeGap.handler
  );

  return server;
}

const server = getServer();
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

router.post("/mcp", async (req: Request, res: Response) => {
  try {
    await server.connect(transport);
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