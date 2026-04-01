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
          <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardHeader />
              <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
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
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
}
