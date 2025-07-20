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
    tools/               # Utility tools (JD/Resume parsing, etc.)
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

## API Routes Overview
| Route                        | Description                        |
|------------------------------|------------------------------------|
| `/api/user`                  | User authentication & management   |
| `/huggingFace/redye`         | Hugging Face API integration       |
| `/api/chat`                  | Chat operations                    |
| `/api/chat-threads`          | Chat thread management             |
| `/api/chat-messages`         | Chat message management            |
| `/api/mcp`                   | Model Context Protocol endpoints   |

> All routes (except `/api/mcp`) require authentication via JWT.

## Environment Variables
- `DB` — MongoDB connection string (required)
- `PORT` — Port to run the server (optional, defaults to 8080)
- `OPENWEATHER_API_KEY` — API key for OpenWeatherMap (required for real weather data)

## Dependencies
- express, mongoose, dotenv, cors, bcrypt, jsonwebtoken, axios, joi, @huggingface/inference, @modelcontextprotocol/sdk, openai
- TypeScript, ts-node, nodemon (dev)

## License
Specify your license here.

---

*For more details, see the source code in each folder.* 