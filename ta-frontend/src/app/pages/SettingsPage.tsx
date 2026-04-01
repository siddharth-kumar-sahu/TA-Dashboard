import {
  Sun,
  Moon,
  User,
  Bell,
  Shield,
  Palette,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Appearance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Customize how the dashboard looks
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                Theme Mode
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Switch between light and dark mode
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`
    relative inline-flex h-12 w-20 rounded-full transition-colors duration-200 cursor-pointer
    ${theme === "dark" ? "bg-indigo-600" : "bg-slate-300"}
  `}
            >
              <span
                className={`
      absolute inset-y-1 w-10 rounded-full bg-white shadow-lg
      flex items-center justify-center transition-all duration-200
      ${theme === "dark" ? "left-9" : "left-1"}
    `}
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Profile Settings
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage your personal information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value="Scaledge"
                readOnly
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value="scaledge@gmail.com"
                readOnly
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <input
              type="text"
              value="Talent Acquisition Manager"
              readOnly
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Notifications
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure your notification preferences
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              label: "Email notifications",
              desc: "Receive email updates about candidates",
            },
            {
              label: "Push notifications",
              desc: "Get push notifications on your device",
            },
            {
              label: "Weekly reports",
              desc: "Receive weekly summary reports",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {item.label}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {item.desc}
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked={index < 2}
                className="w-5 h-5 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Security
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage your security settings
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full md:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors cursor-pointer">
            Change Password
          </button>
          <button className="w-full md:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors cursor-pointer md:ml-3">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}