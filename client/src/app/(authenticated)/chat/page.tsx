// HomePage.tsx
"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

const features = [
  {
    title: "Lightning Fast",
    description:
      "Optimized for speed and reliability for a seamless experience.",
    icon: (
      <svg
        className="h-6 w-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Secure & Private",
    description:
      "Industry-leading practices to keep your data safe and confidential.",
    icon: (
      <svg
        className="h-6 w-6 text-emerald-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 11c1.104 0 2-.896 2-2V7c0-1.104-.896-2-2-2S10 5.896 10 7v2c0 1.104.896 2 2 2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 11V7a5 5 0 00-10 0v4a7 7 0 0010 0z"
        />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description: "Help is always available with our dedicated team.",
    icon: (
      <svg
        className="h-6 w-6 text-amber-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 10c0-3.314-2.686-6-6-6S6 6.686 6 10c0 2.28 1.396 4.229 3.354 5.087L9 21l3-2 3 2-0.354-5.913C16.604 14.229 18 12.28 18 10z"
        />
      </svg>
    ),
  },
];

const HomePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 👈 Prevent form reload

    const res = await fetch("http://localhost:8080/api/chat-threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user.jwtToken}`,
      },
      body: JSON.stringify({ title: "New Chat" }),
    });
    const data = await res.json();
    // To see the actual response content:
    console.log(data);
    router.push(`/chat/${data.thread._id}`);
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
                LOGO
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
          {/* CTA Button */}
          <div>
            <a
              href="#get-started"
              className="inline-block px-8 py-3 rounded-lg bg-gradient-to-br from-blue-600 via-emerald-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-600/10 hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid max-w-4xl mx-auto gap-8 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-6 py-8 shadow-lg flex flex-col items-center text-center backdrop-blur-md"
            >
              <div className="mb-4">{f.icon}</div>
              <div className="font-semibold text-lg text-slate-900 dark:text-white">
                {f.title}
              </div>
              <div className="text-slate-500 dark:text-slate-300 text-sm mt-2">
                {f.description}
              </div>
            </div>
          ))}
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
