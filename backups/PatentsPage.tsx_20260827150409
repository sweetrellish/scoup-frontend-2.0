import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Edit2, Trash2, X, Save, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { patentsAPI } from "../../utils/api";

interface Patent {
  id: number | string;
  title: string;
  inventors: string;
  patentNumber: string;
  applicationNumber: string;
  filingDate: string;
  issueDate: string;
  status: "granted" | "pending" | "application";
  abstract: string;
  assignee: string;
  keywords: string[];
}

export function PatentsPage() {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [isLoadingPatents, setIsLoadingPatents] = useState(true);
  const [isSavingPatent, setIsSavingPatent] = useState(false);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Patent, "id">>({
    title: "",
    inventors: "",
    patentNumber: "",
    applicationNumber: "",
    filingDate: "",
    issueDate: "",
    status: "application",
    abstract: "",
    assignee: "Salisbury University",
    keywords: []
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [aiGeneratedKeywords, setAiGeneratedKeywords] = useState<string[]>([]);

  useEffect(() => {
    const loadPatents = async () => {
      setIsLoadingPatents(true);
      setError("");

      try {
        const data = await patentsAPI.getAll();
        const rows = Array.isArray(data) ? data : data?.results || [];

        setPatents(
          rows.map((patent: any, index: number) => ({
            id: patent?.id ?? Date.now() + index,
            title: patent?.title ?? "",
            inventors: patent?.inventors ?? "",
            patentNumber: patent?.patent_number ?? patent?.patentNumber ?? "",
            applicationNumber:
              patent?.application_number ?? patent?.applicationNumber ?? "",
            filingDate: patent?.filing_date ?? patent?.filingDate ?? "",
            issueDate: patent?.issue_date ?? patent?.issueDate ?? "",
            status:
              patent?.status === "granted" ||
              patent?.status === "pending" ||
              patent?.status === "application"
                ? patent.status
                : "application",
            abstract: patent?.abstract ?? "",
            assignee: patent?.assignee ?? "Salisbury University",
            keywords: Array.isArray(patent?.keywords) ? patent.keywords : [],
          })),
        );
      } catch (err: any) {
        setError(err?.message || "Unable to load patents.");
      } finally {
        setIsLoadingPatents(false);
      }
    };

    loadPatents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      title: "",
      inventors: "",
      patentNumber: "",
      applicationNumber: "",
      filingDate: "",
      issueDate: "",
      status: "application",
      abstract: "",
      assignee: "Salisbury University",
      keywords: []
    });
  };

  const handleEdit = (patent: Patent) => {
    setEditingId(patent.id);
    setFormData({
      title: patent.title,
      inventors: patent.inventors,
      patentNumber: patent.patentNumber,
      applicationNumber: patent.applicationNumber,
      filingDate: patent.filingDate,
      issueDate: patent.issueDate,
      status: patent.status,
      abstract: patent.abstract,
      assignee: patent.assignee,
      keywords: patent.keywords
    });
  };

  const handleSave = async () => {
    setIsSavingPatent(true);
    setError("");

    const payload = {
      title: formData.title,
      inventors: formData.inventors,
      patent_number: formData.patentNumber,
      application_number: formData.applicationNumber,
      filing_date: formData.filingDate,
      issue_date: formData.issueDate,
      status: formData.status,
      abstract: formData.abstract,
      assignee: formData.assignee,
      keywords: formData.keywords,
    };

    try {
      if (editingId !== null) {
        const updated = await patentsAPI.update(Number(editingId), payload);
        setPatents((prev) =>
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
        const created = await patentsAPI.create(payload);
        setPatents((prev) => [...prev, { ...formData, id: created?.id ?? Date.now() }]);
        setIsAdding(false);
      }

      setFormData({
        title: "",
        inventors: "",
        patentNumber: "",
        applicationNumber: "",
        filingDate: "",
        issueDate: "",
        status: "application",
        abstract: "",
        assignee: "Salisbury University",
        keywords: []
      });
    } catch (err: any) {
      setError(err?.message || "Unable to save patent.");
    } finally {
      setIsSavingPatent(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: "",
      inventors: "",
      patentNumber: "",
      applicationNumber: "",
      filingDate: "",
      issueDate: "",
      status: "application",
      abstract: "",
      assignee: "Salisbury University",
      keywords: []
    });
  };

  const handleDelete = async (id: number | string) => {
    if (confirm("Are you sure you want to delete this patent?")) {
      setError("");
      try {
        await patentsAPI.delete(Number(id));
        setPatents(prev => prev.filter(p => p.id !== id));
      } catch (err: any) {
        setError(err?.message || "Unable to delete patent.");
      }
    }
  };

  const getStatusColor = (status: Patent["status"]) => {
    switch (status) {
      case "granted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "application":
        return "bg-blue-100 text-blue-800";
    }
  };

  const generateAIKeywords = async () => {
    setIsGeneratingKeywords(true);
    setAiGeneratedKeywords([]);

    // Simulate AI generation with delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate keywords based on title and abstract
    const title = formData.title.toLowerCase();
    const abstract = formData.abstract.toLowerCase();
    const combined = `${title} ${abstract}`;
    
    let generatedKeywords: string[] = [];
    
    // Simple keyword extraction logic for patents
    if (combined.includes('machine') || combined.includes('device') || combined.includes('apparatus')) {
      generatedKeywords = ["Engineering", "Mechanical Device", "Apparatus", "Innovation", "Technology"];
    } else if (combined.includes('software') || combined.includes('algorithm') || combined.includes('computing')) {
      generatedKeywords = ["Software", "Algorithm", "Computing", "Digital Technology", "Innovation"];
    } else if (combined.includes('chemical') || combined.includes('compound') || combined.includes('pharmaceutical')) {
      generatedKeywords = ["Chemistry", "Compound", "Pharmaceutical", "Chemical Process", "Innovation"];
    } else if (combined.includes('medical') || combined.includes('therapeutic') || combined.includes('diagnosis')) {
      generatedKeywords = ["Medical Device", "Therapeutic", "Healthcare", "Diagnosis", "Innovation"];
    } else if (combined.includes('electrical') || combined.includes('circuit') || combined.includes('electronic')) {
      generatedKeywords = ["Electrical Engineering", "Circuit", "Electronics", "Technology", "Innovation"];
    } else {
      // Default keywords for patents
      generatedKeywords = ["Innovation", "Technology", "Patent", "Invention", "Engineering"];
    }

    setAiGeneratedKeywords(generatedKeywords);
    setIsGeneratingKeywords(false);
  };

  const acceptAIKeywords = () => {
    setFormData(prev => ({ ...prev, keywords: aiGeneratedKeywords }));
    setAiGeneratedKeywords([]);
  };

  const rejectAIKeywords = () => {
    setAiGeneratedKeywords([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patents</h1>
          <p className="text-gray-600 mt-1">Manage your patent portfolio</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} className="bg-[#8b0000] hover:bg-[#700000]">
            <Plus className="w-4 h-4 mr-2" />
            Add Patent
          </Button>
        )}
      </div>

      {isLoadingPatents && (
        <Alert>
          <AlertDescription>Loading patents...</AlertDescription>
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
              {editingId ? "Edit Patent" : "Add New Patent"}
            </h2>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Patent title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inventors">Inventors *</Label>
                <Input
                  id="inventors"
                  name="inventors"
                  value={formData.inventors}
                  onChange={handleInputChange}
                  placeholder="Comma-separated list of inventors"
                />
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleInputChange}
                  placeholder="Organization or individual"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patentNumber">Patent Number</Label>
                <Input
                  id="patentNumber"
                  name="patentNumber"
                  value={formData.patentNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., US 11,234,567 B2"
                />
              </div>
              <div>
                <Label htmlFor="applicationNumber">Application Number</Label>
                <Input
                  id="applicationNumber"
                  name="applicationNumber"
                  value={formData.applicationNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 16/789,123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filingDate">Filing Date</Label>
                <Input
                  id="filingDate"
                  name="filingDate"
                  type="date"
                  value={formData.filingDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
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
                  <option value="application">Application</option>
                  <option value="pending">Pending</option>
                  <option value="granted">Granted</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                placeholder="Patent abstract"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="keywords">Patent Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Add keyword (e.g., machine learning) and press Enter"
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
              {isGeneratingKeywords && (
                <Alert className="mt-2">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Generating keywords...
                  </AlertDescription>
                </Alert>
              )}
              {aiGeneratedKeywords.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold">AI Generated Keywords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiGeneratedKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={acceptAIKeywords}
                    size="sm"
                    className="mt-2"
                  >
                    Add to Keywords
                  </Button>
                  <Button
                    onClick={rejectAIKeywords}
                    size="sm"
                    className="mt-2"
                  >
                    Reject
                  </Button>
                </div>
              )}
              <Button
                onClick={generateAIKeywords}
                size="sm"
                className="mt-2"
                disabled={isGeneratingKeywords}
              >
                Generate Keywords
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSavingPatent}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSavingPatent ? "Saving..." : "Save Patent"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Patents List */}
      <div className="space-y-4">
        {patents.map((patent) => (
          <Card key={patent.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">
                    {patent.title}
                  </h3>
                  <Badge className={getStatusColor(patent.status)}>
                    {patent.status}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-2">{patent.inventors}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                  {patent.patentNumber && (
                    <div>
                      <span className="font-semibold">Patent Number:</span> {patent.patentNumber}
                    </div>
                  )}
                  {patent.applicationNumber && (
                    <div>
                      <span className="font-semibold">Application Number:</span> {patent.applicationNumber}
                    </div>
                  )}
                  {patent.filingDate && (
                    <div>
                      <span className="font-semibold">Filing Date:</span> {new Date(patent.filingDate).toLocaleDateString()}
                    </div>
                  )}
                  {patent.issueDate && (
                    <div>
                      <span className="font-semibold">Issue Date:</span> {new Date(patent.issueDate).toLocaleDateString()}
                    </div>
                  )}
                  {patent.assignee && (
                    <div>
                      <span className="font-semibold">Assignee:</span> {patent.assignee}
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-3">{patent.abstract}</p>

                {patent.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {patent.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {!isAdding && !editingId && (
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleEdit(patent)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(patent.id)}
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

        {patents.length === 0 && !isAdding && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No patents added yet. Click "Add Patent" to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
