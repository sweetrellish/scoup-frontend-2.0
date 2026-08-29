import { useState, useEffect } from "react";
import { authAPI } from "../../utils/api";
import { Mail, CheckCircle, Clock, ShieldCheck } from "lucide-react";

export function VerificationBanner() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [institutionalEmail, setInstitutionalEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"idle" | "otp" | "done">("idle");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    authAPI.me()
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  if (loading || !profile) return null;
  if (profile.is_approved) return null;

  // Verified but pending manual admin approval
  if (profile.institutional_email_verified) {
    return (
      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Pending admin review</p>
          <p className="text-xs text-amber-600 mt-0.5">
            <span className="font-medium">{profile.institutional_email}</span> verified — an admin will activate your profile shortly.
          </p>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">You're live on SCOUP!</p>
          <p className="text-xs text-green-600 mt-0.5">Your profile is now visible in faculty search.</p>
        </div>
      </div>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionalEmail.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      await authAPI.sendOtp(institutionalEmail.trim());
      setStep("otp");
      setSuccess("Code sent! Check your institutional email.");
    } catch (err: any) {
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      await authAPI.verifyOtp(otp.trim());
      setStep("done");
      const updated = await authAPI.me();
      setProfile(updated);
    } catch (err: any) {
      setError(err.message || "Incorrect or expired code.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-[#8b0000]/20 bg-gradient-to-r from-[#8b0000]/5 to-[#ffd100]/5 p-5">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Icon + text */}
        <div className="w-10 h-10 rounded-full bg-[#8b0000]/10 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-[#8b0000]" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="font-semibold text-gray-900 text-sm">Verify your faculty email to go live</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {step === "otp"
              ? "Enter the 6-digit code sent to your institutional email."
              : "Enter your institutional email to receive a verification code."}
          </p>
        </div>

        {/* Form — sits to the right on wide screens, wraps below on narrow */}
        <div className="w-full sm:w-auto">
          {step === "idle" && (
            <form onSubmit={handleSendOtp}>
              <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#8b0000]/30 focus-within:border-[#8b0000]/40 transition-all">
                <Mail className="w-4 h-4 text-gray-400 ml-4 shrink-0" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={institutionalEmail}
                  onChange={(e) => { setInstitutionalEmail(e.target.value); setError(""); }}
                  className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-transparent outline-none placeholder-gray-400"
                  required
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="shrink-0 m-1 px-4 py-2 text-sm font-semibold bg-[#8b0000] text-white rounded-full hover:bg-[#6b0000] disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {actionLoading ? "Sending…" : "Send Code"}
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              {success && (
                <p className="text-xs text-green-700 flex items-center gap-1.5 font-medium mb-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {success}
                </p>
              )}
              <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#8b0000]/30 focus-within:border-[#8b0000]/40 transition-all">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  className="flex-1 min-w-0 pl-5 pr-3 py-2.5 text-sm bg-transparent outline-none text-center tracking-[0.35em] font-mono font-semibold placeholder-gray-400 placeholder:tracking-normal"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={actionLoading || otp.length !== 6}
                  className="shrink-0 m-1 px-4 py-2 text-sm font-semibold bg-[#8b0000] text-white rounded-full hover:bg-[#6b0000] disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? "Verifying…" : "Verify"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setStep("idle"); setOtp(""); setSuccess(""); setError(""); }}
                className="mt-1.5 ml-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Use a different email
              </button>
            </form>
          )}

          {error && (
            <p className="mt-1.5 ml-1 text-xs text-red-600 font-medium">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
