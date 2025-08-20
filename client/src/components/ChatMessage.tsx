import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MarkdownCodeBlock from "./MarkdownCodeBlock";
import { Copy, Check, ThumbsDown, ThumbsUp, RefreshCcw } from "lucide-react"; // <-- import Check here

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  agentName?: string;
};

const avatarUrl = {
  user: "https://dummyimage.com/256x256/363536/ffffff&text=U",
  assistant: "https://dummyimage.com/256x256/354ea1/ffffff&text=G",
};

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, agentName }) => {
  const isAssistant = role === "assistant";
  const [copied, setCopied] = useState(false); // <-- state for copied

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // 1.5s timeout
  };

  return (
    <div
      className={`flex items-start gap-3 sm:gap-5 px-2 py-4 sm:px-4 ${
        isAssistant ? "bg-slate-50 dark:bg-slate-900 rounded-xl mb-2" : ""
      }`}
    >
      <img className="h-8 w-8 rounded-full" src={avatarUrl[role]} alt={role} />
      <div className="flex w-full flex-col gap-2">
        {/* Show agent name if present and assistant */}
        {isAssistant && agentName && (
          <div className="text-xs text-blue-600 dark:text-blue-300 font-semibold mb-1">{agentName}</div>
        )}
        <div className="prose prose-slate dark:prose-invert max-w-none transition-all duration-500">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code: MarkdownCodeBlock,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {isAssistant && (
          <div className="mt-2 flex flex-row gap-x-2 text-slate-500 self-end">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className="hover:text-blue-600 transition-colors"
              title={copied ? "Copied!" : "Copy message"}
              disabled={copied}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>

            {/* Like */}
            <button className="hover:text-blue-600" title="Like">
              <ThumbsUp size={18} />
            </button>

            {/* Dislike */}
            <button className="hover:text-blue-600" title="Dislike">
              <ThumbsDown size={18} />
            </button>
            <button className="hover:text-blue-600" title="Regenerate">
              <RefreshCcw size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;