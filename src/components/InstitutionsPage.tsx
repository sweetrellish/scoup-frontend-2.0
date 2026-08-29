import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, Building, Info } from "lucide-react";

import { institutionsAPI, type Institution } from "../utils/api";

/**
 * Institutions that appear alongside SU research in the publication corpus.
 *
 * `mentions` counts occurrences in affiliation text — it is a co-occurrence
 * signal, not a partnership register and not a headcount. The page says so
 * rather than letting a number imply more than it measures.
 */
export function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [excludeHost, setExcludeHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [openProvenance, setOpenProvenance] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await institutionsAPI.list({ q: query, excludeHost, limit: 500 });
        if (cancelled) return;
        setInstitutions(res.results);
        setTotal(res.total);
        setNote(res.source?.metric || "");
        setError("");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load institutions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, excludeHost]);

  const maxMentions = useMemo(
    () => institutions.reduce((max, i) => Math.max(max, i.mentions), 0),
    [institutions],
  );

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Institutions</h1>
        <p className="text-sm text-gray-600 mt-1">
          Institutions appearing in the affiliations of papers in this corpus.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-2xl">
          <SearchIcon
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search institutions"
            aria-label="Search institutions"
            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={excludeHost}
            onChange={(e) => setExcludeHost(e.target.checked)}
            className="rounded border-gray-300"
          />
          Hide Salisbury University
        </label>
      </div>

      <div className="flex items-start gap-2 mb-6 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          {note || "Mentions count occurrences in affiliation text."} Extraction noise
          (author names bleeding into institution names, sentence fragments) has been removed;
          truncated names that could not be resolved without guessing were dropped rather than
          corrected.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading institutions…</p>
      ) : institutions.length === 0 ? (
        <p className="text-sm text-gray-500">No institutions match “{query}”.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">
            {institutions.length} of {total} institutions
          </p>
          <ul className="space-y-2">
            {institutions.map((institution) => (
              <li
                key={institution.name}
                className="border border-gray-200 rounded-lg bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <span className="font-medium text-gray-900">{institution.name}</span>
                  {institution.isHost && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#8b0000] bg-[#ffd100] px-2 py-0.5 rounded-full">
                      Host institution
                    </span>
                  )}
                  <span className="ml-auto text-sm text-gray-500 shrink-0">
                    {institution.mentions} {institution.mentions === 1 ? "mention" : "mentions"}
                  </span>
                </div>

                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8b0000] rounded-full"
                    style={{
                      width: `${maxMentions ? (institution.mentions / maxMentions) * 100 : 0}%`,
                    }}
                  />
                </div>

                {institution.mergedFrom.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() =>
                        setOpenProvenance(
                          openProvenance === institution.name ? null : institution.name,
                        )
                      }
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {openProvenance === institution.name ? "Hide" : "Show"}{" "}
                      {institution.mergedFrom.length} raw extraction
                      {institution.mergedFrom.length === 1 ? "" : "s"} folded into this entry
                    </button>
                    {openProvenance === institution.name && (
                      <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc list-inside">
                        {institution.mergedFrom.map((raw) => (
                          <li key={raw}>{raw}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
