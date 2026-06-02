# SkillPilot AI — Architecture Document

## Overview

SkillPilot AI is an AI-powered Career Intelligence Platform built as a multi-page web application with a modular, service-oriented architecture. It uses a centralized reactive Store for state management and deterministic algorithms for all analytics features.

## Architecture Diagram

```
                    ┌──────────────────────────────────────────┐
                    │              STORE (store.js)             │
                    │    Reactive state, localStorage backed    │
                    │    Pub/sub pattern for cross-page sync    │
                    └────────────┬─────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
┌────▼────────────┐    ┌────────▼────────┐    ┌─────────────▼──────┐
│   SERVICES      │    │  COMPONENTS     │    │  STATIC DATA       │
│   (async)       │    │  (shared UI)    │    │  (catalogs)        │
│                  │    │                  │    │                    │
│ auth.service    │    │ sidebar.js      │    │ career-paths.js    │
│ resume.service  │    │ navbar.js       │    │ skills-db.js       │
│ career.service  │    │ charts.js       │    │ badges.js          │
│ skill.service   │    │ cards.js        │    │ companies.js       │
│ roadmap.service │    │ badges.js       │    │ placement-data.js  │
│ github.service  │    │ toast.js        │    │ demo-profile.js    │
│ analytics.svc   │    │ explanation     │    └────────────────────┘
│ placement.svc   │    └────────────────┘
│ portfolio.svc   │
│ recruiter.svc   │
└────┬────────────┘
     │
     │  Every service is structured as an async API client:
     │    async getRecommendations(userId) -> { data, loading, error }
     │    async analyzeResume(file)        -> { ... }
     │    async predictPlacement(profile)  -> { ... }
     │
     │  Currently resolves mock data. Swap BASE_URL for live backend.
     └────────────────────────────────────────────────────────────────
```

## Data Flow

1. **Page loads** → `store.js` initializes from localStorage
2. **User action** (click, form submit) → calls a `Service` method
3. **Service** runs deterministic algorithm, stores result in Store
4. **Store** notifies subscribers (UI components re-render)
5. **UI** updates via event listeners subscribed to relevant Store keys

## Store Pattern

The Store is a simple pub/sub implementation:
- `Store.get(key)` — read value
- `Store.set(key, value)` — write value, persist to localStorage, notify subscribers
- `Store.subscribe(key, fn)` — listen for changes
- `Store.reset()` — clear all state

Persistence: all state serialized to `localStorage` under key `skillpilot_state`.

## Service Pattern

Every service follows this interface:

```js
const Service = {
  async someMethod(param) {
    // 1. Simulate network latency
    await new Promise(r => setTimeout(r, ms))
    // 2. Run deterministic algorithm
    const result = this._compute(param)
    // 3. Cache in Store
    Store.set('cacheKey', result)
    // 4. Return explainable result
    return result
  },
  _compute(param) {
    // Transparent algorithm
    return { value, confidence, calculation, suggestions }
  },
  getLastResult() {
    return Store.get('cacheKey')
  }
}
```

## Page Architecture

Each HTML page:
1. Loads `store.js` (always first)
2. Loads required `data/` catalogs
3. Loads required `services/`
4. Loads `components/` (shared UI)
5. Loads page-specific `pages/page-name.js`
6. Page script initializes UI, subscribes to Store changes

## Theme System

CSS custom properties for all colors. Two themes:
- `[data-theme="light"]` — default, clean SaaS appearance
- `[data-theme="dark"]` — dark mode with slate backgrounds

Theme toggle stored in `Store.get('theme')`. Smooth transitions via `transition-theme` class.

## Backend Migration Path

Frontend services are already structured as async API consumers. To migrate:
1. Create Express server with routes matching service method names
2. Replace service internals with `fetch()` calls
3. Keep the same interface — no UI changes needed
4. Move algorithm logic to backend services
5. Add MongoDB models for persistence

## File Tree

```
css/
  variables.css      Design tokens
  reset.css          Minimal reset
  base.css           Typography, layout primitives
  components.css     Reusable component styles
  animations.css     Keyframes, transitions, skeletons
  responsive.css     Breakpoints (1200, 992, 768, 480)
  pages/             Page-specific overrides (9 files)

js/
  store/store.js     Reactive state management
  services/          10 async services
  components/        7 shared UI components
  data/              6 static catalogs
  pages/             11 page controllers

docs/
  ARCHITECTURE.md    This file
  ALGORITHMS.md      Algorithm documentation
  BACKEND-ROADMAP.md Backend migration plan
```
