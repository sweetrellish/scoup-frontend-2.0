import { useEffect, useRef, useState } from "react";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { FacultyLogin } from "./components/FacultyLogin";
import { FacultySignup } from "./components/FacultySignup";
import { AdminLogin } from "./components/AdminLogin";
import { FacultyDashboard } from "./components/FacultyDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Contact } from "./components/Contact";
import { ResetPassword } from "./components/ResetPassword";
import { BrowseCategories } from "./components/BrowseCategories";
import { Documentation } from "./components/Documentation";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { CookiePolicy } from "./components/CookiePolicy";
import { authAPI } from "./utils/api";
import { FloatingSupportButton } from "./components/FloatingSupportButton";

type UserRole = "admin" | "faculty" | null;
const ROLE_STORAGE_KEY = "scoupUserRole";

const normalizePath = (path: string) => {
  if (!path || path === "") return "/";
  return path.replace(/\/+$/, "") || "/";
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname),
  );
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = sessionStorage.getItem(ROLE_STORAGE_KEY);
    return savedRole === "faculty" || savedRole === "admin" ? savedRole : null;
  });
  const hasManualRoleSelection = useRef(false);

  const navigateTo = (path: string, replace = false) => {
    const target = normalizePath(path);
    if (target === currentPath) return;
    if (replace) {
      window.history.replaceState({}, "", target);
    } else {
      window.history.pushState({}, "", target);
    }
    setCurrentPath(target);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

useEffect(() => {
    const boot = async () => {
      if (sessionStorage.getItem(ROLE_STORAGE_KEY) === "admin") return;
      if (!authAPI.isAuthenticated()) return;

      try {
        await authAPI.me();
        if (!hasManualRoleSelection.current) {
          setUserRole("faculty");
          sessionStorage.setItem(ROLE_STORAGE_KEY, "faculty");
        }
      } catch {
        // Not a faculty account — check if it's an admin
        try {
          await authAPI.adminMe();
          if (!hasManualRoleSelection.current) {
            setUserRole("admin");
            sessionStorage.setItem(ROLE_STORAGE_KEY, "admin");
          }
        } catch {
          authAPI.logout();
          setUserRole(null);
          sessionStorage.removeItem(ROLE_STORAGE_KEY);
        }
      }
    };

    boot();
  }, []);

  useEffect(() => {
    if (currentPath === "/faculty-dashboard" && userRole !== "faculty") {
      navigateTo("/faculty-login", true);
      return;
    }
    if (currentPath === "/admin-dashboard" && userRole !== "admin") {
      navigateTo("/admin-login", true);
      return;
    }
    if (currentPath === "/faculty-login" && userRole === "faculty") {
      navigateTo("/faculty-dashboard", true);
      return;
    }
    // Block admin login when another tab already holds a faculty session
    if (currentPath === "/faculty-login" && userRole === "admin") {
      navigateTo("/", true);
      return;
    }
    if (
      currentPath === "/admin-login" &&
      userRole === "admin" &&
      authAPI.isAuthenticated()
    ) {
      navigateTo("/admin-dashboard", true);
      return;
    }
    // Block faculty login when another tab already holds an admin session
    if (currentPath === "/admin-login" && userRole === "faculty") {
      navigateTo("/", true);
      return;
    }
  }, [currentPath, userRole]);

  useEffect(() => {
    if (currentPath !== "/admin-dashboard" || userRole !== "admin") {
      return;
    }

    let cancelled = false;

    const verifyAdmin = async () => {
      try {
        await authAPI.adminMe();
      } catch {
        if (cancelled) return;
        hasManualRoleSelection.current = false;
        authAPI.logout();
        setUserRole(null);
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
        navigateTo("/admin-login", true);
      }
    };

    verifyAdmin();
    return () => {
      cancelled = true;
    };
  }, [currentPath, userRole]);

  const handleLogin = (role: UserRole) => {
    hasManualRoleSelection.current = true;
    setUserRole(role);
    if (role) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, role);
    }
    if (role === "faculty") {
      navigateTo("/faculty-dashboard", true);
    }
    if (role === "admin") {
      navigateTo("/admin-dashboard", true);
    }
  };

  const handleLogout = () => {
    hasManualRoleSelection.current = false;
    authAPI.logout();
    setUserRole(null);
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    navigateTo("/", true);
  };

  const handleNavigate = (path: string) => {
    navigateTo(path);
  };

  const renderPage = () => {
    if (currentPath === "/faculty-dashboard" && userRole === "faculty") {
      return <FacultyDashboard onLogout={handleLogout} onNavigate={navigateTo} />;
    }
    if (currentPath === "/admin-dashboard" && userRole === "admin") {
      return <AdminDashboard onLogout={handleLogout} onNavigate={navigateTo} />;
    }

    switch (currentPath) {
      case "/":
        return <Home onNavigate={handleNavigate} />;
      case "/about":
        return <About onNavigate={handleNavigate} />;
      case "/contact":
        return <Contact onNavigate={handleNavigate} />;
      case "/docs":
        return <Documentation onNavigate={handleNavigate} />;
      case "/privacy":
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case "/terms":
        return <TermsOfService onNavigate={handleNavigate} />;
      case "/cookie-policy":
        return <CookiePolicy onNavigate={handleNavigate} />;
      case "/reset-password":
        return <ResetPassword onNavigate={handleNavigate} />;
      case "/browse":
        return (
          <BrowseCategories
            onNavigate={handleNavigate}
            currentPath={currentPath}
          />
        );
      case "/faculty-login":
        return (
          <FacultyLogin
            onLoginSuccess={() => handleLogin("faculty")}
            onNavigateSignup={() => handleNavigate("/faculty-signup")}
            onBack={() => handleNavigate("/")}
          />
        );
      case "/faculty-signup":
        return (
          <FacultySignup
            onSignupSuccess={() => handleLogin("faculty")}
            onBack={() => handleNavigate("/faculty-login")}
          />
        );
      case "/admin-login":
        return (
          <AdminLogin
            onLoginSuccess={() => handleLogin("admin")}
            onBack={() => handleNavigate("/")}
          />
        );
      default: {
        // Handle /browse/<slug> detail routes
        if (currentPath.startsWith("/browse/")) {
          const slug = currentPath.slice("/browse/".length);
          return (
            <BrowseCategories
              onNavigate={handleNavigate}
              currentPath={currentPath}
              initialSlug={slug}
            />
          );
        }
        return <Home onNavigate={handleNavigate} />;
      }
    }
  };

  // Only show the floating support button on public-facing pages.
  // Faculty and admin dashboards have their own internal messaging for support.
  const isInDashboard =
    (currentPath === "/faculty-dashboard" && userRole === "faculty") ||
    (currentPath === "/admin-dashboard" && userRole === "admin");

  return (
    <div className="App">
      {renderPage()}
      {!isInDashboard && <FloatingSupportButton />}
    </div>
  );
}
