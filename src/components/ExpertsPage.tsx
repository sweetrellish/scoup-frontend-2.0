import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

import { networkAPI } from "../utils/api";
import { FacultyLink } from "./FacultyLink";

interface ExpertsPageProps {
  onNavigate: (path: string) => void;
}

interface Colleague {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  keywords: string[];
  sharedKeywords: string[];
  matchScore: number;
  matchReason: string;
  articleCount: number;
  totalCitations: number;
  directoryVerified?: boolean;
}

export function ExpertsPage({ onNavigate }: ExpertsPageProps) {
  const [query, setQuery] = useState("");
  const [experts, setExperts] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res: any = await networkAPI.discovery(
          query.trim() ? { q: query.trim(), limit: 40 } : { limit: 40 },
        );
        if (cancelled) return;
        setExperts(Array.isArray(res?.colleagues) ? res.colleagues : []);
        setError("");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load experts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query ? 400 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-[#7a0000]">Experts</h1>
        <p className="text-sm text-gray-600 mt-1">
          Faculty ranked by how closely their research matches your search.
        </p>
      </header>

      <div className="relative mb-6 max-w-xl">
        <SearchIcon
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic, e.g. ecology, machine learning"
          aria-label="Search experts"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]/30"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading experts…</p>
      ) : experts.length === 0 ? (
        <p className="text-sm text-gray-500">No experts matched that search.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {experts.map((expert) => (
            <li
              key={expert.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    <FacultyLink
                      facultyId={expert.id}
                      onNavigate={onNavigate}
                      className="text-gray-900 hover:text-[#8b0000]"
                    >
                      {expert.name}
                    </FacultyLink>
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {[expert.title, expert.department].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#8b0000] shrink-0">
                  {Math.round(expert.matchScore)}
                </span>
              </div>

              {expert.directoryVerified && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wide bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                  Directory verified
                </span>
              )}

              <p className="text-xs text-gray-600 mt-2">{expert.matchReason}</p>

              {expert.sharedKeywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {expert.sharedKeywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <dl className="flex gap-4 mt-3 text-[11px] text-gray-500">
                <div>
                  <dt className="inline">Papers </dt>
                  <dd className="inline font-medium text-gray-700">
                    {expert.articleCount}
                  </dd>
                </div>
                <div>
                  <dt className="inline">Citations </dt>
                  <dd className="inline font-medium text-gray-700">
                    {expert.totalCitations}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
