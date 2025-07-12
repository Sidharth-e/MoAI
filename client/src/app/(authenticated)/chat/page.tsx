// HomePage.tsx
import React from "react";

const features = [
  {
    title: "Lightning Fast",
    description: "Optimized for speed and reliability for a seamless experience.",
    icon: (
      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Secure & Private",
    description: "Industry-leading practices to keep your data safe and confidential.",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2V7c0-1.104-.896-2-2-2S10 5.896 10 7v2c0 1.104.896 2 2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 11V7a5 5 0 00-10 0v4a7 7 0 0010 0z" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description: "Help is always available with our dedicated team.",
    icon: (
      <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 10c0-3.314-2.686-6-6-6S6 6.686 6 10c0 2.28 1.396 4.229 3.354 5.087L9 21l3-2 3 2-0.354-5.913C16.604 14.229 18 12.28 18 10z" />
      </svg>
    ),
  },
];

const HomePage: React.FC = () => {
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
            Elevate Your <span className="underline decoration-emerald-400/80">Experience</span>
          </h1>
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8">
            The next generation platform for modern professionals. Be bold. Be productive. Be ahead.
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
              <div className="font-semibold text-lg text-slate-900 dark:text-white">{f.title}</div>
              <div className="text-slate-500 dark:text-slate-300 text-sm mt-2">{f.description}</div>
            </div>
          ))}
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