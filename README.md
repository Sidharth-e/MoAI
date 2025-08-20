# 🤖 MoAI - Modern AI Chat Platform

![MoAI Screenshot](client/public/home.png)
![MoAI Screenshot](client/public/chat.png)

MoAI is a full-stack, modern AI chat platform featuring a Next.js frontend and a Node.js/Express backend. It offers real-time chat, user authentication, and seamless integration with multiple AI services including Azure OpenAI, Google Gemini, and HuggingFace models.

---

## 🆕 What's New

### ✨ Latest Features
- **🔄 Message Regeneration & Version Control** - Regenerate AI responses and navigate between different versions
- **🧠 Multi-Model AI Support** - Azure OpenAI, Google Gemini, and HuggingFace integration
- **🔧 Model Context Protocol (MCP)** - Advanced AI tool integration and calling
- **🌐 Enhanced Web Tools** - Web search, website parsing, and weather data
- **📱 Modern UI/UX** - Responsive design with advanced chat features

### 📚 Documentation
- **New docs folder** with detailed guides for all features
- **AI Model Setup Guide** - Complete configuration for all supported models
- **Feature Documentation** - In-depth explanations of advanced capabilities

---

## 🗂️ Project Structure

```
MoAI/
  ├── 📁 client/          # Next.js frontend (React, TypeScript)
  ├── 📁 server/          # Node.js/Express backend (TypeScript, MongoDB)
  └── 📁 docs/            # Comprehensive documentation
```

- **client/**: Frontend web app (Next.js, React, Tailwind CSS, NextAuth.js)
- **server/**: Backend API (Express, MongoDB, JWT, Multi-AI Services, MCP)
- **docs/**: Detailed documentation and guides

---

## ✨ Core Features

### 🔐 Authentication & Security
- **NextAuth.js Integration** - Secure user authentication
- **JWT Token Management** - Stateless authentication
- **Protected Routes** - Secure access to chat features

### 💬 Advanced Chat System
- **Real-time Chat Interface** - Modern, responsive chat UI
- **Chat Threads & History** - Organized conversation management
- **Message Regeneration** - Regenerate AI responses with version control
- **Version Navigation** - Browse different AI response versions
- **Markdown Support** - Rich text and code block rendering

### 🧠 Multi-AI Model Support
- **Azure OpenAI** - Enterprise-grade AI with full streaming and tool calling
- **Google Gemini** - Advanced conversation handling with gemini-2.5-flash
- **HuggingFace** - Open-source AI models for experimentation
- **Model Context Protocol (MCP)** - Advanced AI tool integration

### 🌐 External API Tools
- **Web Search** - Serper API integration for real-time web data
- **Website Parsing** - Firecrawl for detailed webpage analysis
- **Weather Data** - OpenWeatherMap integration
- **MCP Inspector** - Web-based tool for testing and debugging MCP tools

### ⚙️ User Experience
- **Responsive Design** - Works on all devices
- **Dark/Light Theme** - Customizable appearance
- **User Settings** - Profile and preference management
- **Search & Navigation** - Easy chat thread discovery

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd MoAI
   ```

2. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env` in both `client/` and `server/` directories
   - Configure your AI model API keys (see [AI Model Setup](docs/MODEL_SETUP.md))

4. **Start Development Servers:**
   ```bash
   # Terminal 1 - Start client
   cd client
   npm run dev
   
   # Terminal 2 - Start server
   cd server
   npm run dev
   ```

5. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080
   - MCP Inspector: http://localhost:8081 (when running `npm run inspector`)

---

## 📖 Documentation

For detailed guides and feature explanations, visit our **[Documentation Hub](docs/README.md)**:

- **[AI Model Setup](docs/MODEL_SETUP.md)** - Configure Azure OpenAI, Gemini, and HuggingFace
- **[Message Regeneration Features](docs/MESSAGE_REGENERATION_FEATURE.md)** - Advanced chat capabilities
- **[Client Documentation](client/README.md)** - Frontend development guide
- **[Server Documentation](server/README.md)** - Backend API guide

---

## 🏗️ Architecture Overview

### Frontend (`client/`)
```
client/
  src/
    app/
      (authenticated)/      # Protected routes (chat, settings, etc.)
      layout.tsx            # Root layout with providers
      page.tsx              # Landing page
    components/             # Reusable UI components
    contexts/               # React context providers
    features/               # Feature modules
    lib/                    # Utility libraries
    services/               # API service functions
    types/                  # TypeScript definitions
```

### Backend (`server/`)
```
server/
  src/
    db.ts                  # MongoDB connection
    index.ts               # Express server entry point
    middleware/            # Authentication & validation
    models/                # Mongoose schemas
    routes/                # API endpoints
    services/              # AI service integrations
    tools/                 # MCP tool implementations
    interface/             # TypeScript interfaces
```

---

## 🛠️ API Endpoints

| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/user` | POST/GET | User authentication & management | ❌ (login) / ✅ |
| `/api/chat` | POST/GET | Chat operations & regeneration | ✅ |
| `/api/chat-threads` | GET/POST | Thread management | ✅ |
| `/api/chat-messages` | GET/PATCH | Message operations & version control | ✅ |
| `/api/huggingFace/chat` | POST | HuggingFace AI integration | ✅ |
| `/api/mcp` | POST | Model Context Protocol tools | ❌ |

---

## 🔧 Environment Variables

### Client Environment
```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Server Environment
```env
# Database
DB=mongodb://localhost:27017/moai

# Server
PORT=8080

# AI Services
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_API_INSTANCE_NAME=your-instance
AZURE_OPENAI_API_DEPLOYMENT_NAME=your-deployment

GEMINI_API_KEY=your-key
HUGGINGFACE_API_KEY=your-key

# External APIs
OPENWEATHER_API_KEY=your-key
SERPER_API_KEY=your-key
FIRECRAWL_API_KEY=your-key
```

---

## 📦 Available Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Lint codebase
```

### Server
```bash
npm run dev          # Start with hot-reloading
npm start            # Start production server
npm run inspector    # Launch MCP Inspector UI
```

---

## 🧩 Technology Stack

### Frontend
- **Framework**: Next.js 15, React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React Context + Hooks

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

### AI & External Services
- **Azure OpenAI**: GPT-4, GPT-3.5-turbo
- **Google Gemini**: gemini-2.5-flash
- **HuggingFace**: Open-source models
- **MCP**: Model Context Protocol
- **APIs**: Serper (web search), Firecrawl (web scraping), OpenWeatherMap

---

## 🎯 Key Features Deep Dive

### Message Regeneration & Version Control
- **Regenerate AI Responses**: Create new versions of AI messages
- **Version Navigation**: Browse between different AI response versions
- **Persistent Storage**: All versions are saved and accessible
- **Smart Context**: Regeneration uses the same conversation context

### Model Context Protocol (MCP)
- **Tool Integration**: Seamlessly call external tools from AI conversations
- **Web Search**: Real-time information retrieval
- **Website Analysis**: Detailed webpage content extraction
- **Weather Data**: Current weather information
- **Inspector UI**: Web-based tool testing interface

### Multi-Model AI Support
- **Azure OpenAI**: Production-ready with full streaming and tool calling
- **Google Gemini**: Advanced conversation handling
- **HuggingFace**: Open-source experimentation
- **Automatic Fallback**: Smart model selection based on availability

---

## 🚀 Deployment

### Production Build
```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

### Environment Considerations
- Set production environment variables
- Configure MongoDB connection for production
- Set up proper CORS settings
- Configure NextAuth for production domain

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation for changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### 🛠️ Core Technologies
- [Next.js](https://nextjs.org/) - React framework for production
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### 🧠 AI Services
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) - Enterprise AI services
- [Google Gemini](https://ai.google.dev/) - Advanced AI models
- [Hugging Face](https://huggingface.co/) - Open source AI models
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI integration standard

### 🎨 UI & Design
- [Lucide React](https://lucide.dev/) - Beautiful icon toolkit
- Modern design patterns and best practices

---

## 📞 Support & Community

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions
- **Documentation**: Check our [docs folder](docs/README.md) for detailed guides

---

*Built with ❤️ using modern web technologies*

