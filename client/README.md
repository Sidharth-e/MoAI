# MoAI Client (Web App)

This is the frontend for the MoAI project, built with Next.js, React, and TypeScript. It provides a modern, authenticated chat interface, settings, and integration with backend AI services.

## Features
- Azure AD Secure authentication (NextAuth.js, JWT)
- Chat interface with threads and message history
- Markdown and code block rendering
- Search and create chat threads
- User settings page
- Responsive sidebar navigation
- Integration with backend AI APIs

## Folder Structure
```
client/
  src/
    app/
      (authenticated)/      # Protected routes (chat, home, etc.)
      layout.tsx            # Root layout
      page.tsx              # Landing page
      globals.css           # Global styles
    components/             # UI components (Chat, Sidebar, etc.)
    contexts/               # React context providers
    features/               # Feature modules (auth, navigation, etc.)
    lib/                    # Utility libraries (JWT, MongoDB, etc.)
    services/               # API service functions
    types/                  # TypeScript types and declarations
```

## Setup & Installation
1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```
2. **Configure environment variables:**
   If required, create a `.env.local` file for NextAuth or API URLs (see backend docs for details).

## Running the Client
- **Development:**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm run build
  npm start
  ```

## Scripts
- `npm run dev` — Start development server (with Turbopack)
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Lint codebase

## Main Routes
| Path                        | Description                       |
|-----------------------------|-----------------------------------|
| `/`                         | Landing page                      |
| `/chat`                     | Chat interface (authenticated)    |
| `/chat/[id]`                | Individual chat thread            |
| `/unauthorized`             | Unauthorized access page          |

## Key Components
- `ChatContainer`, `ChatList`, `ChatMessage` — Chat UI
- `SideBar` — Navigation sidebar
- `NewChat`, `SearchChat` — Chat thread actions
- `MarkdownCodeBlock` — Markdown/code rendering

## Tech Stack
- Next.js 15, React 19, TypeScript
- NextAuth.js for authentication
- Tailwind CSS for styling
- MongoDB (via backend)

## License
MIT

---
