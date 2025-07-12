// SettingsPage.tsx
"use client"
import React, { useState } from "react";

const initialSettings = {
  darkMode: false,
  emailNotifications: true,
  privacy: false,
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(initialSettings);

  const handleToggle = (key: keyof typeof initialSettings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    // Insert actual persistence logic as needed
  };

  return (
    <main className="flex-grow h-full bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center relative">
      {/* Gradient Glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 via-emerald-300/20 to-purple-400/10 blur-3xl rounded-full" />

      <section className="w-full max-w-md px-4">
        {/* Settings Card */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 mb-6">
          {/* User/profile section */}
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              {/* Replace the text/avatar with a real image */}
              <span className="text-2xl font-bold text-white">JD</span>
            </div>
            <div className="ml-4">
              <div className="font-semibold text-lg text-slate-900 dark:text-white">John Doe</div>
              <div className="text-slate-500 dark:text-slate-300 text-sm">john.doe@email.com</div>
            </div>
            <button className="ml-auto px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition">
              Edit
            </button>
          </div>

          <hr className="my-5 border-slate-100 dark:border-slate-700" />

          {/* Settings list */}
          <div className="space-y-7">
            {/* Dark mode toggle (this is just a setting, real dark mode control may come from a context/provider) */}
            <SettingToggle
              label="Enable dark mode"
              description="Use a dark color scheme for better night-time viewing."
              enabled={settings.darkMode}
              onToggle={() => handleToggle("darkMode")}
            />

            {/* Email notifications */}
            <SettingToggle
              label="Email notifications"
              description="Get notified for activity, updates, and offers."
              enabled={settings.emailNotifications}
              onToggle={() => handleToggle("emailNotifications")}
            />

            {/* Privacy */}
            <SettingToggle
              label="Make profile private"
              description="Hide your activity and profile from public view."
              enabled={settings.privacy}
              onToggle={() => handleToggle("privacy")}
            />
          </div>

          {/* Sign out button */}
          <div className="mt-10">
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-150">
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-2 text-center text-slate-400 dark:text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Your Brand
        </footer>
      </section>
    </main>
  );
};

// Reusable Setting Toggle component
interface ToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}
const SettingToggle: React.FC<ToggleProps> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-start justify-between">
    <div>
      <div className="font-medium text-slate-800 dark:text-slate-100">{label}</div>
      {description && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</div>
      )}
    </div>
    <button
      className={`ml-4 relative w-11 h-6 flex items-center bg-slate-200 dark:bg-slate-700 rounded-full shadow-inner transition-all ${
        enabled ? "bg-emerald-500/70" : ""
      }`}
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      tabIndex={0}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow bg-white dark:bg-slate-900 transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;