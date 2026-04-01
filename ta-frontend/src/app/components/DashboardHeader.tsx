import {
  ChevronDown,
  User,
  Menu,
  Settings,
  LogOut,
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

    // Future-ready placeholder
    // Example later:
    // auth.logout();
    // navigate("/login");

    console.log("User signed out");
  };

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-4 relative">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <h1 className="text-slate-900 dark:text-slate-100 hidden sm:block">
            Scaledge Hiring Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4 relative">
          {/* Filters (unchanged) */}
          {/* <button className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition">
            <span className="text-sm">Last 30 Days</span>
            <ChevronDown className="w-4 h-4" />
          </button> */}

          {/* Profile */}
          <div ref={popupRef} className="relative">
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition"
            >
              <User className="w-5 h-5 text-white" />
            </div>

            {/* Profile Popup */}
            <div
              className={`
                absolute right-0 mt-3 w-72 origin-top-right rounded-xl 
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                shadow-xl overflow-hidden transform transition-all duration-200
                ${open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
              `}
            >
              {/* User Info */}
              <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Scaledge
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    scaledge@gmail.com
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2 space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Go to Settings
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
      text-slate-600 dark:text-slate-400
      hover:bg-rose-50 dark:hover:bg-rose-900/20
      hover:text-rose-600 dark:hover:text-rose-400
      transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Sign out
                  </span>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-center text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Scaledge India
                Pvt. Ltd.
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}