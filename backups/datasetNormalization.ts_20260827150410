/**
 * datasetNormalization.ts
 *
 * Thin type-safe wrappers around data coming from the backend.
 * The backend is responsible for all cleaning and normalization.
 * These functions only ensure fields arrive in the correct TypeScript
 * shape — no regex, no alias rules, no complex processing.
 */

import type { FacultyMember, Paper, Patent, Project } from "../data/searchData";

type UnknownRecord = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function str(value: unknown, fallback = ""): string {
  const s = String(value ?? "").trim();
  return s || fallback;
}

function arr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function num(value: unknown, fallback = 0): number {
  return Number(value ?? fallback) || fallback;
}

// ---------------------------------------------------------------------------
// Exported helpers used by searchEngine.ts, admin pages, and Home.tsx
// ---------------------------------------------------------------------------

export function getDepartmentAffiliations(recordLike: unknown): string[] {
  return arr(asRecord(recordLike).departmentAffiliations);
}

export function getSchoolAffiliations(recordLike: unknown): string[] {
  return arr(asRecord(recordLike).schoolAffiliations);
}

export function getPrimaryDepartment(recordLike: unknown): string {
  const record = asRecord(recordLike);
  return str(record.department) || arr(record.departmentAffiliations)[0] || "Unassigned";
}

export function isLikelyExternalFaculty(recordLike: unknown): boolean {
  const record = asRecord(recordLike);
  const schools = arr(record.schoolAffiliations);
  if (schools.length === 0) return false;
  return !schools.some((s) => /salisbury/i.test(s));
}

// ---------------------------------------------------------------------------
// Record normalizers — one per data type
// ---------------------------------------------------------------------------

export function normalizeFacultyRecord(recordLike: unknown): FacultyMember {
  const r = asRecord(recordLike);

  const metricsRaw = asRecord(r.metricsProfile);
  const totalCitations = num(metricsRaw.totalCitations);
  const articleCount = num(metricsRaw.articleCount);
  const averageCitations = num(metricsRaw.averageCitations);
  const hasMetrics = totalCitations > 0 || articleCount > 0 || averageCitations > 0;

  return {
    id: str(r.id, str(r.pk, "unknown")),
    name: str(r.name, "Unnamed Faculty"),
    title: str(r.title),
    department: str(r.department, "Unassigned"),
    departmentAffiliations: arr(r.departmentAffiliations),
    schoolAffiliations: arr(r.schoolAffiliations),
    email: str(r.email),
    phone: str(r.phone),
    photo: str(r.photo),
    bio: str(r.bio),
    researchInterests: arr(r.researchInterests),
    aiKeywords: arr(r.aiKeywords),
    metricsProfile: hasMetrics ? { totalCitations, articleCount, averageCitations } : undefined,
    themes: arr(r.themes),
    journals: arr(r.journals),
    sourceProfile: r,
  };
}

export function normalizePaperRecord(recordLike: unknown): Paper {
  const r = asRecord(recordLike);

  return {
    id: str(r.id, "unknown"),
    title: str(r.title, "Untitled Paper"),
    doi: str(r.doi) || undefined,
    journal: str(r.journal) || undefined,
    authors: arr(r.authors),
    year: num(r.year),
    abstract: str(r.abstract),
    link: str(r.link),
    aiKeywords: arr(r.aiKeywords),
    citations: r.citations !== undefined ? num(r.citations) : undefined,
    publishedOnline: str(r.publishedOnline) || undefined,
    publishedPrint: str(r.publishedPrint) || undefined,
    facultyMembers: arr(r.facultyMembers),
    facultyAffiliations: r.facultyAffiliations as Record<string, string[]> | undefined,
    departmentAffiliations: arr(r.departmentAffiliations),
    schoolAffiliations: arr(r.schoolAffiliations),
    engagementMetrics: r.engagementMetrics as Record<string, unknown> | undefined,
  };
}

export function normalizePatentRecord(recordLike: unknown): Patent {
  const r = asRecord(recordLike);

  return {
    id: str(r.id, "unknown"),
    title: str(r.title, "Untitled Patent"),
    inventors: arr(r.inventors),
    patentNumber: str(r.patentNumber ?? r.patent_number),
    year: num(r.year),
    description: str(r.description),
    link: str(r.link),
    aiKeywords: arr(r.aiKeywords),
    departmentAffiliations: arr(r.departmentAffiliations),
    schoolAffiliations: arr(r.schoolAffiliations),
  };
}

export function normalizeProjectRecord(recordLike: unknown): Project {
  const r = asRecord(recordLike);

  return {
    id: str(r.id, "unknown"),
    title: str(r.title, "Untitled Project"),
    leadFaculty: arr(r.leadFaculty),
    status: str(r.status, "Unknown"),
    description: str(r.description),
    startDate: str(r.startDate),
    endDate: str(r.endDate) || undefined,
    aiKeywords: arr(r.aiKeywords),
    isOpenToCollaboration: Boolean(r.isOpenToCollaboration),
    collaborationInvitation: str(r.collaborationInvitation),
    allowStudentInterest: r.allowStudentInterest !== false,
    departmentAffiliations: arr(r.departmentAffiliations),
    schoolAffiliations: arr(r.schoolAffiliations),
  };
}

// ---------------------------------------------------------------------------
// Master normalizer — called once after the API response arrives
// ---------------------------------------------------------------------------

export function normalizePublicDataset(data: {
  facultyData?: unknown[];
  papersData?: unknown[];
  patentsData?: unknown[];
  projectsData?: unknown[];
}) {
  return {
    facultyData: (data.facultyData ?? []).map(normalizeFacultyRecord),
    papersData: (data.papersData ?? []).map(normalizePaperRecord),
    patentsData: (data.patentsData ?? []).map(normalizePatentRecord),
    projectsData: (data.projectsData ?? []).map(normalizeProjectRecord),
  };
}
