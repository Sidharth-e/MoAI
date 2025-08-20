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
  regenerateMessage,
  updateMessageVersion,
} from "@/services/chat-services";
import { useChatThreads } from "@/contexts/ChatThreadsContext";

type Message = { 
  _id?: string;
  role: "user" | "assistant"; 
  content: string;
  versions?: string[];
  activeVersionIndex?: number;
};

const ERROR_MSG = "[Error receiving response]";
const ERROR_HISTORY_MSG = "[Error loading history]";

const mapMessage = (m: any): Message => ({
  _id: m._id,
  role: m.sender === "user" ? "user" : "assistant",
  content: m.text,
  versions: m.versions || [m.text],
  activeVersionIndex: m.activeVersionIndex || 0,
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

  // Function to handle message regeneration
  const handleRegenerateMessage = async (messageId: string) => {
    if (!jwtToken || !id) return;
    
    try {
      const regeneratedMessage = await regenerateMessage(messageId, String(id), jwtToken);
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? {
              ...msg,
              content: regeneratedMessage.text,
              versions: regeneratedMessage.versions || [regeneratedMessage.text],
              activeVersionIndex: regeneratedMessage.activeVersionIndex || 0
            }
          : msg
      ));
    } catch (error) {
      console.error("Failed to regenerate message:", error);
    }
  };

  // Function to navigate between message versions
  const handleVersionNavigation = async (messageId: string, direction: 'prev' | 'next') => {
    if (!jwtToken) return;
    
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId || !msg.versions) return msg;
      
      const currentIndex = msg.activeVersionIndex || 0;
      let newIndex = currentIndex;
      
      if (direction === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'next' && currentIndex < msg.versions.length - 1) {
        newIndex = currentIndex + 1;
      }
      
      return {
        ...msg,
        content: msg.versions[newIndex],
        activeVersionIndex: newIndex
      };
    }));

    // Persist the version change to the server
    try {
      const currentMessage = messages.find(msg => msg._id === messageId);
      if (currentMessage) {
        const newIndex = direction === 'prev' 
          ? (currentMessage.activeVersionIndex || 0) - 1
          : (currentMessage.activeVersionIndex || 0) + 1;
        
        await updateMessageVersion(messageId, newIndex, jwtToken);
      }
    } catch (error) {
      console.error("Failed to update message version on server:", error);
      // Revert the local change if server update fails
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, content: msg.versions?.[msg.activeVersionIndex || 0] || msg.content }
          : msg
      ));
    }
  };

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
          const savedMessage = await createChatMessage(String(id), jwtToken!, {
            text: assistantMessage,
            sender: "assistant",
          });
          
          // Update the message with the saved data including ID
          setMessages(prev => {
            const arr = [...prev];
            const last = arr[arr.length - 1];
            arr[arr.length - 1] = { 
              ...last, 
              _id: savedMessage._id,
              versions: savedMessage.versions || [assistantMessage],
              activeVersionIndex: savedMessage.activeVersionIndex || 0
            };
            return arr;
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
          <ChatMessage 
            key={i} 
            role={msg.role} 
            content={msg.content}
            messageId={msg._id}
            versions={msg.versions}
            activeVersionIndex={msg.activeVersionIndex}
            onRegenerate={handleRegenerateMessage}
            onVersionNavigation={handleVersionNavigation}
          />
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
