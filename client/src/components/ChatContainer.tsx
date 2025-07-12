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
      const res = await fetch("http://localhost:8080/api/chat", {
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
    <div className="flex flex-col h-full w-full bg-slate-200 p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7">
      <div ref={outputRef} className="flex-1 overflow-y-auto rounded-xl ">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
      </div>
      <div className="mt-4 flex justify-center w-full">
        <form
          className="w-full max-w-xl bg-white/80 dark:bg-slate-800/70 shadow-xl rounded-2xl px-4 py-3 flex items-end gap-3 border border-slate-200 dark:border-slate-700 backdrop-blur-md"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <label htmlFor="chat-input" className="sr-only">
            Enter your prompt
          </label>
          <textarea
            id="chat-input"
            className="flex-1 min-h-[44px] max-h-32 rounded-xl border-none resize-y bg-slate-200 dark:bg-slate-700 p-4 text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter your prompt…"
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
            rows={1}
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-gradient-to-br from-blue-600 via-emerald-500 to-purple-600 text-white font-semibold shadow hover:scale-105 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            disabled={streaming || input.trim() === ""}
          >
            <svg
              className="h-5 w-5 text-white opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 2L11 13"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 2L15 22L11 13L2 9L22 2Z"
              ></path>
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
