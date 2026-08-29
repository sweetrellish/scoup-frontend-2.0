import { useState, useCallback, useRef } from "react";
import { cvAPI } from "../../utils/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Upload, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Loader2, BookOpen, Lightbulb, FolderOpen, User, X, Check, Search, Plus,
} from "lucide-react";

type Step = "upload" | "analyzing" | "review" | "saving" | "done" | "error";

interface ExtractedPaper {
  title: string; year: number | null; journal: string; doi: string | null;
  authors: string; abstract: string; selected: boolean;
}
interface ExtractedPatent {
  title: string; patent_number: string; year: number | null;
  inventors: string; selected: boolean;
}
interface ExtractedProject {
  title: string; description: string; year: number | null; selected: boolean;
}
interface ExtractedProfile {
  title: string; bio: string; department: string; selected: boolean;
}

function SectionHeader({ icon, label, count, selected, onToggleAll, expanded, onToggleExpand }: {
  icon: React.ReactNode; label: string; count: number; selected: number;
  onToggleAll: (v: boolean) => void; expanded: boolean; onToggleExpand: () => void;
}) {
  const allSelected = count > 0 && selected === count;
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-t-lg cursor-pointer select-none border-b border-gray-100"
      onClick={onToggleExpand}
    >
      <span className="text-[#8b0000]">{icon}</span>
      <span className="font-semibold text-gray-800 flex-1">{label}</span>
      <span className="text-xs text-gray-500 mr-2">{selected}/{count} selected</span>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onToggleAll(!allSelected); }}
        className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 mr-2 transition-colors"
      >
        {allSelected ? "Deselect all" : "Select all"}
      </button>
      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </div>
  );
}

export function PDFUploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState<Record<string, number>>({});

  const [profile, setProfile] = useState<ExtractedProfile>({ title: "", bio: "", department: "", selected: false });
  const [papers, setPapers] = useState<ExtractedPaper[]>([]);
  const [patents, setPatents] = useState<ExtractedPatent[]>([]);
  const [projects, setProjects] = useState<ExtractedProject[]>([]);

  const [expandedSections, setExpandedSections] = useState({ profile: true, papers: true, patents: true, projects: true });
  const toggleSection = (key: keyof typeof expandedSections) =>
    setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  // ── Paper search (manual add) ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [addedDois, setAddedDois] = useState<Set<string>>(new Set());
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    setSearchError("");
    if (!q.trim()) { setSearchResults([]); return; }
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await cvAPI.searchPapers(q.trim());
        setSearchResults(data.results || []);
      } catch {
        setSearchError("Search failed. Try again.");
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  const addSearchResult = (result: any) => {
    const key = result.doi || result.title;
    if (addedDois.has(key)) return;
    setAddedDois(prev => new Set([...prev, key]));
    // Add to papers list as selected
    setPapers(prev => [
      {
        title: result.title || "",
        year: result.year || null,
        journal: result.journal || "",
        doi: result.doi || null,
        authors: result.authors || "",
        abstract: result.abstract || "",
        selected: true,
      },
      ...prev,
    ]);
    // Switch to review mode if not already there
    if (step === "upload" || step === "error") setStep("review");
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file."); return;
    }
    if (file.size > 52428800) {
      setError("File too large. Maximum 50MB."); return;
    }
    setFileName(file.name);
    setError("");
    setAnalyzeProgress(0);
    setStep("analyzing");

    // Animate progress bar while waiting for the API
    const progressInterval = setInterval(() => {
      setAnalyzeProgress(prev => (prev < 85 ? prev + Math.random() * 8 : prev));
    }, 800);

    try {
      const data = await cvAPI.upload(file);
      clearInterval(progressInterval);
      setAnalyzeProgress(100);

      const p = data.profile || {};
      setProfile({
        title: p.title || "", bio: p.bio || "", department: p.department || "",
        selected: !!(p.title || p.bio || p.department),
      });
      setPapers((data.papers || []).map((x: any) => ({ ...x, selected: true })));
      setPatents((data.patents || []).map((x: any) => ({ ...x, selected: true })));
      setProjects((data.projects || []).map((x: any) => ({ ...x, selected: true })));

      setTimeout(() => setStep("review"), 400);
    } catch (err: any) {
      clearInterval(progressInterval);
      const msg = err.message || "";
      const isAiUnavailable = msg.includes("not configured") || msg.includes("AI not available") || msg.includes("503");
      setError(
        isAiUnavailable
          ? "AI extraction is not available in this environment. You can still search and add papers manually using the search bar below."
          : msg || "Failed to analyze PDF. Please try again."
      );
      setStep("error");
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const totalSelected =
    (profile.selected && (profile.title || profile.bio) ? 1 : 0) +
    papers.filter(p => p.selected).length +
    patents.filter(p => p.selected).length +
    projects.filter(p => p.selected).length;

  const handleConfirm = async () => {
    setStep("saving");
    try {
      const result = await cvAPI.confirm({
        profile: profile.selected ? { title: profile.title, bio: profile.bio, department: profile.department } : undefined,
        papers: papers.filter(p => p.selected),
        patents: patents.filter(p => p.selected),
        projects: projects.filter(p => p.selected),
      });
      setSavedCount(result.saved || {});
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Failed to save items.");
      setStep("error");
    }
  };

  const resetUpload = () => {
    setStep("upload");
    setFileName("");
    setAnalyzeProgress(0);
    setError("");
    setPapers([]); setPatents([]); setProjects([]);
    setProfile({ title: "", bio: "", department: "", selected: false });
  };

  // ── Upload / Error step ───────────────────────────────────────────────────
  if (step === "upload" || step === "error") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload CV / Resume</h1>
          <p className="text-gray-600 mt-1">
            Upload your CV and we'll extract your papers, patents, and projects automatically.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload your CV or resume as a PDF. AI will extract your research papers, patents, and projects —
            you'll review and approve everything before anything is saved to your profile.
          </AlertDescription>
        </Alert>

        {/* Drop zone */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Your CV</h2>

          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              dragActive ? "border-[#8b0000] bg-red-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("cv-file-input")?.click()}
          >
            <input id="cv-file-input" type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">
              <span className="text-[#8b0000] font-semibold cursor-pointer hover:text-[#700000]">
                Click to upload
              </span>
              {" "}or drag and drop
            </p>
            <p className="text-sm text-gray-500">PDF files only · max 50MB</p>
          </div>
        </Card>

        {/* Manual paper search */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-1">Search & Add a Paper</h2>
          <p className="text-sm text-gray-500 mb-4">
            Search by title or paste a DOI to add a specific paper directly.
          </p>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#8b0000]/30 focus-within:border-[#8b0000]/40 transition-all">
            <Search className="w-4 h-4 text-gray-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="e.g. Machine learning in healthcare  or  10.1016/j.jbi.2023...."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="flex-1 px-3 py-3 text-sm bg-transparent outline-none placeholder-gray-400"
            />
            {searchLoading && <Loader2 className="w-4 h-4 text-gray-400 mr-3 animate-spin" />}
          </div>

          {searchError && <p className="mt-2 text-xs text-red-600">{searchError}</p>}

          {searchResults.length > 0 && (
            <div className="mt-3 border border-gray-100 rounded-lg divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {searchResults.map((r, i) => {
                const key = r.doi || r.title;
                const alreadyAdded = addedDois.has(key);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{r.title}</p>
                      <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-500">
                        {r.year && <span>{r.year}</span>}
                        {r.journal && <span>· {r.journal}</span>}
                        {r.doi && <span className="text-blue-500">· {r.doi}</span>}
                        <span className="text-gray-400">· {r.source}</span>
                      </div>
                      {r.abstract && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{r.abstract}</p>
                      )}
                    </div>
                    <button
                      onClick={() => addSearchResult(r)}
                      disabled={alreadyAdded}
                      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        alreadyAdded
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-[#8b0000] text-white hover:bg-[#6b0000]"
                      }`}
                    >
                      {alreadyAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && !searchLoading && searchResults.length === 0 && (
            <p className="mt-3 text-sm text-gray-400 text-center py-4">No results found. Try a different title or DOI.</p>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Upload your CV or resume as a PDF — AI extracts all your papers, patents, and projects</li>
            <li>Or search for a specific paper by title or DOI and add it directly</li>
            <li>Abstracts are automatically fetched from CrossRef and Semantic Scholar</li>
            <li>You review and approve exactly what gets added to your profile</li>
            <li>Duplicate papers (matched by DOI) are automatically skipped</li>
          </ul>
        </Card>
      </div>
    );
  }

  // ── Analyzing step ────────────────────────────────────────────────────────
  if (step === "analyzing") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload CV / Resume</h1>
          <p className="text-gray-600 mt-1">Analyzing your document…</p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-[#8b0000]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{fileName}</p>
              <p className="text-sm text-gray-500">Uploading &amp; analyzing</p>
            </div>
            <Loader2 className="w-5 h-5 text-[#8b0000] animate-spin shrink-0" />
          </div>

          <Progress value={analyzeProgress} className="mb-3" />

          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {analyzeProgress < 30
                ? "Extracting text from PDF…"
                : analyzeProgress < 60
                ? "AI is parsing your research outputs…"
                : analyzeProgress < 85
                ? "Fetching abstracts from CrossRef & Semantic Scholar…"
                : "Almost done…"}
            </p>
            <p className="text-xs text-gray-400">This usually takes 15–30 seconds</p>
          </div>
        </Card>
      </div>
    );
  }

  // ── Saving step ───────────────────────────────────────────────────────────
  if (step === "saving") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload CV / Resume</h1>
        </div>
        <Card className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="w-10 h-10 text-[#8b0000] animate-spin" />
          <p className="text-lg font-semibold text-gray-800">Saving your selections…</p>
        </Card>
      </div>
    );
  }

  // ── Done step ─────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload CV / Resume</h1>
        </div>
        <Card className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">All done!</p>
            <p className="text-gray-500 mt-2 text-sm">Your profile has been updated with the following:</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {savedCount.papers > 0 && (
              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                {savedCount.papers} paper{savedCount.papers !== 1 ? "s" : ""} added
              </span>
            )}
            {savedCount.patents > 0 && (
              <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200">
                {savedCount.patents} patent{savedCount.patents !== 1 ? "s" : ""} added
              </span>
            )}
            {savedCount.projects > 0 && (
              <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-medium border border-orange-200">
                {savedCount.projects} project{savedCount.projects !== 1 ? "s" : ""} added
              </span>
            )}
            {savedCount.profile_updated && (
              <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                Profile info updated
              </span>
            )}
          </div>
          <Button variant="outline" onClick={resetUpload}>
            Upload another CV
          </Button>
        </Card>
      </div>
    );
  }

  // ── Review step ───────────────────────────────────────────────────────────
  const hasAnything = !!(profile.title || profile.bio) || papers.length > 0 || patents.length > 0 || projects.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Extracted Items</h1>
          <p className="text-gray-600 mt-1">
            Select what to add to your profile, then click Save.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          <FileText className="w-4 h-4" />
          <span className="max-w-xs truncate">{fileName}</span>
        </div>
      </div>

      {!hasAnything && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No items were extracted from this CV. The PDF may be scanned or have limited text content.
          </AlertDescription>
        </Alert>
      )}

      {/* Search & add more papers inline during review */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-[#8b0000]" />
          <span className="text-sm font-semibold text-gray-800">Add another paper by title or DOI</span>
        </div>
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#8b0000]/30 transition-all">
          <input
            type="text"
            placeholder="Search title or paste DOI…"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none placeholder-gray-400"
          />
          {searchLoading && <Loader2 className="w-4 h-4 text-gray-400 mr-3 animate-spin" />}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-100 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {searchResults.map((r, i) => {
              const key = r.doi || r.title;
              const alreadyAdded = addedDois.has(key);
              return (
                <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{r.title}</p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-500">
                      {r.year && <span>{r.year}</span>}
                      {r.journal && <span>· {r.journal}</span>}
                      {r.doi && <span className="text-blue-500">· {r.doi}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => addSearchResult(r)}
                    disabled={alreadyAdded}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      alreadyAdded
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-[#8b0000] text-white hover:bg-[#6b0000]"
                    }`}
                  >
                    {alreadyAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Profile info */}
      {(profile.title || profile.bio || profile.department) && (
        <Card className="overflow-hidden">
          <SectionHeader
            icon={<User className="w-5 h-5" />}
            label="Profile Information"
            count={1}
            selected={profile.selected ? 1 : 0}
            onToggleAll={v => setProfile(p => ({ ...p, selected: v }))}
            expanded={expandedSections.profile}
            onToggleExpand={() => toggleSection("profile")}
          />
          {expandedSections.profile && (
            <div className="p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={profile.selected}
                  onChange={e => setProfile(p => ({ ...p, selected: e.target.checked }))}
                  className="mt-1 accent-[#8b0000]" />
                <div className="flex-1 text-sm space-y-1">
                  {profile.title && <p><span className="font-medium text-gray-700">Title:</span> {profile.title}</p>}
                  {profile.department && <p><span className="font-medium text-gray-700">Department:</span> {profile.department}</p>}
                  {profile.bio && <p className="text-gray-600 italic">"{profile.bio}"</p>}
                </div>
              </label>
            </div>
          )}
        </Card>
      )}

      {/* Papers */}
      {papers.length > 0 && (
        <Card className="overflow-hidden">
          <SectionHeader
            icon={<BookOpen className="w-5 h-5" />}
            label="Research Papers"
            count={papers.length}
            selected={papers.filter(p => p.selected).length}
            onToggleAll={v => setPapers(ps => ps.map(p => ({ ...p, selected: v })))}
            expanded={expandedSections.papers}
            onToggleExpand={() => toggleSection("papers")}
          />
          {expandedSections.papers && (
            <div className="divide-y divide-gray-100">
              {papers.map((paper, i) => (
                <label key={i} className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={paper.selected}
                    onChange={e => setPapers(ps => ps.map((p, j) => j === i ? { ...p, selected: e.target.checked } : p))}
                    className="mt-1 accent-[#8b0000]" />
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{paper.title}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                        {paper.year && <span>{paper.year}</span>}
                        {paper.journal && <span>· {paper.journal}</span>}
                        {paper.doi && <span className="text-blue-500">· {paper.doi}</span>}
                      </div>
                      {paper.abstract
                        ? <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{paper.abstract}</p>
                        : <p className="mt-1 text-xs text-gray-400 italic">No abstract found</p>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Patents */}
      {patents.length > 0 && (
        <Card className="overflow-hidden">
          <SectionHeader
            icon={<Lightbulb className="w-5 h-5" />}
            label="Patents"
            count={patents.length}
            selected={patents.filter(p => p.selected).length}
            onToggleAll={v => setPatents(ps => ps.map(p => ({ ...p, selected: v })))}
            expanded={expandedSections.patents}
            onToggleExpand={() => toggleSection("patents")}
          />
          {expandedSections.patents && (
            <div className="divide-y divide-gray-100">
              {patents.map((patent, i) => (
                <label key={i} className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={patent.selected}
                    onChange={e => setPatents(ps => ps.map((p, j) => j === i ? { ...p, selected: e.target.checked } : p))}
                    className="mt-1 accent-[#8b0000]" />
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg shrink-0">
                      <Lightbulb className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{patent.title}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500">
                        {patent.patent_number && <span>{patent.patent_number}</span>}
                        {patent.year && <span>· {patent.year}</span>}
                        {patent.inventors && <span>· {patent.inventors}</span>}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Card className="overflow-hidden">
          <SectionHeader
            icon={<FolderOpen className="w-5 h-5" />}
            label="Projects"
            count={projects.length}
            selected={projects.filter(p => p.selected).length}
            onToggleAll={v => setProjects(ps => ps.map(p => ({ ...p, selected: v })))}
            expanded={expandedSections.projects}
            onToggleExpand={() => toggleSection("projects")}
          />
          {expandedSections.projects && (
            <div className="divide-y divide-gray-100">
              {projects.map((project, i) => (
                <label key={i} className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={project.selected}
                    onChange={e => setProjects(ps => ps.map((p, j) => j === i ? { ...p, selected: e.target.checked } : p))}
                    className="mt-1 accent-[#8b0000]" />
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg shrink-0">
                      <FolderOpen className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{project.title}</p>
                      {project.year && <p className="text-xs text-gray-500 mt-0.5">{project.year}</p>}
                      {project.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description}</p>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Sticky footer */}
      {hasAnything && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-8 px-8 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{totalSelected}</span>{" "}
            item{totalSelected !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={resetUpload} className="text-gray-500">
              <X className="w-4 h-4 mr-1" /> Start over
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={totalSelected === 0}
              className="bg-[#8b0000] hover:bg-[#6b0000] text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Save {totalSelected} item{totalSelected !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
