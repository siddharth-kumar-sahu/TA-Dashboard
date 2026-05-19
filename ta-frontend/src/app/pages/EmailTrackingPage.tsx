import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail, Send, RefreshCw, Inbox,
  Clock, User, Building2,
  ExternalLink, Unplug, Plug,
  AlertCircle, CheckCircle2, Circle,
  ChevronLeft, ChevronRight, Video, MapPin,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────── */
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

interface EmailsResponse {
  emails: Email[];
  totalCount: number;
  skip: number;
  top: number;
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

interface OutlookMeeting {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end:   { dateTime: string; timeZone: string };
  location?: { displayName: string };
  organizer?: { emailAddress: { name: string; address: string } };
  attendees?: { emailAddress: { name: string; address: string } }[];
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
  bodyPreview?: string;
}

/* ── Constants ───────────────────────────────────────────── */
const PAGE_SIZE = 15;

const ROUND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  L1: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  L2: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  L3: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200"   },
  L4: { bg: "bg-cyan-100",   text: "text-cyan-700",   border: "border-cyan-200"   },
  HR: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  scheduled: { color: "text-blue-500",    icon: <Circle className="w-3 h-3 fill-blue-500" /> },
  completed: { color: "text-emerald-500", icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:  { color: "text-rose-500",    icon: <AlertCircle className="w-3 h-3" /> },
};

/* ── Helpers ─────────────────────────────────────────────── */
function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d   = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date();
}

/* ── Component ───────────────────────────────────────────── */
export default function EmailTrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status,           setStatus]           = useState<OutlookStatus>({ connected: false, email: null });
  const [emails,           setEmails]           = useState<Email[]>([]);
  const [totalEmailCount,  setTotalEmailCount]  = useState(0);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [interviews,       setInterviews]       = useState<InterviewEvent[]>([]);
  const [meetings,         setMeetings]         = useState<OutlookMeeting[]>([]);
  const [activeTab,        setActiveTab]        = useState<"inbox" | "sent">("inbox");
  const [selectedEmail,    setSelectedEmail]    = useState<Email | null>(null);
  const [loadingEmails,    setLoadingEmails]    = useState(false);
  const [loadingMeetings,  setLoadingMeetings]  = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [connectSuccess,   setConnectSuccess]   = useState(false);
  const [rightTab,         setRightTab]         = useState<"interviews" | "meetings">("interviews");

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      setConnectSuccess(true);
      setTimeout(() => setConnectSuccess(false), 4000);
    }
  }, [searchParams]);

  const fetchWithAuth = (url: string, options: RequestInit = {}) =>
    fetch(url, { ...options, credentials: "include" });

  const fetchStatus = useCallback(async () => {
    const res  = await fetchWithAuth("http://localhost:5000/api/outlook/status");
    const data = await res.json();
    setStatus(data);
    return data.connected as boolean;
  }, []);

  const fetchEmails = useCallback(async (folder: "inbox" | "sent", page = 1) => {
    setLoadingEmails(true);
    setEmails([]);
    setSelectedEmail(null);
    try {
      const skip = (page - 1) * PAGE_SIZE;
      const res  = await fetchWithAuth(
        `http://localhost:5000/api/outlook/emails?folder=${folder}&top=${PAGE_SIZE}&skip=${skip}`
      );
      if (!res.ok) { setLoadingEmails(false); return; }
      const data: EmailsResponse = await res.json();
      setEmails(data.emails);
      setTotalEmailCount(data.totalCount);
    } catch (err) {
      console.error("Email fetch error:", err);
    }
    setLoadingEmails(false);
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const res  = await fetchWithAuth("http://localhost:5000/api/outlook/meetings");
      if (!res.ok) { setLoadingMeetings(false); return; }
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Meetings fetch error:", err);
    }
    setLoadingMeetings(false);
  }, []);

  const fetchInterviews = useCallback(async () => {
    setLoadingInterviews(true);
    try {
      const res  = await fetchWithAuth("http://localhost:5000/api/calendar");
      const data = await res.json();
      const sorted = [...data].sort((a, b) => {
        const now = Date.now();
        const aUp = new Date(a.scheduledDate).getTime() >= now;
        const bUp = new Date(b.scheduledDate).getTime() >= now;
        if (aUp && !bUp) return -1;
        if (!aUp && bUp) return 1;
        return Math.abs(new Date(a.scheduledDate).getTime() - now) -
               Math.abs(new Date(b.scheduledDate).getTime() - now);
      });
      setInterviews(sorted);
    } catch (err) {
      console.error("Interview fetch error:", err);
    }
    setLoadingInterviews(false);
  }, []);

  useEffect(() => {
    fetchStatus().then((connected) => {
      if (connected) {
        fetchEmails("inbox", 1);
        fetchMeetings();
      }
    });
    fetchInterviews();
  }, [fetchStatus, fetchEmails, fetchMeetings, fetchInterviews]);

  const handleTabChange = (tab: "inbox" | "sent") => {
    setActiveTab(tab);
    setCurrentPage(1);
    fetchEmails(tab, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEmails(activeTab, page);
  };

  const handleConnect = () => { window.location.href = "http://localhost:5000/api/outlook/auth"; };

  const handleDisconnect = async () => {
    await fetchWithAuth("http://localhost:5000/api/outlook/disconnect", { method: "POST" });
    setStatus({ connected: false, email: null });
    setEmails([]);
    setMeetings([]);
    setSelectedEmail(null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalEmailCount / PAGE_SIZE);

  // Interview splits
  const todayInterviews    = interviews.filter(iv => isToday(iv.scheduledDate));
  const upcomingInterviews = interviews.filter(iv => isUpcoming(iv.scheduledDate) && !isToday(iv.scheduledDate));
  const pastInterviews     = interviews.filter(iv => !isUpcoming(iv.scheduledDate) && !isToday(iv.scheduledDate)).slice(0, 5);

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
          <button onClick={handleDisconnect}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors">
            <Unplug className="w-4 h-4" /> Disconnect
          </button>
        ) : (
          <button onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity font-medium"
            style={{ backgroundColor: "#574CFC" }}>
            <Plug className="w-4 h-4" /> Connect Outlook
          </button>
        )}
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT: Email Panel ─────────────────────────── */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col" style={{ minHeight: "600px" }}>

          {!status.connected ? (
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
              <button onClick={handleConnect}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-xl hover:opacity-90 cursor-pointer transition-opacity font-medium"
                style={{ backgroundColor: "#574CFC" }}>
                <Plug className="w-4 h-4" /> Connect Outlook Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">

              {/* Tabs + Refresh */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex gap-1">
                  {(["inbox", "sent"] as const).map((tab) => (
                    <button key={tab} onClick={() => handleTabChange(tab)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}>
                      {tab === "inbox" ? <Inbox className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      {tab === "inbox" ? "Inbox" : "Sent"}
                      {tab === "inbox" && totalEmailCount > 0 && activeTab === "inbox" && (
                        <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{totalEmailCount}</span>
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => fetchEmails(activeTab, currentPage)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" title="Refresh">
                  <RefreshCw className={`w-4 h-4 text-slate-400 ${loadingEmails ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Email list + preview */}
              <div className="flex flex-1 overflow-hidden">

                {/* Email list */}
                <div className={`${selectedEmail ? "w-2/5" : "w-full"} flex flex-col border-r border-slate-100`}>
                  <div className="flex-1 overflow-y-auto">
                    {loadingEmails ? (
                      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Loading emails...</div>
                    ) : emails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <Mail className="w-6 h-6 text-slate-200" />
                        <p className="text-sm text-slate-400">No emails found.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {emails.map((email) => (
                          <button key={email.id} onClick={() => setSelectedEmail(email)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                              selectedEmail?.id === email.id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""
                            }`}>
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
                            <p className="text-xs text-slate-600 mt-0.5 truncate pl-3.5">{email.subject || "(no subject)"}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate pl-3.5">{email.bodyPreview}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── PAGINATION ──────────────────────── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-xs text-slate-400">
                        Page <span className="font-semibold text-slate-600">{currentPage}</span> of{" "}
                        <span className="font-semibold text-slate-600">{totalPages}</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                        </button>

                        {/* Page number buttons */}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                currentPage === page
                                  ? "text-white border-transparent"
                                  : "border-slate-200 text-slate-600 hover:bg-white"
                              }`}
                              style={currentPage === page ? { backgroundColor: "#574CFC" } : {}}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
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
                        <button onClick={() => setSelectedEmail(null)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0 text-lg leading-none">
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

        {/* ── RIGHT: Interviews + Meetings Panel ────────── */}
        <div className="xl:col-span-1 flex flex-col gap-0 bg-white border border-slate-200 rounded-xl overflow-hidden">

          {/* Right panel tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setRightTab("interviews")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                rightTab === "interviews"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Interviews
            </button>
            <button
              onClick={() => setRightTab("meetings")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                rightTab === "meetings"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Meetings {status.connected && meetings.length > 0 && (
                <span className="ml-1 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full text-xs">{meetings.length}</span>
              )}
            </button>
          </div>

          {/* ── INTERVIEWS TAB ──────────────────────────── */}
          {rightTab === "interviews" && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">

              {/* Today */}
              <div>
                <div className="px-4 py-2.5 bg-amber-50/60 flex items-center gap-2 sticky top-0">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Today</span>
                  <span className="ml-auto text-xs text-slate-400">{todayInterviews.length}</span>
                </div>
                {todayInterviews.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400 text-center">No interviews today.</p>
                ) : todayInterviews.map(iv => (
                  <InterviewRow key={iv.id} iv={iv} navigate={navigate} highlight />
                ))}
              </div>

              {/* Upcoming */}
              <div>
                <div className="px-4 py-2.5 bg-indigo-50/40 flex items-center gap-2 sticky top-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Upcoming</span>
                  <span className="ml-auto text-xs text-slate-400">{upcomingInterviews.length}</span>
                </div>
                {loadingInterviews ? (
                  <p className="px-4 py-3 text-xs text-slate-400 text-center">Loading...</p>
                ) : upcomingInterviews.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400 text-center">No upcoming interviews.</p>
                ) : upcomingInterviews.map(iv => (
                  <InterviewRow key={iv.id} iv={iv} navigate={navigate} />
                ))}
              </div>

              {/* Past */}
              {pastInterviews.length > 0 && (
                <div>
                  <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Recent</span>
                  </div>
                  {pastInterviews.map(iv => (
                    <InterviewRow key={iv.id} iv={iv} navigate={navigate} past />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MEETINGS TAB ────────────────────────────── */}
          {rightTab === "meetings" && (
            <div className="flex-1 overflow-y-auto">
              {!status.connected ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-4">
                  <Video className="w-6 h-6 text-slate-200" />
                  <p className="text-xs text-slate-400">Connect Outlook to see scheduled meetings.</p>
                </div>
              ) : loadingMeetings ? (
                <div className="flex items-center justify-center h-32 text-xs text-slate-400">Loading meetings...</div>
              ) : meetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Video className="w-6 h-6 text-slate-200" />
                  <p className="text-xs text-slate-400">No meetings in the next 30 days.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {meetings.map((meeting) => (
                    <MeetingRow key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Interview Row ───────────────────────────────────────── */
function InterviewRow({
  iv, navigate, highlight = false, past = false,
}: {
  iv: InterviewEvent;
  navigate: (path: string) => void;
  highlight?: boolean;
  past?: boolean;
}) {
  const roundColor = ROUND_COLORS[iv.round] || ROUND_COLORS["L1"];
  const statusCfg  = STATUS_CONFIG[iv.interviewStatus] || STATUS_CONFIG["scheduled"];

  return (
    <div className={`px-4 py-3 ${highlight ? "bg-amber-50/40" : ""} ${past ? "opacity-55" : ""}`}>
      <div className="flex items-start gap-2.5">
        <span className={`px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 border ${roundColor.bg} ${roundColor.text} ${roundColor.border}`}>
          {iv.round}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{iv.candidateName}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{iv.jobTitle}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={`flex items-center gap-1 text-xs ${statusCfg.color}`}>
              {statusCfg.icon} {iv.interviewStatus}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(iv.scheduledDate).toLocaleString("en-IN", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {iv.panelist && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <User className="w-3 h-3" /> {iv.panelist}
              </span>
            )}
            {iv.client && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Building2 className="w-3 h-3" /> {iv.client}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => navigate(`/candidates/${iv.candidateId}`)}
          className="p-1 hover:bg-slate-100 rounded cursor-pointer transition-colors flex-shrink-0" title="View candidate">
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}

/* ── Meeting Row ─────────────────────────────────────────── */
function MeetingRow({ meeting }: { meeting: OutlookMeeting }) {
  const start   = new Date(meeting.start.dateTime);
  const end     = new Date(meeting.end.dateTime);
  const todayMt = isToday(meeting.start.dateTime);

  return (
    <div className={`px-4 py-3 ${todayMt ? "bg-indigo-50/40" : ""}`}>
      <div className="flex items-start gap-2.5">
        {/* Online/in-person indicator */}
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          meeting.isOnlineMeeting ? "bg-indigo-100" : "bg-slate-100"
        }`}>
          {meeting.isOnlineMeeting
            ? <Video className="w-3.5 h-3.5 text-indigo-600" />
            : <MapPin className="w-3.5 h-3.5 text-slate-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{meeting.subject || "(No title)"}</p>

          <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{" · "}
            {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            {" – "}
            {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>

          {meeting.location?.displayName && (
            <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {meeting.location.displayName}
            </span>
          )}

          {meeting.organizer && (
            <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <User className="w-3 h-3 flex-shrink-0" />
              {meeting.organizer.emailAddress.name}
            </span>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {todayMt && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                Today
              </span>
            )}
            {meeting.isOnlineMeeting && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                Online
              </span>
            )}
            {meeting.onlineMeetingUrl && (
              <a href={meeting.onlineMeetingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer">
                Join <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}