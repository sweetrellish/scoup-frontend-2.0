import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import salisburyLogo from "../assets/images/Salisbury_University_logo.png";
import { authAPI } from "../utils/api";

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Authenticate credentials first.
      await authAPI.login(formData.emailOrUsername, formData.password);
      // Then enforce admin privileges server-side.
      await authAPI.adminMe();
      onLoginSuccess();
    } catch (err: any) {
      authAPI.logout();
      setError(
        err?.message ||
          "Admin login failed. Ensure this account has staff/superuser permissions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: "emailOrUsername" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8b0000] via-[#6b0000] to-[#4b0000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="text-white/80 hover:text-white mb-6 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={salisburyLogo}
              alt="Salisbury University"
              className="h-16 mx-auto mb-6"
            />
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ffd100] rounded-xl mb-4">
              <Shield className="w-8 h-8 text-[#8b0000]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="emailOrUsername" className="text-gray-700 font-medium">
                Email Address or Username
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="emailOrUsername"
                  type="text"
                  value={formData.emailOrUsername}
                  onChange={(e) => handleInputChange("emailOrUsername", e.target.value)}
                  placeholder="admin@salisbury.edu or username"
                  className="pl-11 h-12 border-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  className="pl-11 pr-10 h-12 border-gray-300"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#8b0000] border-gray-300 rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#8b0000] hover:underline">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#8b0000] hover:bg-[#6b0000] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In as Admin"}
            </Button>
          </form>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div> */}

          {/* SSO Options */}
          {/* <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
            >
              <Shield className="w-5 h-5 mr-2" />
              Sign in with SU SSO
            </Button>
          </div> */}

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Need admin access?{" "}
            <button type="button" className="text-[#8b0000] hover:underline font-medium">
              Contact IT Support
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-sm mt-6">
          © 2026 Salisbury University. All rights reserved.
        </p>
      </div>
    </div>
  );
}
