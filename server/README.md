# MoAI Server (API)

This is the backend API for the MoAI project. It provides endpoints for authentication, chat, integration with Hugging Face, Azure OpenAI, and the Model Context Protocol (MCP). The server is built with Node.js, Express, and TypeScript, and uses MongoDB for data storage.

## Features
- User authentication and management
- Chat threads and messages
- Integration with Hugging Face and Azure OpenAI
- Model Context Protocol (MCP) support
- Secure JWT-based authentication

## Folder Structure
```
server/
  src/
    db.ts                # MongoDB connection
    index.ts             # Entry point
    middleware/          # Express middlewares
    models/              # Mongoose models
    routes/              # API route handlers
    services/            # Service logic (e.g., AOAI)
    tools/               # Utility tools (Web search,webpage parsing, etc.)
    interface/           # TypeScript interfaces
```

## Setup & Installation
1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file in the `server/` directory with the following:
   ```env
   DB=<your-mongodb-uri>
   PORT=8080 # (optional, defaults to 8080)
   ```

## Running the Server
- **Development:**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

## Scripts
- `npm run dev` — Start server with hot-reloading (nodemon, TypeScript)
- `npm start` — Start server in production mode
- `npm run inspector` — Launch the MCP Inspector UI for testing and debugging MCP tools

## MCP Inspector
The MCP Inspector is a web-based tool for testing and debugging MCP tools implemented in this server.

### How to Run MCP Inspector
1. Make sure your server is running (e.g., with `npm run dev`).
2. In a separate terminal, run:
   ```bash
   npm run inspector
   ```
   This will launch the MCP Inspector UI in your browser.

### Screenshot
![MCP Inspector Screenshot](./public/mcp_inspector.png)

---
## MCP API

The MCP API allows you to call various tools via JSON-RPC 2.0. Each tool is exposed as a callable method with a specific set of arguments.

### How to Call a Tool

To call a tool, send a JSON-RPC 2.0 request with the following structure:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "<toolName>",
    "arguments": {
      // tool-specific arguments
    }
  },
  "id": "<uniqueId>"
}
```

### Example Requests

#### 1. getSerperWebData

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "getSerperWebData",
    "arguments": {
      "query": "latest AI news"
    }
  },
  "id": "getSerperWebData"
}
```

#### 2. getFirecrawlWebsiteDetails

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "getFirecrawlWebsiteDetails",
    "arguments": {
      "url": "https://example.com"
    }
  },
  "id": "getFirecrawlWebsiteDetails"
}
```

#### 3. getWeather

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "getWeather",
    "arguments": {
      "location": "San Francisco"
    }
  },
  "id": "getWeather"
}
```

## API Routes Overview
| Route                        | Description                        |
|------------------------------|------------------------------------|
| `/api/user`                  | User authentication & management   |
| `/api/huggingFace/chat`      | Hugging Face API integration       |
| `/api/chat`                  | Chat operations                    |
| `/api/chat-threads`          | Chat thread management             |
| `/api/chat-messages`         | Chat message management            |
| `/api/mcp`                   | Model Context Protocol endpoints   |

> All routes (except `/api/mcp`) require authentication via JWT.

## Environment Variables
- `DB` — MongoDB connection string (required)
- `PORT` — Port to run the server (optional, defaults to 8080)
- `OPENWEATHER_API_KEY` — API key for OpenWeatherMap (required for real weather data)
-  `FIRECRAWL_API_KEY` - API key for Firecrawl(required for web scraping)
-  `SERPER_API_KEY` - API key for Serper(required for web search)

## Dependencies
- express, mongoose, dotenv, cors, bcrypt, jsonwebtoken, axios, joi, @huggingface/inference, @modelcontextprotocol/sdk, openai
- TypeScript, ts-node, nodemon (dev)

## License
MIT

---
