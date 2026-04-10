import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail, Send, RefreshCw, Inbox,
  Calendar, Clock, User, Building2,
  Briefcase, ExternalLink, Unplug, Plug,
  AlertCircle, CheckCircle2, Circle,
} from "lucide-react";

interface Email {
  id: string;
  subject: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients: { emailAddress: { name: string; address: string } }[];
  receivedDateTime: string;
  sentDateTime: string;
  isRead: boolean;
  bodyPreview: string;
}

interface OutlookStatus {
  connected: boolean;
  email: string | null;
}

interface InterviewEvent {
  id: string;
  candidateId: string;
  candidateName: string;
  round: string;
  panelist: string;
  scheduledDate: string;
  interviewStatus: string;
  jobTitle: string;
  recruiter: string;
  client: string;
}

const ROUND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  L1: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  L2: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  L3: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  L4: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  HR: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  scheduled: { color: "text-blue-500", icon: <Circle className="w-3 h-3 fill-blue-500" /> },
  completed: { color: "text-emerald-500", icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { color: "text-rose-500", icon: <AlertCircle className="w-3 h-3" /> },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date();
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function EmailTrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<OutlookStatus>({ connected: false, email: null });
  const [emails, setEmails] = useState<Email[]>([]);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [connectSuccess, setConnectSuccess] = useState(false);

  // Check if just connected via OAuth callback
  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      setConnectSuccess(true);
      setTimeout(() => setConnectSuccess(false), 4000);
    }
  }, [searchParams]);

  // ✅ ADD THIS HELPER (TOP OF FILE)
  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include", // 🔥 IMPORTANT FIX
    });
  };

  const fetchStatus = useCallback(async () => {
    const res = await fetchWithAuth("http://localhost:5000/api/outlook/status");
    const data = await res.json();

    console.log("STATUS:", data); // debug

    setStatus(data);
    return data.connected;
  }, []);

  const fetchEmails = useCallback(async (folder: "inbox" | "sent") => {
    setLoadingEmails(true);
    setEmails([]);
    setSelectedEmail(null);

    try {
      const res = await fetchWithAuth(
        `http://localhost:5000/api/outlook/emails?folder=${folder}&top=25`
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Email API error:", err);
        return;
      }

      const data = await res.json();

      console.log("EMAILS:", data); // debug

      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Email fetch error:", err);
    }

    setLoadingEmails(false);
  }, []);

  const fetchInterviews = useCallback(async () => {
    setLoadingInterviews(true);

    try {
      const res = await fetchWithAuth("http://localhost:5000/api/calendar");
      const data = await res.json();

      const sorted = [...data].sort((a, b) => {
        const aDate = new Date(a.scheduledDate).getTime();
        const bDate = new Date(b.scheduledDate).getTime();
        const now = Date.now();

        const aUpcoming = aDate >= now;
        const bUpcoming = bDate >= now;

        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;

        return Math.abs(aDate - now) - Math.abs(bDate - now);
      });

      setInterviews(sorted);
    } catch (err) {
      console.error("Interview fetch error:", err);
    }

    setLoadingInterviews(false);
  }, []);

  useEffect(() => {
    fetchStatus().then((connected) => {
      if (connected) fetchEmails("inbox");
    });
    fetchInterviews();
  }, [fetchStatus, fetchEmails, fetchInterviews]);

  const handleTabChange = (tab: "inbox" | "sent") => {
    setActiveTab(tab);
    fetchEmails(tab);
  };

  const handleConnect = () => {
    window.location.href = "http://localhost:5000/api/outlook/auth";
  };

  const handleDisconnect = async () => {
    await fetchWithAuth("http://localhost:5000/api/outlook/disconnect", {
      method: "POST",
    });

    setStatus({ connected: false, email: null });
    setEmails([]);
    setSelectedEmail(null);
  };

  // Split interviews
  const todayInterviews = interviews.filter(iv => isToday(iv.scheduledDate));
  const upcomingInterviews = interviews.filter(iv => isUpcoming(iv.scheduledDate) && !isToday(iv.scheduledDate));
  const pastInterviews = interviews.filter(iv => !isUpcoming(iv.scheduledDate) && !isToday(iv.scheduledDate)).slice(0, 5);

  return (
    <div className="space-y-4">

      {/* ── SUCCESS BANNER ───────────────────────────────── */}
      {connectSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Successfully connected to Outlook!</p>
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            Email Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {status.connected ? `Connected as ${status.email}` : "Connect your Outlook to view emails"}
          </p>
        </div>

        {status.connected ? (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
          >
            <Unplug className="w-4 h-4" />
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity font-medium"
            style={{ backgroundColor: "#574CFC" }}
          >
            <Plug className="w-4 h-4" />
            Connect Outlook
          </button>
        )}
      </div>

      {/* ── MAIN LAYOUT: Email panel + Interview panel ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT: Email Panel (2 cols) ─────────────────── */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col" style={{ minHeight: "600px" }}>

          {!status.connected ? (
            /* Not connected state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                <Mail className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Connect your Outlook</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  Sign in with your Microsoft account to view your inbox and sent emails here.
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-xl hover:opacity-90 cursor-pointer transition-opacity font-medium"
                style={{ backgroundColor: "#574CFC" }}
              >
                <Plug className="w-4 h-4" />
                Connect Outlook Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Tabs + Refresh */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTabChange("inbox")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "inbox"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    Inbox
                    {emails.length > 0 && activeTab === "inbox" && (
                      <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                        {emails.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleTabChange("sent")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "sent"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Sent
                  </button>
                </div>
                <button
                  onClick={() => fetchEmails(activeTab)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-400 ${loadingEmails ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Email list + preview split */}
              <div className="flex flex-1 overflow-hidden">

                {/* Email list */}
                <div className={`${selectedEmail ? "w-2/5" : "w-full"} border-r border-slate-100 overflow-y-auto`}>
                  {loadingEmails ? (
                    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                      Loading emails...
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                      <Mail className="w-6 h-6 text-slate-200" />
                      <p className="text-sm text-slate-400">No emails found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {emails.map((email) => (
                        <button
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${selectedEmail?.id === email.id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {!email.isRead && activeTab === "inbox" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                              )}
                              <p className={`text-sm truncate ${!email.isRead && activeTab === "inbox" ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                                {activeTab === "inbox"
                                  ? email.from?.emailAddress?.name || email.from?.emailAddress?.address
                                  : email.toRecipients?.[0]?.emailAddress?.name || email.toRecipients?.[0]?.emailAddress?.address || "—"}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                              {formatDate(email.receivedDateTime || email.sentDateTime)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 truncate pl-3.5">
                            {email.subject || "(no subject)"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate pl-3.5">
                            {email.bodyPreview}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email preview */}
                {selectedEmail && (
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm leading-relaxed">
                          {selectedEmail.subject || "(no subject)"}
                        </h3>
                        <button
                          onClick={() => setSelectedEmail(null)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-1 pb-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500">
                          <span className="text-slate-400">From: </span>
                          {selectedEmail.from?.emailAddress?.name} &lt;{selectedEmail.from?.emailAddress?.address}&gt;
                        </p>
                        <p className="text-xs text-slate-500">
                          <span className="text-slate-400">To: </span>
                          {selectedEmail.toRecipients?.map(r => r.emailAddress.address).join(", ")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(selectedEmail.receivedDateTime || selectedEmail.sentDateTime).toLocaleString("en-IN", {
                            weekday: "short", day: "numeric", month: "short",
                            year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedEmail.bodyPreview}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Interview Panel ─────────────────────── */}
        <div className="xl:col-span-1 flex flex-col gap-4">

          {/* Today */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Today</h3>
              <span className="ml-auto text-xs text-slate-400">{todayInterviews.length}</span>
            </div>
            {todayInterviews.length === 0 ? (
              <p className="px-4 py-4 text-xs text-slate-400 text-center">No interviews today.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {todayInterviews.map(iv => (
                  <InterviewRow key={iv.id} iv={iv} navigate={navigate} highlight />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Upcoming</h3>
              <span className="ml-auto text-xs text-slate-400">{upcomingInterviews.length}</span>
            </div>
            {loadingInterviews ? (
              <p className="px-4 py-4 text-xs text-slate-400 text-center">Loading...</p>
            ) : upcomingInterviews.length === 0 ? (
              <p className="px-4 py-4 text-xs text-slate-400 text-center">No upcoming interviews.</p>
            ) : (
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-64">
                {upcomingInterviews.map(iv => (
                  <InterviewRow key={iv.id} iv={iv} navigate={navigate} />
                ))}
              </div>
            )}
          </div>

          {/* Recent past */}
          {pastInterviews.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Recent</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {pastInterviews.map(iv => (
                  <InterviewRow key={iv.id} iv={iv} navigate={navigate} past />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Interview Row ───────────────────────────────────────── */
function InterviewRow({
  iv, navigate, highlight = false, past = false
}: {
  iv: InterviewEvent;
  navigate: (path: string) => void;
  highlight?: boolean;
  past?: boolean;
}) {
  const roundColor = ROUND_COLORS[iv.round] || ROUND_COLORS["L1"];
  const statusCfg = STATUS_CONFIG[iv.interviewStatus] || STATUS_CONFIG["scheduled"];

  return (
    <div className={`px-4 py-3 ${highlight ? "bg-amber-50/50" : ""} ${past ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2.5">
        {/* Round badge */}
        <span className={`px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 border ${roundColor.bg} ${roundColor.text} ${roundColor.border}`}>
          {iv.round}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{iv.candidateName}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{iv.jobTitle}</p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={`flex items-center gap-1 text-xs ${statusCfg.color}`}>
              {statusCfg.icon}
              {iv.interviewStatus}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(iv.scheduledDate).toLocaleString("en-IN", {
                day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {iv.panelist && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <User className="w-3 h-3" />
                {iv.panelist}
              </span>
            )}
            {iv.client && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Building2 className="w-3 h-3" />
                {iv.client}
              </span>
            )}
          </div>
        </div>

        {/* Go to profile */}
        <button
          onClick={() => navigate(`/candidates/${iv.candidateId}`)}
          className="p-1 hover:bg-slate-100 rounded cursor-pointer transition-colors flex-shrink-0"
          title="View candidate"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}