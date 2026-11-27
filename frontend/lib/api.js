/**
 * Centralized API client for all FastAPI backend calls.
 * Automatically attaches the Supabase Auth JWT token to every request.
 */

import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://library-management-system-d39s.onrender.com";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated. Please sign in.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function request(method, path, body = null) {
  const headers = await getAuthHeaders();
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}/api/v1${path}`, options);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `API Error: ${res.status}`);
  }
  return data;
}

// ─── Books ───────────────────────────────────────────────────────────────────
export const booksApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/books${q ? "?" + q : ""}`);
  },
  get: (id) => request("GET", `/books/${id}`),
  create: (data) => request("POST", "/books", data),
  update: (id, data) => request("PATCH", `/books/${id}`, data),
  delete: (id) => request("DELETE", `/books/${id}`),
  listCopies: (bookId) => request("GET", `/books/${bookId}/copies`),
};

// ─── Circulation ─────────────────────────────────────────────────────────────
export const circulationApi = {
  issue: (data) => request("POST", "/circulation/issue", data),
  returnBook: (data) => request("POST", "/circulation/return", data),
  listIssues: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/circulation/issues${q ? "?" + q : ""}`);
  },
  listOverdue: () => request("GET", "/circulation/overdue"),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => request("GET", "/users/me"),
  updateMe: (data) => request("PATCH", "/users/me", data),
  listStudents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/users/students${q ? "?" + q : ""}`);
  },
  getStudent: (id) => request("GET", `/users/students/${id}`),
  studentDashboard: () => request("GET", "/users/dashboard/student"),
  librarianDashboard: () => request("GET", "/users/dashboard/stats"),
};

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => request("GET", "/settings"),
  update: (data) => request("PATCH", "/settings", data),
};
