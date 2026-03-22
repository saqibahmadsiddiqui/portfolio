"use client";
import { useState } from "react";
import { Mail, MapPin, Linkedin, Send, Loader2, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useProfile } from "./Providers";

export default function Contact() {
  const profile = useProfile();
  const [form,   setForm]   = useState({ name:"", email:"", subject:"", message:"" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const change = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    try {
      const r = await fetch("/api/contact", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setErrMsg(d.error || "Something went wrong."); setStatus("error"); }
      else { setStatus("success"); setForm({ name:"", email:"", subject:"", message:"" }); }
    } catch {
      setErrMsg("Could not reach the server. Please try again.");
      setStatus("error");
    }
  };

  const INFO = [
    { icon:<Mail size={13}/>,     label:"Email",    value:profile.email,             href:`mailto:${profile.email}`              },
    { icon:<MapPin size={13}/>,   label:"Location", value:profile.location,          href:""                                     },
    { icon:<Linkedin size={13}/>, label:"LinkedIn", value: profile.links?.linkedin ? profile.links.linkedin.replace("https://","").replace("http://","") : "", href:profile.links?.linkedin || "" },
  ].filter(i => i.value);

  return (
    <section id="contact" className="py-14 md:py-20" style={{ background:"var(--bg)" }}>
      <div className="wrap">
        <SectionHeader label="Get In Touch" title="Let's Connect"
          subtitle="Have a project or opportunity? My inbox is always open."/>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="card p-5 space-y-4">
              {INFO.map(({ icon, label, value, href }, i) => (
                <div key={i}>
                  {i > 0 && <div className="hr my-3"/>}
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:"color-mix(in srgb,var(--accent) 10%,transparent)", color:"var(--accent)" }}>{icon}</div>
                      <div>
                        <p className="label mb-0.5">{label}</p>
                        <p className="text-sm break-all" style={{ color:"var(--text2)", fontFamily:"'DM Sans',sans-serif" }}>{value}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:"color-mix(in srgb,var(--accent) 10%,transparent)", color:"var(--accent)" }}>{icon}</div>
                      <div>
                        <p className="label mb-0.5">{label}</p>
                        <p className="text-sm" style={{ color:"var(--text2)", fontFamily:"'DM Sans',sans-serif" }}>{value}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {profile.open_to_work !== false && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0"/>
                  <span className="font-semibold text-sm" style={{ color:"var(--text1)", fontFamily:"'DM Sans',sans-serif" }}>Open to opportunities</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color:"var(--text3)" }}>
                  {profile.open_to_work_text || "Available for full-time, internships, and freelance."}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="card p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label block mb-1.5">Name</label><input name="name" type="text" placeholder="Your name" value={form.name} onChange={change} className="input"/></div>
                <div><label className="label block mb-1.5">Email</label><input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={change} className="input"/></div>
              </div>
              <div><label className="label block mb-1.5">Subject</label><input name="subject" type="text" placeholder="What's this about?" value={form.subject} onChange={change} className="input"/></div>
              <div><label className="label block mb-1.5">Message</label><textarea name="message" rows={5} placeholder="Tell me about your project…" value={form.message} onChange={change} className="input" style={{resize:"vertical"}}/></div>

              {/* <div className="flex items-center gap-1.5 text-xs" style={{ color:"var(--text3)" }}>
                <ShieldCheck size={11} style={{ color:"#4ade80" }}/>
                Email validated via ZeroBounce before sending
              </div> */}

              {status==="success" && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
                  style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", color:"#4ade80" }}>
                  <CheckCircle size={13}/>Message sent! I'll get back to you soon.
                </div>
              )}
              {status==="error" && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
                  style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171" }}>
                  <AlertCircle size={13}/>{errMsg}
                </div>
              )}

              <button onClick={submit}
                disabled={status==="loading"||status==="success"}
                className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {status==="loading" ? <><Loader2 size={13} className="animate-spin"/>Sending…</>
                 : status==="success" ? <><CheckCircle size={13}/>Sent!</>
                 : <><Send size={13}/>Send Message</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
