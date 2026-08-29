import type { SearchResult } from "../data/searchData";
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

export function setSearchDataset(dataset?: Partial<PublicDataset>): void {
  if (!dataset) return;

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
// Search — calls the backend, maps to SearchResult[]
// ---------------------------------------------------------------------------

export async function performSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const raw = await fetchUnifiedSearch(query);
    return raw.map((item): SearchResult => {
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
  } catch {
    return [];
  }
}
