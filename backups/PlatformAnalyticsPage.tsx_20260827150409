import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  Globe,
  MessageSquare,
  CheckCircle,
  Clock,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { adminAPI } from "../../utils/api";

interface Stats {
  faculty: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    unverified: number;
    hidden: number;
  };
  inquiries: {
    total: number;
    new: number;
    reviewed: number;
    closed: number;
    from_faculty: number;
    from_external: number;
  };
  content: {
    papers: number;
    patents: number;
    projects: number;
  };
  department_breakdown: { name: string; faculty_count: number }[];
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-light text-gray-900 mb-0.5">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function SegmentBar({
  segments,
}: {
  segments: { label: string; value: number; color: string; bg: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="h-2.5 bg-gray-100 rounded-full" />;
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-2.5 gap-px">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.label}
              className={s.color}
              style={{ width: `${(s.value / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${s.color}`} />
            <span className="text-sm text-gray-600">{s.label}</span>
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${s.bg}`}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      setStats(await adminAPI.getStats());
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 text-sm gap-3">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#8b0000] rounded-full animate-spin" />
        Loading analytics...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        {error || "No data."}
      </div>
    );
  }

  const maxDept = Math.max(
    ...stats.department_breakdown.map((d) => d.faculty_count),
    1,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Platform Analytics
          </h1>
          <p className="text-gray-600 font-light">
            Live data across faculty, inquiries, and research content
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Faculty"
          value={stats.faculty.total}
          icon={Users}
          color="bg-[#8b0000]/10 text-[#8b0000]"
          sub={`${stats.faculty.approved} approved`}
        />
        <StatCard
          label="Papers"
          value={stats.content.papers}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Patents"
          value={stats.content.patents}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Projects"
          value={stats.content.projects}
          icon={Globe}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Faculty breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              Faculty Status
            </h2>
            <p className="text-sm text-gray-600">
              {stats.faculty.total} total registered faculty
            </p>
          </div>
        </div>

        <SegmentBar
          segments={[
            {
              label: "Approved",
              value: stats.faculty.approved,
              color: "bg-green-500",
              bg: "bg-green-50 text-green-700",
            },
            {
              label: "Pending",
              value: stats.faculty.pending,
              color: "bg-amber-400",
              bg: "bg-amber-50 text-amber-700",
            },
            {
              label: "Rejected",
              value: stats.faculty.rejected,
              color: "bg-red-400",
              bg: "bg-red-50 text-red-700",
            },
            {
              label: "Unverified",
              value: stats.faculty.unverified,
              color: "bg-gray-300",
              bg: "bg-gray-100 text-gray-600",
            },
          ]}
        />

        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-4">
          {[
            {
              icon: CheckCircle,
              color: "text-green-500",
              label: `${stats.faculty.approved} approved & live`,
            },
            {
              icon: Clock,
              color: "text-amber-500",
              label: `${stats.faculty.pending} awaiting review`,
            },
            {
              icon: EyeOff,
              color: "text-gray-400",
              label: `${stats.faculty.hidden} approved but hidden`,
            },
          ].map(({ icon: Icon, color, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inquiries breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              Collaboration Inquiries
            </h2>
            <p className="text-sm text-gray-600">
              {stats.inquiries.total} total submissions
            </p>
          </div>
        </div>

        <SegmentBar
          segments={[
            {
              label: "New",
              value: stats.inquiries.new,
              color: "bg-yellow-400",
              bg: "bg-yellow-50 text-yellow-700",
            },
            {
              label: "Reviewed",
              value: stats.inquiries.reviewed,
              color: "bg-blue-500",
              bg: "bg-blue-50 text-blue-700",
            },
            {
              label: "Closed",
              value: stats.inquiries.closed,
              color: "bg-gray-300",
              bg: "bg-gray-100 text-gray-600",
            },
          ]}
        />

        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
          {[
            {
              icon: Users,
              color: "text-blue-400",
              label: `${stats.inquiries.from_faculty} from faculty`,
            },
            {
              icon: Globe,
              color: "text-green-400",
              label: `${stats.inquiries.from_external} from external stakeholders`,
            },
          ].map(({ icon: Icon, color, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department breakdown */}
      {stats.department_breakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#ffd100]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                Faculty by Department
              </h2>
              <p className="text-sm text-gray-600">
                Top {stats.department_breakdown.length} departments by primary
                faculty
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {stats.department_breakdown.map((dept) => (
              <div key={dept.name} className="flex items-center gap-3">
                <div
                  className="w-44 shrink-0 text-sm text-gray-700 truncate"
                  title={dept.name}
                >
                  {dept.name}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#8b0000] h-full rounded-full transition-all"
                    style={{
                      width: `${(dept.faculty_count / maxDept) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium text-gray-700 shrink-0">
                  {dept.faculty_count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
