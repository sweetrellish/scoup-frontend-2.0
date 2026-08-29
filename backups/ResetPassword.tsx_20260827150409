import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react";
import { authAPI } from "../utils/api";

interface ResetPasswordProps {
  onNavigate: (path: string) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    if (!t) {
      setStatus("error");
      setErrorMsg("No reset token found. Please request a new reset link.");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await authAPI.resetPassword(token, password);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "This link is invalid or has expired."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-primary">SCOUP</h1>
          <p className="text-muted-foreground text-sm mt-1">Faculty Portal</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Set new password</CardTitle>
            <CardDescription>Choose a strong password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                <p className="text-gray-700 font-medium">Password updated!</p>
                <p className="text-sm text-gray-500">You can now log in with your new password.</p>
                <Button className="w-full" onClick={() => onNavigate("/faculty-login")}>
                  Go to login
                </Button>
              </div>
            ) : status === "error" && !token ? (
              <div className="text-center py-6 space-y-4">
                <XCircle className="w-14 h-14 text-red-400 mx-auto" />
                <p className="text-gray-700 font-medium">Invalid reset link</p>
                <p className="text-sm text-gray-500">{errorMsg}</p>
                <Button variant="outline" className="w-full" onClick={() => onNavigate("/faculty-login")}>
                  Back to login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-600">{errorMsg}</p>
                )}

                <Button type="submit" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? "Updating…" : "Update password"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => onNavigate("/faculty-login")}
                >
                  Back to login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
