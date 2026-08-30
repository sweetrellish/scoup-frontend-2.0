import { useState, useEffect, useMemo, useCallback } from "react";
import { adminAPI, type AdminPaper } from "../../utils/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  Users,
  UserX,
  Quote,
  Tag,
  CalendarDays,
  BookOpen,
} from "lucide-react";

/**
 * The 5,982 papers restored from the 2026-08-30 purge sit here. They were purged
 * for having no linked SU faculty and no confirmable Salisbury University
 * affiliation, then restored as `review_status='pending'` — hidden from every
 * public endpoint — so the call is made by a person, one record at a time, rather
 * than the purge being silently undone or silently kept.
 *
 * Every row therefore shows the same evidence the automated check used: whether an
 * SU faculty profile is actually joined to the paper, the author names the source
 * record claims (which are free text and matched nobody), and the paper's own
 * keywords, so a reviewer can judge whether it reads as Salisbury research or as
 * unrelated content that arrived through a bad author match.
 */

const LIST_LIMIT = 200;

type Evidence = "no_link" | "linked" | "unknown";

const EVIDENCE_META: Record<
  Evidence,
  { label: string; tone: string; icon: typeof AlertTriangle }
> = {
  no_link: {
    label: "No SU faculty profile linked",
    tone: "bg-red-100 text-red-600",
    icon: UserX,
  },
  linked: {
    label: "SU faculty profile linked",
    tone: "bg-green-100 text-green-800",
    icon: Users,
  },
  unknown: {
    label: "Link status not reported",
    tone: "bg-gray-200 text-gray-700",
    icon: AlertTriangle,
  },
};

/**
 * `linked_faculty` is absent on a backend that predates it. That is not the same
 * as "no faculty are linked", so it maps to `unknown` and the row makes no claim.
 */
function evidenceOf(paper: AdminPaper): Evidence {
  if (!paper.linked_faculty) return "unknown";
  return paper.linked_faculty.length > 0 ? "linked" : "no_link";
}

type Filter = "all" | Evidence | "no_keywords";

function KeywordChips({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        No keywords are recorded on this paper — there is nothing here to judge the
        subject matter by.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {keywords.map((kw, i) => (
        <span
          key={`${kw}-${i}`}
          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
        >
          {kw}
        </span>
      ))}
    </div>
  );
}

export function PendingPapersPage() {
  const [papers, setPapers] = useState<AdminPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: number; reason: string } | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkReject, setBulkReject] = useState<string | null>(null);

  const fetchPapers = useCallback(async (term: string) => {
    setLoading(true);
    setError("");
    try {
      const page = await adminAPI.getPapers({
        status: "pending",
        search: term,
        limit: LIST_LIMIT,
      });
      setPapers(page.results || []);
      setTotal(page.count ?? (page.results || []).length);
      setSelected(new Set());
    } catch (err: any) {
      setError(err.message || "Failed to load pending papers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers(query);
  }, [fetchPapers, query]);

  // Title search runs server-side; debounced so typing does not fire 200-row reads.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    papers.forEach((p) => {
      const key = evidenceOf(p);
      tally[key] = (tally[key] || 0) + 1;
      if (p.keywords.length === 0) {
        tally.no_keywords = (tally.no_keywords || 0) + 1;
      }
    });
    return tally;
  }, [papers]);

  const visible = useMemo(() => {
    if (filter === "all") return papers;
    if (filter === "no_keywords") return papers.filter((p) => p.keywords.length === 0);
    return papers.filter((p) => evidenceOf(p) === filter);
  }, [papers, filter]);

  const remove = (ids: number[]) => {
    const gone = new Set(ids);
    setPapers((prev) => prev.filter((p) => !gone.has(p.id)));
    setTotal((prev) => Math.max(0, prev - ids.length));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleApprove = async (paper: AdminPaper) => {
    setActionLoading(paper.id);
    setError("");
    try {
      await adminAPI.approvePaper(paper.id);
      setNotice(`Approved "${paper.title}" — it is public again.`);
      remove([paper.id]);
    } catch (err: any) {
      setError(err.message || "Failed to approve paper.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paper: AdminPaper, reason: string) => {
    setActionLoading(paper.id);
    setError("");
    try {
      await adminAPI.rejectPaper(paper.id, reason);
      setNotice(`Rejected "${paper.title}" — it stays hidden.`);
      remove([paper.id]);
      setRejectReason(null);
    } catch (err: any) {
      setError(err.message || "Failed to reject paper.");
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Bulk actions only ever cover rows the reviewer ticked on this screen. There is
   * deliberately no "approve everything" — the whole point of restoring these as
   * pending was that 5,982 papers should not change state in one click.
   */
  const handleBulk = async (action: "approve" | "reject", reason = "") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkBusy(true);
    setError("");
    try {
      const result = await adminAPI.bulkPaperAction(action, ids, reason);
      setNotice(
        `${action === "approve" ? "Approved" : "Rejected"} ${result.updated} paper${
          result.updated === 1 ? "" : "s"
        }.`,
      );
      remove(ids);
      setBulkReject(null);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} the selected papers.`);
    } finally {
      setBulkBusy(false);
    }
  };

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelected = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));

  const toggleSelectAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((p) => next.delete(p.id));
      else visible.forEach((p) => next.add(p.id));
      return next;
    });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Papers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Papers held back because no SU faculty profile is linked to them and no
            Salisbury University affiliation could be confirmed. Each row shows the
            evidence — approve only when the paper reads as real SU research.
          </p>
        </div>
        <button
          onClick={() => fetchPapers(query)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pending paper titles…"
          className="w-full pl-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ paddingRight: "0.75rem" }}
        />
      </div>

      {papers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              filter === "all"
                ? "bg-[#8b0000] text-white border-transparent"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All ({papers.length})
          </button>
          {(Object.keys(EVIDENCE_META) as Evidence[])
            .filter((key) => counts[key])
            .map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  filter === key
                    ? "bg-[#8b0000] text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {EVIDENCE_META[key].label} ({counts[key]})
              </button>
            ))}
          {counts.no_keywords > 0 && (
            <button
              onClick={() => setFilter("no_keywords")}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                filter === "no_keywords"
                  ? "bg-[#8b0000] text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              No keywords ({counts.no_keywords})
            </button>
          )}
        </div>
      )}

      {!loading && total > papers.length && (
        <p className="text-xs text-gray-500 mb-3">
          Showing the {papers.length} most recent of {total.toLocaleString()} pending
          papers. Narrow the queue with the search box above — the rest stay hidden from
          the public site until they are reviewed.
        </p>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
          {notice}
        </div>
      )}

      {visible.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="w-4 h-4"
            />
            {selected.size > 0
              ? `${selected.size} selected`
              : `Select all ${visible.length} shown`}
          </label>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulk("approve")}
                disabled={bulkBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Approve {selected.size}
              </button>
              <button
                onClick={() => setBulkReject("")}
                disabled={bulkBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Reject {selected.size}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {bulkReject !== null && (
        <div className="mb-4 p-3 rounded-lg bg-white border border-red-300">
          <p className="text-sm text-gray-600 mb-2">
            Reject {selected.size} paper{selected.size === 1 ? "" : "s"}. They stay
            hidden and the reason is stored on every one of them.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Not Salisbury University research"
              value={bulkReject}
              onChange={(e) => setBulkReject(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            />
            <button
              onClick={() => handleBulk("reject", bulkReject)}
              disabled={bulkBusy}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setBulkReject(null)}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading pending papers…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {papers.length === 0
              ? query
                ? "No pending paper matches that title."
                : "All caught up!"
              : "Nothing in this filter."}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {papers.length === 0
              ? query
                ? "Try a different search term."
                : "No papers are currently awaiting review."
              : "Select another category above."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((paper) => {
            const evidence = evidenceOf(paper);
            const meta = EVIDENCE_META[evidence];
            const EvidenceIcon = meta.icon;
            const isOpen = expanded.has(paper.id);
            const busy = actionLoading === paper.id;
            const link = paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : "");

            return (
              <div key={paper.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected.has(paper.id)}
                      onChange={() => toggleSelected(paper.id)}
                      className="w-4 h-4 mt-1 shrink-0"
                      aria-label={`Select ${paper.title}`}
                    />
                    <div className="w-10 h-10 rounded-full bg-[#ffd100] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div className="min-w-0">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-gray-900 hover:text-[#8b0000] hover:underline flex items-start gap-1"
                        >
                          {paper.title || "Untitled"}
                          <ExternalLink className="w-3 h-3 shrink-0 mt-1" />
                        </a>
                      ) : (
                        <p className="font-semibold text-gray-900">{paper.title || "Untitled"}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {paper.journal && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {paper.journal}
                          </span>
                        )}
                        {paper.doi && (
                          <span className="text-xs text-gray-400">{paper.doi}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-[#ffd100] text-[#8b0000] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${meta.tone}`}>
                          <EvidenceIcon className="w-3 h-3" /> {meta.label}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {paper.year ?? "Year unknown"}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Quote className="w-3 h-3" />
                          {paper.citations} citations
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {paper.keywords.length} keywords
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(paper)}
                      disabled={busy}
                      title="Makes this paper public again"
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectReason({ id: paper.id, reason: "" })}
                      disabled={busy}
                      title="Keeps this paper hidden"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Linked SU faculty
                  </p>
                  {evidence === "linked" ? (
                    <div className="flex flex-wrap gap-1">
                      {paper.linked_faculty!.map((f) => (
                        <span
                          key={f.id}
                          className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                        >
                          {f.name}
                          {f.department ? ` · ${f.department}` : ""}
                        </span>
                      ))}
                    </div>
                  ) : evidence === "no_link" ? (
                    <p className="text-sm text-gray-700">
                      None. No Salisbury University faculty profile is joined to this
                      paper, and its institutional affiliation could not be confirmed
                      against the SU employee directory.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      This backend does not report linked faculty, so no claim is made
                      either way for this row.
                    </p>
                  )}

                  {paper.faculty_members.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Author names on the source record
                      </p>
                      <p className="text-xs text-gray-400 mb-1">
                        Free text from the source metadata — none of these matched an SU
                        faculty profile.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {paper.faculty_members.map((n, i) => (
                          <span
                            key={`${n}-${i}`}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Keywords
                    </p>
                    <KeywordChips keywords={paper.keywords} />
                  </div>

                  {paper.review_note && (
                    <p className="mt-3 text-xs text-gray-400">
                      Queue note: {paper.review_note}
                    </p>
                  )}

                  {paper.abstract && (
                    <>
                      <button
                        onClick={() => toggle(paper.id)}
                        className="mt-3 text-xs text-blue-600 hover:underline"
                      >
                        {isOpen ? "Hide" : "Show"} abstract
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-sm text-gray-600">
                          {paper.abstract}
                          {paper.abstract.length >= 500 && "…"}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {rejectReason?.id === paper.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">
                      Optional: reason for rejection (stored on the record)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Not Salisbury University research"
                        value={rejectReason.reason}
                        onChange={(e) => setRejectReason({ ...rejectReason, reason: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                      <button
                        onClick={() => handleReject(paper, rejectReason.reason)}
                        disabled={busy}
                        className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
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
