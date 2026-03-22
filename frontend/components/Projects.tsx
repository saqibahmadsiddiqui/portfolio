"use client";
import { useEffect, useRef, useState } from "react";
import { Github, ExternalLink, Folder } from "lucide-react";
import SectionHeader from "./SectionHeader";

type Project = { id?: string|number; title: string; description: string; tags: string[]; github: string|null; live: string|null; featured: boolean };

function Card({ p, delay }: { p: Project; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold:.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="card p-5 flex flex-col h-full group" style={{
      opacity:   vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(14px)",
      transition:`opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms, border-color .3s, box-shadow .3s`,
    }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background:"color-mix(in srgb,var(--accent) 12%,transparent)", border:"1px solid color-mix(in srgb,var(--accent) 18%,transparent)" }}>
          <Folder size={17} style={{ color:"var(--accent)" }}/>
        </div>
        <div className="flex gap-2">
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ color:"var(--text3)", border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text1)"; el.style.borderColor="rgba(255,255,255,0.15)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text3)"; el.style.borderColor="rgba(255,255,255,0.07)"; }}>
              <Github size={14}/>
            </a>
          )}
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ color:"var(--text3)", border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--accent)"; el.style.borderColor="color-mix(in srgb,var(--accent) 30%,transparent)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text3)"; el.style.borderColor="rgba(255,255,255,0.07)"; }}>
              <ExternalLink size={14}/>
            </a>
          )}
        </div>
      </div>
      <h3 className="font-bold text-sm mb-2 group-hover:text-[var(--accent)] transition-colors"
        style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>{p.title}</h3>
      <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color:"var(--text2)" }}>{p.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="py-14 md:py-20" style={{ background:"var(--bg)" }}>
      <div className="wrap">
        <SectionHeader label="Portfolio" title="Projects"
          subtitle="Real-world AI and software projects — from idea to production."/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p,i) => <Card key={p.id ?? i} p={p} delay={i*100}/>)}
        </div>
        <div className="mt-8 justify-center flex">
          <a href="https://github.com/saqibahmadsiddiqui" target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost inline-flex">
            <Github size={14}/> View all on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
