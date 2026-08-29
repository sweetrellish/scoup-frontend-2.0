import { useState, useEffect } from "react";
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
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  University,
  ArrowLeft,
  User,
  CheckCircle,
} from "lucide-react";
import { authAPI } from "../utils/api";

interface FacultySignupProps {
  onBack?: () => void;
  onSignupSuccess?: () => void;
}

export function FacultySignup({ onBack, onSignupSuccess }: FacultySignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); onBack?.(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate fields
    if (
      !formData.email ||
      !formData.username ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsLoading(false);
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number.");
      setIsLoading(false);
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(formData.password)) {
      setError("Password must contain at least one special character.");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <University className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold text-primary">SCOUP</h1>
          </div>
          <p className="text-muted-foreground">Create Your Faculty Account</p>
        </div>

        {/* Signup Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Sign Up</CardTitle>
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
              Join SCOUP to connect and collaborate with your colleagues
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                <p className="text-gray-800 font-semibold text-lg">Account created!</p>
                <p className="text-sm text-gray-500">
                  You can now sign in and verify your faculty email to go live on SCOUP.
                </p>
                <p className="text-xs text-gray-400">Redirecting to login in {countdown}s…</p>
                <Button className="w-full" onClick={() => onBack?.()}>
                  Go to login
                </Button>
              </div>
            ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@salisbury.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

              {/* Password rules */}
              {formData.password && (
                <div className="space-y-1 text-xs">
                  {[
                    { label: "At least 8 characters", met: formData.password.length >= 8 },
                    { label: "At least one number", met: /[0-9]/.test(formData.password) },
                    { label: "At least one special character", met: /[^a-zA-Z0-9]/.test(formData.password) },
                  ].map(({ label, met }) => (
                    <div key={label} className={`flex items-center gap-1.5 ${met ? "text-green-600" : "text-gray-400"}`}>
                      <span>{met ? "✓" : "○"}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                {onBack && (
                  <Button
                    variant="link"
                    className="px-0 text-sm"
                    onClick={onBack}
                  >
                    Sign in here
                  </Button>
                )}
              </p>
            </div>
            </>
          )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing up, you agree to our{" "}
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
    </div>
  );
}
