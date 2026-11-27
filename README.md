# Smart Library Management System – VVITU

A full-stack, role-based Library Management System for **Vasireddy Venkatadri International Technological University (VVITU)**.

## Tech Stack
- **Frontend:** JavaScript, React, Next.js (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Python, FastAPI, Pydantic, REST APIs
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Deployment:** Vercel (Frontend), Render (Backend)

## Local Development (Phase 1)

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```
- API Docs (Swagger UI): http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```
- Web App: http://localhost:3000
