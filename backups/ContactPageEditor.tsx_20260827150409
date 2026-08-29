import { useEffect, useRef, useState } from "react";
import { contactAPI } from "../../utils/api";
import { Pencil, Trash2, Plus, Upload, Eye, EyeOff, Save, X, GripVertical } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  email: string;
  linkedin_url: string;
  photo: string | null;
  order: number;
  is_visible: boolean;
}

interface DocLink {
  title: string;
  description: string;
  url: string;
}

interface ContactSettings {
  general_email: string;
  support_email: string;
  github_url: string;
  backend_github_url?: string;
  linkedin_url: string;
  documentation_url?: string;
  api_documentation_url?: string;
  documentation_links?: DocLink[];
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
}

const emptyMember = (): Omit<TeamMember, "id" | "photo"> => ({
  name: "",
  role: "",
  description: "",
  email: "",
  linkedin_url: "",
  order: 0,
  is_visible: true,
});

export function ContactPageEditor() {
  const [tab, setTab] = useState<"team" | "settings">("team");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberData, setNewMemberData] = useState(emptyMember());
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [memberMsg, setMemberMsg] = useState("");
  const [uploadingPhotoId, setUploadingPhotoId] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    contactAPI.adminGetTeam().then((data: any) => {
      setMembers(data);
      setLoadingTeam(false);
    });
    contactAPI.getSettings().then((data: any) => {
      setSettings(data);
      setLoadingSettings(false);
    });
  }, []);

  const refreshTeam = async () => {
    const data: any = await contactAPI.adminGetTeam();
    setMembers(data);
  };

  const handleToggleVisible = async (member: TeamMember) => {
    await contactAPI.adminUpdateMember(member.id, { is_visible: !member.is_visible });
    await refreshTeam();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team member?")) return;
    await contactAPI.adminDeleteMember(id);
    await refreshTeam();
    setMemberMsg("Member deleted.");
    setTimeout(() => setMemberMsg(""), 3000);
  };

  const handleEditSave = async () => {
    if (!editingMember) return;
    const { id, photo, ...fields } = editingMember;
    await contactAPI.adminUpdateMember(id, fields);

    if (pendingPhotoFile) {
      setUploadingPhotoId(id);
      await contactAPI.adminUploadPhoto(id, pendingPhotoFile);
      setUploadingPhotoId(null);
      setPendingPhotoFile(null);
    }

    await refreshTeam();
    setEditingMember(null);
    setMemberMsg("Member updated.");
    setTimeout(() => setMemberMsg(""), 3000);
  };

  const handleAddSave = async () => {
    const created: any = await contactAPI.adminCreateMember(newMemberData);
    if (pendingPhotoFile && created?.id) {
      setUploadingPhotoId(created.id);
      await contactAPI.adminUploadPhoto(created.id, pendingPhotoFile);
      setUploadingPhotoId(null);
      setPendingPhotoFile(null);
    }
    await refreshTeam();
    setAddingMember(false);
    setNewMemberData(emptyMember());
    setMemberMsg("Member added.");
    setTimeout(() => setMemberMsg(""), 3000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingPhotoFile(file);
  };

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSettingsSave = async () => {
    if (!settings) return;
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      const normalized: ContactSettings = {
        ...settings,
        github_url: normalizeUrl(settings.github_url),
        backend_github_url: normalizeUrl(settings.backend_github_url || ""),
        linkedin_url: normalizeUrl(settings.linkedin_url),
        documentation_url: normalizeUrl(settings.documentation_url || ""),
        api_documentation_url: normalizeUrl(settings.api_documentation_url || ""),
        documentation_links: (settings.documentation_links || []).map((link) => ({
          ...link,
          url: normalizeUrl(link.url),
        })),
      };
      setSettings(normalized);
      await contactAPI.adminUpdateSettings(normalized);
      setSettingsMsg("Settings saved.");
    } catch (err: any) {
      setSettingsMsg(`Error: ${err?.message || "Save failed."}`);
    } finally {
      setSavingSettings(false);
      setTimeout(() => setSettingsMsg(""), 5000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">Contact & Links Editor</h2>
      <p className="text-gray-500 text-sm mb-8">Manage the public contact page, team members, and documentation links</p>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab("team")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "team"
              ? "border-[#8b0000] text-[#8b0000]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Team Members
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "settings"
              ? "border-[#8b0000] text-[#8b0000]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Page Settings
        </button>
      </div>

      {/* Team Members Tab */}
      {tab === "team" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-sm text-gray-500">
              {loadingTeam ? "Loading..." : `${members.length} member${members.length !== 1 ? "s" : ""}`}
            </p>
            {memberMsg && <p className="text-sm text-green-600 font-medium">{memberMsg}</p>}
            <button
              onClick={() => { setAddingMember(true); setPendingPhotoFile(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#8b0000] text-[#ffd100] rounded-lg text-sm font-medium hover:bg-[#6b0000] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          {/* Add Member Form */}
          {addingMember && (
            <MemberForm
              data={newMemberData}
              onChange={setNewMemberData}
              onSave={handleAddSave}
              onCancel={() => { setAddingMember(false); setPendingPhotoFile(null); }}
              photoFile={pendingPhotoFile}
              onPhotoChange={handlePhotoChange}
              inputRef={addPhotoInputRef}
              isUploading={uploadingPhotoId !== null}
              title="New Member"
            />
          )}

          {/* Member List */}
          <div className="space-y-4">
            {members.map((member) =>
              editingMember?.id === member.id ? (
                <MemberForm
                  key={member.id}
                  data={editingMember}
                  onChange={(updated) => setEditingMember(updated as TeamMember)}
                  onSave={handleEditSave}
                  onCancel={() => { setEditingMember(null); setPendingPhotoFile(null); }}
                  existingPhoto={editingMember.photo}
                  photoFile={pendingPhotoFile}
                  onPhotoChange={handlePhotoChange}
                  inputRef={photoInputRef}
                  isUploading={uploadingPhotoId === member.id}
                  title="Edit Member"
                />
              ) : (
                <div
                  key={member.id}
                  className={`flex items-center gap-4 p-4 bg-white border rounded-lg ${!member.is_visible ? "opacity-50" : ""}`}
                >
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#8b0000] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  <span className="text-xs text-gray-400">Order: {member.order}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisible(member)}
                      className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title={member.is_visible ? "Hide" : "Show"}
                    >
                      {member.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => { setEditingMember(member); setPendingPhotoFile(null); }}
                      className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {tab === "settings" && (
        <div className="max-w-2xl space-y-6">
          {loadingSettings ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : settings ? (
            <>
              {/* Contact Info */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Info</p>
                <SettingsField label="General Email" value={settings.general_email} onChange={(v) => setSettings({ ...settings, general_email: v })} />
                <SettingsField label="Support Email" value={settings.support_email} onChange={(v) => setSettings({ ...settings, support_email: v })} />
                <SettingsField label="LinkedIn URL" value={settings.linkedin_url} onChange={(v) => setSettings({ ...settings, linkedin_url: v })} />
                <SettingsField label="Address Line 1" value={settings.address_line_1} onChange={(v) => setSettings({ ...settings, address_line_1: v })} />
                <SettingsField label="Address Line 2" value={settings.address_line_2} onChange={(v) => setSettings({ ...settings, address_line_2: v })} />
                <SettingsField label="Address Line 3" value={settings.address_line_3} onChange={(v) => setSettings({ ...settings, address_line_3: v })} />
              </div>

              {/* GitHub / Docs URLs */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Repository & Documentation URLs</p>
                <SettingsField label="Frontend GitHub URL" value={settings.github_url} onChange={(v) => setSettings({ ...settings, github_url: v })} />
                <SettingsField label="Backend GitHub URL" value={settings.backend_github_url || ""} onChange={(v) => setSettings({ ...settings, backend_github_url: v })} />
                <SettingsField label="Documentation Site URL" value={settings.documentation_url || ""} onChange={(v) => setSettings({ ...settings, documentation_url: v })} />
                <SettingsField label="API Documentation URL" value={settings.api_documentation_url || ""} onChange={(v) => setSettings({ ...settings, api_documentation_url: v })} />
              </div>

              {/* Documentation Links */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documentation Page Cards</p>
                    <p className="text-xs text-gray-400 mt-1">These cards appear on the public Documentation page. Use full URLs.</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, documentation_links: [...(settings.documentation_links || []), { title: "", description: "", url: "" }] })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b0000] text-[#ffd100] rounded-lg text-xs font-medium hover:bg-[#6b0000] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
                </div>

                {(settings.documentation_links || []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">No cards yet — click Add Card to create one.</p>
                )}

                <div className="space-y-3">
                  {(settings.documentation_links || []).map((link, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <GripVertical className="w-4 h-4" />
                          <span className="text-xs font-medium text-gray-500">Card {i + 1}</span>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, documentation_links: (settings.documentation_links || []).filter((_, j) => j !== i) })}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text" value={link.title}
                        onChange={(e) => { const u = [...(settings.documentation_links || [])]; u[i] = { ...u[i], title: e.target.value }; setSettings({ ...settings, documentation_links: u }); }}
                        placeholder="Title (e.g. Frontend Overview)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000] bg-white"
                      />
                      <input
                        type="text" value={link.description}
                        onChange={(e) => { const u = [...(settings.documentation_links || [])]; u[i] = { ...u[i], description: e.target.value }; setSettings({ ...settings, documentation_links: u }); }}
                        placeholder="Short description"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000] bg-white"
                      />
                      <input
                        type="url" value={link.url}
                        onChange={(e) => { const u = [...(settings.documentation_links || [])]; u[i] = { ...u[i], url: e.target.value }; setSettings({ ...settings, documentation_links: u }); }}
                        placeholder="https://github.com/org/repo/blob/main/docs/file.md"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000] bg-white font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSettingsSave}
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-6 py-2 bg-[#8b0000] text-[#ffd100] rounded-lg text-sm font-medium hover:bg-[#6b0000] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
                {settingsMsg && <p className={`text-sm font-medium ${settingsMsg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{settingsMsg}</p>}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface MemberFormProps {
  data: Omit<TeamMember, "id" | "photo"> | TeamMember;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  existingPhoto?: string | null;
  photoFile: File | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  title: string;
}

function MemberForm({ data, onChange, onSave, onCancel, existingPhoto, photoFile, onPhotoChange, inputRef, isUploading, title }: MemberFormProps) {
  const field = (key: keyof typeof data) => (
    <input
      type="text"
      value={String(data[key])}
      onChange={(e) => onChange({ ...data, [key]: e.target.value })}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
    />
  );

  const photoPreview = photoFile ? URL.createObjectURL(photoFile) : existingPhoto;

  return (
    <div className="border border-[#8b0000] rounded-lg p-5 bg-white mb-3">
      <p className="font-semibold text-gray-900 mb-4">{title}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Name</label>
          {field("name")}
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Role / Title</label>
          {field("role")}
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500 font-medium mb-1 block">Description</label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000] resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Email</label>
          {field("email")}
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">LinkedIn URL</label>
          {field("linkedin_url")}
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Display Order</label>
          <input
            type="number"
            value={data.order}
            onChange={(e) => onChange({ ...data, order: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
          />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="is_visible"
            checked={data.is_visible}
            onChange={(e) => onChange({ ...data, is_visible: e.target.checked })}
            className="w-4 h-4 accent-[#8b0000]"
          />
          <label htmlFor="is_visible" className="text-sm text-gray-700">Visible on contact page</label>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 font-medium mb-1 block">Photo</label>
        <div className="flex items-center gap-3">
          {photoPreview && (
            <img src={photoPreview} alt="preview" className="w-12 h-12 rounded-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {photoPreview ? "Change Photo" : "Upload Photo"}
          </button>
          {isUploading && <span className="text-xs text-gray-500">Uploading...</span>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#8b0000] text-[#ffd100] rounded-lg text-sm font-medium hover:bg-[#6b0000] transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

function SettingsField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
      />
    </div>
  );
}
