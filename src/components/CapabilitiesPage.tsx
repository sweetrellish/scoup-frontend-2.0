import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Search as SearchIcon,
  X,
  Bookmark,
  Send,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

import {
  categoriesAPI,
  type TopLevelCategory,
  type CategoryDetail,
  type CategoryFaculty,
} from "../utils/api";
import { FacultyLink } from "./FacultyLink";
import { ExternalInquiryDialog } from "./ExternalInquiryDialog";

/**
 * Expertise Map — research areas as a bubble cluster sized by how many SU experts
 * are mapped to each, a ranked companion list, and a drill-down to the experts.
 *
 * Everything on this page is a field the API actually returns. Notably absent,
 * on purpose: the five academic/practice/publication/collaboration/network bars
 * the reference product shows. `Faculty.academic|practice|publication` are
 * populated on 86 of 1,719 records and hold raw counts rather than 0-100 scores,
 * and no collaboration or network field exists at all — so those bars could only
 * be fabricated. The metrics here (papers, citations, citations per paper,
 * directory verification) are populated for effectively every listed record.
 *
 * The single "prominence" score comes from the backend, where `_default_prominence`
 * already ranks people for `/api/network/discovery/`; both surfaces therefore order
 * experts identically instead of disagreeing.
 */

interface CapabilitiesPageProps {
  title: string;
  description: string;
  onNavigate: (path: string) => void;
}

/** Pastel fills, rotated per bubble. Inline styles: gradients are not in index.css. */
const PALETTE = [
  { from: "#dcf4e8", to: "#b4e3cd", dot: "#2f9e6e", ink: "#14532d" },
  { from: "#dfeafd", to: "#bcd7fb", dot: "#3b7fe0", ink: "#1e3a8a" },
  { from: "#e9e3fb", to: "#d3c9f6", dot: "#7458d1", ink: "#3b2a70" },
  { from: "#ffe8d6", to: "#ffd0ae", dot: "#e2812f", ink: "#7c3a00" },
  { from: "#fde3ec", to: "#f9c9da", dot: "#d95b86", ink: "#7a1f3d" },
];

const BOOKMARK_KEY = "scoup.expertiseMap.bookmarks";

const MIN_BUBBLE = 104;
const MAX_BUBBLE = 208;
const DEFAULT_BUBBLE_COUNT = 12;

const paletteFor = (index: number) => PALETTE[index % PALETTE.length];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const num = (value: number) => value.toLocaleString();

/**
 * Prominence is only rendered when the backend actually sent it. A build older than
 * 2026-08-30 omits the field; showing a blank bar is honest, inventing a value is not.
 */
const scoreOf = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** Citations per paper, from the two counts the record actually carries. */
const perPaper = (citations: number, papers: number) =>
  papers > 0 ? citations / papers : 0;

function readBookmarks(): number[] {
  try {
    const raw = window.localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "number") : [];
  } catch {
    return [];
  }
}

export function CapabilitiesPage({ title, description, onNavigate }: CapabilitiesPageProps) {
  const [categories, setCategories] = useState<TopLevelCategory[]>([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  const [subtopic, setSubtopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [inquiryTarget, setInquiryTarget] = useState<CategoryFaculty | null>(null);

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, []);

  useEffect(() => {
    let cancelled = false;
    categoriesAPI
      .list()
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load research areas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBookmark = (id: number) => {
    setBookmarks((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      try {
        window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      } catch {
        // Private-browsing or a full quota: the toggle still works for this session.
      }
      return next;
    });
  };

  /** Only areas with at least one SU expert can be drilled into, so only they get a bubble. */
  const staffed = useMemo(
    () =>
      categories
        .filter((c) => c.faculty_count > 0)
        .sort((a, b) => b.faculty_count - a.faculty_count || a.name.localeCompare(b.name)),
    [categories],
  );

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffed;
    return staffed.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mid_level_categories?.some((m) => m.name.toLowerCase().includes(q)),
    );
  }, [staffed, query]);

  const visible = showAll || query.trim() ? matching : matching.slice(0, DEFAULT_BUBBLE_COUNT);

  /** The list ranks by the score its bar shows; the bubbles above rank by bench size. */
  const ranked = useMemo(
    () =>
      [...matching].sort(
        (a, b) =>
          (scoreOf(b.expert_prominence) ?? b.faculty_count) -
            (scoreOf(a.expert_prominence) ?? a.faculty_count) ||
          a.name.localeCompare(b.name),
      ),
    [matching],
  );

  const colorBySlug = useMemo(() => {
    const map: Record<string, (typeof PALETTE)[number]> = {};
    staffed.forEach((c, i) => {
      map[c.slug] = paletteFor(i);
    });
    return map;
  }, [staffed]);

  const maxExperts = visible.length ? Math.max(...visible.map((c) => c.faculty_count)) : 0;
  const minExperts = visible.length ? Math.min(...visible.map((c) => c.faculty_count)) : 0;

  const bubbleSize = (count: number) => {
    if (maxExperts === minExperts) return (MIN_BUBBLE + MAX_BUBBLE) / 2;
    const ratio = (count - minExperts) / (maxExperts - minExperts);
    return Math.round(MIN_BUBBLE + ratio * (MAX_BUBBLE - MIN_BUBBLE));
  };

  const openArea = async (slug: string) => {
    setSelectedSlug(slug);
    setSubtopic(null);
    setDetail(null);
    setDetailLoading(true);
    setError("");
    try {
      setDetail(await categoriesAPI.detail(slug));
    } catch {
      setError("Unable to load that research area.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeArea = () => {
    setSelectedSlug(null);
    setDetail(null);
    setSubtopic(null);
  };

  const selectedCategory = selectedSlug
    ? categories.find((c) => c.slug === selectedSlug) ?? null
    : null;
  const selectedColor = (selectedSlug && colorBySlug[selectedSlug]) || PALETTE[0];

  /**
   * Subtopic chips are the area's mid-level taxonomy strings, kept only when a listed
   * expert actually carries one. A chip that filtered to nobody would be a promise the
   * data cannot keep, and an area with no populated mid-level names shows no chips.
   */
  const subtopics = useMemo(() => {
    if (!detail || !selectedCategory) return [] as { name: string; count: number }[];
    return (selectedCategory.mid_level_categories ?? [])
      .map((mid) => ({
        name: mid.name,
        count: detail.faculty.filter((f) => f.matched_categories?.includes(mid.name)).length,
      }))
      .filter((mid) => mid.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [detail, selectedCategory]);

  const experts = useMemo(() => {
    if (!detail) return [] as CategoryFaculty[];
    const rows = subtopic
      ? detail.faculty.filter((f) => f.matched_categories?.includes(subtopic))
      : detail.faculty;
    return [...rows].sort(
      (a, b) =>
        (scoreOf(b.prominence) ?? 0) - (scoreOf(a.prominence) ?? 0) ||
        a.name.localeCompare(b.name),
    );
  }, [detail, subtopic]);

  const peaks = useMemo(() => {
    const papers = Math.max(1, ...experts.map((f) => f.article_count));
    const citations = Math.max(1, ...experts.map((f) => f.total_citations));
    const average = Math.max(
      1,
      ...experts.map((f) => perPaper(f.total_citations, f.article_count)),
    );
    return { papers, citations, average };
  }, [experts]);

  return (
    <div className="p-8 max-w-6xl">
      {inquiryTarget && (
        <ExternalInquiryDialog
          faculty={inquiryTarget}
          onClose={() => setInquiryTarget(null)}
        />
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </header>

      <div className="relative mb-6 max-w-2xl">
        <SearchIcon
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search research areas, e.g. ecology, public health"
          aria-label="Search research areas"
          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#8b0000]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : selectedSlug ? (
        <AreaDetail
          color={selectedColor}
          slug={selectedSlug}
          fallbackName={selectedCategory?.name ?? selectedSlug}
          detail={detail}
          loading={detailLoading}
          subtopics={subtopics}
          subtopic={subtopic}
          onSubtopic={setSubtopic}
          experts={experts}
          peaks={peaks}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          onRequestIntro={setInquiryTarget}
          onNavigate={onNavigate}
          onClose={closeArea}
        />
      ) : matching.length === 0 ? (
        <p className="text-sm text-gray-500">
          No research area with SU experts matched that search.
        </p>
      ) : (
        <>
          <BubbleCluster
            areas={visible}
            colorBySlug={colorBySlug}
            sizeOf={bubbleSize}
            onOpen={openArea}
          />

          <div className="flex flex-wrap items-center gap-2 mt-3 mb-8">
            <p className="text-xs text-gray-500">
              {visible.length === matching.length
                ? `${matching.length} research area${matching.length === 1 ? "" : "s"} with SU experts`
                : `Showing the ${visible.length} largest of ${matching.length} areas with SU experts`}
              {" · "}
              {categories.length} areas in the taxonomy overall; the rest appear on papers but
              have no SU faculty mapped to them.
            </p>
            {!query.trim() && matching.length > DEFAULT_BUBBLE_COUNT && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-xs font-medium text-[#8b0000] hover:underline"
              >
                {showAll ? "Show the largest 12" : `Show all ${matching.length}`}
              </button>
            )}
          </div>

          <RankedList
            areas={ranked}
            colorBySlug={colorBySlug}
            onOpen={openArea}
          />
        </>
      )}
    </div>
  );
}

// ─── Bubble cluster ───────────────────────────────────────────────────────────

function BubbleCluster({
  areas,
  colorBySlug,
  sizeOf,
  onOpen,
}: {
  areas: TopLevelCategory[];
  colorBySlug: Record<string, (typeof PALETTE)[number]>;
  sizeOf: (count: number) => number;
  onOpen: (slug: string) => void;
}) {
  return (
    <div
      className="rounded-lg border border-gray-200 p-6"
      style={{
        // Faint horizontal rules behind the cluster. Written inline because
        // index.css is precompiled and carries no repeating-gradient utility.
        backgroundColor: "#ffffff",
        backgroundImage:
          "repeating-linear-gradient(to bottom, #eef1f6 0px, #eef1f6 1px, transparent 1px, transparent 22px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
        }}
      >
        {areas.map((area, index) => {
          const size = sizeOf(area.faculty_count);
          const color = colorBySlug[area.slug] ?? PALETTE[index % PALETTE.length];
          return (
            <button
              key={area.slug}
              type="button"
              onClick={() => onOpen(area.slug)}
              title={`${area.name} — ${area.faculty_count} experts, ${num(area.article_count)} papers`}
              className="transition-shadow hover:shadow-md"
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                padding: size > 150 ? "18px" : "10px",
                // Staggered rather than gridded, so the cluster reads as a cloud.
                marginTop: [0, 26, 12, 34, 6][index % 5],
                background: `linear-gradient(150deg, ${color.from} 0%, ${color.to} 100%)`,
                color: color.ink,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                lineHeight: 1.2,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: size > 170 ? 15 : size > 135 ? 13 : 11,
                }}
              >
                {area.name}
              </span>
              <span
                style={{
                  marginTop: 4,
                  fontSize: size > 170 ? 13 : 11,
                  opacity: 0.85,
                }}
              >
                {area.faculty_count} expert{area.faculty_count === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ranked list ──────────────────────────────────────────────────────────────

function RankedList({
  areas,
  colorBySlug,
  onOpen,
}: {
  areas: TopLevelCategory[];
  colorBySlug: Record<string, (typeof PALETTE)[number]>;
  onOpen: (slug: string) => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-900">Areas ranked by expert prominence</h2>
      <p className="text-xs text-gray-500 mt-1 mb-3">
        The bar is the mean prominence of the area's experts — the same 0–100 score the
        Networks page ranks people by (directory verification 45, listed department 10,
        title 5, papers up to 20, citations up to 20). It measures how well described and
        published this area's bench is, not how large it is; the bubbles above carry size.
      </p>
      <ol className="bg-white border border-gray-200 rounded-lg">
        {areas.map((area, index) => {
          const color = colorBySlug[area.slug] ?? PALETTE[index % PALETTE.length];
          const prominence = scoreOf(area.expert_prominence);
          return (
            <li key={area.slug} className={index === 0 ? "" : "border-t border-gray-100"}>
              <button
                type="button"
                onClick={() => onOpen(area.slug)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span
                      aria-hidden="true"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: color.dot,
                        display: "inline-block",
                      }}
                    />
                    {area.name}
                  </span>
                  {prominence !== null && (
                    <span className="text-sm font-semibold text-gray-900">
                      {prominence.toFixed(0)}%
                    </span>
                  )}
                </div>
                {prominence !== null && (
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: "#f1f3f7",
                      overflow: "hidden",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, prominence))}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${color.to} 0%, ${color.dot} 100%)`,
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {area.faculty_count} expert{area.faculty_count === 1 ? "" : "s"} ·{" "}
                  {num(area.article_count)} paper{area.article_count === 1 ? "" : "s"}
                  {typeof area.total_citations === "number"
                    ? ` · ${num(area.total_citations)} citations`
                    : ""}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ─── Area detail ──────────────────────────────────────────────────────────────

function AreaDetail({
  color,
  slug,
  fallbackName,
  detail,
  loading,
  subtopics,
  subtopic,
  onSubtopic,
  experts,
  peaks,
  bookmarks,
  onToggleBookmark,
  onRequestIntro,
  onNavigate,
  onClose,
}: {
  color: (typeof PALETTE)[number];
  slug: string;
  fallbackName: string;
  detail: CategoryDetail | null;
  loading: boolean;
  subtopics: { name: string; count: number }[];
  subtopic: string | null;
  onSubtopic: (name: string | null) => void;
  experts: CategoryFaculty[];
  peaks: { papers: number; citations: number; average: number };
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
  onRequestIntro: (faculty: CategoryFaculty) => void;
  onNavigate: (path: string) => void;
  onClose: () => void;
}) {
  const stats = detail?.stats;

  return (
    <section className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span
              aria-hidden="true"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: color.dot,
                display: "inline-block",
              }}
            />
            {detail?.category_name ?? fallbackName}
          </h2>
          {/* Described by its real counts. There is no description field on a
              category, and writing prose for one would be invention. */}
          <p className="text-sm text-gray-600 mt-1">
            {loading || !stats
              ? "Loading this area…"
              : `${stats.faculty_count} SU expert${stats.faculty_count === 1 ? "" : "s"} across ` +
                `${stats.department_count} department${stats.department_count === 1 ? "" : "s"} · ` +
                `${num(stats.article_count)} papers · ${num(stats.total_citations)} citations · ` +
                `${stats.citation_average} citations per paper`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close this research area"
          className="text-gray-400 hover:text-[#8b0000] transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 p-5">Loading experts…</p>
      ) : !detail ? (
        <p className="text-sm text-gray-500 p-5">This area could not be loaded.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 p-5 border-b border-gray-100">
            <Chip active={subtopic === null} onClick={() => onSubtopic(null)}>
              All experts ({detail.faculty.length})
            </Chip>
            {subtopics.map((mid) => (
              <Chip
                key={mid.name}
                active={subtopic === mid.name}
                onClick={() => onSubtopic(mid.name)}
              >
                {mid.name} ({mid.count})
              </Chip>
            ))}
            {subtopics.length === 0 && (
              <span className="text-xs text-gray-500">
                No sub-areas are recorded under this area in the taxonomy.
              </span>
            )}
          </div>

          {experts.length === 0 ? (
            <p className="text-sm text-gray-500 p-5">
              No SU expert is mapped to this area{subtopic ? " and sub-area" : ""}.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 px-4 pt-4">
                {experts.length} expert{experts.length === 1 ? "" : "s"}, most prominent first.
                Metric bars are scaled to the highest value among the experts shown here.
              </p>
              <ul
                className="p-4"
                style={{ maxHeight: 720, overflowY: "auto", display: "grid", gap: "12px" }}
              >
                {experts.map((faculty) => (
                  <ExpertCard
                    key={faculty.id}
                    faculty={faculty}
                    color={color}
                    peaks={peaks}
                    bookmarked={bookmarks.includes(faculty.id)}
                    onToggleBookmark={onToggleBookmark}
                    onRequestIntro={onRequestIntro}
                    onNavigate={onNavigate}
                    slug={slug}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "text-xs px-3 py-1 rounded-full bg-[#8b0000] text-white"
          : "text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      }
    >
      {children}
    </button>
  );
}

// ─── Expert card ──────────────────────────────────────────────────────────────

function ExpertCard({
  faculty,
  color,
  peaks,
  bookmarked,
  onToggleBookmark,
  onRequestIntro,
  onNavigate,
  slug,
}: {
  faculty: CategoryFaculty;
  color: (typeof PALETTE)[number];
  peaks: { papers: number; citations: number; average: number };
  bookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onRequestIntro: (faculty: CategoryFaculty) => void;
  onNavigate: (path: string) => void;
  slug: string;
}) {
  const average = perPaper(faculty.total_citations, faculty.article_count);
  const prominence = scoreOf(faculty.prominence);
  const papersHere = faculty.paper_ids?.length ?? 0;
  const matched = faculty.matched_categories ?? [];

  return (
    <li className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {faculty.photo ? (
          <img
            src={faculty.photo}
            alt=""
            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <span
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `linear-gradient(150deg, ${color.from} 0%, ${color.to} 100%)`,
              color: color.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {initials(faculty.name)}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FacultyLink
              facultyId={faculty.profile_visibility ? faculty.id : null}
              onNavigate={onNavigate}
              className="font-medium text-gray-900 hover:text-[#8b0000] transition-colors"
            >
              {faculty.name}
            </FacultyLink>
            {/* Real signal, not an invented availability light: it means the SU
                directory confirmed this record. Absent when it did not. */}
            {faculty.directory_verified && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"
                title="Matched to the Salisbury University directory"
              >
                <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                Directory verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {[faculty.title, faculty.department].filter(Boolean).join(" · ") ||
              "Salisbury University"}
          </p>

          {matched.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {matched.slice(0, 4).map((name) => (
                <span
                  key={name}
                  className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Why this person is here, assembled from the fields that actually put
              them here — never generated prose. */}
          <p className="text-xs text-gray-600 mt-2">
            {matched.length > 0
              ? `Listed under ${matched[0]}${matched.length > 1 ? ` and ${matched.length - 1} more sub-area${matched.length > 2 ? "s" : ""}` : ""}`
              : `Listed in this area by their research profile`}
            {papersHere > 0
              ? ` · ${papersHere} of their ${faculty.article_count} papers are keyworded to ${slug.replace(/-/g, " ")}`
              : ""}
          </p>
        </div>

        {prominence !== null && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p
              className="text-xl font-semibold text-gray-900"
              title="Prominence: directory verification 45, listed department 10, title 5, papers up to 20, citations up to 20"
            >
              {prominence.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">Prominence</p>
          </div>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-3 mt-3">
        <MetricBar
          label="Papers"
          value={num(faculty.article_count)}
          ratio={faculty.article_count / peaks.papers}
          color={color.dot}
        />
        <MetricBar
          label="Citations"
          value={num(faculty.total_citations)}
          ratio={faculty.total_citations / peaks.citations}
          color={color.dot}
        />
        <MetricBar
          label="Citations per paper"
          value={average.toFixed(1)}
          ratio={average / peaks.average}
          color={color.dot}
        />
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onToggleBookmark(faculty.id)}
          aria-pressed={bookmarked}
          title={
            bookmarked
              ? "Saved in this browser only — remove"
              : "Save in this browser only (not stored on the server)"
          }
          className={
            bookmarked
              ? "text-[#8b0000] transition-colors"
              : "text-gray-400 hover:text-[#8b0000] transition-colors"
          }
        >
          <Bookmark
            className="w-4 h-4"
            aria-hidden="true"
            fill={bookmarked ? "currentColor" : "none"}
          />
          <span className="sr-only">{bookmarked ? "Remove bookmark" : "Bookmark"}</span>
        </button>
        <button
          type="button"
          onClick={() => onRequestIntro(faculty)}
          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-md bg-[#8b0000] text-white hover:shadow-md transition-shadow"
        >
          <Send className="w-3 h-3" aria-hidden="true" />
          Request intro
        </button>
        {faculty.profile_visibility && (
          <FacultyLink
            facultyId={faculty.id}
            onNavigate={onNavigate}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#8b0000] hover:underline"
          >
            View
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </FacultyLink>
        )}
      </div>
    </li>
  );
}

function MetricBar({
  label,
  value,
  ratio,
  color,
}: {
  label: string;
  value: string;
  ratio: number;
  color: string;
}) {
  const width = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-medium text-gray-900">{value}</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: "#f1f3f7",
          overflow: "hidden",
          marginTop: 4,
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
