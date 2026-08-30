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
  { label: "Search", path: "/search", icon: Search },
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
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
          active
            ? "bg-[#8b0000]/10 text-[#8b0000] font-medium"
            : locked
              ? "text-gray-400 hover:bg-gray-50"
              : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">{item.label}</span>
        {locked && <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className="px-5 py-5 text-left border-b border-gray-100"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-[#8b0000]">SCOUP</span>
          <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            Beta
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{institution}</p>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Discover
        </p>
        <div className="space-y-0.5">
          {DISCOVER_ITEMS.map((item) => renderItem(item, false))}
        </div>

        <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {isAuthenticated ? "Members" : "Members · Sign in"}
        </p>
        <div className="space-y-0.5">
          {MEMBER_ITEMS.map((item) => renderItem(item, !isAuthenticated))}
        </div>
      </nav>

      <div className="border-t border-gray-100 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          <span>
            Network live
            {typeof expertCount === "number" ? ` · ${expertCount.toLocaleString()} experts` : ""}
          </span>
        </div>
        <p className="text-[11px] leading-snug text-gray-500">
          You&apos;re searching {institution}.
        </p>
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => onNavigate("/faculty-login")}
            className="w-full text-xs font-medium text-white bg-[#8b0000] hover:bg-[#6f0000] rounded-md py-2 transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}
