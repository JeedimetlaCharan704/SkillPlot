# SkillPilot AI — System Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  HTML5   │  │   CSS3   │  │  Vanilla │  │  PWA       │  │
│  │  Pages   │  │  Flex/   │  │   JS     │  │  Service   │  │
│  │  (14)    │  │  Grid    │  │  (ES6+)  │  │  Worker    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                      ▲                                      │
│                      │ REST (Fetch)                          │
│                      ▼                                      │
├─────────────────────────────────────────────────────────────┤
│                     API Gateway (Vercel)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  vercel.json: rewrites, headers, caching, compression   ││
│  └─────────────────────────────────────────────────────────┘│
│                      ▲                                      │
│                      ▼                                      │
├─────────────────────────────────────────────────────────────┤
│                   Backend (Render — Node.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth    │  │  Profile │  │  Resume  │  │  Upload    │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │             │             │              │          │
│  ┌────▼─────────────▼─────────────▼──────────────▼──────┐   │
│  │              Express.js (TypeScript)                  │   │
│  │  helmet, cors, rate-limit, passport, ws, bull-queue │   │
│  └────┬──────────────┬──────────────┬──────────────────┘   │
│       │              │              │                       │
│  ┌────▼────┐   ┌─────▼──────┐  ┌───▼────────┐              │
│  │MongoDB  │   │  Redis     │  │  WebSocket │              │
│  │(Atlas)  │   │  (Queue)   │  │  (Real-time│              │
│  │         │   │            │  │   Updates) │              │
│  └─────────┘   └────────────┘  └────────────┘              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           3rd Party Integrations                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  OpenAI  │  │  Google  │  │  Nodemailer      │   │    │
│  │  │  GPT-4o  │  │  OAuth   │  │  (Password Reset)│   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Python ML Microservice (Render — separate service) │    │
│  │  Flask + scikit-learn RandomForest/GradientBoosting │    │
│  │  Endpoint: /api/ml/predict                          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Vanilla JS (ES6+), CSS3, HTML5 | Zero build step, instant deploy, ideal for portfolio/CMS-scale apps. PWA via service worker. |
| Backend | Node.js + TypeScript | High I/O throughput for real-time features. TypeScript prevents class of runtime errors. |
| Database | MongoDB Atlas (M10 cluster) | Flexible schema for varied profile/resume data. Native JSON document model matches JS objects. |
| Queue | Bull + Redis (optional) | Async resume processing, email dispatch without blocking request cycle. |
| Real-time | WebSocket (ws library) | Live dashboard updates, notification delivery. |
| ML | Python + scikit-learn | Industry-standard ML toolkit. RandomForest classifier for placement prediction. |
| Email | Nodemailer (SMTP) | Password reset flow with crypto tokens. |
| Auth | JWT + Passport (Google OAuth) | Stateless auth, no server-side sessions. Google OAuth reduces friction. |
| Hosting | Frontend: Vercel, Backend: Render | Vercel: edge-optimized static hosting. Render: managed Node + auto-deploy from GitHub. |
| Container | Docker (ML service) | Consistent Python environment, dependency isolation. |

## Data Flow

### Authentication Flow
```
User → Login Page → AuthService.login() → POST /api/auth/login
  → validate input → find user in MongoDB → compare bcrypt hash
  → generate JWT → return { token, user }
  → Store.set(token) → redirect to dashboard
```

### Resume Analysis Flow
```
User uploads resume → POST /api/upload → multer stores file
  → extract text (pdf-parse / mammoth / raw)
  → POST /api/resume/analyze
  → openai.service.ts (if OPENAI_API_KEY set)
      → GPT-4o-mini analyzes text → returns structured scores
  → OR resume.service.ts (fallback rule-based engine)
      → keyword frequency analysis (54 skills, 3 weight tiers)
      → 5-dimension scoring (experience, education, projects, skills, certs)
  → save Resume document to MongoDB
  → return scores to frontend
```

### Placement Prediction Flow
```
Dashboard → PlacementService.predictPlacementML()
  → try Python ML service first (axios POST /api/ml/predict)
      → Flask receives { cgpa, skills, projects, internships, ... }
      → scikit-learn model predicts probability + classification
      → return { placement_probability, predicted_placed, confidence }
  → fallback to NodeJS engine (deterministic formula)
      → weighted composite score from 8 factors
  → cache result in Analytics document
  → render to user dashboard
```

## Database Schema

### User
```typescript
{
  email: string (unique, indexed)
  password: string (bcrypt hashed)
  name: string
  role: 'student' | 'mentor' | 'recruiter' | 'admin'
  provider?: 'google' | 'github' | 'linkedin'
  providerId?: string
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
}
```

### Profile
```typescript
{
  user: ObjectId (ref: User, unique, indexed)
  bio: string
  skills: [{ name: string, level: number }]
  education: [{ degree: string, field: string, university: string, cgpa: number }]
  projects: [{ title: string, description: string, techStack: string[], link: string, impactScore: number }]
  internships: [{ company: string, role: string, duration: string }]
  certifications: [{ name: string, issuer: string, date: Date }]
  socialLinks: { github: string, linkedin: string, portfolio: string }
  githubData: { username: string, public_repos: number, ... }
}
```

### Resume
```typescript
{
  user: ObjectId (ref: User, indexed)
  filename: string
  text: string
  scores: { overall: number, experience: number, education: number, projects: number, skills: number, certifications: number }
  analysis: { strengths: string[], weaknesses: string[], suggestions: string[] }
  keywords: { matched: string[], missing: string[] }
  createdAt: Date
}
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/google | No | Google OAuth redirect |
| GET | /api/auth/google/callback | No | Google OAuth callback |
| POST | /api/auth/forgot-password | No | Send reset email |
| POST | /api/auth/reset-password | No | Reset password with token |
| GET | /api/profile | JWT | Get user profile |
| PUT | /api/profile | JWT | Update profile |
| POST | /api/upload | JWT | Upload resume file |
| POST | /api/resume/analyze | JWT | Analyze resume text |
| GET | /api/resume/history | JWT | Get past analyses |
| GET | /api/analytics/dashboard | JWT | Dashboard data |
| GET | /api/analytics/placement | JWT | Placement prediction |
| GET | /api/analytics/skill-gap | JWT | Skill gap analysis |
| GET | /api/github/analyze | JWT | GitHub profile analysis |
| POST | /api/ml/predict | No | ML placement prediction (Python) |

## Security Measures

1. **JWT Authentication**: Stateless tokens with configurable expiry. Middleware on all protected routes.
2. **Password Hashing**: bcrypt with salt rounds = 12.
3. **Rate Limiting**: express-rate-limit — 100 req/15min general, 20 req/15min on auth routes.
4. **Helmet**: Security headers (CSP, HSTS, X-Frame-Options, etc.).
5. **CORS**: Whitelist-only origins from environment variable (supports comma-separated for multi-env).
6. **Input Validation**: express-validator on all mutation routes.
7. **File Upload**: 5MB limit, whitelist .pdf/.docx/.txt, stored in memory only (not disk).
8. **Password Reset**: crypto.randomBytes(32) tokens, SHA-256 hashed in DB, 1-hour expiry.
9. **OAuth State**: Passport manages Google OAuth state parameter to prevent CSRF.
10. **Error Handling**: Centralized error handler, no stack traces in production.

## Scaling Strategy

### Horizontal Scaling (Backend)
- **Stateless design**: JWT tokens eliminate server-side sessions. Any instance can handle any request.
- **MongoDB connection pooling**: Default 10 connections per instance; increase for higher concurrency.
- **Bull queue + Redis**: Offloads OpenAI calls and email dispatch. If queue is down, operations degrade gracefully (sync fallback).
- **WebSocket**: Single-instance limitation. For multi-instance, use Redis pub/sub or Socket.IO with Redis adapter.

### Database Scaling
- **MongoDB Atlas M10 → M30+**: Vertical scaling for increased read/write throughput.
- **Indexing**: All query fields indexed (user, email, createdAt). Compound indexes for dashboard queries.
- **Sharding**: At very large scale (>100M documents), shard on `user._id` for even distribution.

### Frontend Scaling
- **Static file serving**: Vercel edge network caches HTML/CSS/JS globally.
- **API response caching**: Browser Cache-Control headers, conditional requests (ETag/If-None-Match).
- **Lazy loading**: Page-specific JS loaded on demand (page-specific files in js/pages/).

### ML Service Scaling
- **Containerized**: Docker image pushed to Render. Can scale to 2+ instances.
- **Model caching**: joblib serialized model loaded on startup, in-memory for predictions.
- **Fallback engine**: If Python service is down, NodeJS fallback ensures no downtime.

## Monitoring & Observability

- **Structured logging**: winston with JSON format, separate error/combined logs.
- **Health endpoint**: GET /api/health returns DB connection status, uptime, memory usage.
- **Error tracking**: Centralized error handler logs all 500s with stack traces.
- **Rate limit monitoring**: Headers (X-RateLimit-Remaining) included in all responses.

## Deployment

### Vercel (Frontend)
- Static SPA: 14 HTML pages + JS + CSS + PWA.
- vercel.json rewrites all routes to corresponding .html files.
- Environment: Production branch auto-deploys from GitHub.

### Render (Backend)
- Node.js web service: `npm start` runs compiled `dist/server.js`.
- Environment variables: MONGO_URI, JWT_SECRET, OPENAI_API_KEY, GOOGLE_* , SMTP_* , CORS_ORIGIN.
- Auto-deploys from GitHub main branch.

### Render (ML Service — optional)
- Dockerized Flask app on port 5001.
- Environment variable `ML_SERVICE_URL` on Node backend points here.
- Can be deployed as a separate Render web service.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Vanilla JS (no React) | Faster time-to-deploy, zero build step, easier PWA integration. Project scope doesn't warrant framework complexity. |
| TypeScript backend | Catches type errors at compile time across 36+ source files. Auto-complete in IDE improves DX. |
| Python ML microservice | Separates ML dependency (scikit-learn, numpy) from Node ecosystem. Can be developed/deployed/scaled independently. |
| Hash-based OAuth callback | Workaround for serve (local static server) not forwarding query strings. Hash fragments survive static routing. |
| OpenAI fallback design | Resume analysis works without API key. Rule-based engine gives reasonable scores when GPT-4o-mini is unavailable. |
| Deterministic resume scoring | No random components. Same input always produces same output (reproducible, verifiable). |
| localStorage for state | Simple, synchronous, no external dependency. Store.js pub/sub pattern enables reactive UI without a framework. |
