"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import ChatMessage from "./ChatMessage";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

// ---- Types ---- //
type Message = {
  role: "user" | "assistant";
  content: string;
};

// ---- Helpers ---- //
const API_BASE = "http://localhost:8080/api";

const getAuthHeaders = (token?: string, extra?: Record<string, string>) => ({
  ...(extra || {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const mapMessage = (m: any): Message => ({
  role: m.sender === "user" ? "user" : "assistant",
  content: m.text,
});

const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollTo(0, ref.current.scrollHeight);
  }
};

const ERROR_MSG = "[Error receiving response]";
const ERROR_HISTORY_MSG = "[Error loading history]";

// ---- Main Component ---- //
const ChatContainer: React.FC = () => {
  const { data: session } = useSession();
  const { id } = useParams();
  const jwtToken = session?.user.jwtToken;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Handles streaming AI response, pushes partials live
  const fetchAndStreamResponse = async (prompt: string) => {
    setStreaming(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);
    let assistantMessage = "";
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(jwtToken),
        },
        body: JSON.stringify({ userMessage: prompt,threadId:id }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
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
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta !== undefined) {
                assistantMessage += delta;
                setMessages(prev => {
                  const arr = [...prev];
                  arr[arr.length - 1] = {
                    ...arr[arr.length - 1],
                    content: (arr[arr.length - 1].content || "") + delta,
                  };
                  return arr;
                });
                setTimeout(() => scrollToBottom(outputRef), 0);
              }
            } catch (e) {
              console.error("Error parsing chunk", e, data);
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: ERROR_MSG },
      ]);
    } finally {
      setStreaming(false);
      setTimeout(() => scrollToBottom(outputRef), 100);
      // Persist the assistant message
      await fetch(`${API_BASE}/chat-messages/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(jwtToken),
        },
        body: JSON.stringify({
          text: assistantMessage,
          sender: "assistant",
        }),
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    // Persist user message
    await fetch(`${API_BASE}/chat-messages/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(jwtToken),
      },
      body: JSON.stringify({
        text: input,
        sender: "user",
      }),
    });
    setMessages(msgs => [...msgs, { role: "user", content: input }]);
    await fetchAndStreamResponse(input);
    setInput("");
  };

  // Fetch chat history on load
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/chat-messages/${id}`, {
          headers: getAuthHeaders(jwtToken),
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          if (!mounted) return;
          setMessages(data.messages.map(mapMessage));
          // If only a single prompt, initiate an immediate response
          if (data.messages.length === 1) {
            fetchAndStreamResponse(data.messages[0].text);
          }
        }
      } catch (error) {
        if (!mounted) return;
        setMessages([{ role: "assistant", content: ERROR_HISTORY_MSG }]);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [id, jwtToken]);

  // Auto-scroll to latest message on message update
  useEffect(() => {
    scrollToBottom(outputRef);
  }, [messages]);

return (
  <div className="h-full w-full bg-slate-200 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7 overflow-y-auto">
    <div ref={outputRef} className="flex-1  px-4 pt-4 space-y-2">
      {messages.map((msg, i) => (
        <ChatMessage key={i} role={msg.role} content={msg.content} />
      ))}
    </div>

    <div className="sticky bottom-0 left-0 px-4 py-2">
      <form
        className="w-full max-w-xl mx-auto bg-white/80 dark:bg-slate-800/70 shadow-xl rounded-2xl px-4 py-3 flex items-end gap-3 border border-slate-200 dark:border-slate-700 backdrop-blur-md"
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
          onChange={e => setInput(e.target.value)}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  </div>
);

};

export default ChatContainer;