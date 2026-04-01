import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CircleDot,
} from "lucide-react";

interface Interview {
  _id?: string;
  round: string;
  panelist: string;
  scheduledDate: string;
  feedback?: string;
  status: string;
}

interface Job {
  _id: string;
  title: string;
}

interface Candidate {
  _id: string;
  name: string;
  phone: string;
  email: string;
  primarySkill: string;
  secondarySkills: string[];
  totalExperienceYears: number;
  currentCompany: string;
  currentLocation: string;
  preferredLocation: string[];
  currentCTC: number;
  expectedCTC: string;
  noticePeriodDays: number;
  source: string;
  recruiter: string;
  client: string;
  status: string;
  stage: string;
  jobId?: Job;
  applicationDate: string;
  interviews: Interview[];
}

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700",
  hired: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
  offer_sent: "bg-purple-100 text-purple-700",
  offer_pending: "bg-sky-100 text-sky-700",
  rejected: "bg-rose-100 text-rose-700",
};

const STAGE_COLORS: Record<string, string> = {
  sourced: "bg-slate-100 text-slate-700",
  screened: "bg-indigo-100 text-indigo-700",
  interview_scheduled: "bg-blue-100 text-blue-700",
  interviewed: "bg-cyan-100 text-cyan-700",
  offer_sent: "bg-purple-100 text-purple-700",
  offer_pending: "bg-sky-100 text-sky-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const INTERVIEW_STATUS_ICON: Record<string, React.ReactElement> = {
  scheduled: <CircleDot className="w-4 h-4 text-blue-500" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  rejected: <AlertCircle className="w-4 h-4 text-rose-500" />,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editStatus, setEditStatus] = useState("");
  const [editStage, setEditStage] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Add interview round state
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    round: "L1",
    panelist: "",
    interviewDate: "",
    interviewTime: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/candidates/${id}`);
    const data = await res.json();
    setCandidate(data);
    setEditStatus(data.status);
    setEditStage(data.stage);
    setLoading(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditStatus(e.target.value);
    setIsDirty(true);
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditStage(e.target.value);
    setIsDirty(true);
  };

  const handleInterviewFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInterviewForm({ ...interviewForm, [e.target.name]: e.target.value });
  };

  const handleApply = async () => {
    if (!candidate) return;
    setSaving(true);

    const body: any = {
      status: editStatus,
      stage: editStage,
    };

    if (
      showInterviewForm &&
      interviewForm.panelist &&
      interviewForm.interviewDate &&
      interviewForm.interviewTime
    ) {
      body.newInterview = {
        round: interviewForm.round,
        panelist: interviewForm.panelist,
        scheduledDate: `${interviewForm.interviewDate}T${interviewForm.interviewTime}:00`,
        status: "scheduled",
      };
    }

    const res = await fetch(`http://localhost:5000/api/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const updated = await res.json();
    setCandidate(updated);
    setEditStatus(updated.status);
    setEditStage(updated.stage);
    setIsDirty(false);
    setShowInterviewForm(false);
    setInterviewForm({ round: "L1", panelist: "", interviewDate: "", interviewTime: "" });
    setSaving(false);
  };

  const handleCancel = () => {
    if (!candidate) return;
    setEditStatus(candidate.status);
    setEditStage(candidate.stage);
    setIsDirty(false);
    setShowInterviewForm(false);
    setInterviewForm({ round: "L1", panelist: "", interviewDate: "", interviewTime: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading candidate profile...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-500">
        Candidate not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/candidates")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </button>

      {/* ── HERO CARD ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: "#574CFC" }}
        >
          {getInitials(candidate.name)}
        </div>

        {/* Name + badges */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{candidate.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {candidate.primarySkill} · {candidate.totalExperienceYears} yrs · {candidate.currentCompany}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[candidate.status] || "bg-slate-100 text-slate-600"}`}>
              {candidate.status.replace(/_/g, " ")}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STAGE_COLORS[candidate.stage] || "bg-slate-100 text-slate-600"}`}>
              {candidate.stage.replace(/_/g, " ")}
            </span>
            {candidate.client && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {candidate.client}
              </span>
            )}
          </div>
        </div>

        {/* Application date */}
        <div className="text-right text-xs text-slate-400 flex-shrink-0">
          <p>Applied</p>
          <p className="font-medium text-slate-600 mt-0.5">
            {new Date(candidate.applicationDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── INFO GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Contact & Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Contact & Location</h2>
          <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={candidate.phone} />
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={candidate.email} />
          <InfoRow icon={<MapPin className="w-4 h-4" />} label="Current Location" value={candidate.currentLocation} />
          <InfoRow
            icon={<MapPin className="w-4 h-4" />}
            label="Preferred Location"
            value={candidate.preferredLocation?.join(", ") || "—"}
          />
        </div>

        {/* Professional */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Professional</h2>
          <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Primary Skill" value={candidate.primarySkill} />
          <InfoRow
            icon={<Briefcase className="w-4 h-4" />}
            label="Secondary Skills"
            value={candidate.secondarySkills?.join(", ") || "—"}
          />
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Current Company" value={candidate.currentCompany} />
          <InfoRow
            icon={<Briefcase className="w-4 h-4" />}
            label="Job Applied"
            value={candidate.jobId?.title || "—"}
          />
        </div>

        {/* Compensation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Compensation</h2>
          <InfoRow icon={<User className="w-4 h-4" />} label="Current CTC" value={`${candidate.currentCTC} LPA`} />
          <InfoRow icon={<User className="w-4 h-4" />} label="Expected CTC" value={candidate.expectedCTC || "—"} />
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Notice Period" value={`${candidate.noticePeriodDays} days`} />
          <InfoRow icon={<User className="w-4 h-4" />} label="Source" value={candidate.source || "—"} />
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Assignment</h2>
          <InfoRow icon={<User className="w-4 h-4" />} label="Recruiter" value={candidate.recruiter || "—"} />
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Client" value={candidate.client || "—"} />
        </div>
      </div>

      {/* ── INTERVIEWS ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Interview Rounds
        </h2>

        {candidate.interviews?.length === 0 ? (
          <p className="text-slate-400 text-sm">No interview rounds scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {candidate.interviews.map((iv, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50"
              >
                <div className="mt-0.5">
                  {INTERVIEW_STATUS_ICON[iv.status] || <CircleDot className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{iv.round}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 capitalize">
                      {iv.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Panelist: <span className="font-medium">{iv.panelist || "—"}</span>
                  </p>
                  {iv.scheduledDate && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(iv.scheduledDate).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  )}
                  {iv.feedback && (
                    <p className="text-xs text-slate-500 mt-1 italic">"{iv.feedback}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── EDIT PANEL ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Update Candidate
        </h2>

        {/* Status + Stage dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
            <select
              value={editStatus}
              onChange={handleStatusChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="in_progress">In Progress</option>
              <option value="hired">Hired</option>
              <option value="on_hold">On Hold</option>
              <option value="offer_sent">Offer Sent</option>
              <option value="offer_pending">Offer Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Stage</label>
            <select
              value={editStage}
              onChange={handleStageChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="sourced">Sourced</option>
              <option value="screened">Screened</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interviewed">Interviewed</option>
              <option value="offer_sent">Offer Sent</option>
              <option value="offer_pending">Offer Pending</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Add Interview Round toggle */}
        {!showInterviewForm ? (
          <button
            onClick={() => { setShowInterviewForm(true); setIsDirty(true); }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer transition-colors"
          >
            + Add Interview Round
          </button>
        ) : (
          <div className="border border-dashed border-indigo-300 rounded-xl p-4 space-y-3 bg-indigo-50/40">
            <h3 className="text-sm font-semibold text-slate-700">New Interview Round</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Round</label>
                <select
                  name="round"
                  value={interviewForm.round}
                  onChange={handleInterviewFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Panelist</label>
                <input
                  name="panelist"
                  placeholder="Panelist name"
                  value={interviewForm.panelist}
                  onChange={handleInterviewFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                <input
                  type="date"
                  name="interviewDate"
                  value={interviewForm.interviewDate}
                  onChange={handleInterviewFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Time</label>
                <input
                  type="time"
                  name="interviewTime"
                  value={interviewForm.interviewTime}
                  onChange={handleInterviewFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Apply / Cancel */}
        {isDirty && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={saving}
              className="px-5 py-2 text-sm text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#574CFC" }}
            >
              {saving ? "Saving..." : "Apply Changes"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

/* ── Reusable info row ───────────────────────────────────── */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}
