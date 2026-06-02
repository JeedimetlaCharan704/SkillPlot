<div align="center">
  <img src="https://img.shields.io/badge/SkillPlot-AI--Powered%20Career%20Intelligence-4F46E5?style=for-the-badge&logo=google-chrome&logoColor=white" alt="SkillPlot AI"/>

  <br/>

  [![CI](https://github.com/JeedimetlaCharan704/SkillPlot/actions/workflows/ci.yml/badge.svg)](https://github.com/JeedimetlaCharan704/SkillPlot/actions/workflows/ci.yml)
  [![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker)](https://github.com/JeedimetlaCharan704/SkillPlot)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/Node-20-339933?logo=nodedotjs)](https://nodejs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://mongodb.com)
  [![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
  [![Express](https://img.shields.io/badge/Express-4-000?logo=express)](https://expressjs.com)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

  <h1>SkillPlot AI</h1>
  <p><strong>Your Career, Intelligently Guided.</strong></p>
  <p>A production-grade, full-stack career intelligence platform that empowers students and professionals to analyze resumes, predict placement readiness, identify skill gaps, evaluate GitHub activity, build stunning portfolios, and gain mentor-driven insights — all in real time.</p>

  <br/>

  <a href="#-features">Features</a> •
  <a href="#-demo">Live Demo</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api">API</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-deployment">Deployment</a>

  <br/>
  <br/>

  <sub>Built with ❤️ for the next generation of developers</sub>
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3> Real-Time Dashboard</h3>
      <ul>
        <li>Live KPI updates via WebSocket</li>
        <li>4 interactive Chart.js visualizations</li>
        <li>Profile strength, resume score, placement probability</li>
        <li>Improvement engine with ranked action items</li>
      </ul>
    </td>
    <td width="50%">
      <h3> Resume Analyzer</h3>
      <ul>
        <li>5-dimension scoring (skills, experience, education, projects, certs)</li>
        <li>File upload: PDF, DOCX, TXT, RTF via Multer</li>
        <li>Keyword matching against 102-skill database</li>
        <li>Export as PDF, JSON, or Markdown</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3> Placement Predictor</h3>
      <ul>
        <li>7-factor weighted model (CGPA, skills, projects, internships, certs, resume, GitHub)</li>
        <li>5-tier classification: Platinum → Gold → Silver → Bronze → Basic</li>
        <li>Salary estimation per domain (entry / likely / stretch)</li>
        <li>What-if scenario simulator</li>
      </ul>
    </td>
    <td width="50%">
      <h3> Skill Gap Analyzer</h3>
      <ul>
        <li>Compare against 10+ career paths</li>
        <li>Interactive what-if mode</li>
        <li>Priority matrix with learning time estimates</li>
        <li>Ranked action plans with course recommendations</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3> GitHub Analytics</h3>
      <ul>
        <li>3 modes: Demo (instant), Live API (real fetch), Fallback (graceful)</li>
        <li>Per-repo quality scoring (6 factors)</li>
        <li>Developer maturity model (5 factors)</li>
      </ul>
    </td>
    <td width="50%">
      <h3> Portfolio Builder</h3>
      <ul>
        <li>4 themes: Modern SaaS, Developer Minimal, Data Scientist, Dark Professional</li>
        <li>Real-time iframe preview</li>
        <li>Health scoring with improvement suggestions</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3> Google OAuth & Password Reset</h3>
      <ul>
        <li>Sign in with Google (Passport.js)</li>
        <li>Secure password reset flow with crypto tokens</li>
      </ul>
    </td>
    <td width="50%">
      <h3> Mentor Dashboard</h3>
      <ul>
        <li>Cohort risk detection (8 risk types)</li>
        <li>Distribution analytics</li>
        <li>Top talent identification</li>
        <li>Bulk actions + multi-format exports</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🎯 Demo

> **Try it now — no setup required.**

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | `student@skillpilot.ai` | `demo123` |
| 👨‍🏫 Mentor | `mentor@skillpilot.ai` | `demo123` |
| 🏢 Recruiter | `recruiter@skillpilot.ai` | `demo123` |
| 🔐 Admin | `admin@skillpilot.ai` | `admin123` |

The demo student profile comes pre-loaded with:
- **16 skills** with proficiency levels
- **5 projects** with descriptions and links
- **4 certifications**
- **2 internships**
- Pre-analyzed resume with score **88/100**
- Placement prediction ready
- GitHub analytics demonstration

---

## 🛠️ Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>Vanilla JavaScript (ES6+), Chart.js, Font Awesome 6, CSS3 Design System (97 custom properties)</td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>Node.js 20, Express 4, JWT Authentication, Helmet Security, CORS</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>MongoDB 7 (Mongoose ODM), Redis 7 (Bull queues + caching)</td>
  </tr>
  <tr>
    <td><strong>Real-time</strong></td>
    <td>Socket.IO for live dashboard updates</td>
  </tr>
  <tr>
    <td><strong>File Upload</strong></td>
    <td>Multer — PDF / DOCX / TXT resume parsing with validation</td>
  </tr>
  <tr>
    <td><strong>Background Jobs</strong></td>
    <td>Bull + Redis for async resume analysis and GitHub processing</td>
  </tr>
  <tr>
    <td><strong>Authentication</strong></td>
    <td>Local (email/password) + Google OAuth 2.0 (Passport.js)</td>
  </tr>
  <tr>
    <td><strong>Logging</strong></td>
    <td>Winston — structured JSON logs with daily file rotation</td>
  </tr>
  <tr>
    <td><strong>Testing</strong></td>
    <td>Jest + Supertest (unit + integration, 4 test suites)</td>
  </tr>
  <tr>
    <td><strong>Containerization</strong></td>
    <td>Docker + Docker Compose (multi-service: MongoDB, Redis, API, Web)</td>
  </tr>
  <tr>
    <td><strong>CI/CD</strong></td>
    <td>GitHub Actions — lint, test, Docker build, Lighthouse audit</td>
  </tr>
  <tr>
    <td><strong>PWA</strong></td>
    <td>Service worker with precache, manifest.json, offline support</td>
  </tr>
</table>

---

## 📁 Architecture

```
SkillPlot/
├── *.html                     # 14 feature pages (login, register, dashboards, tools)
├── css/                       # Design system — 6 base files, 97 custom properties
├── js/
│   ├── store/                 # Reactive state management (pub/sub + localStorage)
│   ├── services/              # API service, auth service, computation services
│   ├── pages/                 # Page controllers for each HTML page
│   ├── components/            # Toast, Skeleton loading, ErrorBoundary, Session
│   ├── data/                  # 102-skill database, career paths, company data
│   └── utils/                 # KPI factory, helpers
├── images/                    # Static assets and icons
├── backend/
│   ├── src/
│   │   ├── server.js          # Express app + WebSocket + Queue initialization
│   │   ├── config/            # Database, environment, Passport, env loader
│   │   ├── models/            # User, Profile, Resume, Analytics (Mongoose schemas)
│   │   ├── routes/            # 6 route modules (auth, profile, resume, github, analytics, upload)
│   │   ├── controllers/       # 20+ route handlers with business logic
│   │   ├── middleware/        # JWT auth, validation, error handler, file upload
│   │   ├── services/          # Profile computation, caching, WebSocket, Queue, Logger
│   │   ├── jobs/              # Bull background job processors
│   │   └── __tests__/         # 4 test suites (auth, profile, analytics, health)
│   ├── uploads/               # Uploaded resume files
│   └── logs/                  # Winston log files (rotated daily)
├── server.js                  # Dev server — serves static files + proxies /api to backend
├── Dockerfile                 # Multi-stage build (backend runtime + frontend nginx)
├── docker-compose.yml         # MongoDB 7 + Redis 7 + API + Web services
├── sw.js                      # Service worker for PWA offline support
├── manifest.json              # PWA manifest
├── vercel.json                 # Vercel deployment configuration
└── .github/workflows/ci.yml   # GitHub Actions CI/CD pipeline
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7+ (local or [Atlas](https://mongodb.com/atlas))
- Redis 7+ (optional — falls back to sync mode)

### Option 1: Docker (one command)

```bash
git clone https://github.com/JeedimetlaCharan704/SkillPlot.git
cd SkillPlot
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:5000/api |
| MongoDB | `mongodb://localhost:27017/skillpilot` |
| Redis | `redis://localhost:6379` |

### Option 2: Manual Setup

```bash
# 1. Backend
cd backend
cp .env.example .env        # Edit MONGO_URI and JWT_SECRET
npm install
npm run dev                 # Starts on port 5000

# 2. Frontend (separate terminal)
cd ..
node server.js              # Starts dev server on port 8080

# 3. Seed demo data
cd backend
node src/seed.js
node src/seed-demo-data.js
```

Open **http://localhost:8080** — login with `student@skillpilot.ai` / `demo123`.

---

## 📡 API Overview

| Module | Endpoints | Auth |
|--------|-----------|------|
| **Health** | `GET /api/health` | ❌ |
| **Auth** | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `POST /api/auth/forgot-password` · `POST /api/auth/reset-password` | JWT |
| **Google OAuth** | `GET /api/auth/google` · `GET /api/auth/google/callback` | ❌ |
| **Profile** | `GET /api/profile` · `PUT /api/profile` · CRUD projects/certs/internships | JWT |
| **Resume** | `POST /api/resume/analyze` · `GET /api/resume/history` · `GET /api/resume/:id` | JWT |
| **GitHub** | `GET /api/github/analyze/:username` · `GET /api/github/user/:username` · `GET /api/github/repos/:username` | JWT |
| **Analytics** | `GET /api/analytics/dashboard` · `GET /api/analytics/placement` · `GET /api/analytics/skill-gap` | JWT |
| **Upload** | `POST /api/upload/resume` | JWT + Multipart |

Full API documentation: [backend/README.md](./backend/README.md)

---

## 🧪 Testing

```bash
cd backend
npm test                    # Jest + Supertest — 4 test suites
npm run test:coverage       # With coverage report
```

| Suite | File | Coverage |
|-------|------|----------|
| Auth | `auth.test.js` | Register, login, JWT validation |
| Profile | `profile.test.js` | CRUD operations, scoring |
| Analytics | `analytics.test.js` | Dashboard, placement, skill-gap |
| Health | `health.test.js` | Health check, 404, input validation |

---

## ☁️ Deployment

### Frontend → Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Full Stack → Docker Cloud (Render / Railway / AWS)

```bash
docker compose up -d
```

Set these environment variables on your cloud provider:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random 32+ char string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `CORS_ORIGIN` | Your Vercel frontend URL |

---

## 🏆 What Makes SkillPlot Production-Ready

- [x] **Dockerized** — Multi-service containers with health checks
- [x] **Tested** — 4 Jest/ Supertest suites run in CI
- [x] **CI/CD** — GitHub Actions: lint → test → Docker build → Lighthouse
- [x] **Structured Logging** — Winston with file rotation, Morgan integration
- [x] **Real-time** — WebSocket-driven live dashboard
- [x] **Background Jobs** — Bull queues for async processing
- [x] **File Upload** — Resume parsing with type/size validation
- [x] **Security** — Helmet, CORS, JWT, bcrypt, rate limiting, input validation
- [x] **PWA** — Service worker, manifest, offline support
- [x] **Google OAuth** — Passport.js integration
- [x] **Password Reset** — Secure crypto token flow
- [x] **No Secrets Committed** — All keys in `.env` (gitignored)
- [x] **Dark Mode** — 3-state toggle (light / dark / system)
- [x] **Responsive** — 320px – 1920px viewports
- [x] **Accessible** — ARIA labels, keyboard navigation, focus management

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/JeedimetlaCharan704">Jeedimetla Charan</a>
  <br/>
  <sub>Empowering careers through intelligent technology</sub>
</p>
