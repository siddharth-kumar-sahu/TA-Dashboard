import { useEffect, useState } from "react";

type Activity = {
  candidate: string;
  jobRole: string;
  recruiter: string;
  lastActivity: string;
  stage: string;
  status: string;
  statusColor: string;
};

export function RecentActivity() {
  const [activityData, setActivityData] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );

        const latest = sorted.slice(0, 5).map((c: any) => ({
          candidate: c.name,
          jobRole: c.jobTitle || c.primarySkill || "N/A",
          recruiter: c.recruiter || "—",
          lastActivity: new Date(c.updatedAt || c.createdAt).toLocaleDateString(),
          stage: c.stage,
          status: c.status,
          statusColor:
            c.status === "hired"
              ? "emerald"
              : c.status === "rejected"
              ? "rose"
              : c.status === "offer_sent"
              ? "purple"
              : c.status === "on_hold"
              ? "amber"
              : "blue",
        }));

        setActivityData(latest);
      });
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-xl transition-all duration-200">
      <h2 className="text-slate-900 dark:text-slate-100 font-semibold mb-6">
        Recent Candidate Activity
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Candidate
              </th>
              <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Job / Skill
              </th>
              <th className="hidden lg:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Recruiter
              </th>
              <th className="hidden lg:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Last Activity
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Stage
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {activityData.map((activity, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
              >
                <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                  {activity.candidate}
                </td>
                <td className="py-4 px-4 hidden md:table-cell text-slate-600 dark:text-slate-400">
                  {activity.jobRole}
                </td>
                <td className="py-4 px-4 hidden lg:table-cell text-slate-600 dark:text-slate-400">
                  {activity.recruiter}
                </td>
                <td className="py-4 px-4 hidden lg:table-cell text-slate-500 dark:text-slate-400 text-sm">
                  {activity.lastActivity}
                </td>
                <td className="py-4 px-4 text-sm">{activity.stage}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        activity.statusColor === "emerald"
                          ? "bg-emerald-100 text-emerald-700"
                          : activity.statusColor === "rose"
                          ? "bg-rose-100 text-rose-700"
                          : activity.statusColor === "amber"
                          ? "bg-amber-100 text-amber-700"
                          : activity.statusColor === "purple"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
