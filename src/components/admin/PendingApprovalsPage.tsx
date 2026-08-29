import { useState, useEffect, useMemo } from "react";
import { adminAPI, type AdminFaculty, type DirectoryCandidate, type DirectoryMatchType } from "../../utils/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  FileText,
  Building2,
  Link2,
} from "lucide-react";

/**
 * These records are pending because `import_su_directory` refused to trust a
 * first-initial-only match against SUdirectory.pdf. Approving one asserts an
 * identity, so the queue shows the reviewer the directory rows the importer
 * considered and what made the match too weak — approving blind is how a
 * mangrove ecologist previously ended up labelled SU Physics faculty.
 */

const MATCH_META: Record<
  DirectoryMatchType,
  { label: string; tone: string; icon: typeof AlertTriangle }
> = {
  exact: { label: "Exact directory match", tone: "bg-green-100 text-green-800", icon: CheckCircle },
  initial: { label: "First initial only", tone: "bg-amber-100 text-amber-800", icon: AlertTriangle },
  ambiguous: { label: "Ambiguous — multiple candidates", tone: "bg-red-100 text-red-800", icon: HelpCircle },
  no_first_name: { label: "No first name to compare", tone: "bg-red-100 text-red-800", icon: HelpCircle },
  unmatched: { label: "Not in the SU directory", tone: "bg-gray-200 text-gray-700", icon: XCircle },
  no_directory: { label: "Directory cache missing", tone: "bg-gray-200 text-gray-700", icon: XCircle },
};

type Filter = "all" | DirectoryMatchType;

function CandidateRow({
  candidate,
  isBest,
}: {
  candidate: DirectoryCandidate;
  isBest: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        isBest ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-gray-900">
          {candidate.first_name} {candidate.last_name}
        </span>
        {isBest && (
          <span className="text-[11px] uppercase tracking-wide font-semibold text-amber-700">
            Closest candidate
          </span>
        )}
      </div>
      <p className="text-gray-600 mt-0.5">{candidate.title || "—"}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
        {candidate.department && <span>{candidate.department}</span>}
        {candidate.room && (
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {candidate.room}
            {candidate.building ? ` · ${candidate.building}` : ""}
          </span>
        )}
        {candidate.phone_ext && <span>x{candidate.phone_ext}</span>}
      </div>
    </div>
  );
}

export function PendingApprovalsPage() {
  const [pending, setPending] = useState<AdminFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: number; reason: string } | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      setPending(await adminAPI.getPendingFaculty());
    } catch (err: any) {
      setError(err.message || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    pending.forEach((f) => {
      const key = f.review_evidence?.match_type ?? "no_directory";
      tally[key] = (tally[key] || 0) + 1;
    });
    return tally;
  }, [pending]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? pending
        : pending.filter((f) => (f.review_evidence?.match_type ?? "no_directory") === filter),
    [pending, filter],
  );

  const remove = (id: number) => setPending((prev) => prev.filter((f) => f.id !== id));

  const handleApprove = async (faculty: AdminFaculty, applyMatch: boolean) => {
    setActionLoading(faculty.id);
    setError("");
    try {
      const result = await adminAPI.approveFaculty(faculty.id, applyMatch);
      const applied = result?.applied_fields ?? [];
      setNotice(
        applied.length
          ? `Approved ${faculty.name} and applied ${applied
              .filter((f) => f !== "review_note")
              .join(", ")} from the directory.`
          : `Approved ${faculty.name}.`,
      );
      remove(faculty.id);
    } catch (err: any) {
      setError(err.message || "Failed to approve faculty.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (faculty: AdminFaculty, reason: string) => {
    setActionLoading(faculty.id);
    setError("");
    try {
      await adminAPI.rejectFaculty(faculty.id, reason);
      setNotice(`Rejected ${faculty.name}.`);
      remove(faculty.id);
      setRejectReason(null);
    } catch (err: any) {
      setError(err.message || "Failed to reject faculty.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Records the SU directory import could not verify on its own. Each one shows the
            directory rows it considered — approve only when the evidence identifies the person.
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              filter === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All ({pending.length})
          </button>
          {(Object.keys(counts) as DirectoryMatchType[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                filter === key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {MATCH_META[key]?.label ?? key} ({counts[key]})
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading pending approvals…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {pending.length === 0 ? "All caught up!" : "Nothing in this filter."}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {pending.length === 0
              ? "No faculty records are currently awaiting review."
              : "Select another category above."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((faculty) => {
            const evidence = faculty.review_evidence;
            const meta = MATCH_META[evidence?.match_type ?? "no_directory"];
            const MatchIcon = meta.icon;
            const best = evidence?.best_match ?? null;
            const isOpen = expanded.has(faculty.id);
            const busy = actionLoading === faculty.id;

            return (
              <div key={faculty.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#ffd100] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{faculty.name || "—"}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {faculty.email && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {faculty.email}
                          </span>
                        )}
                        {faculty.institutional_email && (
                          <span className="text-xs text-green-700 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3 h-3" /> {faculty.institutional_email}
                          </span>
                        )}
                        {faculty.orcid && (
                          <a
                            href={`https://orcid.org/${faculty.orcid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Link2 className="w-3 h-3" /> {faculty.orcid}
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {faculty.primary_department && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {faculty.primary_department}
                          </span>
                        )}
                        {faculty.primary_school && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {faculty.primary_school}
                          </span>
                        )}
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${meta.tone}`}>
                          <MatchIcon className="w-3 h-3" /> {meta.label}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {faculty.article_count} papers · {faculty.total_citations} citations
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {best ? (
                      <button
                        onClick={() => handleApprove(faculty, true)}
                        disabled={busy}
                        title={`Applies ${best.title}, ${best.department} to this record`}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm match
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(faculty, false)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    <div className="flex items-center gap-2">
                      {best && (
                        <button
                          onClick={() => handleApprove(faculty, false)}
                          disabled={busy}
                          title="Approve the record without writing the directory details"
                          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Approve only
                        </button>
                      )}
                      <button
                        onClick={() => setRejectReason({ id: faculty.id, reason: "" })}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {evidence && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700">{evidence.reason}</p>

                    {best && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Directory row this would apply
                        </p>
                        <CandidateRow candidate={best} isBest />
                      </div>
                    )}

                    {evidence.candidates.length > (best ? 1 : 0) && (
                      <button
                        onClick={() => toggle(faculty.id)}
                        className="mt-3 text-xs text-blue-600 hover:underline"
                      >
                        {isOpen ? "Hide" : "Show"} all {evidence.candidates.length} directory rows
                        with this surname
                      </button>
                    )}

                    {isOpen && (
                      <div className="mt-2 space-y-2">
                        {evidence.candidates.map((candidate, i) => (
                          <CandidateRow
                            key={`${candidate.first_name}-${candidate.room}-${i}`}
                            candidate={candidate}
                            isBest={
                              !!best &&
                              candidate.first_name === best.first_name &&
                              candidate.room === best.room
                            }
                          />
                        ))}
                      </div>
                    )}

                    {evidence.recent_papers && evidence.recent_papers.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Recent papers attributed to this record
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          {evidence.recent_papers.map((title, i) => (
                            <li key={i} className="truncate">
                              {title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {rejectReason?.id === faculty.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">
                      Optional: reason for rejection (stored on the record)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. External co-author, not SU faculty"
                        value={rejectReason.reason}
                        onChange={(e) => setRejectReason({ ...rejectReason, reason: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                      <button
                        onClick={() => handleReject(faculty, rejectReason.reason)}
                        disabled={busy}
                        className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectReason(null)}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
