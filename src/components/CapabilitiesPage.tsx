import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, ChevronLeft, Users, FileText } from "lucide-react";

import { categoriesAPI, type TopLevelCategory, type CategoryDetail } from "../utils/api";
import { FacultyLink } from "./FacultyLink";

interface CapabilitiesPageProps {
  title: string;
  description: string;
  onNavigate: (path: string) => void;
}

/** Capability areas grouped from real research profiles; drills into the experts behind each. */
export function CapabilitiesPage({ title, description, onNavigate }: CapabilitiesPageProps) {
  const [categories, setCategories] = useState<TopLevelCategory[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    categoriesAPI
      .list()
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load capability areas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mid_level_categories?.some((m) => m.name.toLowerCase().includes(q)),
    );
  }, [categories, query]);

  const openCapability = async (slug: string) => {
    setDetailLoading(true);
    setError("");
    try {
      setSelected(await categoriesAPI.detail(slug));
    } catch {
      setError("Unable to load that capability.");
    } finally {
      setDetailLoading(false);
    }
  };

  if (selected) {
    return (
      <div className="p-8 max-w-6xl">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#8b0000] mb-4"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          All capabilities
        </button>

        <h1 className="text-2xl font-semibold text-gray-900">{selected.category_name}</h1>

        <dl className="flex flex-wrap gap-6 mt-3 text-sm">
          <div>
            <dt className="text-gray-500">Experts</dt>
            <dd className="font-semibold text-gray-900">{selected.stats.faculty_count}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Papers</dt>
            <dd className="font-semibold text-gray-900">{selected.stats.article_count}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Citations</dt>
            <dd className="font-semibold text-gray-900">{selected.stats.total_citations}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Avg citations</dt>
            <dd className="font-semibold text-gray-900">{selected.stats.citation_average}</dd>
          </div>
        </dl>

        {selected.themes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {selected.themes.slice(0, 15).map((t) => (
              <span
                key={t.name}
                className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
              >
                {t.name} · {t.count}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-900 mt-8 mb-3">
          Experts behind this capability
        </h2>
        {selected.faculty.length === 0 ? (
          <p className="text-sm text-gray-500">No faculty are linked to this capability yet.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {selected.faculty.slice(0, 40).map((f) => (
              <li key={f.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-medium">
                  <FacultyLink
                    facultyId={f.id}
                    onNavigate={onNavigate}
                    className="text-gray-900 hover:text-[#8b0000]"
                  >
                    {f.name}
                  </FacultyLink>
                </p>
                <p className="text-xs text-gray-600">
                  {[f.title, f.department].filter(Boolean).join(" · ") || "Salisbury University"}
                </p>
                <p className="text-[11px] text-gray-500 mt-2">
                  {f.article_count} papers · {f.total_citations} citations
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </header>

      <div className="relative mb-6 max-w-xl">
        <SearchIcon
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search capabilities, e.g. ecology, public health"
          aria-label="Search capabilities"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]/30"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading || detailLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No capability areas matched that search.</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">
            {filtered.length} capability area{filtered.length === 1 ? "" : "s"}
          </p>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, 60).map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => openCapability(c.slug)}
                  className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-[#8b0000]/40 transition-colors"
                >
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <div className="flex gap-4 mt-2 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" aria-hidden="true" />
                      {c.faculty_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" aria-hidden="true" />
                      {c.article_count}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
