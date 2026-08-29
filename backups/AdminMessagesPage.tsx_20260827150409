import { useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  Plus,
  Send,
  X,
  Search,
  User,
} from "lucide-react";
import { adminInquiriesAPI, adminAPI } from "../../utils/api";
import { Button } from "../ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type DirectMessage = {
  id: number;
  status: "pending" | "reviewed" | "closed";
  source_type: string;
  created_at: string;
  from_faculty_name: string;
  from_faculty_email: string;
  message_subject?: string;
  target_faculty_name: string;
  target_faculty_id: string;
  note: string;
  admin_notes: string;
  reviewed_by: string;
};

type SupportTicket = {
  id: number;
  ticket_type: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  admin_notes: string;
  resolved_by: string;
  created_at: string;
  faculty_name: string;
  faculty_email: string;
  faculty_id: number | null;
};

type FacultyRow = {
  id: number;
  name: string;
  email: string;
  institutional_email: string;
  primary_department: { id: number; name: string } | null;
  departments: string[];
  is_approved: boolean;
  profile_visibility: boolean;
  article_count: number;
  total_citations: number;
  patent_count?: number;
  project_count?: number;
  photo: string | null;
  review_status: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TICKET_TYPE_LABELS: Record<string, string> = {
  bug: "Bug Report",
  account: "Account Issue",
  content: "Content / Data Issue",
  feature: "Feature Request",
  other: "Other",
};

const TICKET_TYPE_COLOR: Record<string, string> = {
  bug: "bg-red-50 text-red-700 border-red-200",
  account: "bg-orange-50 text-orange-700 border-orange-200",
  content: "bg-purple-50 text-purple-700 border-purple-200",
  feature: "bg-blue-50 text-blue-700 border-blue-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_CLASS: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
};

function formatDateTime(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const departmentName = (f: FacultyRow) =>
  f.primary_department?.name || f.departments?.[0] || "No department";

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "direct" | "tickets";
type MsgSubTab = "sent" | "received";

export function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("direct");
  const [msgSubTab, setMsgSubTab] = useState<MsgSubTab>("sent");

  // Faculty list (for compose + recipient profile panel)
  const [facultyList, setFacultyList] = useState<FacultyRow[]>([]);
  const [facultyLoaded, setFacultyLoaded] = useState(false);

  // Direct messages
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(true);
  const [msgError, setMsgError] = useState("");
  const [expandedMsg, setExpandedMsg] = useState<number | null>(null);
  const [msgNotesDraft, setMsgNotesDraft] = useState<Record<number, string>>({});
  const [msgSaving, setMsgSaving] = useState<number | null>(null);

  // Recipient side panel
  const [profilePanel, setProfilePanel] = useState<FacultyRow | null>(null);

  // Compose new message modal
  const [showCompose, setShowCompose] = useState(false);
  const [composeSearch, setComposeSearch] = useState("");
  const [composeRecipient, setComposeRecipient] = useState<FacultyRow | null>(null);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeNote, setComposeNote] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState("");

  // Support tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [ticketNotesDraft, setTicketNotesDraft] = useState<Record<number, string>>({});
  const [ticketSaving, setTicketSaving] = useState<number | null>(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");

  useEffect(() => {
    adminInquiriesAPI
      .list("admin")
      .then((res) => setMessages(res.results ?? []))
      .catch(() => setMsgError("Failed to load messages."))
      .finally(() => setMsgLoading(false));

    adminAPI
      .getTickets()
      .then((res) => setTickets(res.results ?? []))
      .catch(() => setTicketsError("Failed to load tickets."))
      .finally(() => setTicketsLoading(false));

    adminAPI
      .getAllFaculty()
      .then((data: any) => {
        setFacultyList(Array.isArray(data) ? data : []);
        setFacultyLoaded(true);
      })
      .catch(() => setFacultyLoaded(true));
  }, []);

  // ── Compose filtered list ──────────────────────────────────────────────────
  // Only faculty with actual user accounts can receive messages
  const messagableFaculty = useMemo(
    () => facultyList.filter((f: any) => f.has_user),
    [facultyList],
  );

  const filteredFaculty = useMemo(() => {
    const q = composeSearch.toLowerCase().trim();
    if (!q) return messagableFaculty.slice(0, 30);
    return messagableFaculty
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.email || "").toLowerCase().includes(q) ||
          departmentName(f).toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [messagableFaculty, composeSearch]);

  // ── Direct message handlers ────────────────────────────────────────────────
  const handleMsgStatus = async (id: number, status: string) => {
    try {
      const updated = await adminInquiriesAPI.update(id, { status });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status: updated.status ?? status, reviewed_by: updated.reviewed_by ?? m.reviewed_by }
            : m,
        ),
      );
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleMsgNoteSave = async (id: number) => {
    const notes = msgNotesDraft[id] ?? "";
    setMsgSaving(id);
    try {
      await adminInquiriesAPI.update(id, { admin_notes: notes });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, admin_notes: notes } : m)));
    } catch {
      alert("Failed to save note.");
    } finally {
      setMsgSaving(null);
    }
  };

  // ── Compose handler ────────────────────────────────────────────────────────
  const openCompose = () => {
    setComposeSearch("");
    setComposeRecipient(null);
    setComposeSubject("");
    setComposeNote("");
    setComposeError("");
    setShowCompose(true);
  };

  const handleSendMessage = async () => {
    if (!composeRecipient) { setComposeError("Please select a recipient."); return; }
    if (!composeNote.trim()) { setComposeError("Message body is required."); return; }
    setComposeSending(true);
    setComposeError("");
    try {
      await adminAPI.sendFacultyMessage(composeRecipient.id, {
        note: composeNote.trim(),
        message_subject: composeSubject.trim() || undefined,
      });
      // Refresh messages
      const res = await adminInquiriesAPI.list("admin");
      setMessages(res.results ?? []);
      setShowCompose(false);
    } catch (e: any) {
      setComposeError(e?.message || "Failed to send message.");
    } finally {
      setComposeSending(false);
    }
  };

  // ── Recipient profile lookup ───────────────────────────────────────────────
  const openRecipientProfile = (targetFacultyId: string) => {
    const id = parseInt(targetFacultyId, 10);
    if (Number.isNaN(id)) return;
    const faculty = facultyList.find((f) => f.id === id);
    if (faculty) setProfilePanel(faculty);
  };

  // ── Ticket handlers ────────────────────────────────────────────────────────
  const handleTicketStatus = async (id: number, status: string) => {
    try {
      const updated = await adminAPI.updateTicket(id, { status });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch {
      alert("Failed to update ticket.");
    }
  };

  const handleTicketNoteSave = async (id: number) => {
    const notes = ticketNotesDraft[id] ?? "";
    setTicketSaving(id);
    try {
      const updated = await adminAPI.updateTicket(id, { admin_notes: notes });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch {
      alert("Failed to save note.");
    } finally {
      setTicketSaving(null);
    }
  };

  const visibleTickets = useMemo(
    () => (ticketStatusFilter === "all" ? tickets : tickets.filter((t) => t.status === ticketStatusFilter)),
    [tickets, ticketStatusFilter],
  );

  const ticketCounts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    }),
    [tickets],
  );

  const TabBtn = ({ tab, label, badge }: { tab: Tab; label: string; badge?: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab ? "bg-[#8b0000] text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
      {badge != null && badge > 0 && (
        <span
          className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            activeTab === tab ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600 mt-1">
            Admin-to-faculty direct messages and faculty support tickets
          </p>
        </div>
        {activeTab === "direct" && (
          <Button
            onClick={openCompose}
            className="bg-[#8b0000] hover:bg-[#700000] text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Message
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <TabBtn
          tab="direct"
          label="Direct Messages"
          badge={messages.filter((m) => m.status === "pending").length}
        />
        <TabBtn
          tab="tickets"
          label="Support Tickets"
          badge={ticketCounts.open + ticketCounts.in_progress}
        />
      </div>

      {/* ── Direct Messages ─────────────────────────────────────────────────── */}
      {activeTab === "direct" && (
        <>
          {/* Sent / Received subtabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            {(["sent", "received"] as MsgSubTab[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setMsgSubTab(sub)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  msgSubTab === sub
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {sub === "sent" ? `Sent (${messages.length})` : "Received"}
              </button>
            ))}
          </div>

          {msgError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {msgError}
            </p>
          )}

          {msgSubTab === "received" ? (
            <div className="text-center py-20">
              <Mail className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-base text-gray-400 font-medium">No messages received yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Faculty replies will appear here once interportal messaging is enabled.
              </p>
            </div>
          ) : msgLoading ? (
            <div className="flex items-center gap-3 py-16 justify-center text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#8b0000] rounded-full animate-spin" />
              Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <ShieldAlert className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-base text-gray-400 font-medium">No admin messages sent yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Use the <strong>New Message</strong> button above to message a faculty member.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOpen = expandedMsg === msg.id;
                return (
                  <div
                    key={msg.id}
                    className={`bg-white border border-[#8b0000]/15 rounded-lg overflow-hidden transition-all ${
                      isOpen ? "shadow-md" : "hover:shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      style={{ padding: "20px 40px" }}
                      className="w-full text-left flex items-start gap-5 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setExpandedMsg(isOpen ? null : msg.id);
                        if (!isOpen && msgNotesDraft[msg.id] === undefined) {
                          setMsgNotesDraft((d) => ({ ...d, [msg.id]: msg.admin_notes ?? "" }));
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Subject line — email style */}
                        <p className="text-base font-semibold text-gray-900 leading-snug">
                          {msg.message_subject || "(No subject)"}
                        </p>
                        {/* To + sent by */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                            <span className="text-xs font-medium text-gray-500">To</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRecipientProfile(msg.target_faculty_id);
                              }}
                              className="text-sm font-semibold text-[#8b0000] hover:underline"
                            >
                              {msg.target_faculty_name}
                            </button>
                          </span>
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
                            Sent by <span className="ml-1 font-semibold text-gray-600">{msg.from_faculty_name}</span>
                          </span>
                        </div>
                        {/* Status + time */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border text-xs font-medium px-2 py-0.5 ${STATUS_CLASS[msg.status]}`}>
                            {msg.status === "pending" && <Clock className="w-3 h-3" />}
                            {msg.status === "reviewed" && <CheckCircle2 className="w-3 h-3" />}
                            {msg.status === "closed" && <XCircle className="w-3 h-3" />}
                            {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                          </span>
                          <span className="inline-flex rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
                            {formatDateTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div style={{ padding: "20px 40px 24px" }} className="border-t border-gray-100 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                              Sent By
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{msg.from_faculty_name}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                              Recipient
                            </p>
                            <button
                              type="button"
                              onClick={() => openRecipientProfile(msg.target_faculty_id)}
                              className="text-sm font-semibold text-[#8b0000] hover:underline block mb-1"
                            >
                              {msg.target_faculty_name}
                            </button>
                            {msg.from_faculty_email && (
                              <a
                                href={`mailto:${msg.from_faculty_email}`}
                                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:underline mt-1"
                              >
                                <Mail className="w-3.5 h-3.5" /> {msg.from_faculty_email}
                              </a>
                            )}
                          </div>
                        </div>

                        {msg.note && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                              Message Body
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 whitespace-pre-wrap leading-relaxed">
                              {msg.note}
                            </p>
                          </div>
                        )}

                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                              Internal Notes
                            </p>
                            {msg.reviewed_by && (
                              <p className="text-xs text-gray-400">
                                Reviewed by{" "}
                                <span className="font-medium text-gray-600">{msg.reviewed_by}</span>
                              </p>
                            )}
                          </div>
                          <textarea
                            rows={3}
                            value={msgNotesDraft[msg.id] ?? msg.admin_notes ?? ""}
                            onChange={(e) =>
                              setMsgNotesDraft((d) => ({ ...d, [msg.id]: e.target.value }))
                            }
                            placeholder="Internal notes..."
                            className="w-full px-4 py-3.5 text-sm text-gray-800 bg-white resize-none border-0 focus:outline-none placeholder:text-gray-400"
                          />
                          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={msgSaving === msg.id}
                              onClick={() => handleMsgNoteSave(msg.id)}
                            >
                              {msgSaving === msg.id ? "Saving…" : "Save Notes"}
                            </Button>
                            {msg.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleMsgStatus(msg.id, "reviewed")}
                              >
                                <CheckCircle2 className="w-4 h-4" /> Mark Reviewed
                              </Button>
                            )}
                            {msg.status !== "closed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-gray-600"
                                onClick={() => handleMsgStatus(msg.id, "closed")}
                              >
                                <XCircle className="w-4 h-4" /> Close
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Support Tickets ──────────────────────────────────────────────────── */}
      {activeTab === "tickets" && (
        <>
          <div className="flex flex-wrap gap-2">
            {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTicketStatusFilter(s)}
                className={`rounded-full text-sm font-medium border px-4 py-1.5 transition-all ${
                  ticketStatusFilter === s
                    ? "bg-[#8b0000] text-white border-[#8b0000]"
                    : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {s === "all"
                  ? `All (${tickets.length})`
                  : s === "in_progress"
                  ? `In Progress (${ticketCounts.in_progress})`
                  : `${s.charAt(0).toUpperCase() + s.slice(1)} (${ticketCounts[s as keyof typeof ticketCounts] ?? 0})`}
              </button>
            ))}
          </div>

          {ticketsError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {ticketsError}
            </p>
          )}

          {ticketsLoading ? (
            <div className="flex items-center gap-3 py-16 justify-center text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#8b0000] rounded-full animate-spin" />
              Loading…
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="text-center py-20">
              <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-base text-gray-400 font-medium">
                No tickets{ticketStatusFilter !== "all" ? ` with status "${ticketStatusFilter}"` : " yet"}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleTickets.map((ticket) => {
                const isOpen = expandedTicket === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    className={`bg-white border rounded-lg overflow-hidden transition-all ${
                      ticket.status === "open" ? "border-yellow-200" : "border-gray-200"
                    } ${isOpen ? "shadow-md" : "hover:shadow-sm"}`}
                  >
                    <button
                      type="button"
                      style={{ padding: "20px 40px" }}
                      className="w-full text-left flex items-start gap-5 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setExpandedTicket(isOpen ? null : ticket.id);
                        if (!isOpen && ticketNotesDraft[ticket.id] === undefined) {
                          setTicketNotesDraft((d) => ({
                            ...d,
                            [ticket.id]: ticket.admin_notes ?? "",
                          }));
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0 space-y-3.5">
                        <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border text-xs font-medium px-2.5 py-0.5 shrink-0 ${
                              TICKET_TYPE_COLOR[ticket.ticket_type] ??
                              "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {TICKET_TYPE_LABELS[ticket.ticket_type] ?? ticket.ticket_type}
                          </span>
                          <span className="text-base font-semibold text-gray-900">
                            {ticket.subject}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {ticket.faculty_name || "Unknown faculty"}
                          </span>
                          {ticket.faculty_email && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              <Building2 className="w-3 h-3" /> {ticket.faculty_email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border text-xs font-medium px-2.5 py-0.5 ${
                              STATUS_CLASS[ticket.status]
                            }`}
                          >
                            {(ticket.status === "open" || ticket.status === "in_progress") && (
                              <Clock className="w-3 h-3" />
                            )}
                            {ticket.status === "resolved" && <CheckCircle2 className="w-3 h-3" />}
                            {ticket.status === "closed" && <XCircle className="w-3 h-3" />}
                            {ticket.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                            {formatDateTime(ticket.created_at)}
                          </span>
                          {ticket.resolved_by && (
                            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                              Resolved by <span className="font-medium text-gray-600">{ticket.resolved_by}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div style={{ padding: "20px 40px 24px" }} className="border-t border-gray-100 space-y-5">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                            Description
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 whitespace-pre-wrap leading-relaxed">
                            {ticket.description}
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                              Response / Notes
                            </p>
                          </div>
                          <textarea
                            rows={3}
                            value={ticketNotesDraft[ticket.id] ?? ticket.admin_notes ?? ""}
                            onChange={(e) =>
                              setTicketNotesDraft((d) => ({ ...d, [ticket.id]: e.target.value }))
                            }
                            placeholder="Add a response or internal notes..."
                            className="w-full px-4 py-3.5 text-sm text-gray-800 bg-white resize-none border-0 focus:outline-none placeholder:text-gray-400"
                          />
                          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={ticketSaving === ticket.id}
                              onClick={() => handleTicketNoteSave(ticket.id)}
                            >
                              {ticketSaving === ticket.id ? "Saving…" : "Save Notes"}
                            </Button>
                            {ticket.status === "open" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleTicketStatus(ticket.id, "in_progress")}
                              >
                                <Clock className="w-4 h-4" /> Mark In Progress
                              </Button>
                            )}
                            {(ticket.status === "open" || ticket.status === "in_progress") && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleTicketStatus(ticket.id, "resolved")}
                              >
                                <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                              </Button>
                            )}
                            {ticket.status !== "closed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-gray-600"
                                onClick={() => handleTicketStatus(ticket.id, "closed")}
                              >
                                <XCircle className="w-4 h-4" /> Close
                              </Button>
                            )}
                            {ticket.faculty_email && (
                              <a
                                className="ml-auto"
                                href={`mailto:${ticket.faculty_email}?subject=${encodeURIComponent(
                                  `Re: ${ticket.subject}`,
                                )}`}
                              >
                                <Button
                                  size="sm"
                                  className="bg-[#8b0000] hover:bg-[#700000] text-white"
                                >
                                  <Mail className="w-4 h-4" /> Reply by Email
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Compose Modal ────────────────────────────────────────────────────── */}
      {showCompose && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCompose(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: "0.75rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            padding: "1.5rem", width: "100%", maxWidth: "34rem",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Recipient picker */}
            {!composeRecipient ? (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Select recipient
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Name, email, or department…"
                    value={composeSearch}
                    onChange={(e) => setComposeSearch(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                  />
                </div>
                {!facultyLoaded ? (
                  <p className="text-sm text-gray-400 text-center py-4">Loading faculty…</p>
                ) : filteredFaculty.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No faculty found.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    {filteredFaculty.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setComposeRecipient(f)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#8b0000]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-[#8b0000]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {departmentName(f)}
                            {(f.email || f.institutional_email) && ` · ${f.email || f.institutional_email}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected recipient chip */}
                <div className="flex items-center gap-3 bg-[#8b0000]/5 border border-[#8b0000]/20 rounded-lg px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#8b0000]/10 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-[#8b0000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{composeRecipient.name}</p>
                    <p className="text-xs text-gray-500">{departmentName(composeRecipient)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setComposeRecipient(null)}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Subject <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="e.g. Profile review update"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={composeNote}
                    onChange={(e) => setComposeNote(e.target.value)}
                    placeholder="Write your message here…"
                    rows={6}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 resize-none"
                  />
                </div>

                {composeError && <p className="text-xs text-red-600">{composeError}</p>}

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={() => setShowCompose(false)} disabled={composeSending}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={composeSending}
                    className="bg-[#8b0000] hover:bg-[#700000] text-white"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {composeSending ? "Sending…" : "Send Message"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recipient Profile Side Panel ─────────────────────────────────────── */}
      {profilePanel && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) setProfilePanel(null); }}
        >
          <div style={{ background: "#fff", width: "100%", maxWidth: "28rem", height: "100%", overflowY: "auto" }} className="shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{profilePanel.name}</h2>
                  <p className="text-sm text-gray-500">{departmentName(profilePanel)}</p>
                  <p className="text-sm text-gray-400">{profilePanel.email || profilePanel.institutional_email}</p>
                </div>
                <button onClick={() => setProfilePanel(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setProfilePanel(null);
                  setComposeRecipient(profilePanel);
                  setShowCompose(true);
                }}
                className="bg-[#8b0000] hover:bg-[#700000] text-white w-full"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Message this Faculty
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                  <div className="text-xl font-light text-gray-900">{profilePanel.article_count || 0}</div>
                  <div className="text-xs text-gray-500">Papers</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                  <div className="text-xl font-light text-gray-900">{profilePanel.patent_count || 0}</div>
                  <div className="text-xs text-gray-500">Patents</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                  <div className="text-xl font-light text-gray-900">{profilePanel.project_count || 0}</div>
                  <div className="text-xs text-gray-500">Projects</div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <p className="text-gray-900">{profilePanel.review_status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Visibility</p>
                  <p className="text-gray-900">{profilePanel.profile_visibility ? "Visible" : "Hidden"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total Citations</p>
                  <p className="text-gray-900">{(profilePanel.total_citations || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
