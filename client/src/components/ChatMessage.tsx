import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";


// Dark themes
// import 'highlight.js/styles/monokai-sublime.css';  // High contrast, colorful
// import 'highlight.js/styles/atom-one-dark.css';    // Popular VS Code-like
// import 'highlight.js/styles/vs2015.css';           // Visual Studio 2015 style
import 'highlight.js/styles/base16/dracula.css';   // Trendy Dracula theme


type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

const avatarUrl = {
  user: "https://dummyimage.com/256x256/363536/ffffff&text=U",
  assistant: "https://dummyimage.com/256x256/354ea1/ffffff&text=G"
};

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => (
  <div
    className={`flex items-start gap-3 sm:gap-5 px-2 py-4 sm:px-4 ${
      role === "user"
        ? ""
        : "bg-slate-50 dark:bg-slate-900 rounded-xl mb-2"
    }`}
  >
    <img
      className="h-8 w-8 rounded-full"
      src={avatarUrl[role]}
      alt={role === "user" ? "user" : "assistant"}
    />
    <div className="flex-1 min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  </div>
);

export default ChatMessage;