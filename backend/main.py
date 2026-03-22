"""
Portfolio Backend — FastAPI + NeonDB (PostgreSQL)
Public : GET  /api/profile, /api/theme, /api/skills,
              /api/experience, /api/projects, /api/education
Admin  : POST/PUT/DELETE /api/admin/*  (X-Admin-Secret header)
Note   : Contact form handled by Next.js API route (Nodemailer + ZeroBounce)
"""
import os, uuid, json
from contextlib import asynccontextmanager
from typing import Optional

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

DATABASE_URL    = os.getenv("DATABASE_URL", "")
ADMIN_SECRET    = os.getenv("ADMIN_SECRET", "dev-secret")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# ── DB ────────────────────────────────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS profile (
                    id TEXT PRIMARY KEY DEFAULT 'main',
                    data JSONB NOT NULL DEFAULT '{}'
                );
                CREATE TABLE IF NOT EXISTS theme (
                    id TEXT PRIMARY KEY DEFAULT 'main',
                    data JSONB NOT NULL DEFAULT '{}'
                );
                CREATE TABLE IF NOT EXISTS skills (
                    id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    icon TEXT NOT NULL DEFAULT 'code',
                    items JSONB NOT NULL DEFAULT '[]'
                );
                CREATE TABLE IF NOT EXISTS experience (
                    id TEXT PRIMARY KEY,
                    role TEXT NOT NULL,
                    company TEXT NOT NULL,
                    duration TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'Full-time',
                    points JSONB NOT NULL DEFAULT '[]'
                );
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    tags JSONB NOT NULL DEFAULT '[]',
                    github TEXT,
                    live TEXT,
                    featured BOOLEAN DEFAULT FALSE
                );
                CREATE TABLE IF NOT EXISTS education (
                    id TEXT PRIMARY KEY DEFAULT 'main',
                    data JSONB NOT NULL DEFAULT '{}'
                );
            """)
            conn.commit()
            cur.execute("SELECT COUNT(*) as c FROM skills")
            if cur.fetchone()["c"] == 0:
                _seed(cur)
                conn.commit()

def _seed(cur):
    cur.execute("INSERT INTO profile(id,data) VALUES('main',%s) ON CONFLICT DO NOTHING", (json.dumps({
        "name": "Saqib Ahmad Siddiqui",
        "tagline": "AI & Software Engineer",
        "bio": "Results-driven and adaptable Software Engineer with a solid foundation in programming, database systems, and analytical problem-solving. Skilled in Python, SQL, and Oracle technologies, with a growing aspiration to specialize in Artificial Intelligence and Data Science.",
        "location": "Multan, Pakistan",
        "email": "saqibahmad2004@gmail.com",
        "phone": "+923107274227",
        "links": {
            "github":   "https://github.com/saqibahmadsiddiqui",
            "linkedin": "https://linkedin.com/in/saqib-ahmad-siddiqui",
            "twitter":  "",
            "website":  "https://saqibahmadsiddiqui.vercel.app",
        },
        "animation_tokens": [
            "Python", "FastAPI", "import numpy as np", "Scikit-Learn",
            "model.fit(X,y)", "MLOps", "NeonDB", "Hopsworks",
            "accuracy_score()", "Oracle APEX", "df.describe()", "Docker",
            "n_estimators=100", "ChromaDB", "TypeScript", "Next.js",
        ],
        "navbar_brand": "Saqib//;",
        "page_title": "Saqib Ahmad Siddiqui | AI & Software Engineer",
        "open_to_work": True,
        "open_to_work_text": "Available for full-time, internships, and freelance in AI & software.",
        "stats": [
            {"v":"3.9",   "l":"CGPA",       "s":"out of 4.0"},
            {"v":"2+",    "l":"Projects",   "s":"shipped & live"},
            {"v":"1",     "l":"Internship", "s":"Oracle ERP"},
            {"v":"Final", "l":"Year",       "s":"BS Computer Science"},
        ],
    }),))

    cur.execute("INSERT INTO theme(id,data) VALUES('main',%s) ON CONFLICT DO NOTHING", (json.dumps({
        "accent":   "#3b82f6",
        "accent2":  "#06b6d4",
        "accent3":  "#6366f1",
        "bg":       "#04070f",
        "bg2":      "#070d1a",
        "surface":  "#0c1424",
        "surface2": "#111e33",
    }),))

    skills = [
        ("sk1","Languages & Core","code",["Python","Java","JavaScript","SQL"]),
        ("sk2","AI / ML","brain",["Pandas","NumPy","Scikit-Learn","Matplotlib","ML Fundamentals"]),
        ("sk3","Backend & Web","globe",["FastAPI","Next.js","HTML","CSS","Bootstrap","Tailwind CSS","Streamlit"]),
        ("sk4","Databases","database",["Database Design","OracleDB","SQL Query Optimization","NeonDB"]),
        ("sk5","DevOps & Tools","tool",["Git","CI/CD","Docker","Jupyter Notebook","Google Colab","Hopsworks","Oracle EBS","Oracle APEX","Form Builder","Report Builder"]),
    ]
    for s in skills:
        cur.execute("INSERT INTO skills(id,category,icon,items) VALUES(%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                    (s[0],s[1],s[2],json.dumps(s[3])))

    cur.execute("""INSERT INTO experience(id,role,company,duration,type,points)
        VALUES('ex1','ERP Intern','US Group — Corporate Head Office','July 2025 – August 2025','Internship',%s)
        ON CONFLICT DO NOTHING""", (json.dumps([
            "Developed and integrated reports and forms using Oracle EBS and Oracle APEX.",
            "Learned and wrote SQL queries, including query design and worked with Oracle SQL databases.",
            "Supported Oracle Forms and Oracle Reports integration and customization to enhance business operations.",
            "Learned and worked on Oracle APEX to develop cross-platform websites and applications.",
        ]),))

    projects = [
        ("pr1","AQI Forecasting System",
         "A data science application that predicts the average AQI of Multan in category 1-5 for the next 3 days. Five models train daily; the system auto-selects the best by F1 Score. Built with a full MLOps pipeline using Hopsworks, deployed on Streamlit Cloud.",
         ["Python","Pandas","NumPy","Scikit-Learn","MLOps","Hopsworks","Streamlit","FastAPI"],
         "https://github.com/saqibahmadsiddiqui/aqi-forecasting-system","https://multan-aqi.streamlit.app",True),
        ("pr2","Personal Portfolio Website",
         "A full-stack portfolio built with Next.js 14 and FastAPI with NeonDB. Features smooth animations, dynamic content management via admin dashboard, ZeroBounce email validation, and Nodemailer contact form.",
         ["Next.js","FastAPI","TypeScript","Tailwind CSS","NeonDB","Python","Vercel"],
         "https://github.com/saqibahmadsiddiqui/portfolio-website","https://saqibahmadsiddiqui.vercel.app",True),
    ]
    for p in projects:
        cur.execute("INSERT INTO projects(id,title,description,tags,github,live,featured) VALUES(%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                    (p[0],p[1],p[2],json.dumps(p[3]),p[4],p[5],p[6]))

    cur.execute("INSERT INTO education(id,data) VALUES('main',%s) ON CONFLICT DO NOTHING", (json.dumps({
        "education":[{"id":"ed1","degree":"BS Computer Science","institution":"NFC Institute of Engineering & Technology","duration":"2022 - 2026","status":"Final Year","gpa":"3.9 / 4.0 (7th Semester)"}],
        "certifications":[
            {"id":"ce1","title":"Business Communication & AI for Professionals","issuer":"LUMSx"},
            {"id":"ce2","title":"Beginners Meetup - Career Counseling Event","issuer":"Microsoft Learn Student Ambassador Multan Chapter"},
        ]
    }),))

# ── App ───────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app):
    if DATABASE_URL:
        init_db()
    yield

app = FastAPI(title="Portfolio API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def require_admin(x_admin_secret: Optional[str] = Header(None)):
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(401, "Invalid admin secret")

# ── Models ────────────────────────────────────────────────────────────────────
class ProfileLinks(BaseModel):
    github: str = ""; linkedin: str = ""; twitter: str = ""; website: str = ""

class StatItem(BaseModel):
    v: str; l: str; s: str

class ProfileIn(BaseModel):
    name: str; tagline: str; bio: str
    location: str = ""; email: str = ""; phone: str = ""
    links: ProfileLinks = ProfileLinks()
    animation_tokens: list[str] = []
    navbar_brand: str = "Portfolio//;"
    page_title: str = ""
    open_to_work: bool = True
    open_to_work_text: str = "Available for full-time, internships, and freelance in AI & software."
    stats: list[StatItem] = []

class ThemeIn(BaseModel):
    accent: str = "#3b82f6"; accent2: str = "#06b6d4"; accent3: str = "#6366f1"
    bg: str = "#04070f"; bg2: str = "#070d1a"
    surface: str = "#0c1424"; surface2: str = "#111e33"

class SkillIn(BaseModel):
    category: str; icon: str = "code"; items: list[str]

class ExpIn(BaseModel):
    role: str; company: str; duration: str; type: str = "Full-time"; points: list[str]

class ProjectIn(BaseModel):
    title: str; description: str; tags: list[str]
    github: Optional[str] = None; live: Optional[str] = None; featured: bool = False

class EduEntry(BaseModel):
    degree: str; institution: str; duration: str; status: str; gpa: str

class CertEntry(BaseModel):
    title: str; issuer: str

class EduPayload(BaseModel):
    education: list[EduEntry]; certifications: list[CertEntry]

# ── Helpers ───────────────────────────────────────────────────────────────────
def db_get_json(table: str, row_id: str = "main") -> dict:
    if not DATABASE_URL: return {}
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT data FROM {table} WHERE id=%s", (row_id,))
            row = cur.fetchone()
    return row["data"] if row else {}

def db_upsert_json(table: str, data: dict, row_id: str = "main"):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"INSERT INTO {table}(id,data) VALUES(%s,%s) ON CONFLICT(id) DO UPDATE SET data=%s",
                        (row_id, json.dumps(data), json.dumps(data)))
        conn.commit()

# ── Public Endpoints ──────────────────────────────────────────────────────────
@app.get("/")
def root(): return {"status": "ok", "message": "Portfolio API"}

@app.get("/api/profile")
def get_profile(): return db_get_json("profile")

@app.get("/api/theme")
def get_theme(): return db_get_json("theme")

@app.get("/api/skills")
def get_skills():
    if not DATABASE_URL: return []
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM skills ORDER BY id")
            rows = cur.fetchall()
    return [{"id":r["id"],"category":r["category"],"icon":r["icon"],"items":r["items"]} for r in rows]

@app.get("/api/projects")
def get_projects():
    if not DATABASE_URL: return []
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM projects ORDER BY id")
            rows = cur.fetchall()
    return [{"id":r["id"],"title":r["title"],"description":r["description"],"tags":r["tags"],
             "github":r["github"],"live":r["live"],"featured":r["featured"]} for r in rows]

@app.get("/api/education")
def get_education():
    return db_get_json("education") or {"education":[],"certifications":[]}

@app.get("/api/experience")
def get_experience():
    edu = get_education()
    if not DATABASE_URL:
        return {"experience":[],"education":edu.get("education",[]),"certifications":edu.get("certifications",[])}
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM experience ORDER BY id")
            rows = cur.fetchall()
    exp = [{"id":r["id"],"role":r["role"],"company":r["company"],"duration":r["duration"],
            "type":r["type"],"points":r["points"]} for r in rows]
    return {"experience":exp,"education":edu.get("education",[]),"certifications":edu.get("certifications",[])}

# ── Admin: Verify ─────────────────────────────────────────────────────────────
@app.post("/api/admin/verify", dependencies=[Depends(require_admin)])
def verify_admin(): return {"status": "ok"}

# ── Admin: Profile ────────────────────────────────────────────────────────────
@app.put("/api/admin/profile", dependencies=[Depends(require_admin)])
def update_profile(data: ProfileIn):
    payload = data.model_dump()
    payload["links"] = data.links.model_dump()
    payload["stats"] = [s.model_dump() for s in data.stats]
    db_upsert_json("profile", payload)
    return payload

# ── Admin: Theme ──────────────────────────────────────────────────────────────
@app.put("/api/admin/theme", dependencies=[Depends(require_admin)])
def update_theme(data: ThemeIn):
    db_upsert_json("theme", data.model_dump())
    return data.model_dump()

# ── Admin: Skills ─────────────────────────────────────────────────────────────
@app.post("/api/admin/skills", dependencies=[Depends(require_admin)])
def add_skill(data: SkillIn):
    iid = f"sk{uuid.uuid4().hex[:8]}"
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO skills(id,category,icon,items) VALUES(%s,%s,%s,%s)",
                        (iid,data.category,data.icon,json.dumps(data.items)))
        conn.commit()
    return {"id":iid,**data.model_dump()}

@app.put("/api/admin/skills/{iid}", dependencies=[Depends(require_admin)])
def update_skill(iid: str, data: SkillIn):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE skills SET category=%s,icon=%s,items=%s WHERE id=%s",
                        (data.category,data.icon,json.dumps(data.items),iid))
            if cur.rowcount == 0: raise HTTPException(404,"Not found")
        conn.commit()
    return {"id":iid,**data.model_dump()}

@app.delete("/api/admin/skills/{iid}", dependencies=[Depends(require_admin)])
def delete_skill(iid: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM skills WHERE id=%s",(iid,))
            if cur.rowcount == 0: raise HTTPException(404,"Not found")
        conn.commit()
    return {"deleted":iid}

# ── Admin: Experience ─────────────────────────────────────────────────────────
@app.post("/api/admin/experience", dependencies=[Depends(require_admin)])
def add_exp(data: ExpIn):
    iid = f"ex{uuid.uuid4().hex[:8]}"
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO experience(id,role,company,duration,type,points) VALUES(%s,%s,%s,%s,%s,%s)",
                        (iid,data.role,data.company,data.duration,data.type,json.dumps(data.points)))
        conn.commit()
    return {"id":iid,**data.model_dump()}

@app.put("/api/admin/experience/{iid}", dependencies=[Depends(require_admin)])
def update_exp(iid: str, data: ExpIn):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE experience SET role=%s,company=%s,duration=%s,type=%s,points=%s WHERE id=%s",
                        (data.role,data.company,data.duration,data.type,json.dumps(data.points),iid))
            if cur.rowcount == 0: raise HTTPException(404,"Not found")
        conn.commit()
    return {"id":iid,**data.model_dump()}

@app.delete("/api/admin/experience/{iid}", dependencies=[Depends(require_admin)])
def delete_exp(iid: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM experience WHERE id=%s",(iid,))
            if cur.rowcount == 0: raise HTTPException(404,"Not found")
        conn.commit()
    return {"deleted":iid}

# ── Admin: Projects ───────────────────────────────────────────────────────────
@app.post("/api/admin/projects", dependencies=[Depends(require_admin)])
def add_project(data: ProjectIn):
    iid = f"pr{uuid.uuid4().hex[:8]}"
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO projects(id,title,description,tags,github,live,featured) VALUES(%s,%s,%s,%s,%s,%s,%s)",
                        (iid,data.title,data.description,json.dumps(data.tags),data.github,data.live,data.featured))
        conn.commit()
    return {"id":iid,**data.model_dump()}

@app.put("/api/admin/projects/{iid}", dependencies=[Depends(require_admin)])
def update_project(iid: str, data: ProjectIn):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE projects SET title=%s,description=%s,tags=%s,github=%s,live=%s,featured=%s WHERE id=%s",
                        (data.title,data.description,json.dumps(data.tags),data.github,data.live,data.featured,iid))
            if cur.rowcount == 0: raise HTTPException(404,"Not found")
        conn.commit()
    return {"id":iid,**data.model_dump()}

@app.delete("/api/admin/projects/{iid}", dependencies=[Depends(require_admin)])
def delete_project(iid: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM projects WHERE id=%s",(iid,))
            if cur.rowcount == 0: raise HTTPException(404,"Not found")
        conn.commit()
    return {"deleted":iid}

# ── Admin: Education ──────────────────────────────────────────────────────────
@app.put("/api/admin/education", dependencies=[Depends(require_admin)])
def update_education(data: EduPayload):
    payload = {
        "education":      [{"id":f"ed{uuid.uuid4().hex[:6]}",**e.model_dump()} for e in data.education],
        "certifications": [{"id":f"ce{uuid.uuid4().hex[:6]}",**c.model_dump()} for c in data.certifications],
    }
    db_upsert_json("education", payload)
    return payload
