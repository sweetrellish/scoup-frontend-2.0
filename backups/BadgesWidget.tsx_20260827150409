import { useEffect, useMemo, useState } from "react";
import { Award, Target } from "lucide-react";
import { authAPI, papersAPI, patentsAPI, projectsAPI } from "../../utils/api";

interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress: number;
}

export function BadgesWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [papersCount, setPapersCount] = useState(0);
  const [patentsCount, setPatentsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [keywordCount, setKeywordCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [me, papers, patents, projects] = await Promise.all([
          authAPI.me(),
          papersAPI.getAll(),
          patentsAPI.getAll(),
          projectsAPI.getAll(),
        ]);

        const paperRows = Array.isArray(papers) ? papers : papers?.results || [];
        const patentRows = Array.isArray(patents) ? patents : patents?.results || [];
        const projectRows = Array.isArray(projects) ? projects : projects?.results || [];

        const keywords = []
          .concat(Array.isArray(me?.keywords) ? me.keywords : [])
          .concat(Array.isArray(me?.ai_keywords) ? me.ai_keywords : []);

        setPapersCount(paperRows.length);
        setPatentsCount(patentRows.length);
        setProjectsCount(projectRows.length);
        setKeywordCount(new Set(keywords.map((k: any) => String(k).toLowerCase())).size);
      } catch (err: any) {
        setError(err?.message || "Unable to load achievements.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const badges = useMemo<Badge[]>(() => {
    const totalItems = papersCount + patentsCount + projectsCount;
    return [
      {
        id: "first-output",
        name: "First Output",
        description: "Add your first paper, patent, or project.",
        earned: totalItems >= 1,
        progress: Math.min(100, totalItems > 0 ? 100 : 0),
      },
      {
        id: "research-active",
        name: "Research Active",
        description: "Reach 5 total outputs.",
        earned: totalItems >= 5,
        progress: Math.min(100, Math.round((totalItems / 5) * 100)),
      },
      {
        id: "profile-keywords",
        name: "Keyword Ready",
        description: "Add at least 5 profile keywords.",
        earned: keywordCount >= 5,
        progress: Math.min(100, Math.round((keywordCount / 5) * 100)),
      },
      {
        id: "innovation",
        name: "Innovation",
        description: "Add at least 1 patent.",
        earned: patentsCount >= 1,
        progress: Math.min(100, patentsCount > 0 ? 100 : 0),
      },
    ];
  }, [papersCount, patentsCount, projectsCount, keywordCount]);

  const earnedBadges = badges.filter((b) => b.earned);
  const inProgressBadges = badges.filter((b) => !b.earned);

  if (isLoading) {
    return <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">Loading badges...</div>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Achievement Badges</h2>
          <p className="text-gray-600 mt-1">{earnedBadges.length} of {badges.length} badges earned</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-light text-[#8b0000]">{earnedBadges.length}</div>
          <div className="text-sm text-gray-600">Badges</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {earnedBadges.map((badge) => (
          <div key={badge.id} className="bg-white rounded-lg border border-green-200 p-5">
            <div className="flex items-center gap-2 mb-2 text-green-700">
              <Award className="w-5 h-5" />
              <span className="font-medium">{badge.name}</span>
            </div>
            <p className="text-sm text-gray-700">{badge.description}</p>
          </div>
        ))}
      </div>

      {inProgressBadges.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            In Progress ({inProgressBadges.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressBadges.map((badge) => (
              <div key={badge.id} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="font-semibold text-gray-900 mb-2">{badge.name}</div>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8b0000] rounded-full" style={{ width: `${badge.progress}%` }} />
                </div>
                <div className="text-xs text-gray-600 mt-2">{badge.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
