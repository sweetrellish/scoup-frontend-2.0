import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, Users, FileText, Info, Building2 } from "lucide-react";

import { networkAPI } from "../utils/api";

/**
 * Collaboration structure around a research topic.
 *
 * Deliberately not the Experts page: Experts answers "who is the best match",
 * this answers "how does work on this topic connect across the institution" —
 * which departments and schools it spans, which keywords bridge them, and which
 * papers tie the group together. It also shows the query expansion the backend
 * applied, so a result set that looks broader than the query typed is
 * explainable rather than mysterious.
 */

interface Colleague {
  id: string;
  name: string;
  title: string;
  department: string;
  school?: string;
  keywords: string[];
  sharedKeywords: string[];
  matchScore: number;
  matchReason: string;
  articleCount: number;
  totalCitations: number;
  directoryVerified?: boolean;
}

interface NetworkPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  departments?: string[];
  citations: number;
  sharedKeywords?: string[];
}

interface DiscoveryResponse {
  profileKeywords: string[];
  expandedTerms: string[];
  suggestedCategories: string[];
  colleagues: Colleague[];
  papers: NetworkPaper[];
}

interface DepartmentCluster {
  department: string;
  school: string;
  members: Colleague[];
  keywords: string[];
}

export function NetworksPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<DiscoveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res: any = await networkAPI.discovery(
          query.trim() ? { q: query.trim(), limit: 60 } : { limit: 60 },
        );
        if (cancelled) return;
        setData({
          profileKeywords: res?.profileKeywords ?? [],
          expandedTerms: res?.expandedTerms ?? [],
          suggestedCategories: res?.suggestedCategories ?? [],
          colleagues: Array.isArray(res?.colleagues) ? res.colleagues : [],
          papers: Array.isArray(res?.papers) ? res.papers : [],
        });
        setError("");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load the network.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query ? 400 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  /** Group people into departments, then rank the keywords bridging each group. */
  const clusters = useMemo<DepartmentCluster[]>(() => {
    if (!data) return [];
    const map = new Map<string, Colleague[]>();
    data.colleagues.forEach((c) => {
      const key = (c.department || "").trim() || "Unlisted department";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });

    return Array.from(map.entries())
      .map(([department, members]) => {
        const counts = new Map<string, number>();
        members.forEach((m) =>
          (m.sharedKeywords?.length ? m.sharedKeywords : m.keywords || []).forEach((k) =>
            counts.set(k, (counts.get(k) || 0) + 1),
          ),
        );
        return {
          department,
          school: members.find((m) => m.school)?.school || "",
          members: [...members].sort((a, b) => b.matchScore - a.matchScore),
          keywords: Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([k]) => k),
        };
      })
      .sort((a, b) => b.members.length - a.members.length);
  }, [data]);

  const bridging = useMemo(
    () => clusters.filter((c) => c.department !== "Unlisted department").length,
    [clusters],
  );

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Networks</h1>
        <p className="text-sm text-gray-600 mt-1">
          How research on a topic connects across departments and schools.
        </p>
      </header>

      <div className="relative mb-4 max-w-2xl">
        <SearchIcon
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a topic, e.g. coastal ecology, data science"
          aria-label="Search the collaboration network"
          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Building the network…</p>
      ) : !data || data.colleagues.length === 0 ? (
        <p className="text-sm text-gray-500">
          No connected researchers found{query.trim() ? ` for “${query.trim()}”` : ""}.
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Researchers", value: data.colleagues.length },
              { label: "Departments", value: bridging },
              {
                label: "Schools",
                value: new Set(clusters.map((c) => c.school).filter(Boolean)).size,
              },
              { label: "Connecting papers", value: data.papers.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-gray-200 rounded-lg bg-white px-4 py-3"
              >
                <dt className="text-xs text-gray-500">{stat.label}</dt>
                <dd className="text-xl font-semibold text-gray-900">{stat.value}</dd>
              </div>
            ))}
          </dl>

          {(data.expandedTerms.length > 0 || data.suggestedCategories.length > 0) && (
            <div className="flex items-start gap-2 mb-6 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
              <div className="min-w-0">
                {data.expandedTerms.length > 0 && (
                  <p>
                    <span className="font-medium">Searched for:</span>{" "}
                    {data.expandedTerms.join(", ")}
                  </p>
                )}
                {data.suggestedCategories.length > 0 && (
                  <p className="mt-1">
                    <span className="font-medium">Related areas:</span>{" "}
                    {data.suggestedCategories.slice(0, 8).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          )}

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Departments in this network
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {clusters.map((cluster) => (
                <article
                  key={cluster.department}
                  className="border border-gray-200 rounded-lg bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900">{cluster.department}</h3>
                      {cluster.school && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3" aria-hidden="true" />
                          {cluster.school}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-sm text-gray-600 shrink-0">
                      <Users className="w-3 h-3" aria-hidden="true" />
                      {cluster.members.length}
                    </span>
                  </div>

                  {cluster.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cluster.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  <ul className="mt-3 space-y-1">
                    {cluster.members.slice(0, 4).map((member) => (
                      <li key={member.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="truncate">{member.name}</span>
                        {member.directoryVerified && (
                          <span className="text-xs text-green-700 shrink-0">verified</span>
                        )}
                        <span className="ml-auto text-xs text-gray-400 shrink-0">
                          {member.articleCount} papers
                        </span>
                      </li>
                    ))}
                    {cluster.members.length > 4 && (
                      <li className="text-xs text-gray-400">
                        +{cluster.members.length - 4} more
                      </li>
                    )}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {data.papers.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Papers connecting this network
              </h2>
              <ul className="space-y-2">
                {data.papers.slice(0, 10).map((paper) => (
                  <li
                    key={paper.id}
                    className="border border-gray-200 rounded-lg bg-white px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {paper.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {[paper.authors?.slice(0, 3).join(", "), paper.journal, paper.year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {(paper.departments?.length ?? 0) > 1 && (
                          <p className="text-xs text-[#8b0000] mt-1">
                            Spans {paper.departments!.length} departments
                          </p>
                        )}
                      </div>
                      <span className="ml-auto text-xs text-gray-400 shrink-0">
                        {paper.citations} cited
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
