/**
 * Collaboration-inquiry dialog for a faculty member.
 *
 * Posts to the existing throttled endpoint `POST /api/network/inquire/` via
 * `networkAPI.publicInquire` — the single inquiry mechanism in this app. Lives in
 * its own module so the category browser and the Expertise Map share one dialog
 * and one code path rather than growing a second one.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";

import { networkAPI } from "../utils/api";
import { Button } from "./ui/button";

/** Structurally satisfied by `CategoryFaculty` and by the Expertise Map's expert rows. */
export interface InquiryTarget {
  id: number | string;
  name: string;
  department?: string | null;
}

export function ExternalInquiryDialog({
  faculty,
  onClose,
}: {
  faculty: InquiryTarget;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Your name is required."); return; }
    if (!email.trim() || !email.includes("@")) { setError("A valid email address is required."); return; }
    if (!note.trim()) { setError("A message is required so the admin team can understand your request."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await networkAPI.publicInquire({
        target_faculty_name: faculty.name,
        target_faculty_id: String(faculty.id),
        target_department: faculty.department ?? "",
        requester_name: name.trim(),
        requester_email: email.trim(),
        requester_organization: org.trim(),
        note: note.trim(),
      });
      setSuccess(res?.message || "Inquiry submitted. The SCOUP team will follow up with you.");
    } catch (e: any) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "0.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "30rem", border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", margin: 0 }}>
              Send a Request
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
              The SCOUP admin team will follow up to help connect you with this faculty member.
            </p>
          </div>
          <button onClick={onClose} style={{ padding: "0.25rem", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}>
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "0.375rem", padding: "0.75rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0 }}>{faculty.name}</p>
          {faculty.department && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0" }}>{faculty.department}</p>}
        </div>

        {success ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "#166534", margin: 0 }}>{success}</p>
          </div>
        ) : (
          <>
            {/* Name + Email — 2-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Your Name <span style={{ color: "#dc2626" }}>*</span></label>
                <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Your Email <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Organization <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span></label>
                <input value={org} onChange={(e) => setOrg(e.target.value)}
                  placeholder="University / Company / etc."
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Message <span style={{ color: "#dc2626" }}>*</span></label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                placeholder="Briefly describe your interest or collaboration idea…"
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
            </div>
            {error && <p style={{ fontSize: "0.8125rem", color: "#dc2626", marginBottom: "0.75rem" }}>{error}</p>}
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Button variant="outline" onClick={onClose}>{success ? "Close" : "Cancel"}</Button>
          {!success && (
            <Button disabled={submitting} className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]" onClick={handleSubmit}>
              <Send className="w-4 h-4" />
              {submitting ? "Sending…" : "Send Request"}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
