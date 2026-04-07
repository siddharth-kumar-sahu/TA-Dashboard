import {
  LayoutDashboard, Users, Briefcase,
  UserCog, Mail, FileText, Settings, Calendar,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";

const navItems = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/" },
  { label: "Candidates",      icon: Users,           path: "/candidates" },
  { label: "Jobs / Positions", icon: Briefcase,      path: "/jobs" },
  { label: "Recruiters",      icon: UserCog,         path: "/recruiters" },
  { label: "Email Tracking",  icon: Mail,            path: "/email-tracking" },
  { label: "Calendar",        icon: Calendar,        path: "/calendar" },
  { label: "Reports",         icon: FileText,        path: "/reports" },
  { label: "Settings",        icon: Settings,        path: "/settings" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={closeSidebar} />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-56 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ top: "3.5rem" }}
      >
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    onClick={() => window.innerWidth < 768 && closeSidebar()}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150 group cursor-pointer
                      ${active
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Need help?</p>
            <a href="https://scaledge.io" target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer">
              Contact Support
            </a>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
            © {new Date().getFullYear()} Scaledge India Pvt. Ltd.
          </p>
        </div>
      </aside>
    </>
  );
}
