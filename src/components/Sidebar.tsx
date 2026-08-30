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
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left",
          active
            ? "bg-[#ffc425] text-[#710000] font-semibold shadow-sm"
            : locked
              ? "text-white/45 hover:bg-white/5"
              : "text-white/90 hover:bg-white/10 hover:text-white",
        ].join(" ")}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">{item.label}</span>
        {locked && <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <aside className="w-64 shrink-0 border-r border-[#5f0000] bg-[#8b0000] flex flex-col h-screen sticky top-0 shadow-xl shadow-black/10">
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className="px-4 py-4 text-left border-b border-[#ffc425]/35 bg-white"
      >
        <img
          src={salisburyLogo}
          alt={institution}
          className="h-10 w-auto max-w-full object-contain"
        />
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#ffc425]">
          Discover
        </p>
        <div className="space-y-0.5">
          {DISCOVER_ITEMS.map((item) => renderItem(item, false))}
        </div>

        <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#ffc425]">
          {isAuthenticated ? "Members" : "Members · Sign in"}
        </p>
        <div className="space-y-0.5">
          {MEMBER_ITEMS.map((item) => renderItem(item, !isAuthenticated))}
        </div>
      </nav>

      <div className="border-t border-[#ffc425]/25 p-4 space-y-2 bg-[#710000]">
        <div className="flex items-center gap-2 text-xs text-white/85">
          <span className="w-2 h-2 rounded-full bg-[#ffc425]" aria-hidden="true" />
          <span>
            Network live
            {typeof expertCount === "number" ? ` · ${expertCount.toLocaleString()} experts` : ""}
          </span>
        </div>
        <p className="text-[11px] leading-snug text-white/65">
          You&apos;re searching {institution}.
        </p>
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => onNavigate("/faculty-login")}
            className="w-full text-xs font-semibold text-[#710000] bg-[#ffc425] hover:bg-[#f0b400] rounded-md py-2 transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}
