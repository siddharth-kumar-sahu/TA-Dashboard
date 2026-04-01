// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Legend,
//   Tooltip,
// } from "recharts";
// import { useState } from "react";
// import { Maximize2 } from "lucide-react";
// import { ChartModal } from "./ChartModal";

// const statusData = [
//   { name: "In Progress", value: 186, color: "#3b82f6" },
//   { name: "Hired", value: 18, color: "#10b981" },
//   { name: "Rejected", value: 112, color: "#ef4444" },
//   { name: "On Hold", value: 26, color: "#f59e0b" },
// ];

// const totalCandidates = statusData.reduce(
//   (sum, item) => sum + item.value,
//   0,
// );

// export function CandidateStatusChart() {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const ChartContent = ({
//     height = 300,
//   }: {
//     height?: number;
//   }) => (
//     <ResponsiveContainer width="100%" height={height}>
//       <PieChart>
//         <Pie
//           data={statusData}
//           cx="50%"
//           cy="50%"
//           innerRadius={height * 0.2}
//           outerRadius={height * 0.32}
//           paddingAngle={4}
//           dataKey="value"
//         >
//           {statusData.map((entry, index) => (
//             <Cell
//               key={`cell-${index}`}
//               fill={entry.color}
//               className="hover:opacity-80 transition-opacity cursor-pointer"
//             />
//           ))}
//         </Pie>
//         <Tooltip
//           contentStyle={{
//             backgroundColor: "#1e293b",
//             border: "none",
//             borderRadius: "8px",
//             //color: '#fff',
//             padding: "12px",
//             boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
//           }}
//           labelStyle={{
//             color: "#e5e7eb", // stage name
//             fontWeight: 500,
//           }}
//           itemStyle={{
//             color: "#C9CBD4", // count text
//           }}
//           formatter={(value: number, name: string) => {
//             const percentage = (
//               (value / totalCandidates) *
//               100
//             ).toFixed(1);
//             return [
//               <div
//                 key="content"
//                 className="flex flex-col gap-1"
//               >
//                 <div className="font-semibold">{name}</div>
//                 <div className="text-sm opacity-90 font-bold">
//                   Count:{" "}
//                   <span className="font-semibold">{value}</span>
//                 </div>
//                 <div className="text-sm opacity-80">
//                   {percentage}% of total
//                 </div>
//               </div>,
//             ];
//           }}
//         />
//         <Legend
//           verticalAlign="bottom"
//           height={36}
//           formatter={(value, entry: any) => (
//             <span className="text-slate-700 dark:text-slate-300">{`${value}: ${entry.payload.value}`}</span>
//           )}
//         />
//         <text
//           x="50%"
//           y="50%"
//           textAnchor="middle"
//           dominantBaseline="middle"
//         >
//           <tspan
//             x="50%"
//             dy="-0.5em"
//             className="text-4xl font-bold fill-slate-900 dark:fill-slate-100"
//           >
//             {totalCandidates}
//           </tspan>
//           <tspan
//             x="50%"
//             dy="1.5em"
//             className="text-sm fill-slate-500 dark:fill-slate-400"
//           >
//             Total
//           </tspan>
//         </text>
//       </PieChart>
//     </ResponsiveContainer>
//   );

//   return (
//     <>
//       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-xl transition-all duration-200">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-slate-900 dark:text-slate-100 font-semibold">
//             Candidate Status Distribution
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
//         title="Candidate Status Distribution"
//       >
//         <ChartContent height={500} />
//       </ChartModal>
//     </>
//   );
// }

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";

export function CandidateStatusChart() {
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then(res => res.json())
      .then(data => {
        const counts = data.reduce((acc: any, c: any) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {});

        setStatusData([
          { name: "In Progress", value: counts["in_progress"] || 0, color: "#3b82f6" },
          { name: "Hired", value: counts["hired"] || 0, color: "#10b981" },
          { name: "Rejected", value: counts["rejected"] || 0, color: "#ef4444" },
          { name: "On Hold", value: counts["on_hold"] || 0, color: "#f59e0b" },
          { name: "Offer Pending", value: counts["offer_pending"] || 0, color: "#a855f7" },
          { name: "Offer Sent", value: counts["offer_sent"] || 0, color: "#0ea5e9" },
        ]);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="font-semibold mb-4">Candidate Status Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={statusData} dataKey="value" outerRadius={100}>
            {statusData.map((e, i) => (
              <Cell key={i} fill={e.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
