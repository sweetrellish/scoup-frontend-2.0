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
} from "lucide-react";
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

const COMPACT_LABELS: Record<string, string> = {
  "Expertise Map": "Map",
  Institutions: "Inst.",
};

export function Sidebar({
  currentPath,
  onNavigate,
  isAuthenticated = false,
  expertCount,
  institution = "Salisbury University",
}: SidebarProps) {
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
        onClick={() => (locked ? onNavigate("/faculty-login") : onNavigate(item.path))}
        aria-current={active ? "page" : undefined}
        style={itemStyle}
        className={[
          "relative flex h-full items-center gap-1 px-2 py-2 text-xs font-semibold uppercase tracking-wide transition-colors xl:gap-1.5 xl:px-2.5",
          active
            ? "after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-1 after:bg-[#ffc425] xl:after:left-3 xl:after:right-3"
            : locked
              ? "hover:bg-white/5"
              : "hover:bg-[#710000]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{COMPACT_LABELS[item.label] ?? item.label}</span>
        {locked && <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] isolate border-b border-[#5f0000] bg-white shadow-md shadow-black/10">
      <div className="flex h-20">
        <a
          href="https://www.salisbury.edu"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-64 shrink-0 items-center bg-white px-6 py-3 text-left"
        >
          <img
            src={salisburyLogo}
            alt={institution}
            className="h-10 w-auto max-w-full object-contain"
          />
        </a>

        <div className="relative h-full w-20 shrink-0 bg-white" aria-hidden="true">
          <svg
            viewBox="0 0 80 80"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M80 0H34C17 0 6 10 6 23v57h74Z"
              fill="#8b0000"
            />
            <path
              d="M7 65C23 47 36 42 47 47C57 52 58 43 63 30C67 16 70 9 76 5"
              fill="none"
              stroke="#ffa726"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 rounded-tl-[2rem] bg-[#8b0000]">
          <div className="flex min-w-0 flex-1 items-stretch justify-between gap-x-3 pr-4">
            <nav className="flex min-w-0 flex-1 flex-nowrap items-stretch overflow-hidden pr-2" aria-label="Main">
              {DISCOVER_ITEMS.map((item) => renderItem(item, false))}
            </nav>
            <div className="flex min-w-[10.5rem] shrink-0 flex-col items-end justify-center gap-1 py-2">
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => onNavigate("/faculty-login")}
                  style={{ borderColor: "#ffc425", color: "#ffc425" }}
                  className="rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#ffc425] hover:text-[#710000]"
                >
                  Faculty Sign In
                </button>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => onNavigate("/faculty-dashboard")}
                  style={{ borderColor: "#ffc425", color: "#ffc425" }}
                  className="rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-[#ffc425] hover:text-[#710000]"
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
          </div>
        </div>
      </div>
    </header>
  );
}
