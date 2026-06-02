# SkillPilot AI — Algorithm Documentation

All analytics are computed using transparent, deterministic algorithms. No LLM calls, no black boxes. Every score includes an explanation of how it was calculated.

---

## 1. Resume Analysis Algorithm

**File:** `js/services/resume.service.js`

### Scoring Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| ATS Score | 50% | Keyword density + section coverage + formatting |
| Format Score | 20% | Has email, phone, links, bullets, proper length |
| Length Score | 15% | 300-800 words ideal |
| Keyword Density | 15% | Number of matched skills × 6 (capped at 100) |

### ATS Score Formula
```
ATS = keywordScore(40%) + sectionScore(30%) + formatScore(30%)

keywordScore = matchedKeywords / totalKeywords * 100
sectionScore  = presentSections / requiredSections * 100
formatScore   = format rating (0-100)
```

### Resume Score Formula
```
resumeScore = ATS(0.50) + formatScore(0.20) + lengthScore(0.15) + keywordDensity(0.15)
```

### Keyword Matching
- Text is lowercased and checked against the 100+ skill taxonomy in `skills-db.js`
- Skills with importance > 0.7 that are missing are flagged
- Maximum 15 missing skills shown

### Section Detection
Required sections: Education, Skills, Projects, Experience, Certifications
Each section detected by substring match.

---

## 2. Career Recommendation Algorithm

**File:** `js/services/career.service.js`

### Cosine Similarity Match

For each career path, a skill vector is built from the path's required skills with weights. The user's skill vector is built from their profile skills with proficiency levels.

```
userVector  = { skillName: userLevel/100 }
pathVector  = { skillName: weight }

similarity = (U · P) / (||U|| × ||P||)
match%     = similarity × 100
```

### Salary Estimation
```
baseSalary = path.salaryRange.min
confidenceFactor = match% / 100
estimatedMin = baseSalary × (0.8 + confidenceFactor × 0.2)
estimatedMax = baseSalary × 2.5 × (0.7 + confidenceFactor × 0.3)
```

### Difficulty Assessment
```
skillRatio = matchedRequiredSkills / totalRequiredSkills
if skillRatio >= 0.6 → "Beginner Friendly"
if skillRatio >= 0.3 → "Moderate Challenge"
else → "Requires Preparation"
```

---

## 3. Skill Gap Analysis Algorithm

**File:** `js/services/skill.service.js`

### Process
1. Get target role's required skills from career paths catalog
2. Compare against user's current skills (matched by lowercase name)
3. For matching skills: calculate gap = required level - user level
4. For missing skills: estimate learning time = weight × 40 hours

### Progress Formula
```
progress% = acquiredSkills / totalRequiredSkills × 100
```

### Learning Time Estimation
Each missing skill estimated at 40 hours × skill weight (importance).
Total hours = sum of all missing skill estimates.

---

## 4. Placement Prediction Algorithm

**File:** `js/services/placement.service.js`

### Factors

| Factor | Weight | Normalization |
|--------|--------|---------------|
| CGPA | 25% | (cgpa/10) × 100 |
| Projects | 25% | count × 20, max 100 |
| Skills Match | 20% | matched/total × 100 against top career path |
| Internships | 15% | count × 30, max 100 |
| Certifications | 15% | count × 20, max 100 |

### Probability Formula
```
placementProbability = Σ(factorScore × factorWeight)
Capped at 95%
```

### Company Matching
Companies sorted by `minScore` threshold. Only companies where `probability >= minScore` are returned. Each match score adjusted by `probability - (threshold - probability) × 0.3`.

### Salary Range
Determined from matched companies' salary data in `placement-data.js`.

---

## 5. Portfolio Builder Algorithm

**File:** `js/services/portfolio.service.js`

### Section Scores

| Section | Weight | Scoring |
|---------|--------|---------|
| Technical Skills | 30% | count(12) + avgLevel(0.6) |
| Projects | 25% | quality rubric: name(15) + description(15) + tech(10) + url(10) |
| GitHub Presence | 20% | repoCount(40% of qualityScore) + stars + qualityScore(0.3) |
| Resume Quality | 15% | resumeScore from Resume Analysis |
| Certifications | 10% | count × 25, max 100 |

### Readiness Levels
- 85-100: "Portfolio Ready" (green)
- 70-84: "Almost Ready" (primary blue)
- 50-69: "Needs Improvement" (yellow)
- 0-49: "Requires Attention" (red)

---

## 6. Recruiter Readiness Score Algorithm

**File:** `js/services/recruiter.service.js`

### Composite Score

| Dimension | Weight | How It's Scored |
|-----------|--------|-----------------|
| Technical Skills | 20% | avg skill level × 0.8 + count bonus |
| Projects | 25% | quality rubric (name, description, tech, url, completion) |
| Certifications | 15% | count × 25 |
| GitHub Activity | 15% | qualityScore(0.3) + repoCount(×6) + stars(×0.5) |
| Resume Score | 15% | resumeScore from analysis |
| Profile Completeness | 10% | filledFields / totalFields × 100 |

### Formula
```
recruiterScore = Σ(dimensionScore × dimensionWeight)
```

### Hiring Confidence
- >= 80: "High" — candidate is recruiter-ready
- >= 60: "Medium" — some areas need improvement
- < 60: "Low" — significant gaps identified

---

## 7. GitHub Analytics Algorithm

**File:** `js/services/github.service.js`

### Quality Score Per Repository
```
score = description(15) + hasReadme(15) + stars(capped 20) + forks(capped 10) + topics(capped 10)
qualityScore = average of all repo scores
```

### Contribution Score
```
contributionScore = (commits × 0.4 + PRs × 0.3 + repoCount × 0.3) / 5
```

### Language Distribution
Calculated as percentage of repos using each language.

---

## 8. Roadmap Generation Algorithm

**File:** `js/services/roadmap.service.js`

### Day Allocation
- Days 1-33%: Fundamentals (learn, practice)
- Days 34-66%: Application (build projects, solve problems)
- Days 67-100%: Mastery (advanced concepts, portfolio)

### Task Distribution
Each day gets 2-4 tasks:
- Skill-based tasks (cycling through required skills)
- Gap-filling tasks (every 3rd day, address missing skills)
- Milestone tasks (weekly, from predefined roadmap milestones)
