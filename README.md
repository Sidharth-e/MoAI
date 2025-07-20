# MoAI

MoAI is a full-stack web application featuring a Next.js frontend and a Node.js/Express backend. It provides chat functionality, user authentication, and integration with external APIs and services.

## Project Structure

```
MoAI/
  client/   # Next.js frontend
  server/   # Node.js/Express backend
```

### Client (`client/`)

- Built with Next.js and React.
- Handles user authentication, chat UI, and settings.
- Communicates with the backend via API routes.

### Server (`server/`)

- Built with Node.js and Express.
- Manages user data, chat threads, and messages.
- Integrates with external services (e.g., HuggingFace, weather, web data, Model Context Protocol).
- Connects to a MongoDB database.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd MoAI
   ```

2. **Install dependencies for both client and server:**
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `client/` and `server/` directories and fill in the required values.

4. **Run the development servers:**

   - **Client:**
     ```bash
     cd client
     npm run dev
     ```
   - **Server:**
     ```bash
     cd server
     npm run dev
     ```

## Features

- User authentication (NextAuth.js)
- Real-time chat interface
- Chat history and threads
- Integration with external APIs (HuggingFace, weather, web search)
- **Model Context Protocol (MCP) API and tools**
- Settings and user profile management

## API Overview

| Route                        | Description                        |
|------------------------------|------------------------------------|
| `/api/user`                  | User authentication & management   |
| `/huggingFace/redye`         | Hugging Face API integration       |
| `/api/chat`                  | Chat operations                    |
| `/api/chat-threads`          | Chat thread management             |
| `/api/chat-messages`         | Chat message management            |
| `/api/mcp`                   | **Model Context Protocol (MCP) API** |

> All routes (except `/api/mcp`) require authentication via JWT.

### MCP API

The MCP API is available at `/api/mcp` on the server. It exposes tools such as weather, web data, and website details via the [Model Context Protocol](https://modelcontext.com/). This endpoint is compatible with MCP clients and tools.

## Development & Debugging Tools

### MCP Inspector

You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to debug and interact with the MCP API.

**To run the MCP Inspector:**

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   npm run inspector
   ```
   This will launch the MCP Inspector tool.

2. When prompted for the MCP API URL, use:
   ```
   http://localhost:8080/api/mcp
   ```
   (or replace `8080` with your configured server port)

## Contributing

Contributions are welcome! Please open issues or pull requests for any improvements or bug fixes.

## License

[MIT](LICENSE)

---

