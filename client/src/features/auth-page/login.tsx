'use client';
import { signIn, SignInOptions } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface LoginProps {
  isDevMode: boolean;
}

export default function LogIn(props: LoginProps) {
  const [isLoading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const signInOptions: SignInOptions = callbackUrl ? { callbackUrl } : {};

  useEffect(() => {
    if (!props.isDevMode) {
      setLoading(true);
      signIn("azure-ad", signInOptions).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isDevMode]);

  if (isLoading) {
    // Modern spinner using Tailwind
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-300 font-medium">Signing you in...</p>
        </div>
      </div>
    );
  }

  if (!props.isDevMode) {
    // In normal mode, nothing is shown as sign-in happens automatically.
    return null;
  }

  // DEV MODE: Show modern login card
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Slight glass look, shadow, border */}
      <div className="p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-md min-w-[320px] w-full max-w-xs">
        <div className="flex justify-center mb-4">
          {/* Example SVG/MS logo */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 32 32">
              <rect x="2" y="2" width="12" height="12" fill="#0078D4"/>
              <rect x="18" y="2" width="12" height="12" fill="#50D9FF"/>
              <rect x="2" y="18" width="12" height="12" fill="#FFD800"/>
              <rect x="18" y="18" width="12" height="12" fill="#28C940"/>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Sign In</h2>
        <p className="text-slate-500 dark:text-slate-300 text-center mb-6 text-sm">
          Continue with your Microsoft 365 account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => signIn("azure-ad", signInOptions)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 text-white font-bold shadow hover:scale-[1.03] hover:shadow-xl transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="10" height="10" fill="#0078D4"/><rect x="13" y="1" width="10" height="10" fill="#50D9FF"/><rect x="1" y="13" width="10" height="10" fill="#FFD800"/><rect x="13" y="13" width="10" height="10" fill="#28C940"/></svg>
            Microsoft 365 Login
          </button>
          <button
            onClick={() => signIn("localdev")}
            className="w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            Basic Auth <span className="text-xs text-slate-400 ml-1">(DEV ONLY)</span>
          </button>
        </div>
      </div>
    </div>
  );
}