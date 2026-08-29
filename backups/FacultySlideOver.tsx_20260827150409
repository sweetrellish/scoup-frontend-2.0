import { createPortal } from "react-dom";
import {
  X, Mail, Phone, GraduationCap, BookOpen, FlaskConical,
  FolderOpen, Send, Award, Quote,
} from "lucide-react";
import type { FacultyMember } from "../data/searchData";
import { getInitials } from "../utils/avatar";
import { Button } from "./ui/button";

interface FacultySlideOverProps {
  faculty: FacultyMember;
  matchedKeywords?: string[];
  onClose: () => void;
  onInquiry: (faculty: FacultyMember) => void;
  onNavigate?: (path: string) => void;
}

const toCategorySlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[,()]/g, "");

export function FacultySlideOver({
  faculty,
  matchedKeywords = [],
  onClose,
  onInquiry,
  onNavigate,
}: FacultySlideOverProps) {
  const { metricsProfile, qualifications } = faculty;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9990, backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9991,
          width: "min(520px, 100vw)",
          background: "#fff",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-start gap-4">
          {/* Photo */}
          <div className="shrink-0">
            {faculty.photo ? (
              <img
                src={faculty.photo}
                alt={faculty.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#8b0000] text-white flex items-center justify-center text-xl font-semibold">
                {getInitials(faculty.name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">{faculty.name}</h2>
            {faculty.title && (
              <p className="text-sm text-gray-600 truncate">{faculty.title}</p>
            )}
            <p className="text-sm text-[#8b0000] font-medium truncate">{faculty.department}</p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 px-6 py-5 space-y-6">

          {/* Quick Stats */}
          {metricsProfile && (metricsProfile.articleCount > 0 || metricsProfile.totalCitations > 0) && (
            <div className="grid grid-cols-3 gap-3">
              {metricsProfile.articleCount > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <BookOpen className="w-4 h-4 text-[#8b0000] mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{metricsProfile.articleCount}</p>
                  <p className="text-xs text-gray-500">Papers</p>
                </div>
              )}
              {metricsProfile.totalCitations > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Award className="w-4 h-4 text-[#8b0000] mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{metricsProfile.totalCitations}</p>
                  <p className="text-xs text-gray-500">Citations</p>
                </div>
              )}
              {metricsProfile.averageCitations > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <FlaskConical className="w-4 h-4 text-[#8b0000] mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{metricsProfile.averageCitations.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Avg. Citations</p>
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          {faculty.bio && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-4 h-4 text-[#8b0000]" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{faculty.bio}</p>
            </div>
          )}

          {/* Research Interests */}
          {faculty.researchInterests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-[#8b0000]" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Research Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {faculty.researchInterests.map((interest, i) => {
                  const isMatched = matchedKeywords.some(
                    (kw) =>
                      kw.toLowerCase() === interest.toLowerCase() ||
                      interest.toLowerCase().includes(kw.toLowerCase())
                  );
                  return (
                    <span
                      key={i}
                      className={
                        isMatched
                          ? "px-3 py-1 bg-[#ffd100] text-[#8b0000] text-sm rounded-full font-semibold ring-1 ring-[#8b0000]/20"
                          : "px-3 py-1 bg-[#8b0000]/8 text-[#8b0000] text-sm rounded-full font-medium"
                      }
                    >
                      {interest}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Keywords */}
          {faculty.aiKeywords.length > faculty.researchInterests.length && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {faculty.aiKeywords
                  .filter((kw) => !faculty.researchInterests.includes(kw))
                  .slice(0, 14)
                  .map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Education / Qualifications */}
          {qualifications && qualifications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-[#8b0000]" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Education</h3>
              </div>
              <ul className="space-y-2">
                {qualifications.map((q, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{q.degree}</p>
                      <p className="text-xs text-gray-500">
                        {q.institution}
                        {q.year ? ` · ${q.year}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* NSF Categories */}
          {faculty.nsfCategories && faculty.nsfCategories.length > 0 && onNavigate && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Research Areas</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {faculty.nsfCategories.slice(0, 6).map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onClose();
                      onNavigate(`/browse/${toCategorySlug(cat)}`);
                    }}
                    className="px-2.5 py-1 text-xs rounded-full border border-[#8b0000]/20 bg-[#8b0000]/5 text-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {(faculty.email || faculty.phone) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</h3>
              <div className="space-y-2">
                {faculty.email && (
                  <a
                    href={`mailto:${faculty.email}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#8b0000] transition-colors"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    {faculty.email}
                  </a>
                )}
                {faculty.phone && (
                  <a
                    href={`tel:${faculty.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#8b0000] transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    {faculty.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          {faculty.email && (
            <a
              href={`mailto:${faculty.email}?subject=Inquiry via SCOUP Platform&body=Hello ${faculty.name.split(" ").pop()},%0D%0A%0D%0A`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full border-[#8b0000] text-[#8b0000] hover:bg-[#8b0000] hover:text-white"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </a>
          )}
          {faculty.allowMessagesViaSCOUP !== false && (
            <Button
              className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]"
              onClick={() => {
                onClose();
                onInquiry(faculty);
              }}
            >
              <Send className="w-4 h-4" />
              Send Request
            </Button>
          )}
          {faculty.allowMessagesViaSCOUP === false && !faculty.email && (
            <p className="text-sm text-gray-500 flex-1 text-center py-2">
              This faculty member is not accepting inquiries via SCOUP at this time.
            </p>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
