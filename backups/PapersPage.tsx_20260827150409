import { useEffect, useState, useRef } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Plus, Edit2, Trash2, X, Save, ExternalLink, Sparkles,
  ArrowLeft, Upload, Loader2, BookOpen, CheckSquare, Square,
  Eye, EyeOff, FileText, Check,
} from "lucide-react";
import { papersAPI } from "../../utils/api";

type PaperStatus = "published" | "in-review" | "draft";

interface Paper {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: number | string | null;
  doi: string;
  abstract: string;
  keywords: string[];
  status: PaperStatus;
}

type View = "list" | "edit" | "new";

const isFakeDoi = (doi: string) =>
  doi.startsWith("cv-import-") || doi.startsWith("manual:");

const statusColors: Record<PaperStatus, string> = {
  published: "bg-green-100 text-green-800",
  "in-review": "bg-yellow-100 text-yellow-800",
  draft: "bg-gray-100 text-gray-600",
};

const emptyForm = (): Omit<Paper, "id"> => ({
  title: "", authors: "", journal: "", year: "", doi: "",
  abstract: "", keywords: [], status: "draft",
});

// ── Edit / New paper full-page view ──────────────────────────────────────────
function EditPaperView({
  paper,
  onSave,
  onCancel,
}: {
  paper?: Paper;
  onSave: (data: Omit<Paper, "id">, id?: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Paper, "id">>(
    paper
      ? {
          title: paper.title,
          authors: paper.authors,
          journal: paper.journal,
          year: paper.year ?? "",
          doi: isFakeDoi(paper.doi) ? "" : paper.doi,
          abstract: paper.abstract,
          keywords: paper.keywords,
          status: paper.status,
        }
      : emptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  // PDF abstract extraction
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // AI keyword generation
  const [generatingKw, setGeneratingKw] = useState(false);
  const [suggestedKw, setSuggestedKw] = useState<string[]>([]);

  const set = (k: keyof typeof form, v: any) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(form, paper?.id);
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setExtracting(true);
    setExtractError("");
    try {
      const res = await papersAPI.extractAbstract(file);
      set("abstract", res.abstract || "");
    } catch (err: any) {
      setExtractError(err.message || "Failed to extract abstract.");
    } finally {
      setExtracting(false);
    }
  };

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !form.keywords.includes(kw)) {
      set("keywords", [...form.keywords, kw]);
      setKeywordInput("");
    }
  };

  const handleGenerateKeywords = async () => {
    if (!form.title.trim()) return;
    setGeneratingKw(true);
    setSuggestedKw([]);
    try {
      const res = await papersAPI.generateKeywords(form.title, form.abstract);
      setSuggestedKw(res.keywords || []);
    } catch {
      // silently fail
    } finally {
      setGeneratingKw(false);
    }
  };

  const acceptSuggestedKw = () => {
    const merged = [...new Set([...form.keywords, ...suggestedKw])];
    set("keywords", merged);
    setSuggestedKw([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back nav */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Papers
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {paper ? "Edit Paper" : "Add New Paper"}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {paper ? "Update the details for this paper." : "Manually add a research paper to your profile."}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title" value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Full paper title"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authors">Authors</Label>
              <Input
                id="authors" value={form.authors}
                onChange={e => set("authors", e.target.value)}
                placeholder="Comma-separated author names"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="journal">Journal / Conference</Label>
              <Input
                id="journal" value={form.journal}
                onChange={e => set("journal", e.target.value)}
                placeholder="Publication venue"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year" value={String(form.year ?? "")}
                onChange={e => set("year", e.target.value)}
                placeholder="2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi" value={form.doi}
                onChange={e => set("doi", e.target.value)}
                placeholder="10.xxxx/xxxxx"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Visibility</Label>
              <select
                id="status"
                value={form.status}
                onChange={e => set("status", e.target.value as PaperStatus)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="draft">Draft (not public)</option>
                <option value="in-review">In Review</option>
                <option value="published">Published (public)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Abstract */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Abstract</h2>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={extracting}
                onClick={() => fileRef.current?.click()}
                className="text-[#8b0000] border-[#8b0000] hover:bg-[#8b0000] hover:text-white"
              >
                {extracting
                  ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Extracting…</>
                  : <><Upload className="w-4 h-4 mr-1.5" /> Upload paper PDF to auto-extract</>}
              </Button>
            </div>
          </div>

          {extractError && (
            <p className="text-xs text-red-600">{extractError}</p>
          )}

          <Textarea
            value={form.abstract}
            onChange={e => set("abstract", e.target.value)}
            placeholder="Paper abstract — or upload the paper PDF above to extract it automatically"
            className="min-h-[140px] text-sm"
          />
          <p className="text-xs text-gray-400">
            You can paste the abstract manually, or upload the paper PDF and AI will extract it for you.
          </p>
        </Card>

        {/* Keywords */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Keywords</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={generatingKw || !form.title.trim()}
              onClick={handleGenerateKeywords}
              className="text-[#8b0000] border-[#8b0000] hover:bg-[#8b0000] hover:text-white"
            >
              {generatingKw
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating…</>
                : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate with AI</>}
            </Button>
          </div>

          {/* AI suggestions */}
          {suggestedKw.length > 0 && (
            <div className="rounded-lg border border-[#ffd100]/60 bg-yellow-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-[#8b0000] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI-suggested keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedKw.map(kw => (
                  <Badge key={kw} className="bg-yellow-100 text-yellow-800 border border-yellow-300">{kw}</Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" size="sm" onClick={acceptSuggestedKw} className="bg-[#8b0000] hover:bg-[#6b0000] text-white h-7 text-xs">
                  <Check className="w-3 h-3 mr-1" /> Accept all
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestedKw([])} className="h-7 text-xs text-gray-500">
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              placeholder="Or type a keyword and press Enter"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
          </div>
          {form.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.keywords.map(kw => (
                <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                  {kw}
                  <button
                    type="button"
                    onClick={() => set("keywords", form.keywords.filter(k => k !== kw))}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={saving} className="bg-[#8b0000] hover:bg-[#6b0000] text-white">
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving…" : "Save Paper"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Main Papers list view ─────────────────────────────────────────────────────
export function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("list");
  const [editTarget, setEditTarget] = useState<Paper | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkPublishing, setBulkPublishing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PaperStatus | "all">("all");
  const [enrichingIds, setEnrichingIds] = useState<Set<number>>(new Set());
  const enrichedRef = useRef(false);

  const normalise = (p: any, i = 0): Paper => ({
    id: p?.id ?? Date.now() + i,
    title: p?.title ?? "",
    authors: Array.isArray(p?.authors)
      ? p.authors.map((a: any) => a?.name ?? a).join(", ")
      : (p?.authors ?? ""),
    journal: p?.journal ?? "",
    year: p?.year ?? (p?.date_published ? new Date(p.date_published).getFullYear() : null),
    doi: p?.doi ?? "",
    abstract: p?.abstract ?? "",
    keywords: Array.isArray(p?.keywords) ? p.keywords : [],
    status:
      p?.status === "published" || p?.status === "in-review" || p?.status === "draft"
        ? p.status
        : "published",
  });

  useEffect(() => {
    setLoading(true);
    papersAPI.getAll()
      .then(data => {
        const rows = Array.isArray(data) ? data : (data?.results ?? []);
        setPapers(rows.map(normalise));
      })
      .catch(err => setError(err?.message || "Unable to load papers."))
      .finally(() => setLoading(false));
  }, []);

  // Lazy CrossRef abstract enrichment — runs once after initial load.
  // For each paper that has a DOI but no abstract, quietly fetch from CrossRef
  // and save it back. Papers update in place as abstracts arrive.
  useEffect(() => {
    if (loading || enrichedRef.current || papers.length === 0) return;

    const toEnrich = papers.filter(
      p => !p.abstract?.trim() && p.doi && !isFakeDoi(p.doi),
    );
    if (toEnrich.length === 0) return;

    enrichedRef.current = true; // prevent re-runs if papers state changes

    let cancelled = false;
    const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").trim();

    const run = async () => {
      setEnrichingIds(new Set(toEnrich.map(p => p.id)));

      for (const paper of toEnrich) {
        if (cancelled) break;
        try {
          const res = await fetch(
            `https://api.crossref.org/works/${encodeURIComponent(paper.doi)}`,
            { headers: { "User-Agent": "SCOUP/1.0 (mailto:scoupteam@gmail.com)" } },
          );
          if (!res.ok) continue;
          const data = await res.json();
          const abstract = stripTags(data?.message?.abstract || "");
          if (abstract && !cancelled) {
            // Persist to backend, then update UI
            await papersAPI.update(paper.id, { abstract }).catch(() => {});
            setPapers(prev =>
              prev.map(p => p.id === paper.id ? { ...p, abstract } : p),
            );
          }
        } catch {
          // network hiccup — skip this paper silently
        }
        setEnrichingIds(prev => { const s = new Set(prev); s.delete(paper.id); return s; });
        if (!cancelled) await new Promise(r => setTimeout(r, 300)); // gentle pacing
      }
    };

    run();
    return () => { cancelled = true; };
  }, [loading]);

  const handleSave = async (form: Omit<Paper, "id">, id?: number) => {
    const payload = {
      title: form.title,
      authors: form.authors,
      journal: form.journal,
      year_input: form.year ? String(form.year) : "",
      doi: form.doi || undefined,
      abstract: form.abstract,
      keywords: form.keywords,
      status: form.status,
    };

    if (id !== undefined) {
      const updated = await papersAPI.update(id, payload);
      setPapers(prev => prev.map(p => p.id === id ? normalise({ ...updated, id }) : p));
    } else {
      const created = await papersAPI.create(payload);
      setPapers(prev => [normalise(created), ...prev]);
    }
    setView("list");
    setEditTarget(undefined);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this paper? This cannot be undone.")) return;
    try {
      await papersAPI.delete(id);
      setPapers(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err: any) {
      setError(err?.message || "Delete failed.");
    }
  };

  const handleBulkPublish = async () => {
    setBulkPublishing(true);
    try {
      const ids = selectedIds.size > 0 ? [...selectedIds] : undefined;
      await papersAPI.bulkPublish(ids);
      setPapers(prev =>
        prev.map(p =>
          (!ids || ids.includes(p.id)) && (p.status === "draft" || p.status === "in-review")
            ? { ...p, status: "published" }
            : p,
        ),
      );
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err?.message || "Bulk publish failed.");
    } finally {
      setBulkPublishing(false);
    }
  };

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const unpublishedPapers = papers.filter(p => p.status === "draft" || p.status === "in-review");
  const filteredPapers =
    statusFilter === "all" ? papers : papers.filter(p => p.status === statusFilter);

  // ── Edit / new view ─────────────────────────────────────────────────────
  if (view === "edit" || view === "new") {
    return (
      <EditPaperView
        paper={editTarget}
        onSave={handleSave}
        onCancel={() => { setView("list"); setEditTarget(undefined); }}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Papers</h1>
          <p className="text-gray-600 mt-1">Manage your research publications</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {unpublishedPapers.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkPublish}
              disabled={bulkPublishing}
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              {bulkPublishing
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Publishing…</>
                : <><Eye className="w-4 h-4 mr-1.5" />
                  {selectedIds.size > 0
                    ? `Publish ${selectedIds.size} selected`
                    : `Publish all (${unpublishedPapers.length})`}
                </>}
            </Button>
          )}
          <Button
            onClick={() => { setEditTarget(undefined); setView("new"); }}
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Paper
          </Button>
        </div>
      </div>

      {loading && <Alert><AlertDescription>Loading papers…</AlertDescription></Alert>}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Filter tabs */}
      {papers.length > 0 && (
        <div className="flex gap-1 border-b border-gray-200 pb-0">
          {(["all", "published", "draft", "in-review"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                statusFilter === f
                  ? "bg-white border border-b-white border-gray-200 text-[#8b0000] -mb-px"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f === "all" ? `All (${papers.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${papers.filter(p => p.status === f).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Papers list */}
      <div className="space-y-3">
        {filteredPapers.map(paper => {
          const displayDoi = isFakeDoi(paper.doi) ? null : paper.doi;
          const isSelected = selectedIds.has(paper.id);
          return (
            <Card
              key={paper.id}
              className={`p-5 transition-all ${paper.status === "draft" ? "border-dashed border-gray-300" : paper.status === "in-review" ? "border-dashed border-yellow-300" : ""} ${isSelected ? "ring-2 ring-[#8b0000]/30" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox for draft/in-review selection */}
                {(paper.status === "draft" || paper.status === "in-review") && (
                  <button
                    onClick={() => toggleSelect(paper.id)}
                    className="mt-0.5 text-gray-400 hover:text-[#8b0000] shrink-0 transition-colors"
                  >
                    {isSelected
                      ? <CheckSquare className="w-5 h-5 text-[#8b0000]" />
                      : <Square className="w-5 h-5" />}
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 flex-1 leading-snug">{paper.title}</h3>
                    <Badge className={`shrink-0 ${statusColors[paper.status]}`}>
                      {paper.status === "draft"
                        ? <><EyeOff className="w-3 h-3 mr-1" />Draft</>
                        : paper.status === "published"
                        ? <><Eye className="w-3 h-3 mr-1" />Published</>
                        : "In Review"}
                    </Badge>
                  </div>

                  {paper.authors && (
                    <p className="text-sm text-gray-600 mb-1">{paper.authors}</p>
                  )}

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-500 mb-2">
                    {paper.journal && <span>{paper.journal}</span>}
                    {paper.year && <span>· {paper.year}</span>}
                    {displayDoi && (
                      <a
                        href={`https://doi.org/${displayDoi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        · {displayDoi}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {paper.abstract
                    ? <p className="text-sm text-gray-600 line-clamp-2 mb-2">{paper.abstract}</p>
                    : enrichingIds.has(paper.id)
                    ? <p className="text-xs text-gray-400 italic mb-2 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Fetching abstract…</p>
                    : <p className="text-xs text-amber-600 italic mb-2">No abstract — edit to add one or upload the paper PDF</p>}

                  {paper.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {paper.keywords.map(kw => (
                        <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditTarget(paper); setView("edit"); }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  {(paper.status === "draft" || paper.status === "in-review") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-700 hover:bg-green-50"
                      onClick={async () => {
                        await papersAPI.bulkPublish([paper.id]);
                        setPapers(prev => prev.map(p => p.id === paper.id ? { ...p, status: "published" } : p));
                      }}
                      title="Publish this paper"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(paper.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredPapers.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No papers yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add papers manually, or use the <strong>Upload CV</strong> tab to extract them automatically.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
