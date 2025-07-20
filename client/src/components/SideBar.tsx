"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiMessageSquare,
  FiLogOut,
  FiUser,
  FiSettings,
  FiMenu,
  FiChevronLeft,
  FiCompass,
  FiPlus,
  FiHome,
  FiUsers,
} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import ChatList from "./ChatList";
import { useChatThreads } from "@/contexts/ChatThreadsContext";
import { createChatThread } from "@/services/chat-services";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const { refreshThreads, chatCount } = useChatThreads();

  const navItems = [
    { href: "/", icon: <FiHome size={22} />, label: "Home" },
    { href: "/chat", icon: <FiMessageSquare size={22} />, label: "Chats", match: (p: string) => p.startsWith("/chat") },
  ];

  const isActive = (href: string, match?: (p: string) => boolean) =>
    match ? match(pathname) : pathname === href;

  const baseButton =
    "group relative flex items-center p-4 justify-center rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
  const active = "bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-500";
  const inactive = "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800";

  const getItemClasses = (isActive: boolean) =>
    `${baseButton} ${isActive ? active : inactive}`;

  const handleNewChat = useCallback(async () => {
    if (!session?.user?.jwtToken || creating) return;
    setCreating(true);
    try {
    const thread = await createChatThread(session.user.jwtToken);
    await refreshThreads();
      router.push(`/chat/${thread._id}`);
    } catch (err) {
      console.error("Error creating chat thread", err);
    } finally {
      setCreating(false);
    }
  }, [session?.user?.jwtToken, creating, refreshThreads, router]);

  return (
    <aside className="flex h-screen select-none">
      {/* Sidebar Icons */}
      <nav
        aria-label="Primary"
        className={`flex flex-col items-center border-r border-slate-300 bg-slate-50 py-4 dark:border-slate-700 dark:bg-slate-900 transition-all duration-300 w-14 sm:w-16`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={getItemClasses(false)}
        >
          {isOpen ? <FiChevronLeft size={22} /> : <FiMenu size={22} />}
        </button>

        {/* New Chat */}
        <button
          onClick={handleNewChat}
          aria-label="New Chat"
          disabled={creating}
          className={`${baseButton} text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 ${creating ? "opacity-60 cursor-not-allowed" : ""}`}
          title="New Chat"
        >
          <FiPlus size={22} />
        </button>

        {/* Navigation Items */}
        <div className="mt-1 flex flex-col gap-1">
          {navItems.map(({ href, icon, label, match }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={getItemClasses(isActive(href, match))}
              title={label}
            >
              {icon}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Logout"
          title="Logout"
          className={getItemClasses(false)}
        >
          <FiLogOut size={22} />
        </button>
      </nav>

      {/* Chat List Panel */}
      <div
        className={`h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-all duration-300 ${
          isOpen ? "w-66 sm:w-74 px-0 py-6 opacity-100" : "w-0 px-0 py-0 opacity-0 pointer-events-none"
        }`}
      >
        {isOpen && (
          <div className="flex flex-col h-full">
            <header className="mb-1 mx-2 flex items-center gap-2">
              <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                Chats
              </h2>
              {typeof chatCount === "number" && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {chatCount}
                </span>
              )}
            </header>
            <div className="flex-1">
              <ChatList />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
