import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import { apiCall } from "../../utils/api";
import { getInitials } from "../../utils/avatar";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Lightbulb,
  FolderOpen,
  AlertTriangle,
  User,
  Building2,
  TrendingUp,
  Eye,
  ChevronRight,
  Plus,
  Globe,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface Paper {
  id: string;
  title: string;
  year: number;
  citations?: number;
  journal: string;
}

interface Patent {
  id: string;
  title: string;
  year: number;
  patentNumber: string;
}

interface Project {
  id: string;
  title: string;
  fundingAmount?: string;
  status: string;
}

interface FacultyProfile {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  school: string;
  phone: string;
  bio: string;
  photo: string;
  keywords: string[];
  is_approved: boolean;
  institutional_email_verified: boolean;
}

interface SuggestedPaper {
  id: string | number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  citations: number;
  source: string;
  matchScore: number;
  url?: string;
}

interface SuggestedProfile {
  id: string | number;
  name: string;
  email?: string;
  department?: string;
  institution?: string;
  matchScore: number;
  source: string;
  externalFacultyId?: number;
  papers: SuggestedPaper[];
  patents: any[];
  projects: any[];
  profileImage?: string;
}

interface SuggestedPatent {
  id: string | number;
  title: string;
  patentNumber: string;
  inventors: string;
  year: number;
  source: string;
  matchScore: number;
  url?: string;
}

interface SuggestedProject {
  id: string | number;
  title: string;
  description: string;
  fundingAgency?: string;
  amount?: string;
  year: number;
  source: string;
  matchScore: number;
}

interface DashboardOverviewProps {
  onNavigate?: (tab: string) => void;
}

const normalizePhotoUrl = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) return "";
  const raw = value.trim();
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  )
    return raw;
  const configuredApi = import.meta.env.VITE_API_BASE_URL || "";
  if (!configuredApi) return raw.startsWith("/") ? raw : `/media/${raw}`;

  try {
    const origin = new URL(configuredApi).origin;
    if (!raw.startsWith("/"))
      return `${origin}/media/${raw.replace(/^media\//, "")}`;
    return `${origin}${raw}`;
  } catch {
    return raw;
  }
};

const toKeywordList = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  return [];
};

const normalizeProfile = (profile: any): FacultyProfile => {
  const firstName = String(
    profile?.first_name ?? profile?.firstName ?? "",
  ).trim();
  const lastName = String(profile?.last_name ?? profile?.lastName ?? "").trim();
  const fallbackName = String(
    profile?.name ??
      profile?.full_name ??
      profile?.username ??
      "Faculty Profile",
  ).trim();
  const name = `${firstName} ${lastName}`.trim() || fallbackName;
  const schoolAffiliations = Array.isArray(profile?.school_affiliations)
    ? profile.school_affiliations
    : Array.isArray(profile?.schoolAffiliations)
      ? profile.schoolAffiliations
      : [];

  return {
    name,
    firstName,
    lastName,
    email: String(profile?.email ?? ""),
    title: String(profile?.title ?? ""),
    department: String(profile?.department ?? ""),
    school: String(profile?.school ?? schoolAffiliations[0] ?? ""),
    phone: String(profile?.phone ?? ""),
    bio: String(profile?.bio ?? ""),
    photo: normalizePhotoUrl(
      profile?.photo ?? profile?.profile_photo ?? profile?.profilePhoto,
    ),
    keywords: [
      ...toKeywordList(profile?.keywords),
      ...toKeywordList(profile?.faculty_keywords),
      ...toKeywordList(profile?.ai_keywords),
    ].slice(0, 8),
    is_approved: Boolean(profile?.is_approved),
    institutional_email_verified: Boolean(profile?.institutional_email_verified),
  };
};

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  // Current verified data from database backend
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [myPapers, setMyPapers] = useState<Paper[]>([]);
  const [myPatents, setMyPatents] = useState<Patent[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);

  const [suggestedProfiles, setSuggestedProfiles] = useState<
    SuggestedProfile[]
  >([]);
  const [suggestedPapers, setSuggestedPapers] = useState<SuggestedPaper[]>([]);
  const [suggestedPatents, setSuggestedPatents] = useState<SuggestedPatent[]>(
    [],
  );
  const [suggestedProjects, setSuggestedProjects] = useState<
    SuggestedProject[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profiles" | "papers" | "patents" | "projects"
  >("profiles");
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        profileData,
        papersData,
        patentsData,
        projectsData,
        suggestionsData,
      ] = await Promise.all([
        apiCall("/faculty/me/"),
        apiCall("/papers/"),
        apiCall("/patents/"),
        apiCall("/projects/"),
        apiCall("/faculty/me/suggestions/"),
      ]);

      setProfile(normalizeProfile(profileData));

      const papersRows = Array.isArray(papersData)
        ? papersData
        : papersData?.results || [];
      const patentsRows = Array.isArray(patentsData)
        ? patentsData
        : patentsData?.results || [];
      const projectsRows = Array.isArray(projectsData)
        ? projectsData
        : projectsData?.results || [];
      const suggestionRows = Array.isArray(suggestionsData?.suggestions)
        ? suggestionsData.suggestions
        : [];

      setMyPapers(
        papersRows.map((paper: any, index: number) => ({
          id: String(paper?.id ?? index),
          title: paper?.title ?? "",
          year: Number(paper?.year ?? new Date().getFullYear()),
          citations: Number(paper?.tc_count ?? 0),
          journal: paper?.journal ?? "",
        })),
      );

      setMyPatents(
        patentsRows.map((patent: any, index: number) => ({
          id: String(patent?.id ?? index),
          title: patent?.title ?? "",
          year:
            patent?.issue_date && String(patent.issue_date).includes("-")
              ? Number(String(patent.issue_date).split("-")[0])
              : 0,
          patentNumber: patent?.patent_number ?? patent?.patentNumber ?? "",
        })),
      );

      setMyProjects(
        projectsRows.map((project: any, index: number) => ({
          id: String(project?.id ?? index),
          title: project?.title ?? "",
          fundingAmount:
            project?.funding_amount ?? project?.fundingAmount ?? "",
          status: project?.status ?? "active",
        })),
      );

      setSuggestedProfiles(
        suggestionRows.map((item: any, index: number) => ({
          id: String(item?.id ?? index),
          externalFacultyId: Number(item?.id),
          name: item?.name ?? "Suggested profile",
          email: item?.email ?? "",
          department: item?.department ?? "",
          institution: "External Source",
          matchScore: Number(item?.score ?? item?.matchScore ?? 0),
          source:
            (Array.isArray(item?.reasons) && item.reasons[0]) ||
            "Name/keyword similarity",
          papers: [],
          patents: [],
          projects: [],
        })),
      );

      setSuggestedPapers([]);
      setSuggestedPatents([]);
      setSuggestedProjects([]);

      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setIsLoading(false);
    }
  };

  const getTotalCitations = () => {
    return myPapers.reduce((sum, p) => sum + (p.citations || 0), 0);
  };

  const getTotalFunding = () => {
    const total = myProjects.reduce((sum, p) => {
      if (p.fundingAmount) {
        const amount = p.fundingAmount.replace(/[$,]/g, "");
        return sum + (parseInt(amount) || 0);
      }
      return sum;
    }, 0);
    return total > 0 ? `$${(total / 1000).toFixed(0)}K` : "$0";
  };

  const handleClaimProfile = async (profileToClaim: SuggestedProfile) => {
    try {
      if (profileToClaim.externalFacultyId) {
        await apiCall(
          `/faculty/me/suggestions/${profileToClaim.externalFacultyId}/approve/`,
          {
            method: "POST",
          },
        );
      }
      setSuggestedProfiles((prev) =>
        prev.filter((p) => String(p.id) !== String(profileToClaim.id)),
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error claiming profile:", err);
    }
  };

  const handleClaimPaper = async (paper: SuggestedPaper) => {
    try {
      setSuggestedPapers((prev) =>
        prev.filter((p) => String(p.id) !== String(paper.id)),
      );
    } catch (err) {
      console.error("Error claiming paper:", err);
    }
  };

  const handleClaimPatent = async (patent: SuggestedPatent) => {
    try {
      setSuggestedPatents((prev) =>
        prev.filter((p) => String(p.id) !== String(patent.id)),
      );
    } catch (err) {
      console.error("Error claiming patent:", err);
    }
  };

  const handleClaimProject = async (project: SuggestedProject) => {
    try {
      setSuggestedProjects((prev) =>
        prev.filter((p) => String(p.id) !== String(project.id)),
      );
    } catch (err) {
      console.error("Error claiming project:", err);
    }
  };

  const handleRejectProfile = async (profileToReject: SuggestedProfile) => {
    try {
      if (profileToReject.externalFacultyId) {
        await apiCall(
          `/faculty/me/suggestions/${profileToReject.externalFacultyId}/reject/`,
          {
            method: "POST",
          },
        );
      }
      setSuggestedProfiles((prev) =>
        prev.filter((p) => String(p.id) !== String(profileToReject.id)),
      );
    } catch (err) {
      console.error("Error rejecting profile:", err);
    }
  };

  const handlePreviewProfile = async (profileToPreview: SuggestedProfile) => {
    const profileId = String(profileToPreview.id);
    const isExpanded = expandedProfile === profileId;

    if (isExpanded) {
      setExpandedProfile(null);
      return;
    }

    setExpandedProfile(profileId);

    if (
      profileToPreview.externalFacultyId &&
      profileToPreview.papers.length === 0
    ) {
      try {
        const preview = await apiCall(
          `/faculty/me/suggestions/${profileToPreview.externalFacultyId}/preview/`,
        );
        setSuggestedProfiles((prev) =>
          prev.map((p) =>
            p.id === profileToPreview.id
              ? {
                  ...p,
                  papers: Array.isArray(preview?.papers)
                    ? preview.papers.map((paper: any, idx: number) => ({
                        id: paper?.id ?? idx,
                        title: paper?.title ?? "",
                        authors: paper?.authors ?? "",
                        journal: paper?.journal ?? "",
                        year: paper?.year ?? 0,
                        citations: paper?.citations ?? 0,
                        source: paper?.source ?? profileToPreview.source,
                        matchScore: profileToPreview.matchScore,
                      }))
                    : [],
                  patents: Array.isArray(preview?.patents)
                    ? preview.patents
                    : [],
                  projects: Array.isArray(preview?.projects)
                    ? preview.projects
                    : [],
                }
              : p,
          ),
        );
      } catch (err) {
        console.error("Error fetching preview:", err);
      }
    }
  };

  const handleReject = async (
    id: string | number,
    type: "profile" | "paper" | "patent" | "project",
  ) => {
    const normalizedId = String(id);
    try {
      if (type === "profile") {
        const profile = suggestedProfiles.find(
          (p) => String(p.id) === normalizedId,
        );
        if (profile?.externalFacultyId) {
          await apiCall(
            `/faculty/me/suggestions/${profile.externalFacultyId}/reject/`,
            {
              method: "POST",
            },
          );
        }
        setSuggestedProfiles((prev) =>
          prev.filter((p) => String(p.id) !== normalizedId),
        );
      }
      if (type === "paper") {
        setSuggestedPapers((prev) =>
          prev.filter((p) => String(p.id) !== normalizedId),
        );
      }
      if (type === "patent") {
        setSuggestedPatents((prev) =>
          prev.filter((p) => String(p.id) !== normalizedId),
        );
      }
      if (type === "project") {
        setSuggestedProjects((prev) =>
          prev.filter((p) => String(p.id) !== normalizedId),
        );
      }
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  const getTotalSuggestions = () => {
    return (
      suggestedProfiles.length +
      suggestedPapers.length +
      suggestedPatents.length +
      suggestedProjects.length
    );
  };

  const getProfileCompletionPercent = () => {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.email,
      profile.title,
      profile.department,
      profile.school,
      profile.bio,
      profile.photo,
      profile.keywords.length > 0 ? "keywords" : "",
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            <p className="font-semibold">Error loading dashboard data</p>
            <p className="text-sm mt-1">{error}</p>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Your research profile from Salisbury University database
        </p>
      </div>

      {/* Profile Summary */}
      {profile && (
        <Card className="p-6">
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 rounded-lg">
                <AvatarImage src={profile.photo} alt={profile.name} />
                <AvatarFallback className="rounded-lg bg-[#8b0000] text-xl font-semibold text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.name}
                  </h2>
                  {profile.is_approved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  <Badge variant="secondary">
                    {getProfileCompletionPercent()}% complete
                  </Badge>
                </div>
                {profile.title && (
                  <p className="mt-1 text-gray-700">{profile.title}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
                  {profile.department && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {profile.department}
                    </span>
                  )}
                  {profile.department && profile.school && (
                    <span className="text-gray-300">·</span>
                  )}
                  {profile.school && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {profile.school}
                    </span>
                  )}
                  {(profile.department || profile.school) && profile.email && (
                    <span className="text-gray-300">·</span>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#8b0000]"
                    >
                      <Mail className="w-4 h-4 text-gray-400" />
                      {profile.email}
                    </a>
                  )}
                </div>

                {profile.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.keywords.slice(0, 6).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="font-normal"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" className="md:self-start md:ml-auto shrink-0" onClick={() => onNavigate?.("profile")}>
              Edit Profile
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {!profile.department && !profile.school && (
            <Alert className="mt-5 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-900">
                Add your department or school in Profile so dashboard analytics
                and matching have better context.
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Section 1: Your Verified Research Profile */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Verified Research Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate?.("papers")}
          >
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {myPapers.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Published Papers</p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate?.("patents")}
          >
            <div className="flex items-center justify-between mb-3">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {myPatents.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Patents</p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate?.("projects")}
          >
            <div className="flex items-center justify-between mb-3">
              <FolderOpen className="w-5 h-5 text-orange-600" />
              <ChevronRight className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {myProjects.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active Projects</p>
            <p className="text-xs text-gray-500 mt-2">
              Funding: {getTotalFunding()}
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate?.("analytics")}
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <ChevronRight className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {getTotalCitations()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Citations</p>
          </Card>
        </div>
      </div>

      {/* Section 2: Recent Publications */}
      {myPapers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Publications
            </h2>
            <Button
              variant="ghost"
              className="text-[#8b0000]"
              onClick={() => onNavigate?.("papers")}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPapers.slice(0, 2).map((paper) => (
              <Card
                key={paper.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span>{paper.journal}</span>
                      <span>•</span>
                      <span>{paper.year}</span>
                      {paper.citations && paper.citations > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-semibold">
                            {paper.citations} citations
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Suggestions from External Sources */}
      {getTotalSuggestions() > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Suggestions from External Sources
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review {getTotalSuggestions()} items that might belong to you
              </p>
            </div>
            <Badge className="bg-[#8b0000] text-white px-4 py-1">
              {getTotalSuggestions()} Pending
            </Badge>
          </div>

          <Alert className="border-[#8b0000] bg-[#8b0000] bg-opacity-5 mb-4">
            <AlertTriangle className="h-4 w-4 text-[#8b0000]" />
            <AlertDescription>
              <p className="text-sm text-gray-700">
                These suggestions come from public databases (Google Scholar,
                ResearchGate, IEEE, USPTO, NSF). Claim items that belong to you.
              </p>
            </AlertDescription>
          </Alert>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profiles")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "profiles"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Faculty Profiles
                <Badge variant="secondary">{suggestedProfiles.length}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("papers")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "papers"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Papers
                <Badge variant="secondary">{suggestedPapers.length}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("patents")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "patents"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Patents
                <Badge variant="secondary">{suggestedPatents.length}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "projects"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Projects
                <Badge variant="secondary">{suggestedProjects.length}</Badge>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            {/* Faculty Profiles Tab */}
            {activeTab === "profiles" &&
              suggestedProfiles.map((suggestedProfile) => {
                const profileId = String(suggestedProfile.id);
                const isExpanded = expandedProfile === profileId;
                const totalItems =
                  suggestedProfile.papers.length +
                  suggestedProfile.patents.length +
                  suggestedProfile.projects.length;

                return (
                  <Card
                    key={profileId}
                    className="overflow-hidden border hover:border-[#8b0000] transition-all"
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-5">
                        <Avatar className="w-14 h-14 flex-shrink-0">
                          <AvatarImage
                            src={suggestedProfile.profileImage}
                            alt={suggestedProfile.name}
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-base">
                            {getInitials(suggestedProfile.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {suggestedProfile.name}
                              </h3>
                              {suggestedProfile.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {suggestedProfile.email}
                                </div>
                              )}
                              {suggestedProfile.department && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Building2 className="w-3 h-3" />
                                  {suggestedProfile.department}
                                </div>
                              )}
                            </div>

                            <Badge className="bg-gray-900 text-white">
                              {suggestedProfile.matchScore}% Match
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              {suggestedProfile.source}
                            </Badge>
                            {totalItems > 0 && (
                              <span className="text-xs text-gray-600">
                                {totalItems} item{totalItems !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleClaimProfile(suggestedProfile)}
                          className="bg-[#8b0000] hover:bg-[#700000] flex-1"
                          size="sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Claim{totalItems > 0 ? ` All (${totalItems})` : ""}
                        </Button>
                        {totalItems > 0 && (
                          <Button
                            onClick={() =>
                              handlePreviewProfile(suggestedProfile)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {isExpanded ? "Hide" : "Preview"}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRejectProfile(suggestedProfile)}
                          variant="outline"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>

                      {/* Expanded Preview */}
                      {isExpanded && totalItems > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {suggestedProfile.papers.map((paper) => (
                            <div
                              key={paper.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {paper.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {paper.journal} • {paper.year} •{" "}
                                    {paper.citations} citations
                                  </p>
                                </div>
                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}

            {/* Empty states for other tabs */}
            {activeTab === "papers" && suggestedPapers.length === 0 && (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Paper Suggestions
                </h3>
                <p className="text-gray-600">
                  Check back later for suggested papers from external sources.
                </p>
              </Card>
            )}

            {activeTab === "patents" && suggestedPatents.length === 0 && (
              <Card className="p-12 text-center">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Patent Suggestions
                </h3>
                <p className="text-gray-600">
                  Check back later for suggested patents from external sources.
                </p>
              </Card>
            )}

            {activeTab === "projects" && suggestedProjects.length === 0 && (
              <Card className="p-12 text-center">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Project Suggestions
                </h3>
                <p className="text-gray-600">
                  Check back later for suggested projects from external sources.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Empty State - No Data */}
      {!profile && !isLoading && (
        <Card className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Profile Data Found
          </h3>
          <p className="text-gray-600 mb-6">
            Complete your profile to start building your research presence.
          </p>
          <Button
            onClick={() => onNavigate?.("profile")}
            className="bg-[#8b0000] hover:bg-[#700000]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Complete Profile
          </Button>
        </Card>
      )}
    </div>
  );
}
