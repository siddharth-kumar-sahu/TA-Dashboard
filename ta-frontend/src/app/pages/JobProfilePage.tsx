import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Briefcase, MapPin, Building2,
  Users, Star, Clock, FileText, Pencil,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  department: string;
  jobDescription: string;
  location: string;
  primarySkill: string;
  secondarySkills: string[];
  preferredQualifications: string[];
  client: string;
  experienceRange: { min: number; max: number };
  numberOfOpenings: number;
  status: string;
  priority: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  open:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  closed:  "bg-rose-100 text-rose-700 border-rose-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high:   "bg-rose-100 text-rose-700 border-rose-200",
};

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all bg-white";
const labelCls = "block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide";

export default function JobProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchJob(); }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/jobs/${id}`);
    const data = await res.json();
    setJob(data);
    setEditStatus(data.status);
    setEditPriority(data.priority);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!job) return;
    setSaving(true);
    const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, priority: editPriority }),
    });
    const updated = await res.json();
    setJob(updated);
    setEditStatus(updated.status);
    setEditPriority(updated.priority);
    setIsDirty(false);
    setSaving(false);
  };

  const handleCancel = () => {
    if (!job) return;
    setEditStatus(job.status);
    setEditPriority(job.priority);
    setIsDirty(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading job details...</div>
  );
  if (!job) return (
    <div className="flex items-center justify-center h-64 text-rose-500 text-sm">Job not found.</div>
  );

  return (
    <div className="space-y-5">

      {/* ── BACK ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/jobs")}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: "#574CFC" }}
        >
          <Briefcase className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900">{job.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {job.department} &middot; {job.client} &middot; {job.location}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${STATUS_COLORS[job.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {job.status.replace(/_/g, " ")}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${PRIORITY_COLORS[job.priority] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {job.priority} priority
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
              {job.numberOfOpenings} opening{job.numberOfOpenings !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-400">Posted on</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">
            {new Date(job.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── 3-COLUMN GRID ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left 2 cols: info cards */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Job Info */}
          <InfoCard title="Job Info">
            <InfoRow icon={<Building2 className="w-4 h-4" />}  label="Client"      value={job.client || "—"} />
            <InfoRow icon={<MapPin className="w-4 h-4" />}     label="Location"    value={job.location || "—"} />
            <InfoRow icon={<Briefcase className="w-4 h-4" />}  label="Department"  value={job.department || "—"} />
            <InfoRow icon={<Users className="w-4 h-4" />}      label="Openings"    value={String(job.numberOfOpenings || "—")} />
          </InfoCard>

          {/* Skills */}
          <InfoCard title="Skills">
            <InfoRow icon={<Star className="w-4 h-4" />}      label="Primary Skill"    value={job.primarySkill || "—"} />
            <InfoRow icon={<Star className="w-4 h-4" />}      label="Secondary Skills" value={job.secondarySkills?.join(", ") || "—"} />
            <InfoRow icon={<Clock className="w-4 h-4" />}     label="Experience"       value={`${job.experienceRange?.min} – ${job.experienceRange?.max} yrs`} />
            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Qualifications"   value={job.preferredQualifications?.join(", ") || "—"} />
          </InfoCard>

          {/* Job Description - full width */}
          <div className="md:col-span-2">
            <InfoCard title="Job Description">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-slate-300 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {job.jobDescription || "No description provided."}
                </p>
              </div>
            </InfoCard>
          </div>

        </div>

        {/* Right col: update panel */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Pencil className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Job</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => { setEditStatus(e.target.value); setIsDirty(true); }}
                  className={inputCls}
                >
                  <option value="open">Open</option>
                  <option value="on_hold">On Hold</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => { setEditPriority(e.target.value); setIsDirty(true); }}
                  className={inputCls}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {isDirty && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={saving}
                  className="flex-1 py-2 text-sm text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-60 font-medium"
                  style={{ backgroundColor: "#574CFC" }}
                >
                  {saving ? "Saving..." : "Apply"}
                </button>
              </div>
            )}

            {/* Current values display */}
            {!isDirty && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${STATUS_COLORS[job.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {job.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current Priority</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${PRIORITY_COLORS[job.priority] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {job.priority}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-300 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}