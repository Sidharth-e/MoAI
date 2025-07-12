import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Optionally import a highlight.js theme for syntax highlighting
import "highlight.js/styles/github.css";

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
      alt={role === "user" ? "User" : "AI"}
    />
    <div className="flex max-w-3xl items-center">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  </div>
);

export default ChatMessage;