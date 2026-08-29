import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Building2,
  TrendingUp,
  ExternalLink,
  Award,
  Mail,
  Send,
  X,
} from "lucide-react";
import {
  categoriesAPI,
  apiCall,
  networkAPI,
  type TopLevelCategory,
  type CategoryDetail,
  type CategoryPaper,
  type CategoryFaculty,
} from "../utils/api";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// ─── helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const toCategorySlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[,()]/g, "");

// Query expansion — loaded once from backend
let _expansions: Record<string, string> | null = null;
async function getExpansions(): Promise<Record<string, string>> {
  if (_expansions) return _expansions;
  try { _expansions = await apiCall("/query-expansions/"); }
  catch { _expansions = { ai: "artificial intelligence", ml: "machine learning", llm: "large language models" }; }
  return _expansions!;
}

function expandSearch(raw: string, exp: Record<string, string>): string {
  const norm = raw.trim().toLowerCase();
  if (exp[norm]) return norm + " " + exp[norm];
  const extras = norm.split(/\s+/).filter((w) => exp[w]).map((w) => exp[w]);
  return extras.length ? norm + " " + extras.join(" ") : norm;
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-[#8b0000] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── BrowseIndex ─────────────────────────────────────────────────────────────

function BrowseIndex({ onCategoryClick }: { onCategoryClick: (slug: string) => void }) {
  const [categories, setCategories] = useState<TopLevelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    categoriesAPI.list()
      .then(setCategories)
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mid_level_categories.some((m) => m.name.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  const toggle = (slug: string) =>
    setExpandedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fff9e6] to-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4">
              Browse Research <span className="text-[#8b0000]">Categories</span>
            </h1>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
              Explore Salisbury University's research expertise across 16 disciplines.
              Discover faculty, publications, and emerging themes.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search research categories or fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-6 text-lg border-2 border-gray-300 focus:border-[#8b0000] rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {loading && <Spinner />}
          {error && <p className="text-center text-red-500 py-10">{error}</p>}

          {!loading && !error && (
            <>
              <p className="text-gray-600 mb-6">
                Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{" "}
                {categories.length} categories
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {filtered.map((cat) => {
                  const isExpanded = expandedCategories.includes(cat.slug);
                  return (
                    <Card
                      key={cat.slug}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-[#8b0000]"
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <button
                            onClick={() => onCategoryClick(cat.slug)}
                            className="text-2xl font-semibold text-gray-900 hover:text-[#8b0000] transition-colors text-left w-full"
                          >
                            {cat.name}
                          </button>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#8b0000]" />
                            <span className="text-gray-700">
                              <span className="font-semibold text-gray-900">{cat.article_count}</span> papers
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#8b0000]" />
                            <span className="text-gray-700">
                              <span className="font-semibold text-gray-900">{cat.faculty_count}</span> faculty
                            </span>
                          </div>
                        </div>

                        {cat.mid_level_categories.length > 0 && (
                          <div>
                            <Button
                              variant="ghost"
                              onClick={() => toggle(cat.slug)}
                              className="text-[#8b0000] hover:text-[#700000] p-0 h-auto font-medium mb-2"
                            >
                              {isExpanded ? (
                                <><ChevronUp className="w-4 h-4 mr-1" />Hide sub-fields</>
                              ) : (
                                <><ChevronDown className="w-4 h-4 mr-1" />Show {cat.mid_level_categories.length} sub-fields</>
                              )}
                            </Button>
                            {isExpanded && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {cat.mid_level_categories.map((mid) => (
                                  <Badge
                                    key={mid.slug}
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => onCategoryClick(mid.slug)}
                                  >
                                    {mid.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Button
                            onClick={() => onCategoryClick(cat.slug)}
                            className="w-full bg-[#8b0000] hover:bg-[#700000] text-white"
                          >
                            View Category Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-600 text-lg">No categories found matching "{searchQuery}"</p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 bg-[#8b0000] hover:bg-[#700000] text-white"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ─── BrowseDetail ─────────────────────────────────────────────────────────────

const FACULTY_PER_PAGE = 4;
const THEMES_PER_PAGE = 3;

function BrowseDetail({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expansions, setExpansions] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [facultyPage, setFacultyPage] = useState(0);
  const [themePage, setThemePage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setSelectedTheme(null);
    setSelectedFacultyId(null);
    setSearchQuery("");
    setFacultyPage(0);
    setThemePage(0);

    Promise.all([categoriesAPI.detail(slug), getExpansions()])
      .then(([res, exp]) => { setData(res); setExpansions(exp); })
      .catch(() => setError("Failed to load category data."))
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredPapers = useMemo(() => {
    if (!data) return [];
    let list = data.papers;

    if (selectedFacultyId !== null) {
      const ids = new Set(data.faculty.find((f) => f.id === selectedFacultyId)?.paper_ids ?? []);
      list = list.filter((p) => ids.has(p.id));
    }
    if (selectedTheme !== null) {
      const tl = selectedTheme.toLowerCase();
      list = list.filter((p) => (p.themes ?? []).some((t) => t.toLowerCase() === tl));
    }
    if (searchQuery.trim()) {
      const expanded = expandSearch(searchQuery, expansions);
      const terms = expanded.split(/\s+/).filter((w) => w.length >= 2);
      list = list.filter((p) => {
        const hay = [p.title, p.journal ?? "", ...(p.themes ?? []), ...p.authors.map((a) => a.name)]
          .join(" ").toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    }
    return list;
  }, [data, selectedFacultyId, selectedTheme, searchQuery, expansions]);

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500">{error ?? "Category not found."}</p>
        <Button onClick={onBack} className="mt-4 bg-[#8b0000] hover:bg-[#700000] text-white">
          Back to Categories
        </Button>
      </div>
    );
  }

  const maxFacultyPage = Math.ceil(data.faculty.length / FACULTY_PER_PAGE) - 1;
  const maxThemePage = Math.ceil(data.themes.length / THEMES_PER_PAGE) - 1;
  const visibleFaculty = data.faculty.slice(facultyPage * FACULTY_PER_PAGE, (facultyPage + 1) * FACULTY_PER_PAGE);
  const visibleThemes = data.themes.slice(themePage * THEMES_PER_PAGE, (themePage + 1) * THEMES_PER_PAGE);

  const selectedFacultyName = selectedFacultyId !== null
    ? (data.faculty.find((f) => f.id === selectedFacultyId)?.name ?? null)
    : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fff9e6] to-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-[#8b0000] hover:text-[#700000] hover:bg-transparent p-0"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Categories
          </Button>
          <div className="text-center mb-2">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              {data.category_name}
            </h1>
            <p className="text-lg text-gray-600 font-light">
              Explore faculty research, publications, and emerging themes
            </p>
          </div>
        </div>
      </section>

      {/* 3 panels */}
      <section className="px-6 py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">

            {/* Statistics */}
            <Card className="p-6 border-l-4 border-l-[#8b0000]">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                {[
                  { icon: <Users className="w-4 h-4 text-[#8b0000]" />, label: "Faculty", val: data.stats.faculty_count },
                  { icon: <Building2 className="w-4 h-4 text-[#8b0000]" />, label: "Departments", val: data.stats.department_count },
                  { icon: <FileText className="w-4 h-4 text-[#8b0000]" />, label: "Articles", val: data.stats.article_count },
                  { icon: <TrendingUp className="w-4 h-4 text-[#8b0000]" />, label: "Total Citations", val: data.stats.total_citations.toLocaleString() },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Citation Average</span>
                  <span className="font-semibold text-[#8b0000]">{data.stats.citation_average}</span>
                </div>
              </div>
            </Card>

            {/* Faculty carousel */}
            <Card className="p-6 border-l-4 border-l-[#ffd100]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Faculty</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm"
                    onClick={() => setFacultyPage(Math.max(0, facultyPage - 1))}
                    disabled={facultyPage === 0} className="h-8 w-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={() => setFacultyPage(Math.min(maxFacultyPage, facultyPage + 1))}
                    disabled={facultyPage >= maxFacultyPage} className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {visibleFaculty.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFacultyId(selectedFacultyId === f.id ? null : f.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      selectedFacultyId === f.id ? "bg-[#8b0000] text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={f.photo ?? undefined} alt={f.name} />
                      <AvatarFallback className={selectedFacultyId === f.id ? "bg-[#700000] text-white" : "bg-[#8b0000] text-white"}>
                        {getInitials(f.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${selectedFacultyId === f.id ? "text-white" : "text-gray-900"}`}>
                        {f.name}
                      </p>
                      <p className={`text-xs ${selectedFacultyId === f.id ? "text-gray-200" : "text-gray-500"}`}>
                        {f.paper_ids.length} papers
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Themes carousel */}
            <Card className="p-6 border-l-4 border-l-[#8b0000]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Research Themes</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm"
                    onClick={() => setThemePage(Math.max(0, themePage - 1))}
                    disabled={themePage === 0} className="h-8 w-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={() => setThemePage(Math.min(maxThemePage, themePage + 1))}
                    disabled={themePage >= maxThemePage} className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {visibleThemes.map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => setSelectedTheme(selectedTheme === name ? null : name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      selectedTheme === name
                        ? "border-[#8b0000] bg-[#8b0000] text-white"
                        : "border-gray-200 hover:border-[#8b0000] hover:bg-gray-50"
                    }`}
                  >
                    <span className={`text-sm font-medium ${selectedTheme === name ? "text-white" : "text-gray-900"}`}>
                      {name}
                    </span>
                    <Badge variant="secondary" className={selectedTheme === name ? "bg-[#700000] text-white" : ""}>
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Active filters */}
          {(selectedTheme || selectedFacultyId !== null) && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedTheme && (
                <Badge variant="secondary"
                  className="bg-[#8b0000] text-white cursor-pointer hover:bg-[#700000]"
                  onClick={() => setSelectedTheme(null)}>
                  {selectedTheme} ✕
                </Badge>
              )}
              {selectedFacultyName && (
                <Badge variant="secondary"
                  className="bg-[#8b0000] text-white cursor-pointer hover:bg-[#700000]"
                  onClick={() => setSelectedFacultyId(null)}>
                  {selectedFacultyName} ✕
                </Badge>
              )}
              <Button variant="ghost" size="sm"
                onClick={() => { setSelectedTheme(null); setSelectedFacultyId(null); }}
                className="text-[#8b0000] hover:text-[#700000] h-auto py-1 px-2">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main content — drill-down when faculty selected, tabs otherwise */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">

          {selectedFacultyId !== null ? (() => {
            const sf = data.faculty.find((f) => f.id === selectedFacultyId)!;
            return (
              <>
                {/* Back breadcrumb */}
                <button
                  onClick={() => { setSelectedFacultyId(null); setSelectedTheme(null); setSearchQuery(""); }}
                  className="flex items-center gap-1.5 text-sm text-[#8b0000] hover:text-[#6b0000] font-medium mb-6 group"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  Back to all faculty
                </button>

                <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
                  {/* Left: single unified profile + themes card */}
                  <div>
                    <Card className="p-5 border-l-4 border-l-[#8b0000]">
                      {/* Header: avatar + name block, Send Request anchored top-right */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage src={sf.photo ?? undefined} alt={sf.name} />
                            <AvatarFallback className="bg-[#8b0000] text-white text-base font-semibold">
                              {getInitials(sf.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-[0.9375rem] font-semibold text-gray-900 leading-tight">{sf.name}</h2>
                            {sf.title && <p className="text-xs text-gray-500 mt-0.5">{sf.title}</p>}
                            {sf.department && <p className="text-xs text-gray-400">{sf.department}</p>}
                          </div>
                        </div>
                        <FacultyInquiryButton faculty={sf} />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 text-sm text-[#8b0000] font-medium mb-1.5">
                        <span>{sf.article_count} {sf.article_count === 1 ? "paper" : "papers"}</span>
                        {sf.total_citations > 0 && <><span className="text-gray-300">·</span><span>{sf.total_citations.toLocaleString()} citations</span></>}
                      </div>

                      {/* Email */}
                      {sf.email && (
                        <a href={`mailto:${sf.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#8b0000] mb-2 transition-colors">
                          <Mail className="w-3 h-3" />{sf.email}
                        </a>
                      )}

                      {/* Research themes — label removed, just pills */}
                      {sf.themes.length > 0 && (
                        <div className="border-t border-gray-100 pt-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {sf.themes.map((t) => (
                              <button
                                key={t}
                                onClick={() => setSelectedTheme(selectedTheme === t ? null : t)}
                                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium transition-colors ${
                                  selectedTheme === t
                                    ? "bg-[#8b0000] text-white border-[#8b0000]"
                                    : "bg-white text-[#8b0000] border-[#8b0000]/30 hover:bg-[#8b0000]/10"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          {selectedTheme && (
                            <button onClick={() => setSelectedTheme(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-2 underline">
                              Clear theme filter
                            </button>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Right: papers */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        {selectedTheme ? `Papers — ${selectedTheme}` : "All Papers"}
                        <span className="ml-2 text-sm font-normal text-gray-500">({filteredPapers.length})</span>
                      </h3>
                      {/* Paper search */}
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Search papers…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-3 text-sm border border-gray-300 focus:border-[#8b0000] rounded-lg h-9"
                        />
                      </div>
                    </div>

                    {filteredPapers.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-sm">
                        No papers match the current filter.
                        <button onClick={() => { setSelectedTheme(null); setSearchQuery(""); }} className="block mx-auto mt-2 text-[#8b0000] underline text-xs">Clear filters</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPapers.map((paper) => (
                          <PaperCard key={paper.id} paper={paper} activeTheme={selectedTheme}
                            onThemeClick={(t) => setSelectedTheme(selectedTheme === t ? null : t)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })() : (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Search papers by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-5 border-2 border-gray-300 focus:border-[#8b0000] rounded-lg"
                  />
                </div>
              </div>

              <Tabs defaultValue="papers" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="papers">Papers ({filteredPapers.length})</TabsTrigger>
                  <TabsTrigger value="faculty">Faculty ({data.faculty.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="papers">
                  <div className="space-y-4">
                    {filteredPapers.map((paper) => (
                      <PaperCard key={paper.id} paper={paper} activeTheme={selectedTheme}
                        onThemeClick={(t) => setSelectedTheme(selectedTheme === t ? null : t)} />
                    ))}
                    {filteredPapers.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No papers found matching your criteria</p>
                        <Button onClick={() => { setSearchQuery(""); setSelectedTheme(null); }}
                          className="mt-4 bg-[#8b0000] hover:bg-[#700000] text-white">Clear Filters</Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="faculty">
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.faculty.map((f) => (
                      <FacultyCard key={f.id} faculty={f}
                        active={selectedFacultyId === f.id}
                        onClick={() => { setSelectedFacultyId(f.id); setSelectedTheme(null); setSearchQuery(""); }} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Paper card ───────────────────────────────────────────────────────────────

function PaperCard({ paper, activeTheme, onThemeClick }: {
  paper: CategoryPaper;
  activeTheme: string | null;
  onThemeClick: (t: string) => void;
}) {
  const href = paper.download_url || (paper.doi ? `https://doi.org/${paper.doi}` : null);
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="text-xl font-semibold text-gray-900 hover:text-[#8b0000] transition-colors">
              {paper.title}
            </a>
          ) : (
            <h3 className="text-xl font-semibold text-gray-900">{paper.title}</h3>
          )}
          <p className="text-sm text-gray-600 mt-1 mb-2">
            {paper.authors.map((a) => a.name).join(", ")}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
            {paper.journal && <span>{paper.journal}</span>}
            {paper.journal && paper.date_published && <span>•</span>}
            {paper.date_published && <span>{new Date(paper.date_published).getFullYear()}</span>}
            {paper.tc_count > 0 && (
              <><span>•</span>
              <span className="text-[#8b0000] font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />{paper.tc_count} citations
              </span></>
            )}
          </div>
          {paper.themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {paper.themes.slice(0, 5).map((t) => (
                <button key={t} onClick={() => onThemeClick(t)}>
                  <Badge variant="secondary"
                    className={`cursor-pointer transition-colors ${
                      activeTheme === t ? "bg-[#8b0000] text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}>
                    {t}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 text-gray-300 hover:text-[#8b0000] mt-1">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </Card>
  );
}

// ─── External Inquiry Dialog ──────────────────────────────────────────────────

function ExternalInquiryDialog({
  faculty,
  onClose,
}: {
  faculty: CategoryFaculty;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Your name is required."); return; }
    if (!email.trim() || !email.includes("@")) { setError("A valid email address is required."); return; }
    if (!note.trim()) { setError("A message is required so the admin team can understand your request."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await networkAPI.publicInquire({
        target_faculty_name: faculty.name,
        target_faculty_id: String(faculty.id),
        target_department: faculty.department ?? "",
        requester_name: name.trim(),
        requester_email: email.trim(),
        requester_organization: org.trim(),
        note: note.trim(),
      });
      setSuccess(res?.message || "Inquiry submitted. The SCOUP team will follow up with you.");
    } catch (e: any) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "0.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "1.5rem", width: "100%", maxWidth: "30rem", border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", margin: 0 }}>
              Send a Request
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
              The SCOUP admin team will follow up to help connect you with this faculty member.
            </p>
          </div>
          <button onClick={onClose} style={{ padding: "0.25rem", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}>
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "0.375rem", padding: "0.75rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0 }}>{faculty.name}</p>
          {faculty.department && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0" }}>{faculty.department}</p>}
        </div>

        {success ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "#166534", margin: 0 }}>{success}</p>
          </div>
        ) : (
          <>
            {/* Name + Email — 2-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Your Name <span style={{ color: "#dc2626" }}>*</span></label>
                <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Your Email <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Organization <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span></label>
                <input value={org} onChange={(e) => setOrg(e.target.value)}
                  placeholder="University / Company / etc."
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Message <span style={{ color: "#dc2626" }}>*</span></label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                placeholder="Briefly describe your interest or collaboration idea…"
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
            </div>
            {error && <p style={{ fontSize: "0.8125rem", color: "#dc2626", marginBottom: "0.75rem" }}>{error}</p>}
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Button variant="outline" onClick={onClose}>{success ? "Close" : "Cancel"}</Button>
          {!success && (
            <Button disabled={submitting} className="bg-[#8b0000] hover:bg-[#6b0000] text-[#ffd100]" onClick={handleSubmit}>
              <Send className="w-4 h-4" />
              {submitting ? "Sending…" : "Send Request"}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Faculty inquiry button (shared by FacultyCard and drill-down) ────────────

function FacultyInquiryButton({ faculty }: { faculty: CategoryFaculty }) {
  const [showInquiry, setShowInquiry] = useState(false);
  return (
    <>
      {showInquiry && <ExternalInquiryDialog faculty={faculty} onClose={() => setShowInquiry(false)} />}
      <Button size="sm" variant="outline" className="text-xs border-gray-300"
        onClick={(e) => { e.stopPropagation(); setShowInquiry(true); }}>
        <Send className="w-3.5 h-3.5 mr-1.5" />
        Send Request
      </Button>
    </>
  );
}

// ─── Faculty card ─────────────────────────────────────────────────────────────

function FacultyCard({ faculty, active, onClick }: {
  faculty: CategoryFaculty;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <Card className={`p-6 hover:shadow-lg transition-all cursor-pointer ${active ? "ring-2 ring-[#8b0000]" : ""}`}>
        <div
          className="flex items-center gap-4"
          onClick={onClick}
        >
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={faculty.photo ?? undefined} alt={faculty.name} />
            <AvatarFallback className="bg-[#8b0000] text-white text-xl">
              {getInitials(faculty.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{faculty.name}</h3>
            {faculty.title && <p className="text-sm text-gray-600">{faculty.title}</p>}
            {faculty.department && <p className="text-sm text-gray-500">{faculty.department}</p>}
            <div className="flex gap-4 mt-1 text-sm text-[#8b0000] font-medium">
              {faculty.paper_ids.length > 0 && <span>{faculty.paper_ids.length} papers</span>}
              {faculty.total_citations > 0 && <span>{faculty.total_citations} citations</span>}
            </div>
          </div>
        </div>

        {/* Contact / Send Request row */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {faculty.email && (
            <a href={`mailto:${faculty.email}?subject=${encodeURIComponent("Collaboration Inquiry via SCOUP")}`}>
              <Button size="sm" className="bg-[#8b0000] hover:bg-[#700000] text-white text-xs">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Contact
              </Button>
            </a>
          )}
          <FacultyInquiryButton faculty={faculty} />
        </div>
      </Card>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BrowseCategories({
  onNavigate,
  currentPath,
  initialSlug,
}: {
  onNavigate: (path: string) => void;
  currentPath: string;
  initialSlug?: string;
}) {
  const [slug, setSlug] = useState<string | null>(initialSlug ?? null);

  const handleSelect = (s: string) => { setSlug(s); onNavigate(`/browse/${s}`); };
  const handleBack = () => { setSlug(null); onNavigate("/browse"); };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onNavigate={onNavigate} currentPath={currentPath} />
      {slug ? (
        <BrowseDetail slug={slug} onBack={handleBack} />
      ) : (
        <BrowseIndex onCategoryClick={handleSelect} />
      )}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
