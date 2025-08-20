# MoAI Client (Web App)

This is the frontend for the MoAI project, built with Next.js, React, and TypeScript. It provides a modern, authenticated chat interface, settings, and integration with backend AI services.

## ✨ Features
- **Azure AD Secure authentication** (NextAuth.js, JWT)
- **Advanced Chat Interface** with threads and message history
- **Message Regeneration & Version Control** - Regenerate AI responses and navigate versions
- **Markdown and code block rendering** with syntax highlighting
- **Search and create chat threads** with intelligent filtering
- **User settings page** with customizable preferences
- **Responsive sidebar navigation** with modern design
- **Integration with multiple AI services** (Azure OpenAI, Gemini, HuggingFace)
- **Model Context Protocol (MCP)** support for advanced tool integration

## 📚 Documentation

For detailed feature guides and setup instructions, visit our **[Documentation Hub](../docs/README.md)**:

- **[AI Model Setup](../docs/MODEL_SETUP.md)** - Configure all supported AI models
- **[Message Regeneration Features](../docs/MESSAGE_REGENERATION_FEATURE.md)** - Advanced chat capabilities
- **[Main Project README](../README.md)** - Complete project overview

## 🏗️ Folder Structure
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

## 🚀 Setup & Installation
1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```
2. **Configure environment variables:**
   Create a `.env.local` file for NextAuth and API configuration (see [AI Model Setup](../docs/MODEL_SETUP.md) for details).

## 🖥️ Running the Client
- **Development:**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm run build
  npm start
  ```

## 📦 Scripts
- `npm run dev` — Start development server (with Turbopack)
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Lint codebase

## 🛣️ Main Routes
| Path                        | Description                       |
|-----------------------------|-----------------------------------|
| `/`                         | Landing page                      |
| `/chat`                     | Chat interface (authenticated)    |
| `/chat/[id]`                | Individual chat thread            |
| `/unauthorized`             | Unauthorized access page          |

## 🧩 Key Components
- **`ChatContainer`** — Main chat interface with message regeneration
- **`ChatList`** — Chat thread management and navigation
- **`ChatMessage`** — Individual message display with version controls
- **`SideBar`** — Navigation sidebar with search and settings
- **`NewChat`** — Chat thread creation and management
- **`SearchChat`** — Intelligent chat thread search
- **`MarkdownCodeBlock`** — Enhanced markdown and code rendering

## 🎯 New Features

### Message Regeneration & Version Control
- **Regenerate Button**: Regenerate AI responses with the same context
- **Version Navigation**: Browse between different AI response versions
- **Version Indicator**: Shows current version and total count
- **Persistent Storage**: All versions are saved and accessible

### Enhanced UI/UX
- **Responsive Design**: Works seamlessly on all devices
- **Modern Components**: Built with latest React patterns
- **Accessibility**: WCAG compliant interface elements
- **Performance**: Optimized rendering and state management

## 🛠️ Tech Stack
- **Framework**: Next.js 15, React 19, TypeScript
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + Hooks
- **Database**: MongoDB integration via backend
- **AI Services**: Multi-model support through backend APIs

## 📖 Additional Resources
- **[Server Documentation](../server/README.md)** - Backend API guide
- **[Project Overview](../README.md)** - Complete project information
- **[Feature Documentation](../docs/README.md)** - Detailed guides for all features

## �� License
MIT

---
