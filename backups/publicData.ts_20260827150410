import type { FacultyMember, Paper, Patent, Project } from "../data/searchData";
import { normalizePublicDataset } from "./datasetNormalization";

const envApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const API_BASE_URL = (
  envApiBaseUrl || (import.meta.env.DEV ? "http://localhost:8000/api" : "")
).replace(/\/+$/, "");

export interface PublicDataset {
  facultyData: FacultyMember[];
  papersData: Paper[];
  patentsData: Patent[];
  projectsData: Project[];
}

export interface SemanticSearchResponse {
  query: string;
  model: string;
  count: number;
  results: Paper[];
}

export async function fetchPublicDataset(): Promise<PublicDataset> {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL in production environment.");
  }

  const response = await fetch(`${API_BASE_URL}/public/search-data/`);
  if (!response.ok) {
    throw new Error(`Failed to load public data: HTTP ${response.status}`);
  }

  const data = await response.json();
  return normalizePublicDataset({
    facultyData: Array.isArray(data?.facultyData) ? data.facultyData : [],
    papersData: Array.isArray(data?.papersData) ? data.papersData : [],
    patentsData: Array.isArray(data?.patentsData) ? data.patentsData : [],
    projectsData: Array.isArray(data?.projectsData) ? data.projectsData : [],
  });
}

export interface UnifiedSearchResult {
  type: "faculty" | "paper" | "patent" | "project";
  confidence: number;
  aiJustification: string;
  matchedKeywords: string[];
  matchEvidence?: {
    match_source: string;
    match_strength: "exact" | "phrase" | "all_terms" | "fuzzy" | "semantic" | "partial";
    matched_value: string;
    matched_terms: string[];
    score: number;
  };
  data: Record<string, unknown>;
}

export async function fetchUnifiedSearch(query: string): Promise<UnifiedSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || !API_BASE_URL) return [];
  const response = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(trimmed)}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}

export async function fetchSemanticPaperResults(
  query: string,
  limit = 20
): Promise<Paper[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  if (!API_BASE_URL) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/semantic/papers/?q=${encodeURIComponent(trimmed)}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Semantic search failed: HTTP ${response.status}`);
  }

  const data: SemanticSearchResponse = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}
