import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, X, Check } from "lucide-react";
import { authAPI } from "../utils/api";

interface FacultyLoginProps {
  onBack?: () => void;
  onLoginSuccess?: () => void;
  onNavigateSignup?: () => void;
}

export function FacultyLogin({
  onBack,
  onLoginSuccess,
  onNavigateSignup,
}: FacultyLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState("");

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authAPI.login(formData.emailOrUsername, formData.password);

      setLoginSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message ||
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotStatus("loading");
    setForgotError("");
    try {
      await authAPI.forgotPassword(forgotEmail.trim());
      setForgotStatus("sent");
    } catch {
      setForgotStatus("error");
      setForgotError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-semibold text-primary">SCOUP</h1>
          </div>
          <p className="text-muted-foreground">Faculty Portal Access</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Welcome Back</CardTitle>
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription>
              Sign in to access your faculty dashboard and collaboration tools
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">
                  Email Address or Username
                </Label>
                <div className="relative">
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="your.email@salisbury.edu or username"
                    value={formData.emailOrUsername}
                    onChange={(e) =>
                      handleInputChange("emailOrUsername", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm text-muted-foreground hover:text-primary"
                  onClick={() => { setShowForgotModal(true); setForgotStatus("idle"); setForgotEmail(""); setForgotError(""); }}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className={`w-full transition-colors ${loginSuccess ? "bg-green-600 hover:bg-green-600 text-white" : ""}`}
                disabled={isLoading || loginSuccess}
              >
                {loginSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Welcome!
                  </>
                ) : isLoading ? (
                  "Signing in..."
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Need access to SCOUP?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onNavigateSignup}
                >
                  Request Faculty Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <Button variant="link" className="px-0 text-sm">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="px-0 text-sm">
              Privacy Policy
            </Button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {forgotStatus === "sent" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If <span className="font-medium">{forgotEmail}</span> is registered, you'll receive a reset link shortly.
                </p>
                <Button className="w-full" onClick={() => setShowForgotModal(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Reset your password</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Enter your account email and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">Email address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@salisbury.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {forgotStatus === "error" && (
                    <p className="text-sm text-red-600">{forgotError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={forgotStatus === "loading"}>
                    {forgotStatus === "loading" ? "Sending…" : "Send reset link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
