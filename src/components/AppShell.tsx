import { useEffect, useState } from "react";

import { Sidebar } from "./Sidebar";
import { fetchPublicDataset } from "../utils/publicData";

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAuthenticated?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  currentPath,
  onNavigate,
  isAuthenticated,
  children,
}: AppShellProps) {
  const [expertCount, setExpertCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchPublicDataset()
      .then((data: any) => {
        if (!cancelled) setExpertCount(data?.facultyData?.length);
      })
      .catch(() => {
        /* count is decorative; leave it hidden if unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
        expertCount={expertCount}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
