// HomePage.tsx
"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useChatThreads } from "@/contexts/ChatThreadsContext";
import { createChatMessage, createChatThread } from "@/services/chat-services";

const HomePage: React.FC = () => {
  const [usermessage, setUserMessage] = useState("");
  const { refreshThreads } = useChatThreads();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.jwtToken) return;
    // Create thread
    const thread = await createChatThread(session.user.jwtToken);
    await refreshThreads();
    await createChatMessage(String(thread._id), session.user.jwtToken!, {
            text: usermessage,
            sender: "user",
    });
    // Navigate to new thread
    router.push(`/chat/${thread._id}`);
  };

  return (
    <main className="flex-grow h-full overflow-hidden bg-slate-50 dark:bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Gradient Glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/20 via-emerald-300/20 to-purple-400/10 blur-3xl rounded-full"></div>

      <section className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="max-w-3xl text-center">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow">
              <span className="text-2xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MOAI
              </span>
            </span>
          </div>
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 bg-clip-text text-transparent tracking-tight mb-5">
            Elevate Your{" "}
            <span className="underline decoration-emerald-400/80">
              Experience
            </span>
          </h1>
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8">
            The next generation platform for modern professionals. Be bold. Be
            productive. Be ahead.
          </p>
        </div>

        <div className="mt-4 flex justify-center w-full">
          <form
            onSubmit={handleSend}
            className="w-full max-w-xl bg-white/80 dark:bg-slate-800/70 shadow-xl rounded-2xl px-4 py-3 flex items-end gap-3 border border-slate-200 dark:border-slate-700 backdrop-blur-md"
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
              value={usermessage}
              onChange={(e) => setUserMessage(e.target.value)}
              rows={1}
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-5 py-2 rounded-xl bg-gradient-to-br from-blue-600 via-emerald-500 to-purple-600 text-white font-semibold shadow hover:scale-105 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg
                className="h-5 w-5 text-white opacity-80"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2L11 13"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                ></path>
              </svg>
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-400 dark:text-slate-600 text-xs mt-auto">
        &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
      </footer>
    </main>
  );
};

export default HomePage;
