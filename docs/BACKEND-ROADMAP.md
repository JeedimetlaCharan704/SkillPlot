# SkillPilot AI — Backend Migration Roadmap

## Current State

The entire application runs on the client side:
- **State**: `localStorage` via Store
- **Services**: Deterministic algorithms in JavaScript
- **Data**: Static catalog files
- **Auth**: Hardcoded demo credentials

## Target Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend    │────▶│   Express API    │────▶│   MongoDB     │
│  (HTML/CSS/JS)│     │   (Node.js)      │     │   (Database)  │
│               │◀────│                  │◀────│               │
└──────────────┘     └─────────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │  External    │
                    │  APIs        │
                    │  GitHub API  │
                    └─────────────┘
```

## Phase 1: API Structure (Server Setup)

```
backend/
├── server.js                 # Express entry point
├── package.json
├── .env                      # Config (PORT, MONGO_URI, JWT_SECRET)
├── config/
│   ├── db.js                 # MongoDB connection via Mongoose
│   └── env.js                # Environment variable loader
├── routes/
│   ├── auth.routes.js        # /api/auth/*
│   ├── resume.routes.js      # /api/resume/*
│   ├── career.routes.js      # /api/career/*
│   ├── skill.routes.js       # /api/skill/*
│   ├── portfolio.routes.js   # /api/portfolio/*
│   ├── placement.routes.js   # /api/placement/*
│   ├── github.routes.js      # /api/github/*
│   └── analytics.routes.js   # /api/analytics/*
├── controllers/              # One per route file
├── models/
│   ├── User.model.js
│   ├── Resume.model.js
│   ├── Skill.model.js
│   ├── CareerPath.model.js
│   ├── Portfolio.model.js
│   └── Placement.model.js
├── middleware/
│   ├── auth.middleware.js    # JWT verification
│   ├── validate.middleware.js
│   └── rateLimiter.js
└── services/                 # Business logic (mirrors frontend services)
    ├── auth.service.js
    ├── resume.service.js
    ├── career.service.js
    ├── skill.service.js
    ├── portfolio.service.js
    ├── placement.service.js
    └── github.service.js
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Login, returns JWT
POST   /api/auth/logout            # Invalidate token
GET    /api/auth/session           # Validate token, return user
POST   /api/auth/social/:provider  # Social login (Google/GitHub/LinkedIn)
```

### Resume
```
POST   /api/resume/analyze         # Upload and analyze resume
GET    /api/resume/analysis        # Get latest analysis
PUT    /api/resume/upload          # Upload resume file
```

### Career
```
GET    /api/career/paths           # List all career paths
GET    /api/career/paths/:id       # Get specific career path
POST   /api/career/recommendations # Get personalized recommendations
POST   /api/career/recommend/skills # Recommend for arbitrary skills
```

### Skills
```
POST   /api/skill/gap-analysis     # Analyze skill gaps for role
PUT    /api/user/skills            # Update user skills
GET    /api/skills/database        # Get skill taxonomy
```

### Portfolio
```
POST   /api/portfolio/analyze      # Generate portfolio analysis
GET    /api/portfolio/export/json  # Export as JSON
GET    /api/portfolio/export/md    # Export as Markdown
GET    /api/portfolio/export/pdf   # Export as PDF (server-side)
```

### Placement
```
POST   /api/placement/predict      # Run placement prediction
GET    /api/placement/trends       # Get placement trend data
GET    /api/placement/companies    # Get company database
```

### GitHub
```
POST   /api/github/analyze         # Fetch and analyze GitHub profile
```

### Analytics
```
GET    /api/analytics/dashboard    # Get dashboard data
GET    /api/analytics/progress     # Get learning progress
```

## MongoDB Models

### User
```js
{
  name: String,
  email: { type: String, unique: true },
  password: String (hashed),
  role: { type: String, enum: ['student', 'mentor', 'recruiter'] },
  avatar: String,
  cgpa: Number,
  githubUsername: String,
  linkedinUrl: String,
  skills: [{ name: String, level: Number, category: String }],
  projects: [{ name, description, technologies, url, completed }],
  certifications: [{ name, issuer, date, url }],
  badges: [{ id: String, unlockedAt: Date }],
  learningStreak: { current: Number, longest: Number, lastActive: Date },
  createdAt: Date,
  updatedAt: Date
}
```

### ResumeAnalysis
```js
{
  userId: ObjectId (ref: User),
  resumeText: String,
  resumeScore: Number,
  atsScore: Number,
  keywordMatch: { matched: [], missing: [] },
  sections: { present: [], missing: [] },
  strengths: [],
  weaknesses: [],
  suggestions: [],
  formatScore: Number,
  analyzedAt: Date
}
```

## Migration Steps

### Step 1: Service Layer
- Move algorithm code from frontend `services/` to backend `services/`
- Each algorithm becomes a pure function, same logic

### Step 2: API Routes
- Create Express routes matching service method names
- Add JWT auth middleware
- Add request validation

### Step 3: Frontend Service Update
- Replace mock implementations with `fetch()` calls
- Interface stays identical — no UI changes
- Add loading/error states where needed

```js
// Before (mock)
async analyzeResume(text) {
  await new Promise(r => setTimeout(r, 500))
  return this._compute(text)
}

// After (API)
async analyzeResume(text) {
  const res = await fetch(`${API_URL}/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ text })
  })
  return res.json()
}
```

### Step 4: Database Seed
- Move static data catalogs to MongoDB collections
- Create seed scripts for career paths, skills, companies

### Step 5: File Storage
- Resume files stored in cloud storage (S3/Cloudinary)
- Profile avatars uploaded and served via CDN

### Step 6: Deployment
- Backend: Dockerized, deployed to AWS ECS / Fly.io / Railway
- Frontend: Static files served via Vercel / Netlify / S3+CloudFront
- Database: MongoDB Atlas

## Environment Variables
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skillpilot
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5500
GITHUB_TOKEN=github-pat-for-api
UPLOAD_DIR=./uploads
```
