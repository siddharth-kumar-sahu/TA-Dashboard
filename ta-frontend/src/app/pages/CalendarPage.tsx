import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Calendar, X, User, Briefcase, Clock,
  Building2, UserCog, ExternalLink,
} from "lucide-react";

interface CalendarEvent {
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
  candidateStatus: string;
  candidateStage: string;
}

const ROUND_COLORS: Record<string, string> = {
  L1: "#6366f1",
  L2: "#8b5cf6",
  L3: "#3b82f6",
  L4: "#06b6d4",
  HR: "#10b981",
};

const INTERVIEW_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:  "bg-rose-100 text-rose-700 border-rose-200",
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/calendar");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    }
    setLoading(false);
  };

  // Map to FullCalendar event format
  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: `${e.candidateName} — ${e.round}`,
    start: e.scheduledDate,
    end: new Date(
      new Date(e.scheduledDate).getTime() + 60 * 60 * 1000 // +1 hour default
    ).toISOString(),
    backgroundColor: ROUND_COLORS[e.round] || "#6366f1",
    borderColor: ROUND_COLORS[e.round] || "#6366f1",
    textColor: "#ffffff",
    extendedProps: e,
  }));

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps as CalendarEvent);
  };

  // Summary counts
  const total     = events.length;
  const scheduled = events.filter(e => e.interviewStatus === "scheduled").length;
  const completed = events.filter(e => e.interviewStatus === "completed").length;
  const today     = events.filter(e => {
    const d = new Date(e.scheduledDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="space-y-5">

      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Interview Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            All scheduled interviews across candidates
          </p>
        </div>
      </div>

      {/* ── SUMMARY CARDS ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Interviews" value={total}     color="bg-indigo-50 text-indigo-700" />
        <SummaryCard label="Today"            value={today}    color="bg-amber-50 text-amber-700" />
        <SummaryCard label="Scheduled"        value={scheduled} color="bg-blue-50 text-blue-700" />
        <SummaryCard label="Completed"        value={completed} color="bg-emerald-50 text-emerald-700" />
      </div>

      {/* ── LEGEND ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">Round</span>
        {Object.entries(ROUND_COLORS).map(([round, color]) => (
          <div key={round} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-600 font-medium">{round}</span>
          </div>
        ))}
      </div>

      {/* ── CALENDAR ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
            Loading interviews...
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left:   "prev,next today",
              center: "title",
              right:  "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
            nowIndicator={true}
            buttonText={{
              today: "Today",
              month: "Month",
              week:  "Week",
              day:   "Day",
            }}
            eventClassNames="cursor-pointer text-xs font-medium rounded-md px-1"
          />
        )}
      </div>

      {/* ── EVENT DETAIL POPUP ───────────────────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colored header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: ROUND_COLORS[selectedEvent.round] || "#6366f1" }}
            >
              <div>
                <p className="text-white/70 text-xs font-medium">{selectedEvent.round} Interview</p>
                <h3 className="text-white font-bold text-base mt-0.5">{selectedEvent.candidateName}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Details */}
            <div className="px-5 py-4 space-y-3">
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Date & Time"
                value={new Date(selectedEvent.scheduledDate).toLocaleString("en-IN", {
                  weekday: "short", day: "numeric", month: "short",
                  year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              />
              <DetailRow icon={<UserCog className="w-4 h-4" />}  label="Panelist"  value={selectedEvent.panelist} />
              <DetailRow icon={<Briefcase className="w-4 h-4" />} label="Job"       value={selectedEvent.jobTitle} />
              <DetailRow icon={<Building2 className="w-4 h-4" />} label="Client"    value={selectedEvent.client} />
              <DetailRow icon={<User className="w-4 h-4" />}      label="Recruiter" value={selectedEvent.recruiter} />

              {/* Interview status badge */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-400 w-20 flex-shrink-0">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${INTERVIEW_STATUS_COLORS[selectedEvent.interviewStatus] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {selectedEvent.interviewStatus}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate(`/candidates/${selectedEvent.candidateId}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#574CFC" }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Candidate
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */
function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 border border-slate-200 bg-white`}>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color.split(" ")[1]}`}>{value}</p>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-300 flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
      </div>
    </div>
  );
}