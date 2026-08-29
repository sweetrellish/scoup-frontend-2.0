import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Lightbulb,
  Mail,
  MessageSquare,
  Search,
  Send,
  User,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { adminAPI } from "../../utils/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const PAGE_SIZE = 20;

interface FacultyRow {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  institutional_email: string;
  institutional_email_verified: boolean;
  is_approved: boolean;
  profile_visibility: boolean;
  review_status: string;
  article_count: number;
  total_citations: number;
  patent_count?: number;
  project_count?: number;
  photo: string | null;
  primary_department: { id: number; name: string } | null;
  departments: string[];
  has_user: boolean;
  missing_data: boolean;
  last_active?: string | null;
  last_login?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  date_joined?: string | null;
}

type StatusFilter = "all" | "active" | "pending" | "inactive" | "needs_review";
type ViewMode = "list" | "review_queue";

const isPending = (faculty: FacultyRow) =>
  faculty.institutional_email_verified && !faculty.is_approved && faculty.review_status !== "rejected";

const isActive = (faculty: FacultyRow) => faculty.is_approved && faculty.profile_visibility;

const isInactive = (faculty: FacultyRow) =>
  faculty.review_status === "rejected" ||
  !faculty.profile_visibility ||
  (faculty.has_user && !faculty.institutional_email_verified);

const needsReview = (faculty: FacultyRow) =>
  isPending(faculty) || (faculty.has_user && !faculty.institutional_email_verified);

const departmentName = (faculty: FacultyRow) =>
  faculty.primary_department?.name || faculty.departments?.[0] || "No department";

const statusFor = (faculty: FacultyRow): "active" | "pending" | "inactive" => {
  if (isPending(faculty)) return "pending";
  if (isActive(faculty)) return "active";
  return "inactive";
};

const formatDateLabel = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const lastActiveLabel = (faculty: FacultyRow) => {
  const value =
    faculty.last_active || faculty.last_login || faculty.updated_at || faculty.date_joined || faculty.created_at;
  return formatDateLabel(value) || "Not tracked";
};

const publicProfileUrl = (faculty: FacultyRow) =>
  `${window.location.origin}/?q=${encodeURIComponent(faculty.name)}`;

export function FacultyManagementPage() {
  const [facultyMembers, setFacultyMembers] = useState<FacultyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRow | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<FacultyRow | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkVisibilityAction, setBulkVisibilityAction] = useState<"show" | "hide" | null>(null);

  // Admin → Faculty direct messaging
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgNote, setMsgNote] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgError, setMsgError] = useState("");

  const loadFaculty = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await adminAPI.getAllFaculty();
      setFacultyMembers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load faculty.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadFaculty(); }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [filterStatus, searchTerm, viewMode]);

  const reviewQueueFaculty = useMemo(() => facultyMembers.filter(needsReview), [facultyMembers]);

  const filteredFaculty = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return facultyMembers.filter((faculty) => {
      const matchesSearch =
        !q ||
        faculty.name.toLowerCase().includes(q) ||
        (faculty.email || "").toLowerCase().includes(q) ||
        (faculty.institutional_email || "").toLowerCase().includes(q) ||
        departmentName(faculty).toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filterStatus === "all") return true;
      if (filterStatus === "needs_review") return needsReview(faculty);
      return statusFor(faculty) === filterStatus;
    });
  }, [facultyMembers, filterStatus, searchTerm]);

  const statusCounts = useMemo(
    () => ({
      all: facultyMembers.length,
      active: facultyMembers.filter((f) => statusFor(f) === "active").length,
      pending: facultyMembers.filter((f) => statusFor(f) === "pending").length,
      inactive: facultyMembers.filter((f) => statusFor(f) === "inactive").length,
      needs_review: reviewQueueFaculty.length,
    }),
    [facultyMembers, reviewQueueFaculty.length],
  );

  const flash = (message: string) => {
    setActionMsg(message);
    window.setTimeout(() => setActionMsg(""), 3000);
  };

  const updateFacultyRow = (id: number, patch: Partial<FacultyRow>) => {
    setFacultyMembers((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    setSelectedFaculty((cur) => (cur?.id === id ? { ...cur, ...patch } : cur));
  };

  const handleApprove = async (faculty: FacultyRow) => {
    try {
      await adminAPI.approveFaculty(faculty.id);
      updateFacultyRow(faculty.id, { is_approved: true, review_status: "approved", profile_visibility: true });
      flash("Faculty approved.");
    } catch (e: any) {
      flash(e?.message || "Failed to approve faculty.");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await adminAPI.rejectFaculty(rejectTarget.id, rejectReason);
      updateFacultyRow(rejectTarget.id, { is_approved: false, review_status: "rejected" });
      flash("Faculty rejected.");
    } catch (e: any) {
      flash(e?.message || "Failed to reject faculty.");
    } finally {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const handleToggleVisibility = async (faculty: FacultyRow) => {
    const next = !faculty.profile_visibility;
    try {
      await adminAPI.updateFaculty(faculty.id, { profile_visibility: next });
      updateFacultyRow(faculty.id, { profile_visibility: next });
      flash(next ? "Profile is visible." : "Profile is hidden.");
    } catch (e: any) {
      flash(e?.message || "Failed to update visibility.");
    }
  };

  const approvePendingProfiles = async () => {
    const ids = facultyMembers.filter(isPending).map((f) => f.id);
    if (ids.length === 0) return;
    try {
      await adminAPI.bulkFacultyAction("approve", ids);
      setFacultyMembers((prev) =>
        prev.map((f) =>
          ids.includes(f.id) ? { ...f, is_approved: true, review_status: "approved", profile_visibility: true } : f,
        ),
      );
      flash(`${ids.length} pending profile${ids.length === 1 ? "" : "s"} approved.`);
    } catch (e: any) {
      flash(e?.message || "Failed to approve pending profiles.");
    }
  };

  const exportFacultyList = () => {
    const header = "Name,Email,Department,Status,Last Active";
    const rows = filteredFaculty.map((f) =>
      [f.name, f.email || f.institutional_email || "", departmentName(f), statusFor(f), lastActiveLabel(f)]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "faculty-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (faculty: FacultyRow) => {
    const status = statusFor(faculty);
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        status === "active" ? "bg-green-100 text-green-700" :
        status === "pending" ? "bg-yellow-100 text-yellow-700" :
        "bg-gray-100 text-gray-700"
      }`}>
        {status === "active" && <CheckCircle className="w-3 h-3" />}
        {status === "pending" && <Clock className="w-3 h-3" />}
        {status === "inactive" && <XCircle className="w-3 h-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const reviewReasons = (faculty: FacultyRow) => {
    const reasons: string[] = [];
    if (isPending(faculty)) reasons.push("Awaiting admin approval - email has been verified.");
    if (faculty.has_user && !faculty.institutional_email_verified) reasons.push("Institutional email is not verified.");
    return reasons;
  };

  const listToRender = viewMode === "review_queue" ? reviewQueueFaculty : filteredFaculty;
  const totalPages = Math.max(1, Math.ceil(listToRender.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = listToRender.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingFrom = listToRender.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, listToRender.length);
  const allOnPageSelected = paginatedList.length > 0 && paginatedList.every((faculty) => selectedIds.has(faculty.id));
  const someOnPageSelected = paginatedList.some((faculty) => selectedIds.has(faculty.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginatedList.forEach((faculty) => next.delete(faculty.id));
      } else {
        paginatedList.forEach((faculty) => next.add(faculty.id));
      }
      return next;
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkVisibility = async () => {
    if (!bulkVisibilityAction) return;
    const visible = bulkVisibilityAction === "show";
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => adminAPI.updateFaculty(id, { profile_visibility: visible })));
      setFacultyMembers((prev) =>
        prev.map((faculty) => (ids.includes(faculty.id) ? { ...faculty, profile_visibility: visible } : faculty)),
      );
      setSelectedFaculty((current) =>
        current && ids.includes(current.id) ? { ...current, profile_visibility: visible } : current,
      );
      setSelectedIds(new Set());
      flash(`${ids.length} profile${ids.length === 1 ? "" : "s"} set to ${visible ? "visible" : "hidden"}.`);
    } catch (e: any) {
      flash(e?.message || "Bulk update failed.");
    } finally {
      setBulkVisibilityAction(null);
    }
  };

  const openMsgModal = () => {
    setMsgSubject("");
    setMsgNote("");
    setMsgError("");
    setMsgModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedFaculty) return;
    if (!msgNote.trim()) { setMsgError("Message body is required."); return; }
    setMsgSending(true);
    setMsgError("");
    try {
      await adminAPI.sendFacultyMessage(selectedFaculty.id, {
        note: msgNote.trim(),
        message_subject: msgSubject.trim() || undefined,
      });
      setMsgModalOpen(false);
      flash(`Message sent to ${selectedFaculty.name}.`);
    } catch (e: any) {
      setMsgError(e?.message || "Failed to send message.");
    } finally {
      setMsgSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Faculty Management</h1>
          <p className="text-gray-600 font-light mt-1">Manage faculty profiles and review pending accounts</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[#8b0000] hover:bg-[#6b0000] text-white" : ""}
          >
            Faculty List
          </Button>
          <Button
            variant={viewMode === "review_queue" ? "default" : "outline"}
            onClick={() => { setViewMode("review_queue"); setFilterStatus("needs_review"); }}
            className={viewMode === "review_queue" ? "bg-[#8b0000] hover:bg-[#6b0000] text-white" : ""}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Needs Action ({reviewQueueFaculty.length})
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
          {actionMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button onClick={() => setFilterStatus("all")} className={`p-4 rounded-lg border-2 transition-all text-left ${filterStatus === "all" ? "border-[#8b0000] bg-[#8b0000]/5" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-3xl font-light text-gray-900">{statusCounts.all}</div>
        </button>
        <button onClick={() => setFilterStatus("active")} className={`p-4 rounded-lg border-2 transition-all text-left ${filterStatus === "active" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-3xl font-light text-green-600">{statusCounts.active}</div>
        </button>
        <button onClick={() => setFilterStatus("pending")} className={`p-4 rounded-lg border-2 transition-all text-left ${filterStatus === "pending" ? "border-yellow-600 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-light text-yellow-600">{statusCounts.pending}</div>
        </button>
        <button onClick={() => setFilterStatus("inactive")} className={`p-4 rounded-lg border-2 transition-all text-left ${filterStatus === "inactive" ? "border-gray-600 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          <div className="text-3xl font-light text-gray-600">{statusCounts.inactive}</div>
        </button>
        <button onClick={() => { setFilterStatus("needs_review"); setViewMode("review_queue"); }} className={`p-4 rounded-lg border-2 transition-all text-left ${filterStatus === "needs_review" ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="text-sm text-gray-600 mb-1">Needs Action</div>
          <div className="text-3xl font-light text-orange-600">{statusCounts.needs_review}</div>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search faculty by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {viewMode === "review_queue" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Needs Action</p>
                <p className="text-sm text-gray-600">
                  Faculty who have verified their email and are waiting for approval, or whose email is still unverified.
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">Loading faculty...</div>
          ) : listToRender.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear</h3>
              <p className="text-gray-600">No items pending review at this time.</p>
            </div>
          ) : (
            listToRender.map((faculty) => (
              <div key={faculty.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{faculty.name}</h3>
                    <p className="text-sm text-gray-600">{departmentName(faculty)}</p>
                  </div>
                  {statusBadge(faculty)}
                </div>
                <div className="space-y-2">
                  {reviewReasons(faculty).map((reason) => (
                    <div key={reason} className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-800">{reason}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedFaculty(faculty)}>Review</Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#8b0000] focus:ring-[#8b0000]"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Faculty Member</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Visibility</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">Loading faculty...</td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No faculty members found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((faculty) => (
                    <tr
                      key={faculty.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedIds.has(faculty.id) ? "bg-[#8b0000]/5" : ""}`}
                    >
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(faculty.id)}
                          onChange={() => toggleSelect(faculty.id)}
                          className="rounded border-gray-300 text-[#8b0000] focus:ring-[#8b0000]"
                        />
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                        <div className="font-medium text-gray-900 text-sm">{faculty.name}</div>
                        <div className="text-xs text-gray-400">{faculty.email || faculty.institutional_email}</div>
                      </td>
                      <td className="px-4 py-3 cursor-pointer text-sm text-gray-600" onClick={() => setSelectedFaculty(faculty)}>
                        {departmentName(faculty)}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                        {statusBadge(faculty)}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${faculty.profile_visibility ? "text-blue-600" : "text-gray-400"}`}>
                          {faculty.profile_visibility ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {faculty.profile_visibility ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3 cursor-pointer text-sm text-gray-500" onClick={() => setSelectedFaculty(faculty)}>
                        {lastActiveLabel(faculty)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && listToRender.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-sm text-gray-500">
                Showing {showingFrom}-{showingTo} of {listToRender.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-r from-[#8b0000] to-[#6b0000] rounded-lg p-6 text-white">
        <h3 className="font-medium mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={approvePendingProfiles}>
            Approve All Pending ({statusCounts.pending})
          </Button>
          <a href="mailto:?subject=SCOUP faculty profile reminder">
            <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
              Send Reminder Email
            </Button>
          </a>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={exportFacultyList}>
            Export CSV
          </Button>
        </div>
      </div>

      {selectedFaculty && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "42rem", height: "100%", overflowY: "auto" }} className="shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{selectedFaculty.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{departmentName(selectedFaculty)}</p>
                  <p className="text-sm text-gray-400">{selectedFaculty.email || selectedFaculty.institutional_email}</p>
                </div>
                <button onClick={() => setSelectedFaculty(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(selectedFaculty.email || selectedFaculty.institutional_email) && (
                  <a href={`mailto:${selectedFaculty.email || selectedFaculty.institutional_email}`}>
                    <Button size="sm" variant="outline"><Mail className="w-3.5 h-3.5 mr-1.5" /> Email</Button>
                  </a>
                )}
                <Button size="sm" variant="outline" onClick={openMsgModal}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message
                </Button>
                <a href={publicProfileUrl(selectedFaculty)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline"><Eye className="w-3.5 h-3.5 mr-1.5" /> View Profile</Button>
                </a>
                {statusFor(selectedFaculty) === "pending" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(selectedFaculty)} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectTarget(selectedFaculty)} className="border-red-300 text-red-600 hover:bg-red-50">
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                    </Button>
                  </>
                )}
                {statusFor(selectedFaculty) === "active" && (
                  <Button size="sm" variant="outline" onClick={() => handleToggleVisibility(selectedFaculty)} className="border-gray-300 text-gray-600 hover:bg-gray-50">
                    <UserX className="w-3.5 h-3.5 mr-1.5" /> Suspend
                  </Button>
                )}
                {statusFor(selectedFaculty) === "inactive" && selectedFaculty.is_approved && (
                  <Button size="sm" variant="outline" onClick={() => handleToggleVisibility(selectedFaculty)} className="border-gray-300 text-gray-600 hover:bg-gray-50">
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Restore Visibility
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
                  <div className="text-2xl font-light text-gray-900">{selectedFaculty.article_count || 0}</div>
                  <div className="text-xs text-gray-500">Papers</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                  <Lightbulb className="w-6 h-6 text-purple-500 mx-auto mb-1.5" />
                  <div className="text-2xl font-light text-gray-900">{selectedFaculty.patent_count || 0}</div>
                  <div className="text-xs text-gray-500">Patents</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                  <FolderOpen className="w-6 h-6 text-green-500 mx-auto mb-1.5" />
                  <div className="text-2xl font-light text-gray-900">{selectedFaculty.project_count || 0}</div>
                  <div className="text-xs text-gray-500">Projects</div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Profile Details</h3>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    {statusBadge(selectedFaculty)}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Visibility</p>
                    <button
                      onClick={() => handleToggleVisibility(selectedFaculty)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        selectedFaculty.profile_visibility
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {selectedFaculty.profile_visibility ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {selectedFaculty.profile_visibility ? "Visible" : "Hidden"}
                    </button>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Email verified</p>
                    <p className="text-gray-900">{selectedFaculty.institutional_email_verified ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Total citations</p>
                    <p className="text-gray-900">{(selectedFaculty.total_citations || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Last active</p>
                    <p className="text-gray-900">{lastActiveLabel(selectedFaculty)}</p>
                  </div>
                </div>
              </div>

              {reviewReasons(selectedFaculty).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Action needed</p>
                  {reviewReasons(selectedFaculty).map((reason) => (
                    <div key={reason} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-sm text-gray-700">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      {reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && createPortal(
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 9998, display: "flex", alignItems: "center", gap: "0.75rem", background: "#1f2937", borderRadius: "0.75rem", padding: "0.75rem 1.25rem", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#f9fafb" }}>
            {selectedIds.size} selected
          </span>
          <div style={{ width: "1px", height: "1.25rem", background: "#374151" }} />
          <button
            onClick={() => setBulkVisibilityAction("show")}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "#93c5fd", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem", borderRadius: "0.375rem" }}
          >
            <Eye style={{ width: "0.875rem", height: "0.875rem" }} /> Set Visible
          </button>
          <button
            onClick={() => setBulkVisibilityAction("hide")}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem", borderRadius: "0.375rem" }}
          >
            <EyeOff style={{ width: "0.875rem", height: "0.875rem" }} /> Set Hidden
          </button>
          <div style={{ width: "1px", height: "1.25rem", background: "#374151" }} />
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ fontSize: "0.75rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
          >
            Clear
          </button>
        </div>,
        document.body
      )}

      {rejectTarget && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "28rem" }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Reject faculty profile</h3>
            <p className="text-sm text-gray-500 mb-4">Optionally include a reason.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">Confirm Reject</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {bulkVisibilityAction && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "28rem" }}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {bulkVisibilityAction === "show" ? "Set profiles to visible?" : "Hide profiles?"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This will set <strong>{selectedIds.size} profile{selectedIds.size === 1 ? "" : "s"}</strong> to{" "}
              <strong>{bulkVisibilityAction === "show" ? "publicly visible" : "hidden"}</strong>. Are you sure?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkVisibilityAction(null)}>Cancel</Button>
              <Button
                onClick={handleBulkVisibility}
                className={bulkVisibilityAction === "show" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 hover:bg-gray-800 text-white"}
              >
                Yes, {bulkVisibilityAction === "show" ? "make visible" : "hide"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Admin → Faculty compose modal */}
      {msgModalOpen && selectedFaculty && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "30rem" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  To: <span className="font-medium text-gray-700">{selectedFaculty.name}</span>
                </p>
              </div>
              <button
                onClick={() => setMsgModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Subject <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="e.g. Next steps for your profile"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={msgNote}
                  onChange={(e) => setMsgNote(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000]/40 resize-none"
                />
              </div>
            </div>

            {msgError && (
              <p className="mt-2 text-xs text-red-600">{msgError}</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setMsgModalOpen(false)} disabled={msgSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={msgSending}
                className="bg-[#8b0000] hover:bg-[#700000] text-white"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {msgSending ? "Sending…" : "Send Message"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
