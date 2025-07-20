# MoAI

MoAI is a full-stack web application featuring a Next.js frontend and a Node.js/Express backend. It provides chat functionality, user authentication, and integration with external APIs and services.

## Project Structure

```
MoAI/
  client/   # Next.js frontend
  server/   # Node.js/Express backend
```

Let me know if you want to add badges, screenshots, or more detailed setup instructions!

### Client (`client/`)

- Built with Next.js and React.
- Handles user authentication, chat UI, and settings.
- Communicates with the backend via API routes.

### Server (`server/`)

- Built with Node.js and Express.
- Manages user data, chat threads, and messages.
- Integrates with external services (e.g., HuggingFace, weather, web data).
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
- Settings and user profile management

## Contributing

Contributions are welcome! Please open issues or pull requests for any improvements or bug fixes.

## License

[MIT](LICENSE)

---

*This is a starter README. Please update with more specific details as your project evolves.*
