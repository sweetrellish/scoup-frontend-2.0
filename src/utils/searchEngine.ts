import type { FacultyMember, SearchResult } from "../data/searchData";
import { fetchUnifiedSearch, type PublicDataset } from "./publicData";
import {
  normalizeFacultyRecord,
  normalizePaperRecord,
  normalizePatentRecord,
  normalizeProjectRecord,
  getDepartmentAffiliations,
} from "./datasetNormalization";

// ---------------------------------------------------------------------------
// Suggestion system — built from analytics data already in memory
//
// Before typing:  show top papers by citation count (most visible research)
// While typing:   autocomplete across paper titles + research topics/keywords
//                 ranked by match quality (starts-with > word-boundary > contains)
// ---------------------------------------------------------------------------

interface PaperEntry {
  title: string;
  citations: number;
}

interface TopicEntry {
  text: string;
  weight: number;
}

let topPapers: PaperEntry[] = [];
let topicIndex: TopicEntry[] = [];
let facultyIndex: FacultyMember[] = [];

export function setSearchDataset(dataset?: Partial<PublicDataset>): void {
  if (!dataset) return;

  // Kept whole (not just as words) because `/api/search/` ranks papers only -
  // faculty results are matched here, against the dataset already in memory.
  facultyIndex = dataset.facultyData ?? [];

  // --- Top papers by citation count (for default/cold-start suggestions) ---
  topPapers = (dataset.papersData ?? [])
    .filter((p) => p.title && p.title.trim().length > 0)
    .map((p) => ({
      title: p.title.trim(),
      citations: p.citations ?? 0,
    }))
    .sort((a, b) => b.citations - a.citations);

  // --- Topic index for autocomplete while typing ---
  const byKey = new Map<string, TopicEntry>();

  const add = (text: string, weight: number) => {
    const t = text.trim();
    if (!t || t.length < 2 || t.length > 120) return;
    const key = t.toLowerCase();
    const existing = byKey.get(key);
    if (existing) {
      existing.weight = Math.max(existing.weight, weight);
    } else {
      byKey.set(key, { text: t, weight });
    }
  };

  // Paper titles — highest weight (most specific, what users actually search for)
  (dataset.papersData ?? []).forEach((p) => {
    if (p.title) add(p.title, 50);
    p.aiKeywords?.forEach((k) => add(k, 30));
  });

  // Faculty research interests and keywords
  (dataset.facultyData ?? []).forEach((f) => {
    if (f.name) add(f.name, 35);
    f.researchInterests?.forEach((k) => add(k, 28));
    f.aiKeywords?.forEach((k) => add(k, 22));
    getDepartmentAffiliations(f).forEach((k) => add(k, 18));
  });

  // Projects and patents
  (dataset.projectsData ?? []).forEach((p) => {
    if (p.title) add(p.title, 25);
    p.aiKeywords?.forEach((k) => add(k, 18));
  });
  (dataset.patentsData ?? []).forEach((p) => {
    if (p.title) add(p.title, 22);
    p.aiKeywords?.forEach((k) => add(k, 16));
  });

  topicIndex = Array.from(byKey.values()).sort((a, b) => b.weight - a.weight);
}

export function getSearchSuggestions(query: string, limit = 8): string[] {
  const trimmed = query.trim().toLowerCase();

  // Nothing typed — show most-cited papers as discovery suggestions.
  // These give users a sense of what research is in the database.
  if (!trimmed) {
    return topPapers.slice(0, limit).map((p) => p.title);
  }

  // Typing — search across all titles and topics.
  // Tier ranking:
  //   1. Entry exactly matches query
  //   2. Entry starts with query
  //   3. A word within the entry starts with query  (e.g. "bio" → "molecular biology")
  //   4. Entry contains query anywhere
  // Within each tier, higher weight (paper titles > keywords) wins.
  const scored = topicIndex
    .filter((e) => e.text.toLowerCase().includes(trimmed))
    .map((e) => {
      const lower = e.text.toLowerCase();
      let tier = 4;
      if (lower === trimmed) tier = 1;
      else if (lower.startsWith(trimmed)) tier = 2;
      else if (lower.split(/\s+/).some((w) => w.startsWith(trimmed))) tier = 3;
      return { e, tier };
    })
    .sort((a, b) => a.tier - b.tier || b.e.weight - a.e.weight)
    .slice(0, limit);

  return scored.map((s) => s.e.text);
}

// ---------------------------------------------------------------------------
// "Did you mean?" — fuzzy word correction against the topic index
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

// Build a flat word pool from the topic index (extracted once, lazily)
let _wordPool: string[] | null = null;
function getWordPool(): string[] {
  if (_wordPool) return _wordPool;
  const seen = new Set<string>();
  const words: string[] = [];
  for (const entry of topicIndex) {
    for (const w of entry.text.toLowerCase().split(/\s+/)) {
      if (w.length >= 4 && !seen.has(w)) { seen.add(w); words.push(w); }
    }
  }
  _wordPool = words;
  return words;
}

export function getDidYouMean(query: string): string | null {
  const words = query.trim().toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
  if (!words.length) return null;

  const pool = getWordPool();
  const corrected: string[] = [];
  let anyFixed = false;

  for (const word of words) {
    // If word already exists in pool, keep it as-is
    if (pool.includes(word)) { corrected.push(word); continue; }

    // Find closest word within edit distance 2
    let best: string | null = null;
    let bestDist = 3; // threshold — only suggest if distance <= 2
    for (const candidate of pool) {
      if (Math.abs(candidate.length - word.length) > 2) continue;
      const dist = levenshtein(word, candidate);
      if (dist < bestDist) { bestDist = dist; best = candidate; }
    }
    if (best) { corrected.push(best); anyFixed = true; }
    else { corrected.push(word); }
  }

  if (!anyFixed) return null;
  const suggestion = corrected.join(" ");
  return suggestion.toLowerCase() === query.toLowerCase() ? null : suggestion;
}

// ---------------------------------------------------------------------------
// Faculty matching — client-side, over the dataset already in memory
//
// `/api/search/` ranks papers only, so a faculty search returned nothing and
// the "Faculty Member" result card was unreachable. Rather than invent a second
// backend ranker, this matches the faculty records the home page has already
// downloaded from `/api/public/search-data/`.
//
// Two rules borrowed from the backend ranker so the two agree:
//   * every query term must match somewhere — one common word is not a match
//   * matches are on word boundaries, not substrings ("art" ≠ "particle")
// ---------------------------------------------------------------------------

interface FacultyField {
  /** Where the text came from — reported back as the match evidence. */
  source: string;
  values: string[];
  /** Confidence awarded when every query term is found in this field. */
  score: number;
}

const facultyFields = (f: FacultyMember): FacultyField[] => [
  { source: "name", values: [f.name], score: 92 },
  { source: "research interests", values: f.researchInterests ?? [], score: 82 },
  { source: "keywords", values: f.aiKeywords ?? [], score: 72 },
  { source: "themes", values: f.themes ?? [], score: 68 },
  { source: "title", values: [f.title], score: 60 },
  {
    source: "department",
    values: [f.department, ...getDepartmentAffiliations(f)],
    score: 55,
  },
];

// Compiled once per search, not once per faculty record — the index is ~1,600
// people wide and each has several fields.
const termMatchers = (terms: string[]) =>
  terms.map((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"));

const matchesAll = (value: string, matchers: RegExp[]) =>
  matchers.every((matcher) => matcher.test(value));

function scoreFaculty(faculty: FacultyMember, matchers: RegExp[], phrase: string) {
  let best: { score: number; source: string; value: string } | null = null;

  for (const field of facultyFields(faculty)) {
    for (const value of field.values) {
      if (!value) continue;
      if (!matchesAll(value, matchers)) continue;

      // An exact value ("Enyue Lu", "machine learning") beats the same terms
      // scattered through a longer string, so it is not lost below weaker hits.
      const lower = value.toLowerCase();
      let score = field.score;
      if (lower === phrase) score += 8;
      else if (lower.includes(phrase)) score += 4;

      if (!best || score > best.score) {
        best = { score: Math.min(100, score), source: field.source, value };
      }
    }
  }

  return best;
}

function searchFacultyIndex(query: string): SearchResult[] {
  const phrase = query.trim().toLowerCase();
  const terms = phrase.split(/\s+/).filter((t) => t.length >= 2);
  if (!terms.length) return [];

  const matchers = termMatchers(terms);
  const results: SearchResult[] = [];

  for (const faculty of facultyIndex) {
    const hit = scoreFaculty(faculty, matchers, phrase);
    if (!hit) continue;

    // Only surface the interests that actually matched, so the card's gold
    // highlighting marks real evidence rather than every tag on the record.
    const matchedKeywords = [...(faculty.researchInterests ?? []), ...(faculty.aiKeywords ?? [])]
      .filter((k) => matchesAll(k, matchers))
      .slice(0, 5);

    results.push({
      type: "faculty",
      data: faculty,
      confidence: hit.score,
      aiJustification: `Matched on ${hit.source}: "${hit.value}".`,
      matchedKeywords,
      matchEvidence: {
        match_source: hit.source,
        match_strength: hit.value.toLowerCase() === phrase ? "exact" : "all_terms",
        matched_value: hit.value,
        matched_terms: terms,
        score: hit.score,
      },
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

// ---------------------------------------------------------------------------
// Search — calls the backend, maps to SearchResult[]
// ---------------------------------------------------------------------------

export async function performSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  // Faculty come from memory and papers from the backend, so a failed request
  // degrades to faculty-only results instead of an empty page.
  const faculty = searchFacultyIndex(query);

  try {
    const raw = await fetchUnifiedSearch(query);
    const remote = raw.map((item): SearchResult => {
      let data: SearchResult["data"];
      if (item.type === "faculty") {
        data = normalizeFacultyRecord(item.data);
      } else if (item.type === "paper") {
        data = normalizePaperRecord(item.data);
      } else if (item.type === "patent") {
        data = normalizePatentRecord(item.data);
      } else {
        data = normalizeProjectRecord(item.data);
      }
      return {
        type: item.type,
        data,
        confidence: item.confidence,
        aiJustification: item.aiJustification,
        matchedKeywords: item.matchedKeywords,
        matchEvidence: item.matchEvidence,
      };
    });
    return [...faculty, ...remote].sort((a, b) => b.confidence - a.confidence);
  } catch {
    return faculty;
  }
}
