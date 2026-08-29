import { useEffect, useState } from "react";
import {
  Activity, CheckCircle2, Clock, ClipboardList, EyeOff,
  MessageSquare, RefreshCw, UserX,
} from "lucide-react";
import { adminAPI } from "../../utils/api";

interface AuditEntry {
  id: number;
  admin: string;
  action: string;
  action_key: string;
  target_type: string;
  target_id: number | null;
  target_name: string;
  notes: string;
  created_at: string;
}

interface Stats {
  faculty: { pending: number; hidden: number; rejected: number };
  inquiries: { new: number };
}

const ACTION_COLOR: Record<string, string> = {
  approve_faculty:   "bg-green-50 text-green-700 border-green-200",
  bulk_approve:      "bg-green-50 text-green-700 border-green-200",
  reject_faculty:    "bg-red-50 text-red-700 border-red-200",
  bulk_reject:       "bg-red-50 text-red-700 border-red-200",
  toggle_visibility: "bg-blue-50 text-blue-700 border-blue-200",
  delete_faculty:    "bg-gray-100 text-gray-600 border-gray-200",
  update_inquiry:    "bg-amber-50 text-amber-700 border-amber-200",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function StrategicInsightsPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [logRes, statsRes] = await Promise.all([
        adminAPI.getAuditLog(),
        adminAPI.getStats(),
      ]);
      setAuditLog(logRes.results ?? []);
      setStats(statsRes);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const healthChecks = stats ? [
    {
      id: "pending",
      icon: Clock,
      color: "text-amber-600",
      dot: "bg-amber-400",
      label: "Faculty awaiting approval",
      detail: `${stats.faculty.pending} faculty have verified their email and are waiting to be approved.`,
      count: stats.faculty.pending,
    },
    {
      id: "inquiries",
      icon: MessageSquare,
      color: "text-yellow-600",
      dot: "bg-yellow-400",
      label: "Unreviewed inquiries",
      detail: `${stats.inquiries.new} collaboration inquiries have not been reviewed yet.`,
      count: stats.inquiries.new,
    },
    {
      id: "hidden",
      icon: EyeOff,
      color: "text-blue-600",
      dot: "bg-blue-400",
      label: "Approved faculty with hidden profiles",
      detail: `${stats.faculty.hidden} faculty are approved but their profile visibility is turned off.`,
      count: stats.faculty.hidden,
    },
    {
      id: "rejected",
      icon: UserX,
      color: "text-red-500",
      dot: "bg-red-400",
      label: "Rejected faculty accounts",
      detail: `${stats.faculty.rejected} faculty have been rejected. Review if this is expected.`,
      count: stats.faculty.rejected,
    },
  ] : [];

  const issues = healthChecks.filter(h => h.count > 0);
  const allClear = issues.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Platform Health</h1>
          <p className="text-gray-600 font-light">Action items, outstanding tasks, and admin activity log</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 text-sm gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#8b0000] rounded-full animate-spin" />
          Loading health data...
        </div>
      ) : (
        <>
          {/* Action Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#ffd100]" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900">Action Items</h2>
                <p className="text-sm text-gray-600">Things that may need your attention</p>
              </div>
            </div>

            {allClear ? (
              <div className="flex items-center gap-3 py-4 text-green-600">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-medium">All clear!</p>
                  <p className="text-sm text-green-500">No pending approvals, unreviewed inquiries, or hidden profiles.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {issues.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit Log */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#ffd100]" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900">Admin Activity Log</h2>
                <p className="text-sm text-gray-600">
                  {auditLog.length > 0 ? `Last ${auditLog.length} admin actions` : "No actions recorded yet"}
                </p>
              </div>
            </div>

            {auditLog.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Actions will appear here as admins approve faculty, update inquiries, and more.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {auditLog.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-[#8b0000]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#8b0000]">
                        {(entry.admin || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{entry.admin}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ACTION_COLOR[entry.action_key] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {entry.action}
                        </span>
                        {entry.target_name && (
                          <span className="text-sm text-gray-500 truncate">· {entry.target_name}</span>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(entry.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
