import { useEffect, useState } from "react";
import { Search as SearchIcon, Building2, Users, Info } from "lucide-react";

import { facilitiesAPI, type Facility, type FacilitiesResponse } from "../utils/api";

/**
 * Campus buildings, joined to the faculty who have a room in them.
 *
 * The join is exact-match only: a building code from the campus building-info
 * list has to equal the room prefix in the SU directory. Near-misses between the
 * code list and the facilities page ("Devilbiss Science Hall" vs "Devilbiss
 * Hall") are shown as separate entries rather than assumed identical.
 */
export function FacilitiesPage() {
  const [data, setData] = useState<FacilitiesResponse | null>(null);
  const [query, setQuery] = useState("");
  const [occupiedOnly, setOccupiedOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await facilitiesAPI.list({ q: query, occupied: occupiedOnly });
        if (cancelled) return;
        setData(res);
        setError("");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load facilities.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, occupiedOnly]);

  const summary = data?.summary;

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Facilities</h1>
        <p className="text-sm text-gray-600 mt-1">
          Campus buildings and the departments housed in them.
        </p>
      </header>

      {summary && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Buildings", value: summary.buildingsWithCodes },
            { label: "Building codes", value: summary.buildingCodes },
            { label: "Occupied by faculty", value: summary.occupiedByFaculty },
            { label: "Faculty placed", value: summary.facultyPlaced },
          ].map((stat) => (
            <div key={stat.label} className="border border-gray-200 rounded-lg bg-white px-4 py-3">
              <dt className="text-xs text-gray-500">{stat.label}</dt>
              <dd className="text-xl font-semibold text-gray-900 tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[16rem] max-w-xl">
          <SearchIcon
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by building, code or department"
            aria-label="Search facilities"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={occupiedOnly}
            onChange={(e) => setOccupiedOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          Only buildings with faculty
        </label>
      </div>

      <div className="flex items-start gap-2 mb-6 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Faculty placement comes from room numbers in the SU directory, so it covers only
          faculty whose directory row was matched. Buildings are joined to the code list on exact
          names only — near-matching names are listed separately rather than merged.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading facilities…</p>
      ) : !data || data.results.length === 0 ? (
        <p className="text-sm text-gray-500">
          No buildings match these filters.
          {occupiedOnly && " Try unchecking “Only buildings with faculty”."}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.results.map((facility) => (
            <FacilityCard key={`${facility.name}-${facility.codes.join("-")}`} facility={facility} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <li className="border border-gray-200 rounded-lg bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-1" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{facility.name}</span>
            {facility.codes.map((code) => (
              <span
                key={code}
                className="text-[11px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {code}
              </span>
            ))}
            {!facility.hasBuildingCode && (
              <span className="text-[11px] text-gray-500 italic">no building code</span>
            )}
          </div>

          {facility.departments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {facility.departments.map((dept) => (
                <span
                  key={dept}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {dept}
                </span>
              ))}
            </div>
          )}

          {facility.schools.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">{facility.schools.join(" · ")}</p>
          )}
        </div>

        {facility.facultyCount > 0 && (
          <span className="flex items-center gap-1 text-sm text-gray-600 tabular-nums shrink-0">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {facility.facultyCount}
          </span>
        )}
      </div>
    </li>
  );
}
