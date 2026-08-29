import { useEffect, useState } from "react";
import { User, Shield, Save, CheckCircle2, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { adminAPI } from "../../utils/api";
import { Button } from "../ui/button";

export function AdminProfilePage() {
  const [profile, setProfile] = useState<{
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
    role: string;
  } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Password change state
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadAudit = async () => {
    if (auditLog.length > 0) { setShowAudit(s => !s); return; }
    setAuditLoading(true);
    try {
      const res = await adminAPI.getAuditLog();
      setAuditLog(res.results ?? []);
      setShowAudit(true);
    } catch {}
    finally { setAuditLoading(false); }
  };

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    adminAPI.me().then((data: any) => {
      setProfile(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setEmail(data.email || "");
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const updated = await adminAPI.updateMe({ first_name: firstName, last_name: lastName, email });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    try {
      await adminAPI.changePassword(currentPw, newPw);
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err?.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  if (!profile) {
    return <div className="text-gray-500 text-sm p-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600 font-light">Manage your admin account details</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Account</h2>
            <p className="text-sm text-gray-600">Your login credentials and role</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Username</p>
            <p className="text-gray-900 font-medium">{profile.username}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Role</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              profile.role === "Superuser"
                ? "bg-[#8b0000]/10 text-[#8b0000] border-[#8b0000]/20"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Display Name</h2>
            <p className="text-sm text-gray-600">Shown on inquiry reviews and admin actions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@salisbury.edu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Profile updated!</span>
            </div>
          )}
          {saveError && <span className="text-sm text-red-600">{saveError}</span>}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-600">Update your admin login password</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Current password */}
          <div>
            <label htmlFor="current-pw" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                id="current-pw"
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label htmlFor="new-pw" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                id="new-pw"
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label htmlFor="confirm-pw" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handlePasswordChange} disabled={pwSaving} className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]">
            <Lock className="w-4 h-4 mr-2" />
            {pwSaving ? "Updating..." : "Update Password"}
          </Button>
          {pwSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Password changed!</span>
            </div>
          )}
          {pwError && <span className="text-sm text-red-600">{pwError}</span>}
        </div>
      </div>

      {/* Activity log — collapsible, subtle */}
      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={loadAudit}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
        >
          {showAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {auditLoading ? "Loading activity log..." : showAudit ? "Hide activity log" : "View activity log"}
        </button>

        {showAudit && auditLog.length > 0 && (
          <div className="mt-2 space-y-2">
            {auditLog.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-gray-500">
                    {(entry.admin || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-600 font-medium">{entry.admin}</span>
                  <span className="text-xs text-gray-400 mx-1">·</span>
                  <span className="text-xs text-gray-500">{entry.action}</span>
                  {entry.target_name && (
                    <span className="text-xs text-gray-400"> · {entry.target_name}</span>
                  )}
                  {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
