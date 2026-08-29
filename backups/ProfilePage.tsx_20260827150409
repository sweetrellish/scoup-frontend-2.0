import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Camera, Plus, X, Edit2, Save, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { ProfileCompletionWidget } from "./ProfileCompletionWidget";
import { apiCall, authAPI, facultyAPI, cvAPI } from "../../utils/api";
import { getInitials } from "../../utils/avatar";

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

const normalizePhotoUrl = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) return "";
  const raw = value.trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const configuredApi = import.meta.env.VITE_API_BASE_URL || "";
  if (!configuredApi) return raw.startsWith("/") ? raw : `/media/${raw}`;

  try {
    const origin = new URL(configuredApi).origin;
    if (!raw.startsWith("/")) {
      // Django ImageField may return a bare relative file path like "faculty_photos/x.jpg"
      const cleaned = raw.replace(/^media\//, "");
      return `${origin}/media/${cleaned}`;
    }
    return `${origin}${raw}`;
  } catch {
    return raw;
  }
};

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [fallbackFacultyIds, setFallbackFacultyIds] = useState<number[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    title: "",
    phone: "",
    officeLocation: "",
    bio: "",
    researchInterests: "",
    personalWebsite: ""
  });

  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [aiGeneratedKeywords, setAiGeneratedKeywords] = useState<string[]>([]);

  const [newQualification, setNewQualification] = useState({
    degree: "",
    institution: "",
    year: ""
  });

  const [showAddQualification, setShowAddQualification] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    type: 'bio' | 'research' | null;
    content: string;
  }>({ type: null, content: "" });

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    setLoadError("");

    try {
      const me = await authAPI.me();

      const possibleIds = [
        me?.id,
        me?.faculty_id,
        me?.facultyId,
        me?.user_id,
        me?.user?.id,
      ].filter((value): value is number => typeof value === "number");

      if (possibleIds.length > 0) {
        setFacultyId(possibleIds[0]);
        setFallbackFacultyIds(Array.from(new Set(possibleIds)));
      }

      setFormData({
        firstName: me?.first_name ?? me?.firstName ?? "",
        lastName: me?.last_name ?? me?.lastName ?? "",
        email: me?.email ?? "",
        department: me?.department ?? "",
        title: me?.title ?? "",
        phone: me?.phone ?? "",
        // API returns "office" — fall back through all possible field names
        officeLocation: me?.office ?? me?.office_location ?? me?.officeLocation ?? "",
        bio: me?.bio ?? "",
        researchInterests: me?.research_interests ?? me?.researchInterests ?? "",
        personalWebsite: me?.personal_website ?? me?.personalWebsite ?? "",
      });

      if (Array.isArray(me?.keywords)) {
        setKeywords(me.keywords.filter((kw: unknown) => typeof kw === "string"));
      }

      if (Array.isArray(me?.qualifications)) {
        setQualifications(
          me.qualifications.map((q: any, index: number) => ({
            id: String(q?.id ?? index),
            degree: q?.degree ?? "",
            institution: q?.institution ?? "",
            year: String(q?.year ?? ""),
          })),
        );
      }

      const photo = me?.profile_photo || me?.profilePhoto || me?.photo;
      setProfilePhoto(normalizePhotoUrl(photo));
    } catch (err: any) {
      setLoadError(err?.message || "Unable to load profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProfile(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQualification = () => {
    if (newQualification.degree && newQualification.institution && newQualification.year) {
      setQualifications(prev => [
        ...prev,
        { ...newQualification, id: Date.now().toString() }
      ]);
      setNewQualification({ degree: "", institution: "", year: "" });
      setShowAddQualification(false);
    }
  };

  const handleDeleteQualification = (id: string) => {
    setQualifications(prev => prev.filter(q => q.id !== id));
  };

  const handleSave = async () => {
    setIsSavingProfile(true);
    setSaveError("");
    setSaveSuccess("");

    // Ensure personal_website has a scheme — Django URLField rejects bare domains
    const rawWebsite = formData.personalWebsite.trim();
    const normalizedWebsite =
      rawWebsite && !rawWebsite.startsWith("http://") && !rawWebsite.startsWith("https://")
        ? `https://${rawWebsite}`
        : rawWebsite;

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      department: formData.department,
      title: formData.title,
      phone: formData.phone,
      office: formData.officeLocation,  // model field is "office", not "office_location"
      bio: formData.bio,
      research_interests: formData.researchInterests,
      personal_website: normalizedWebsite || null,
      keywords,
      qualifications: qualifications.map(({ id, ...rest }) => rest),
    };

    const looksLikeRouteIssue = (err: any) => {
      const msg = String(err?.message || "").toLowerCase();
      return (
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("405") ||
        msg.includes("method not allowed")
      );
    };

    try {
      try {
        await facultyAPI.updateMe(payload);
      } catch (err) {
        if (!looksLikeRouteIssue(err)) throw err;

        try {
          await apiCall("/faculty/me/", {
            method: "PUT",
            body: JSON.stringify(payload),
          });
        } catch (err2) {
          if (!looksLikeRouteIssue(err2)) throw err2;

          const idsToTry = Array.from(
            new Set(
              [facultyId, ...fallbackFacultyIds].filter(
                (id): id is number => typeof id === "number",
              ),
            ),
          );

          if (idsToTry.length === 0) {
            throw new Error(
              "Profile endpoint mismatch. Could not resolve a faculty id for fallback update.",
            );
          }

          let updated = false;
          let lastError: any = null;

          for (const id of idsToTry) {
            try {
              await facultyAPI.update(id, payload);
              updated = true;
              break;
            } catch (err3) {
              lastError = err3;
            }
          }

          if (!updated) {
            throw lastError || new Error("Unable to save profile.");
          }
        }
      }

      if (profilePhotoFile) {
        const upload = await facultyAPI.uploadPhoto(profilePhotoFile);
        const uploadedPhoto =
          upload?.photo || upload?.profile_photo || upload?.profilePhoto;
        const normalizedUploadedPhoto = normalizePhotoUrl(uploadedPhoto);
        if (normalizedUploadedPhoto) {
          setProfilePhoto(normalizedUploadedPhoto);
        }
        setProfilePhotoFile(null);
      }

      setIsEditing(false);
      setSaveSuccess("Profile saved.");
    } catch (err: any) {
      setSaveError(err?.message || "Unable to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Hardcoded fallbacks (used when OpenAI is unavailable) ────────────────
  const fallbackBio = () => {
    const name = `${formData.firstName} ${formData.lastName}`.trim() || "This faculty member";
    const title = formData.title || "faculty member";
    const dept = formData.department || "their department";
    const qual = qualifications[0];
    const degreeStr = qual?.degree
      ? `With ${qual.degree.toLowerCase().startsWith("ph") ? "a Ph.D." : `a ${qual.degree}`} from ${qual.institution || "a leading institution"}, `
      : "";
    return `${name} is a ${title} in the ${dept} department at Salisbury University. ${degreeStr}they bring expertise and a commitment to research and student success. Their work spans interdisciplinary areas within ${dept.toLowerCase()}, contributing to the university's mission of academic excellence.`;
  };

  const fallbackResearchInterests = () => {
    const dept = formData.department.toLowerCase();
    const map: Record<string, string> = {
      computer: "Artificial Intelligence, Machine Learning, Data Science, Software Engineering, Cybersecurity, Human-Computer Interaction",
      business: "Strategic Management, Organizational Behavior, Marketing Analytics, Entrepreneurship, Financial Management, Innovation",
      biology: "Molecular Biology, Genetics, Ecology, Evolutionary Biology, Biotechnology, Environmental Science",
      education: "Curriculum Development, Educational Technology, Student Assessment, Inclusive Education, Learning Analytics",
      engineering: "Systems Engineering, Sustainable Design, Automation, Materials Science, Applied Research",
      math: "Applied Mathematics, Statistical Analysis, Computational Methods, Operations Research, Mathematical Modeling",
      physics: "Computational Physics, Quantum Mechanics, Applied Physics, Materials Science, Optics",
      chemistry: "Organic Chemistry, Analytical Chemistry, Materials Chemistry, Environmental Chemistry, Biochemistry",
      psychology: "Cognitive Psychology, Behavioral Research, Clinical Psychology, Neuropsychology, Social Psychology",
      nursing: "Patient Care, Healthcare Informatics, Evidence-Based Practice, Community Health, Clinical Research",
    };
    const match = Object.keys(map).find(k => dept.includes(k));
    return match ? map[match] : `${formData.department}, Research Methodology, Interdisciplinary Studies, Applied Research, Academic Collaboration`;
  };

  const fallbackKeywords = (): string[] => {
    const dept = formData.department.toLowerCase();
    const base: Record<string, string[]> = {
      computer: ["Artificial Intelligence", "Machine Learning", "Data Science", "Software Engineering", "Cybersecurity"],
      business: ["Strategic Management", "Marketing Analytics", "Entrepreneurship", "Business Intelligence", "Finance"],
      biology: ["Molecular Biology", "Genetics", "Ecology", "Biotechnology", "Environmental Science"],
      education: ["Curriculum Design", "Educational Technology", "Learning Analytics", "Assessment", "Pedagogy"],
      engineering: ["Systems Engineering", "Automation", "Sustainable Design", "Materials Science", "Applied Research"],
    };
    const match = Object.keys(base).find(k => dept.includes(k));
    return match ? base[match] : ["Research", "Interdisciplinary Studies", "Higher Education", "Applied Science", "Academic Excellence"];
  };

  const generateAIBio = async () => {
    setIsGeneratingBio(true);
    setAiSuggestion({ type: null, content: "" });
    try {
      const res = await cvAPI.generateBio({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        title: formData.title,
        department: formData.department,
        qualifications,
        research_interests: formData.researchInterests,
        keywords,
      });
      setAiSuggestion({ type: "bio", content: res.bio || fallbackBio() });
    } catch {
      // AI unavailable — use template fallback
      setAiSuggestion({ type: "bio", content: fallbackBio() });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const generateAIResearchInterests = async () => {
    setIsGeneratingResearch(true);
    setAiSuggestion({ type: null, content: "" });
    try {
      const res = await cvAPI.generateResearchInterests({
        title: formData.title,
        department: formData.department,
        qualifications,
        keywords,
      });
      setAiSuggestion({ type: "research", content: res.research_interests || fallbackResearchInterests() });
    } catch {
      setAiSuggestion({ type: "research", content: fallbackResearchInterests() });
    } finally {
      setIsGeneratingResearch(false);
    }
  };

  const acceptAISuggestion = () => {
    if (aiSuggestion.type === 'bio') {
      setFormData(prev => ({ ...prev, bio: aiSuggestion.content }));
    } else if (aiSuggestion.type === 'research') {
      setFormData(prev => ({ ...prev, researchInterests: aiSuggestion.content }));
    }
    setAiSuggestion({ type: null, content: "" });
  };

  const rejectAISuggestion = () => {
    setAiSuggestion({ type: null, content: "" });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setKeywords(prev => [...prev, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleDeleteKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const generateAIKeywords = async () => {
    setIsGeneratingKeywords(true);
    setAiGeneratedKeywords([]);
    try {
      const res = await cvAPI.generateProfileKeywords({
        department: formData.department,
        bio: formData.bio,
        research_interests: formData.researchInterests,
        title: formData.title,
      });
      setAiGeneratedKeywords(res.keywords?.length ? res.keywords : fallbackKeywords());
    } catch {
      setAiGeneratedKeywords(fallbackKeywords());
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const acceptAIKeywords = () => {
    setKeywords(aiGeneratedKeywords);
    setAiGeneratedKeywords([]);
  };

  const rejectAIKeywords = () => {
    setAiGeneratedKeywords([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile information and qualifications</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSaveError("");
                setSaveSuccess("");
                loadProfile(); // restore original data
              }}
              disabled={isSavingProfile}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setSaveError("");
                setSaveSuccess("");
                setIsEditing(true);
              }
            }}
            className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
            disabled={isLoadingProfile || isSavingProfile}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoadingProfile && (
        <Alert>
          <AlertDescription>Loading profile...</AlertDescription>
        </Alert>
      )}

      {loadError && (
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="border-green-300 bg-green-50 text-green-800">
          <AlertDescription>{saveSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Profile Photo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profilePhoto} />
              <AvatarFallback className="text-2xl bg-[#8b0000] text-white">
                {getInitials(formData.firstName, formData.lastName)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-[#8b0000] text-white p-2 rounded-full cursor-pointer hover:bg-[#700000] transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{formData.firstName} {formData.lastName}</h3>
            <p className="text-gray-600">{formData.title}</p>
            <p className="text-gray-600">{formData.department}</p>
            {isEditing && (
              <p className="text-sm text-gray-500 mt-2">Click the camera icon to upload a new photo</p>
            )}
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="officeLocation">Office Location</Label>
            <Input
              id="officeLocation"
              name="officeLocation"
              value={formData.officeLocation}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="personalWebsite">Personal Website</Label>
            <Input
              id="personalWebsite"
              name="personalWebsite"
              value={formData.personalWebsite}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </div>
      </Card>

      {/* Bio & Research */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Biography & Research</h2>
        
        {/* AI Suggestion Banner */}
        {aiSuggestion.type && (
          <Alert className="mb-4 border-2 border-[#ffd100] bg-yellow-50">
            <Sparkles className="h-4 w-4 text-[#8b0000]" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold text-[#8b0000]">
                  AI-Generated {aiSuggestion.type === 'bio' ? 'Biography' : 'Research Interests'}
                </p>
                <p className="text-sm text-gray-700">{aiSuggestion.content}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={acceptAISuggestion}
                    size="sm"
                    className="bg-[#8b0000] hover:bg-[#700000]"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={rejectAISuggestion}
                    size="sm"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="bio">Biography</Label>
              {isEditing && (
                <Button
                  onClick={generateAIBio}
                  size="sm"
                  variant="outline"
                  disabled={isGeneratingBio}
                  className="text-[#8b0000] border-[#8b0000] hover:bg-[#8b0000] hover:text-white"
                >
                  {isGeneratingBio ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`min-h-[100px] ${!isEditing ? "bg-gray-50" : ""}`}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="researchInterests">Research Interests</Label>
              {isEditing && (
                <Button
                  onClick={generateAIResearchInterests}
                  size="sm"
                  variant="outline"
                  disabled={isGeneratingResearch}
                  className="text-[#8b0000] border-[#8b0000] hover:bg-[#8b0000] hover:text-white"
                >
                  {isGeneratingResearch ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="researchInterests"
              name="researchInterests"
              value={formData.researchInterests}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Separate interests with commas"
            />
          </div>
        </div>
      </Card>

      {/* Qualifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Qualifications & Education</h2>
          {isEditing && (
            <Button
              onClick={() => setShowAddQualification(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Qualification
            </Button>
          )}
        </div>

        {showAddQualification && (
          <Card className="p-4 mb-4 border-2 border-[#8b0000]">
            <h3 className="font-semibold mb-3">Add New Qualification</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-degree">Degree</Label>
                <Input
                  id="new-degree"
                  value={newQualification.degree}
                  onChange={(e) => setNewQualification(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g., Ph.D. in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="new-institution">Institution</Label>
                <Input
                  id="new-institution"
                  value={newQualification.institution}
                  onChange={(e) => setNewQualification(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="e.g., University of Maryland"
                />
              </div>
              <div>
                <Label htmlFor="new-year">Year</Label>
                <Input
                  id="new-year"
                  value={newQualification.year}
                  onChange={(e) => setNewQualification(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g., 2015"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddQualification} size="sm">
                  Add Qualification
                </Button>
                <Button
                  onClick={() => {
                    setShowAddQualification(false);
                    setNewQualification({ degree: "", institution: "", year: "" });
                  }}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {qualifications.map((qual) => (
            <div
              key={qual.id}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{qual.degree}</h3>
                <p className="text-gray-600">{qual.institution}</p>
                <Badge variant="secondary" className="mt-1">{qual.year}</Badge>
              </div>
              {isEditing && (
                <Button
                  onClick={() => handleDeleteQualification(qual.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Keywords */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Keywords</h2>
          {isEditing && (
            <Button
              onClick={generateAIKeywords}
              size="sm"
              variant="outline"
              disabled={isGeneratingKeywords}
              className="text-[#8b0000] border-[#8b0000] hover:bg-[#8b0000] hover:text-white"
            >
              {isGeneratingKeywords ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </div>

        {aiGeneratedKeywords.length > 0 && (
          <Alert className="mb-4 border-2 border-[#ffd100] bg-yellow-50">
            <Sparkles className="h-4 w-4 text-[#8b0000]" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold text-[#8b0000]">
                  AI-Generated Keywords
                </p>
                <p className="text-sm text-gray-700">
                  {aiGeneratedKeywords.join(', ')}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={acceptAIKeywords}
                    size="sm"
                    className="bg-[#8b0000] hover:bg-[#700000]"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={rejectAIKeywords}
                    size="sm"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {isEditing && (
            <div>
              <Label htmlFor="newKeyword">Add Keyword</Label>
              <div className="flex items-center">
                <Input
                  id="newKeyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddKeyword(); } }}
                  placeholder="e.g., Machine Learning"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddKeyword}
                  size="sm"
                  className="ml-2"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="keywords">Keywords</Label>
            {keywords.length === 0 && !isEditing && (
              <p className="text-sm text-gray-400 mt-1">No keywords added yet.</p>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className={isEditing ? "cursor-pointer hover:bg-red-100 hover:text-red-700" : ""}
                  onClick={isEditing ? () => handleDeleteKeyword(keyword) : undefined}
                  title={isEditing ? "Click to remove" : undefined}
                >
                  {keyword}
                  {isEditing && <X className="ml-1 w-3 h-3 inline" />}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Completion Widget */}
      <ProfileCompletionWidget
        profilePhoto={profilePhoto}
        formData={formData}
        qualifications={qualifications}
        keywords={keywords}
      />
    </div>
  );
}
