import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AdminOverviewPage } from "./admin/AdminOverviewPage";
import { AdminAnalyticsPage } from "./admin/AdminAnalyticsPage";
import { FacultyManagementPage } from "./admin/FacultyManagementPage";
import { DepartmentManagementPage } from "./admin/DepartmentManagementPage";
import { StrategicInsightsPage } from "./admin/StrategicInsightsPage";
import { AdminProfilePage } from "./admin/AdminProfilePage";
import { ContactPageEditor } from "./admin/ContactPageEditor";
import { PendingApprovalsPage } from "./admin/PendingApprovalsPage";
import { InquiriesPage } from "./admin/InquiriesPage";
import { AdminMessagesPage } from "./admin/AdminMessagesPage";
import { Button } from "./ui/button";
import { adminAPI } from "../utils/api";
import {
  LogOut, LayoutDashboard, Users,
  UserCircle, Phone, ShieldCheck, ChevronLeft,
  ChevronRight, MessageSquare, Inbox, ExternalLink,
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

type Tab = "overview" | "faculty" | "pending" | "departments" | "analytics" | "insights" | "contact" | "inquiries" | "messages" | "profile";

export function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [adminName, setAdminName] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  // Auto-logout when any API call detects an expired session
  useEffect(() => {
    const handler = () => onLogout();
    window.addEventListener("sessionExpired", handler);
    return () => window.removeEventListener("sessionExpired", handler);
  }, [onLogout]);

  useEffect(() => {
    adminAPI.me().then((data: any) => {
      setAdminName(data.display_name || data.username || "Admin");
    }).catch(() => {});

    // Fetch pending count for sidebar badge
    adminAPI.getPendingFaculty().then((data: any) => {
      const list = Array.isArray(data) ? data : data?.results || [];
      setPendingCount(list.length);
    }).catch(() => {});
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":    return <AdminOverviewPage onNavigate={setActiveTab} />;
      case "faculty":     return <FacultyManagementPage />;
      case "pending":     return <PendingApprovalsPage />;
      case "departments": return <DepartmentManagementPage />;
      case "analytics":   return <AdminAnalyticsPage />;
      case "insights":    return <StrategicInsightsPage />;
      case "contact":     return <ContactPageEditor />;
      case "inquiries":   return <InquiriesPage />;
      case "messages":    return <AdminMessagesPage />;
      case "profile":     return <AdminProfilePage />;
      default:            return <AdminOverviewPage onNavigate={setActiveTab} />;
    }
  };

  const NavBtn = ({
    tab, icon: Icon, label, badge,
  }: { tab: Tab; icon: any; label: string; badge?: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      title={!sidebarOpen ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
        !sidebarOpen ? "justify-center" : ""
      } ${activeTab === tab ? "bg-[#8b0000] text-white" : "text-gray-700 hover:bg-gray-100"}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {sidebarOpen && <span className="flex-1 text-left">{label}</span>}
      {sidebarOpen && badge != null && badge > 0 && (
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
          activeTab === tab ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
        }`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-[68px]"} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm leading-tight truncate">{adminName}</h1>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          ) : (
            <span className="font-bold text-sm text-[#8b0000] mx-auto">S</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
          <NavBtn tab="overview"    icon={LayoutDashboard} label="Overview"           />
          <NavBtn tab="faculty"     icon={Users}           label="Faculty Management" />
          <NavBtn tab="pending"     icon={ShieldCheck}     label="Pending Approvals"  badge={pendingCount} />
          <NavBtn tab="inquiries"   icon={MessageSquare}   label="Inquiries"          />
          <NavBtn tab="messages"    icon={Inbox}           label="Messages"           />
          <NavBtn tab="contact"     icon={Phone}           label="Contact & Links"    />
        </nav>

        {/* Profile + Logout */}
        <div className="p-2 border-t border-gray-200 space-y-0.5">
          <NavBtn tab="profile" icon={UserCircle} label="My Profile" />
          <button
            onClick={() => window.open("/", "_blank")}
            title={!sidebarOpen ? "Go to Search" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Go to Search</span>}
          </button>
          <div className="pt-1" />
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
          {renderContent()}
        </div>
      </main>

      {/* Logout Dialog */}
      {showLogoutDialog && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "28rem", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", margin: 0 }}>Sign out of SCOUP?</h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
              You'll need to sign in again to access your admin dashboard.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
              <Button className="bg-[#8b0000] hover:bg-[#700000] text-white" onClick={onLogout}>Sign Out</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
