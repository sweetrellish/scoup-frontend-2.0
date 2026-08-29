import { useEffect, useState } from "react";
import { Mail, MessageSquare, FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react";
import { facultyInquiriesAPI } from "../../utils/api";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

type Inquiry = {
  id: number;
  status: "pending" | "reviewed" | "closed";
  source_type: "faculty" | "external";
  requester_role?: string;
  created_at: string;
  from_faculty_name: string;
  from_faculty_email: string;
  from_faculty_department: string;
  target_project_title?: string;
  note: string;
};

const statusClass: Record<Inquiry["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

export function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    facultyInquiriesAPI
      .list()
      .then((res) => {
        const all = res.results ?? [];
        // Admin messages go to the Messages tab — only show collaboration requests here
        setInquiries(all.filter((inq: any) => inq.source_type !== "admin"));
      })
      .catch((err) => setError(err?.message || "Unable to load inquiries."))
      .finally(() => setIsLoading(false));
  }, []);

  const updateStatus = async (id: number, status: "reviewed" | "closed") => {
    try {
      const updated = await facultyInquiriesAPI.update(id, { status });
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, status: updated.status } : inquiry,
        ),
      );
    } catch (err: any) {
      setError(err?.message || "Unable to update inquiry.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-600 mt-1">
          Messages from collaborators interested in your profile or open projects
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
          Loading inquiries...
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900">No inquiries yet</p>
          <p className="text-sm text-gray-500 mt-1">
            New profile and project interest messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h2 className="text-lg font-medium text-gray-900">
                      {inquiry.from_faculty_name || "Unknown sender"}
                    </h2>
                    <Badge variant="outline" className={statusClass[inquiry.status]}>
                      {inquiry.status}
                    </Badge>
                    {inquiry.requester_role && (
                      <Badge variant="secondary">{inquiry.requester_role}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {inquiry.from_faculty_email}
                    {inquiry.from_faculty_department && ` · ${inquiry.from_faculty_department}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </div>
              </div>

              {inquiry.target_project_title && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#8b0000] bg-[#8b0000]/5 rounded-lg px-3 py-2">
                  <FolderOpen className="w-4 h-4" />
                  Project: {inquiry.target_project_title}
                </div>
              )}

              <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                {inquiry.note || "No message provided."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {inquiry.from_faculty_email && (
                  <a
                    href={`mailto:${inquiry.from_faculty_email}?subject=${encodeURIComponent(
                      inquiry.target_project_title
                        ? `Re: ${inquiry.target_project_title}`
                        : "Re: SCOUP collaboration inquiry",
                    )}`}
                  >
                    <Button size="sm" className="bg-[#8b0000] hover:bg-[#700000] text-white">
                      <Mail className="w-4 h-4 mr-1.5" />
                      Reply
                    </Button>
                  </a>
                )}
                {inquiry.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(inquiry.id, "reviewed")}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Mark Reviewed
                  </Button>
                )}
                {inquiry.status !== "closed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(inquiry.id, "closed")}>
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Close
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
