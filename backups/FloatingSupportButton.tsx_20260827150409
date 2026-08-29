import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LifeBuoy, X, Send } from "lucide-react";
import { ticketsAPI, authAPI } from "../utils/api";
import { Button } from "./ui/button";

const TICKET_TYPES = [
  { value: "bug", label: "Bug Report" },
  { value: "account", label: "Account Issue" },
  { value: "content", label: "Content / Data Issue" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" },
];

export function FloatingSupportButton() {
  const isLoggedIn = authAPI.isAuthenticated();

  const [open, setOpen] = useState(false);
  const [ticketType, setTicketType] = useState("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close after success — cleaned up if component unmounts before timer fires
  useEffect(() => {
    if (!success) return;
    closeTimer.current = setTimeout(() => setOpen(false), 2200);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [success]);

  const resetForm = () => {
    setTicketType("bug");
    setSubject("");
    setDescription("");
    setName("");
    setEmail("");
    setError("");
    setSuccess(false);
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!subject.trim()) { setError("Subject is required."); return; }
    if (!description.trim()) { setError("Description is required."); return; }
    if (!isLoggedIn) {
      if (!name.trim()) { setError("Your name is required."); return; }
      if (!email.trim()) { setError("Your email is required."); return; }
    }

    setSubmitting(true);
    setError("");
    try {
      if (isLoggedIn) {
        await ticketsAPI.submit({
          ticket_type: ticketType,
          subject: subject.trim(),
          description: description.trim(),
        });
      } else {
        await ticketsAPI.publicSubmit({
          ticket_type: ticketType,
          subject: subject.trim(),
          description: description.trim(),
          submitter_name: name.trim(),
          submitter_email: email.trim(),
        });
      }
      setSuccess(true); // useEffect watches this and auto-closes after 2.2s
    } catch (e: any) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      {/* Floating lifebuoy button — always visible */}
      <button
        type="button"
        onClick={handleOpen}
        title="Report an issue or request support"
        style={{
          position: "fixed",
          right: "1.5rem",
          bottom: "1.5rem",
          zIndex: 10000,
          width: "3rem",
          height: "3rem",
          borderRadius: "9999px",
          boxShadow: "0 4px 20px rgba(139,0,0,0.35)",
        }}
        className="bg-[#8b0000] text-white shadow-lg hover:bg-[#700000] hover:shadow-xl transition-all flex items-center justify-center"
      >
        <LifeBuoy className="w-5 h-5" />
      </button>

      {/* Modal — anchored above the button */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10001,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            style={{
              position: "fixed",
              right: "24px",
              bottom: "88px",
              left: "max(24px, calc(100vw - 384px))",
              background: "#fff",
              borderRadius: "0.875rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              maxHeight: "calc(100vh - 112px)",
              overflowX: "hidden",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 24px" }} className="flex items-center justify-between bg-[#8b0000]">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-white/80" />
                <h3 className="text-sm font-semibold text-white">Report an Issue</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {success ? (
              <div style={{ padding: "32px 24px" }} className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Ticket submitted!</p>
                <p className="text-xs text-gray-500 mt-1">
                  We'll look into it and get back to you.
                </p>
              </div>
            ) : (
              <div style={{ padding: "24px" }} className="space-y-4">
                {/* Name + email for anonymous users */}
                {!isLoggedIn && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Issue Type
                  </label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 bg-white"
                  >
                    {TICKET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus={isLoggedIn}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened? What did you expect?"
                    rows={4}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 resize-none"
                  />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex gap-2 pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-[#8b0000] hover:bg-[#700000] text-white"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submitting ? "Sending…" : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
