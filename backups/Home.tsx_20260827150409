import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "./ui/button";
import { Search, TrendingUp, Users, LayoutGrid } from "lucide-react";

// NSF top-level categories for browse banner matching
const NSF_CATEGORIES = [
  { name: "Computer and information sciences", slug: "computer-and-information-sciences" },
  { name: "Mathematics and statistics", slug: "mathematics-and-statistics" },
  { name: "Biological and biomedical sciences", slug: "biological-and-biomedical-sciences" },
  { name: "Psychology", slug: "psychology" },
  { name: "Social sciences", slug: "social-sciences" },
  { name: "Education", slug: "education" },
  { name: "Engineering", slug: "engineering" },
  { name: "Physical sciences", slug: "physical-sciences" },
  { name: "Health sciences", slug: "health-sciences" },
  { name: "Geosciences", slug: "geosciences" },
  { name: "Business management and administration", slug: "business-management-and-administration" },
  { name: "Communication and media studies", slug: "communication-and-media-studies" },
  { name: "Humanities", slug: "humanities" },
  { name: "Multidisciplinary interdisciplinary sciences", slug: "multidisciplinary-interdisciplinary-sciences" },
  { name: "Visual and performing arts", slug: "visual-and-performing-arts" },
  { name: "Other non-science and engineering", slug: "other-non-science-and-engineering" },
];

function matchCategory(query: string, results: SearchResult[] = []) {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return null;

  // 1. Direct query match against category names
  const direct = NSF_CATEGORIES.find((cat) => {
    const name = cat.name.toLowerCase();
    if (name.includes(q)) return true;
    const words = q.split(/\s+/).filter((w) => w.length >= 3);
    return words.length >= 1 && words.every((w) => name.includes(w));
  });
  if (direct) return direct;

  // 2. Infer from top results' keywords — papers carry NSF category names in aiKeywords
  const topPapers = results.filter((r) => r.type === "paper").slice(0, 5);
  const keywordCounts: Record<string, number> = {};
  for (const result of topPapers) {
    const paper = result.data as { aiKeywords?: string[] };
    for (const kw of paper.aiKeywords ?? []) {
      const kwNorm = kw.toLowerCase().trim();
      const matched = NSF_CATEGORIES.find((cat) => cat.name.toLowerCase() === kwNorm || cat.name.toLowerCase().includes(kwNorm));
      if (matched) {
        keywordCounts[matched.slug] = (keywordCounts[matched.slug] ?? 0) + 1;
      }
    }
  }
  const topSlug = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return topSlug ? NSF_CATEGORIES.find((c) => c.slug === topSlug) ?? null : null;
}
import { Navbar } from "./Navbar";
import { SearchResults } from "./SearchResults";
import { Footer } from "./Footer";
import { getSearchSuggestions, performSearch, setSearchDataset, getDidYouMean } from "../utils/searchEngine";
import type { SearchResult } from "../data/searchData";
import salisburyLogo from "../assets/images/Salisbury_University_logo.png";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchPublicDataset, type PublicDataset } from "../utils/publicData";
import { getDepartmentAffiliations } from "../utils/datasetNormalization";

interface HomeProps {
  onNavigate: (path: string) => void;
}

const DEPARTMENT_CHART_LIMIT = 8;

export function Home({ onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(["faculty", "paper", "patent", "project"]);
  const [isSearching, setIsSearching] = useState(false);
  const [publicDataset, setPublicDataset] = useState<PublicDataset>({
    facultyData: [],
    papersData: [],
    patentsData: [],
    projectsData: [],
  });
  const [publicDataError, setPublicDataError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const matchedCategory = useMemo(() => matchCategory(searchQuery, searchResults), [searchQuery, searchResults]);

  const openSuggestions = (value: string) => {
    const nextSuggestions = getSearchSuggestions(value, 8);
    setSuggestions(nextSuggestions);
    setIsSuggestionsOpen(nextSuggestions.length > 0);
    setHighlightedSuggestion(-1);
  };

  const executeSearch = async (rawQuery: string) => {
    const normalizedQuery = rawQuery.trim();
    if (!normalizedQuery) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSearchQuery(normalizedQuery);
    setIsSuggestionsOpen(false);
    setHighlightedSuggestion(-1);
    setDidYouMean(null);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await performSearch(normalizedQuery);
      setSearchResults(results);
      if (results.length < 3 || results.every((r) => r.confidence < 70)) {
        setDidYouMean(getDidYouMean(normalizedQuery));
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSearch(searchQuery);
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedSuggestion((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedSuggestion((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsSuggestionsOpen(false);
      setHighlightedSuggestion(-1);
      return;
    }

    if (e.key === "Enter" && highlightedSuggestion >= 0) {
      e.preventDefault();
      void executeSearch(suggestions[highlightedSuggestion]);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Analytics data generated from current public dataset
  const [publicationsPerYear, setPublicationsPerYear] = useState<{ year: string; publications: number }[]>([]);
  const [facultyByDepartment, setFacultyByDepartment] = useState<{ department: string; faculty: number }[]>([]);
  const [stats, setStats] = useState({
    totalPublications: 0,
    facultyMembers: 0,
    activePatents: 0,
    ongoingProjects: 0
  });

  const departmentChartData = useMemo(() => {
    const topDepartments = facultyByDepartment.slice(0, DEPARTMENT_CHART_LIMIT);
    const remainingFaculty = facultyByDepartment
      .slice(DEPARTMENT_CHART_LIMIT)
      .reduce((sum, item) => sum + item.faculty, 0);

    return remainingFaculty > 0
      ? [...topDepartments, { department: "Other departments", faculty: remainingFaculty }]
      : topDepartments;
  }, [facultyByDepartment]);

  const topDepartmentList = useMemo(
    () => facultyByDepartment.slice(0, 5),
    [facultyByDepartment],
  );

  const remainingDepartmentCount = Math.max(
    facultyByDepartment.length - topDepartmentList.length,
    0,
  );

  useEffect(() => {
    const generateAnalytics = () => {
      // Publications per year
      const yearCounts = publicDataset.papersData.reduce((acc, paper) => {
        const year = paper.year.toString();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const pubsData = Object.entries(yearCounts)
        .map(([year, publications]) => ({ year, publications }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));
      
      setPublicationsPerYear(pubsData);

      // Faculty by department
      const deptCounts = publicDataset.facultyData.reduce((acc, faculty) => {
        const departments = getDepartmentAffiliations(faculty);
        const targets = departments.length > 0 ? departments : [faculty.department || "Unassigned"];
        targets.forEach((department) => {
          acc[department] = (acc[department] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
      
      const deptData = Object.entries(deptCounts)
        .map(([department, faculty]) => ({ department, faculty }))
        .sort((a, b) => b.faculty - a.faculty || a.department.localeCompare(b.department));
      
      setFacultyByDepartment(deptData);

      // Overall stats
      setStats({
        totalPublications: publicDataset.papersData.length,
        facultyMembers: publicDataset.facultyData.length,
        activePatents: publicDataset.patentsData.length,
        ongoingProjects: publicDataset.projectsData.length
      });
    };

    generateAnalytics();
  }, [publicDataset]);

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        setPublicDataError("");
        const apiDataset = await fetchPublicDataset();
        setPublicDataset(apiDataset);
        setSearchDataset(apiDataset);
      } catch (error) {
        console.error("Failed to load backend dataset:", error);
        setPublicDataError("Unable to load live public dataset.");
      }
    };

    loadPublicData();
  }, []);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
        setHighlightedSuggestion(-1);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  const renderSuggestionsDropdown = () => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-80 overflow-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion}-${index}`}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void executeSearch(suggestion)}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              index === highlightedSuggestion
                ? "bg-[#fff3bf] text-[#8b0000]"
                : "text-gray-800 hover:bg-gray-50"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Navbar onNavigate={onNavigate} currentPath="/" />

      {hasSearched ? (
        // Search Results View
        <div className="flex-1 bg-white">
          {/* Search Bar in Results */}
          <div className="bg-gradient-to-b from-[#fff9e6] to-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="flex justify-center mb-4">
                <form onSubmit={handleSearch} className="w-full max-w-2xl">
                  <div className="relative" ref={searchBoxRef}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        openSuggestions(value);
                      }}
                      onFocus={() => openSuggestions(searchQuery)}
                      onKeyDown={handleSearchInputKeyDown}
                      placeholder="Search faculty expertise, research, or projects..."
                      className="w-full px-6 py-3 pr-14 text-base border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#8b0000] focus:ring-4 focus:ring-[#ffd100]/30 transition-all shadow-md font-light bg-white"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100] p-2 rounded-full transition-colors shadow-md"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    {renderSuggestionsDropdown()}
                  </div>
                </form>
              </div>
              
              {/* Filters */}
              <div className="flex justify-center items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">Filter:</span>
                <button
                  onClick={() => toggleFilter("faculty")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeFilters.includes("faculty")
                      ? "bg-[#8b0000] text-[#ffd100]"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Faculty
                </button>
                <button
                  onClick={() => toggleFilter("paper")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeFilters.includes("paper")
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Papers
                </button>
                <button
                  onClick={() => toggleFilter("patent")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeFilters.includes("patent")
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Patents
                </button>
                <button
                  onClick={() => toggleFilter("project")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeFilters.includes("project")
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Projects
                </button>
              </div>
              
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery("");
                    setSearchResults([]);
                    setSuggestions([]);
                    setIsSuggestionsOpen(false);
                  }}
                  className="text-sm text-gray-600 hover:text-[#8b0000] transition-colors"
                >
                  ← Back to home
                </button>
              </div>
            </div>
          </div>
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <div className="w-10 h-10 border-4 border-[#8b0000] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-light">Searching...</p>
            </div>
          ) : (
            <>
              {didYouMean && (
                <div className="max-w-5xl mx-auto px-6 mb-2">
                  <p className="text-sm text-gray-500">
                    Did you mean{" "}
                    <button
                      onClick={() => executeSearch(didYouMean)}
                      className="text-[#8b0000] font-medium hover:underline"
                    >
                      {didYouMean}
                    </button>
                    ?
                  </p>
                </div>
              )}
              {matchedCategory && (
                <div className="max-w-5xl mx-auto px-6 mb-6 mt-2">
                  <button
                    onClick={() => onNavigate(`/browse/${matchedCategory.slug}`)}
                    className="w-full flex items-center gap-4 px-6 py-5 rounded-xl border border-[#8b0000]/20 bg-[#8b0000]/5 hover:bg-[#8b0000]/10 transition-colors text-left group"
                  >
                    <LayoutGrid className="w-5 h-5 text-[#8b0000] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-500">Browse all research in </span>
                      <span className="text-sm font-semibold text-[#8b0000]">{matchedCategory.name}</span>
                      <span className="text-sm text-gray-500"> — explore faculty, themes & papers by category</span>
                    </div>
                    <span className="text-xs text-[#8b0000] font-medium group-hover:underline shrink-0">View category →</span>
                  </button>
                </div>
              )}
              <SearchResults results={searchResults} query={searchQuery} activeFilters={activeFilters} onNavigate={onNavigate} />
            </>
          )}
        </div>
      ) : (
        // Hero Section with Search
        <section className="flex items-center justify-center bg-gradient-to-b from-[#fff9e6] via-white to-gray-50 px-6 py-32 md:py-40 min-h-screen relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-[#ffd100] rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#8b0000] rounded-full opacity-5 blur-3xl"></div>
          
          <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
            {/* Heading */}
            <div className="space-y-5">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-[#8b0000] text-[#ffd100] text-sm font-medium rounded-full">
                  Salisbury University
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight">
                Discover. <span className="text-[#8b0000]">Connect.</span> Collaborate.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                AI-powered platform connecting Salisbury University's expertise with real-world impact.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto pt-6">
              <div className="relative" ref={searchBoxRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    openSuggestions(value);
                  }}
                  onFocus={() => openSuggestions(searchQuery)}
                  onKeyDown={handleSearchInputKeyDown}
                  placeholder="Search faculty expertise, research, or projects..."
                  className="w-full px-6 py-4 pr-14 text-base border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#8b0000] focus:ring-4 focus:ring-[#ffd100]/30 transition-all shadow-lg font-light bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100] p-3 rounded-full transition-colors shadow-md"
                >
                  <Search className="w-5 h-5" />
                </button>
                {renderSuggestionsDropdown()}
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Analytics Section - Only show when not searching */}
      {!hasSearched && (
        <section className="bg-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {publicDataError && (
              <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {publicDataError}
              </div>
            )}
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Platform <span className="text-[#8b0000]">Analytics</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Explore Salisbury University's growing research footprint and faculty expertise across departments
              </p>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Publications Per Year Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#ffd100]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">Publications Per Year</h3>
                    <p className="text-sm text-gray-600">Research output trend over time</p>
                  </div>
                </div>
                
                {publicationsPerYear.length > 0 ? (
                  <>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={publicationsPerYear}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="year" 
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '8px 12px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="publications" 
                            stroke="#8b0000" 
                            strokeWidth={3}
                            dot={{ fill: '#8b0000', r: 5 }}
                            activeDot={{ r: 7, fill: '#ffd100', stroke: '#8b0000', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Publications (2018-2025)</span>
                        <span className="font-semibold text-[#8b0000]">
                          {publicationsPerYear.reduce((sum, item) => sum + item.publications, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center px-4">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Publication Data</h4>
                      <p className="text-sm text-gray-600">
                        Publication analytics will appear here once data is added to the system.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Faculty by Department - Bar Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#ffd100]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">Faculty by Department</h3>
                    <p className="text-sm text-gray-600">Top departments by faculty affiliation</p>
                  </div>
                </div>
                
                {facultyByDepartment.length > 0 ? (
                  <>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={departmentChartData}
                          layout="vertical"
                          margin={{ top: 4, right: 20, bottom: 4, left: 12 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            type="number"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            allowDecimals={false}
                          />
                          <YAxis 
                            type="category"
                            dataKey="department" 
                            width={170}
                            stroke="#6b7280"
                            style={{ fontSize: '11px' }}
                            tickFormatter={(value: string) =>
                              value.length > 24 ? `${value.slice(0, 24)}...` : value
                            }
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '8px 12px'
                            }}
                          />
                          <Bar 
                            dataKey="faculty" 
                            fill="#8b0000"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-5 pt-5 border-t border-gray-200 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Department affiliations counted</span>
                        <span className="font-semibold text-[#8b0000]">
                          {facultyByDepartment.reduce((sum, item) => sum + item.faculty, 0)}
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {topDepartmentList.map((dept, index) => (
                          <div key={dept.department} className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="w-5 shrink-0 text-xs font-semibold text-gray-500">
                                {index + 1}
                              </span>
                              <span className="truncate text-gray-700">{dept.department}</span>
                            </div>
                            <span className="shrink-0 font-medium text-gray-900">{dept.faculty}</span>
                          </div>
                        ))}
                        {remainingDepartmentCount > 0 && (
                          <div className="flex items-center justify-between gap-4 text-sm text-gray-500">
                            <span>{remainingDepartmentCount} more departments grouped in the chart</span>
                            <span>
                              {facultyByDepartment
                                .slice(topDepartmentList.length)
                                .reduce((sum, item) => sum + item.faculty, 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center px-4">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Faculty Data</h4>
                      <p className="text-sm text-gray-600">
                        Faculty analytics will appear here once data is added to the system.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center p-6 bg-gradient-to-br from-[#8b0000] to-[#6b0000] rounded-xl text-white">
                <div className="text-4xl font-light mb-2">{stats.totalPublications.toLocaleString()}</div>
                <div className="text-sm text-white/80">Total Publications</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-[#8b0000] to-[#6b0000] rounded-xl text-white">
                <div className="text-4xl font-light mb-2">{stats.facultyMembers.toLocaleString()}</div>
                <div className="text-sm text-white/80">Faculty Members</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-[#ffd100] to-[#e6bc00] rounded-xl text-[#8b0000]">
                <div className="text-4xl font-light mb-2">{stats.activePatents.toLocaleString()}</div>
                <div className="text-sm text-[#8b0000]/80">Active Patents</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-[#ffd100] to-[#e6bc00] rounded-xl text-[#8b0000]">
                <div className="text-4xl font-light mb-2">{stats.ongoingProjects.toLocaleString()}</div>
                <div className="text-sm text-[#8b0000]/80">Ongoing Projects</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
