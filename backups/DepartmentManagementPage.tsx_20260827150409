import { useEffect, useMemo, useState } from "react";
import { Building2, Users, FileText, Search, ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import { adminAPI } from "../../utils/api";

interface FacultyRow {
  id: number;
  name: string;
  title: string;
  email: string;
  is_approved: boolean;
  profile_visibility: boolean;
  article_count: number;
  photo: string | null;
  primary_department: { id: number; name: string } | null;
  departments: string[];
}

interface DeptSummary {
  name: string;
  faculty: FacultyRow[];
  papers: number;
}

export function DepartmentManagementPage() {
  const [allFaculty, setAllFaculty] = useState<FacultyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await adminAPI.getAllFaculty();
      setAllFaculty(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build department summaries
  const departments = useMemo<DeptSummary[]>(() => {
    const map = new Map<string, FacultyRow[]>();

    allFaculty.forEach(f => {
      const depts = f.primary_department
        ? [f.primary_department.name, ...f.departments.filter(d => d !== f.primary_department?.name)]
        : f.departments.length > 0 ? f.departments : ["Unassigned"];

      depts.forEach(deptName => {
        if (!map.has(deptName)) map.set(deptName, []);
        map.get(deptName)!.push(f);
      });
    });

    return Array.from(map.entries())
      .map(([name, faculty]) => ({
        name,
        faculty,
        papers: faculty.reduce((s, f) => s + f.article_count, 0),
      }))
      .sort((a, b) => b.faculty.length - a.faculty.length);
  }, [allFaculty]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? departments.filter(d => d.name.toLowerCase().includes(q))
      : departments;
  }, [departments, search]);

  const activeDeptData = useMemo(
    () => departments.find(d => d.name === activeDept) ?? null,
    [departments, activeDept],
  );

  const publicProfileUrl = (name: string) =>
    `${window.location.origin}/?q=${encodeURIComponent(name)}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 text-sm gap-3">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#8b0000] rounded-full animate-spin" />
        Loading departments...
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>;
  }

  // --- Department detail view ---
  if (activeDept && activeDeptData) {
    const approved = activeDeptData.faculty.filter(f => f.is_approved).length;
    const pending  = activeDeptData.faculty.filter(f => !f.is_approved).length;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveDept(null)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Departments
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-1">{activeDept}</h1>
          <p className="text-gray-500 font-light">
            {activeDeptData.faculty.length} faculty · {activeDeptData.papers} papers · {approved} approved · {pending} pending
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Faculty</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Papers</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeDeptData.faculty.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {f.photo ? (
                        <img src={f.photo} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#8b0000]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-[#8b0000]">{(f.name || "?")[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{f.name}</div>
                        {f.title && <div className="text-xs text-gray-400">{f.title}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {f.is_approved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{f.article_count}</td>
                  <td className="px-6 py-3 text-right">
                    <a
                      href={publicProfileUrl(f.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#8b0000] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- Department directory ---
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-1">Departments</h1>
          <p className="text-gray-500 font-light">
            {departments.length} departments · {allFaculty.length} faculty total
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
        />
      </div>

      {/* Department grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          No departments match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dept => {
            const approved = dept.faculty.filter(f => f.is_approved).length;
            const pending  = dept.faculty.filter(f => !f.is_approved).length;

            return (
              <button
                key={dept.name}
                onClick={() => setActiveDept(dept.name)}
                className="text-left bg-white rounded-lg border border-gray-200 p-5 hover:border-[#8b0000]/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 bg-[#8b0000]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#8b0000] transition-colors">
                    <Building2 className="w-4 h-4 text-[#8b0000] group-hover:text-[#ffd100] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#8b0000] transition-colors">
                      {dept.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{dept.faculty.length} faculty</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span>{dept.papers} papers</span>
                  </div>
                </div>

                {(approved > 0 || pending > 0) && (
                  <div className="mt-3 flex gap-2">
                    {approved > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        {approved} approved
                      </span>
                    )}
                    {pending > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {pending} pending
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
