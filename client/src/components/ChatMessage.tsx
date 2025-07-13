import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw'
import MarkdownCodeBlock from "./MarkdownCodeBlock";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

const avatarUrl = {
  user: "https://dummyimage.com/256x256/363536/ffffff&text=U",
  assistant: "https://dummyimage.com/256x256/354ea1/ffffff&text=G",
};

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => (
  <div
    className={`flex items-start gap-3 sm:gap-5 px-2 py-4 sm:px-4 ${
      role === "user" ? "" : "bg-slate-50 dark:bg-slate-900 rounded-xl mb-2"
    }`}
  >
    <img
      className="h-8 w-8 rounded-full"
      src={avatarUrl[role]}
      alt={role}
    />
   <div className="prose prose-slate dark:prose-invert max-w-none transition-all duration-500">

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: MarkdownCodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  </div>
);

export default ChatMessage;