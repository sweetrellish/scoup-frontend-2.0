import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Award,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  FolderOpen,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  UserX,
  Users,
} from "lucide-react";
import { adminAPI } from "../../utils/api";

interface Props {
  onNavigate: (tab: string) => void;
}

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
    from_faculty?: number;
    from_external?: number;
  };
  content: {
    papers: number;
    patents: number;
    projects: number;
  };
  department_breakdown: { name: string; faculty_count: number }[];
}

const emptyStats: Stats = {
  faculty: {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    unverified: 0,
    hidden: 0,
  },
  inquiries: {
    total: 0,
    new: 0,
    reviewed: 0,
    closed: 0,
    from_faculty: 0,
    from_external: 0,
  },
  content: {
    papers: 0,
    patents: 0,
    projects: 0,
  },
  department_breakdown: [],
};

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function AdminOverviewPage({ onNavigate }: Props) {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    adminAPI
      .getStats()
      .then((data) => setStats({ ...emptyStats, ...data }))
      .catch((e: any) => setError(e?.message || "Failed to load overview."))
      .finally(() => setIsLoading(false));
  }, []);

  const quickStats = useMemo(
    () => [
      {
        label: "Total Faculty",
        value: stats.faculty.total,
        change: `${stats.faculty.approved} approved`,
        changePercent: percent(stats.faculty.approved, stats.faculty.total),
        icon: Users,
        color: "from-[#8b0000] to-[#6b0000]",
      },
      {
        label: "Publications",
        value: stats.content.papers,
        change: "All records",
        changePercent: 0,
        icon: FileText,
        color: "from-blue-600 to-blue-500",
      },
      {
        label: "Inquiries",
        value: stats.inquiries.total,
        change: `${stats.inquiries.new} pending`,
        changePercent: percent(stats.inquiries.new, stats.inquiries.total),
        icon: Eye,
        color: "from-green-600 to-green-500",
      },
      {
        label: "Active Projects",
        value: stats.content.projects,
        change: "Tracked projects",
        changePercent: 0,
        icon: FolderOpen,
        color: "from-purple-600 to-purple-500",
      },
    ],
    [stats],
  );

  const actionItems = useMemo(
    () =>
      [
        {
          id: "pending",
          type: "faculty",
          name: "Faculty awaiting approval",
          action: `${stats.faculty.pending} verified faculty profiles need review.`,
          time: "Admin review queue",
          count: stats.faculty.pending,
          tab: "pending",
        },
        {
          id: "inquiries",
          type: "project",
          name: "Unreviewed collaboration inquiries",
          action: `${stats.inquiries.new} collaboration requests are still pending.`,
          time: "Collaboration inbox",
          count: stats.inquiries.new,
          tab: "inquiries",
        },
        {
          id: "hidden",
          type: "publication",
          name: "Hidden approved profiles",
          action: `${stats.faculty.hidden} approved faculty profiles are not publicly visible.`,
          time: "Faculty management",
          count: stats.faculty.hidden,
          tab: "faculty",
        },
        {
          id: "rejected",
          type: "patent",
          name: "Rejected faculty accounts",
          action: `${stats.faculty.rejected} faculty accounts are marked rejected.`,
          time: "Faculty management",
          count: stats.faculty.rejected,
          tab: "faculty",
        },
      ].filter((item) => item.count > 0),
    [stats],
  );

  const topDepartments = stats.department_breakdown.slice(0, 6).map((dept) => ({
    name: dept.name,
    faculty: dept.faculty_count,
    views: dept.faculty_count,
  }));

  const topDepartmentMax = topDepartments[0]?.views || 1;
  const activeFacultyPercent = percent(stats.faculty.approved, stats.faculty.total);
  const avgItemsPerFaculty = stats.faculty.total
    ? Math.round(
        (stats.content.papers + stats.content.patents + stats.content.projects) /
          stats.faculty.total,
      )
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-gray-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#8b0000]" />
        Loading overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-light text-gray-900">
          Admin Dashboard
        </h1>
        <p className="font-light text-gray-600">
          Monitor platform activity and manage SCOUP
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {stat.changePercent > 0 && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <ArrowUp className="h-4 w-4" />
                    <span>{stat.changePercent}%</span>
                  </div>
                )}
              </div>
              <div className="mb-1 text-3xl font-light text-gray-900">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="mt-1 text-xs text-gray-500">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b0000]">
              <TrendingUp className="h-5 w-5 text-[#ffd100]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-600">
                Latest updates across the platform
              </p>
            </div>
          </div>

          {actionItems.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">All clear</p>
                <p className="text-sm text-gray-600">
                  No pending approvals, hidden approved profiles, or unreviewed
                  inquiries need attention.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {actionItems.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => onNavigate(activity.tab)}
                  className="group flex w-full items-start gap-3 border-b border-gray-100 pb-4 text-left last:border-0 last:pb-0"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      activity.type === "faculty"
                        ? "bg-[#8b0000]/10"
                        : activity.type === "publication"
                          ? "bg-blue-100"
                          : activity.type === "project"
                            ? "bg-green-100"
                            : "bg-purple-100"
                    }`}
                  >
                    {activity.type === "faculty" && (
                      <Users className="h-5 w-5 text-[#8b0000]" />
                    )}
                    {activity.type === "publication" && (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    {activity.type === "project" && (
                      <FolderOpen className="h-5 w-5 text-green-600" />
                    )}
                    {activity.type === "patent" && (
                      <UserX className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {activity.name}
                    </p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b0000]">
              <Building2 className="h-5 w-5 text-[#ffd100]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                Top Departments
              </h2>
              <p className="text-sm text-gray-600">By primary faculty count</p>
            </div>
          </div>

          {topDepartments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No department data available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {topDepartments.map((dept, index) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffd100]/20">
                        <span className="text-sm font-medium text-[#8b0000]">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {dept.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {dept.faculty} faculty
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {dept.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">faculty</div>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8b0000] to-[#ffd100] transition-all duration-500"
                      style={{ width: `${(dept.views / topDepartmentMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b0000]/10">
              <Users className="h-5 w-5 text-[#8b0000]" />
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
              Active
            </span>
          </div>
          <div className="mb-1 text-3xl font-light text-gray-900">
            {stats.faculty.approved}
          </div>
          <div className="text-sm text-gray-600">Active Faculty</div>
          <div className="mt-1 text-xs text-gray-500">
            {activeFacultyPercent}% of total
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
              Tracked
            </span>
          </div>
          <div className="mb-1 text-3xl font-light text-gray-900">
            {stats.content.patents}
          </div>
          <div className="text-sm text-gray-600">Total Patents</div>
          <div className="mt-1 text-xs text-gray-500">Across faculty records</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
              {stats.inquiries.new} pending
            </span>
          </div>
          <div className="mb-1 text-3xl font-light text-gray-900">
            {avgItemsPerFaculty}
          </div>
          <div className="text-sm text-gray-600">Avg Outputs per Faculty</div>
          <div className="mt-1 text-xs text-gray-500">
            Papers, patents, and projects
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-[#8b0000] to-[#6b0000] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#ffd100]">
            <Award className="h-6 w-6 text-[#8b0000]" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium">
              Platform Health:{" "}
              {stats.faculty.pending || stats.inquiries.new ? "Needs Review" : "Excellent"}
            </h3>
            <div className="grid gap-6 text-sm text-white/90 md:grid-cols-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-medium">System Status</span>
                </div>
                <div className="text-white/80">All services operational</div>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-medium">Data Scope</span>
                </div>
                <div className="text-white/80">
                  {stats.content.papers.toLocaleString()} publications indexed
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="font-medium">Pending Reviews</span>
                </div>
                <div className="text-white/80">
                  {stats.faculty.pending} faculty profiles awaiting approval
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
