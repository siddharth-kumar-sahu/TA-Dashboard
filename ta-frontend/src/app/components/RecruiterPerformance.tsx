import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { ChartModal } from "./ChartModal";

type RecruiterRow = {
  name: string;
  candidates: number;
  hires: number;
};

export function RecruiterPerformance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruiterData, setRecruiterData] = useState<RecruiterRow[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then((res) => res.json())
      .then((candidates) => {
        const grouped: Record<string, RecruiterRow> = {};

        candidates.forEach((c: any) => {
          const recruiter = c.recruiter || "Unknown";

          if (!grouped[recruiter]) {
            grouped[recruiter] = {
              name: recruiter,
              candidates: 0,
              hires: 0,
            };
          }

          grouped[recruiter].candidates += 1;

          if (c.status === "hired") {
            grouped[recruiter].hires += 1;
          }
        });

        setRecruiterData(Object.values(grouped));
      });
  }, []);

  const ChartContent = ({ height = 300 }: { height?: number }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={recruiterData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          className="dark:stroke-slate-700"
        />

        <XAxis
          dataKey="name"
          stroke="#64748b"
          className="dark:stroke-slate-400"
          angle={-30}
          textAnchor="end"
          height={80}
          style={{ fontSize: "11px" }}
        />

        <YAxis
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
            color: "#fff",
            padding: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
          formatter={(value: number, name: string) => [
            <div key="content" className="flex items-center gap-2">
              <span className="font-bold text-lg">{value}</span>
              <span className="text-sm opacity-80">
                {name === "candidates"
                  ? "Candidates Handled"
                  : "Hires Completed"}
              </span>
            </div>,
          ]}
        />

        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value) => (
            <span className="text-slate-700 dark:text-slate-300 capitalize">
              {value === "candidates"
                ? "Candidates Handled"
                : "Hires Completed"}
            </span>
          )}
        />

        <Bar
          dataKey="candidates"
          fill="#6366f1"
          radius={[8, 8, 0, 0]}
          name="candidates"
          className="hover:opacity-80 transition-opacity"
        />

        <Bar
          dataKey="hires"
          fill="#10b981"
          radius={[8, 8, 0, 0]}
          name="hires"
          className="hover:opacity-80 transition-opacity"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-slate-100 font-semibold">
            Recruiter Performance
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
        title="Recruiter Performance"
      >
        <ChartContent height={500} />
      </ChartModal>
    </>
  );
}
