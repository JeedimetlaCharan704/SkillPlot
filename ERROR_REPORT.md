# SkillPilot AI — Error Report

## Critical Bugs (Fixed)

### 1. `ReferenceError: status is not defined`
- **File:** `js/services/skill.service.js:241`
- **Problem:** Variable `status` referenced but never defined. Should be `item.status`.
- **Fix:** Changed `status` → `item.status`

### 2. `ReferenceError: GithubService is not defined`
- **File:** `js/pages/dashboard.js:149`
- **Problem:** Called `GithubService` (lowercase `h`) but the service exports `GitHubService` (capital `H`).
- **Fix:** Changed `GithubService` → `GitHubService`

### 3. Invalid Font Awesome icon: `fa-sparkles`
- **File:** `login.html:45`
- **Problem:** `fa-sparkles` does not exist in Font Awesome 6 Free. Only `fa-wand-magic-sparkles` is available.
- **Fix:** Changed `fa-sparkles` → `fa-wand-magic-sparkles`

### 4. Absolute redirect paths (broken on `file://` protocol)
- **Files:** `route-guard.js`, `auth.service.js`, `login.js`, `session.js`, `dashboard.js`, `skill-gap.js`, `resume-analyzer.js`, `profile.js`, `portfolio-builder.js`, `placement.js`, `mentor-dashboard.js`, `github-analytics.js`
- **Problem:** Redirects used absolute paths like `'/login.html'` which resolve incorrectly on `file://` protocol or behind some proxies.
- **Fix:** Changed all to relative paths: `'login.html'`

### 5. Logout button missing `type="button"`
- **File:** `index.html:61`
- **Problem:** `<button>` defaults to `type="submit"` which can cause unexpected form-like behavior.
- **Fix:** Added `type="button"`

### 6. Sidebar items missing `cursor: pointer`
- **File:** `css/pages/dashboard.css:199`
- **Problem:** No explicit `cursor: pointer` on sidebar items (browser default handles `<a>` but explicit is safer).
- **Fix:** Added `cursor: pointer` to `.dash-sidebar-item`

### 7. Server missing cache-control headers
- **File:** `server.js:30`
- **Problem:** No `Cache-Control` headers caused browsers to cache old JS files after fixes.
- **Fix:** Added `Cache-Control: no-cache, no-store, must-revalidate` headers.

## Warnings (Not Code Bugs)

### Tracking Prevention — CDN storage blocked
- **Source:** Browser security feature (Microsoft Edge / Chrome)
- **Messages:**
  - `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css`
  - `cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **Cause:** Edge/Chrome "Strict" tracking prevention blocks third-party scripts from accessing `localStorage`.
- **Effect:** **None on functionality.** Font Awesome and Chart.js still load and work correctly. The warning only means they cannot use `localStorage` for caching. This does NOT cause any errors or break navigation.
- **Fix (optional):** Download and host Font Awesome + Chart.js locally instead of using CDNs.

## Fixed in Latest Session

### 8. `.hidden` CSS class missing (all pages broken)
- **Problem:** The `.hidden { display: none !important }` class was only defined in `style.css` which is no longer loaded by any page. All elements using `.hidden` (onboarding modal, drawers, etc.) were always visible, covering underlying content.
- **Fix:** Added `.hidden { display: none !important }` to `css/base.css`.

### 9. Filter buttons invisible in internships.html
- **Problem:** Filter buttons (`All`, `IT / Software`, etc.) used `.btn-outline-primary` class which was only defined in `style.css` (not loaded). Buttons had no border, background, or visual styling.
- **Fix:** Added `.btn-outline-primary` styles to `css/pages/internships.css`. Also added `filterInternships()` function to make buttons functional.

### 10. Layout crash on old-style pages
- **Problem:** `internships.html` and `brand-checker.html` used old layout classes (`.app-container`, `.sidebar`, `.menu-item`) from `style.css` which is no longer loaded. Layout was completely unstyled.
- **Fix:** Converted both pages to the new dashboard layout (`.dash-body`, `.dash-nav`, `.dash-sidebar`, `.dash-main`) matching `index.html`. Created `css/pages/internships.css` and `css/pages/brand-checker.css` with page-specific styles.

### 11. Sidebar links not navigating (3-layer fix)
- **Root cause:** Unknown (possibly browser Tracking Prevention blocking default `<a>` navigation)
- **Fix:**
  1. Added `window.location.href = href` to `initSidebar()` click handler (dashboard.js:83)
  2. Added document-level click delegation catching ALL clicks on `.dash-sidebar-item` (dashboard.js:1080-1085)
  3. Added `cursor: pointer` to `.dash-sidebar-item` CSS
  4. Added `Cache-Control: no-cache` headers to server.js to prevent stale JS caching

### 12. Onboarding options not clickable
- **Problem:** The `.hidden` class was missing globally. Onboarding modal was always visible but `login.js` expected to control visibility via `.hidden` class.
- **Fix:** Added `.hidden` class to `base.css`. Modal now properly starts hidden and appears after login.js removes the class.
