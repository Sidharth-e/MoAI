"use client";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export interface ChatThread {
  _id: string;
  title: string;
  createdAt: string;
}

type ChatThreadsContextProps = {
  chatThreads: ChatThread[];
  chatCount: number;
  refreshThreads: () => Promise<void>;
};

const ChatThreadsContext = createContext<ChatThreadsContextProps>({
  chatThreads: [],
  chatCount: 0,
  refreshThreads: async () => {},
});

export function useChatThreads() {
  return useContext(ChatThreadsContext);
}

export const ChatThreadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const { data: session, status } = useSession();

  const fetchThreads = async () => {
    if (status !== "authenticated") return;
    try {
      const response = await fetch("http://localhost:8080/api/chat-threads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.jwtToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch chat threads");
        return;
      }

      const data = await response.json();
      setChatThreads(data.threads || []);
    } catch (error) {
      console.error("Error fetching chat threads:", error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [session, status]);

  // Derive chatCount from chatThreads length
  const chatCount = useMemo(() => chatThreads.length, [chatThreads]);

  return (
    <ChatThreadsContext.Provider
      value={{
        chatThreads,
        chatCount,
        refreshThreads: fetchThreads,
      }}
    >
      {children}
    </ChatThreadsContext.Provider>
  );
};
