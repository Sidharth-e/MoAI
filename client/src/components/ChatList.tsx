import React from "react";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";
import { useParams } from "next/navigation"; // Add this
import { useChatThreads } from "@/contexts/ChatThreadsContext";


const ChatList: React.FC = () => {
  const { chatThreads } = useChatThreads();
  const params = useParams(); // params will be { id: '2', ... } if you're on /chat/2
  const activeId = params?.id; // May be undefined if not on /chat/[id]

  return (
    <div className="mx-2 mt-8 space-y-5">
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

      {/* Chat list */}
      {chatThreads.map((chat) => {
        // Ensure both are strings for comparison (Next.js provides params as string)
        const isActive = String(chat._id) === String(activeId);

        return (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`flex w-full flex-col gap-y-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 focus:outline-none ${
              isActive
                ? "bg-slate-200 dark:bg-slate-800"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <h1 className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
              {chat.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{chat.createdAt}</p>
          </Link>
        )
      })}
    </div>
  );
};

export default ChatList;