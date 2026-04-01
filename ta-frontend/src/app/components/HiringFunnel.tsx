import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { ChartModal } from "./ChartModal";

const STAGE_CONFIG = [
  { key: "sourced", label: "Sourced", color: "#6366f1" },
  { key: "screened", label: "Screened", color: "#8b5cf6" },
  {
    key: "interview_scheduled",
    label: "Interview Scheduled",
    color: "#3b82f6",
  },
  { key: "interviewed", label: "Interviewed", color: "#06b6d4" },
  { key: "offer_sent", label: "Offer Sent", color: "#f59e0b" },
  { key: "hired", label: "Hired", color: "#10b981" },
];

export function HiringFunnel() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then((res) => res.json())
      .then((candidates) => {
        const result = STAGE_CONFIG.map((stage) => ({
          stage: stage.label,
          count: candidates.filter(
            (c: any) => c.stage === stage.key,
          ).length,
          color: stage.color,
        }));
        setData(result);
      })
      .catch((err) => console.error("Funnel fetch error:", err));
  }, []);

  const ChartContent = ({ height = 300 }: { height?: number }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          className="dark:stroke-slate-700"
        />
        <XAxis
          type="number"
          stroke="#64748b"
          className="dark:stroke-slate-400"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          dataKey="stage"
          type="category"
          width={60}   // 👈 FIX: prevents label clipping
          stroke="#64748b"
          className="dark:stroke-slate-400"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9", opacity: 0.3 }}
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
          labelStyle={{ color: "#e5e7eb", fontWeight: 500 }}
          itemStyle={{ color: "#C9CBD4" }}
          formatter={(value: number) => [
            <span className="font-bold">{value}</span>,
            "Candidates",
          ]}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold">
            Hiring Pipeline Funnel
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <ChartContent />
      </div>

      <ChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Hiring Pipeline Funnel"
      >
        <ChartContent height={500} />
      </ChartModal>
    </>
  );
}
