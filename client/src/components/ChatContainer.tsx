"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import ChatMessage from "./ChatMessage";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MoveUp, Send } from "lucide-react";

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
  const titleUpdatedRef = useRef(false);

  const { id } = useParams();
  const jwtToken = session?.user.jwtToken;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const maxLength = 10000;

  // Handles streaming AI response, pushes partials live
  const fetchAndStreamResponse = async (prompt: string) => {
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let assistantMessage = "";
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(jwtToken),
        },
        body: JSON.stringify({ userMessage: prompt, threadId: id }),
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
              const delta: string | undefined =
                json.choices?.[0]?.delta?.content;
              if (delta !== undefined) {
                assistantMessage += delta;
                setMessages((prev) => {
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
      setMessages((prev) => [
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

    setInput("");
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
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
    await fetchAndStreamResponse(input);
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
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [id, jwtToken]);

  // Auto-scroll to latest message on message update
  useEffect(() => {
    scrollToBottom(outputRef);
  }, [messages]);


  useEffect(() => {
  if (
    !titleUpdatedRef.current &&
    messages.length >= 2 &&
    messages[0].role === "user" &&
    messages[1].role === "assistant"
  ) {
    titleUpdatedRef.current = true; // Prevent future runs
    console.log("✅ Updating title...");

    fetch(`${API_BASE}/chat-threads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(jwtToken),
      },
    }).catch((err) => console.error("Failed to update title:", err));
  }
}, [messages, id, jwtToken]);

  return (
    <div
      ref={outputRef}
      className="h-full w-full overflow-y-auto bg-slate-200 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7 flex flex-col"
    >
      <div className="flex-1  px-4 pt-4 space-y-2 py-10 ">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="sticky bottom-1 left-0 w-full max-w-2xl mx-auto bg-slate-200 dark:bg-slate-800 w-full h-45 rounded-2xl shadow-md border border-neutral-200 relative"
      >
        <div className="flex">
          <textarea
            className="grow m-4 outline outline-0 focus:outline-0 active:border-transparent min-h-20 resize-none"
            placeholder="Type your question here ..."
            maxLength={maxLength}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center absolute right-2 bottom-2">
          <div className="text-xs">
            {input.length}/{maxLength}
          </div>
          <button
            type="submit"
            disabled={input.trim() === ""}
            className="bg-neutral-700 rounded-full text-white w-8 h-8 p-2 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          >
            <MoveUp size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;
