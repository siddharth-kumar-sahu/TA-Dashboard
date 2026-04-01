import {
  User,
  Menu,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";

import { useSidebar } from "../contexts/SidebarContext";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    setOpen(false);
    console.log("User signed out");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 flex-shrink-0 z-30">

      {/* LEFT: Product name + mobile menu */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Product brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex-shrink-0" />
          <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
            TA-Dashboard
          </span>
        </div>
      </div>

      {/* RIGHT: actions + profile */}
      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
          <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Profile dropdown */}
        <div ref={popupRef} className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
              Scaledge
            </span>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 mt-2 w-64 origin-top-right rounded-xl
              bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
              shadow-xl overflow-hidden transition-all duration-150
              ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Scaledge</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">scaledge@gmail.com</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-1.5 space-y-0.5">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-xs text-center text-slate-400">
              © {new Date().getFullYear()} Scaledge India Pvt. Ltd.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}