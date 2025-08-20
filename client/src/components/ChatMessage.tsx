import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MarkdownCodeBlock from "./MarkdownCodeBlock";
import { Copy, Check, ThumbsDown, ThumbsUp, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  messageId?: string;
  model?: string; // AI model used for the message
  versions?: string[];
  activeVersionIndex?: number;
  onRegenerate?: (messageId: string) => Promise<void>;
  onVersionNavigation?: (messageId: string, direction: 'prev' | 'next') => void;
};

const avatarUrl = {
  user: "https://dummyimage.com/256x256/363536/ffffff&text=U",
  assistant: "https://dummyimage.com/256x256/354ea1/ffffff&text=G",
};

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  agentName, 
  messageId, 
  model,
  versions, 
  activeVersionIndex, 
  onRegenerate, 
  onVersionNavigation 
}) => {
  const isAssistant = role === "assistant";
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // 1.5s timeout
  };

  const handleRegenerate = async () => {
    if (!messageId || !onRegenerate) return;
    
    setIsRegenerating(true);
    try {
      await onRegenerate(messageId);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleVersionNavigation = async (direction: 'prev' | 'next') => {
    if (!messageId || !onVersionNavigation) return;
    await onVersionNavigation(messageId, direction);
  };

  const hasMultipleVersions = versions && versions.length > 1;
  const canGoPrev = hasMultipleVersions && (activeVersionIndex || 0) > 0;
  const canGoNext = hasMultipleVersions && (activeVersionIndex || 0) < (versions?.length || 1) - 1;

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
        {/* Show model information for assistant messages */}
        {isAssistant && model && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Model: {model === "azure-openai" ? "Azure OpenAI (GPT-4)" : 
                   model === "gemini" ? "Google Gemini 2.5 Flash" : 
                   model === "huggingface" ? "Hugging Face" : model}
          </div>
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

            {/* Regenerate */}
            <button 
              onClick={handleRegenerate}
              disabled={isRegenerating || !messageId}
              className={`hover:text-blue-600 transition-colors ${isRegenerating ? 'animate-spin' : ''}`}
              title="Regenerate message"
            >
              <RefreshCcw size={18} />
            </button>

            {/* Version Navigation Controls - Only show if multiple versions exist */}
            {hasMultipleVersions && (
              <div className="flex items-center gap-1 border-l border-slate-300 pl-2 ml-2">
                {/* Previous Version */}
                <button
                  onClick={() => handleVersionNavigation('prev')}
                  disabled={!canGoPrev}
                  className={`hover:text-blue-600 transition-colors ${!canGoPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Previous version"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Version Indicator */}
                <span className="text-xs px-2 text-slate-600">
                  {(activeVersionIndex || 0) + 1}/{versions?.length || 1}
                </span>

                {/* Next Version */}
                <button
                  onClick={() => handleVersionNavigation('next')}
                  disabled={!canGoNext}
                  className={`hover:text-blue-600 transition-colors ${!canGoNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Next version"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;