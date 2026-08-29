import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  Phone,
  ExternalLink,
  FileText,
  Lightbulb,
  FolderOpen,
  User,
  Send,
  X,
} from "lucide-react";
import type { SearchResult, FacultyMember, Project } from "../data/searchData";
import { getInitials } from "../utils/avatar";
import { networkAPI } from "../utils/api";
import { Button } from "./ui/button";
import { FacultySlideOver } from "./FacultySlideOver";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  activeFilters: string[];
  onNavigate?: (path: string) => void;
}

const PAGE_SIZE = 10;

type InquiryTarget =
  | { kind: "faculty"; faculty: FacultyMember }
  | { kind: "project"; project: Project };

const toCategorySlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[,()]/g, "");

const getPaperHref = (paper: { doi?: string; link?: string }) => {
  const link = String(paper.link || "").trim();
  if (link) {
    if (link.startsWith("http")) return link;
    const doi = String(paper.doi || "").trim();
    return doi ? `https://doi.org/${doi}` : `https://${link}`;
  }

  const doi = String(paper.doi || "").trim();
  return doi ? `https://doi.org/${doi}` : "";
};

export function SearchResults({
  results,
  query,
  activeFilters,
  onNavigate,
}: SearchResultsProps) {
  // Filter results based on active filters
  const filteredResults = useMemo(() => {
    // If no filters are active, show all results
    if (activeFilters.length === 0) {
      return results;
    }
    // Otherwise, filter by active types
    return results.filter((result) => activeFilters.includes(result.type));
  }, [results, activeFilters]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Slide-over state
  const [slideOverFaculty, setSlideOverFaculty] = useState<{ faculty: FacultyMember; matchedKeywords: string[] } | null>(null);

  // Inquiry dialog state
  const [inquiryTarget, setInquiryTarget] = useState<InquiryTarget | null>(null);
  const [inquiryNote, setInquiryNote] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterOrg, setRequesterOrg] = useState("");
  const [requesterRole, setRequesterRole] = useState("external collaborator");
  const inquiryTextareaRef = useRef<HTMLTextAreaElement>(null);

  const openInquiry = (faculty: FacultyMember) => {
    setInquiryTarget({ kind: "faculty", faculty });
    setInquiryNote("");
    setInquirySuccess(null);
    setInquiryError(null);
    setRequesterName("");
    setRequesterEmail("");
    setRequesterOrg("");
    setRequesterRole("external collaborator");
  };

  const openProjectInquiry = (project: Project) => {
    setInquiryTarget({ kind: "project", project });
    setInquiryNote("");
    setInquirySuccess(null);
    setInquiryError(null);
    setRequesterName("");
    setRequesterEmail("");
    setRequesterOrg("");
    setRequesterRole(project.allowStudentInterest ? "student" : "external collaborator");
  };

  const handleInquirySubmit = async () => {
    if (!inquiryTarget) return;
    setInquiryError(null);
    if (!requesterName.trim()) { setInquiryError("Your name is required."); return; }
    if (!requesterEmail.trim() || !requesterEmail.includes("@")) { setInquiryError("A valid email address is required."); return; }
    if (!inquiryNote.trim()) { setInquiryError("A message is required so the admin team can understand your request."); return; }
    setInquirySubmitting(true);
    try {
      const payload =
        inquiryTarget.kind === "faculty"
          ? {
              target_faculty_name: inquiryTarget.faculty.name,
              target_faculty_id: inquiryTarget.faculty.id,
              target_department: inquiryTarget.faculty.department,
              target_school: inquiryTarget.faculty.schoolAffiliations?.[0] ?? "",
            }
          : {
              target_faculty_name: inquiryTarget.project.leadFaculty[0] || "Project team",
              target_project_id: inquiryTarget.project.id,
              target_project_title: inquiryTarget.project.title,
              target_department: inquiryTarget.project.departmentAffiliations?.[0] ?? "",
              target_school: inquiryTarget.project.schoolAffiliations?.[0] ?? "",
            };
      const res = await networkAPI.publicInquire({
        ...payload,
        requester_role: requesterRole,
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim(),
        requester_organization: requesterOrg.trim(),
        note: inquiryNote.trim(),
      });
      setInquirySuccess(res?.message || "Request submitted successfully.");
    } catch (err: any) {
      setInquirySuccess(err?.message || "Failed to submit. Please try again.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, activeFilters, results]);

  const visibleResults = filteredResults.slice(0, visibleCount);
  const inquiryTitle =
    inquiryTarget?.kind === "faculty"
      ? inquiryTarget.faculty.name
      : inquiryTarget?.project.title ?? "";
  const inquirySubtitle =
    inquiryTarget?.kind === "faculty"
      ? inquiryTarget.faculty.department
      : inquiryTarget?.project.leadFaculty?.join(", ") ?? "";
  const inquiryPlaceholder =
    inquiryTarget?.kind === "project"
      ? `Briefly describe your interest in ${inquiryTarget.project.title}.`
      : `Briefly describe your interest - e.g. I'd like to discuss a collaboration around ${
          inquiryTarget?.faculty.researchInterests[0] || "your research area"
        }.`;

  if (filteredResults.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="text-gray-400 mb-4">
          <FileText className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-light text-gray-700 mb-2">
          No results found
        </h3>
        <p className="text-gray-500 font-light">
          {results.length > 0
            ? "Try adjusting your filters to see more results"
            : "Try adjusting your search terms or exploring different keywords"}
        </p>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 60)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Match";
    if (confidence >= 60) return "Good Match";
    return "Moderate Match";
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-gray-900 mb-2">
          Search Results for "{query}"
        </h2>
        <p className="text-gray-600 font-light mb-1">
          Found {filteredResults.length}{" "}
          {filteredResults.length === 1 ? "result" : "results"}
        </p>
        <p className="text-sm text-gray-500 font-light">
          Showing {visibleResults.length} of {filteredResults.length}
        </p>
      </div>

      <div className="space-y-6">
        {visibleResults.map((result, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Result Type Badge & Confidence */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {result.type === "faculty" && (
                  <div className="flex items-center gap-2 text-[#8b0000]">
                    <User className="w-5 h-5" />
                    <span className="font-medium text-sm">Faculty Member</span>
                  </div>
                )}
                {result.type === "paper" && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium text-sm">Research Paper</span>
                  </div>
                )}
                {result.type === "patent" && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Lightbulb className="w-5 h-5" />
                    <span className="font-medium text-sm">Patent</span>
                  </div>
                )}
                {result.type === "project" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <FolderOpen className="w-5 h-5" />
                    <span className="font-medium text-sm">Project</span>
                  </div>
                )}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(result.confidence)}`}
              >
                {result.confidence}% · {getConfidenceLabel(result.confidence)}
              </div>
            </div>

            {/* Faculty Result */}
            {result.type === "faculty" && "name" in result.data && (
              <div className="flex gap-6">
                {/* Clickable photo → slide-over */}
                <button
                  type="button"
                  onClick={() => setSlideOverFaculty({ faculty: result.data as FacultyMember, matchedKeywords: result.matchedKeywords })}
                  className="flex-shrink-0 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 hover:opacity-90 transition-opacity"
                  title={`View ${result.data.name}'s full profile`}
                >
                  {result.data.photo ? (
                    <img
                      src={result.data.photo}
                      alt={result.data.name}
                      className="w-24 h-24 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-[#8b0000] text-white flex items-center justify-center text-2xl font-semibold">
                      {getInitials(result.data.name)}
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setSlideOverFaculty({ faculty: result.data as FacultyMember, matchedKeywords: result.matchedKeywords })}
                    className="text-left hover:text-[#8b0000] transition-colors"
                  >
                    <h3 className="text-xl font-medium text-gray-900 mb-1 hover:text-[#8b0000]">
                      {result.data.name}
                    </h3>
                  </button>
                  <p className="text-sm text-gray-600 mb-3">
                    {result.data.title} · {result.data.department}
                  </p>

                  {/* Research Interests — matched ones highlighted in gold */}
                  {result.data.researchInterests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Research Interests
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.data.researchInterests.map((interest, i) => {
                          const isMatched = result.matchedKeywords.some(
                            (kw) => kw.toLowerCase() === interest.toLowerCase()
                              || interest.toLowerCase().includes(kw.toLowerCase())
                          );
                          return (
                            <span
                              key={i}
                              className={
                                isMatched
                                  ? "px-3 py-1 bg-[#ffd100] text-[#8b0000] text-sm rounded-full font-semibold ring-1 ring-[#8b0000]/20"
                                  : "px-3 py-1 bg-gradient-to-r from-[#8b0000] to-[#6b0000] text-white text-sm rounded-full font-medium"
                              }
                            >
                              {interest}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* NSF Research Categories → links to Browse */}
                  {result.data.nsfCategories && result.data.nsfCategories.length > 0 && onNavigate && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Research Categories
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.data.nsfCategories.slice(0, 5).map((cat, i) => (
                          <button
                            key={i}
                            onClick={() => onNavigate(`/browse/${toCategorySlug(cat)}`)}
                            className="px-2.5 py-1 text-xs rounded-full border border-[#8b0000]/20 bg-[#8b0000]/5 text-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Justification */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-900 font-light">
                      <span className="font-medium">Match Summary: </span>
                      {result.aiJustification}
                    </p>
                  </div>

                  {(result.data.email || result.data.phone) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        Contact Information
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        {result.data.email && (
                          <a
                            href={`mailto:${result.data.email}`}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#8b0000] transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            {result.data.email}
                          </a>
                        )}
                        {result.data.phone && (
                          <a
                            href={`tel:${result.data.phone}`}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#8b0000] transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {result.data.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    {result.data.email && (
                      <a
                        href={`mailto:${result.data.email}?subject=Inquiry via SCOUP Platform&body=Hello ${result.data.name.split(" ").pop()},%0D%0A%0D%0AI found your profile on the SCOUP platform and would like to connect regarding your research${result.data.researchInterests[0] ? ` in ${result.data.researchInterests[0]}` : ""}.%0D%0A%0D%0A`}
                      >
                        <Button size="sm" className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]">
                          <Mail className="w-4 h-4" />
                          Contact
                        </Button>
                      </a>
                    )}
                    {(result.data as FacultyMember).allowMessagesViaSCOUP !== false && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openInquiry(result.data as FacultyMember)}
                      >
                        <Send className="w-4 h-4" />
                        Send Request
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Paper Result */}
            {result.type === "paper" &&
              "title" in result.data &&
              "abstract" in result.data && (
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {result.data.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {result.data.authors.join(", ")} · {result.data.year}
                  </p>

                  {/* AI Justification */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-900 font-light">
                      <span className="font-medium">Match Summary: </span>
                      {result.aiJustification}
                    </p>
                  </div>

                  {/* Abstract */}
                  <p className="text-sm text-gray-700 font-light mb-3 line-clamp-3">
                    {result.data.abstract}
                  </p>

                  {/* Keywords — matched ones highlighted in gold */}
                  {"aiKeywords" in result.data && result.data.aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.data.aiKeywords.slice(0, 10).map((kw, i) => {
                        const isMatched = result.matchedKeywords.some(
                          (mk) => mk.toLowerCase() === kw.toLowerCase()
                            || kw.toLowerCase().includes(mk.toLowerCase())
                        );
                        return (
                          <span
                            key={i}
                            className={
                              isMatched
                                ? "px-2 py-1 bg-[#ffd100] text-[#8b0000] text-xs rounded-full font-semibold"
                                : "px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                            }
                          >
                            {kw}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {getPaperHref(result.data) && (
                    <a
                      href={getPaperHref(result.data)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#8b0000] hover:text-[#6b0000] font-medium transition-colors"
                    >
                      View Paper
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

            {/* Patent Result */}
            {result.type === "patent" &&
              "title" in result.data &&
              "patentNumber" in result.data && (
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {result.data.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {result.data.inventors.join(", ")} · Patent:{" "}
                    {result.data.patentNumber} · {result.data.year}
                  </p>

                  {/* AI Justification */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-900 font-light">
                      <span className="font-medium">Match Summary: </span>
                      {result.aiJustification}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 font-light mb-3">
                    {result.data.description}
                  </p>

                  {/* Keywords — matched ones highlighted in gold */}
                  {"aiKeywords" in result.data && result.data.aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.data.aiKeywords.slice(0, 8).map((kw, i) => {
                        const isMatched = result.matchedKeywords.some(
                          (mk) => mk.toLowerCase() === kw.toLowerCase()
                            || kw.toLowerCase().includes(mk.toLowerCase())
                        );
                        return (
                          <span
                            key={i}
                            className={
                              isMatched
                                ? "px-2 py-1 bg-[#ffd100] text-[#8b0000] text-xs rounded-full font-semibold"
                                : "px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium"
                            }
                          >
                            {kw}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <a
                    href={result.data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#8b0000] hover:text-[#6b0000] font-medium transition-colors"
                  >
                    View Patent
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

            {/* Project Result */}
            {result.type === "project" &&
              "title" in result.data &&
              "status" in result.data && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-medium text-gray-900">
                      {result.data.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        result.data.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {result.data.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Lead Faculty: {result.data.leadFaculty.join(", ")} ·
                    Started: {result.data.startDate}
                  </p>

                  {/* AI Justification */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-900 font-light">
                      <span className="font-medium">Match Summary: </span>
                      {result.aiJustification}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 font-light mb-3">
                    {result.data.description}
                  </p>

                  {/* Keywords — matched ones highlighted in gold */}
                  {"aiKeywords" in result.data && result.data.aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.data.aiKeywords.slice(0, 8).map((kw, i) => {
                        const isMatched = result.matchedKeywords.some(
                          (mk) => mk.toLowerCase() === kw.toLowerCase()
                            || kw.toLowerCase().includes(mk.toLowerCase())
                        );
                        return (
                          <span
                            key={i}
                            className={
                              isMatched
                                ? "px-2 py-1 bg-[#ffd100] text-[#8b0000] text-xs rounded-full font-semibold"
                                : "px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium"
                            }
                          >
                            {kw}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {result.data.isOpenToCollaboration && (
                    <div className="mt-4 rounded-lg border border-[#8b0000]/15 bg-[#8b0000]/5 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#8b0000]">
                            Open to collaborators
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {result.data.collaborationInvitation ||
                              "This project is accepting collaboration interest."}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100] shrink-0"
                          onClick={() => openProjectInquiry(result.data as Project)}
                        >
                          <Send className="w-4 h-4" />
                          Express Interest
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>

      {visibleCount < filteredResults.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) =>
                Math.min(prev + PAGE_SIZE, filteredResults.length),
              )
            }
            className="px-6 py-2.5 rounded-full bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100] text-sm font-medium transition-colors"
          >
            Load {Math.min(PAGE_SIZE, filteredResults.length - visibleCount)} more results
          </button>
        </div>
      )}

      {/* Faculty Slide-over */}
      {slideOverFaculty && (
        <FacultySlideOver
          faculty={slideOverFaculty.faculty}
          matchedKeywords={slideOverFaculty.matchedKeywords}
          onClose={() => setSlideOverFaculty(null)}
          onInquiry={(faculty) => {
            setSlideOverFaculty(null);
            openInquiry(faculty);
          }}
          onNavigate={onNavigate}
        />
      )}

      {/* Inquiry dialog */}
      {inquiryTarget && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: "1.5rem", width: "100%", maxWidth: "30rem", border: "1px solid #e5e7eb" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  {inquiryTarget.kind === "project" ? "Project Interest" : "Inquiry"}
                </p>
                <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#111827", margin: "0.25rem 0 0" }}>{inquiryTitle}</p>
                {inquirySubtitle && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.2rem 0 0" }}>{inquirySubtitle}</p>}
              </div>
              <button onClick={() => setInquiryTarget(null)} style={{ padding: "0.25rem", borderRadius: "0.375rem", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}>
                <X style={{ width: "1.125rem", height: "1.125rem" }} />
              </button>
            </div>

            {inquirySuccess ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", padding: "1rem", marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#166534", margin: 0 }}>{inquirySuccess}</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Your Name *</label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="Jane Smith"
                      style={{ width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Your Email *</label>
                    <input
                      type="email"
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                      placeholder="jane@example.com"
                      style={{ width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Organization <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span></label>
                    <input
                      type="text"
                      value={requesterOrg}
                      onChange={(e) => setRequesterOrg(e.target.value)}
                      placeholder="University / Company / etc."
                      style={{ width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                  {inquiryTarget.kind === "project" && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>I am a</label>
                      <select
                        value={requesterRole}
                        onChange={(e) => setRequesterRole(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }}
                      >
                        {inquiryTarget.project.allowStudentInterest && <option value="student">Student</option>}
                        <option value="external collaborator">External collaborator</option>
                        <option value="faculty collaborator">Faculty collaborator</option>
                        <option value="community partner">Community partner</option>
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Message <span style={{ color: "#dc2626" }}>*</span></label>
                  <textarea
                    ref={inquiryTextareaRef}
                    value={inquiryNote}
                    onChange={(e) => setInquiryNote(e.target.value)}
                    placeholder={inquiryPlaceholder}
                    rows={3}
                    style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
                {inquiryError && (
                  <p style={{ fontSize: "0.8125rem", color: "#dc2626", marginBottom: "0.75rem" }}>{inquiryError}</p>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <Button variant="outline" onClick={() => setInquiryTarget(null)}>Cancel</Button>
                  <Button
                    disabled={inquirySubmitting}
                    className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]"
                    onClick={handleInquirySubmit}
                  >
                    <Send className="w-4 h-4" />
                    {inquirySubmitting ? "Sending…" : "Send Request"}
                  </Button>
                </div>
              </>
            )}

            {inquirySuccess && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="outline" onClick={() => setInquiryTarget(null)}>Close</Button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
