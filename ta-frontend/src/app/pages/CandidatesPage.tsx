import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

interface Job {
  _id: string;
  title: string;
}

interface Interview {
  round: string;
  panelist: string;
  scheduledDate: string;
  status: string;
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
  source: string;           // ← added back
  recruiter: string;
  client: string;
  status: string;
  stage: string;
  jobId?: Job;
  interviews: Interview[];
}

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  in_progress:   "bg-blue-100 text-blue-700",
  hired:         "bg-emerald-100 text-emerald-700",
  on_hold:       "bg-amber-100 text-amber-700",
  offer_sent:    "bg-purple-100 text-purple-700",
  offer_pending: "bg-sky-100 text-sky-700",
  rejected:      "bg-rose-100 text-rose-700",
};

const STAGE_COLORS: Record<string, string> = {
  sourced:             "bg-slate-100 text-slate-600",
  screened:            "bg-indigo-100 text-indigo-700",
  interview_scheduled: "bg-blue-100 text-blue-700",
  interviewed:         "bg-cyan-100 text-cyan-700",
  offer_sent:          "bg-purple-100 text-purple-700",
  offer_pending:       "bg-sky-100 text-sky-700",
  hired:               "bg-emerald-100 text-emerald-700",
  rejected:            "bg-rose-100 text-rose-700",
};

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    primarySkill: "",
    secondarySkills: "",
    totalExperienceYears: "",
    currentCompany: "",
    currentLocation: "",
    preferredLocation: "",
    currentCTC: "",
    expectedCTC: "",
    noticePeriodDays: "",
    source: "Naukri",        // ← added back
    recruiter: "",
    client: "",
    jobId: "",
    status: "in_progress",
    stage: "sourced",
    round: "L1",
    panelist: "",
    interviewDate: "",
    interviewTime: "",
  });

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const scheduledDate = `${form.interviewDate}T${form.interviewTime}:00`;
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      primarySkill: form.primarySkill,
      secondarySkills: form.secondarySkills.split(",").map((s) => s.trim()),
      totalExperienceYears: Number(form.totalExperienceYears),
      currentCompany: form.currentCompany,
      currentLocation: form.currentLocation,
      preferredLocation: form.preferredLocation.split(",").map((l) => l.trim()),
      currentCTC: Number(form.currentCTC),
      expectedCTC: form.expectedCTC,
      noticePeriodDays: Number(form.noticePeriodDays),
      source: form.source,   // ← added back
      recruiter: form.recruiter,
      client: form.client,
      jobId: form.jobId,
      status: form.status,
      stage: form.stage,
      interviews: [
        {
          round: form.round,
          panelist: form.panelist,
          scheduledDate,
          status: "scheduled",
        },
      ],
    };

    await fetch("http://localhost:5000/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setOpen(false);
    fetchCandidates();
    setCurrentPage(1);
  };

  // ── Live search filter ────────────────────────────────────
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
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Candidates</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {searchQuery
              ? `${filteredCandidates.length} results for "${searchQuery}"`
              : `${candidates.length} total · Page ${currentPage} of ${totalPages || 1}`}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#574CFC" }}
        >
          + Add candidate details
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, phone or email..."
            className="w-full pl-10 pr-10 py-2.5 border-2 border-indigo-200 rounded-xl text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                       bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
          />
          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
            {filteredCandidates.length} found
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-[1800px] w-full text-left text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {[
                "Name", "Phone", "Email", "Skill", "Exp",
                "Company", "Location", "Source", "Job", "Recruiter",
                "Client", "Status", "Stage", "Interview",
              ].map((h) => (
                <th key={h} className="p-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedCandidates.map((c) => (
              <tr key={c._id} className="border-t hover:bg-slate-50">
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/candidates/${c._id}`)}
                    className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 cursor-pointer transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.primarySkill}</td>
                <td className="p-3">{c.totalExperienceYears}</td>
                <td className="p-3">{c.currentCompany}</td>
                <td className="p-3">{c.currentLocation}</td>
                <td className="p-3">{c.source || "—"}</td>
                <td className="p-3">{c.jobId?.title || "—"}</td>
                <td className="p-3">{c.recruiter}</td>
                <td className="p-3">{c.client}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600"}`}>
                    {c.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${STAGE_COLORS[c.stage] || "bg-slate-100 text-slate-600"}`}>
                    {c.stage.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-3 text-xs text-slate-500">
                  {c.interviews?.length
                    ? `${c.interviews[0].round} | ${new Date(c.interviews[0].scheduledDate).toLocaleString()}`
                    : "—"}
                </td>
              </tr>
            ))}

            {paginatedCandidates.length === 0 && (
              <tr>
                <td colSpan={14} className="p-8 text-center text-slate-400">
                  {searchQuery ? `No candidates found for "${searchQuery}"` : "No candidates found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {(currentPage - 1) * PAGE_SIZE + 1}
            </span>{" "}
            –{" "}
            <span className="font-medium text-slate-700">
              {Math.min(currentPage * PAGE_SIZE, filteredCandidates.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">{filteredCandidates.length}</span>{" "}
            candidates
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-sm text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    currentPage === page
                      ? "text-white border-transparent"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  style={
                    currentPage === page
                      ? { backgroundColor: "#574CFC", borderColor: "#574CFC" }
                      : {}
                  }
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold">Add Candidate</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="name" placeholder="Name" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="primarySkill" placeholder="Primary Skill" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="secondarySkills" placeholder="Secondary Skills (comma separated)" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="totalExperienceYears" placeholder="Experience (years)" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="currentCompany" placeholder="Company" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="currentLocation" placeholder="Location" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="preferredLocation" placeholder="Preferred Location (comma separated)" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="currentCTC" placeholder="Current CTC" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="expectedCTC" placeholder="Expected CTC" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="noticePeriodDays" placeholder="Notice Period (days)" onChange={handleChange} className="border p-2 rounded cursor-pointer" />

              {/* Source dropdown */}
              <select name="source" onChange={handleChange} className="border p-2 rounded cursor-pointer">
                <option value="Naukri">Naukri</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Indeed">Indeed</option>
                <option value="Company Website">Company Website</option>
                <option value="Campus">Campus</option>
                <option value="Internal">Internal</option>
                <option value="Other">Other</option>
              </select>

              <input name="recruiter" placeholder="Recruiter" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="client" placeholder="Client" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input name="panelist" placeholder="Panelist" onChange={handleChange} className="border p-2 rounded cursor-pointer" />

              <select name="jobId" onChange={handleChange} className="border p-2 rounded cursor-pointer">
                <option value="">Select Job</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>

              <select name="status" onChange={handleChange} className="border p-2 rounded cursor-pointer">
                <option value="in_progress">In Progress</option>
                <option value="hired">Hired</option>
                <option value="on_hold">On Hold</option>
                <option value="offer_sent">Offer Sent</option>
                <option value="offer_pending">Offer Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select name="stage" onChange={handleChange} className="border p-2 rounded cursor-pointer">
                <option value="sourced">Sourced</option>
                <option value="screened">Screened</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="interviewed">Interviewed</option>
                <option value="offer_sent">Offer Sent</option>
                <option value="offer_pending">Offer Pending</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>

              <select name="round" onChange={handleChange} className="border p-2 rounded cursor-pointer">
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="HR">HR</option>
              </select>

              <input type="date" name="interviewDate" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
              <input type="time" name="interviewTime" onChange={handleChange} className="border p-2 rounded cursor-pointer" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setOpen(false)} className="border px-4 py-2 rounded cursor-pointer hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-white rounded cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#574CFC" }}
              >
                Save Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}