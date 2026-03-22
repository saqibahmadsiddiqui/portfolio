"use client";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, Award } from "lucide-react";
import SectionHeader from "./SectionHeader";

type EduType  = { id?: string; degree: string; institution: string; duration: string; status: string; gpa: string };
type CertType = { id?: string; title: string; issuer: string } | string;

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold:.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

export default function Education({ education, certifications }:
  { education: EduType[]; certifications: CertType[] }) {
  const a = useReveal();
  const b = useReveal();

  const getTitle = (c: CertType) => typeof c === "string" ? c : c.title;
  const getSub   = (c: CertType) => typeof c === "string" ? "" : c.issuer;

  return (
    <section id="education" className="py-14 md:py-20" style={{ background:"var(--bg2)" }}>
      <div className="wrap">
        <SectionHeader label="Academic Background" title="Education & Certifications"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Education */}
          <div ref={a.ref} className="card p-5" style={{
            opacity:   a.vis ? 1 : 0,
            transform: a.vis ? "translateY(0)" : "translateY(14px)",
            transition:"opacity .55s ease, transform .55s ease, border-color .3s, box-shadow .3s",
          }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:"color-mix(in srgb,var(--accent) 15%,transparent)" }}>
                <GraduationCap size={16} style={{ color:"var(--accent)" }}/>
              </div>
              <h3 className="font-bold text-sm" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>Education</h3>
            </div>
            {education.map((e,i) => (
              <div key={e.id ?? i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ background:`linear-gradient(135deg,var(--accent),var(--accent3))` }}/>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm mb-0.5" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>{e.degree}</h4>
                  <p className="font-semibold text-xs mb-1"
                    style={{ background:"linear-gradient(135deg,var(--accent),var(--accent2))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontFamily:"'DM Sans',sans-serif" }}>
                    {e.institution}
                  </p>
                  <p className="mono text-xs mb-2" style={{ color:"var(--text3)" }}>{e.duration} · {e.status}</p>
                  <span className="tag">{e.gpa}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div ref={b.ref} className="card p-5" style={{
            opacity:   b.vis ? 1 : 0,
            transform: b.vis ? "translateY(0)" : "translateY(14px)",
            transition:"opacity .55s ease .12s, transform .55s ease .12s, border-color .3s, box-shadow .3s",
          }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:"color-mix(in srgb,var(--accent3) 15%,transparent)" }}>
                <Award size={16} style={{ color:"var(--accent3)" }}/>
              </div>
              <h3 className="font-bold text-sm" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>Certifications</h3>
            </div>
            <ul className="space-y-3">
              {certifications.map((c,i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background:"color-mix(in srgb,var(--accent3) 12%,transparent)", border:"1px solid color-mix(in srgb,var(--accent3) 20%,transparent)" }}>
                    <span className="mono text-xs font-bold" style={{ color:"var(--accent3)" }}>
                      {String(i+1).padStart(2,"0")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed" style={{ color:"var(--text2)" }}>{getTitle(c)}</p>
                    {getSub(c) && <p className="mono text-xs mt-0.5" style={{ color:"var(--text3)" }}>{getSub(c)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
