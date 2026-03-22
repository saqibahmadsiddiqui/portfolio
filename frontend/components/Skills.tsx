"use client";
import { useEffect, useRef, useState } from "react";
import { Code2, Brain, Globe, Database, Wrench } from "lucide-react";
import SectionHeader from "./SectionHeader";

const ICONS: Record<string, React.ReactNode> = {
  code:     <Code2 size={16}/>,
  brain:    <Brain size={16}/>,
  globe:    <Globe size={16}/>,
  database: <Database size={16}/>,
  tool:     <Wrench size={16}/>,
};

type SkillGroup = { id?: string; category: string; icon: string; items: string[] };

function Card({ g, delay }: { g: SkillGroup; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold:.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="card p-4 sm:p-5" style={{
      opacity:   vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(16px)",
      transition:`opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms, border-color .3s, box-shadow .3s`,
    }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:"color-mix(in srgb,var(--accent) 14%,transparent)", color:"var(--accent)" }}>
          {ICONS[g.icon] ?? <Code2 size={16}/>}
        </div>
        <h3 className="font-semibold text-sm" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>
          {g.category}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {g.items.map(s => <span key={s} className="tag">{s}</span>)}
      </div>
    </div>
  );
}

export default function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <section id="skills" className="py-14 md:py-20" style={{ background:"var(--bg)" }}>
      <div className="wrap">
        <SectionHeader label="Technical Expertise" title="Skills & Technologies"
          subtitle="Tools and technologies I use to build AI-powered software solutions."/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((g,i) => <Card key={g.id ?? i} g={g} delay={i * 60}/>)}
        </div>
      </div>
    </section>
  );
}
