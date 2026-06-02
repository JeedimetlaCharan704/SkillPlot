# SkillPilot AI — Backend API

Node.js + Express + MongoDB + JWT authentication backend for the SkillPilot AI career intelligence platform.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js 20+ |
| Framework | Express.js 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| Validation | validator.js + custom middleware |
| Security | helmet, cors, rate-limiting |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env

# Start development server (with nodemon)
npm run dev

# Start production server
npm start
```

## API Reference

### Health

```
GET /api/health
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user |

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | Yes | Get profile |
| PUT | `/api/profile` | Yes | Update profile |
| POST | `/api/profile/projects` | Yes | Add project |
| PUT | `/api/profile/projects/:id` | Yes | Update project |
| DELETE | `/api/profile/projects/:id` | Yes | Delete project |
| POST | `/api/profile/certifications` | Yes | Add certification |
| DELETE | `/api/profile/certifications/:id` | Yes | Delete certification |
| POST | `/api/profile/internships` | Yes | Add internship |
| DELETE | `/api/profile/internships/:id` | Yes | Delete internship |

### Resume

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/resume/analyze` | Yes | Analyze resume content |
| GET | `/api/resume/history` | Yes | List past analyses |
| GET | `/api/resume/history/:id` | Yes | Get specific analysis |

### GitHub

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/github/:username` | Yes | Full GitHub analysis |
| GET | `/api/github/:username/user` | Yes | User profile |
| GET | `/api/github/:username/repos` | Yes | User repos |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard` | Yes | Dashboard KPIs |
| GET | `/api/analytics/placement` | Yes | Placement prediction |
| GET | `/api/analytics/skill-gap` | Yes | Skill gap analysis |

### Auth — Request Bodies

**Register**
```json
{
  "name": "Aryan Sharma",
  "email": "aryan@example.com",
  "password": "secure123",
  "role": "student"
}
```

**Login**
```json
{
  "email": "aryan@example.com",
  "password": "secure123"
}
```

### Auth — Response

All authenticated responses return a JWT token (valid 7 days) in the `Authorization: Bearer <token>` header pattern.

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "Aryan Sharma",
      "email": "aryan@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── env.js         # Environment variable loader
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Request handlers
│   ├── routes/            # Express routers
│   ├── middleware/        # Auth, validation, error handling
│   ├── services/          # Business logic (migrated from frontend)
│   └── server.js          # Entry point
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Environment |
| `PORT` | No | 5000 | Server port |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | 7d | Token expiration |
| `GITHUB_TOKEN` | No | — | GitHub API token (optional) |
| `CORS_ORIGIN` | No | * | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | No | 100 | Max requests per window |
