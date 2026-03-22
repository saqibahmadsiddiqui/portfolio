const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get(path: string) {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
}

async function admin(path: string, method: string, secret: string, body?: unknown) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-Admin-Secret": secret },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ detail: "Error" }));
    throw new Error(e.detail || "Failed");
  }
  return r.json();
}

// ── Public ────────────────────────────────────────────────────────────────────
export const fetchProfile    = () => get("/api/profile");
export const fetchTheme      = () => get("/api/theme");
export const fetchSkills     = () => get("/api/skills");
export const fetchExperience = () => get("/api/experience");
export const fetchProjects   = () => get("/api/projects");
export const fetchEducation  = () => get("/api/education");

// ── Admin: Auth ───────────────────────────────────────────────────────────────
export const adminVerify = (s: string) => admin("/api/admin/verify", "POST", s);

// ── Admin: Profile & Theme ────────────────────────────────────────────────────
export const adminUpdateProfile = (s: string, b: unknown) => admin("/api/admin/profile", "PUT", s, b);
export const adminUpdateTheme   = (s: string, b: unknown) => admin("/api/admin/theme",   "PUT", s, b);

// ── Admin: Skills ─────────────────────────────────────────────────────────────
export const adminAddSkill    = (s: string, b: unknown)           => admin("/api/admin/skills",       "POST",   s, b);
export const adminUpdateSkill = (s: string, id: string, b: unknown) => admin(`/api/admin/skills/${id}`, "PUT",  s, b);
export const adminDeleteSkill = (s: string, id: string)           => admin(`/api/admin/skills/${id}`, "DELETE", s);

// ── Admin: Experience ─────────────────────────────────────────────────────────
export const adminAddExp    = (s: string, b: unknown)           => admin("/api/admin/experience",       "POST",   s, b);
export const adminUpdateExp = (s: string, id: string, b: unknown) => admin(`/api/admin/experience/${id}`, "PUT",  s, b);
export const adminDeleteExp = (s: string, id: string)           => admin(`/api/admin/experience/${id}`, "DELETE", s);

// ── Admin: Projects ───────────────────────────────────────────────────────────
export const adminAddProject    = (s: string, b: unknown)           => admin("/api/admin/projects",       "POST",   s, b);
export const adminUpdateProject = (s: string, id: string, b: unknown) => admin(`/api/admin/projects/${id}`, "PUT",  s, b);
export const adminDeleteProject = (s: string, id: string)           => admin(`/api/admin/projects/${id}`, "DELETE", s);

// ── Admin: Education ──────────────────────────────────────────────────────────
export const adminUpdateEducation = (s: string, b: unknown) => admin("/api/admin/education", "PUT", s, b);
