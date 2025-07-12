"use client";
import React, { useState, useRef } from "react";
import ChatMessage from "./ChatMessage";

type Message = {
  role: "user" | "ai";
  content: string;
};

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Stream output from the real backend
  async function fetchAndStreamResponse(prompt: string) {
    setStreaming(true);

    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const res = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: prompt }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      let decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readDone } = await reader.read();
        done = readDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (let line of lines) {
            line = line.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice("data:".length).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta: string | undefined =
                json.choices?.[0]?.delta?.content;
              if (delta !== undefined) {
                setMessages((prev) => {
                  // Append new delta fragment to last AI message
                  const arr = [...prev];
                  arr[arr.length - 1] = {
                    ...arr[arr.length - 1],
                    content: (arr[arr.length - 1].content || "") + delta,
                  };
                  return arr;
                });
                setTimeout(() => {
                  outputRef.current?.scrollTo(
                    0,
                    outputRef.current.scrollHeight
                  );
                }, 0);
              }
            } catch (e) {
              console.error("Error parsing chunk", e, data);
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", content: "[Error receiving response]" },
      ]);
    } finally {
      setStreaming(false);
      setTimeout(() => {
        outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
      }, 100);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    await fetchAndStreamResponse(input);
    setInput("");
  };

  return (
  <div className="flex flex-col h-full w-full bg-slate-200 p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7"> {/* h-full for parent flexbox */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto rounded-xl "
      >
        {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
      </div>

<div className="mt-2 flex align-center justify-center w-full">
    <form className="w-300" onSubmit={handleSubmit}>
  <label htmlFor="chat-input" className="sr-only">
    Enter your prompt
  </label>
  <div className="flex items-end gap-2">
    <textarea
      id="chat-input"
      className="flex-1 min-h-[44px] max-h-32 block resize-y rounded-xl border none bg-slate-200 p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-500 sm:text-base"
      placeholder="Enter your prompt"
      required
      value={input}
      onChange={(e) => setInput(e.target.value)}
      disabled={streaming}
      rows={1}
    />
    <button
      type="submit"
      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:text-base disabled:opacity-60"
      disabled={streaming}
    >
      Send
    </button>
  </div>
</form>
</div>
    </div>
  );
};

export default ChatContainer;
