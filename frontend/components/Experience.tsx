"use client";
import { useEffect, useRef, useState } from "react";
import { Briefcase, CheckCircle2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

type Exp = { id?: string|number; role: string; company: string; duration: string; type: string; points: string[] };

export default function Experience({ experience }: { experience: Exp[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold:.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="experience" className="py-14 md:py-20" style={{ background:"var(--bg2)" }}>
      <div className="wrap">
        <SectionHeader label="Work History" title="Experience"
          subtitle="Professional roles where I applied technical skills in real-world environments."/>
        <div className="flex items-center gap-2 mb-5">
          <Briefcase size={13} style={{ color:"var(--accent)" }}/>
          <span className="font-semibold text-sm" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>
            Work Experience
          </span>
        </div>
        <div className="space-y-4" ref={ref}>
          {experience.map((exp, i) => (
            <div key={exp.id ?? i} className="card p-5" style={{
              opacity:   vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(14px)",
              transition:`opacity .5s ease ${i*80}ms, transform .5s ease ${i*80}ms, border-color .3s, box-shadow .3s`,
            }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>{exp.role}</h3>
                  <p className="font-semibold text-sm" style={{ background:"linear-gradient(135deg,var(--accent),var(--accent2))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontFamily:"'DM Sans',sans-serif" }}>{exp.company}</p>
                </div>
                <div className="flex sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
                  <span className="mono text-xs px-3 py-1 rounded-full"
                    style={{ background:"color-mix(in srgb,var(--accent) 10%,transparent)", color:"var(--accent)", border:"1px solid color-mix(in srgb,var(--accent) 20%,transparent)" }}>
                    {exp.type}
                  </span>
                  <span className="mono text-xs" style={{ color:"var(--text3)" }}>{exp.duration}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {exp.points.map((p,j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed" style={{ color:"var(--text2)" }}>
                    <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color:"var(--accent)", opacity:.7 }}/>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
