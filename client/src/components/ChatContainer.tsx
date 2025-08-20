"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import ChatMessage from "./ChatMessage";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MoveUp } from "lucide-react";
import {
  createChatMessage,
  fetchChatMessages,
  updateChatThreadTitle,
  streamAssistantResponse,
} from "@/services/chat-services";
import { useChatThreads } from "@/contexts/ChatThreadsContext";

type Message = { role: "user" | "assistant"; content: string };

const ERROR_MSG = "[Error receiving response]";
const ERROR_HISTORY_MSG = "[Error loading history]";

const mapMessage = (m: any): Message => ({
  role: m.sender === "user" ? "user" : "assistant",
  content: m.text,
});

const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollTo(0, ref.current.scrollHeight);
  }
};

const ChatContainer: React.FC = () => {
  const { data: session, status } = useSession();
  const { refreshThreads } = useChatThreads();
  const { id } = useParams();
  const jwtToken = session?.user.jwtToken;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const titleUpdatedRef = useRef(false);
  const maxLength = 10000;
  let assistantMessage = "";

  const fetchAndStreamResponse = async (prompt: string) => {
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      assistantMessage = await streamAssistantResponse({
        prompt,
        threadId: String(id),
        jwtToken,
        onDelta: (delta) => {
          setMessages((prev) => {
            const arr = [...prev];
            const last = arr[arr.length - 1];
            arr[arr.length - 1] = { ...last, content: (last.content || "") + delta };
            return arr;
          });
          setTimeout(() => scrollToBottom(outputRef), 0);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: ERROR_MSG },
          ]);
        },
      });
    } catch {
      // Already handled by onError
    } finally {
      setStreaming(false);
      setTimeout(() => scrollToBottom(outputRef), 100);
      if (assistantMessage) {
        try {
          await createChatMessage(String(id), jwtToken!, {
            text: assistantMessage,
            sender: "assistant",
          });
        } catch (e) {
          console.error("Persist assistant failed:", e);
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const prompt = input;
    setInput("");
    setMessages((msgs) => [...msgs, { role: "user", content: prompt }]);

    try {
      await createChatMessage(String(id), jwtToken!, {
        text: prompt,
        sender: "user",
      });
    } catch (e) {
      console.error("Persist user message failed:", e);
    }

    await fetchAndStreamResponse(prompt);
  };

  useEffect(() => {
    if (!id || status !== "authenticated") return;
    let cancelled = false;
    const load = async () => {
      try {
        const msgs = await fetchChatMessages(String(id), jwtToken!);
        if (!cancelled) {
          setMessages(msgs.map(mapMessage));
          if (msgs.length === 1 && msgs[0].sender === "user") {
            fetchAndStreamResponse(msgs[0].text);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
            setMessages([{ role: "assistant", content: ERROR_HISTORY_MSG }]);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, status, jwtToken]);

  useEffect(() => {
    scrollToBottom(outputRef);
  }, [messages]);

  useEffect(() => {
    if (!id || status !== "authenticated") return;
    const maybeUpdateTitle = async () => {
      if (
        !titleUpdatedRef.current &&
        messages.length >= 2 &&
        messages[0].role === "user" &&
        messages[1].role === "assistant"&& !streaming
      ) {
        titleUpdatedRef.current = true;
        try {
          await updateChatThreadTitle(String(id), jwtToken!);
          await refreshThreads();
        } catch (err) {
          console.error("Failed to update title:", err);
        }
      }
    };
    maybeUpdateTitle();
  }, [messages, id, jwtToken, refreshThreads,streaming]);

  return (
    <div
      ref={outputRef}
      className="h-full w-full overflow-y-auto bg-slate-200 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7 flex flex-col"
    >
      <div className="flex-1 px-4 pt-4 space-y-2 py-10">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="sticky bottom-1 left-0 w-full max-w-2xl mx-auto bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-md border border-neutral-200"
      >
        <div className="flex">
          <textarea
            className="grow m-4 outline-none min-h-20 resize-none bg-transparent"
            placeholder="Type your question here ..."
            maxLength={maxLength}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
          />
        </div>
        <div className="flex gap-2 items-center absolute right-2 bottom-2">
          <div className="text-xs">
            {input.length}/{maxLength}
          </div>
          <button
            type="submit"
            disabled={input.trim() === "" || streaming}
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
