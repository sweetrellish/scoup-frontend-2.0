export interface Qualification {
  degree: string;
  institution: string;
  year?: string | number;
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  departmentAffiliations?: string[];
  schoolAffiliations?: string[];
  email: string;
  phone: string;
  photo: string;
  bio: string;
  qualifications?: Qualification[];
  allowMessagesViaSCOUP?: boolean;
  researchInterests: string[];
  aiKeywords: string[];
  metricsProfile?: {
    totalCitations: number;
    articleCount: number;
    averageCitations: number;
  };
  categories?: {
    top: string[];
    mid: string[];
    low: string[];
  };
  themes?: string[];
  journals?: string[];
  nsfCategories?: string[];
  sourceProfile?: Record<string, unknown>;
}

export interface Paper {
  id: string;
  title: string;
  doi?: string;
  journal?: string;
  authors: string[];
  year: number;
  abstract: string;
  link: string;
  aiKeywords: string[];
  citations?: number;
  publishedOnline?: string;
  publishedPrint?: string;
  categories?: {
    top: string[];
    mid: string[];
    low: string[];
  };
  facultyMembers?: string[];
  facultyAffiliations?: Record<string, string[]>;
  departmentAffiliations?: string[];
  schoolAffiliations?: string[];
  sourceMetadata?: Record<string, unknown>;
  engagementMetrics?: Record<string, unknown>;
  semanticScore?: number;
}

export interface Patent {
  id: string;
  title: string;
  inventors: string[];
  patentNumber: string;
  year: number;
  description: string;
  link: string;
  aiKeywords: string[];
  departmentAffiliations?: string[];
  schoolAffiliations?: string[];
}

export interface Project {
  id: string;
  title: string;
  leadFaculty: string[];
  status: string;
  description: string;
  startDate: string;
  endDate?: string;
  aiKeywords: string[];
  isOpenToCollaboration?: boolean;
  collaborationInvitation?: string;
  allowStudentInterest?: boolean;
  departmentAffiliations?: string[];
  schoolAffiliations?: string[];
}

export interface SearchResult {
  type: "faculty" | "paper" | "patent" | "project";
  data: FacultyMember | Paper | Patent | Project;
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
}
