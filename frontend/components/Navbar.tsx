"use client";
import { useState, useEffect } from "react";
import { Menu, X, FileText, Moon, Sun } from "lucide-react";
import { useProfile, useDarkMode } from "./Providers";

const NAV_LINKS = [
  { href:"#about",      label:"About"      },
  { href:"#skills",     label:"Skills"     },
  { href:"#experience", label:"Experience" },
  { href:"#projects",   label:"Projects"   },
  { href:"#education",  label:"Education"  },
  { href:"#contact",    label:"Contact"    },
];

export default function Navbar() {
  const profile         = useProfile();
  const { isDark, toggle } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const brand     = profile.navbar_brand || "Portfolio//;";
  const splitIdx  = brand.indexOf("//;");
  const brandText = splitIdx > -1 ? brand.slice(0, splitIdx) : brand;
  const brandSym  = splitIdx > -1 ? brand.slice(splitIdx) : "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:     scrolled ? "color-mix(in srgb, var(--bg) 92%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom:   scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}>
      <nav className="wrap h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <a href="#" className="font-bold flex-shrink-0"
          style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.05rem", letterSpacing:"-0.01em", color:"var(--text1)" }}>
          {brandText}
          {brandSym && (
            <span style={{ background:"linear-gradient(135deg,var(--accent),var(--accent2))",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {brandSym}
            </span>
          )}
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(n => (
            <li key={n.href}>
              <a href={n.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color:"var(--text2)", fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text1)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text2)")}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right — toggle + resume */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">

          {/* Light/Dark pill toggle */}
          <button
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="relative rounded-full transition-all duration-300"
            style={{
              width:"44px", height:"24px",
              background: isDark
                ? "color-mix(in srgb,var(--accent) 15%,transparent)"
                : "color-mix(in srgb,var(--accent3) 15%,transparent)",
              border:"1px solid var(--border)",
            }}>
            <div
              className="absolute top-0.5 flex items-center justify-center rounded-full"
              style={{
                width:"20px", height:"20px",
                background: isDark ? "var(--accent)" : "var(--accent3)",
                left: isDark ? "2px" : "calc(100% - 22px)",
                transition:"left 0.3s cubic-bezier(.4,0,.2,1), background 0.3s ease",
              }}>
              {isDark
                ? <Moon  size={10} color="#fff"/>
                : <Sun   size={10} color="#fff"/>}
            </div>
          </button>

          <a href="/api/resume" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all"
            style={{ color:"var(--text2)", border:"1px solid var(--border)",
              background:"color-mix(in srgb,var(--accent) 6%,transparent)", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text1)"; el.style.borderColor="color-mix(in srgb,var(--accent) 40%,transparent)"; }}
            onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text2)"; el.style.borderColor="var(--border)"; }}>
            <FileText size={13}/> Resume
          </a>
        </div>

        {/* Mobile right — toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3 flex-shrink-0">
          <button onClick={toggle} title={isDark ? "Light mode" : "Dark mode"}
            className="relative rounded-full"
            style={{ width:"36px", height:"20px",
              background: isDark ? "color-mix(in srgb,var(--accent) 15%,transparent)" : "color-mix(in srgb,var(--accent3) 15%,transparent)",
              border:"1px solid var(--border)" }}>
            <div className="absolute top-0.5 flex items-center justify-center rounded-full"
              style={{ width:"16px", height:"16px",
                background: isDark ? "var(--accent)" : "var(--accent3)",
                left: isDark ? "2px" : "calc(100% - 18px)",
                transition:"left 0.3s cubic-bezier(.4,0,.2,1), background 0.3s ease" }}>
              {isDark ? <Moon size={8} color="#fff"/> : <Sun size={8} color="#fff"/>}
            </div>
          </button>

          <button className="p-1" style={{ color:"var(--text2)" }} onClick={() => setOpen(!open)}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden wrap pb-5 pt-2 transition-colors"
          style={{ background:"color-mix(in srgb, var(--bg) 98%, transparent)", borderTop:"1px solid var(--border)" }}>
          {NAV_LINKS.map(n => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="block py-3 text-sm border-b font-medium"
              style={{ color:"var(--text2)", borderColor:"var(--border)", fontFamily:"'DM Sans',sans-serif" }}>
              {n.label}
            </a>
          ))}
          <a href="/api/resume" target="_blank" rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm font-medium"
            style={{ color:"var(--accent)", fontFamily:"'DM Sans',sans-serif" }}>
            <FileText size={13}/> Resume
          </a>
        </div>
      )}
    </header>
  );
}
