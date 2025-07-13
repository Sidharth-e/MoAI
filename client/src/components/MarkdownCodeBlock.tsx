import React, { memo, useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  CheckIcon,
  Copy,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

type MarkdownCodeBlockProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  node?: any;
};

const MarkdownCodeBlock: React.FC<MarkdownCodeBlockProps> = memo(
  ({ inline, className, children, ...props }) => {
    const [isIconChecked, setIsIconChecked] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Extract language
    const match = /language-(\w+)/.exec(className || "");
    const language = match?.[1] || "text";
    const codeString = String(children).replace(/\n$/, "");

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(codeString);
        setIsIconChecked(true);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    };

    useEffect(() => {
      if (isIconChecked) {
        const t = setTimeout(() => setIsIconChecked(false), 2000);
        return () => clearTimeout(t);
      }
    }, [isIconChecked]);

    const handleCollapseClick = () => setIsCollapsed((v) => !v);
    const iconSize = 16;

    // Render inline code if not a code block
    if (inline || !match) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    // Render the rich code block UI
    return (
      <div className="relative my-4 overflow-hidden rounded-t-md min-screen-full">
        <div className="flex justify-between items-center px-4 py-2 text-xs font-mono bg-[#282C34] text-white">
          <span>{language}</span>
          <div className="flex space-x-1">
            {/* Collapse/Expand Button */}
            <button
              type="button"
              title={isCollapsed ? "Expand code" : "Collapse code"}
              className="text-white hover:bg-white/10 hover:text-white px-2 py-1 flex items-center gap-1 text-xs rounded transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={handleCollapseClick}
            >
              {isCollapsed ? (
                <>
                  <ChevronsUpDown size={iconSize} />
                  <span>Expand</span>
                </>
              ) : (
                <>
                  <ChevronsDownUp size={iconSize} />
                  <span>Collapse</span>
                </>
              )}
            </button>
            {/* Copy Button */}
            <button
              type="button"
              title="Copy code"
              className="text-white hover:bg-white/10 hover:text-white px-2 py-1 flex items-center gap-1 text-xs rounded transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={handleCopy}
            >
              {isIconChecked ? (
                <>
                  <CheckIcon size={iconSize} className="text-green-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={iconSize} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
        {isCollapsed ? (
          <div className="flex items-center justify-center py-8 bg-[#23272f] text-gray-300 text-sm font-mono w-full">
            <span>
              {codeString.split("\n").length}{" "}
              {codeString.split("\n").length === 1 ? "line" : "lines"} hidden
            </span>
          </div>
        ) : (
          <SyntaxHighlighter
            language={language}
            PreTag="pre"
            showLineNumbers
            wrapLines
            style={atomDark}
            className="!m-0 !p-4 custom-scrollbar"
            customStyle={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        )}
      </div>
    );
  }
);

MarkdownCodeBlock.displayName = "MarkdownCodeBlock";
export default MarkdownCodeBlock;