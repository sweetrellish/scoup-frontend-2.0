import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Edit2, Trash2, X, Save, Users, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { projectsAPI } from "../../utils/api";

interface Project {
  id: number | string;
  title: string;
  description: string;
  collaborators: string[];
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "planning";
  fundingSource: string;
  fundingAmount: string;
  keywords: string[];
  outcomes: string;
  isOpenToCollaboration: boolean;
  collaborationInvitation: string;
  allowStudentInterest: boolean;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const [formData, setFormData] = useState<Omit<Project, "id">>({
    title: "",
    description: "",
    collaborators: [],
    startDate: "",
    endDate: "",
    status: "planning",
    fundingSource: "",
    fundingAmount: "",
    keywords: [],
    outcomes: "",
    isOpenToCollaboration: false,
    collaborationInvitation: "",
    allowStudentInterest: true,
  });

  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      setError("");

      try {
        const data = await projectsAPI.getAll();
        const rows = Array.isArray(data) ? data : data?.results || [];

        setProjects(
          rows.map((project: any, index: number) => ({
            id: project?.id ?? Date.now() + index,
            title: project?.title ?? "",
            description: project?.description ?? "",
            collaborators: Array.isArray(project?.collaborators)
              ? project.collaborators
              : [],
            startDate: project?.start_date ?? project?.startDate ?? "",
            endDate: project?.end_date ?? project?.endDate ?? "",
            status:
              project?.status === "active" ||
              project?.status === "completed" ||
              project?.status === "planning"
                ? project.status
                : "planning",
            fundingSource:
              project?.funding_source ?? project?.fundingSource ?? "",
            fundingAmount:
              project?.funding_amount ?? project?.fundingAmount ?? "",
            keywords: Array.isArray(project?.keywords) ? project.keywords : [],
            outcomes: project?.outcomes ?? "",
            isOpenToCollaboration:
              Boolean(project?.is_open_to_collaboration) ||
              Boolean(project?.isOpenToCollaboration),
            collaborationInvitation:
              project?.collaboration_invitation ??
              project?.collaborationInvitation ??
              "",
            allowStudentInterest:
              project?.allow_student_interest ??
              project?.allowStudentInterest ??
              true,
          })),
        );
      } catch (err: any) {
        setError(err?.message || "Unable to load projects.");
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const nextValue =
      type === "checkbox" && "checked" in e.target ? e.target.checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleAddCollaborator = () => {
    if (
      collaboratorInput.trim() &&
      !formData.collaborators.includes(collaboratorInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, collaboratorInput.trim()],
      }));
      setCollaboratorInput("");
    }
  };

  const handleRemoveCollaborator = (collaborator: string) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((c) => c !== collaborator),
    }));
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      title: "",
      description: "",
      collaborators: [],
      startDate: "",
      endDate: "",
      status: "planning",
      fundingSource: "",
      fundingAmount: "",
      keywords: [],
      outcomes: "",
      isOpenToCollaboration: false,
      collaborationInvitation: "",
      allowStudentInterest: true,
    });
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      collaborators: project.collaborators,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      fundingSource: project.fundingSource,
      fundingAmount: project.fundingAmount,
      keywords: project.keywords,
      outcomes: project.outcomes,
      isOpenToCollaboration: project.isOpenToCollaboration,
      collaborationInvitation: project.collaborationInvitation,
      allowStudentInterest: project.allowStudentInterest,
    });
  };

  const handleSave = async () => {
    setIsSavingProject(true);
    setError("");

    const payload = {
      title: formData.title,
      description: formData.description,
      collaborators: formData.collaborators,
      start_date: formData.startDate,
      end_date: formData.endDate,
      status: formData.status,
      funding_source: formData.fundingSource,
      funding_amount: formData.fundingAmount,
      keywords: formData.keywords,
      outcomes: formData.outcomes,
      is_open_to_collaboration: formData.isOpenToCollaboration,
      collaboration_invitation: formData.collaborationInvitation,
      allow_student_interest: formData.allowStudentInterest,
    };

    try {
      if (editingId !== null) {
        const updated = await projectsAPI.update(Number(editingId), payload);
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  ...formData,
                  id: updated?.id ?? editingId,
                }
              : p,
          ),
        );
        setEditingId(null);
      } else {
        const created = await projectsAPI.create(payload);
        setProjects((prev) => [
          ...prev,
          { ...formData, id: created?.id ?? Date.now() },
        ]);
        setIsAdding(false);
      }

      setFormData({
        title: "",
        description: "",
        collaborators: [],
        startDate: "",
        endDate: "",
        status: "planning",
        fundingSource: "",
        fundingAmount: "",
        keywords: [],
        outcomes: "",
        isOpenToCollaboration: false,
        collaborationInvitation: "",
        allowStudentInterest: true,
      });
    } catch (err: any) {
      setError(err?.message || "Unable to save project.");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      collaborators: [],
      startDate: "",
      endDate: "",
      status: "planning",
      fundingSource: "",
      fundingAmount: "",
      keywords: [],
      outcomes: "",
      isOpenToCollaboration: false,
      collaborationInvitation: "",
      allowStudentInterest: true,
    });
  };

  const handleDelete = async (id: number | string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setError("");
      try {
        await projectsAPI.delete(Number(id));
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        setError(err?.message || "Unable to delete project.");
      }
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your research projects and collaborations
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button
            onClick={handleAdd}
            className="bg-[#8b0000] hover:bg-[#700000]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      {isLoadingProjects && (
        <Alert>
          <AlertDescription>Loading projects...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 border-2 border-[#8b0000]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Project" : "Add New Project"}
            </h2>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Project title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Project description"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="collaborators">Collaborators</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="collaborators"
                  value={collaboratorInput}
                  onChange={(e) => setCollaboratorInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCollaborator())
                  }
                  placeholder="Add collaborator and press Enter"
                />
                <Button onClick={handleAddCollaborator} size="sm" type="button">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.collaborators.map((collaborator) => (
                  <Badge
                    key={collaborator}
                    variant="secondary"
                    className="gap-1"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {collaborator}
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fundingSource">Funding Source</Label>
                <Input
                  id="fundingSource"
                  name="fundingSource"
                  value={formData.fundingSource}
                  onChange={handleInputChange}
                  placeholder="e.g., NSF, University Grant"
                />
              </div>
              <div>
                <Label htmlFor="fundingAmount">Funding Amount</Label>
                <Input
                  id="fundingAmount"
                  name="fundingAmount"
                  value={formData.fundingAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., $50,000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddKeyword())
                  }
                  placeholder="Add keyword and press Enter"
                />
                <Button onClick={handleAddKeyword} size="sm" type="button">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="outcomes">Outcomes & Results</Label>
              <Textarea
                id="outcomes"
                name="outcomes"
                value={formData.outcomes}
                onChange={handleInputChange}
                placeholder="Describe project outcomes, results, and impact"
                className="min-h-[100px]"
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isOpenToCollaboration"
                  checked={formData.isOpenToCollaboration}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-gray-300 text-[#8b0000] focus:ring-[#8b0000]"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Open this project to collaborators
                  </span>
                  <span className="block text-sm text-gray-600">
                    Show an invitation on public project results so external collaborators or students can express interest.
                  </span>
                </span>
              </label>

              {formData.isOpenToCollaboration && (
                <>
                  <div>
                    <Label htmlFor="collaborationInvitation">Collaboration invitation</Label>
                    <Textarea
                      id="collaborationInvitation"
                      name="collaborationInvitation"
                      value={formData.collaborationInvitation}
                      onChange={handleInputChange}
                      placeholder="Example: We are looking for students or partners interested in field data collection, analysis, or community outreach."
                      className="min-h-[90px] bg-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowStudentInterest"
                      checked={formData.allowStudentInterest}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-[#8b0000] focus:ring-[#8b0000]"
                    />
                    Allow students to submit interest
                  </label>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSavingProject}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSavingProject ? "Saving..." : "Save Project"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">
                    {project.title}
                  </h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {project.isOpenToCollaboration && (
                    <Badge className="bg-[#8b0000]/10 text-[#8b0000] border border-[#8b0000]/20">
                      Open to collaborators
                    </Badge>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{project.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {project.startDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : "Ongoing"}
                      </span>
                    </div>
                  )}
                  {project.fundingSource && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Funding:</span>{" "}
                      {project.fundingSource}
                      {project.fundingAmount && ` (${project.fundingAmount})`}
                    </div>
                  )}
                </div>

                {project.collaborators.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Collaborators:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.collaborators.map((collaborator) => (
                        <Badge
                          key={collaborator}
                          variant="outline"
                          className="gap-1"
                        >
                          <Users className="w-3 h-3" />
                          {collaborator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.keywords.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Keywords:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.outcomes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Outcomes & Results:
                    </p>
                    <p className="text-sm text-gray-600">{project.outcomes}</p>
                  </div>
                )}

                {project.isOpenToCollaboration && (
                  <div className="mt-4 p-4 bg-[#8b0000]/5 border border-[#8b0000]/10 rounded-lg">
                    <p className="text-sm font-semibold text-[#8b0000] mb-1">
                      Collaboration Invitation
                    </p>
                    <p className="text-sm text-gray-700">
                      {project.collaborationInvitation ||
                        "This project is open to collaborators."}
                    </p>
                    {project.allowStudentInterest && (
                      <p className="text-xs text-gray-500 mt-2">
                        Student interest submissions are enabled.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!isAdding && !editingId && (
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleEdit(project)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(project.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {projects.length === 0 && !isAdding && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              No projects added yet. Click "Add Project" to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
