"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, fetchTheme } from "../lib/api";

export interface ProfileLinks {
  github:   string;
  linkedin: string;
  twitter:  string;
  website:  string;
}

export interface StatItem {
  v: string;
  l: string;
  s: string;
}

export interface Profile {
  name:              string;
  tagline:           string;
  bio:               string;
  location:          string;
  email:             string;
  phone:             string;
  links:             ProfileLinks;
  animation_tokens:  string[];
  navbar_brand:      string;
  resume_url:        string;
  page_title:        string;
  open_to_work:      boolean;
  open_to_work_text: string;
  stats:             StatItem[];
}

export interface Theme {
  accent:   string;
  accent2:  string;
  accent3:  string;
  bg:       string;
  bg2:      string;
  surface:  string;
  surface2: string;
}

const DEFAULT_PROFILE: Profile = {
  name:     "Saqib Ahmad Siddiqui",
  tagline:  "AI & Software Engineer",
  bio:      "Results-driven and adaptable Software Engineer with a solid foundation in programming, database systems, and analytical problem-solving. Aspiring to specialize in Artificial Intelligence and Data Science.",
  location: "Multan, Pakistan",
  email:    "saqibahmad2004@gmail.com",
  phone:    "+923107274227",
  links: {
    github:   "https://github.com/saqibahmadsiddiqui",
    linkedin: "https://linkedin.com/in/saqib-ahmad-siddiqui",
    twitter:  "",
    website:  "https://saqibahmadsiddiqui.vercel.app",
  },
  animation_tokens: [
    "Python","FastAPI","import numpy as np","Scikit-Learn",
    "model.fit(X,y)","MLOps","NeonDB","Hopsworks",
    "accuracy_score()","Oracle APEX","df.describe()","Docker",
    "n_estimators=100","ChromaDB","TypeScript","Next.js",
  ],
  navbar_brand:      "Saqib//;",
  resume_url:        "/resume.pdf",
  page_title:        "Saqib Ahmad Siddiqui | AI & Software Engineer",
  open_to_work:      true,
  open_to_work_text: "Available for full-time, internships, and freelance in AI & software.",
  stats: [
    { v:"3.9",   l:"CGPA",       s:"out of 4.0"          },
    { v:"2+",    l:"Projects",   s:"shipped & live"      },
    { v:"1",     l:"Internship", s:"Oracle ERP"          },
    { v:"Final", l:"Year",       s:"BS Computer Science" },
  ],
};

const DEFAULT_THEME: Theme = {
  accent:   "#3b82f6",
  accent2:  "#06b6d4",
  accent3:  "#6366f1",
  bg:       "#04070f",
  bg2:      "#070d1a",
  surface:  "#0c1424",
  surface2: "#111e33",
};

const ProfileCtx = createContext<Profile>(DEFAULT_PROFILE);
const ThemeCtx   = createContext<Theme>(DEFAULT_THEME);

export const useProfile = () => useContext(ProfileCtx);
export const useTheme   = () => useContext(ThemeCtx);

function applyTheme(d: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--accent",   d.accent);
  root.style.setProperty("--accent2",  d.accent2);
  root.style.setProperty("--accent3",  d.accent3);
  root.style.setProperty("--bg",       d.bg);
  root.style.setProperty("--bg2",      d.bg2);
  root.style.setProperty("--surface",  d.surface);
  root.style.setProperty("--surface2", d.surface2);
  root.style.setProperty("--border",   `color-mix(in srgb, ${d.accent} 12%, transparent)`);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [theme,   setTheme]   = useState<Theme>(DEFAULT_THEME);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetchProfile().catch(() => null),
      fetchTheme().catch(() => null),
    ]).then(([p, t]) => {
      if (p?.name) {
        setProfile(p as Profile);
        if (p.page_title) document.title = p.page_title;
      }
      if (t?.accent) {
        setTheme(t as Theme);
        applyTheme(t as Theme);
      }
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div style={{
        position:"fixed", inset:0,
        background:"#04070f",
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:9999,
      }}>
        <div style={{
          width:"28px", height:"28px",
          border:"2px solid rgba(59,130,246,0.15)",
          borderTop:"2px solid #3b82f6",
          borderRadius:"50%",
          animation:"spin 0.7s linear infinite",
        }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <ProfileCtx.Provider value={profile}>
      <ThemeCtx.Provider value={theme}>
        {children}
      </ThemeCtx.Provider>
    </ProfileCtx.Provider>
  );
}
