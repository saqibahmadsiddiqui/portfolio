"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Shield, Loader2,
  CheckCircle, AlertCircle, User, Palette, Link as LinkIcon,
} from "lucide-react";
import {
  adminUpdateProfile, adminUpdateTheme,
  adminAddSkill, adminUpdateSkill, adminDeleteSkill,
  adminAddExp, adminUpdateExp, adminDeleteExp,
  adminAddProject, adminUpdateProject, adminDeleteProject,
  adminUpdateEducation,
} from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
type Toast = { msg: string; ok: boolean };
type Tab   = "profile"|"theme"|"files"|"skills"|"experience"|"projects"|"education";
const inputCls = "input text-sm w-full";

// ── Shared Button ─────────────────────────────────────────────────────────────
function Btn({ onClick, children, color="blue", disabled=false, small=false }: any) {
  const m: any = {
    blue:  { bg:"color-mix(in srgb,var(--accent) 10%,transparent)",  border:"color-mix(in srgb,var(--accent) 30%,transparent)",  text:"var(--accent)"  },
    red:   { bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.3)",  text:"#f87171" },
    green: { bg:"rgba(34,197,94,0.1)",  border:"rgba(34,197,94,0.3)",  text:"#4ade80" },
  };
  const s = m[color]||m.blue;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${small?"px-2.5 py-1.5 text-xs":"px-3 py-2 text-sm"}`}
      style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.text, fontFamily:"'DM Sans',sans-serif" }}>
      {children}
    </button>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin:(s:string)=>void }) {
  const [v, setV]             = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const verify = async () => {
    if (!v.trim()) return;
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/api/admin/verify`,{
        method:"POST", headers:{"Content-Type":"application/json","X-Admin-Secret":v},
      });
      if (r.ok) onLogin(v);
      else setError("Invalid secret. Access denied.");
    } catch { setError("Could not reach the server."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--bg)" }}>
      <div className="card p-8 w-full max-w-sm text-center">
        <Shield size={32} className="mx-auto mb-4" style={{ color:"var(--accent)" }}/>
        <h1 className="mb-2" style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"1.2rem", color:"var(--text1)" }}>Admin Dashboard</h1>
        <p className="text-sm mb-5" style={{ color:"var(--text2)" }}>Enter your admin secret to continue</p>
        <input type="password" className="input mb-3" placeholder="Admin secret…" value={v}
          onChange={e=>{ setV(e.target.value); setError(""); }}
          onKeyDown={e=>{ if(e.key==="Enter") verify(); }}/>
        {error && <p className="text-xs mb-3 text-left px-1" style={{ color:"#f87171" }}>{error}</p>}
        <button onClick={verify} disabled={loading||!v.trim()}
          className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><Loader2 size={13} className="animate-spin"/>Verifying…</> : "Unlock"}
        </button>
      </div>
    </div>
  );
}

// ── Profile Panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [name,     setName]     = useState("");
  const [tagline,  setTagline]  = useState("");
  const [bio,      setBio]      = useState("");
  const [location, setLocation] = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [navBrand, setNavBrand] = useState("Portfolio//;");
  const [github,   setGithub]   = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter,  setTwitter]  = useState("");
  const [website,  setWebsite]  = useState("");
  const [tokens,   setTokens]   = useState("");
  const [pageTitle,setPageTitle]= useState("");
  const [openToWork,setOpenToWork]=useState(true);
  const [openToWorkText,setOpenToWorkText]=useState("");
  const [stats,    setStats]    = useState<{v:string;l:string;s:string}[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/profile`);
      const d = await r.json();
      if (d.name) {
        setName(d.name||""); setTagline(d.tagline||""); setBio(d.bio||"");
        setLocation(d.location||""); setEmail(d.email||""); setPhone(d.phone||"");
setNavBrand(d.navbar_brand||"Portfolio//;");
        const l = d.links||{};
        setGithub(l.github||""); setLinkedin(l.linkedin||"");
        setTwitter(l.twitter||""); setWebsite(l.website||"");
        setTokens((d.animation_tokens||[]).join(", "));
        setPageTitle(d.page_title||""); setOpenToWork(d.open_to_work!==false);
        setOpenToWorkText(d.open_to_work_text||""); setStats(d.stats||[]);
      }
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateProfile(secret, {
        name, tagline, bio, location, email, phone,
        navbar_brand: navBrand,
        links: { github, linkedin, twitter, website },
        animation_tokens: tokens.split(",").map((s:string)=>s.trim()).filter(Boolean),
        page_title: pageTitle,
        open_to_work: openToWork,
        open_to_work_text: openToWorkText,
        stats,
      });
      toast({ msg:"Profile updated! Refresh the site to see changes.", ok:true });
    } catch(e:any) { toast({ msg:e.message, ok:false }); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color:"var(--accent)" }}/></div>;

  return (
    <div className="space-y-5">
      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm flex items-center gap-2" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>
          <User size={14} style={{ color:"var(--accent)" }}/> Basic Info
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label block mb-1.5">Full Name</label><input className={inputCls} value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe"/></div>
          <div><label className="label block mb-1.5">Tagline</label><input className={inputCls} value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="AI & Software Engineer"/></div>
        </div>
        <div><label className="label block mb-1.5">Bio / About</label><textarea className={inputCls} rows={4} value={bio} onChange={e=>setBio(e.target.value)} style={{resize:"vertical"}}/></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label block mb-1.5">Location</label><input className={inputCls} value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, Country"/></div>
          <div><label className="label block mb-1.5">Email</label><input className={inputCls} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label block mb-1.5">Phone</label><input className={inputCls} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 234 567 8900"/></div>
  
        </div>
        <div><label className="label block mb-1.5">Navbar Brand (e.g. John//;)</label><input className={inputCls} value={navBrand} onChange={e=>setNavBrand(e.target.value)} placeholder="Portfolio//;"/></div>
      </div>

      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm flex items-center gap-2" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>
          <LinkIcon size={14} style={{ color:"var(--accent)" }}/> Social Links
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label block mb-1.5">GitHub URL</label><input className={inputCls} value={github} onChange={e=>setGithub(e.target.value)} placeholder="https://github.com/username"/></div>
          <div><label className="label block mb-1.5">LinkedIn URL</label><input className={inputCls} value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username"/></div>
          <div><label className="label block mb-1.5">Twitter / X URL</label><input className={inputCls} value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="https://twitter.com/username"/></div>
          <div><label className="label block mb-1.5">Website URL</label><input className={inputCls} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yoursite.com"/></div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>
          ✦ Animation Tokens
        </p>
        <p className="text-xs" style={{ color:"var(--text3)" }}>Comma-separated skills/code snippets floating in the hero background</p>
        <textarea className={inputCls} rows={3} value={tokens} onChange={e=>setTokens(e.target.value)}
          placeholder="Python, FastAPI, import numpy as np, model.fit(X,y), MLOps…" style={{resize:"vertical"}}/>
      </div>

      {/* Page Title */}
      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🏷️ Browser Tab Title</p>
        <p className="text-xs" style={{color:"var(--text3)"}}>The text shown in the browser tab and search results</p>
        <input className={inputCls} value={pageTitle} onChange={e=>setPageTitle(e.target.value)} placeholder="John Doe | AI Engineer"/>
      </div>

      {/* Open to work */}
      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🟢 Availability Status</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={openToWork} onChange={e=>setOpenToWork(e.target.checked)}/>
          <span className="text-sm font-medium" style={{color:"var(--text2)"}}>Show "Open to opportunities" in contact section</span>
        </label>
        {openToWork && (
          <div>
            <label className="label block mb-1.5">Status subtext</label>
            <input className={inputCls} value={openToWorkText} onChange={e=>setOpenToWorkText(e.target.value)} placeholder="Available for full-time, internships, and freelance..."/>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>📊 Hero Stats (CGPA, Projects, etc.)</p>
          <Btn onClick={()=>setStats(s=>[...s,{v:"",l:"",s:""}])} small><Plus size={11}/>Add</Btn>
        </div>
        <p className="text-xs" style={{color:"var(--text3)"}}>Shown as stat cards below the hero content. Leave empty to hide.</p>
        {stats.map((st,i)=>(
          <div key={i} className="flex gap-2 items-center">
            <input className={inputCls} value={st.v} onChange={e=>setStats(s=>{const n=[...s];n[i]={...n[i],v:e.target.value};return n;})} placeholder="Value (3.9)" style={{maxWidth:"80px"}}/>
            <input className={inputCls} value={st.l} onChange={e=>setStats(s=>{const n=[...s];n[i]={...n[i],l:e.target.value};return n;})} placeholder="Label (CGPA)"/>
            <input className={inputCls} value={st.s} onChange={e=>setStats(s=>{const n=[...s];n[i]={...n[i],s:e.target.value};return n;})} placeholder="Sub (out of 4.0)"/>
            <button onClick={()=>setStats(s=>s.filter((_,j)=>j!==i))} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}>
              <X size={12}/>
            </button>
          </div>
        ))}
      </div>

      <Btn onClick={save} color="green" disabled={saving}>
        {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}
        {saving?"Saving…":"Save Profile"}
      </Btn>
    </div>
  );
}

// ── Theme Panel ───────────────────────────────────────────────────────────────
const PRESETS = [
  { name:"Blue (Default)", accent:"#3b82f6", accent2:"#06b6d4", accent3:"#6366f1" },
  { name:"Emerald",        accent:"#10b981", accent2:"#06b6d4", accent3:"#3b82f6" },
  { name:"Rose",           accent:"#f43f5e", accent2:"#fb923c", accent3:"#a855f7" },
  { name:"Violet",         accent:"#8b5cf6", accent2:"#a78bfa", accent3:"#06b6d4" },
  { name:"Amber",          accent:"#f59e0b", accent2:"#fbbf24", accent3:"#10b981" },
  { name:"Cyan",           accent:"#06b6d4", accent2:"#22d3ee", accent3:"#3b82f6" },
];

function ThemePanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [accent,   setAccent]  = useState("#3b82f6");
  const [accent2,  setAccent2] = useState("#06b6d4");
  const [accent3,  setAccent3] = useState("#6366f1");
  const [bg,       setBg]      = useState("#04070f");
  const [bg2,      setBg2]     = useState("#070d1a");
  const [surface,  setSurface] = useState("#0c1424");
  const [surface2, setSurface2]= useState("#111e33");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/theme`);
      const d = await r.json();
      if (d.accent) {
        setAccent(d.accent); setAccent2(d.accent2); setAccent3(d.accent3);
        setBg(d.bg); setBg2(d.bg2); setSurface(d.surface); setSurface2(d.surface2);
      }
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const applyLive = (a=accent,a2=accent2,a3=accent3,b=bg,b2=bg2,s=surface,s2=surface2) => {
    const root = document.documentElement;
    root.style.setProperty("--accent",   a);
    root.style.setProperty("--accent2",  a2);
    root.style.setProperty("--accent3",  a3);
    root.style.setProperty("--bg",       b);
    root.style.setProperty("--bg2",      b2);
    root.style.setProperty("--surface",  s);
    root.style.setProperty("--surface2", s2);
    root.style.setProperty("--border",   `color-mix(in srgb, ${a} 12%, transparent)`);
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setAccent(p.accent); setAccent2(p.accent2); setAccent3(p.accent3);
    applyLive(p.accent, p.accent2, p.accent3);
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateTheme(secret, { accent, accent2, accent3, bg, bg2, surface, surface2 });
      applyLive();
      toast({ msg:"Theme saved! Changes applied live.", ok:true });
    } catch(e:any) { toast({ msg:e.message, ok:false }); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color:"var(--accent)" }}/></div>;

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <p className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>
          <Palette size={14} style={{ color:"var(--accent)" }}/> Color Presets
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map(p=>(
            <button key={p.name} onClick={()=>applyPreset(p)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text2)", fontFamily:"'DM Sans',sans-serif" }}>
              <span className="flex gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background:p.accent }}/>
                <span className="w-3 h-3 rounded-full" style={{ background:p.accent2 }}/>
                <span className="w-3 h-3 rounded-full" style={{ background:p.accent3 }}/>
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>Custom Colors</p>
        <p className="text-xs" style={{ color:"var(--text3)" }}>Background stays dark. Only accent colors change.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label:"Primary Accent",   val:accent,  set:setAccent,  hint:"Buttons, links, highlights" },
            { label:"Secondary Accent", val:accent2, set:setAccent2, hint:"Gradients, tags" },
            { label:"Tertiary Accent",  val:accent3, set:setAccent3, hint:"Rings, borders" },
          ].map(({ label, val, set, hint })=>(
            <div key={label}>
              <label className="label block mb-1.5">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={val} onChange={e=>{ set(e.target.value); applyLive(accent,accent2,accent3); }}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" style={{ padding:"2px" }}/>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)} style={{ maxWidth:"110px" }}/>
              </div>
              <p className="text-xs mt-1" style={{ color:"var(--text3)" }}>{hint}</p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor:"var(--border)" }}>
          {[
            { label:"Background",   val:bg,       set:setBg       },
            { label:"Background 2", val:bg2,      set:setBg2      },
            { label:"Surface",      val:surface,  set:setSurface  },
            { label:"Surface 2",    val:surface2, set:setSurface2 },
          ].map(({ label, val, set })=>(
            <div key={label}>
              <label className="label block mb-1.5">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={val} onChange={e=>set(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" style={{ padding:"2px" }}/>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)} style={{ maxWidth:"110px" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview swatch */}
      <div className="card p-4">
        <p className="label mb-3">Live Preview</p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background:accent }}> Primary Button</div>
          <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background:`${accent}15`, color:accent2, border:`1px solid ${accent}30` }}>Ghost Button</div>
          <span className="px-2 py-1 rounded-full text-xs" style={{ background:`${accent}10`, color:accent2, border:`1px solid ${accent}20`, fontFamily:"'JetBrains Mono',monospace" }}>tag</span>
          <span style={{ background:`linear-gradient(135deg,${accent},${accent2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"1.1rem" }}>Name</span>
        </div>
      </div>

      <Btn onClick={save} color="green" disabled={saving}>
        {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}
        {saving?"Saving…":"Save Theme"}
      </Btn>
    </div>
  );
}


// ── Files Panel ───────────────────────────────────────────────────────────────
function FilesPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [picUploading,  setPicUploading]  = useState(false);
  const [resUploading,  setResUploading]  = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [picPreview,    setPicPreview]    = useState<string|null>(null);

  const upload = async (file: File, type: string, setLoading: (v:boolean)=>void) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const r = await fetch("/api/upload", { method:"POST", headers:{"x-admin-secret":secret}, body:fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Upload failed");
      toast({ msg:`${type === "picture" ? "Photo" : type === "resume" ? "Resume" : "Icon"} updated! Refresh to see changes.`, ok:true });
    } catch(e:any) { toast({ msg:e.message, ok:false }); }
    setLoading(false);
  };

  const handleFile = (type: string, setLoading: (v:boolean)=>void, accept: string) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = accept;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (type === "picture") {
        const url = URL.createObjectURL(file);
        setPicPreview(url);
      }
      await upload(file, type, setLoading);
    };
    input.click();
  };

  return (
    <div className="space-y-5">
      {/* Profile Photo */}
      <div className="card p-5">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>Profile Photo</p>
        <p className="text-xs mb-4" style={{color:"var(--text3)"}}>Recommended: <strong style={{color:"var(--accent)"}}>600 × 800 px</strong> (3:4 ratio) · JPEG or PNG · max 5MB. Saved as <code>Picture.jpeg</code></p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0" style={{border:"1px solid var(--border)"}}>
            <img src={picPreview || "/Picture.jpeg"} alt="Current photo" className="w-full h-full object-cover object-top"
              onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          </div>
          <div>
            <Btn onClick={()=>handleFile("picture",setPicUploading,"image/jpeg,image/png,image/webp")} disabled={picUploading}>
              {picUploading?<><Loader2 size={13} className="animate-spin"/>Uploading…</>:<><span>📷</span>Upload Photo</>}
            </Btn>
            <p className="text-xs mt-2" style={{color:"var(--text3)"}}>Replaces the current photo immediately.</p>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="card p-5">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>Resume / CV</p>
        <p className="text-xs mb-4" style={{color:"var(--text3)"}}>Upload your CV as PDF. Saved as <code>resume.pdf</code> — the Download CV button will serve this file.</p>
        <div className="flex items-center gap-3">
          <Btn onClick={()=>handleFile("resume",setResUploading,"application/pdf")} disabled={resUploading}>
            {resUploading?<><Loader2 size={13} className="animate-spin"/>Uploading…</>:<><span>📄</span>Upload Resume PDF</>}
          </Btn>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="text-xs" style={{color:"var(--accent)"}}>
            View current →
          </a>
        </div>
      </div>

      {/* Icon */}
      <div className="card p-5">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>Browser Tab Icon</p>
        <p className="text-xs mb-4" style={{color:"var(--text3)"}}>Upload an SVG icon. Saved as <code>icon.svg</code> — shown in the browser tab next to your name.</p>
        <Btn onClick={()=>handleFile("icon",setIconUploading,"image/svg+xml")} disabled={iconUploading}>
          {iconUploading?<><Loader2 size={13} className="animate-spin"/>Uploading…</>:<><span>🎨</span>Upload Icon SVG</>}
        </Btn>
      </div>
    </div>
  );
}

// ── Skills Panel ──────────────────────────────────────────────────────────────
function SkillsPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [items,    setItems]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<string|null>(null);
  const [category, setCategory] = useState("");
  const [icon,     setIcon]     = useState("code");
  const [skillItems,setSkillItems]=useState("");

  const load = useCallback(async()=>{ setLoading(true); const r=await fetch(`${API}/api/skills`); setItems(await r.json()); setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);
  const cancel=()=>{ setEditing(null); setCategory(""); setIcon("code"); setSkillItems(""); };
  const startEdit=(it:any)=>{ setEditing(it.id); setCategory(it.category); setIcon(it.icon); setSkillItems(it.items.join(", ")); };
  const toBody=()=>({ category, icon, items:skillItems.split(",").map((s:string)=>s.trim()).filter(Boolean) });
  const save=async(id?:string)=>{ try { if(id) await adminUpdateSkill(secret,id,toBody()); else await adminAddSkill(secret,toBody()); toast({msg:`Skill ${id?"updated":"added"}!`,ok:true}); cancel(); load(); } catch(e:any){toast({msg:e.message,ok:false});} };
  const del=async(id:string)=>{ if(!confirm("Delete?")) return; try{await adminDeleteSkill(secret,id);toast({msg:"Deleted!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});} };

  return (
    <div className="space-y-4">
      {editing==="new"?(
        <div className="card p-5 space-y-3" style={{borderColor:"color-mix(in srgb,var(--accent) 30%,transparent)"}}>
          <p className="font-bold text-sm" style={{color:"var(--text1)"}}>New Skill Group</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label block mb-1.5">Category</label><input className={inputCls} value={category} onChange={e=>setCategory(e.target.value)} placeholder="AI / ML"/></div>
            <div><label className="label block mb-1.5">Icon (code/brain/globe/database/tool)</label><input className={inputCls} value={icon} onChange={e=>setIcon(e.target.value)}/></div>
          </div>
          <div><label className="label block mb-1.5">Skills (comma-separated)</label><input className={inputCls} value={skillItems} onChange={e=>setSkillItems(e.target.value)} placeholder="Python, FastAPI…"/></div>
          <div className="flex gap-2"><Btn onClick={()=>save()} color="green"><Save size={12}/>Save</Btn><Btn onClick={cancel} color="red"><X size={12}/>Cancel</Btn></div>
        </div>
      ):<Btn onClick={()=>{cancel();setEditing("new");}}><Plus size={13}/>Add Skill Group</Btn>}

      {loading?<div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>:
        items.map(it=>(
          <div key={it.id} className="card p-4">
            {editing===it.id?(
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="label block mb-1.5">Category</label><input className={inputCls} value={category} onChange={e=>setCategory(e.target.value)}/></div>
                  <div><label className="label block mb-1.5">Icon</label><input className={inputCls} value={icon} onChange={e=>setIcon(e.target.value)}/></div>
                </div>
                <div><label className="label block mb-1.5">Skills (comma-separated)</label><input className={inputCls} value={skillItems} onChange={e=>setSkillItems(e.target.value)}/></div>
                <div className="flex gap-2"><Btn onClick={()=>save(it.id)} color="green"><Save size={12}/>Save</Btn><Btn onClick={cancel} color="red"><X size={12}/>Cancel</Btn></div>
              </div>
            ):(
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm mb-2" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{it.category}</p>
                  <div className="flex flex-wrap gap-1.5">{it.items.map((s:string)=><span key={s} className="tag">{s}</span>)}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Btn onClick={()=>startEdit(it)} small><Pencil size={11}/>Edit</Btn>
                  <Btn onClick={()=>del(it.id)} color="red" small><Trash2 size={11}/>Del</Btn>
                </div>
              </div>
            )}
          </div>
        ))
      }
    </div>
  );
}

// ── Experience Panel ──────────────────────────────────────────────────────────
function ExpPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [role,     setRole]     = useState("");
  const [company,  setCompany]  = useState("");
  const [duration, setDuration] = useState("");
  const [type,     setType]     = useState("Internship");
  const [points,   setPoints]   = useState("");

  const load=useCallback(async()=>{ setLoading(true); const r=await fetch(`${API}/api/experience`); const d=await r.json(); setItems(d.experience||[]); setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);
  const cancel=()=>{ setEditing(null); setRole(""); setCompany(""); setDuration(""); setType("Internship"); setPoints(""); };
  const startEdit=(it:any)=>{ setEditing(it.id); setRole(it.role); setCompany(it.company); setDuration(it.duration); setType(it.type); setPoints(it.points.join("\n")); };
  const toBody=()=>({ role,company,duration,type,points:points.split("\n").map((s:string)=>s.trim()).filter(Boolean) });
  const save=async(id?:string)=>{ try{ if(id) await adminUpdateExp(secret,id,toBody()); else await adminAddExp(secret,toBody()); toast({msg:`Experience ${id?"updated":"added"}!`,ok:true}); cancel(); load(); }catch(e:any){toast({msg:e.message,ok:false});} };
  const del=async(id:string)=>{ if(!confirm("Delete?")) return; try{await adminDeleteExp(secret,id);toast({msg:"Deleted!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});} };

  const expFormJSX = (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label block mb-1.5">Role</label><input className={inputCls} value={role} onChange={e=>setRole(e.target.value)} placeholder="Software Engineer"/></div>
        <div><label className="label block mb-1.5">Company</label><input className={inputCls} value={company} onChange={e=>setCompany(e.target.value)}/></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label block mb-1.5">Duration</label><input className={inputCls} value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Jan 2024 – Present"/></div>
        <div><label className="label block mb-1.5">Type</label><input className={inputCls} value={type} onChange={e=>setType(e.target.value)} placeholder="Internship / Full-time"/></div>
      </div>
      <div><label className="label block mb-1.5">Bullet points (one per line)</label><textarea className={inputCls} rows={4} value={points} onChange={e=>setPoints(e.target.value)} style={{resize:"vertical"}}/></div>
      <div className="flex gap-2"><Btn onClick={()=>save(editing==="new"?undefined:editing||undefined)} color="green"><Save size={12}/>Save</Btn><Btn onClick={cancel} color="red"><X size={12}/>Cancel</Btn></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {editing==="new"?<div className="card p-5" style={{borderColor:"color-mix(in srgb,var(--accent) 30%,transparent)"}}><p className="font-bold text-sm mb-3" style={{color:"var(--text1)"}}>New Experience</p>{expFormJSX}</div>
      :<Btn onClick={()=>{cancel();setEditing("new");}}><Plus size={13}/>Add Experience</Btn>}
      {loading?<div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>:
        items.map(it=><div key={it.id} className="card p-4">{editing===it.id?expFormJSX:(
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{it.role}</p>
              <p className="text-xs mb-1" style={{color:"var(--accent)",fontFamily:"'DM Sans',sans-serif"}}>{it.company}</p>
              <p className="mono text-xs" style={{color:"var(--text3)"}}>{it.duration} · {it.type}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0"><Btn onClick={()=>startEdit(it)} small><Pencil size={11}/>Edit</Btn><Btn onClick={()=>del(it.id)} color="red" small><Trash2 size={11}/>Del</Btn></div>
          </div>
        )}</div>)
      }
    </div>
  );
}

// ── Projects Panel ────────────────────────────────────────────────────────────
function ProjPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [tags,     setTags]     = useState("");
  const [github,   setGithub]   = useState("");
  const [live,     setLive]     = useState("");
  const [featured, setFeatured] = useState(false);

  const load=useCallback(async()=>{ setLoading(true); const r=await fetch(`${API}/api/projects`); setItems(await r.json()); setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);
  const cancel=()=>{ setEditing(null); setTitle(""); setDesc(""); setTags(""); setGithub(""); setLive(""); setFeatured(false); };
  const startEdit=(it:any)=>{ setEditing(it.id); setTitle(it.title); setDesc(it.description); setTags(it.tags.join(", ")); setGithub(it.github||""); setLive(it.live||""); setFeatured(it.featured); };
  const toBody=()=>({ title, description:desc, tags:tags.split(",").map((s:string)=>s.trim()).filter(Boolean), github:github||null, live:live||null, featured });
  const save=async(id?:string)=>{ try{ if(id) await adminUpdateProject(secret,id,toBody()); else await adminAddProject(secret,toBody()); toast({msg:`Project ${id?"updated":"added"}!`,ok:true}); cancel(); load(); }catch(e:any){toast({msg:e.message,ok:false});} };
  const del=async(id:string)=>{ if(!confirm("Delete?")) return; try{await adminDeleteProject(secret,id);toast({msg:"Deleted!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});} };

  const projFormJSX = (
    <div className="space-y-3">
      <div><label className="label block mb-1.5">Title</label><input className={inputCls} value={title} onChange={e=>setTitle(e.target.value)}/></div>
      <div><label className="label block mb-1.5">Description</label><textarea className={inputCls} rows={3} value={desc} onChange={e=>setDesc(e.target.value)} style={{resize:"vertical"}}/></div>
      <div><label className="label block mb-1.5">Tags (comma-separated)</label><input className={inputCls} value={tags} onChange={e=>setTags(e.target.value)}/></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label block mb-1.5">GitHub URL</label><input className={inputCls} value={github} onChange={e=>setGithub(e.target.value)}/></div>
        <div><label className="label block mb-1.5">Live URL</label><input className={inputCls} value={live} onChange={e=>setLive(e.target.value)}/></div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/><span className="text-sm" style={{color:"var(--text2)"}}>Featured</span></label>
      <div className="flex gap-2"><Btn onClick={()=>save(editing==="new"?undefined:editing||undefined)} color="green"><Save size={12}/>Save</Btn><Btn onClick={cancel} color="red"><X size={12}/>Cancel</Btn></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {editing==="new"?<div className="card p-5" style={{borderColor:"color-mix(in srgb,var(--accent) 30%,transparent)"}}><p className="font-bold text-sm mb-3" style={{color:"var(--text1)"}}>New Project</p>{projFormJSX}</div>
      :<Btn onClick={()=>{cancel();setEditing("new");}}><Plus size={13}/>Add Project</Btn>}
      {loading?<div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>:
        items.map(it=><div key={it.id} className="card p-4">{editing===it.id?projFormJSX:(
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{it.title}</p>
              <p className="text-xs line-clamp-2 mb-2" style={{color:"var(--text2)"}}>{it.description}</p>
              <div className="flex flex-wrap gap-1">{it.tags.slice(0,5).map((t:string)=><span key={t} className="tag">{t}</span>)}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0"><Btn onClick={()=>startEdit(it)} small><Pencil size={11}/>Edit</Btn><Btn onClick={()=>del(it.id)} color="red" small><Trash2 size={11}/>Del</Btn></div>
          </div>
        )}</div>)
      }
    </div>
  );
}

// ── Education Panel ───────────────────────────────────────────────────────────
function EduPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [data,   setData]   = useState<any>({education:[],certifications:[]});
  const [loading,setLoading]= useState(true);
  const [saving, setSaving] = useState(false);

  const load=useCallback(async()=>{ setLoading(true); const r=await fetch(`${API}/api/education`); setData(await r.json()); setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);

  const setEdu =(i:number,k:string,v:string)=>setData((d:any)=>{const e=[...d.education];  e[i]={...e[i],[k]:v};return{...d,education:e};});
  const setCert=(i:number,k:string,v:string)=>setData((d:any)=>{const c=[...d.certifications];c[i]={...c[i],[k]:v};return{...d,certifications:c};});
  const save=async()=>{ setSaving(true); try{ await adminUpdateEducation(secret,{education:data.education,certifications:data.certifications.map((c:any)=>({title:c.title||c,issuer:c.issuer||""}))}); toast({msg:"Education updated!",ok:true}); load(); }catch(e:any){toast({msg:e.message,ok:false});} setSaving(false); };

  if(loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-sm" style={{color:"var(--text1)"}}>Education Entries</p>
          <Btn onClick={()=>setData((d:any)=>({...d,education:[...d.education,{degree:"",institution:"",duration:"",status:"",gpa:""}]}))} small><Plus size={11}/>Add</Btn>
        </div>
        {data.education.map((e:any,i:number)=>(
          <div key={i} className="card p-4 mb-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label block mb-1.5">Degree</label><input className={inputCls} value={e.degree} onChange={ev=>setEdu(i,"degree",ev.target.value)}/></div>
              <div><label className="label block mb-1.5">Institution</label><input className={inputCls} value={e.institution} onChange={ev=>setEdu(i,"institution",ev.target.value)}/></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="label block mb-1.5">Duration</label><input className={inputCls} value={e.duration} onChange={ev=>setEdu(i,"duration",ev.target.value)}/></div>
              <div><label className="label block mb-1.5">Status</label><input className={inputCls} value={e.status} onChange={ev=>setEdu(i,"status",ev.target.value)}/></div>
              <div><label className="label block mb-1.5">GPA</label><input className={inputCls} value={e.gpa} onChange={ev=>setEdu(i,"gpa",ev.target.value)}/></div>
            </div>
            <Btn onClick={()=>setData((d:any)=>({...d,education:d.education.filter((_:any,j:number)=>j!==i)}))} color="red" small><Trash2 size={11}/>Remove</Btn>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-sm" style={{color:"var(--text1)"}}>Certifications</p>
          <Btn onClick={()=>setData((d:any)=>({...d,certifications:[...d.certifications,{title:"",issuer:""}]}))} small><Plus size={11}/>Add</Btn>
        </div>
        {data.certifications.map((c:any,i:number)=>(
          <div key={i} className="card p-4 mb-3 space-y-3">
            <div><label className="label block mb-1.5">Title</label><input className={inputCls} value={typeof c==="string"?c:c.title} onChange={ev=>setCert(i,"title",ev.target.value)}/></div>
            <div><label className="label block mb-1.5">Issuer</label><input className={inputCls} value={c.issuer||""} onChange={ev=>setCert(i,"issuer",ev.target.value)}/></div>
            <Btn onClick={()=>setData((d:any)=>({...d,certifications:d.certifications.filter((_:any,j:number)=>j!==i)}))} color="red" small><Trash2 size={11}/>Remove</Btn>
          </div>
        ))}
      </div>
      <Btn onClick={save} color="green" disabled={saving}>
        {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}
        {saving?"Saving…":"Save All Changes"}
      </Btn>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [secret, setSecret]    = useState("");
  const [authed, setAuthed]    = useState(false);
  const [tab,    setTab]       = useState<Tab>("profile");
  const [toast,  setToastState]= useState<Toast|null>(null);

  const showToast=(t:Toast)=>{ setToastState(t); setTimeout(()=>setToastState(null),4000); };

  const TABS: {key:Tab; label:string; icon:React.ReactNode}[] = [
    { key:"profile",    label:"Profile & Links", icon:<User size={13}/>       },
    { key:"theme",      label:"Theme & Colors",  icon:<Palette size={13}/>    },
    { key:"files",      label:"Files",           icon:<span>📁</span>          },
    { key:"skills",     label:"Skills",          icon:<span>⚡</span>          },
    { key:"experience", label:"Experience",      icon:<span>💼</span>          },
    { key:"projects",   label:"Projects",        icon:<span>🚀</span>          },
    { key:"education",  label:"Education",       icon:<span>🎓</span>          },
  ];

  if (!authed) return <Login onLogin={s=>{ setSecret(s); setAuthed(true); }}/>;

  return (
    <div className="min-h-screen" style={{ background:"var(--bg)" }}>
      <header className="sticky top-0 z-50 wrap h-14 flex items-center justify-between"
        style={{ background:"color-mix(in srgb, var(--bg) 95%, transparent)", borderBottom:"1px solid var(--border)", backdropFilter:"blur(16px)" }}>
        <div className="flex items-center gap-2">
          <Shield size={16} style={{ color:"var(--accent)" }}/>
          <span className="font-bold text-sm" style={{ color:"var(--text1)", fontFamily:"'Inter',sans-serif" }}>Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs" style={{ color:"var(--text2)" }}>← Portfolio</a>
          <button onClick={()=>{ setAuthed(false); setSecret(""); }}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background:"rgba(239,68,68,0.1)", color:"#f87171", border:"1px solid rgba(239,68,68,0.2)" }}>
            Logout
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl max-w-sm"
          style={{ background:toast.ok?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)", border:`1px solid ${toast.ok?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`, color:toast.ok?"#4ade80":"#f87171" }}>
          {toast.ok?<CheckCircle size={14}/>:<AlertCircle size={14}/>}
          {toast.msg}
        </div>
      )}

      <div className="wrap py-7">
        <div className="flex gap-2 mb-7 flex-wrap">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ fontFamily:"'DM Sans',sans-serif",
                background: tab===t.key?"color-mix(in srgb,var(--accent) 14%,transparent)":"rgba(255,255,255,0.04)",
                color:      tab===t.key?"var(--accent)":"var(--text2)",
                border:     tab===t.key?"1px solid color-mix(in srgb,var(--accent) 35%,transparent)":"1px solid rgba(255,255,255,0.06)" }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab==="profile"    && <ProfilePanel secret={secret} toast={showToast}/>}
        {tab==="theme"      && <ThemePanel   secret={secret} toast={showToast}/>}
        {tab==="files"      && <FilesPanel   secret={secret} toast={showToast}/>}
        {tab==="skills"     && <SkillsPanel  secret={secret} toast={showToast}/>}
        {tab==="experience" && <ExpPanel     secret={secret} toast={showToast}/>}
        {tab==="projects"   && <ProjPanel    secret={secret} toast={showToast}/>}
        {tab==="education"  && <EduPanel     secret={secret} toast={showToast}/>}
      </div>
    </div>
  );
}
