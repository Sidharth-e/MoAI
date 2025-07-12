// contexts/ChatThreadsContext.tsx
"use client";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface ChatThread {
  _id: string;
  title: string;
  createdAt: string;
}

type ChatThreadsContextProps = {
  chatThreads: ChatThread[];
  refreshThreads: () => Promise<void>;
};

const ChatThreadsContext = createContext<ChatThreadsContextProps>({
  chatThreads: [],
  refreshThreads: async () => {},
});

export function useChatThreads() {
  return useContext(ChatThreadsContext);
}

export const ChatThreadsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const {data:session,status}=useSession();
  const fetchThreads = async () => {
    if (status !== "authenticated") return; 
    // Replace with your real endpoint:
     const response = await fetch("http://localhost:8080/api/chat-threads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.jwtToken}`,
        },
      });
    const data = await response.json();
    setChatThreads(data.threads);
  };

  useEffect(() => {
    fetchThreads();
  }, [session,status]);

  return (
    <ChatThreadsContext.Provider value={{
      chatThreads,
      refreshThreads: fetchThreads,
    }}>
      {children}
    </ChatThreadsContext.Provider>
  );
};