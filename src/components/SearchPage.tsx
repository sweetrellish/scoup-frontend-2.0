import { useEffect, useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, ExternalLink, Info } from "lucide-react";

import { searchAPI, type SearchFilters, type SearchPaper } from "../utils/api";

/**
 * Advanced search over the full paper corpus, server-side.
 *
 * The home page search bar ranks a dataset downloaded into the browser from
 * `/api/public/search-data/`. This page calls `/api/search/` instead, so it
 * uses the backend ranker and can filter by year, journal and citations —
 * constraints the client-side engine has no equivalent for. Each result shows
 * the confidence the ranker assigned and which fields matched, so a surprising
 * hit can be explained rather than just accepted.
 */

const EMPTY_FILTERS: SearchFilters = { sort: "relevance" };

const paperHref = (paper: SearchPaper) => {
  const link = (paper.link || "").trim();
  if (link) return link.startsWith("http") ? link : `https://${link}`;
  const doi = (paper.doi || "").trim();
  return doi ? `https://doi.org/${doi}` : "";
};

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchPaper[]>([]);
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await searchAPI.papers(trimmed, filters, 30);
        if (cancelled) return;
        setResults(res.results || []);
        setDetail(res.detail || "");
        setError("");
        setSearched(true);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Search failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, filters]);

  const update = (patch: Partial<SearchFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const activeFilterCount = [
    filters.year_min,
    filters.year_max,
    filters.journal,
    filters.min_citations,
    filters.has_abstract || undefined,
  ].filter((v) => v !== undefined && v !== "" && v !== null).length;

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Search</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ranked search across the full publication corpus, with filters and match
          explanations.
        </p>
      </header>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers by topic, title or keyword"
            aria-label="Search papers"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]/30"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
            activeFilterCount
              ? "border-[#8b0000] text-[#8b0000] bg-[#8b0000]/5"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      {showFilters && (
        <div className="border border-gray-200 rounded-lg bg-white p-4 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Published from</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 2015"
              value={filters.year_min ?? ""}
              onChange={(e) =>
                update({ year_min: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Published to</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 2026"
              value={filters.year_max ?? ""}
              onChange={(e) =>
                update({ year_max: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Journal contains</span>
            <input
              value={filters.journal ?? ""}
              onChange={(e) => update({ journal: e.target.value || undefined })}
              placeholder="e.g. oncology"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Minimum citations</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 10"
              value={filters.min_citations ?? ""}
              onChange={(e) =>
                update({ min_citations: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Sort by</span>
            <select
              value={filters.sort ?? "relevance"}
              onChange={(e) => update({ sort: e.target.value as SearchFilters["sort"] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="relevance">Relevance</option>
              <option value="citations">Most cited</option>
              <option value="year">Most recent</option>
            </select>
          </label>
          <div className="flex items-end justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={!!filters.has_abstract}
                onChange={(e) => update({ has_abstract: e.target.checked || undefined })}
                className="rounded border-gray-300"
              />
              Has an abstract
            </label>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-gray-500">Searching…</p>}

      {!loading && !searched && (
        <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-4">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Enter at least two characters. Results are ranked by the backend across titles,
            themes, abstracts, keywords and journals, and each one shows why it matched.
          </p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-gray-500">
          No papers match “{query.trim()}”
          {activeFilterCount > 0 && " with these filters"}.
        </p>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm text-gray-500">
              {results.length} {results.length === 1 ? "paper" : "papers"}
            </p>
            {detail && <p className="text-xs text-gray-400">{detail}</p>}
          </div>
          <ul className="space-y-3">
            {results.map((paper) => {
              const href = paperHref(paper);
              return (
                <li key={paper.id} className="border border-gray-200 rounded-lg bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-medium text-gray-900 leading-snug">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline inline-flex items-start gap-1"
                        >
                          {paper.title}
                          <ExternalLink className="w-3 h-3 mt-1 shrink-0 text-gray-400" />
                        </a>
                      ) : (
                        paper.title
                      )}
                    </h2>
                    <span
                      className="text-xs font-medium text-gray-600 tabular-nums shrink-0"
                      title="Ranker confidence"
                    >
                      {Math.round(paper.confidence)}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {[paper.authors.slice(0, 4).join(", "), paper.journal, paper.year || null]
                      .filter(Boolean)
                      .join(" · ")}
                    {paper.authors.length > 4 && ` +${paper.authors.length - 4} more`}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 tabular-nums">
                      {paper.citations} {paper.citations === 1 ? "citation" : "citations"}
                    </span>
                    {(paper.matchedOn || []).map((field) => (
                      <span
                        key={field}
                        className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        title="Field that matched the query"
                      >
                        matched {field}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
