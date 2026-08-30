import {
  Search,
  Map,
  Network,
  Users,
  FolderOpen,
  FlaskConical,
  Building2,
  Landmark,
  Shield,
  Lock,
} from "lucide-react";

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

const MEMBER_ITEMS: NavItem[] = [
  { label: "Admin", path: "/admin-dashboard", icon: Shield },
];

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

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => (locked ? onNavigate("/faculty-login") : onNavigate(item.path))}
        aria-current={active ? "page" : undefined}
        className={[
          "flex h-full items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
          active
            ? "bg-[#ffc425] text-[#710000]"
            : locked
              ? "text-white/45 hover:bg-white/5"
              : "text-white hover:bg-[#710000]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{item.label}</span>
        {locked && <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#5f0000] bg-white shadow-md shadow-black/10">
      <div className="flex min-h-20">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="flex w-64 shrink-0 items-center bg-white px-6 py-4 text-left"
        >
          <img
            src={salisburyLogo}
            alt={institution}
            className="h-12 w-auto max-w-full object-contain"
          />
        </button>

        <div className="flex min-w-0 flex-1 flex-col bg-[#8b0000]">
          <div className="flex min-h-14 flex-wrap items-stretch justify-between gap-x-4">
            <nav className="flex min-w-0 flex-1 flex-wrap items-stretch" aria-label="Main">
              {DISCOVER_ITEMS.map((item) => renderItem(item, false))}
            </nav>
            <div className="flex items-stretch">
              {MEMBER_ITEMS.map((item) => renderItem(item, !isAuthenticated))}
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => onNavigate("/faculty-login")}
                  className="bg-[#ffc425] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-[#710000] transition-colors hover:bg-[#f0b400]"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[#ffc425]/25 bg-[#710000] px-4 py-1.5 text-xs text-white/85">
            <span className="h-2 w-2 rounded-full bg-[#ffc425]" aria-hidden="true" />
            <span>
              Network live
              {typeof expertCount === "number" ? ` · ${expertCount.toLocaleString()} experts` : ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
