import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, MapPin, Briefcase,
  Clock, User, Building2, Calendar,
  CheckCircle2, AlertCircle, CircleDot, Pencil, X,
} from "lucide-react";

interface Interview {
  _id?: string;
  round: string;
  panelist: string;
  scheduledDate: string;
  feedback?: string;
  status: string;
}

interface Job { _id: string; title: string; }

interface Candidate {
  _id: string; name: string; phone: string; email: string;
  primarySkill: string; secondarySkills: string[];
  totalExperienceYears: number; currentCompany: string;
  currentLocation: string; preferredLocation: string[];
  currentCTC: number; expectedCTC: string; noticePeriodDays: number;
  source: string; recruiter: string; client: string;
  status: string; stage: string; jobId?: Job;
  applicationDate: string; interviews: Interview[];
}

const STATUS_COLORS: Record<string, string> = {
  in_progress:   "bg-blue-100 text-blue-700 border-blue-200",
  hired:         "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_hold:       "bg-amber-100 text-amber-700 border-amber-200",
  offer_sent:    "bg-purple-100 text-purple-700 border-purple-200",
  offer_pending: "bg-sky-100 text-sky-700 border-sky-200",
  rejected:      "bg-rose-100 text-rose-700 border-rose-200",
};

const STAGE_COLORS: Record<string, string> = {
  sourced:             "bg-slate-100 text-slate-600 border-slate-200",
  screened:            "bg-indigo-100 text-indigo-700 border-indigo-200",
  interview_scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  interviewed:         "bg-cyan-100 text-cyan-700 border-cyan-200",
  offer_sent:          "bg-purple-100 text-purple-700 border-purple-200",
  offer_pending:       "bg-sky-100 text-sky-700 border-sky-200",
  hired:               "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:            "bg-rose-100 text-rose-700 border-rose-200",
};

const INTERVIEW_STATUS_CONFIG: Record<string, { icon: React.ReactElement; color: string }> = {
  scheduled: { icon: <CircleDot className="w-3.5 h-3.5" />,    color: "text-blue-500 bg-blue-50 border-blue-200" },
  completed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  rejected:  { icon: <AlertCircle className="w-3.5 h-3.5" />,  color: "text-rose-500 bg-rose-50 border-rose-200" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all bg-white";
const labelCls = "block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide";

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editStatus, setEditStatus] = useState("");
  const [editStage, setEditStage] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ round: "L1", panelist: "", interviewDate: "", interviewTime: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCandidate(); }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/candidates/${id}`);
    const data = await res.json();
    setCandidate(data);
    setEditStatus(data.status);
    setEditStage(data.stage);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!candidate) return;
    setSaving(true);
    const body: any = { status: editStatus, stage: editStage };
    if (showInterviewForm && interviewForm.panelist && interviewForm.interviewDate && interviewForm.interviewTime) {
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

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading profile...</div>
  );

  if (!candidate) return (
    <div className="flex items-center justify-center h-64 text-rose-500 text-sm">Candidate not found.</div>
  );

  return (
    <div className="space-y-5">

      {/* ── BACK ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/candidates")}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </button>

      {/* ── HERO BANNER ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: "#574CFC" }}
        >
          {getInitials(candidate.name)}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900">{candidate.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {candidate.primarySkill} &middot; {candidate.totalExperienceYears} yrs &middot; {candidate.currentCompany}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${STATUS_COLORS[candidate.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {candidate.status.replace(/_/g, " ")}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${STAGE_COLORS[candidate.stage] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {candidate.stage.replace(/_/g, " ")}
            </span>
            {candidate.client && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {candidate.client}
              </span>
            )}
            {candidate.source && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                via {candidate.source}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-400">Applied on</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">
            {new Date(candidate.applicationDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── 3-COLUMN GRID ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Col 1-2: info cards in 2x2 */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">

          <InfoCard title="Contact & Location">
            <InfoRow icon={<Phone className="w-4 h-4" />}   label="Phone"              value={candidate.phone} />
            <InfoRow icon={<Mail className="w-4 h-4" />}    label="Email"              value={candidate.email} />
            <InfoRow icon={<MapPin className="w-4 h-4" />}  label="Current Location"   value={candidate.currentLocation} />
            <InfoRow icon={<MapPin className="w-4 h-4" />}  label="Preferred Location" value={candidate.preferredLocation?.join(", ") || "—"} />
          </InfoCard>

          <InfoCard title="Professional">
            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Primary Skill"    value={candidate.primarySkill} />
            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Secondary Skills" value={candidate.secondarySkills?.join(", ") || "—"} />
            <InfoRow icon={<Building2 className="w-4 h-4" />} label="Current Company"  value={candidate.currentCompany} />
            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Job Applied"      value={candidate.jobId?.title || "—"} />
          </InfoCard>

          <InfoCard title="Compensation">
            <InfoRow icon={<User className="w-4 h-4" />}  label="Current CTC"   value={`${candidate.currentCTC} LPA`} />
            <InfoRow icon={<User className="w-4 h-4" />}  label="Expected CTC"  value={candidate.expectedCTC || "—"} />
            <InfoRow icon={<Clock className="w-4 h-4" />} label="Notice Period" value={`${candidate.noticePeriodDays} days`} />
          </InfoCard>

          <InfoCard title="Assignment">
            <InfoRow icon={<User className="w-4 h-4" />}      label="Recruiter" value={candidate.recruiter || "—"} />
            <InfoRow icon={<Building2 className="w-4 h-4" />} label="Client"    value={candidate.client || "—"} />
            <InfoRow icon={<User className="w-4 h-4" />}      label="Source"    value={candidate.source || "—"} />
          </InfoCard>

        </div>

        {/* Col 3: Interviews + Update */}
        <div className="xl:col-span-1 flex flex-col gap-5">

          {/* Interview Rounds */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
              Interview Rounds
            </h2>

            {candidate.interviews?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="w-7 h-7 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No interviews scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {candidate.interviews.map((iv, idx) => {
                  const cfg = INTERVIEW_STATUS_CONFIG[iv.status] || INTERVIEW_STATUS_CONFIG["scheduled"];
                  return (
                    <div key={idx} className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {iv.round}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                          {cfg.icon}
                          {iv.status}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="text-slate-400">Panelist:</span> {iv.panelist || "—"}
                        </p>
                        {iv.scheduledDate && (
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {new Date(iv.scheduledDate).toLocaleString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        )}
                        {iv.feedback && (
                          <p className="text-xs text-slate-400 mt-1 italic">"{iv.feedback}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Update Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Pencil className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Status</label>
                <select value={editStatus}
                  onChange={(e) => { setEditStatus(e.target.value); setIsDirty(true); }}
                  className={inputCls}>
                  <option value="in_progress">In Progress</option>
                  <option value="hired">Hired</option>
                  <option value="on_hold">On Hold</option>
                  <option value="offer_sent">Offer Sent</option>
                  <option value="offer_pending">Offer Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Stage</label>
                <select value={editStage}
                  onChange={(e) => { setEditStage(e.target.value); setIsDirty(true); }}
                  className={inputCls}>
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

              {!showInterviewForm ? (
                <button
                  onClick={() => { setShowInterviewForm(true); setIsDirty(true); }}
                  className="w-full py-2 text-xs font-medium text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  + Add Interview Round
                </button>
              ) : (
                <div className="border border-dashed border-indigo-200 rounded-xl p-3 bg-indigo-50/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">New Interview Round</p>
                    <button onClick={() => setShowInterviewForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Round</label>
                      <select value={interviewForm.round}
                        onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
                        className={inputCls}>
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                        <option value="L3">L3</option>
                        <option value="L4">L4</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Panelist</label>
                      <input placeholder="Name" value={interviewForm.panelist}
                        onChange={(e) => setInterviewForm({ ...interviewForm, panelist: e.target.value })}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" value={interviewForm.interviewDate}
                        onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Time</label>
                      <input type="time" value={interviewForm.interviewTime}
                        onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })}
                        className={inputCls} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isDirty && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={handleCancel}
                  className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-600">
                  Cancel
                </button>
                <button onClick={handleApply} disabled={saving}
                  className="flex-1 py-2 text-sm text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-60 font-medium"
                  style={{ backgroundColor: "#574CFC" }}>
                  {saving ? "Saving..." : "Apply"}
                </button>
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