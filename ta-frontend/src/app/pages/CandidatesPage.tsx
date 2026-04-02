import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Search,
  X, UserPlus, AlertCircle, CheckCircle2, Users
} from "lucide-react";

interface Job { _id: string; title: string; }
interface Interview { round: string; panelist: string; scheduledDate: string; status: string; }
interface Candidate {
  _id: string; name: string; phone: string; email: string;
  primarySkill: string; secondarySkills: string[];
  totalExperienceYears: number; currentCompany: string;
  currentLocation: string; preferredLocation: string[];
  currentCTC: number; expectedCTC: string; noticePeriodDays: number;
  source: string; recruiter: string; client: string;
  status: string; stage: string; jobId?: Job; interviews: Interview[];
}

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700",
  hired: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
  offer_sent: "bg-purple-100 text-purple-700",
  offer_pending: "bg-sky-100 text-sky-700",
  rejected: "bg-rose-100 text-rose-700",
};

const STAGE_COLORS: Record<string, string> = {
  sourced: "bg-slate-100 text-slate-600",
  screened: "bg-indigo-100 text-indigo-700",
  interview_scheduled: "bg-blue-100 text-blue-700",
  interviewed: "bg-cyan-100 text-cyan-700",
  offer_sent: "bg-purple-100 text-purple-700",
  offer_pending: "bg-sky-100 text-sky-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const EMPTY_FORM = {
  name: "", phone: "", email: "", primarySkill: "",
  secondarySkills: "", totalExperienceYears: "", currentCompany: "",
  currentLocation: "", preferredLocation: "", currentCTC: "",
  expectedCTC: "", noticePeriodDays: "", source: "Naukri",
  recruiter: "", client: "", jobId: "", status: "in_progress",
  stage: "sourced", round: "L1", panelist: "",
  interviewDate: "", interviewTime: "",
};

type AlertModal = { type: "success" | "error"; title: string; message: string } | null;

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [alertModal, setAlertModal] = useState<AlertModal>(null);

  useEffect(() => { fetchCandidates(); fetchJobs(); }, []);

  const fetchCandidates = async () => {
    const res = await fetch("http://localhost:5000/api/candidates");
    const data = await res.json();
    setCandidates(data);
  };

  const fetchJobs = async () => {
    const res = await fetch("http://localhost:5000/api/jobs");
    const data = await res.json();
    setJobs(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setDuplicateError("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setDuplicateError("Name, phone and email are required fields.");
      return;
    }

    setSubmitting(true);
    setDuplicateError("");

    const scheduledDate = `${form.interviewDate}T${form.interviewTime}:00`;
    const payload = {
      name: form.name, phone: form.phone, email: form.email,
      primarySkill: form.primarySkill,
      secondarySkills: form.secondarySkills.split(",").map((s) => s.trim()),
      totalExperienceYears: Number(form.totalExperienceYears),
      currentCompany: form.currentCompany, currentLocation: form.currentLocation,
      preferredLocation: form.preferredLocation.split(",").map((l) => l.trim()),
      currentCTC: Number(form.currentCTC), expectedCTC: form.expectedCTC,
      noticePeriodDays: Number(form.noticePeriodDays),
      source: form.source, recruiter: form.recruiter, client: form.client,
      jobId: form.jobId, status: form.status, stage: form.stage,
      interviews: [{ round: form.round, panelist: form.panelist, scheduledDate, status: "scheduled" }],
    };

    const res = await fetch("http://localhost:5000/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.status === 409) {
      setOpen(false);
      setForm(EMPTY_FORM);
      setAlertModal({
        type: "error",
        title: "Duplicate Candidate",
        message: data.error + (data.existing ? ` (${data.existing})` : ""),
      });
      return;
    }

    if (!res.ok) {
      setOpen(false);
      setForm(EMPTY_FORM);
      setAlertModal({
        type: "error",
        title: "Something went wrong",
        message: "Could not save candidate. Please try again.",
      });
      return;
    }

    // Success — close form, show alert modal
    setOpen(false);
    setForm(EMPTY_FORM);
    setDuplicateError("");
    fetchCandidates();
    setCurrentPage(1);
    setAlertModal({
      type: "success",
      title: "Candidate Added",
      message: `${form.name} has been successfully added to the system.`,
    });
  };

  const handleCloseModal = () => {
    setOpen(false);
    setForm(EMPTY_FORM);
    setDuplicateError("");
  };

  // ── Search ────────────────────────────────────────────────
  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) { pages.push(i); }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all placeholder-slate-400 bg-white";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide";

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">

      {/* ── ALERT MODAL (success / error popup) ───────────── */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden`}>
            <div className={`px-6 py-5 flex flex-col items-center text-center gap-3
              ${alertModal.type === "success" ? "bg-emerald-50" : "bg-rose-50"}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center
                ${alertModal.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}>
                {alertModal.type === "success"
                  ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  : <AlertCircle className="w-6 h-6 text-rose-600" />}
              </div>
              <div>
                <h4 className={`font-bold text-lg ${alertModal.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>
                  {alertModal.title}
                </h4>
                <p className={`text-sm mt-1 ${alertModal.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                  {alertModal.message}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-center bg-white">
              <button
                onClick={() => setAlertModal(null)}
                className="px-6 py-2 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#574CFC" }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER + SEARCH + BUTTON (single row) ─────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Left: title + count */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Candidates
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {searchQuery
              ? `${filteredCandidates.length} results for "${searchQuery}"`
              : `${candidates.length} candidates total`}
          </p>
        </div>

        {/* Right: search + button */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search name, phone, email..."
              className="pl-9 pr-8 py-2 w-72 border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                         bg-white placeholder-slate-400 text-slate-800 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: "#574CFC" }}
          >
            <UserPlus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-[1800px] w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                "Name", "Phone", "Email", "Skill", "Exp",
                "Company", "Location", "Source", "Job", "Recruiter",
                "Client", "Status", "Stage", "Interview",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedCandidates.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => navigate(`/candidates/${c._id}`)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 cursor-pointer transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.phone}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-slate-800">{c.primarySkill}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.totalExperienceYears} yrs</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.currentCompany}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.currentLocation}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-slate-500">{c.source || "—"}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{c.jobId?.title || "—"}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.recruiter}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.client}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600"}`}>
                    {c.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STAGE_COLORS[c.stage] || "bg-slate-100 text-slate-600"}`}>
                    {c.stage.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {c.interviews?.length
                    ? `${c.interviews[0].round} · ${new Date(c.interviews[0].scheduledDate).toLocaleDateString()}`
                    : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}

            {paginatedCandidates.length === 0 && (
              <tr>
                <td colSpan={14} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-200" />
                    <p className="text-slate-400 text-sm font-medium">
                      {searchQuery ? `No results for "${searchQuery}"` : "No candidates yet."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>
            {" – "}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * PAGE_SIZE, filteredCandidates.length)}</span>
            {" of "}
            <span className="font-semibold text-slate-700">{filteredCandidates.length}</span> candidates
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`e-${idx}`} className="px-2 py-1 text-xs text-slate-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${currentPage === page
                      ? "text-white border-transparent"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  style={currentPage === page ? { backgroundColor: "#574CFC" } : {}}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* ── ADD CANDIDATE MODAL ───────────────────────────── */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#574CFC" }}>
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add New Candidate</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-7">
              {/* Basic Info */}
              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Basic Info
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Name *</label><input name="name" placeholder="Full name" onChange={handleChange} value={form.name} className={inputCls} /></div>
                  <div><label className={labelCls}>Phone *</label><input name="phone" placeholder="Phone number" onChange={handleChange} value={form.phone} className={inputCls} /></div>
                  <div><label className={labelCls}>Email *</label><input name="email" placeholder="Email address" onChange={handleChange} value={form.email} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Source</label>
                    <select name="source" onChange={handleChange} value={form.source} className={inputCls}>
                      <option value="Naukri">Naukri</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Indeed">Indeed</option>
                      <option value="Company Website">Company Website</option>
                      <option value="Campus">Campus</option>
                      <option value="Internal">Internal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Skills & Experience */}
              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Skills & Experience
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Primary Skill</label><input name="primarySkill" placeholder="e.g. DV, Embedded" onChange={handleChange} value={form.primarySkill} className={inputCls} /></div>
                  <div><label className={labelCls}>Secondary Skills</label><input name="secondarySkills" placeholder="Comma separated" onChange={handleChange} value={form.secondarySkills} className={inputCls} /></div>
                  <div><label className={labelCls}>Experience (years)</label><input name="totalExperienceYears" placeholder="e.g. 5" onChange={handleChange} value={form.totalExperienceYears} className={inputCls} /></div>
                  <div><label className={labelCls}>Current Company</label><input name="currentCompany" placeholder="Company name" onChange={handleChange} value={form.currentCompany} className={inputCls} /></div>
                </div>
              </section>

              {/* Location */}
              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Location
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Current Location</label><input name="currentLocation" placeholder="City" onChange={handleChange} value={form.currentLocation} className={inputCls} /></div>
                  <div><label className={labelCls}>Preferred Location</label><input name="preferredLocation" placeholder="Comma separated" onChange={handleChange} value={form.preferredLocation} className={inputCls} /></div>
                </div>
              </section>

              {/* Compensation */}
              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Compensation
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>Current CTC (LPA)</label><input name="currentCTC" placeholder="e.g. 18" onChange={handleChange} value={form.currentCTC} className={inputCls} /></div>
                  <div><label className={labelCls}>Expected CTC</label><input name="expectedCTC" placeholder="e.g. 25 LPA" onChange={handleChange} value={form.expectedCTC} className={inputCls} /></div>
                  <div><label className={labelCls}>Notice Period (days)</label><input name="noticePeriodDays" placeholder="e.g. 60" onChange={handleChange} value={form.noticePeriodDays} className={inputCls} /></div>
                </div>
              </section>

              {/* Assignment */}
              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Assignment
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Recruiter</label><input name="recruiter" placeholder="Recruiter name" onChange={handleChange} value={form.recruiter} className={inputCls} /></div>
                  <div><label className={labelCls}>Client</label><input name="client" placeholder="Client name" onChange={handleChange} value={form.client} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Job</label>
                    <select name="jobId" onChange={handleChange} value={form.jobId} className={inputCls}>
                      <option value="">Select Job</option>
                      {jobs.map((job) => (<option key={job._id} value={job._id}>{job.title}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select name="status" onChange={handleChange} value={form.status} className={inputCls}>
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
                    <select name="stage" onChange={handleChange} value={form.stage} className={inputCls}>
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
              </section>

              {/* Interview */}
              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Initial Interview Round
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Round</label>
                    <select name="round" onChange={handleChange} value={form.round} className={inputCls}>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                      <option value="L4">L4</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Panelist</label><input name="panelist" placeholder="Panelist name" onChange={handleChange} value={form.panelist} className={inputCls} /></div>
                  <div><label className={labelCls}>Interview Date</label><input type="date" name="interviewDate" onChange={handleChange} value={form.interviewDate} className={inputCls} /></div>
                  <div><label className={labelCls}>Interview Time</label><input type="time" name="interviewTime" onChange={handleChange} value={form.interviewTime} className={inputCls} /></div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl sticky bottom-0">
              <button onClick={handleCloseModal} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white cursor-pointer transition-colors text-slate-600 font-medium">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 text-sm text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 font-medium"
                style={{ backgroundColor: "#574CFC" }}
              >
                {submitting ? "Saving..." : "Save Candidate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}