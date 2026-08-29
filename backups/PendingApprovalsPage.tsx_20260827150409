import { useState, useEffect } from "react";
import { adminAPI } from "../../utils/api";
import { CheckCircle, XCircle, Clock, Mail, User, RefreshCw } from "lucide-react";

interface PendingFaculty {
  id: number;
  name: string;
  email: string;
  institutional_email: string;
  institutional_email_verified: boolean;
  is_approved: boolean;
  primary_department: { id: number; name: string } | null;
  primary_school: { id: number; name: string } | null;
}

export function PendingApprovalsPage() {
  const [pending, setPending] = useState<PendingFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: number; reason: string } | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminAPI.getPendingFaculty();
      setPending(data);
    } catch (err: any) {
      setError(err.message || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await adminAPI.approveFaculty(id);
      setPending((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to approve faculty.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number, reason: string) => {
    setActionLoading(id);
    try {
      await adminAPI.rejectFaculty(id, reason);
      setPending((prev) => prev.filter((f) => f.id !== id));
      setRejectReason(null);
    } catch (err: any) {
      setError(err.message || "Failed to reject faculty.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Faculty who have verified their institutional email and are awaiting profile approval.
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading pending approvals…</p>
        </div>
      ) : pending.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No faculty accounts are currently awaiting approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((faculty) => (
            <div
              key={faculty.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Faculty info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#ffd100] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#8b0000]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{faculty.name || "—"}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {faculty.email && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {faculty.email}
                        </span>
                      )}
                      {faculty.institutional_email && (
                        <span className="text-xs text-green-700 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3 h-3" /> {faculty.institutional_email}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {faculty.primary_department && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {faculty.primary_department.name}
                        </span>
                      )}
                      {faculty.primary_school && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {faculty.primary_school.name}
                        </span>
                      )}
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(faculty.id)}
                    disabled={actionLoading === faculty.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectReason({ id: faculty.id, reason: "" })}
                    disabled={actionLoading === faculty.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Reject reason input */}
              {rejectReason?.id === faculty.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Optional: reason for rejection (sent to faculty)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Could not verify faculty status"
                      value={rejectReason.reason}
                      onChange={(e) => setRejectReason({ ...rejectReason, reason: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                    <button
                      onClick={() => handleReject(faculty.id, rejectReason.reason)}
                      disabled={actionLoading === faculty.id}
                      className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => setRejectReason(null)}
                      className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
