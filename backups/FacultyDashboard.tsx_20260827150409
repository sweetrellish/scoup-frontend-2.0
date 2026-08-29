import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProfilePage } from "./dashboard/ProfilePage";
import { PapersPage } from "./dashboard/PapersPage";
import { PatentsPage } from "./dashboard/PatentsPage";
import { ProjectsPage } from "./dashboard/ProjectsPage";
import { PDFUploadPage } from "./dashboard/PDFUploadPage";
import { SettingsPage } from "./dashboard/SettingsPage";
import { AnalyticsPage } from "./dashboard/AnalyticsPage";
import { NetworkPage } from "./dashboard/NetworkPage";
import { InquiriesPage } from "./dashboard/InquiriesPage";
import { MessagesPage } from "./dashboard/MessagesPage";
import { BadgesWidget } from "./dashboard/BadgesWidget";
import { DashboardOverview } from "./dashboard/DashboardOverview";
import { VerificationBanner } from "./dashboard/VerificationBanner";
import { Button } from "./ui/button";
import {
  LogOut,
  User,
  FileText,
  Lightbulb,
  FolderOpen,
  Upload,
  Settings,
  BarChart3,
  Network,
  MessageSquare,
  Inbox,
  Trophy,
  Home,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface FacultyDashboardProps {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export function FacultyDashboard({ onLogout, onNavigate }: FacultyDashboardProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "profile"
    | "papers"
    | "patents"
    | "projects"
    | "upload"
    | "settings"
    | "analytics"
    | "network"
    | "inquiries"
    | "messages"
    | "badges"
  >("overview");

  // Auto-logout when any API call detects an expired session
  useEffect(() => {
    const handler = () => onLogout();
    window.addEventListener("sessionExpired", handler);
    return () => window.removeEventListener("sessionExpired", handler);
  }, [onLogout]);

  const handleNavigate = (tab: string) => {
    if (
      tab === "overview" ||
      tab === "profile" ||
      tab === "papers" ||
      tab === "patents" ||
      tab === "projects" ||
      tab === "upload" ||
      tab === "settings" ||
      tab === "analytics" ||
      tab === "network" ||
      tab === "inquiries" ||
      tab === "messages" ||
      tab === "badges"
    ) {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview onNavigate={handleNavigate} />;
      case "profile":
        return <ProfilePage />;
      case "papers":
        return <PapersPage />;
      case "patents":
        return <PatentsPage />;
      case "projects":
        return <ProjectsPage />;
      case "upload":
        return <PDFUploadPage />;
      case "settings":
        return <SettingsPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "network":
        return <NetworkPage />;
      case "inquiries":
        return <InquiriesPage />;
      case "messages":
        return <MessagesPage />;
      case "badges":
        return (
          <div className="max-w-7xl mx-auto">
            <BadgesWidget />
          </div>
        );
      default:
        return <DashboardOverview onNavigate={handleNavigate} />;
    }
  };

  // Helper: renders a nav button. Icons always show; label hides when collapsed.
  const NavBtn = ({ tab, icon: Icon, label }: { tab: string; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      title={!sidebarOpen ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
        !sidebarOpen ? "justify-center" : ""
      } ${
        activeTab === tab
          ? "bg-[#8b0000] text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ──────────────────────────────────────────────────────────
          Width transitions between 256px (open) and 68px (collapsed).
          The toggle button sits in the header and flips sidebarOpen.       */}
      <aside className={`${sidebarOpen ? "w-64" : "w-[68px]"} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>

        {/* Logo / Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex-1 text-center">
              <h1 className="font-bold text-lg leading-tight">SCOUP</h1>
              <p className="text-xs text-gray-500">Faculty Dashboard</p>
            </div>
          ) : (
            <span className="font-bold text-sm text-[#8b0000] mx-auto">S</span>
          )}
          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation — each NavBtn shows icon + label when open, icon-only when closed */}
        <nav className="flex-1 p-2 space-y-0.5">
          <NavBtn tab="overview"  icon={Home}     label="Overview"    />
          <NavBtn tab="profile"   icon={User}     label="Profile"     />
          <NavBtn tab="papers"    icon={FileText}  label="Papers"      />
          <NavBtn tab="patents"   icon={Lightbulb} label="Patents"     />
          <NavBtn tab="projects"  icon={FolderOpen} label="Projects"  />
          <NavBtn tab="upload"    icon={Upload}    label="Upload PDF"  />
          <NavBtn tab="analytics" icon={BarChart3} label="Analytics"  />
          <NavBtn tab="network"   icon={Network}   label="Network"    />
          <NavBtn tab="inquiries" icon={MessageSquare} label="Inquiries" />
          <NavBtn tab="messages"  icon={Inbox}      label="Messages"   />
          <NavBtn tab="badges"    icon={Trophy}    label="Badges"     />
        </nav>

        {/* Settings and Logout */}
        <div className="p-2 border-t border-gray-200 space-y-0.5">
          <NavBtn tab="settings" icon={Settings} label="Settings" />
          <button
            onClick={() => window.open("/", "_blank")}
            title={!sidebarOpen ? "Go to Search" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Go to Search</span>}
          </button>
          <button
            onClick={() => setShowLogoutDialog(true)}
            title={!sidebarOpen ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <VerificationBanner />
          {renderContent()}
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "28rem", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", margin: 0 }}>Sign out of SCOUP?</h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
              You'll need to sign in again to access your faculty dashboard and research profile.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-[#8b0000] hover:bg-[#700000] text-white" onClick={onLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
