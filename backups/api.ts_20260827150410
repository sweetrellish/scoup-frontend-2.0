const envApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const API_BASE_URL = (
  envApiBaseUrl || (import.meta.env.DEV ? "http://localhost:8000/api" : "")
).replace(/\/+$/, "");
const ACCESS_KEY = "facultyAccessToken";
const REFRESH_KEY = "facultyRefreshToken";

const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

const setTokens = (access?: string, refresh?: string) => {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

async function rawApiCall(endpoint: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL in production environment.");
  }

  const token = getAccessToken();
  const isFormDataBody = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isFormDataBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.detail || err?.error || err?.message || message;
    } catch {
      try {
        const text = await res.text();
        if (text) {
          // Strip HTML tags if server returned an HTML error page.
          const cleaned = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (cleaned) {
            message = cleaned.slice(0, 240);
          }
        }
      } catch {}
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let isRefreshing = false;

async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<any> {
  try {
    return await rawApiCall(endpoint, options);
  } catch (err: any) {
    const msg = String(err?.message || "");
    const looks401 =
      msg.includes("HTTP 401") || msg.toLowerCase().includes("token");

    if (looks401 && retry && getRefreshToken()) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await authAPI.refresh();
          isRefreshing = false;
        }
        return await apiCall(endpoint, options, false);
      } catch {
        isRefreshing = false;
        clearTokens();
        window.dispatchEvent(new CustomEvent("sessionExpired"));
        throw new Error("Session expired. Please log in again.");
      }
    }

    throw err;
  }
}

export const authAPI = {
  login: async (usernameOrEmail: string, password: string) => {
    const data = await rawApiCall("/token/", {
      method: "POST",
      body: JSON.stringify({ username: usernameOrEmail, password }),
    });

    setTokens(data.access, data.refresh);
    return data;
  },

  register: async ({
    username,
    email,
    password,
    firstName,
    lastName,
  }: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      return await rawApiCall("/faculty/signup/", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });
    } catch {
      return rawApiCall("/faculty/signup/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
    }
  },

  me: async () => apiCall("/faculty/me/"),

  adminMe: async () => apiCall("/admin/me/"),

  refresh: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    const data = await rawApiCall("/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });

    setTokens(data.access, refresh);
    return data;
  },

  logout: () => {
    clearTokens();
  },

  isAuthenticated: () => !!getAccessToken(),

  forgotPassword: async (email: string) =>
    rawApiCall("/auth/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: async (token: string, password: string) =>
    rawApiCall("/auth/reset-password/", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  changePassword: async (currentPassword: string, newPassword: string) =>
    apiCall("/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  sendOtp: async (institutional_email: string) =>
    apiCall("/auth/send-otp/", {
      method: "POST",
      body: JSON.stringify({ institutional_email }),
    }),

  verifyOtp: async (otp: string) =>
    apiCall("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),
};

export const cvAPI = {
  upload: async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiCall("/faculty/upload-cv-papers/", { method: "POST", body });
  },
  confirm: async (data: {
    profile?: { title?: string; bio?: string; department?: string };
    papers?: any[];
    patents?: any[];
    projects?: any[];
  }) => apiCall("/faculty/confirm-cv-items/", { method: "POST", body: JSON.stringify(data) }),
  searchPapers: async (q: string) => apiCall(`/faculty/paper-search/?q=${encodeURIComponent(q)}`),
  generateBio: async (data: {
    name?: string; title?: string; department?: string;
    qualifications?: any[]; research_interests?: string; keywords?: string[];
  }) => apiCall("/faculty/generate-bio/", { method: "POST", body: JSON.stringify(data) }),
  generateResearchInterests: async (data: {
    title?: string; department?: string;
    qualifications?: any[]; keywords?: string[]; papers?: string[];
  }) => apiCall("/faculty/generate-research-interests/", { method: "POST", body: JSON.stringify(data) }),
  generateProfileKeywords: async (data: {
    department?: string; bio?: string; research_interests?: string; title?: string;
  }) => apiCall("/faculty/generate-profile-keywords/", { method: "POST", body: JSON.stringify(data) }),
};

export const facultyAPI = {
  getAll: async () => apiCall("/faculty/"),
  getById: async (id: number) => apiCall(`/faculty/${id}/`),
  update: async (id: number, data: any) =>
    apiCall(`/faculty/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  updateMe: async (data: any) =>
    apiCall("/faculty/me/", { method: "PATCH", body: JSON.stringify(data) }),
  uploadPhoto: async (file: File) => {
    const body = new FormData();
    body.append("photo", file);
    return apiCall("/faculty/upload-photo/", { method: "POST", body });
  },
};

export const papersAPI = {
  getAll: async () => apiCall("/papers/"),
  getById: async (id: number) => apiCall(`/papers/${id}/`),
  create: async (data: any) =>
    apiCall("/papers/", { method: "POST", body: JSON.stringify(data) }),
  update: async (id: number, data: any) =>
    apiCall(`/papers/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: async (id: number) => apiCall(`/papers/${id}/`, { method: "DELETE" }),
  bulkPublish: async (ids?: number[]) =>
    apiCall("/faculty/papers/bulk-publish/", {
      method: "POST",
      body: JSON.stringify(ids ? { ids } : { all_draft: true }),
    }),
  extractAbstract: async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiCall("/faculty/extract-abstract/", { method: "POST", body });
  },
  generateKeywords: async (title: string, abstract?: string) =>
    apiCall("/faculty/generate-keywords/", {
      method: "POST",
      body: JSON.stringify({ title, abstract }),
    }),
};

export const projectsAPI = {
  getAll: async () => apiCall("/projects/"),
  getById: async (id: number) => apiCall(`/projects/${id}/`),
  create: async (data: any) =>
    apiCall("/projects/", { method: "POST", body: JSON.stringify(data) }),
  update: async (id: number, data: any) =>
    apiCall(`/projects/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: number) =>
    apiCall(`/projects/${id}/`, { method: "DELETE" }),
};

export const patentsAPI = {
  getAll: async () => apiCall("/patents/"),
  getById: async (id: number) => apiCall(`/patents/${id}/`),
  create: async (data: any) =>
    apiCall("/patents/", { method: "POST", body: JSON.stringify(data) }),
  update: async (id: number, data: any) =>
    apiCall(`/patents/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: number) =>
    apiCall(`/patents/${id}/`, { method: "DELETE" }),
};

export const networkAPI = {
  discovery: async ({ q = "", limit = 50 }: { q?: string; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (limit) params.set("limit", String(limit));
    const query = params.toString();
    return apiCall(`/network/discovery/${query ? `?${query}` : ""}`);
  },
  inquire: async (payload: {
    target_faculty_name: string;
    target_faculty_id?: string;
    target_department?: string;
    target_school?: string;
    shared_keywords?: string[];
    note?: string;
  }) =>
    apiCall("/network/inquire/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  // Used from public search — no auth token, requester provides name + email
  publicInquire: async (payload: {
    target_faculty_name: string;
    target_faculty_id?: string;
    target_department?: string;
    target_school?: string;
    target_project_id?: string | number;
    target_project_title?: string;
    requester_role?: string;
    requester_name: string;
    requester_email: string;
    requester_organization?: string;
    note?: string;
  }) => {
    const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");
    const res = await fetch(`${base}/network/inquire/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Failed to submit inquiry.");
    }
    return res.json();
  },
};

export const facultyInquiriesAPI = {
  list: async () => apiCall("/faculty/inquiries/"),
  update: async (id: number, data: { status?: "reviewed" | "closed" }) =>
    apiCall(`/faculty/inquiries/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const adminInquiriesAPI = {
  list: async (source?: "faculty" | "external" | "admin") => {
    const q = source ? `?source=${source}` : "";
    return apiCall(`/admin/inquiries/${q}`);
  },
  update: async (id: number, data: { status?: string; admin_notes?: string }) =>
    apiCall(`/admin/inquiries/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const portalMessagesAPI = {
  inbox: async () => apiCall("/faculty/portal-messages/inbox/"),
  sent: async () => apiCall("/faculty/portal-messages/sent/"),
  send: async (data: { recipient_id: number | string; subject: string; body: string }) =>
    apiCall("/faculty/portal-messages/send/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  markRead: async (id: number) =>
    apiCall(`/faculty/portal-messages/${id}/read/`, { method: "PATCH" }),
};

export const ticketsAPI = {
  list: async () => apiCall("/faculty/tickets/"),
  submit: async (data: { ticket_type: string; subject: string; description: string }) =>
    apiCall("/faculty/tickets/submit/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  publicSubmit: async (data: {
    ticket_type: string;
    subject: string;
    description: string;
    submitter_name: string;
    submitter_email: string;
  }) =>
    apiCall("/support/ticket/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const contactAPI = {
  getTeam: async () => apiCall("/contact/team/"),
  getSettings: async () => apiCall("/contact/settings/"),

  adminGetTeam: async () => apiCall("/admin/contact/team/"),
  adminCreateMember: async (data: any) =>
    apiCall("/admin/contact/team/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  adminUpdateMember: async (id: number, data: any) =>
    apiCall(`/admin/contact/team/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  adminDeleteMember: async (id: number) =>
    apiCall(`/admin/contact/team/${id}/`, { method: "DELETE" }),
  adminUpdateSettings: async (data: any) =>
    apiCall("/admin/contact/settings/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  adminUploadPhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiCall(`/admin/contact/team/${id}/photo/`, {
      method: "POST",
      body: formData,
    });
  },
};

export const adminAPI = {
  me: async () => apiCall("/admin/me/"),
  updateMe: async (data: { first_name?: string; last_name?: string; email?: string }) =>
    apiCall("/admin/me/", { method: "PATCH", body: JSON.stringify(data) }),

  // Faculty management
  getAllFaculty: async (params: { search?: string; status?: string; department?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.status && params.status !== "all") q.set("status", params.status);
    if (params.department) q.set("department", params.department);
    return apiCall(`/admin/faculty/${q.toString() ? `?${q}` : ""}`);
  },
  getPendingFaculty: async () => apiCall("/admin/faculty/?pending=true"),
  updateFaculty: async (id: number, data: Record<string, any>) =>
    apiCall(`/admin/faculty/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteFaculty: async (id: number) =>
    apiCall(`/admin/faculty/${id}/`, { method: "DELETE" }),
  approveFaculty: async (id: number) =>
    apiCall(`/admin/faculty/${id}/approve/`, { method: "POST" }),
  rejectFaculty: async (id: number, reason?: string) =>
    apiCall(`/admin/faculty/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || "" }),
    }),
  bulkFacultyAction: async (action: "approve" | "reject", ids: number[], reason?: string) =>
    apiCall("/admin/faculty/bulk-action/", {
      method: "POST",
      body: JSON.stringify({ action, ids, reason: reason || "" }),
    }),

  // Platform stats & audit log
  getStats: async () => apiCall("/admin/stats/"),
  getAuditLog: async () => apiCall("/admin/audit-log/"),

  // Support tickets
  getTickets: async (params: { status?: string; type?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.type) q.set("type", params.type);
    return apiCall(`/admin/tickets/${q.toString() ? `?${q}` : ""}`);
  },
  updateTicket: async (id: number, data: { status?: string; admin_notes?: string }) =>
    apiCall(`/admin/tickets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Admin → Faculty direct messaging
  sendFacultyMessage: async (
    facultyId: number,
    data: { note: string; message_subject?: string },
  ) =>
    apiCall(`/admin/faculty/${facultyId}/message/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin password change
  changePassword: async (currentPassword: string, newPassword: string) =>
    apiCall("/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
};

export interface MidLevelCategory {
  name: string;
  slug: string;
  article_count: number;
  faculty_count: number;
}

export interface TopLevelCategory {
  name: string;
  slug: string;
  article_count: number;
  faculty_count: number;
  mid_level_categories: MidLevelCategory[];
}

export interface CategoryPaper {
  id: number;
  title: string;
  doi: string;
  journal: string | null;
  date_published: string | null;
  tc_count: number;
  themes: string[];
  mid_level_categories: string[];
  download_url: string | null;
  authors: { id: number; name: string }[];
}

export interface CategoryFaculty {
  id: number;
  name: string;
  department: string | null;
  title: string | null;
  total_citations: number;
  article_count: number;
  photo: string | null;
  themes: string[];
  paper_ids: number[];
  is_approved: boolean;
  profile_visibility: boolean;
  email: string;
}

export interface CategoryTheme {
  name: string;
  count: number;
}

export interface CategoryDetail {
  category_name: string;
  slug: string;
  stats: {
    article_count: number;
    faculty_count: number;
    department_count: number;
    total_citations: number;
    citation_average: number;
  };
  themes: CategoryTheme[];
  papers: CategoryPaper[];
  faculty: CategoryFaculty[];
}

export const categoriesAPI = {
  list: async (): Promise<TopLevelCategory[]> => apiCall("/categories/"),
  detail: async (slug: string): Promise<CategoryDetail> =>
    apiCall(`/categories/${slug}/`),
};

export { apiCall };
