import {
  Search,
  Map,
  Network,
  Users,
  FolderOpen,
  FlaskConical,
  Building2,
  Landmark,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";

import salisburyLogo from "../assets/images/Salisbury_University_logo.png";

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAuthenticated?: boolean;
  expertCount?: number;
  institution?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: typeof Search;
}

const DISCOVER_ITEMS: NavItem[] = [
  { label: "Search", path: "/", icon: Search },
  { label: "Expertise Map", path: "/expertise-map", icon: Map },
  { label: "Networks", path: "/networks", icon: Network },
  { label: "Experts", path: "/experts", icon: Users },
  { label: "Projects", path: "/projects", icon: FolderOpen },
  { label: "Labs", path: "/labs", icon: FlaskConical },
  { label: "Facilities", path: "/facilities", icon: Building2 },
  { label: "Institutions", path: "/institutions", icon: Landmark },
];

export function Sidebar({
  currentPath,
  onNavigate,
  isAuthenticated = false,
  expertCount,
  institution = "Salisbury University",
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(`${path}/`);

  const renderItem = (item: NavItem, locked: boolean) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const itemStyle: CSSProperties = active
      ? { color: "#ffc425" }
      : { color: locked ? "rgba(255,255,255,0.72)" : "#ffffff" };

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => {
          setIsMobileMenuOpen(false);
          locked ? onNavigate("/faculty-login") : onNavigate(item.path);
        }}
        aria-current={active ? "page" : undefined}
        style={itemStyle}
        className={[
          "relative flex h-full items-center justify-center gap-1 px-1.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors xl:gap-1.5 xl:px-2 2xl:gap-2 2xl:px-3 2xl:text-sm",
          active
            ? "after:absolute after:bottom-0 after:left-2 after:right-2 after:h-1 after:bg-[#ffc425] xl:after:left-2.5 xl:after:right-2.5"
            : locked
              ? "hover:bg-white/5"
              : "hover:bg-[#710000]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{item.label}</span>
        {locked && <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] isolate border-b border-[#5f0000] bg-white shadow-md shadow-black/10">
      <div className="relative flex h-20 items-stretch overflow-hidden">
        <a
          href="https://www.salisbury.edu"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-20 flex w-52 shrink-0 items-center justify-center bg-white px-4 py-3 text-left lg:w-56"
        >
          <img
            src={salisburyLogo}
            alt={institution}
            className="h-10 w-auto object-contain"
            style={{ maxWidth: "12rem" }}
          />
        </a>

        <div className="relative z-10 flex min-w-0 flex-1 bg-[#8b0000] pl-6">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-white via-[#fff4d0]/80 to-transparent"
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-1 items-stretch justify-between gap-x-2 pr-8">
            <nav className="relative z-40 hidden min-w-0 flex-1 flex-nowrap items-stretch justify-start overflow-hidden pr-2 md:flex" aria-label="Main">
              {DISCOVER_ITEMS.map((item) => renderItem(item, false))}
            </nav>

            <div className="relative z-40 hidden min-w-[9rem] shrink-0 flex-col items-center justify-center gap-1 py-2 md:flex xl:min-w-[9.25rem]">
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate("/faculty-login");
                  }}
                  style={{ borderColor: "#ffc425", color: "#ffc425" }}
                  className="rounded-sm border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#ffc425] hover:text-[#710000]"
                >
                  Faculty Sign In
                </button>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate("/faculty-dashboard");
                  }}
                  style={{ borderColor: "#ffc425", color: "#ffc425" }}
                  className="rounded-sm border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#ffc425] hover:text-[#710000]"
                >
                  Faculty Portal
                </button>
              )}
              <div
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                <span className="h-2 w-2 rounded-full bg-[#ffc425]" aria-hidden="true" />
                <span>
                  Network live
                  {typeof expertCount === "number" ? ` · ${expertCount.toLocaleString()} experts` : ""}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Open navigation menu"
              style={{ borderColor: "#ffc425", color: "#ffc425" }}
              className="relative z-40 my-auto ml-auto inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors hover:bg-[#710000] md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <nav className="grid grid-cols-2 gap-1 border-t border-[#ffc425]/25 bg-[#8b0000] p-3" aria-label="Mobile main">
            {DISCOVER_ITEMS.map((item) => renderItem(item, false))}
          </nav>
          <div className="border-t border-[#ffc425]/25 bg-[#710000] px-3 py-3">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate(isAuthenticated ? "/faculty-dashboard" : "/faculty-login");
              }}
              style={{ borderColor: "#ffc425", color: "#ffc425" }}
              className="w-full rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#ffc425] hover:text-[#710000]"
            >
              {isAuthenticated ? "Faculty Portal" : "Faculty Sign In"}
            </button>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.88)" }}>
              <span className="h-2 w-2 rounded-full bg-[#ffc425]" aria-hidden="true" />
              <span>
                Network live
                {typeof expertCount === "number" ? ` · ${expertCount.toLocaleString()} experts` : ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
