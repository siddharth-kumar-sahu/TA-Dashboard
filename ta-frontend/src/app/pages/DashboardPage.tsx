import { KPICards } from "../components/KPICards";
import { HiringFunnel } from "../components/HiringFunnel";
import { CandidateStatusChart } from "../components/CandidateStatusChart";
import { HiringTrendChart } from "../components/HiringTrendChart";
import { RecruiterPerformance } from "../components/RecruiterPerformance";
import { BottleneckAnalysis } from "../components/BottleneckAnalysis";
import { RecentActivity } from "../components/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Section 1: KPI Cards */}
      <KPICards />

      {/* Section 2: Two-column layout - Funnel and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HiringFunnel />
        <CandidateStatusChart />
      </div>

      {/* Section 3: Hiring Trend Chart */}
      <HiringTrendChart />

      {/* Section 4: Two-column layout - Performance and Bottleneck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecruiterPerformance />
        <BottleneckAnalysis />
      </div>

      {/* Section 5: Recent Activity Table */}
      <RecentActivity />
    </div>
  );
}