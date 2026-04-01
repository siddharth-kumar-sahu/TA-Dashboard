import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { PageLoader } from "./components/PageLoader";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CandidatesPage = lazy(() => import("./pages/CandidatesPage"));
const CandidateProfilePage = lazy(() => import("./pages/CandidateProfilePage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const RecruitersPage = lazy(() => import("./pages/RecruitersPage"));
const EmailTrackingPage = lazy(() => import("./pages/EmailTrackingPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <SidebarProvider>
          <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">

            {/* ── FULL WIDTH TOP HEADER ───────────────────── */}
            <DashboardHeader />

            {/* ── SIDEBAR + MAIN CONTENT ──────────────────── */}
            <div className="flex flex-1 overflow-hidden">
              <DashboardSidebar />
              <main className="flex-1 overflow-auto">
                <div className="p-6 lg:p-8 max-w-[1600px]">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/candidates" element={<CandidatesPage />} />
                      <Route path="/candidates/:id" element={<CandidateProfilePage />} />
                      <Route path="/jobs" element={<JobsPage />} />
                      <Route path="/recruiters" element={<RecruitersPage />} />
                      <Route path="/email-tracking" element={<EmailTrackingPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </main>
            </div>

          </div>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
}