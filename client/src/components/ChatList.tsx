"use client"
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Chat = {
  id: string | number;
  title: string;
  date: string;
};

const ChatList: React.FC = () => {
  const params = useParams();
  const activeId = params?.id;

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
const { data: session, status } = useSession();
  // Fetch chats from API
  useEffect(() => {
     if (status !== "authenticated") return;
    async function fetchChats() {
      try {
        setLoading(true);
        setError("");
        // Adjust the endpoint as needed!
            const response = await fetch("http://localhost:8080/api/chat-threads", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user.jwtToken}`,
      },
    });
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        setChats(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, []);

  return (
    <div className="mx-2 mt-8 space-y-4">
      {/* Search form */}
      <form>
        <label htmlFor="search-chats" className="sr-only">
          Search chats
        </label>
        <div className="relative">
          <input
            id="search-chats"
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            placeholder="Search chats"
            required
          />
          <button
            type="submit"
            className="absolute bottom-2 right-2.5 rounded-lg p-2 text-sm text-slate-500 hover:text-blue-700 focus:outline-none sm:text-base"
          >
            <FiSearch size={20} />
            <span className="sr-only">Search chats</span>
          </button>
        </div>
      </form>

      {/* Loading and error states */}
      {loading && <div className="text-slate-500 p-4 text-center text-xs">Loading chats...</div>}
      {error && <div className="text-red-500 p-4 text-center text-xs">{error}</div>}

      {/* Chat list */}
      {/* {!loading && !error && chats.map((chat) => {
        const isActive = String(chat.id) === String(activeId);
        return (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={`flex w-full flex-col gap-y-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 focus:outline-none ${
              isActive
                ? "bg-slate-200 dark:bg-slate-800"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <h1 className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
              {chat.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{chat.date}</p>
          </Link>
        )
      })} */}
    </div>
  );
};

export default ChatList;