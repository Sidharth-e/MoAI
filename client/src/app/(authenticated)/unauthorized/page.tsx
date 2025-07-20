"use client";

export default function UnauthorizedPage() {
  return (
    <main className="flex-grow h-full overflow-hidden bg-slate-50 dark:bg-slate-900 relative flex flex-col">
      {/* Gradient Glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/20 via-emerald-300/20 to-purple-400/10 blur-3xl rounded-full"></div>

      <section className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow">
              <span className="text-2xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MOAI
              </span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 bg-clip-text text-transparent tracking-tight mb-4">
            You are not authorized
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
            This page can only be viewed by admin users.<br />
            If you believe this is a mistake, please contact your administrator.
          </p>
        </div>
      </section>

      <footer className="w-full py-6 text-center text-slate-400 dark:text-slate-600 text-xs mt-auto">
        &copy; {new Date().getFullYear()} MOAI. All rights reserved.
      </footer>
    </main>
  );
}
