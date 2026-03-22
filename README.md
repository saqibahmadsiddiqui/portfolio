# Portfolio — Open Source Dynamic Portfolio

> A fully dynamic, open-source portfolio website. Fork it, deploy it, and customize everything through the admin dashboard — name, bio, links, colors, skills, projects, and more. No code changes needed.

🌐 **Live Demo:** [saqibahmadsiddiqui.vercel.app](https://saqibahmadsiddiqui.vercel.app)

---

## Tech Stack

| Layer      | Technology                                                   |
|------------|--------------------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS                         |
| Backend    | FastAPI (Python)                                             |
| Database   | NeonDB (PostgreSQL)                                          |
| Email      | Nodemailer + Gmail SMTP                                      |
| Validation | ZeroBounce API (email validation on contact form)            |
| Deploy     | Vercel (frontend) · HuggingFace Spaces (backend) · Neon (DB) |

---

## Project Structure

```
Portfolio/
├── .gitignore
├── README.md
├── backend/                              ← FastAPI → HuggingFace Spaces
│   ├── main.py                           ← All API endpoints + DB init + seed
│   ├── requirements.txt
│   ├── Dockerfile                        ← HuggingFace Docker config (port 7860)
│   ├── README.md                         ← HuggingFace Space metadata header
│   └── .env.example
└── frontend/                             ← Next.js 14 → Vercel
    ├── app/
    │   ├── globals.css                   ← Global styles + CSS variables (--accent etc.)
    │   ├── layout.tsx                    ← Root layout, wraps in <Providers>
    │   ├── page.tsx                      ← Home page, client-side data fetch
    │   ├── admin/
    │   │   ├── layout.tsx                ← Sets "Admin Dashboard" browser tab title
    │   │   └── page.tsx                  ← Admin dashboard (/admin) — 7 tabs
    │   └── api/
    │       ├── contact/
    │       │   └── route.ts              ← Contact form (ZeroBounce + Nodemailer)
    │       └── upload/
    │           └── route.ts              ← File upload (photo, resume, icon)
    ├── components/
    │   ├── Providers.tsx                 ← Profile + Theme context, loading gate
    │   ├── Navbar.tsx                    ← Dynamic brand name, resume link
    │   ├── Hero.tsx                      ← Fully dynamic (name, bio, links, animations, stats)
    │   ├── Skills.tsx
    │   ├── Experience.tsx
    │   ├── Projects.tsx
    │   ├── Education.tsx
    │   ├── Contact.tsx                   ← Dynamic email/links, optional open-to-work
    │   ├── Footer.tsx                    ← Dynamic social links
    │   └── SectionHeader.tsx
    ├── lib/
    │   └── api.ts                        ← All public + admin API functions
    ├── public/
    │   ├── Picture.jpeg                  ← Profile photo (add manually or via admin)
    │   ├── resume.pdf                    ← CV (add manually or via admin)
    │   └── icon.svg                      ← Browser tab icon
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── .npmrc
    ├── vercel.json
    └── .env.local.example
```

---

## Admin Dashboard — What You Can Control

Visit `/admin` on your deployed site and enter your `ADMIN_SECRET`.

| Tab                 | What You Can Change                                                   |
|---------------------|-----------------------------------------------------------------------|
| **Profile & Links** | Name, tagline, bio, location, email, phone                            |
|                     | Navbar brand text (e.g. `John//;`)                                    |
|                     | GitHub, LinkedIn, Twitter social links                                |
|                     | Browser tab title (page_title)                                        |
|                     | Show/hide "Open to opportunities" + customize subtext                 |
|                     | Hero stats cards (CGPA, Projects, etc.) — add/remove/edit             |
|                     | Animation tokens (floating skills in hero background)                 |
| **Theme & Colors**  | 6 color presets (Blue, Emerald, Rose, Violet, Amber, Cyan)            |
|                     | Custom hex color pickers for 3 accent colors + backgrounds            |
|                     | Live preview — changes apply instantly                                |
| **Files**           | Upload profile photo (600×800px recommended, saved as `Picture.jpeg`) |
|                     | Upload resume PDF (saved as `resume.pdf`)                             |
|                     | Upload browser tab icon SVG (saved as `icon.svg`)                     |
| **Skills**          | Add / Edit / Delete skill groups                                      |
| **Experience**      | Add / Edit / Delete work history entries                              |
| **Projects**        | Add / Edit / Delete projects with GitHub/live links                   |
| **Education**       | Update education entries and certifications                           |

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- [Neon](https://neon.tech) database (free tier)

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
pip install -r requirements.txt
```

Create `backend/.env` (copy from `.env.example`):
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
ADMIN_SECRET=your-strong-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

Run:
```powershell
uvicorn main:app --reload --port 8000
```

✅ API docs → http://localhost:8000/docs

> **Note:** Tables are auto-created and seeded with default data on first startup.

---

### 2. Frontend

Create `frontend/.env.local` (copy from `.env.local.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
ADMIN_SECRET=your-strong-secret-key
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
ZEROBOUNCE_KEY=your-zerobounce-api-key
```

Place your files in `frontend/public/`:
- `Picture.jpeg` — profile photo (or upload later via admin)
- `resume.pdf` — your CV (or upload later via admin)
- `icon.svg` — browser tab icon (or upload later via admin)

Run:
```powershell
cd frontend
npm install
npm run dev
```

✅ Site → http://localhost:3000
✅ Admin → http://localhost:3000/admin

> Run backend and frontend in **two separate terminals** simultaneously.

---

## Deployment

### Deploy Order: NeonDB → HuggingFace → Vercel

---

### 1. NeonDB (Database)

1. Sign up at [neon.tech](https://neon.tech) (free)
2. Create a new project
3. Copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Tables and seed data are created automatically on first backend startup

---

### 2. HuggingFace Spaces (Backend)

1. Create account at [huggingface.co](https://huggingface.co)
2. Go to **Spaces** → **New Space** → SDK: **Docker**
3. Clone your Space repo locally:
   ```bash
   git clone https://YOUR_TOKEN@huggingface.co/spaces/USERNAME/SPACE_NAME
   ```
4. Copy all files from `backend/` into the Space folder and push:
   ```bash
   git add . && git commit -m "init" && git push
   ```
5. Add **Secrets** in Space Settings → Variables and Secrets:

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | Neon connection string |
| `ADMIN_SECRET` | Your chosen secret key |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

6. Space builds automatically — takes 2–5 minutes
7. Your API URL: `https://USERNAME-SPACE_NAME.hf.space`

> ⚠️ Free tier Spaces sleep after 48h of inactivity. First request after sleep takes ~15–30 seconds (cold start).

---

### 3. Vercel (Frontend)

1. Push your repo to GitHub
2. Import at [vercel.com](https://vercel.com) → **Add New Project**
3. Set **Root Directory** to `frontend` in the import screen
4. Add **Environment Variables**:

| Variable              | Value                      |
|-----------------------|----------------------------|
| `NEXT_PUBLIC_API_URL` | Your HuggingFace Space URL |
| `ADMIN_SECRET`        | Same secret key as backend |
| `GMAIL_USER`          | `your@gmail.com`           |
| `GMAIL_APP_PASSWORD`  | Gmail App Password         |
| `ZEROBOUNCE_KEY`      | ZeroBounce API key         |

5. Deploy

---

## Gmail App Password Setup

1. Google Account → **Security** → **2-Step Verification** → **App Passwords**
2. Create one named `Portfolio`
3. Copy the 16-character password → use as `GMAIL_APP_PASSWORD`

> Use this instead of your regular Gmail password.

---

## ZeroBounce Setup

1. Sign up at [zerobounce.net](https://www.zerobounce.net) (100 free validations/month)
2. Copy your API key → use as `ZEROBOUNCE_KEY`
3. Contact form validates emails before sending — rejects disposable/fake addresses

---

## How to Use as Your Own Portfolio (Fork Guide)

1. **Fork** this repo on GitHub
2. **Deploy** following the steps above
3. Go to `your-site.vercel.app/admin`
4. Enter your `ADMIN_SECRET`
5. **Profile & Links** → update your name, bio, email, social links
6. **Theme & Colors** → pick your accent color
7. **Files** → upload your photo, resume, icon
8. **Skills / Experience / Projects / Education** → add your own content
9. Done — everything updates instantly with no code changes needed

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable          | Required | Description                           |
|-------------------|----------|---------------------------------------|
| `DATABASE_URL`    | ✅       | Neon PostgreSQL connection string     |
| `ADMIN_SECRET`    | ✅       | Secret key to protect admin endpoints |
| `ALLOWED_ORIGINS` | ✅       | Comma-separated allowed CORS origins  |

### Frontend (`frontend/.env.local`)

| Variable              | Required | Description                                   |
|-----------------------|----------|-----------------------------------------------|
| `NEXT_PUBLIC_API_URL` | ✅       | HuggingFace backend URL                       |
| `ADMIN_SECRET`        | ✅       | Same as backend — protects file upload route  |
| `GMAIL_USER`          | ✅       | Gmail address to send contact emails to       |
| `GMAIL_APP_PASSWORD`  | ✅       | Gmail App Password (not your login password)  |
| `ZEROBOUNCE_KEY`      | ✅       | ZeroBounce API key for email validation       |

---

## License

MIT — free to use, fork, and customize for your own portfolio.
