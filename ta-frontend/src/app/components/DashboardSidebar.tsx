import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCog,
  Mail,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Candidates", icon: Users, path: "/candidates" },
  { label: "Jobs / Positions", icon: Briefcase, path: "/jobs" },
  { label: "Recruiters", icon: UserCog, path: "/recruiters" },
  {
    label: "Email Tracking",
    icon: Mail,
    path: "/email-tracking",
  },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        h-screen flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              Hiring-WorkFlow
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    onClick={() =>
                      window.innerWidth < 768 && closeSidebar()
                    }
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer 
                      transition-all duration-150 group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                    <span className="font-medium">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Need help?
            </p>
            <a
              href="https://scaledge.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
            >
              Contact Support
            </a>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Scaledge India Pvt.
            Ltd.
          </div>
        </div>
      </aside>
    </>
  );
}