import { useEffect, useMemo, useState } from "react";
import { Eye, Globe, Users, Award } from "lucide-react";
import { authAPI, papersAPI, patentsAPI, projectsAPI } from "../../utils/api";

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [papersCount, setPapersCount] = useState(0);
  const [patentsCount, setPatentsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [keywordsCount, setKeywordsCount] = useState(0);

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

        const keywordPool = []
          .concat(Array.isArray(me?.keywords) ? me.keywords : [])
          .concat(Array.isArray(me?.ai_keywords) ? me.ai_keywords : []);

        setPapersCount(paperRows.length);
        setPatentsCount(patentRows.length);
        setProjectsCount(projectRows.length);
        setKeywordsCount(new Set(keywordPool.map((x: any) => String(x).toLowerCase())).size);
      } catch (err: any) {
        setError(err?.message || "Unable to load analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const profileScore = useMemo(() => {
    const base = 30;
    const paperScore = Math.min(25, papersCount * 2);
    const patentScore = Math.min(20, patentsCount * 4);
    const projectScore = Math.min(15, projectsCount * 3);
    const keywordScore = Math.min(10, keywordsCount);
    return base + paperScore + patentScore + projectScore + keywordScore;
  }, [papersCount, patentsCount, projectsCount, keywordsCount]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-gray-600 font-light">Live metrics from your current profile content</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3"><Eye className="w-5 h-5 text-[#8b0000]" />Profile Items</div>
              <div className="text-2xl font-light text-gray-900">{papersCount + patentsCount + projectsCount}</div>
              <div className="text-xs text-gray-600 mt-1">papers + patents + projects</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3"><Globe className="w-5 h-5 text-blue-600" />Publications</div>
              <div className="text-2xl font-light text-gray-900">{papersCount}</div>
              <div className="text-xs text-gray-600 mt-1">papers in your account</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3"><Users className="w-5 h-5 text-green-600" />Projects</div>
              <div className="text-2xl font-light text-gray-900">{projectsCount}</div>
              <div className="text-xs text-gray-600 mt-1">tracked projects</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3"><Award className="w-5 h-5 text-purple-600" />Profile Score</div>
              <div className="text-2xl font-light text-gray-900">{profileScore}%</div>
              <div className="text-xs text-gray-600 mt-1">derived from live data volume</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Data Breakdown</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div>Papers: {papersCount}</div>
              <div>Patents: {patentsCount}</div>
              <div>Projects: {projectsCount}</div>
              <div>Profile keywords: {keywordsCount}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
