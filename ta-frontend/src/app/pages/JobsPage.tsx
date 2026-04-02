import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, X, Briefcase, Plus, CheckCircle2, AlertCircle } from "lucide-react";

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

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  open:    "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
  closed:  "bg-rose-100 text-rose-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high:   "bg-rose-100 text-rose-700",
};

const EMPTY_FORM = {
  title: "", department: "", jobDescription: "", location: "",
  primarySkill: "", secondarySkills: "", preferredQualifications: [] as string[],
  client: "", minExperience: "", maxExperience: "",
  numberOfOpenings: "", status: "open", priority: "medium",
};

type AlertModal = { type: "success" | "error"; title: string; message: string } | null;

export default function JobsPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [alertModal, setAlertModal] = useState<AlertModal>(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const res = await fetch("http://localhost:5000/api/jobs");
    const data = await res.json();
    setJobs(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, o => o.value);
    setForm({ ...form, preferredQualifications: values });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setAlertModal({ type: "error", title: "Missing Field", message: "Job title is required." });
      return;
    }
    setSubmitting(true);

    const savedTitle = form.title;

    const payload = {
      title: form.title,
      department: form.department,
      jobDescription: form.jobDescription,
      location: form.location,
      primarySkill: form.primarySkill,
      secondarySkills: form.secondarySkills.split(",").map(s => s.trim()).filter(Boolean),
      preferredQualifications: form.preferredQualifications,
      client: form.client,
      experienceRange: { min: Number(form.minExperience), max: Number(form.maxExperience) },
      numberOfOpenings: Number(form.numberOfOpenings),
      status: form.status,
      priority: form.priority,
    };

    const res = await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      setAlertModal({ type: "error", title: "Something went wrong", message: "Could not save job. Please try again." });
      return;
    }

    setOpen(false);
    setForm(EMPTY_FORM);
    fetchJobs();
    setCurrentPage(1);
    setAlertModal({
      type: "success",
      title: "Job Added",
      message: `"${savedTitle}" has been successfully added.`,
    });
  };

  const handleCloseModal = () => {
    setOpen(false);
    setForm(EMPTY_FORM);
  };

  // ── Search ────────────────────────────────────────────────
  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      j.title.toLowerCase().includes(q) ||
      j.client?.toLowerCase().includes(q) ||
      j.primarySkill?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.department?.toLowerCase().includes(q)
    );
  });

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const paginatedJobs = filteredJobs.slice(
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
    <div className="space-y-5">

      {/* ── ALERT MODAL ───────────────────────────────────── */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className={`px-6 py-5 flex flex-col items-center text-center gap-3 ${alertModal.type === "success" ? "bg-emerald-50" : "bg-rose-50"}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alertModal.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}>
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

      {/* ── HEADER ROW ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Job Postings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {searchQuery
              ? `${filteredJobs.length} results for "${searchQuery}"`
              : `${jobs.length} jobs total`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search title, client, skill..."
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

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: "#574CFC" }}
          >
            <Plus className="w-4 h-4" />
            Add Job
          </button>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-[1400px] w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                "Title", "Department", "Client", "Location",
                "Primary Skill", "Secondary Skills", "Experience",
                "Openings", "Qualifications", "Status", "Priority", "Created"
              ].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedJobs.map(j => (
              <tr key={j._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => navigate(`/jobs/${j._id}`)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 cursor-pointer transition-colors text-left"
                  >
                    {j.title}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{j.department}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{j.client}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{j.location}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-slate-800">{j.primarySkill}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {j.secondarySkills?.join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {j.experienceRange?.min} – {j.experienceRange?.max} yrs
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-center">
                  {j.numberOfOpenings}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {j.preferredQualifications?.join(", ") || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[j.status] || "bg-slate-100 text-slate-600"}`}>
                    {j.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PRIORITY_COLORS[j.priority] || "bg-slate-100 text-slate-600"}`}>
                    {j.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(j.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}

            {paginatedJobs.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-200" />
                    <p className="text-slate-400 text-sm font-medium">
                      {searchQuery ? `No results for "${searchQuery}"` : "No jobs yet."}
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
            <span className="font-semibold text-slate-700">{Math.min(currentPage * PAGE_SIZE, filteredJobs.length)}</span>
            {" of "}
            <span className="font-semibold text-slate-700">{filteredJobs.length}</span> jobs
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
                  className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    currentPage === page ? "text-white border-transparent" : "border-slate-200 text-slate-600 hover:bg-slate-50"
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

      {/* ── ADD JOB MODAL ─────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh]">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#574CFC" }}>
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add New Job Posting</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-7">

              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Job Details
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Job Title *</label><input name="title" placeholder="e.g. Senior DV Engineer" onChange={handleChange} value={form.title} className={inputCls} /></div>
                  <div><label className={labelCls}>Department</label><input name="department" placeholder="e.g. VLSI Verification" onChange={handleChange} value={form.department} className={inputCls} /></div>
                  <div><label className={labelCls}>Client</label><input name="client" placeholder="e.g. AMD, Synopsys" onChange={handleChange} value={form.client} className={inputCls} /></div>
                  <div><label className={labelCls}>Location</label><input name="location" placeholder="e.g. Bangalore" onChange={handleChange} value={form.location} className={inputCls} /></div>
                  <div className="col-span-2">
                    <label className={labelCls}>Job Description</label>
                    <textarea name="jobDescription" placeholder="Describe the role and responsibilities..." onChange={handleChange} value={form.jobDescription} className={`${inputCls} h-24 resize-none`} />
                  </div>
                </div>
              </section>

              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Skills & Experience
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Primary Skill</label><input name="primarySkill" placeholder="e.g. DV, PCIe" onChange={handleChange} value={form.primarySkill} className={inputCls} /></div>
                  <div><label className={labelCls}>Secondary Skills</label><input name="secondarySkills" placeholder="Comma separated" onChange={handleChange} value={form.secondarySkills} className={inputCls} /></div>
                  <div><label className={labelCls}>Min Experience (yrs)</label><input name="minExperience" placeholder="e.g. 3" onChange={handleChange} value={form.minExperience} className={inputCls} /></div>
                  <div><label className={labelCls}>Max Experience (yrs)</label><input name="maxExperience" placeholder="e.g. 8" onChange={handleChange} value={form.maxExperience} className={inputCls} /></div>
                </div>
              </section>

              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Openings & Qualifications
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>No. of Openings</label><input name="numberOfOpenings" placeholder="e.g. 3" onChange={handleChange} value={form.numberOfOpenings} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Preferred Qualifications</label>
                    <select multiple onChange={handleMultiSelect} className={`${inputCls} h-24`}>
                      {["BSc", "MSc", "B.Tech", "M.Tech"].map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-indigo-200 inline-block" />
                  Status & Priority
                  <span className="flex-1 h-px bg-indigo-100 inline-block" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Status</label>
                    <select name="status" onChange={handleChange} value={form.status} className={inputCls}>
                      <option value="open">Open</option>
                      <option value="on_hold">On Hold</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select name="priority" onChange={handleChange} value={form.priority} className={inputCls}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

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
                {submitting ? "Saving..." : "Save Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}