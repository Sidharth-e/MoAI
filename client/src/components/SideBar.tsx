// components/Sidebar.tsx
"use client";
import React, { useState } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiLogOut,
  FiUser,
  FiSettings,
  FiMenu,
  FiChevronLeft,
  FiCompass,
  FiPlus,
  FiHome,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatList from "./ChatList";
import { signOut } from "next-auth/react";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const getLinkClasses = (path: string) =>
    `rounded-lg p-1.5 transition-colors duration-200 ${
      pathname === path
        ? "bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-600"
        : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
    }`;

  return (
    <aside className="flex">
      {/* First Column */}
      <div
        className={`flex flex-col items-center
        border-r border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900
        transition-all duration-300 py-8 gap-2
        ${isOpen ? "w-12 sm:w-16" : "w-14 sm:w-14"}
      `}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="mb-2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
        </button>
        {/* New conversation */}
        <Link href="/" className={getLinkClasses("/discover")}>
          <FiPlus size={24} />
        </Link>
        <Link href="/" className={getLinkClasses("/")}>
          <FiHome size={24} />
        </Link>

        {/* Conversations */}
        <Link href="/chat" className={getLinkClasses("/chat")}>
          <FiMessageSquare size={24} />
        </Link>

        {/* Discover */}
        <Link href="#" className={getLinkClasses("/discover")}>
          <FiCompass size={24} />
        </Link>

        {/* User */}
        <Link href="#" className={getLinkClasses("/discover")}>
          <FiUser size={24} />
        </Link>

        {/* Settings */}
        <Link href="/settings" className={getLinkClasses("/discover")}>
          <FiSettings size={24} />
        </Link>
        {/* Logout Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Logout"
          >
            <FiLogOut size={24} />
          </button>
        </div>
      </div>
      {/* Second Column */}
      <div
        className={`h-screen overflow-y-auto bg-slate-50 py-8 dark:bg-slate-900 transition-all duration-300 ${
          isOpen ? "w-52 sm:w-60 block" : "w-0 hidden"
        }`}
      >
        <div className="flex items-start">
          <h2 className="inline px-5 text-lg font-medium text-slate-800 dark:text-slate-200">
            Chats
          </h2>
          <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-slate-200">
            24
          </span>
        </div>

        <ChatList />
      </div>
    </aside>
  );
};

export default Sidebar;
