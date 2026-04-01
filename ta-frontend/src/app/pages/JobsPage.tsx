import { useEffect, useState } from "react";

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
  experienceRange: {
    min: number;
    max: number;
  };
  numberOfOpenings: number;
  status: string;
  priority: string;
  createdAt: string;
}

export default function JobsPage() {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [form, setForm] = useState({
    title: "",
    department: "",
    jobDescription: "",
    location: "",
    primarySkill: "",
    secondarySkills: "",
    preferredQualifications: [] as string[],
    client: "",
    minExperience: "",
    maxExperience: "",
    numberOfOpenings: "",
    status: "open",
    priority: "medium"
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await fetch("http://localhost:5000/api/jobs");
    const data = await res.json();
    setJobs(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, preferredQualifications: values });
  };

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      department: form.department,
      jobDescription: form.jobDescription,
      location: form.location,
      primarySkill: form.primarySkill,
      secondarySkills: form.secondarySkills.split(",").map(s => s.trim()),
      preferredQualifications: form.preferredQualifications,
      client: form.client,
      experienceRange: {
        min: Number(form.minExperience),
        max: Number(form.maxExperience)
      },
      numberOfOpenings: Number(form.numberOfOpenings),
      status: form.status,
      priority: form.priority
    };

    await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setOpen(false);
    fetchJobs();
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Postings</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2 rounded-lg text-white cursor-pointer hover:opacity-90"
          style={{ backgroundColor: "#574CFC" }}
        >
          + Add job posting
        </button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-[1600px] w-full text-left text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {[
                "Title", "Department", "Client", "Location", "Primary Skill",
                "Secondary Skills", "Experience", "Openings", "Qualifications",
                "Status", "Priority", "Created"
              ].map(h => (
                <th key={h} className="p-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j._id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{j.title}</td>
                <td className="p-3">{j.department}</td>
                <td className="p-3">{j.client}</td>
                <td className="p-3">{j.location}</td>
                <td className="p-3">{j.primarySkill}</td>
                <td className="p-3">{j.secondarySkills?.join(", ")}</td>
                <td className="p-3">{j.experienceRange?.min} - {j.experienceRange?.max} yrs</td>
                <td className="p-3">{j.numberOfOpenings}</td>
                <td className="p-3">{j.preferredQualifications?.join(", ")}</td>
                <td className="p-3 capitalize">{j.status}</td>
                <td className="p-3 capitalize">{j.priority}</td>
                <td className="p-3 text-xs">
                  {new Date(j.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold">Add Job Posting</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["title","Job Title"],
                ["department","Department"],
                ["client","Client"],
                ["location","Location"],
                ["primarySkill","Primary Skill"],
                ["secondarySkills","Secondary Skills (comma separated)"],
                ["numberOfOpenings","No. of Openings"],
                ["minExperience","Min Experience"],
                ["maxExperience","Max Experience"]
              ].map(([name,label]) => (
                <input
                  key={name}
                  name={name}
                  placeholder={label}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                />
              ))}

              <textarea
                name="jobDescription"
                placeholder="Job Description"
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 col-span-2 h-24"
              />

              <select multiple onChange={handleMultiSelect} className="border rounded-lg px-3 py-2 col-span-2 h-28">
                {["BSc", "MSc", "B.Tech", "M.Tech"].map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>

              <select name="status" onChange={handleChange} className="border rounded-lg px-3 py-2">
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>

              <select name="priority" onChange={handleChange} className="border rounded-lg px-3 py-2">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setOpen(false)} className="border px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-5 py-2 rounded-lg text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: "#574CFC" }}>
                Save Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
