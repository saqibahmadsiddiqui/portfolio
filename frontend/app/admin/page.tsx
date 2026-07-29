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
import { useDarkMode, applyFullTheme } from "../../components/Providers";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
type Toast = { msg: string; ok: boolean };
type Tab   = "profile"|"theme"|"files"|"skills"|"experience"|"projects"|"education";
const inputCls = "input text-sm w-full";

function Btn({ onClick, children, color="blue", disabled=false, small=false }: any) {
  const m: any = {
    blue:  { bg:"color-mix(in srgb,var(--accent) 10%,transparent)", border:"color-mix(in srgb,var(--accent) 30%,transparent)", text:"var(--accent)" },
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
  const [v,setV]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const verify = async () => {
    if (!v.trim()) return; setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/api/admin/verify`,{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Secret":v}});
      if (r.ok) onLogin(v); else setError("Invalid secret. Access denied.");
    } catch { setError("Could not reach the server."); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--bg)"}}>
      <div className="card p-8 w-full max-w-sm text-center">
        <Shield size={32} className="mx-auto mb-4" style={{color:"var(--accent)"}}/>
        <h1 className="mb-2" style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"1.2rem",color:"var(--text1)"}}>Admin Dashboard</h1>
        <p className="text-sm mb-5" style={{color:"var(--text2)"}}>Enter your admin secret to continue</p>
        <input type="password" className="input mb-3" placeholder="Admin secret…" value={v}
          onChange={e=>{setV(e.target.value);setError("");}} onKeyDown={e=>{if(e.key==="Enter")verify();}}/>
        {error && <p className="text-xs mb-3 text-left px-1" style={{color:"#f87171"}}>{error}</p>}
        <button onClick={verify} disabled={loading||!v.trim()}
          className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          {loading?<><Loader2 size={13} className="animate-spin"/>Verifying…</>:"Unlock"}
        </button>
      </div>
    </div>
  );
}

// ── Theme Presets ─────────────────────────────────────────────────────────────
const PRESETS = [
  { name:"Ocean Pro",      id:"ocean-pro",
    accent:"#0ea5e9",accent2:"#14b8a6",accent3:"#f97316",
    dark:{bg:"#0f1520",bg2:"#141b2d",surface:"#1a2235",surface2:"#1e2a40",text1:"#f0f4ff",text2:"#8899bb",text3:"#3d5278"},
    light:{bg:"#f0f9ff",bg2:"#e0f2fe",surface:"#ffffff",surface2:"#f0f9ff",text1:"#0c1a2e",text2:"#4a5568",text3:"#9aa5b4"} },
  { name:"Midnight Steel", id:"midnight-steel",
    accent:"#3b82f6",accent2:"#60a5fa",accent3:"#ef4444",
    dark:{bg:"#090d1a",bg2:"#0d1429",surface:"#111e35",surface2:"#152240",text1:"#e8f0fe",text2:"#7b92c0",text3:"#364562"},
    light:{bg:"#f8fafc",bg2:"#f1f5f9",surface:"#ffffff",surface2:"#f8fafc",text1:"#0f172a",text2:"#475569",text3:"#94a3b8"} },
  { name:"Emerald Tech",   id:"emerald-tech",
    accent:"#10b981",accent2:"#06b6d4",accent3:"#f59e0b",
    dark:{bg:"#061512",bg2:"#0a1c18",surface:"#0f231e",surface2:"#132b24",text1:"#e8fdf5",text2:"#6db89a",text3:"#2d6b53"},
    light:{bg:"#f0fdf9",bg2:"#ccfbf1",surface:"#ffffff",surface2:"#f0fdf9",text1:"#022c22",text2:"#374151",text3:"#9ca3af"} },
  { name:"Sunset Pro",     id:"sunset-pro",
    accent:"#f97316",accent2:"#f59e0b",accent3:"#8b5cf6",
    dark:{bg:"#150e08",bg2:"#1c150e",surface:"#241c14",surface2:"#2c231a",text1:"#fef3e2",text2:"#c08b5a",text3:"#7a5535"},
    light:{bg:"#fffbeb",bg2:"#fef3c7",surface:"#ffffff",surface2:"#fffbf0",text1:"#1c0f00",text2:"#57534e",text3:"#a8a29e"} },
  { name:"Rose Elite",     id:"rose-elite",
    accent:"#f43f5e",accent2:"#fb923c",accent3:"#a78bfa",
    dark:{bg:"#150810",bg2:"#1c0f18",surface:"#241220",surface2:"#2d1628",text1:"#fde8ec",text2:"#c07a8a",text3:"#7a404e"},
    light:{bg:"#fff1f2",bg2:"#ffe4e6",surface:"#ffffff",surface2:"#fff1f2",text1:"#1c0010",text2:"#57334a",text3:"#9f6678"} },
  { name:"Arctic Pro",     id:"arctic-pro",
    accent:"#818cf8",accent2:"#a78bfa",accent3:"#34d399",
    dark:{bg:"#080c1a",bg2:"#0c1225",surface:"#101828",surface2:"#141d32",text1:"#e8eaf8",text2:"#7b82c0",text3:"#3d4062"},
    light:{bg:"#f8f8ff",bg2:"#eef2ff",surface:"#ffffff",surface2:"#f5f3ff",text1:"#0f0f2e",text2:"#4b5563",text3:"#9ca3af"} },
];
type Preset = typeof PRESETS[0];

// ── Theme Panel ───────────────────────────────────────────────────────────────
function ThemePanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const { isDark } = useDarkMode();
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [activePreset,setActivePreset]=useState("ocean-pro");
  const [accent,setAccent]=useState("#0ea5e9"); const [accent2,setAccent2]=useState("#14b8a6"); const [accent3,setAccent3]=useState("#f97316");
  const [dBg,setDBg]=useState("#0f1520"); const [dBg2,setDBg2]=useState("#141b2d");
  const [dSurf,setDSurf]=useState("#1a2235"); const [dSurf2,setDSurf2]=useState("#1e2a40");
  const [dT1,setDT1]=useState("#f0f4ff"); const [dT2,setDT2]=useState("#8899bb"); const [dT3,setDT3]=useState("#3d5278");
  const [lBg,setLBg]=useState("#f0f9ff"); const [lBg2,setLBg2]=useState("#e0f2fe");
  const [lSurf,setLSurf]=useState("#ffffff"); const [lSurf2,setLSurf2]=useState("#f0f9ff");
  const [lT1,setLT1]=useState("#0c1a2e"); const [lT2,setLT2]=useState("#4a5568"); const [lT3,setLT3]=useState("#9aa5b4");

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const r=await fetch(`${API}/api/theme`); const d=await r.json();
      if(d.accent){
        setAccent(d.accent);setAccent2(d.accent2);setAccent3(d.accent3);setActivePreset(d.preset||"custom");
        if(d.dark){setDBg(d.dark.bg);setDBg2(d.dark.bg2);setDSurf(d.dark.surface);setDSurf2(d.dark.surface2);setDT1(d.dark.text1);setDT2(d.dark.text2);setDT3(d.dark.text3);}
        if(d.light){setLBg(d.light.bg);setLBg2(d.light.bg2);setLSurf(d.light.surface);setLSurf2(d.light.surface2);setLT1(d.light.text1);setLT2(d.light.text2);setLT3(d.light.text3);}
      }
    } catch{}
    setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);

  const applyPreset=(p:Preset)=>{
    setActivePreset(p.id);
    setAccent(p.accent);setAccent2(p.accent2);setAccent3(p.accent3);
    setDBg(p.dark.bg);setDBg2(p.dark.bg2);setDSurf(p.dark.surface);setDSurf2(p.dark.surface2);
    setDT1(p.dark.text1);setDT2(p.dark.text2);setDT3(p.dark.text3);
    setLBg(p.light.bg);setLBg2(p.light.bg2);setLSurf(p.light.surface);setLSurf2(p.light.surface2);
    setLT1(p.light.text1);setLT2(p.light.text2);setLT3(p.light.text3);
    applyFullTheme({accent:p.accent,accent2:p.accent2,accent3:p.accent3,dark:p.dark,light:p.light} as any, isDark);
  };

  const buildPayload=()=>({
    accent,accent2,accent3,preset:activePreset,
    dark:{bg:dBg,bg2:dBg2,surface:dSurf,surface2:dSurf2,text1:dT1,text2:dT2,text3:dT3},
    light:{bg:lBg,bg2:lBg2,surface:lSurf,surface2:lSurf2,text1:lT1,text2:lT2,text3:lT3},
  });

  const previewLive=()=>applyFullTheme(buildPayload() as any, isDark);

  const save=async()=>{
    setSaving(true);
    try{await adminUpdateTheme(secret,buildPayload());applyFullTheme(buildPayload() as any,isDark);toast({msg:"Theme saved! Toggle light/dark in navbar to preview both modes.",ok:true});}
    catch(e:any){toast({msg:e.message,ok:false});}
    setSaving(false);
  };

  if(loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>;

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="card p-5">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🎨 Full Theme Presets</p>
        <p className="text-xs mb-4" style={{color:"var(--text3)"}}>Each preset replaces all colors for both dark and light mode at once</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESETS.map(p=>(
            <button key={p.id} onClick={()=>applyPreset(p)}
              className="relative p-3 rounded-xl text-left transition-all"
              style={{
                background:activePreset===p.id?`color-mix(in srgb,${p.accent} 10%,var(--surface2))`:"var(--surface2)",
                border:activePreset===p.id?`2px solid ${p.accent}`:"2px solid var(--border)",
              }}>
              <div className="flex gap-1.5 mb-2">
                <div className="h-4 flex-1 rounded" style={{background:p.dark.bg}}/>
                <div className="h-4 flex-1 rounded" style={{background:p.light.bg}}/>
              </div>
              <div className="flex gap-1 mb-2">
                {[p.accent,p.accent2,p.accent3].map((c,i)=><div key={i} className="w-4 h-4 rounded-full" style={{background:c}}/>)}
              </div>
              <p className="text-xs font-semibold" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</p>
              {activePreset===p.id&&<div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{background:p.accent}}><CheckCircle size={10} color="#fff"/></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>
          ✦ Accent Colors <span className="text-xs font-normal" style={{color:"var(--text3)"}}>— apply to both modes</span>
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {label:"Primary",   val:accent,  set:setAccent,  hint:"Buttons, links, hero gradient"},
            {label:"Secondary", val:accent2, set:setAccent2, hint:"Tags, teal tones, icons"},
            {label:"Highlight", val:accent3, set:setAccent3, hint:"Toggle, warm accent"},
          ].map(({label,val,set,hint})=>(
            <div key={label}>
              <label className="label block mb-1.5">{label}</label>
              <div className="flex items-center gap-2 mb-1">
                <input type="color" value={val} onChange={e=>set(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" style={{padding:"2px"}}/>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)} style={{maxWidth:"110px"}}/>
              </div>
              <p className="text-xs" style={{color:"var(--text3)"}}>{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dark Mode Colors */}
      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🌙 Dark Mode Colors</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {label:"Background",   val:dBg,    set:setDBg},
            {label:"Background 2", val:dBg2,   set:setDBg2},
            {label:"Surface",      val:dSurf,  set:setDSurf},
            {label:"Surface 2",    val:dSurf2, set:setDSurf2},
          ].map(({label,val,set})=>(
            <div key={label} className="flex items-center gap-2">
              <input type="color" value={val} onChange={e=>set(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0" style={{padding:"2px"}}/>
              <div className="flex-1 min-w-0">
                <label className="label block mb-0.5">{label}</label>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)}/>
              </div>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t" style={{borderColor:"var(--border)"}}>
          {[
            {label:"Text Primary",   val:dT1, set:setDT1},
            {label:"Text Secondary", val:dT2, set:setDT2},
            {label:"Text Muted",     val:dT3, set:setDT3},
          ].map(({label,val,set})=>(
            <div key={label} className="flex items-center gap-2">
              <input type="color" value={val} onChange={e=>set(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0" style={{padding:"2px"}}/>
              <div className="flex-1 min-w-0">
                <label className="label block mb-0.5">{label}</label>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Light Mode Colors */}
      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>☀️ Light Mode Colors</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {label:"Background",   val:lBg,    set:setLBg},
            {label:"Background 2", val:lBg2,   set:setLBg2},
            {label:"Surface",      val:lSurf,  set:setLSurf},
            {label:"Surface 2",    val:lSurf2, set:setLSurf2},
          ].map(({label,val,set})=>(
            <div key={label} className="flex items-center gap-2">
              <input type="color" value={val} onChange={e=>set(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0" style={{padding:"2px"}}/>
              <div className="flex-1 min-w-0">
                <label className="label block mb-0.5">{label}</label>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)}/>
              </div>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t" style={{borderColor:"var(--border)"}}>
          {[
            {label:"Text Primary",   val:lT1, set:setLT1},
            {label:"Text Secondary", val:lT2, set:setLT2},
            {label:"Text Muted",     val:lT3, set:setLT3},
          ].map(({label,val,set})=>(
            <div key={label} className="flex items-center gap-2">
              <input type="color" value={val} onChange={e=>set(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0" style={{padding:"2px"}}/>
              <div className="flex-1 min-w-0">
                <label className="label block mb-0.5">{label}</label>
                <input className={inputCls} value={val} onChange={e=>set(e.target.value)}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview swatch */}
      <div className="card p-4 space-y-3">
        <p className="label">Live Preview</p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{background:accent}}>Primary Button</div>
          <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{background:`${accent}15`,color:accent2,border:`1px solid ${accent}30`}}>Ghost Button</div>
          <span className="px-2 py-1 rounded-full text-xs" style={{background:`${accent}10`,color:accent2,border:`1px solid ${accent}20`,fontFamily:"'JetBrains Mono',monospace"}}>tag</span>
          <span style={{background:`linear-gradient(135deg,${accent},${accent2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"1.1rem"}}>Name</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 text-xs space-y-1" style={{background:dBg,border:`1px solid ${accent}20`}}>
            <p style={{color:dT1,fontWeight:600}}>🌙 Dark preview</p>
            <div className="rounded" style={{background:dSurf,padding:"4px 8px"}}><span style={{color:dT2}}>Surface text</span></div>
          </div>
          <div className="rounded-xl p-3 text-xs space-y-1" style={{background:lBg,border:`1px solid ${accent}20`}}>
            <p style={{color:lT1,fontWeight:600}}>☀️ Light preview</p>
            <div className="rounded" style={{background:lSurf,padding:"4px 8px",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}><span style={{color:lT2}}>Surface text</span></div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Btn onClick={previewLive}><Palette size={13}/>Preview Live</Btn>
        <Btn onClick={save} color="green" disabled={saving}>
          {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}
          {saving?"Saving…":"Save Theme"}
        </Btn>
      </div>
    </div>
  );
}

// ── Profile Panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [name,setName]=useState(""); const [tagline,setTagline]=useState(""); const [bio,setBio]=useState("");
  const [location,setLocation]=useState(""); const [email,setEmail]=useState(""); const [phone,setPhone]=useState("");
  const [navBrand,setNavBrand]=useState("Portfolio//;"); const [github,setGithub]=useState("");
  const [linkedin,setLinkedin]=useState(""); const [twitter,setTwitter]=useState(""); const [website,setWebsite]=useState("");
  const [tokens,setTokens]=useState(""); const [pageTitle,setPageTitle]=useState("");
  const [openToWork,setOpenToWork]=useState(true); const [openToWorkText,setOpenToWorkText]=useState("");
  const [stats,setStats]=useState<{v:string;l:string;s:string}[]>([]);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const r=await fetch(`${API}/api/profile`); const d=await r.json();
      if(d.name){
        setName(d.name||"");setTagline(d.tagline||"");setBio(d.bio||"");
        setLocation(d.location||"");setEmail(d.email||"");setPhone(d.phone||"");
        setNavBrand(d.navbar_brand||"Portfolio//;");
        const l=d.links||{};setGithub(l.github||"");setLinkedin(l.linkedin||"");setTwitter(l.twitter||"");setWebsite(l.website||"");
        setTokens((d.animation_tokens||[]).join(", "));
        setPageTitle(d.page_title||"");setOpenToWork(d.open_to_work!==false);setOpenToWorkText(d.open_to_work_text||"");setStats(d.stats||[]);
      }
    }catch{}
    setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);

  const save=async()=>{
    setSaving(true);
    try{
      await adminUpdateProfile(secret,{name,tagline,bio,location,email,phone,navbar_brand:navBrand,links:{github,linkedin,twitter,website},animation_tokens:tokens.split(",").map((s:string)=>s.trim()).filter(Boolean),page_title:pageTitle,open_to_work:openToWork,open_to_work_text:openToWorkText,stats});
      toast({msg:"Profile updated! Refresh the site to see changes.",ok:true});
    }catch(e:any){toast({msg:e.message,ok:false});}
    setSaving(false);
  };

  if(loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>;

  return (
    <div className="space-y-5">
      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm flex items-center gap-2" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}><User size={14} style={{color:"var(--accent)"}}/>Basic Info</p>
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
          <div><label className="label block mb-1.5">Navbar Brand (e.g. John//;)</label><input className={inputCls} value={navBrand} onChange={e=>setNavBrand(e.target.value)} placeholder="Portfolio//;"/></div>
        </div>
      </div>
      <div className="card p-5 space-y-4">
        <p className="font-bold text-sm flex items-center gap-2" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}><LinkIcon size={14} style={{color:"var(--accent)"}}/>Social Links</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label block mb-1.5">GitHub URL</label><input className={inputCls} value={github} onChange={e=>setGithub(e.target.value)} placeholder="https://github.com/username"/></div>
          <div><label className="label block mb-1.5">LinkedIn URL</label><input className={inputCls} value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username"/></div>
          <div><label className="label block mb-1.5">Twitter / X URL</label><input className={inputCls} value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="https://twitter.com/username"/></div>
          <div><label className="label block mb-1.5">Website URL</label><input className={inputCls} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yoursite.com"/></div>
        </div>
      </div>
      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🏷️ Browser Tab Title</p>
        <input className={inputCls} value={pageTitle} onChange={e=>setPageTitle(e.target.value)} placeholder="John Doe | AI Engineer"/>
      </div>
      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🟢 Availability Status</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={openToWork} onChange={e=>setOpenToWork(e.target.checked)}/>
          <span className="text-sm font-medium" style={{color:"var(--text2)"}}>Show "Open to opportunities" in contact section</span>
        </label>
        {openToWork&&<div><label className="label block mb-1.5">Status subtext</label><input className={inputCls} value={openToWorkText} onChange={e=>setOpenToWorkText(e.target.value)} placeholder="Available for full-time, internships, and freelance..."/></div>}
      </div>
      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>✦ Animation Tokens</p>
        <p className="text-xs" style={{color:"var(--text3)"}}>Comma-separated skills/code snippets floating in the hero background</p>
        <textarea className={inputCls} rows={3} value={tokens} onChange={e=>setTokens(e.target.value)} placeholder="Python, FastAPI, import numpy as np…" style={{resize:"vertical"}}/>
      </div>
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>📊 Hero Stats</p>
          <Btn onClick={()=>setStats(s=>[...s,{v:"",l:"",s:""}])} small><Plus size={11}/>Add</Btn>
        </div>
        <p className="text-xs" style={{color:"var(--text3)"}}>Stat cards below hero. Leave empty to hide all.</p>
        {stats.map((st,i)=>(
          <div key={i} className="flex gap-2 items-center">
            <input className={inputCls} value={st.v} onChange={e=>setStats(s=>{const n=[...s];n[i]={...n[i],v:e.target.value};return n;})} placeholder="3.9" style={{maxWidth:"70px"}}/>
            <input className={inputCls} value={st.l} onChange={e=>setStats(s=>{const n=[...s];n[i]={...n[i],l:e.target.value};return n;})} placeholder="CGPA"/>
            <input className={inputCls} value={st.s} onChange={e=>setStats(s=>{const n=[...s];n[i]={...n[i],s:e.target.value};return n;})} placeholder="out of 4.0"/>
            <button onClick={()=>setStats(s=>s.filter((_,j)=>j!==i))} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}><X size={12}/></button>
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

// ── Files Panel ───────────────────────────────────────────────────────────────
function FilesPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [picUploading,setPicUploading]=useState(false); const [resUploading,setResUploading]=useState(false);
  const [iconUploading,setIconUploading]=useState(false); const [picPreview,setPicPreview]=useState<string|null>(null);
  const [resStatus,setResStatus]=useState<{size:number;verified:boolean}|null>(null); const [checking,setChecking]=useState(false);

  const checkDB=async()=>{
    setChecking(true);
    try{const r=await fetch(`${API}/api/files/resume`,{cache:"no-store"});if(r.ok){const d=await r.arrayBuffer();setResStatus({size:d.byteLength,verified:true});}else setResStatus({size:0,verified:false});}
    catch{setResStatus({size:0,verified:false});}
    setChecking(false);
  };

  const upload=async(file:File,type:string,setLoading:(v:boolean)=>void)=>{
    setLoading(true);
    toast({msg:`Uploading ${file.name} (${(file.size/1024).toFixed(0)}KB)… please wait.`,ok:true});
    try{
      const fd=new FormData();fd.append("file",file);fd.append("type",type);
      const r=await fetch("/api/upload",{method:"POST",headers:{"x-admin-secret":secret},body:fd});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Upload failed");
      const label=type==="picture"?"Photo":type==="resume"?"Resume":"Icon";
      if(d.verified===false) toast({msg:"⚠️ Upload sent but verify failed. Click 'Check DB'.",ok:false});
      else {toast({msg:`✅ ${label} updated! DB size: ${((d.savedSize||0)/1024).toFixed(0)}KB`,ok:true});if(type==="resume")setResStatus({size:d.savedSize,verified:true});}
    }catch(e:any){toast({msg:e.message,ok:false});}
    setLoading(false);
  };

  const pick=(type:string,setLoading:(v:boolean)=>void,accept:string)=>{
    const input=document.createElement("input");input.type="file";input.accept=accept;
    input.onchange=async(e)=>{const file=(e.target as HTMLInputElement).files?.[0];if(!file)return;if(type==="picture")setPicPreview(URL.createObjectURL(file));await upload(file,type,setLoading);};
    input.click();
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>📷 Profile Photo</p>
        <p className="text-xs mb-4" style={{color:"var(--text3)"}}>Recommended: <strong style={{color:"var(--accent)"}}>600 × 800 px</strong> (3:4 ratio) · JPEG or PNG · max 5MB</p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0" style={{border:"1px solid var(--border)"}}>
            <img src={picPreview||"/api/picture"} alt="Current photo" className="w-full h-full object-cover object-top" onError={e=>{(e.target as HTMLImageElement).src="/Picture.jpeg";}}/>
          </div>
          <div>
            <Btn onClick={()=>pick("picture",setPicUploading,"image/jpeg,image/png,image/webp")} disabled={picUploading}>
              {picUploading?<><Loader2 size={13} className="animate-spin"/>Uploading…</>:<>📷 Upload Photo</>}
            </Btn>
            <p className="text-xs mt-2" style={{color:"var(--text3)"}}>Stored in database — works on Vercel.</p>
          </div>
        </div>
      </div>
      <div className="card p-5 space-y-3">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>📄 Resume / CV</p>
        <p className="text-xs" style={{color:"var(--text3)"}}>PDF only · max 4MB · stored in database</p>
        <div className="flex flex-wrap items-center gap-3">
          <Btn onClick={()=>pick("resume",setResUploading,"application/pdf")} disabled={resUploading}>
            {resUploading?<><Loader2 size={13} className="animate-spin"/>Uploading (may take 30s)…</>:<>📄 Upload Resume PDF</>}
          </Btn>
          <Btn onClick={checkDB} disabled={checking}>{checking?<><Loader2 size={13} className="animate-spin"/>Checking…</>:<>🔍 Check DB</>}</Btn>
          <a href="/api/resume" target="_blank" rel="noopener noreferrer" className="text-xs" style={{color:"var(--accent)"}}>View live →</a>
        </div>
        {resStatus!==null&&<div className="p-3 rounded-lg text-xs" style={{background:resStatus.verified?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${resStatus.verified?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`,color:resStatus.verified?"#4ade80":"#f87171"}}>
          {resStatus.verified?`✅ DB has resume: ${(resStatus.size/1024).toFixed(0)}KB`:"❌ No resume in DB — static public/resume.pdf is served as fallback"}
        </div>}
      </div>
      <div className="card p-5">
        <p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>🎨 Browser Tab Icon</p>
        <p className="text-xs mb-4" style={{color:"var(--text3)"}}>SVG only · stored in database · shown in browser tab</p>
        <Btn onClick={()=>pick("icon",setIconUploading,"image/svg+xml")} disabled={iconUploading}>
          {iconUploading?<><Loader2 size={13} className="animate-spin"/>Uploading…</>:<>🎨 Upload Icon SVG</>}
        </Btn>
      </div>
    </div>
  );
}

// ── Skills Panel ──────────────────────────────────────────────────────────────
function SkillsPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState<string|null>(null); const [category,setCategory]=useState(""); const [icon,setIcon]=useState("code"); const [skillItems,setSkillItems]=useState("");
  const load=useCallback(async()=>{setLoading(true);const r=await fetch(`${API}/api/skills`);setItems(await r.json());setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  const cancel=()=>{setEditing(null);setCategory("");setIcon("code");setSkillItems("");};
  const startEdit=(it:any)=>{setEditing(it.id);setCategory(it.category);setIcon(it.icon);setSkillItems(it.items.join(", "));};
  const toBody=()=>({category,icon,items:skillItems.split(",").map((s:string)=>s.trim()).filter(Boolean)});
  const save=async(id?:string)=>{try{if(id)await adminUpdateSkill(secret,id,toBody());else await adminAddSkill(secret,toBody());toast({msg:`Skill ${id?"updated":"added"}!`,ok:true});cancel();load();}catch(e:any){toast({msg:e.message,ok:false});}};
  const del=async(id:string)=>{if(!confirm("Delete?"))return;try{await adminDeleteSkill(secret,id);toast({msg:"Deleted!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});}};
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
        [...items].reverse().map(it=>(
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
                <div className="min-w-0"><p className="font-bold text-sm mb-2" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{it.category}</p><div className="flex flex-wrap gap-1.5">{it.items.map((s:string)=><span key={s} className="tag">{s}</span>)}</div></div>
                <div className="flex gap-2 flex-shrink-0"><Btn onClick={()=>startEdit(it)} small><Pencil size={11}/>Edit</Btn><Btn onClick={()=>del(it.id)} color="red" small><Trash2 size={11}/>Del</Btn></div>
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
  const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState<string|null>(null); const [role,setRole]=useState(""); const [company,setCompany]=useState(""); const [duration,setDuration]=useState(""); const [type,setType]=useState("Internship"); const [points,setPoints]=useState("");
  const load=useCallback(async()=>{setLoading(true);const r=await fetch(`${API}/api/experience`);const d=await r.json();setItems(d.experience||[]);setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  const cancel=()=>{setEditing(null);setRole("");setCompany("");setDuration("");setType("Internship");setPoints("");};
  const startEdit=(it:any)=>{setEditing(it.id);setRole(it.role);setCompany(it.company);setDuration(it.duration);setType(it.type);setPoints(it.points.join("\n"));};
  const toBody=()=>({role,company,duration,type,points:points.split("\n").map((s:string)=>s.trim()).filter(Boolean)});
  const save=async(id?:string)=>{try{if(id)await adminUpdateExp(secret,id,toBody());else await adminAddExp(secret,toBody());toast({msg:`Experience ${id?"updated":"added"}!`,ok:true});cancel();load();}catch(e:any){toast({msg:e.message,ok:false});}};
  const del=async(id:string)=>{if(!confirm("Delete?"))return;try{await adminDeleteExp(secret,id);toast({msg:"Deleted!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});}};
  const expFormJSX=(
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3"><div><label className="label block mb-1.5">Role</label><input className={inputCls} value={role} onChange={e=>setRole(e.target.value)} placeholder="Software Engineer"/></div><div><label className="label block mb-1.5">Company</label><input className={inputCls} value={company} onChange={e=>setCompany(e.target.value)}/></div></div>
      <div className="grid sm:grid-cols-2 gap-3"><div><label className="label block mb-1.5">Duration</label><input className={inputCls} value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Jan 2024 – Present"/></div><div><label className="label block mb-1.5">Type</label><input className={inputCls} value={type} onChange={e=>setType(e.target.value)} placeholder="Internship / Full-time"/></div></div>
      <div><label className="label block mb-1.5">Bullet points (one per line)</label><textarea className={inputCls} rows={4} value={points} onChange={e=>setPoints(e.target.value)} style={{resize:"vertical"}}/></div>
      <div className="flex gap-2"><Btn onClick={()=>save(editing==="new"?undefined:editing||undefined)} color="green"><Save size={12}/>Save</Btn><Btn onClick={cancel} color="red"><X size={12}/>Cancel</Btn></div>
    </div>
  );
  return (
    <div className="space-y-4">
      {editing==="new"?<div className="card p-5" style={{borderColor:"color-mix(in srgb,var(--accent) 30%,transparent)"}}><p className="font-bold text-sm mb-3" style={{color:"var(--text1)"}}>New Experience</p>{expFormJSX}</div>:<Btn onClick={()=>{cancel();setEditing("new");}}><Plus size={13}/>Add Experience</Btn>}
      {loading?<div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>:
        [...items].reverse().map(it=><div key={it.id} className="card p-4">{editing===it.id?expFormJSX:(
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{it.role}</p><p className="text-xs mb-1" style={{color:"var(--accent)",fontFamily:"'DM Sans',sans-serif"}}>{it.company}</p><p className="mono text-xs" style={{color:"var(--text3)"}}>{it.duration} · {it.type}</p></div>
            <div className="flex gap-2 flex-shrink-0"><Btn onClick={()=>startEdit(it)} small><Pencil size={11}/>Edit</Btn><Btn onClick={()=>del(it.id)} color="red" small><Trash2 size={11}/>Del</Btn></div>
          </div>
        )}</div>)
      }
    </div>
  );
}

// ── Projects Panel ────────────────────────────────────────────────────────────
function ProjPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState<string|null>(null); const [title,setTitle]=useState(""); const [desc,setDesc]=useState(""); const [tags,setTags]=useState(""); const [github,setGithub]=useState(""); const [live,setLive]=useState(""); const [featured,setFeatured]=useState(false);
  const load=useCallback(async()=>{setLoading(true);const r=await fetch(`${API}/api/projects`);setItems(await r.json());setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  const cancel=()=>{setEditing(null);setTitle("");setDesc("");setTags("");setGithub("");setLive("");setFeatured(false);};
  const startEdit=(it:any)=>{setEditing(it.id);setTitle(it.title);setDesc(it.description);setTags(it.tags.join(", "));setGithub(it.github||"");setLive(it.live||"");setFeatured(it.featured);};
  const toBody=()=>({title,description:desc,tags:tags.split(",").map((s:string)=>s.trim()).filter(Boolean),github:github||null,live:live||null,featured});
  const save=async(id?:string)=>{try{if(id)await adminUpdateProject(secret,id,toBody());else await adminAddProject(secret,toBody());toast({msg:`Project ${id?"updated":"added"}!`,ok:true});cancel();load();}catch(e:any){toast({msg:e.message,ok:false});}};
  const del=async(id:string)=>{if(!confirm("Delete?"))return;try{await adminDeleteProject(secret,id);toast({msg:"Deleted!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});}};
  const projFormJSX=(
    <div className="space-y-3">
      <div><label className="label block mb-1.5">Title</label><input className={inputCls} value={title} onChange={e=>setTitle(e.target.value)}/></div>
      <div><label className="label block mb-1.5">Description</label><textarea className={inputCls} rows={3} value={desc} onChange={e=>setDesc(e.target.value)} style={{resize:"vertical"}}/></div>
      <div><label className="label block mb-1.5">Tags (comma-separated)</label><input className={inputCls} value={tags} onChange={e=>setTags(e.target.value)}/></div>
      <div className="grid sm:grid-cols-2 gap-3"><div><label className="label block mb-1.5">GitHub URL</label><input className={inputCls} value={github} onChange={e=>setGithub(e.target.value)}/></div><div><label className="label block mb-1.5">Live URL</label><input className={inputCls} value={live} onChange={e=>setLive(e.target.value)}/></div></div>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/><span className="text-sm" style={{color:"var(--text2)"}}>Featured</span></label>
      <div className="flex gap-2"><Btn onClick={()=>save(editing==="new"?undefined:editing||undefined)} color="green"><Save size={12}/>Save</Btn><Btn onClick={cancel} color="red"><X size={12}/>Cancel</Btn></div>
    </div>
  );
  return (
    <div className="space-y-4">
      {editing==="new"?<div className="card p-5" style={{borderColor:"color-mix(in srgb,var(--accent) 30%,transparent)"}}><p className="font-bold text-sm mb-3" style={{color:"var(--text1)"}}>New Project</p>{projFormJSX}</div>:<Btn onClick={()=>{cancel();setEditing("new");}}><Plus size={13}/>Add Project</Btn>}
      {loading?<div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>:
        [...items].reverse().map(it=><div key={it.id} className="card p-4">{editing===it.id?projFormJSX:(
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="font-bold text-sm mb-1" style={{color:"var(--text1)",fontFamily:"'DM Sans',sans-serif"}}>{it.title}</p><p className="text-xs line-clamp-2 mb-2" style={{color:"var(--text2)"}}>{it.description}</p><div className="flex flex-wrap gap-1">{it.tags.slice(0,5).map((t:string)=><span key={t} className="tag">{t}</span>)}</div></div>
            <div className="flex gap-2 flex-shrink-0"><Btn onClick={()=>startEdit(it)} small><Pencil size={11}/>Edit</Btn><Btn onClick={()=>del(it.id)} color="red" small><Trash2 size={11}/>Del</Btn></div>
          </div>
        )}</div>)
      }
    </div>
  );
}

// ── Education Panel ───────────────────────────────────────────────────────────
function EduPanel({ secret, toast }: { secret:string; toast:(t:Toast)=>void }) {
  const [data,setData]=useState<any>({education:[],certifications:[]}); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const load=useCallback(async()=>{setLoading(true);const r=await fetch(`${API}/api/education`);setData(await r.json());setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  const setEdu=(i:number,k:string,v:string)=>setData((d:any)=>{const e=[...d.education];e[i]={...e[i],[k]:v};return{...d,education:e};});
  const setCert=(i:number,k:string,v:string)=>setData((d:any)=>{const c=[...d.certifications];c[i]={...c[i],[k]:v};return{...d,certifications:c};});
  const save=async()=>{setSaving(true);try{await adminUpdateEducation(secret,{education:data.education,certifications:data.certifications.map((c:any)=>({title:c.title||c,issuer:c.issuer||""}))});toast({msg:"Education updated!",ok:true});load();}catch(e:any){toast({msg:e.message,ok:false});}setSaving(false);};
  if(loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{color:"var(--accent)"}}/></div>;
  const eduDisplay=[...data.education].reverse(); const certDisplay=[...data.certifications].reverse();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3"><p className="font-bold text-sm" style={{color:"var(--text1)"}}>Education Entries</p><Btn onClick={()=>setData((d:any)=>({...d,education:[...d.education,{degree:"",institution:"",duration:"",status:"",gpa:""}]}))} small><Plus size={11}/>Add</Btn></div>
        {eduDisplay.map((e:any,di:number)=>{const i=data.education.length-1-di;return(
          <div key={i} className="card p-4 mb-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3"><div><label className="label block mb-1.5">Degree</label><input className={inputCls} value={e.degree} onChange={ev=>setEdu(i,"degree",ev.target.value)}/></div><div><label className="label block mb-1.5">Institution</label><input className={inputCls} value={e.institution} onChange={ev=>setEdu(i,"institution",ev.target.value)}/></div></div>
            <div className="grid sm:grid-cols-3 gap-3"><div><label className="label block mb-1.5">Duration</label><input className={inputCls} value={e.duration} onChange={ev=>setEdu(i,"duration",ev.target.value)}/></div><div><label className="label block mb-1.5">Status</label><input className={inputCls} value={e.status} onChange={ev=>setEdu(i,"status",ev.target.value)}/></div><div><label className="label block mb-1.5">GPA</label><input className={inputCls} value={e.gpa} onChange={ev=>setEdu(i,"gpa",ev.target.value)}/></div></div>
            <Btn onClick={()=>setData((d:any)=>({...d,education:d.education.filter((_:any,j:number)=>j!==i)}))} color="red" small><Trash2 size={11}/>Remove</Btn>
          </div>
        );})}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3"><p className="font-bold text-sm" style={{color:"var(--text1)"}}>Certifications</p><Btn onClick={()=>setData((d:any)=>({...d,certifications:[...d.certifications,{title:"",issuer:""}]}))} small><Plus size={11}/>Add</Btn></div>
        {certDisplay.map((c:any,di:number)=>{const i=data.certifications.length-1-di;return(
          <div key={i} className="card p-4 mb-3 space-y-3">
            <div><label className="label block mb-1.5">Title</label><input className={inputCls} value={typeof c==="string"?c:c.title} onChange={ev=>setCert(i,"title",ev.target.value)}/></div>
            <div><label className="label block mb-1.5">Issuer</label><input className={inputCls} value={c.issuer||""} onChange={ev=>setCert(i,"issuer",ev.target.value)}/></div>
            <Btn onClick={()=>setData((d:any)=>({...d,certifications:d.certifications.filter((_:any,j:number)=>j!==i)}))} color="red" small><Trash2 size={11}/>Remove</Btn>
          </div>
        );})}
      </div>
      <Btn onClick={save} color="green" disabled={saving}>{saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}{saving?"Saving…":"Save All Changes"}</Btn>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [secret,setSecret]=useState(""); const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState<Tab>("profile"); const [toast,setToastState]=useState<Toast|null>(null);
  const showToast=(t:Toast)=>{setToastState(t);setTimeout(()=>setToastState(null),4000);};
  const TABS: {key:Tab;label:string;icon:React.ReactNode}[]=[
    {key:"profile",    label:"Profile & Links", icon:<User size={13}/>},
    {key:"theme",      label:"Theme & Colors",  icon:<Palette size={13}/>},
    {key:"files",      label:"Files",           icon:<span>📁</span>},
    {key:"skills",     label:"Skills",          icon:<span>⚡</span>},
    {key:"experience", label:"Experience",      icon:<span>💼</span>},
    {key:"projects",   label:"Projects",        icon:<span>🚀</span>},
    {key:"education",  label:"Education",       icon:<span>🎓</span>},
  ];
  if(!authed) return <Login onLogin={s=>{setSecret(s);setAuthed(true);}}/>;
  return (
    <div className="min-h-screen" style={{background:"var(--bg)"}}>
      <header className="sticky top-0 z-50 wrap h-14 flex items-center justify-between"
        style={{background:"color-mix(in srgb, var(--bg) 95%, transparent)",borderBottom:"1px solid var(--border)",backdropFilter:"blur(16px)"}}>
        <div className="flex items-center gap-2">
          <Shield size={16} style={{color:"var(--accent)"}}/>
          <span className="font-bold text-sm" style={{color:"var(--text1)",fontFamily:"'Inter',sans-serif"}}>Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs" style={{color:"var(--text2)"}}>← Portfolio</a>
          <button onClick={()=>{setAuthed(false);setSecret("");}} className="text-xs px-3 py-1.5 rounded-lg" style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}>Logout</button>
        </div>
      </header>
      {toast&&<div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl max-w-sm" style={{background:toast.ok?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",border:`1px solid ${toast.ok?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,color:toast.ok?"#4ade80":"#f87171"}}>
        {toast.ok?<CheckCircle size={14}/>:<AlertCircle size={14}/>}{toast.msg}
      </div>}
      <div className="wrap py-7">
        <div className="flex gap-2 mb-7 flex-wrap">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{fontFamily:"'DM Sans',sans-serif",
                background:tab===t.key?"color-mix(in srgb,var(--accent) 14%,transparent)":"rgba(255,255,255,0.04)",
                color:tab===t.key?"var(--accent)":"var(--text2)",
                border:tab===t.key?"1px solid color-mix(in srgb,var(--accent) 35%,transparent)":"1px solid rgba(255,255,255,0.06)"}}>
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
