"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchProfile, fetchTheme } from "../lib/api";

export interface ProfileLinks {
  github: string; linkedin: string; twitter: string; website: string;
}
export interface StatItem { v: string; l: string; s: string; }
export interface Profile {
  name: string; tagline: string; bio: string;
  location: string; email: string; phone: string;
  links: ProfileLinks;
  animation_tokens: string[];
  navbar_brand: string; resume_url: string;
  page_title: string;
  open_to_work: boolean; open_to_work_text: string;
  stats: StatItem[];
}
export interface ThemeModeColors {
  bg: string; bg2: string; surface: string; surface2: string;
  text1: string; text2: string; text3: string;
}
export interface Theme {
  accent: string; accent2: string; accent3: string;
  preset?: string;
  dark: ThemeModeColors;
  light: ThemeModeColors;
  // legacy flat format support
  bg?: string; bg2?: string; surface?: string; surface2?: string;
}

// ── Ocean Pro defaults ──────────────────────────────────────────────────────
const DARK_DEFAULT: ThemeModeColors = {
  bg:"#0f1520", bg2:"#141b2d", surface:"#1a2235", surface2:"#1e2a40",
  text1:"#f0f4ff", text2:"#8899bb", text3:"#3d5278",
};
const LIGHT_DEFAULT: ThemeModeColors = {
  bg:"#f0f9ff", bg2:"#e0f2fe", surface:"#ffffff", surface2:"#f0f9ff",
  text1:"#0c1a2e", text2:"#4a5568", text3:"#9aa5b4",
};
const DEFAULT_PROFILE: Profile = {
  name:"Saqib Ahmad Siddiqui", tagline:"AI & Software Engineer",
  bio:"Results-driven and adaptable Software Engineer with a solid foundation in programming, database systems, and analytical problem-solving. Aspiring to specialize in Artificial Intelligence and Data Science.",
  location:"Multan, Pakistan", email:"saqibahmad2004@gmail.com", phone:"+923107274227",
  links:{ github:"https://github.com/saqibahmadsiddiqui", linkedin:"https://linkedin.com/in/saqib-ahmad-siddiqui", twitter:"", website:"" },
  animation_tokens:["Python","FastAPI","import numpy as np","Scikit-Learn","model.fit(X,y)","MLOps","NeonDB","Hopsworks","accuracy_score()","Oracle APEX","df.describe()","Docker","n_estimators=100","ChromaDB","TypeScript","Next.js"],
  navbar_brand:"Saqib//;", resume_url:"/api/resume",
  page_title:"Saqib Ahmad Siddiqui | AI & Software Engineer",
  open_to_work:true, open_to_work_text:"Available for full-time, internships, and freelance in AI & software.",
  stats:[
    {v:"3.9",l:"CGPA",s:"out of 4.0"},{v:"2+",l:"Projects",s:"shipped & live"},
    {v:"1",l:"Internship",s:"Oracle ERP"},{v:"Final",l:"Year",s:"BS Computer Science"},
  ],
};
const DEFAULT_THEME: Theme = {
  accent:"#0ea5e9", accent2:"#14b8a6", accent3:"#f97316",
  preset:"ocean-pro", dark:DARK_DEFAULT, light:LIGHT_DEFAULT,
};

// ── Contexts ────────────────────────────────────────────────────────────────
const ProfileCtx  = createContext<Profile>(DEFAULT_PROFILE);
const ThemeCtx    = createContext<Theme>(DEFAULT_THEME);
const DarkModeCtx = createContext<{ isDark:boolean; toggle:()=>void }>({ isDark:true, toggle:()=>{} });

export const useProfile  = () => useContext(ProfileCtx);
export const useTheme    = () => useContext(ThemeCtx);
export const useDarkMode = () => useContext(DarkModeCtx);

// ── Theme application ────────────────────────────────────────────────────────
export function applyFullTheme(t: Theme, dark: boolean) {
  const root = document.documentElement;
  const mode = dark
    ? (t.dark || DARK_DEFAULT)
    : (t.light || LIGHT_DEFAULT);

  root.style.setProperty("--accent",      t.accent);
  root.style.setProperty("--accent2",     t.accent2);
  root.style.setProperty("--accent3",     t.accent3);
  root.style.setProperty("--bg",          mode.bg);
  root.style.setProperty("--bg2",         mode.bg2);
  root.style.setProperty("--surface",     mode.surface);
  root.style.setProperty("--surface2",    mode.surface2);
  root.style.setProperty("--text1",       mode.text1);
  root.style.setProperty("--text2",       mode.text2);
  root.style.setProperty("--text3",       mode.text3);
  root.style.setProperty("--border",      dark
    ? `color-mix(in srgb, ${t.accent} 13%, transparent)`
    : `color-mix(in srgb, ${t.accent} 20%, rgba(0,0,0,0.04))`);
  root.style.setProperty("--card-shadow", dark
    ? "none"
    : "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)");
  root.style.setProperty("--dots-color",  dark
    ? `color-mix(in srgb, ${t.accent} 6%, transparent)`
    : `color-mix(in srgb, ${t.accent} 10%, rgba(0,0,0,0.04))`);
  root.style.setProperty("--input-bg", dark ? mode.surface2 : "#ffffff");
  root.setAttribute("data-theme", dark ? "dark" : "light");
}

// ── Normalize legacy theme format ────────────────────────────────────────────
function normalizeTheme(raw: any): Theme {
  if (raw?.dark && raw?.light) return raw as Theme;
  // Old flat format — migrate
  return {
    accent:  raw?.accent  || "#0ea5e9",
    accent2: raw?.accent2 || "#14b8a6",
    accent3: raw?.accent3 || "#f97316",
    preset:  "custom",
    dark: {
      bg:       raw?.bg       || "#0f1520",
      bg2:      raw?.bg2      || "#141b2d",
      surface:  raw?.surface  || "#1a2235",
      surface2: raw?.surface2 || "#1e2a40",
      text1: "#f0f4ff", text2: "#8899bb", text3: "#3d5278",
    },
    light: LIGHT_DEFAULT,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────────
export default function Providers({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [theme,   setTheme]   = useState<Theme>(DEFAULT_THEME);
  const [isDark,  setIsDark]  = useState(true);
  const [ready,   setReady]   = useState(false);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("portfolio-theme-mode", next ? "dark" : "light");
      applyFullTheme(theme, next);
      return next;
    });
  }, [theme]);

  useEffect(() => {
    // Read localStorage preference immediately
    const saved = localStorage.getItem("portfolio-theme-mode");
    const dark  = saved ? saved === "dark" : true;
    setIsDark(dark);

    // Fetch profile + theme in parallel
    Promise.all([
      fetchProfile().catch(() => null),
      fetchTheme().catch(() => null),
    ]).then(([p, raw]) => {
      if (p?.name) {
        setProfile(p as Profile);
        if (p.page_title) document.title = p.page_title;
      }
      const t = raw ? normalizeTheme(raw) : DEFAULT_THEME;
      setTheme(t);
      applyFullTheme(t, dark);
      setReady(true);
    });
  }, []);

  if (!ready) {
    const spinnerColor = isDark ? "#0ea5e9" : "#0ea5e9";
    const bgColor      = isDark ? "var(--bg)" : "#f0f9ff";
    return (
      <div style={{ position:"fixed", inset:0, background:bgColor,
        display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
        <div style={{ width:"28px", height:"28px",
          border:`2px solid ${isDark?"rgba(14,165,233,0.15)":"rgba(14,165,233,0.2)"}`,
          borderTop:`2px solid ${spinnerColor}`,
          borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <ProfileCtx.Provider value={profile}>
      <ThemeCtx.Provider value={theme}>
        <DarkModeCtx.Provider value={{ isDark, toggle }}>
          {children}
        </DarkModeCtx.Provider>
      </ThemeCtx.Provider>
    </ProfileCtx.Provider>
  );
}
