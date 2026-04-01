// import {
//   TrendingUp,
//   TrendingDown,
//   Briefcase,
//   Users,
//   CheckCircle,
//   Clock,
//   Calendar,
// } from "lucide-react";

// const kpiData = [
//   {
//     label: "Open Positions",
//     value: 18,
//     trend: 12,
//     isPositive: true,
//     border: "border-l-indigo-500",
//     icon: Briefcase,
//   },
//   {
//     label: "Total Candidates",
//     value: 245,
//     trend: 8,
//     isPositive: true,
//     border: "border-l-blue-500",
//     icon: Users,
//   },
//   {
//     label: "Hires Completed",
//     value: 24,
//     trend: 15,
//     isPositive: true,
//     border: "border-l-emerald-500",
//     icon: CheckCircle,
//   },
//   {
//     label: "Offers Pending",
//     value: 8,
//     trend: -5,
//     isPositive: false,
//     border: "border-l-amber-500",
//     icon: Clock,
//   },
//   {
//     label: "Avg. Time to Hire",
//     value: "23 Days",
//     trend: -8,
//     isPositive: true,
//     border: "border-l-sky-500",
//     icon: Calendar,
//   },
// ];

// export function KPICards() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
//       {kpiData.map((kpi) => {
//         const Icon = kpi.icon;

//         return (
//           <div
//             key={kpi.label}
//             className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${kpi.border} border-l-4 rounded-lg p-5 hover:shadow-md transition`}
//           >
//             {/* Top Row */}
//             <div className="flex items-start justify-between mb-3">
//               <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
//                 {kpi.label}
//               </div>

//               <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-700">
//                 <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
//               </div>
//             </div>

//             {/* Value */}
//             <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
//               {kpi.value}
//             </div>

//             {/* Trend */}
//             <div
//               className={`flex items-center gap-1 text-sm font-medium ${
//                 kpi.isPositive
//                   ? "text-emerald-600 dark:text-emerald-400"
//                   : "text-rose-600 dark:text-rose-400"
//               }`}
//             >
//               {kpi.isPositive ? (
//                 <TrendingUp className="w-4 h-4" />
//               ) : (
//                 <TrendingDown className="w-4 h-4" />
//               )}
//               <span>{Math.abs(kpi.trend)}%</span>
//               <span className="text-slate-500 dark:text-slate-400 font-normal">
//                 {kpi.isPositive
//                   ? "Improved"
//                   : "Needs attention"}
//               </span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";

export function KPICards() {
  const [kpis, setKpis] = useState({
    openPositions: 0,
    totalCandidates: 0,
    hiresCompleted: 0,
    offersPending: 0,
    avgTimeToHire: "—",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [cRes, jRes] = await Promise.all([
        fetch("http://localhost:5000/api/candidates"),
        fetch("http://localhost:5000/api/jobs"),
      ]);
      const candidates = await cRes.json();
      const jobs = await jRes.json();

      const hired = candidates.filter((c: any) => c.status === "hired").length;
      const offerPending = candidates.filter((c: any) => c.status === "offer_pending").length;

      setKpis({
        openPositions: jobs.filter((j: any) => j.status === "open").length,
        totalCandidates: candidates.length,
        hiresCompleted: hired,
        offersPending: offerPending,
        avgTimeToHire: "23 Days", // keep static for now (needs date diff logic)
      });
    };

    fetchData();
  }, []);

  const kpiData = [
    { label: "Open Positions", value: kpis.openPositions, isPositive: true, border: "border-l-indigo-500", icon: Briefcase },
    { label: "Total Candidates", value: kpis.totalCandidates, isPositive: true, border: "border-l-blue-500", icon: Users },
    { label: "Hires Completed", value: kpis.hiresCompleted, isPositive: true, border: "border-l-emerald-500", icon: CheckCircle },
    { label: "Offers Pending", value: kpis.offersPending, isPositive: false, border: "border-l-amber-500", icon: Clock },
    { label: "Avg. Time to Hire", value: kpis.avgTimeToHire, isPositive: true, border: "border-l-sky-500", icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className={`bg-white border ${kpi.border} border-l-4 rounded-lg p-5`}>
            <div className="flex justify-between mb-2">
              <div className="text-sm">{kpi.label}</div>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold">{kpi.value}</div>
          </div>
        );
      })}
    </div>
  );
}
