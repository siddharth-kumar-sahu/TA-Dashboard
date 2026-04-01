// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
// } from "recharts";
// import { useState } from "react";
// import { Maximize2 } from "lucide-react";
// import { ChartModal } from "./ChartModal";

// const trendData = [
//   { month: "Jan", candidates: 42, hires: 3 },
//   { month: "Feb", candidates: 58, hires: 4 },
//   { month: "Mar", candidates: 67, hires: 5 },
//   { month: "Apr", candidates: 71, hires: 4 },
//   { month: "May", candidates: 84, hires: 6 },
//   { month: "Jun", candidates: 92, hires: 7 },
//   { month: "Jul", candidates: 88, hires: 6 },
//   { month: "Aug", candidates: 95, hires: 8 },
//   { month: "Sep", candidates: 103, hires: 9 },
//   { month: "Oct", candidates: 112, hires: 10 },
//   { month: "Nov", candidates: 98, hires: 8 },
//   { month: "Dec", candidates: 86, hires: 7 },
// ];

// export function HiringTrendChart() {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const ChartContent = ({
//     height = 300,
//   }: {
//     height?: number;
//   }) => (
//     <ResponsiveContainer width="100%" height={height}>
//       <LineChart data={trendData}>
//         <defs>
//           <linearGradient
//             id="colorCandidates"
//             x1="0"
//             y1="0"
//             x2="0"
//             y2="1"
//           >
//             <stop
//               offset="5%"
//               stopColor="#6366f1"
//               stopOpacity={0.1}
//             />
//             <stop
//               offset="95%"
//               stopColor="#6366f1"
//               stopOpacity={0}
//             />
//           </linearGradient>
//           <linearGradient
//             id="colorHires"
//             x1="0"
//             y1="0"
//             x2="0"
//             y2="1"
//           >
//             <stop
//               offset="5%"
//               stopColor="#10b981"
//               stopOpacity={0.1}
//             />
//             <stop
//               offset="95%"
//               stopColor="#10b981"
//               stopOpacity={0}
//             />
//           </linearGradient>
//         </defs>
//         <CartesianGrid
//           strokeDasharray="3 3"
//           stroke="#e2e8f0"
//           className="dark:stroke-slate-700"
//         />
//         <XAxis
//           dataKey="month"
//           stroke="#64748b"
//           className="dark:stroke-slate-400"
//           style={{ fontSize: "12px" }}
//         />
//         <YAxis
//           stroke="#64748b"
//           className="dark:stroke-slate-400"
//           style={{ fontSize: "12px" }}
//         />
//         <Tooltip
//           cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
//           contentStyle={{
//             backgroundColor: "#1e293b",
//             border: "none",
//             borderRadius: "8px",
//             color: "#fff",
//             padding: "12px",
//             boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
//           }}
//           formatter={(
//             value: number,
//             _name: string,
//             props: any,
//           ) => {
//             const label =
//               props.dataKey === "candidates"
//                 ? "Candidates"
//                 : "Hires";

//             return [
//               <div
//                 key={props.dataKey}
//                 className="flex items-center gap-2"
//               >
//                 <span className="font-semibold">{value}</span>
//                 <span className="text-sm opacity-80">
//                   {label}
//                 </span>
//               </div>,
//             ];
//           }}
//         />

//         <Legend
//           wrapperStyle={{ paddingTop: "20px" }}
//           formatter={(value) => (
//             <span className="text-slate-700 dark:text-slate-300 capitalize">
//               {value}
//             </span>
//           )}
//         />
//         <Line
//           type="monotone"
//           dataKey="candidates"
//           stroke="#6366f1"
//           strokeWidth={3}
//           dot={{
//             fill: "#6366f1",
//             r: 4,
//             strokeWidth: 2,
//             stroke: "#fff",
//           }}
//           activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 0 }}
//           fill="url(#colorCandidates)"
//           name="Total Candidates"
//         />
//         <Line
//           type="monotone"
//           dataKey="hires"
//           stroke="#10b981"
//           strokeWidth={3}
//           dot={{
//             fill: "#10b981",
//             r: 4,
//             strokeWidth: 2,
//             stroke: "#fff",
//           }}
//           activeDot={{ r: 6, fill: "#059669", strokeWidth: 0 }}
//           fill="url(#colorHires)"
//           name="Hires Completed"
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   return (
//     <>
//       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-xl transition-all duration-200">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-slate-900 dark:text-slate-100 font-semibold">
//             Hiring Trend Over Time
//           </h2>
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
//           >
//             <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
//           </button>
//         </div>
//         <ChartContent />
//       </div>

//       <ChartModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Hiring Trend Over Time"
//       >
//         <ChartContent height={500} />
//       </ChartModal>
//     </>
//   );
// }

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

export function HiringTrendChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then(res => res.json())
      .then(candidates => {
        const grouped: any = {};
        candidates.forEach((c: any) => {
          const month = new Date(c.applicationDate).toLocaleString("default", { month: "short" });
          grouped[month] = grouped[month] || { month, candidates: 0, hires: 0 };
          grouped[month].candidates += 1;
          if (c.status === "hired") grouped[month].hires += 1;
        });
        setData(Object.values(grouped));
      });
  }, []);

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="font-semibold mb-4">Hiring Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Line type="monotone" dataKey="candidates" stroke="#6366f1" />
          <Line type="monotone" dataKey="hires" stroke="#10b981" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
