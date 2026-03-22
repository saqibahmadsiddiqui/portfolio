"use client";
import { Github, Linkedin, Mail, FileText, Twitter } from "lucide-react";
import { useProfile } from "./Providers";

export default function Footer() {
  const profile = useProfile();
  const links   = profile.links || {};

  const socials = [
    { href:links.linkedin,                        icon:<Linkedin size={14}/>, label:"LinkedIn" },
    { href:links.github,                          icon:<Github size={14}/>,   label:"GitHub"   },
    { href:links.twitter,                         icon:<Twitter size={14}/>,  label:"Twitter"  },
    { href:profile.email?`mailto:${profile.email}`:"", icon:<Mail size={14}/>, label:"Email"  },
    { href:"/resume.pdf",                         icon:<FileText size={14}/>, label:"Resume"   },
  ].filter(s => s.href);

  return (
    <footer className="py-8" style={{ background:"var(--bg2)", borderTop:"1px solid var(--border)" }}>
      <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-bold text-base mb-0.5" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>
            {profile.name}
          </p>
          <p className="mono text-xs" style={{ color:"var(--text3)" }}>
            {profile.tagline}{profile.location ? ` · ${profile.location}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {socials.map(({ href, icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
              style={{ background:"color-mix(in srgb,var(--accent) 7%,transparent)", border:"1px solid var(--border)", color:"var(--text3)" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--accent)"; el.style.borderColor="color-mix(in srgb,var(--accent) 35%,transparent)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text3)"; el.style.borderColor="var(--border)"; }}>
              {icon}
            </a>
          ))}
        </div>

        <p className="mono text-xs" style={{ color:"var(--text3)" }}>
          © {new Date().getFullYear()} · Build by Saqib Ahmad Siddiqui
        </p>
      </div>
    </footer>
  );
}
