import { useEffect, useRef, useState, useMemo } from "react";
import {
  Inbox, ShieldAlert, Ticket, Clock, CheckCircle2, XCircle,
  Plus, X, Send, MessageSquare, Search, Users, ChevronDown, ChevronUp,
} from "lucide-react";
import { authAPI, facultyInquiriesAPI, ticketsAPI, portalMessagesAPI, facultyAPI } from "../../utils/api";
import { Button } from "../ui/button";

// ── Types ────────────────────────────────────────────────────────────────────

type AdminMessage = {
  id: number;
  status: "pending" | "reviewed" | "closed";
  created_at: string;
  from_faculty_name: string;
  message_subject?: string;
  note: string;
};

type PortalMessage = {
  id: number;
  sender_id?: number;
  sender_name?: string;
  sender_department?: string;
  recipient_id?: number;
  recipient_name?: string;
  recipient_department?: string;
  subject: string;
  body: string;
  is_read?: boolean;
  created_at: string;
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
};

type FacultyOption = { id: number; name: string; department: string };

// ── Constants ────────────────────────────────────────────────────────────────

const TICKET_TYPE_LABELS: Record<string, string> = {
  bug: "Bug Report",
  account: "Account Issue",
  content: "Content / Data Issue",
  feature: "Feature Request",
  other: "Other",
};

const TICKET_STATUS_CLASS: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const MSG_STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

type Tab = "inbox" | "admin" | "tickets";
type ComposeMode = "message" | "ticket";

// ── Toggle helper ─────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${on ? "bg-[#8b0000]" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  // Inbox (faculty→faculty)
  const [inbox, setInbox] = useState<PortalMessage[]>([]);
  const [sent, setSent] = useState<PortalMessage[]>([]);
  const [myFacultyId, setMyFacultyId] = useState<number | null>(null);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxError, setInboxError] = useState("");
  const [expandedThread, setExpandedThread] = useState<number | null>(null);

  // Admin messages
  const [adminMsgs, setAdminMsgs] = useState<AdminMessage[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState("");

  // Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");

  // Compose modal
  const [composeMode, setComposeMode] = useState<ComposeMode>("message");
  const [showCompose, setShowCompose] = useState(false);

  // Compose — message fields
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientOptions, setRecipientOptions] = useState<FacultyOption[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<FacultyOption | null>(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendMsgError, setSendMsgError] = useState("");
  const [sendMsgSuccess, setSendMsgSuccess] = useState(false);

  // Compose — ticket fields
  const [ticketType, setTicketType] = useState("bug");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      portalMessagesAPI.inbox(),
      portalMessagesAPI.sent(),
      authAPI.me(),
    ])
      .then(([inboxRes, sentRes, me]) => {
        setInbox(inboxRes.results ?? []);
        setSent(sentRes.results ?? []);
        setMyFacultyId(me?.id ?? null);
      })
      .catch((err) => setInboxError(err?.message || "Unable to load messages."))
      .finally(() => setInboxLoading(false));

    facultyInquiriesAPI.list()
      .then((res) => {
        const all = res.results ?? [];
        setAdminMsgs(all.filter((m: any) => m.source_type === "admin"));
      })
      .catch((err) => setAdminError(err?.message || "Unable to load admin messages."))
      .finally(() => setAdminLoading(false));

    ticketsAPI.list()
      .then((res) => setTickets(res.results ?? []))
      .catch((err) => setTicketsError(err?.message || "Unable to load tickets."))
      .finally(() => setTicketsLoading(false));
  }, []);

  // ── Faculty search for recipient picker ───────────────────────────────────

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!recipientSearch.trim()) { setRecipientOptions([]); return; }
    searchDebounce.current = setTimeout(async () => {
      try {
        const data = await facultyAPI.getAll();
        const list: any[] = Array.isArray(data) ? data : data?.results ?? [];
        const q = recipientSearch.toLowerCase();
        const filtered = list
          .filter((f: any) => {
            if (f.user == null) return false; // no portal account — can't receive messages
            const name = (f.name || `${f.first_name || ""} ${f.last_name || ""}`).trim().toLowerCase();
            return name.includes(q);
          })
          .slice(0, 8)
          .map((f: any) => ({
            id: f.id,
            name: (f.name || `${f.first_name || ""} ${f.last_name || ""}`).trim() || f.faculty_id,
            department: f.department || "",
          }));
        setRecipientOptions(filtered);
      } catch { setRecipientOptions([]); }
    }, 300);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [recipientSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const replyToAdmin = (msg: AdminMessage) => {
    setComposeMode("ticket");
    setShowCompose(true);
    setSendMsgError(""); setSendMsgSuccess(false);
    setSelectedRecipient(null); setRecipientSearch(""); setMsgSubject(""); setMsgBody("");
    setSubmitError("");
    setTicketType("other");
    setTicketSubject(msg.message_subject && !msg.message_subject.startsWith("Re:") ? `Re: ${msg.message_subject}` : msg.message_subject || "Re: Admin Message");
    setTicketDesc("");
  };

  const updateAdminMsgStatus = async (id: number, status: "reviewed" | "closed") => {
    try {
      const updated = await facultyInquiriesAPI.update(id, { status });
      setAdminMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status: updated.status } : m)));
    } catch (err: any) {
      setAdminError(err?.message || "Failed to update.");
    }
  };

  const markRead = async (id: number) => {
    try {
      await portalMessagesAPI.markRead(id);
      setInbox((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch {}
  };

  const handleSendMessage = async () => {
    if (!selectedRecipient) { setSendMsgError("Please select a recipient."); return; }
    if (!msgBody.trim()) { setSendMsgError("Message body is required."); return; }
    setSendingMsg(true);
    setSendMsgError("");
    try {
      await portalMessagesAPI.send({ recipient_id: selectedRecipient.id, subject: msgSubject.trim(), body: msgBody.trim() });
      setSendMsgSuccess(true);
      portalMessagesAPI.sent().then((res) => setSent(res.results ?? [])).catch(() => {});
    } catch (err: any) {
      setSendMsgError(err?.message || "Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim()) { setSubmitError("Subject is required."); return; }
    if (!ticketDesc.trim()) { setSubmitError("Description is required."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const newTicket = await ticketsAPI.submit({ ticket_type: ticketType, subject: ticketSubject.trim(), description: ticketDesc.trim() });
      setTickets((prev) => [newTicket, ...prev]);
      setShowCompose(false);
      setTicketSubject(""); setTicketDesc(""); setTicketType("bug");
      setActiveTab("tickets");
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCompose = (mode: ComposeMode) => {
    setComposeMode(mode);
    setShowCompose(true);
    setSendMsgError(""); setSendMsgSuccess(false);
    setSelectedRecipient(null); setRecipientSearch(""); setMsgSubject(""); setMsgBody("");
    setSubmitError(""); setTicketSubject(""); setTicketDesc(""); setTicketType("bug");
  };

  const replyTo = (msg: PortalMessage & { direction?: "received" | "sent" }) => {
    setComposeMode("message");
    setShowCompose(true);
    setSendMsgError(""); setSendMsgSuccess(false);
    setRecipientSearch(""); setMsgBody("");
    setSubmitError(""); setTicketSubject(""); setTicketDesc(""); setTicketType("bug");
    // Other person is always the sender for received, or recipient for sent
    const otherId   = msg.direction === "sent" ? msg.recipient_id   : msg.sender_id;
    const otherName = msg.direction === "sent" ? msg.recipient_name  : msg.sender_name;
    const otherDept = msg.direction === "sent" ? msg.recipient_department : msg.sender_department;
    setSelectedRecipient(otherId != null ? { id: otherId, name: otherName || "", department: otherDept || "" } : null);
    setMsgSubject(msg.subject && !msg.subject.startsWith("Re:") ? `Re: ${msg.subject}` : msg.subject || "");
  };

  const closeCompose = () => { setShowCompose(false); setSendMsgSuccess(false); };

  // ── Thread grouping ────────────────────────────────────────────────────────
  // Each message is tagged with direction + the "other person".
  // All messages with the same other-person are grouped into one thread,
  // sorted newest-first within the thread.

  type ThreadedMessage = PortalMessage & { direction: "received" | "sent" };

  const threads = useMemo(() => {
    const all: ThreadedMessage[] = [
      ...inbox.map((m) => ({ ...m, direction: "received" as const })),
      ...sent.map((m) => ({ ...m, direction: "sent" as const })),
    ];
    // Group by the other person's ID
    const map = new Map<number, ThreadedMessage[]>();
    for (const m of all) {
      const otherId = m.direction === "received" ? (m.sender_id ?? 0) : (m.recipient_id ?? 0);
      if (!map.has(otherId)) map.set(otherId, []);
      map.get(otherId)!.push(m);
    }
    // Sort each thread oldest→newest, then return threads sorted by most recent message
    const result = Array.from(map.entries()).map(([otherId, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const latest = sorted[sorted.length - 1];
      const otherName = latest.direction === "received" ? latest.sender_name : latest.recipient_name;
      const otherDept = latest.direction === "received" ? latest.sender_department : latest.recipient_department;
      const hasUnread = sorted.some((m) => m.direction === "received" && !m.is_read);
      return { otherId, otherName: otherName || "", otherDept: otherDept || "", msgs: sorted, latest, hasUnread };
    });
    return result.sort((a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime());
  }, [inbox, sent]);

  // ── Tab badge counts ────────────────────────────────────────────────────────

  const unreadInbox = threads.filter((t) => t.hasUnread).length;
  const unreadAdmin = adminMsgs.filter((m) => m.status === "pending").length;
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  const TabBtn = ({ tab, label, count }: { tab: Tab; label: string; count: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab ? "bg-[#8b0000] text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>
          {count}
        </span>
      )}
    </button>
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Faculty messages, admin communications, and support</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCompose("message")} className="bg-[#8b0000] hover:bg-[#700000] text-white shrink-0">
            <MessageSquare className="w-4 h-4 mr-1.5" /> New Message
          </Button>
          <Button onClick={() => openCompose("ticket")} variant="outline" className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" /> New Ticket
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 flex-wrap">
        <TabBtn tab="inbox" label="Faculty Messages" count={unreadInbox} />
        <TabBtn tab="admin" label="From Admin" count={unreadAdmin} />
        <TabBtn tab="tickets" label="Support Tickets" count={openTickets} />
      </div>

      {/* ── Faculty Messages (threaded) ── */}
      {activeTab === "inbox" && (
        <>
          {inboxError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{inboxError}</div>}

          {inboxLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">Loading…</div>
          ) : threads.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">Messages with other faculty will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => {
                const isOpen = expandedThread === thread.otherId;
                const latest = thread.latest;
                return (
                  <div key={thread.otherId} className={`bg-white border rounded-lg overflow-hidden transition-all ${thread.hasUnread ? "border-[#8b0000]/30 shadow-sm" : "border-gray-200"}`}>
                    {/* Thread header — click to expand */}
                    <button
                      type="button"
                      style={{ padding: "20px 40px" }}
                      className="w-full text-left flex items-center gap-4 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedThread(isOpen ? null : thread.otherId)}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#8b0000]/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#8b0000]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">{thread.otherName}</p>
                          {thread.hasUnread && (
                            <span className="text-xs font-semibold text-[#8b0000] bg-[#8b0000]/10 border border-[#8b0000]/20 rounded-full px-2 py-0.5 shrink-0">New</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {latest.subject || "(No subject)"}
                          <span className="mx-1.5 text-gray-300">·</span>
                          {fmtDate(latest.created_at)}
                          <span className="mx-1.5 text-gray-300">·</span>
                          {thread.msgs.length} message{thread.msgs.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>

                    {/* Expanded thread messages */}
                    {isOpen && (
                      <div className="border-t border-gray-100 divide-y divide-gray-100">
                        {thread.msgs.map((msg) => (
                          <div
                            key={msg.id}
                            style={{ padding: "20px 40px" }}
                            className={msg.direction === "sent" ? "bg-gray-50" : "bg-white"}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${msg.direction === "sent" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-600 border-gray-200"}`}>
                                {msg.direction === "sent" ? "You" : thread.otherName}
                              </span>
                              <span className="text-xs text-gray-400">{fmtDate(msg.created_at)}</span>
                              {msg.direction === "received" && !msg.is_read && (
                                <span className="text-xs font-semibold text-[#8b0000] bg-[#8b0000]/10 border border-[#8b0000]/20 rounded-full px-2 py-0.5">New</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                            {msg.direction === "received" && !msg.is_read && (
                              <button className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline" onClick={() => markRead(msg.id)}>
                                Mark read
                              </button>
                            )}
                          </div>
                        ))}
                        {/* Reply bar at bottom of thread */}
                        <div style={{ padding: "16px 40px 20px" }} className="bg-gray-50 flex justify-end">
                          <Button size="sm" className="bg-[#8b0000] hover:bg-[#700000] text-white" onClick={() => replyTo(thread.latest)}>
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Reply
                          </Button>
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

      {/* ── From Admin ── */}
      {activeTab === "admin" && (
        <>
          {adminError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{adminError}</div>}
          {adminLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">Loading…</div>
          ) : adminMsgs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No admin messages</p>
              <p className="text-sm text-gray-500 mt-1">Messages from the admin team will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminMsgs.map((msg) => (
                <div key={msg.id} style={{ padding: "24px 40px" }} className="bg-white border border-[#8b0000]/20 rounded-lg">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b0000] bg-[#8b0000]/10 border border-[#8b0000]/20 rounded-full px-2.5 py-0.5">
                          <ShieldAlert className="w-3 h-3" /> Admin
                        </span>
                        <h2 className="text-base font-semibold text-gray-900">{msg.message_subject || "(No subject)"}</h2>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5 ${MSG_STATUS_CLASS[msg.status]}`}>
                          {msg.status === "pending" && <Clock className="w-3 h-3" />}
                          {msg.status === "reviewed" && <CheckCircle2 className="w-3 h-3" />}
                          {msg.status === "closed" && <XCircle className="w-3 h-3" />}
                          {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        From: <span className="font-medium text-gray-700">{msg.from_faculty_name}</span>
                        <span className="mx-2 text-gray-300">·</span>{fmtDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    {msg.note || "No message content."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-[#8b0000] hover:bg-[#700000] text-white" onClick={() => replyToAdmin(msg)}>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Reply
                    </Button>
                    {msg.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => updateAdminMsgStatus(msg.id, "reviewed")}>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Read
                      </Button>
                    )}
                    {msg.status !== "closed" && (
                      <Button size="sm" variant="outline" onClick={() => updateAdminMsgStatus(msg.id, "closed")}>
                        <XCircle className="w-4 h-4 mr-1.5" /> Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Support Tickets ── */}
      {activeTab === "tickets" && (
        <>
          {ticketsError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{ticketsError}</div>}
          {ticketsLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No tickets submitted</p>
              <p className="text-sm text-gray-500 mt-1">Use "New Ticket" to report a bug or request admin support.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} style={{ padding: "24px 40px" }} className="bg-white border border-gray-200 rounded-lg">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5">
                          {TICKET_TYPE_LABELS[ticket.ticket_type] ?? ticket.ticket_type}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5 ${TICKET_STATUS_CLASS[ticket.status]}`}>
                          {(ticket.status === "open" || ticket.status === "in_progress") && <Clock className="w-3 h-3" />}
                          {ticket.status === "resolved" && <CheckCircle2 className="w-3 h-3" />}
                          {ticket.status === "closed" && <XCircle className="w-3 h-3" />}
                          {ticket.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">{ticket.subject}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Submitted {fmtDate(ticket.created_at)}
                        {ticket.resolved_by && ` · Resolved by ${ticket.resolved_by}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">{ticket.description}</p>
                  {ticket.admin_notes && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Admin Response</p>
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">{ticket.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Compose Modal ── */}
      {showCompose && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeCompose(); }}
        >
          <div style={{ background: "#fff", borderRadius: "0.75rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "34rem" }}>

            {/* Modal header + mode toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setComposeMode("message")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${composeMode === "message" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Message Faculty
                </button>
                <button
                  onClick={() => setComposeMode("ticket")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${composeMode === "ticket" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Support Ticket
                </button>
              </div>
              <button onClick={closeCompose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* ── Message Faculty form ── */}
            {composeMode === "message" && (
              sendMsgSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-900">Message sent!</p>
                  <p className="text-sm text-gray-500 mt-1">Your message was delivered to {selectedRecipient?.name}.</p>
                  <Button className="mt-5 bg-[#8b0000] hover:bg-[#700000] text-white" onClick={closeCompose}>Done</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recipient search */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To <span className="text-red-500">*</span></label>
                    {selectedRecipient ? (
                      <div className="flex items-center gap-2 px-3 py-2 border border-[#8b0000]/40 bg-[#8b0000]/5 rounded-lg">
                        <span className="flex-1 text-sm font-medium text-gray-900">{selectedRecipient.name}</span>
                        {selectedRecipient.department && <span className="text-xs text-gray-400">{selectedRecipient.department}</span>}
                        <button onClick={() => { setSelectedRecipient(null); setRecipientSearch(""); }} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                          placeholder="Search faculty by name…"
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                          autoFocus
                        />
                        {recipientOptions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
                            {recipientOptions.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => { setSelectedRecipient(opt); setRecipientSearch(""); setRecipientOptions([]); }}
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-900">{opt.name}</p>
                                {opt.department && <p className="text-xs text-gray-400">{opt.department}</p>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                    <input
                      type="text"
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      placeholder="Optional subject line"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Message <span className="text-red-500">*</span></label>
                    <textarea
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      placeholder="Write your message…"
                      rows={5}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 resize-none"
                    />
                  </div>
                  {sendMsgError && <p className="text-xs text-red-600">{sendMsgError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={closeCompose} disabled={sendingMsg}>Cancel</Button>
                    <Button onClick={handleSendMessage} disabled={sendingMsg} className="bg-[#8b0000] hover:bg-[#700000] text-white">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {sendingMsg ? "Sending…" : "Send Message"}
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* ── Support Ticket form ── */}
            {composeMode === "ticket" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Issue Type</label>
                  <select value={ticketType} onChange={(e) => setTicketType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 bg-white">
                    <option value="bug">Bug Report</option>
                    <option value="account">Account Issue</option>
                    <option value="content">Content / Data Issue</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject <span className="text-red-500">*</span></label>
                  <input type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Describe the issue in detail…"
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 resize-none" />
                </div>
                {submitError && <p className="text-xs text-red-600">{submitError}</p>}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeCompose} disabled={submitting}>Cancel</Button>
                  <Button onClick={handleSubmitTicket} disabled={submitting} className="bg-[#8b0000] hover:bg-[#700000] text-white">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submitting ? "Submitting…" : "Submit Ticket"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
