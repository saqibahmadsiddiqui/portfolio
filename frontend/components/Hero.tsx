"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Mail, Github, Linkedin, Twitter, Download, ArrowDown } from "lucide-react";
import { useProfile, useTheme } from "./Providers";

function hexToRgb(hex: string) {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  } catch { return "59,130,246"; }
}

function NetworkSVG() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity:.04 }} aria-hidden>
      {[20,35,50,65,80].map(y=><line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="var(--accent)" strokeWidth=".5" strokeDasharray="4 14"/>)}
      {[15,30,50,70,85].map(x=><line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="var(--accent3)" strokeWidth=".4" strokeDasharray="3 16"/>)}
      {[20,50,80].map(y=>[15,50,85].map(x=><circle key={`${x}${y}`} cx={`${x}%`} cy={`${y}%`} r="1.5" fill="var(--accent)" opacity=".5"/>))}
    </svg>
  );
}

export default function Hero() {
  const profile = useProfile();
  const theme   = useTheme();
  const [mounted, setMounted] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const locRef  = useRef<HTMLDivElement>(null);
  const [photoH, setPhotoH] = useState<number|undefined>(undefined);
  const [photoW, setPhotoW] = useState("clamp(140px,26vw,190px)");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const measure = () => {
      if (nameRef.current && locRef.current && window.innerWidth >= 1024) {
        const top    = nameRef.current.getBoundingClientRect().top;
        const bottom = locRef.current.getBoundingClientRect().bottom;
        const h = bottom - top;
        if (h > 80) { setPhotoH(h); setPhotoW(`${Math.round(h * 0.75)}px`); }
      } else { setPhotoH(undefined); setPhotoW("clamp(140px,26vw,190px)"); }
    };
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [mounted, profile]);

  const fi = (d = 0): React.CSSProperties => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition:`opacity .6s ease ${d}ms, transform .6s ease ${d}ms`,
  });

  const tokens = profile.animation_tokens || [];
  const clrs   = ["b","c","p"] as const;

  const mkPill = (i: number): React.CSSProperties => {
    const key = clrs[i % 3];
    const hex = key === "b" ? theme.accent : key === "c" ? theme.accent2 : theme.accent3;
    const rgb = hexToRgb(hex);
    return {
      fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", letterSpacing:"0.02em",
      color:`rgba(${rgb},0.82)`, border:`1px solid rgba(${rgb},0.22)`, background:`rgba(${rgb},0.07)`,
      padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap",
      pointerEvents:"none", userSelect:"none", position:"absolute",
    };
  };

  const half  = Math.ceil(tokens.length / 2);
  const leftT = tokens.slice(0, half);
  const rightT= tokens.slice(half);
  const toPct = (arr: string[]) => arr.map((_,i) => `${Math.round((i/arr.length)*85+5)}%`);
  const leftPcts  = toPct(leftT);
  const rightPcts = toPct(rightT);
  const hOffL = ["10%","55%","25%","70%","15%","60%","35%","50%"];
  const hOffR = ["15%","55%","25%","65%","10%","45%","30%","60%"];

  const tabTokens = tokens.map((t,i) => ({
    label:t, top:`${Math.round((i/tokens.length)*80+8)}%`,
    fromRight:i%2===1, delay:(i*1.3)%9, dur:11+(i%5), colorIdx:i,
  }));

  const links = profile.links;
  const accentRgb = hexToRgb(theme.accent);

  return (
    <section id="about" className="relative dots overflow-hidden"
      style={{ background:`linear-gradient(155deg,${theme.bg2} 0%,${theme.bg} 50%,${theme.bg} 100%)`, paddingTop:"64px" }}>

      <NetworkSVG />

      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:`radial-gradient(circle,rgba(${accentRgb},0.12),transparent 70%)`, animation:"pulseGlow 5s ease-in-out infinite" }}/>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:`radial-gradient(circle,rgba(${hexToRgb(theme.accent3)},0.08),transparent 70%)`, animation:"pulseGlow 5s ease-in-out infinite 2.5s" }}/>

      {/* Spinning ring — desktop only */}
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden xl:block"
        width="680" height="680" style={{ opacity:.03, animation:"spinSlow 80s linear infinite" }} aria-hidden>
        <circle cx="340" cy="340" r="310" stroke={theme.accent}  strokeWidth="1"  fill="none" strokeDasharray="8 24"/>
        <circle cx="340" cy="340" r="210" stroke={theme.accent3} strokeWidth=".5" fill="none" strokeDasharray="4 18"/>
        <circle cx="340" cy="340" r="130" stroke={theme.accent2} strokeWidth=".4" fill="none" strokeDasharray="3 14"/>
      </svg>

      {/* Desktop xl+: vertical strips left */}
      <div className="hidden xl:block absolute left-0 top-0 bottom-0 pointer-events-none overflow-hidden"
        style={{ width:"calc((100vw - 900px) / 2 + 20px)", zIndex:1 }}>
        {leftT.map((t,i)=>(
          <span key={i} style={{ ...mkPill(i), left:hOffL[i%hOffL.length], top:leftPcts[i],
            animation:`floatUpSide ${11+(i%5)}s ease-in-out ${(i*1.4)%9}s infinite` }}>{t}</span>
        ))}
      </div>

      {/* Desktop xl+: vertical strips right */}
      <div className="hidden xl:block absolute right-0 top-0 bottom-0 pointer-events-none overflow-hidden"
        style={{ width:"calc((100vw - 900px) / 2 + 20px)", zIndex:1 }}>
        {rightT.map((t,i)=>(
          <span key={i} style={{ ...mkPill(i+half), right:hOffR[i%hOffR.length], top:rightPcts[i],
            animation:`floatDownSide ${11+(i%5)}s ease-in-out ${(i*1.6)%9}s infinite` }}>{t}</span>
        ))}
      </div>

      {/* Tablet md–xl: horizontal drift */}
      {tabTokens.map((t,i)=>(
        <span key={`tab${i}`} className="hidden md:block xl:hidden" style={{
          ...mkPill(t.colorIdx), top:t.top,
          left:  t.fromRight ? "auto" : "-150px",
          right: t.fromRight ? "-150px" : "auto",
          animation:`driftH ${t.dur}s linear ${t.delay}s infinite`,
          animationDirection: t.fromRight ? "reverse" : "normal",
          zIndex:1,
        }}>{t.label}</span>
      ))}

      {/* Content */}
      <div className="hero-wrap relative z-10 w-full pt-8 pb-10 md:pt-10 md:pb-12">
        <div style={fi(0)} className="flex flex-col md:flex-row items-center md:items-start gap-7 md:gap-8 lg:gap-12">

          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-2xl"
                style={{ background:`linear-gradient(135deg,rgba(${accentRgb},0.45),rgba(${hexToRgb(theme.accent3)},0.35))` }}/>
              <div className="absolute -inset-3 rounded-2xl pointer-events-none"
                style={{ background:`linear-gradient(135deg,rgba(${accentRgb},0.1),rgba(${hexToRgb(theme.accent3)},0.07))`, filter:"blur(14px)" }}/>
              <div className="relative overflow-hidden" style={{
                width:  photoH ? photoW : "clamp(140px,26vw,190px)",
                height: photoH ? `${photoH}px` : "clamp(190px,35vw,260px)",
                borderRadius:"14px", boxShadow:"0 20px 50px rgba(0,0,0,0.55)",
                transition:"width .3s ease, height .3s ease",
              }}>
                <img src="/Picture.jpeg" alt={profile.name} className="w-full h-full object-cover object-top"/>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 text-center md:text-left w-full">
            <div style={fi(80)}>
              <h1 ref={nameRef} className="leading-tight mb-1.5 break-words"
                style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"clamp(1.7rem,3.8vw,2.8rem)", color:"var(--text1)", letterSpacing:"-0.02em" }}>
                {profile.name.includes(" ") ? (
                  <>
                    {profile.name.split(" ").slice(0,-1).join(" ")}<br/>
                    <span className="grad">
                      {profile.name.split(" ").slice(-1)[0]}
                    </span>
                  </>
                ) : (
                  <span className="grad">{profile.name}</span>
                )}
              </h1>
              <p className="font-medium mb-3" style={{ color:"var(--text2)", fontSize:"clamp(.85rem,1.6vw,.95rem)", fontFamily:"'DM Sans',sans-serif" }}>
                {profile.tagline}
              </p>
              <p className="leading-relaxed mb-4 mx-auto md:mx-0"
                style={{ color:"var(--text3)", fontSize:"13.5px", maxWidth:"400px", fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>
                {profile.bio}
              </p>
            </div>

            <div style={fi(160)}>
              <div ref={locRef} className="flex flex-wrap justify-center md:justify-start gap-3 mb-4 text-sm"
                style={{ color:"var(--text3)", fontFamily:"'DM Sans',sans-serif" }}>
                {profile.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={12}/>{profile.location}</span>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`}
                    className="hidden sm:flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    style={{ color:"var(--text3)" }}>
                    <Mail size={12}/>{profile.email}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <a href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background:"var(--accent)", boxShadow:`0 0 18px rgba(${accentRgb},0.22)`, fontFamily:"'DM Sans',sans-serif" }}>
                  Get In Touch
                </a>
                <a href={profile.resume_url || "/resume.pdf"} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ color:"var(--text2)", border:"1px solid var(--border)", background:`rgba(${accentRgb},0.05)`, fontFamily:"'DM Sans',sans-serif" }}>
                  <Download size={13}/>Download CV
                </a>
              </div>

              <div className="flex justify-center md:justify-start gap-2">
                {[
                  { href:links.linkedin,                         icon:<Linkedin size={14}/>, show:!!links.linkedin },
                  { href:links.github,                           icon:<Github size={14}/>,   show:!!links.github   },
                  { href:links.twitter,                          icon:<Twitter size={14}/>,  show:!!links.twitter  },
                  { href:`mailto:${profile.email}`,              icon:<Mail size={14}/>,     show:!!profile.email  },
                ].filter(s=>s.show).map(({ href, icon },i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ background:`rgba(${accentRgb},0.07)`, border:"1px solid var(--border)", color:"var(--text3)" }}
                    onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--accent)"; el.style.borderColor=`rgba(${accentRgb},0.4)`; }}
                    onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color="var(--text3)"; el.style.borderColor="var(--border)"; }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {profile.stats && profile.stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8" style={fi(240)}>
            {profile.stats.map(({v,l,s}:{v:string;l:string;s:string})=>(
              <div key={l} className="card p-3 sm:p-4 text-center">
                <p className="grad mb-0.5 font-bold" style={{ fontFamily:"'Inter',sans-serif", fontSize:"clamp(1.1rem,2.2vw,1.4rem)" }}>{v}</p>
                <p className="font-medium text-xs text-white mb-0.5" style={{ fontFamily:"'DM Sans',sans-serif" }}>{l}</p>
                <p className="text-xs" style={{ color:"var(--text3)", fontFamily:"'JetBrains Mono',monospace" }}>{s}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <a href="#skills" className="flex justify-center pb-5 z-10 opacity-20 hover:opacity-50 transition-opacity">
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:".15em", color:"var(--text3)" }}>SCROLL</span>
          <ArrowDown size={11} style={{ color:"var(--text3)" }}/>
        </div>
      </a>
    </section>
  );
}
