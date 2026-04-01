import { useEffect, useState } from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

type Row = {
  transition: string;
  count: number;
  sla: number;
  status: string;
  type: "success" | "error";
  progress: number;
};

export function BottleneckAnalysis() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then((res) => res.json())
      .then((candidates) => {
        const stageCounts: Record<string, number> = {};
        candidates.forEach((c: any) => {
          stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
        });

        const transitions = [
          { key: "screened", label: "Sourced → Screened", sla: 3 },
          { key: "interview_scheduled", label: "Screened → Interview Scheduled", sla: 5 },
          { key: "interviewed", label: "Interview Scheduled → Interviewed", sla: 5 },
          { key: "offer_sent", label: "Interviewed → Offer Sent", sla: 4 },
          { key: "hired", label: "Offer Sent → Hired", sla: 7 },
        ];

        const computed = transitions.map((t) => {
          const pending = stageCounts[t.key] || 0;
          const delayed = pending > t.sla * 10; // heuristic threshold

          return {
            transition: t.label,
            count: pending,
            sla: t.sla,
            status: delayed ? "Bottleneck" : "On Track",
            type: (delayed ? "error" : "success") as "error" | "success",
            progress: Math.min(100, Math.round((pending / 50) * 100)),
          };
        });

        setRows(computed);
      });
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
      <h2 className="text-slate-900 dark:text-slate-100 font-semibold mb-6">
        Bottleneck & Stage Congestion
      </h2>

      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 pb-3 border-b">
        <div className="col-span-5">Stage Transition</div>
        <div className="col-span-2">Pending</div>
        <div className="col-span-2">SLA</div>
        <div className="col-span-3">Status</div>
      </div>

      <div className="divide-y">
        {rows.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 py-4 items-center">
            <div className="col-span-5">
              <div className="font-medium">{item.transition}</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    item.type === "success" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{item.count}</span>
            </div>

            <div className="col-span-2 text-slate-600">{item.sla} days</div>

            <div className="col-span-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  item.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {item.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
