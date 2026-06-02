var PortfolioBuilderService = (function () {
  'use strict'

  var THEMES = {
    'modern-saas': { name: 'Modern SaaS', id: 'modern-saas', desc: 'Clean, light, blue/purple accents — perfect for full-stack developers' },
    'developer-minimal': { name: 'Developer Minimal', id: 'developer-minimal', desc: 'Dark, monochrome, green accents — minimalist developer aesthetic' },
    'data-scientist': { name: 'Data Scientist', id: 'data-scientist', desc: 'Light, data-focused, blue accents — ideal for DS/AI profiles' },
    'dark-professional': { name: 'Dark Professional', id: 'dark-professional', desc: 'Dark theme, gold/white accents — premium corporate look' }
  }

  var CATEGORY_ORDER = ['Programming Languages', 'AI & Data Science', 'Frontend', 'Backend', 'Databases', 'Cloud', 'DevOps', 'Dev Tools', 'Soft Skills']

  var CATEGORY_COLORS = {
    'Programming Languages': '#4F46E5',
    'AI & Data Science': '#8B5CF6',
    'Frontend': '#3B82F6',
    'Backend': '#10B981',
    'Databases': '#06B6D4',
    'Cloud': '#F59E0B',
    'DevOps': '#EF4444',
    'Dev Tools': '#6B7280',
    'Soft Skills': '#EC4899'
  }

  // ===== GET PROFILE =====
  function getProfile () {
    var user = Store.get('user')
    if (!user) return null
    return {
      user: user,
      skills: user.skills || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      internships: user.internships || [],
      github: user.github || null,
      linkedin: user.linkedin || null,
      badges: user.badges || [],
      resumeAnalysis: user.resumeAnalysis || null
    }
  }

  // ===== PORTFOLIO HEALTH SCORE =====
  function calculateHealth (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return { score: 0, factors: {}, suggestions: [] }

    var factors = {}
    var suggestions = []

    // 1. Content Quality — profile completeness
    var contentScore = 0
    var u = profile.user
    if (u.name) contentScore += 15
    if (u.bio) contentScore += 15
    if (u.email) contentScore += 10
    if (u.githubUsername || u.linkedinUrl) contentScore += 10
    if (!u.bio) suggestions.push('Add a professional bio to your profile')
    if (!u.email) suggestions.push('Add your email for contact information')

    // 2. Project Strength
    var projScore = 0
    if (profile.projects && profile.projects.length) {
      var avgImpact = profile.projects.reduce(function (s, p) { return s + (p.impactScore || 0) }, 0) / profile.projects.length
      var avgComplexity = profile.projects.reduce(function (s, p) { return s + (p.complexityScore || 0) }, 0) / profile.projects.length
      projScore = Math.round((avgImpact + avgComplexity) / 2)
      var missingUrls = profile.projects.filter(function (p) { return !p.url }).length
      if (missingUrls > 0) suggestions.push(missingUrls + ' project(s) missing GitHub links — add them for credibility')
      var missingDemos = profile.projects.filter(function (p) { return !p.demoUrl }).length
      if (missingDemos > 2) suggestions.push('Add demo links to your projects to showcase live deployments')
    } else {
      suggestions.push('Add projects to your profile to build portfolio content')
    }

    // 3. Skill Diversity
    var skillScore = 0
    if (profile.skills && profile.skills.length) {
      var categories = {}
      profile.skills.forEach(function (s) {
        var cat = s.category || 'Other'
        if (!categories[cat]) categories[cat] = []
        categories[cat].push(s)
      })
      var catCount = Object.keys(categories).length
      var advancedCount = profile.skills.filter(function (s) { return s.level >= 70 }).length
      skillScore = Math.min(100, catCount * 12 + advancedCount * 5)
      if (catCount < 3) suggestions.push('Expand your skills across more technology categories')
    }

    // 4. Technical Depth
    var depthScore = 0
    if (profile.skills && profile.skills.length) {
      var avgLevel = profile.skills.reduce(function (s, sk) { return s + sk.level }, 0) / profile.skills.length
      depthScore = Math.round(avgLevel)
      if (avgLevel < 50) suggestions.push('Deepen your technical skills — aim for 60+ average proficiency')
    }

    // 5. Presentation Quality
    var presScore = 0
    var hasCerts = profile.certifications && profile.certifications.length > 0
    var hasInternships = profile.internships && profile.internships.length > 0
    var hasGithub = !!profile.github
    var hasLinkedin = !!profile.linkedin
    presScore = (hasCerts ? 25 : 0) + (hasInternships ? 25 : 0) + (hasGithub ? 25 : 0) + (hasLinkedin ? 25 : 0)
    if (!hasCerts) suggestions.push('Add certifications to demonstrate formal learning')
    if (!hasInternships) suggestions.push('Add internship experience for real-world credibility')
    if (!hasGithub) suggestions.push('Connect GitHub to showcase your code')

    // 6. Completeness
    var completenessScore = 0
    var sections = ['skills', 'projects', 'certifications', 'internships', 'github', 'linkedin']
    var filled = 0
    sections.forEach(function (s) {
      if (s === 'github' || s === 'linkedin') {
        if (profile[s]) filled++
      } else {
        if (profile[s] && profile[s].length > 0) filled++
      }
    })
    completenessScore = Math.round(filled / sections.length * 100)

    factors = {
      contentQuality: { score: contentScore, label: 'Content Quality', max: 50, desc: u.name && u.bio ? 'Profile has name and bio' : 'Missing name or bio' },
      projectStrength: { score: projScore, label: 'Project Strength', max: 100, desc: (profile.projects || []).length + ' projects — avg impact ' + Math.round(avgImpact || 0) },
      skillDiversity: { score: skillScore, label: 'Skill Diversity', max: 100, desc: Object.keys(categories || {}).length + ' categories covered' },
      technicalDepth: { score: depthScore, label: 'Technical Depth', max: 100, desc: 'Avg skill level: ' + Math.round(avgLevel || 0) },
      presentationQuality: { score: presScore, label: 'Presentation Quality', max: 100, desc: (hasCerts ? 'Certs ' : '') + (hasInternships ? 'Experience ' : '') + (hasGithub ? 'GitHub ' : '') + (hasLinkedin ? 'LinkedIn' : '') },
      completeness: { score: completenessScore, label: 'Completeness', max: 100, desc: filled + '/' + sections.length + ' sections complete' }
    }

    var totalWeighted = contentScore * 0.10 + projScore * 0.25 + skillScore * 0.20 + depthScore * 0.15 + presScore * 0.15 + completenessScore * 0.15
    var overall = Math.round(totalWeighted)

    suggestions = suggestions.slice(0, 5)

    return { score: overall, factors: factors, suggestions: suggestions, sections: { filled: filled, total: sections.length } }
  }

  // ===== QUALITY ENGINE =====
  function evaluateQuality (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return { issues: [], score: 0 }

    var issues = []
    var u = profile.user

    if (!u.bio || u.bio.length < 20) issues.push({ type: 'missing_bio', severity: 'high', label: 'Missing About Section', desc: 'Add a professional bio (20+ characters) to help recruiters understand your background', gain: '+15 pts', icon: 'fa-solid fa-user-pen' })

    var weakProjects = (profile.projects || []).filter(function (p) { return !p.description || p.description.length < 30 })
    if (weakProjects.length > 0) issues.push({ type: 'weak_descriptions', severity: 'high', label: 'Weak Project Descriptions', desc: weakProjects.length + ' project(s) need stronger descriptions (30+ characters each)', gain: '+20 pts', icon: 'fa-solid fa-file-lines' })

    var noDemo = (profile.projects || []).filter(function (p) { return !p.demoUrl })
    if (noDemo.length > 2) issues.push({ type: 'no_demos', severity: 'medium', label: 'Missing Demo Links', desc: noDemo.length + ' project(s) lack demo URLs — add live demos to impress recruiters', gain: '+12 pts', icon: 'fa-solid fa-globe' })

    var noGithub = (profile.projects || []).filter(function (p) { return !p.url })
    if (noGithub.length > 1) issues.push({ type: 'no_github_links', severity: 'medium', label: 'Missing GitHub Links', desc: noGithub.length + ' project(s) missing repository URLs', gain: '+10 pts', icon: 'fa-brands fa-github' })

    if (!profile.certifications || !profile.certifications.length) issues.push({ type: 'no_certs', severity: 'medium', label: 'Missing Certifications', desc: 'Add certifications to demonstrate formal learning and validation', gain: '+18 pts', icon: 'fa-solid fa-certificate' })

    if (!u.email && !u.phone) issues.push({ type: 'no_contact', severity: 'high', label: 'Missing Contact Information', desc: 'Add email or phone number so recruiters can reach you', gain: '+10 pts', icon: 'fa-solid fa-address-card' })

    if (!profile.github) issues.push({ type: 'no_github', severity: 'medium', label: 'GitHub Not Connected', desc: 'Connect your GitHub to showcase code contributions and project quality', gain: '+15 pts', icon: 'fa-brands fa-github' })

    if (!profile.linkedin) issues.push({ type: 'no_linkedin', severity: 'low', label: 'LinkedIn Not Connected', desc: 'Connect your LinkedIn to improve recruiter visibility', gain: '+8 pts', icon: 'fa-brands fa-linkedin' })

    return { issues: issues, score: Math.max(0, 100 - issues.length * 12) }
  }

  // ===== IMPROVEMENT ENGINE =====
  function generateImprovements (health, quality) {
    var improvements = []
    if (quality.issues) {
      quality.issues.forEach(function (issue) {
        var priority = issue.severity === 'high' ? 'High' : issue.severity === 'medium' ? 'Medium' : 'Low'
        improvements.push({
          label: issue.label,
          reason: issue.desc,
          gain: issue.gain,
          priority: priority,
          icon: issue.icon
        })
      })
    }
    health.suggestions.forEach(function (s) {
      // Avoid duplicates
      var exists = improvements.some(function (imp) { return imp.reason.indexOf(s) !== -1 })
      if (!exists) improvements.push({ label: s.slice(0, 40), reason: s, gain: '+10 pts', priority: 'Medium', icon: 'fa-solid fa-lightbulb' })
    })
    return improvements.slice(0, 8)
  }

  // ===== GENERATE PORTFOLIO HTML =====
  function generateHTML (profile, themeId) {
    if (!profile) profile = getProfile()
    if (!profile) return '<html><body><h1>No profile data</h1></body></html>'
    var theme = getThemeCSS(themeId || 'modern-saas')
    var u = profile.user
    var skills = profile.skills || []
    var projects = profile.projects || []
    var certifications = profile.certifications || []
    var internships = profile.internships || []

    // Group skills by category
    var catSkills = {}
    skills.forEach(function (s) {
      var cat = s.category || 'Other'
      if (!catSkills[cat]) catSkills[cat] = []
      catSkills[cat].push(s)
    })

    var heroBg = themeId === 'dark-professional' || themeId === 'developer-minimal' ? 'background:linear-gradient(135deg,#0F172A,#1E293B)' : 'background:linear-gradient(135deg,#4F46E5,#7C3AED)'
    var heroText = themeId === 'dark-professional' || themeId === 'developer-minimal' ? '#F8FAFC' : '#FFFFFF'

    var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Portfolio — ' + esc(u.name || 'Developer') + '</title>'
    html += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">'
    html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">'
    html += '<style>' + theme + '</style></head><body>'

    // Hero
    html += '<header class="pf-hero" style="' + heroBg + ';color:' + heroText + '">'
    html += '<div class="pf-hero-content"><h1 class="pf-hero-name">' + esc(u.name || 'Your Name') + '</h1>'
    html += '<p class="pf-hero-title">' + esc(u.bio || (u.role === 'student' ? 'Student Developer' : 'Software Engineer')) + '</p>'
    html += '<div class="pf-hero-links">'
    if (u.email) html += '<a href="mailto:' + esc(u.email) + '" class="pf-hero-link" style="color:' + heroText + '"><i class="fa-solid fa-envelope"></i></a>'
    if (profile.github) html += '<a href="https://github.com/' + esc(profile.github.username) + '" target="_blank" class="pf-hero-link" style="color:' + heroText + '"><i class="fa-brands fa-github"></i></a>'
    if (profile.linkedin) html += '<a href="' + esc(profile.linkedin.profileUrl) + '" target="_blank" class="pf-hero-link" style="color:' + heroText + '"><i class="fa-brands fa-linkedin-in"></i></a>'
    html += '</div></div></header>'

    // About
    if (u.bio) {
      html += '<section class="pf-section"><div class="pf-container"><h2 class="pf-section-title">About</h2>'
      html += '<p class="pf-about-text">' + esc(u.bio) + '</p>'
      html += '<div class="pf-about-grid">'
      if (u.location) html += '<div class="pf-about-item"><i class="fa-solid fa-location-dot"></i> ' + esc(u.location) + '</div>'
      if (u.email) html += '<div class="pf-about-item"><i class="fa-solid fa-envelope"></i> ' + esc(u.email) + '</div>'
      if (u.cgpa) html += '<div class="pf-about-item"><i class="fa-solid fa-graduation-cap"></i> CGPA: ' + u.cgpa + '</div>'
      if (profile.github) html += '<div class="pf-about-item"><i class="fa-brands fa-github"></i> ' + (profile.github.repoCount || 0) + ' repositories</div>'
      html += '</div></div></section>'
    }

    // Skills
    if (skills.length) {
      html += '<section class="pf-section pf-section-alt"><div class="pf-container"><h2 class="pf-section-title">Skills & Technologies</h2>'
      CATEGORY_ORDER.forEach(function (cat) {
        if (!catSkills[cat] || !catSkills[cat].length) return
        html += '<div class="pf-skill-group"><h3 class="pf-skill-group-title">' + cat + '</h3><div class="pf-skill-grid">'
        catSkills[cat].forEach(function (s) {
          html += '<div class="pf-skill-item"><div class="pf-skill-header"><span class="pf-skill-name">' + esc(s.name) + '</span><span class="pf-skill-pct">' + s.level + '%</span></div>'
          html += '<div class="pf-skill-bar"><div class="pf-skill-fill" style="width:' + s.level + '%"></div></div></div>'
        })
        html += '</div></div>'
      })
      html += '</div></section>'
    }

    // Projects
    if (projects.length) {
      html += '<section class="pf-section"><div class="pf-container"><h2 class="pf-section-title">Projects</h2><div class="pf-project-grid">'
      projects.forEach(function (p) {
        html += '<div class="pf-project-card"><div class="pf-project-header"><h3 class="pf-project-name">' + esc(p.name) + '</h3>'
        if (p.completed) html += '<span class="pf-project-badge">Completed</span>'
        else html += '<span class="pf-project-badge pf-badge-wip">In Progress</span>'
        html += '</div><p class="pf-project-desc">' + esc(p.description || 'No description provided') + '</p>'
        html += '<div class="pf-project-tech">' + (p.technologies || []).map(function (t) { return '<span class="pf-tech-tag">' + esc(t) + '</span>' }).join('') + '</div>'
        html += '<div class="pf-project-links">'
        if (p.url) html += '<a href="' + esc(p.url) + '" target="_blank" class="pf-link"><i class="fa-brands fa-github"></i> Source</a>'
        if (p.demoUrl) html += '<a href="' + esc(p.demoUrl) + '" target="_blank" class="pf-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>'
        html += '</div></div>'
      })
      html += '</div></div></section>'
    }

    // Experience (Internships)
    if (internships.length) {
      html += '<section class="pf-section pf-section-alt"><div class="pf-container"><h2 class="pf-section-title">Experience</h2>'
      internships.forEach(function (i) {
        html += '<div class="pf-exp-card"><div class="pf-exp-header"><div><h3 class="pf-exp-role">' + esc(i.role) + '</h3><p class="pf-exp-company">' + esc(i.company) + '</p></div>'
        html += '<span class="pf-exp-date">' + (i.duration || '') + '</span></div>'
        html += '<div class="pf-exp-skills">' + (i.skillsGained || i.technologies || []).map(function (s) { return '<span class="pf-tech-tag">' + esc(s) + '</span>' }).join('') + '</div></div>'
      })
      html += '</div></section>'
    }

    // Certifications
    if (certifications.length) {
      html += '<section class="pf-section"><div class="pf-container"><h2 class="pf-section-title">Certifications</h2><div class="pf-cert-grid">'
      certifications.forEach(function (c) {
        html += '<div class="pf-cert-card"><div class="pf-cert-icon"><i class="fa-solid fa-award"></i></div>'
        html += '<div class="pf-cert-body"><h3 class="pf-cert-name">' + esc(c.name) + '</h3>'
        html += '<p class="pf-cert-issuer">' + esc(c.issuer || '') + (c.date ? ' · ' + c.date : '') + '</p></div></div>'
      })
      html += '</div></div></section>'
    }

    // Contact
    html += '<footer class="pf-footer" style="' + heroBg + ';color:' + heroText + '"><div class="pf-container"><h2 class="pf-footer-title">Get In Touch</h2>'
    html += '<div class="pf-footer-links">'
    if (u.email) html += '<a href="mailto:' + esc(u.email) + '" class="pf-footer-link" style="color:' + heroText + '"><i class="fa-solid fa-envelope"></i> ' + esc(u.email) + '</a>'
    if (profile.github) html += '<a href="https://github.com/' + esc(profile.github.username) + '" target="_blank" class="pf-footer-link" style="color:' + heroText + '"><i class="fa-brands fa-github"></i> @' + esc(profile.github.username) + '</a>'
    if (profile.linkedin) html += '<a href="' + esc(profile.linkedin.profileUrl) + '" target="_blank" class="pf-footer-link" style="color:' + heroText + '"><i class="fa-brands fa-linkedin-in"></i> LinkedIn</a>'
    html += '</div><p class="pf-footer-copy">Generated by SkillPilot AI Portfolio Builder</p></div></footer>'
    html += '</body></html>'
    return html
  }

  // ===== THEME CSS =====
  function getThemeCSS (themeId) {
    var themes = {
      'modern-saas': '*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#FFFFFF;color:#1E293B;line-height:1.6}.pf-hero{padding:80px 20px 60px;text-align:center}.pf-hero-content{max-width:800px;margin:0 auto}.pf-hero-name{font-size:48px;font-weight:800;margin-bottom:8px}.pf-hero-title{font-size:18px;opacity:0.9;margin-bottom:24px}.pf-hero-links{display:flex;gap:16px;justify-content:center}.pf-hero-link{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;opacity:0.85;transition:opacity 0.2s;text-decoration:none}.pf-hero-link:hover{opacity:1}.pf-section{padding:60px 20px}.pf-section-alt{background:#F8FAFC}.pf-container{max-width:900px;margin:0 auto}.pf-section-title{font-size:28px;font-weight:700;margin-bottom:32px;position:relative;padding-bottom:12px}.pf-section-title::after{content:"";position:absolute;bottom:0;left:0;width:48px;height:3px;background:#4F46E5;border-radius:2px}.pf-about-text{font-size:16px;color:#475569;line-height:1.7;margin-bottom:24px}.pf-about-grid{display:flex;flex-wrap:wrap;gap:16px}.pf-about-item{display:flex;align-items:center;gap:8px;font-size:14px;color:#64748B;padding:8px 16px;background:#F1F5F9;border-radius:8px}.pf-skill-group{margin-bottom:28px}.pf-skill-group-title{font-size:16px;font-weight:600;color:#4F46E5;margin-bottom:12px}.pf-skill-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}.pf-skill-item{padding:8px 0}.pf-skill-header{display:flex;justify-content:space-between;margin-bottom:4px}.pf-skill-name{font-size:13px;font-weight:500;color:#334155}.pf-skill-pct{font-size:12px;color:#4F46E5;font-weight:600}.pf-skill-bar{height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden}.pf-skill-fill{height:100%;background:linear-gradient(90deg,#4F46E5,#7C3AED);border-radius:3px;transition:width 0.3s}.pf-project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}.pf-project-card{padding:20px;border:1px solid #E2E8F0;border-radius:12px;transition:box-shadow 0.2s}.pf-project-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06)}.pf-project-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.pf-project-name{font-size:16px;font-weight:600;color:#1E293B}.pf-project-badge{font-size:11px;padding:2px 8px;background:#10B98115;color:#10B981;border-radius:6px;font-weight:500}.pf-badge-wip{background:#F59E0B15;color:#F59E0B}.pf-project-desc{font-size:13px;color:#64748B;line-height:1.5;margin-bottom:12px}.pf-project-tech{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.pf-tech-tag{font-size:11px;padding:2px 8px;background:#F1F5F9;color:#475569;border-radius:6px}.pf-project-links{display:flex;gap:12px}.pf-link{font-size:12px;color:#4F46E5;text-decoration:none;display:flex;align-items:center;gap:4px}.pf-link:hover{text-decoration:underline}.pf-exp-card{padding:20px;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:16px}.pf-exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}.pf-exp-role{font-size:16px;font-weight:600;color:#1E293B}.pf-exp-company{font-size:14px;color:#64748B}.pf-exp-date{font-size:12px;color:#94A3B8;white-space:nowrap}.pf-exp-skills{display:flex;flex-wrap:wrap;gap:6px}.pf-cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}.pf-cert-card{display:flex;gap:12px;padding:16px;border:1px solid #E2E8F0;border-radius:12px}.pf-cert-icon{width:36px;height:36px;border-radius:50%;background:#F59E0B15;display:flex;align-items:center;justify-content:center;color:#F59E0B;flex-shrink:0}.pf-cert-name{font-size:14px;font-weight:600;color:#1E293B;margin-bottom:2px}.pf-cert-issuer{font-size:12px;color:#64748B}.pf-footer{padding:60px 20px;text-align:center}.pf-footer-title{font-size:24px;font-weight:700;margin-bottom:20px}.pf-footer-links{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin-bottom:20px}.pf-footer-link{text-decoration:none;display:flex;align-items:center;gap:6px;font-size:14px;opacity:0.85;transition:opacity 0.2s}.pf-footer-link:hover{opacity:1}.pf-footer-copy{font-size:12px;opacity:0.5;margin-top:16px}@media(max-width:600px){.pf-hero-name{font-size:32px}.pf-project-grid{grid-template-columns:1fr}.pf-skill-grid{grid-template-columns:1fr}.pf-cert-grid{grid-template-columns:1fr}}',

      'developer-minimal': '*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;line-height:1.6}.pf-hero{padding:80px 20px 60px;text-align:center}.pf-hero-content{max-width:800px;margin:0 auto}.pf-hero-name{font-size:48px;font-weight:800;margin-bottom:8px}.pf-hero-title{font-size:16px;color:#94A3B8;margin-bottom:24px}.pf-hero-links{display:flex;gap:16px;justify-content:center}.pf-hero-link{width:40px;height:40px;border-radius:8px;border:1px solid #334155;display:flex;align-items:center;justify-content:center;font-size:16px;color:#94A3B8;text-decoration:none;transition:all 0.2s}.pf-hero-link:hover{border-color:#10B981;color:#10B981}.pf-section{padding:60px 20px;border-bottom:1px solid #1E293B}.pf-section-alt{background:#0A0F1D}.pf-container{max-width:900px;margin:0 auto}.pf-section-title{font-size:20px;font-weight:700;margin-bottom:32px;color:#F8FAFC;font-family:"JetBrains Mono",monospace}.pf-section-title::before{content:"// ";color:#10B981}.pf-about-text{font-size:14px;color:#94A3B8;line-height:1.7;margin-bottom:24px}.pf-about-grid{display:flex;flex-wrap:wrap;gap:12px}.pf-about-item{font-size:13px;color:#94A3B8;padding:6px 12px;border:1px solid #1E293B;border-radius:6px;display:flex;align-items:center;gap:6px}.pf-skill-group{margin-bottom:24px}.pf-skill-group-title{font-size:13px;font-weight:600;color:#10B981;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em}.pf-skill-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}.pf-skill-item{padding:6px 0}.pf-skill-header{display:flex;justify-content:space-between;margin-bottom:2px}.pf-skill-name{font-size:12px;color:#94A3B8}.pf-skill-pct{font-size:11px;color:#10B981}.pf-skill-bar{height:4px;background:#1E293B;border-radius:2px;overflow:hidden}.pf-skill-fill{height:100%;background:#10B981;border-radius:2px}.pf-project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}.pf-project-card{padding:20px;border:1px solid #1E293B;border-radius:8px;transition:border-color 0.2s}.pf-project-card:hover{border-color:#10B981}.pf-project-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.pf-project-name{font-size:14px;font-weight:600;color:#E2E8F0}.pf-project-badge{font-size:10px;padding:2px 6px;border:1px solid #10B981;color:#10B981;border-radius:4px}.pf-badge-wip{border-color:#F59E0B;color:#F59E0B}.pf-project-desc{font-size:12px;color:#64748B;line-height:1.5;margin-bottom:12px}.pf-project-tech{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px}.pf-tech-tag{font-size:10px;padding:2px 6px;border:1px solid #1E293B;color:#64748B;border-radius:4px}.pf-project-links{display:flex;gap:12px}.pf-link{font-size:11px;color:#10B981;text-decoration:none}.pf-link:hover{text-decoration:underline}.pf-exp-card{padding:16px;border:1px solid #1E293B;border-radius:8px;margin-bottom:12px}.pf-exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}.pf-exp-role{font-size:14px;font-weight:600;color:#E2E8F0}.pf-exp-company{font-size:12px;color:#64748B}.pf-exp-date{font-size:11px;color:#475569}.pf-exp-skills{display:flex;flex-wrap:wrap;gap:4px}.pf-cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}.pf-cert-card{display:flex;gap:10px;padding:14px;border:1px solid #1E293B;border-radius:8px}.pf-cert-icon{color:#F59E0B;font-size:18px}.pf-cert-name{font-size:13px;font-weight:600;color:#E2E8F0;margin-bottom:1px}.pf-cert-issuer{font-size:11px;color:#64748B}.pf-footer{padding:60px 20px;text-align:center;border-top:1px solid #1E293B}.pf-footer-title{font-size:18px;font-weight:700;margin-bottom:20px;color:#F8FAFC}.pf-footer-links{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-bottom:16px}.pf-footer-link{color:#94A3B8;text-decoration:none;font-size:13px;transition:color 0.2s}.pf-footer-link:hover{color:#10B981}.pf-footer-copy{font-size:11px;color:#475569}@media(max-width:600px){.pf-hero-name{font-size:32px}.pf-project-grid{grid-template-columns:1fr}}',

      'data-scientist': '*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#FFFFFF;color:#1E293B;line-height:1.6}.pf-hero{padding:80px 20px 60px;text-align:center;background:linear-gradient(135deg,#EFF6FF,#DBEAFE)}.pf-hero-content{max-width:800px;margin:0 auto}.pf-hero-name{font-size:48px;font-weight:800;color:#1E3A5F;margin-bottom:8px}.pf-hero-title{font-size:18px;color:#3B82F6;margin-bottom:24px}.pf-hero-links{display:flex;gap:16px;justify-content:center}.pf-hero-link{width:40px;height:40px;border-radius:50%;background:#DBEAFE;display:flex;align-items:center;justify-content:center;color:#3B82F6;text-decoration:none;transition:all 0.2s}.pf-hero-link:hover{background:#3B82F6;color:#fff}.pf-section{padding:60px 20px}.pf-section-alt{background:#F8FAFC}.pf-container{max-width:900px;margin:0 auto}.pf-section-title{font-size:28px;font-weight:700;margin-bottom:32px;color:#1E3A5F}.pf-section-title::after{content:"";display:block;width:48px;height:3px;background:#3B82F6;border-radius:2px;margin-top:8px}.pf-about-text{font-size:16px;color:#475569;line-height:1.7;margin-bottom:24px}.pf-about-grid{display:flex;flex-wrap:wrap;gap:12px}.pf-about-item{font-size:13px;color:#64748B;padding:8px 14px;background:#F1F5F9;border-radius:6px;display:flex;align-items:center;gap:6px}.pf-skill-group{margin-bottom:24px}.pf-skill-group-title{font-size:15px;font-weight:600;color:#3B82F6;margin-bottom:10px}.pf-skill-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}.pf-skill-item{padding:6px 0}.pf-skill-header{display:flex;justify-content:space-between;margin-bottom:4px}.pf-skill-name{font-size:13px;color:#334155}.pf-skill-pct{font-size:12px;color:#3B82F6;font-weight:600}.pf-skill-bar{height:5px;background:#E2E8F0;border-radius:3px;overflow:hidden}.pf-skill-fill{height:100%;background:linear-gradient(90deg,#3B82F6,#2563EB);border-radius:3px}.pf-project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}.pf-project-card{padding:20px;border:1px solid #E2E8F0;border-radius:8px;border-left:3px solid #3B82F6}.pf-project-card:hover{box-shadow:0 4px 12px rgba(59,130,246,0.08)}.pf-project-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.pf-project-name{font-size:16px;font-weight:600;color:#1E3A5F}.pf-project-badge{font-size:11px;padding:2px 8px;background:#10B98115;color:#10B981;border-radius:4px}.pf-badge-wip{background:#F59E0B15;color:#F59E0B}.pf-project-desc{font-size:13px;color:#64748B;line-height:1.5;margin-bottom:12px}.pf-project-tech{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.pf-tech-tag{font-size:11px;padding:2px 8px;background:#EFF6FF;color:#3B82F6;border-radius:4px}.pf-project-links{display:flex;gap:12px}.pf-link{font-size:12px;color:#3B82F6;text-decoration:none}.pf-link:hover{text-decoration:underline}.pf-exp-card{padding:20px;border:1px solid #E2E8F0;border-radius:8px;margin-bottom:16px;border-left:3px solid #3B82F6}.pf-exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}.pf-exp-role{font-size:16px;font-weight:600;color:#1E3A5F}.pf-exp-company{font-size:14px;color:#64748B}.pf-exp-date{font-size:12px;color:#94A3B8}.pf-exp-skills{display:flex;flex-wrap:wrap;gap:6px}.pf-cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}.pf-cert-card{display:flex;gap:12px;padding:16px;border:1px solid #E2E8F0;border-radius:8px}.pf-cert-icon{color:#3B82F6;font-size:18px}.pf-cert-name{font-size:14px;font-weight:600;color:#1E3A5F;margin-bottom:2px}.pf-cert-issuer{font-size:12px;color:#64748B}.pf-footer{padding:60px 20px;text-align:center;background:#1E3A5F;color:#FFFFFF}.pf-footer-title{font-size:24px;font-weight:700;margin-bottom:20px}.pf-footer-links{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin-bottom:20px}.pf-footer-link{color:#93C5FD;text-decoration:none;font-size:14px;transition:color 0.2s}.pf-footer-link:hover{color:#fff}.pf-footer-copy{font-size:12px;opacity:0.5}@media(max-width:600px){.pf-hero-name{font-size:32px}}',

      'dark-professional': '*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#0B1121;color:#E2E8F0;line-height:1.6}.pf-hero{padding:100px 20px 70px;text-align:center;background:linear-gradient(180deg,#0B1121,#1A1F3A);position:relative;overflow:hidden}.pf-hero::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(212,175,55,0.03),transparent 60%)}.pf-hero-content{max-width:800px;margin:0 auto;position:relative;z-index:1}.pf-hero-name{font-size:52px;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,#F8FAFC,#D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.pf-hero-title{font-size:18px;color:#94A3B8;margin-bottom:28px}.pf-hero-links{display:flex;gap:20px;justify-content:center}.pf-hero-link{width:44px;height:44px;border-radius:50%;border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;color:#D4AF37;text-decoration:none;transition:all 0.3s;font-size:18px}.pf-hero-link:hover{background:rgba(212,175,55,0.1);border-color:#D4AF37;transform:translateY(-2px)}.pf-section{padding:70px 20px;border-bottom:1px solid rgba(255,255,255,0.04)}.pf-section-alt{background:rgba(255,255,255,0.02)}.pf-container{max-width:900px;margin:0 auto}.pf-section-title{font-size:24px;font-weight:700;margin-bottom:32px;color:#F8FAFC;letter-spacing:-0.02em}.pf-section-title span{color:#D4AF37}.pf-about-text{font-size:15px;color:#94A3B8;line-height:1.8;margin-bottom:24px}.pf-about-grid{display:flex;flex-wrap:wrap;gap:16px}.pf-about-item{font-size:13px;color:#94A3B8;padding:8px 16px;border:1px solid rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;gap:6px}.pf-skill-group{margin-bottom:28px}.pf-skill-group-title{font-size:14px;font-weight:600;color:#D4AF37;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.08em}.pf-skill-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}.pf-skill-item{padding:8px 0}.pf-skill-header{display:flex;justify-content:space-between;margin-bottom:4px}.pf-skill-name{font-size:13px;color:#94A3B8}.pf-skill-pct{font-size:12px;color:#D4AF37;font-weight:600}.pf-skill-bar{height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}.pf-skill-fill{height:100%;background:linear-gradient(90deg,#D4AF37,#F59E0B);border-radius:2px}.pf-project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}.pf-project-card{padding:24px;border:1px solid rgba(255,255,255,0.06);border-radius:12px;transition:all 0.3s;background:rgba(255,255,255,0.02)}.pf-project-card:hover{border-color:rgba(212,175,55,0.3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}.pf-project-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.pf-project-name{font-size:16px;font-weight:600;color:#F8FAFC}.pf-project-badge{font-size:10px;padding:2px 8px;border:1px solid rgba(212,175,55,0.4);color:#D4AF37;border-radius:4px;font-weight:500}.pf-badge-wip{border-color:#F59E0B;color:#F59E0B}.pf-project-desc{font-size:13px;color:#64748B;line-height:1.6;margin-bottom:14px}.pf-project-tech{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.pf-tech-tag{font-size:10px;padding:3px 8px;border:1px solid rgba(255,255,255,0.08);color:#94A3B8;border-radius:4px;background:rgba(255,255,255,0.03)}.pf-project-links{display:flex;gap:16px}.pf-link{font-size:12px;color:#D4AF37;text-decoration:none;display:flex;align-items:center;gap:4px;opacity:0.7;transition:opacity 0.2s}.pf-link:hover{opacity:1}.pf-exp-card{padding:20px;border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin-bottom:16px;background:rgba(255,255,255,0.02)}.pf-exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}.pf-exp-role{font-size:15px;font-weight:600;color:#F8FAFC}.pf-exp-company{font-size:13px;color:#94A3B8}.pf-exp-date{font-size:12px;color:#64748B}.pf-exp-skills{display:flex;flex-wrap:wrap;gap:6px}.pf-cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}.pf-cert-card{display:flex;gap:12px;padding:16px;border:1px solid rgba(255,255,255,0.06);border-radius:12px;background:rgba(255,255,255,0.02)}.pf-cert-icon{color:#D4AF37;font-size:18px}.pf-cert-name{font-size:14px;font-weight:600;color:#F8FAFC;margin-bottom:2px}.pf-cert-issuer{font-size:12px;color:#64748B}.pf-footer{padding:60px 20px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)}.pf-footer-title{font-size:22px;font-weight:700;margin-bottom:24px;color:#F8FAFC}.pf-footer-links{display:flex;flex-wrap:wrap;gap:24px;justify-content:center;margin-bottom:20px}.pf-footer-link{color:#94A3B8;text-decoration:none;font-size:14px;transition:color 0.2s}.pf-footer-link:hover{color:#D4AF37}.pf-footer-copy{font-size:12px;color:#475569}@media(max-width:600px){.pf-hero-name{font-size:32px}.pf-project-grid{grid-template-columns:1fr}}'
    }
    return themes[themeId] || themes['modern-saas']
  }

  // ===== EXPORTS =====
  function exportJSON (profile, health, quality, improvements) {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      health: health,
      quality: quality,
      improvements: improvements,
      profile: {
        name: (profile.user || {}).name,
        email: (profile.user || {}).email,
        bio: (profile.user || {}).bio,
        skillsCount: (profile.skills || []).length,
        projectsCount: (profile.projects || []).length,
        certificationsCount: (profile.certifications || []).length,
        internshipsCount: (profile.internships || []).length
      }
    }, null, 2)
  }

  function exportMarkdown (profile, health, quality, improvements) {
    if (!profile) return '# Portfolio Builder\n\nNo data.'
    var u = profile.user || {}
    var md = '# Portfolio Builder — ' + (u.name || 'Developer') + '\n\n'
    md += '## Portfolio Health Score\n\n'
    md += '- **Overall:** ' + health.score + '/100\n\n'
    for (var key in health.factors) {
      var f = health.factors[key]
      md += '- **' + f.label + ':** ' + f.score + '/' + f.max + ' — ' + f.desc + '\n'
    }

    md += '\n## Quality Issues\n\n'
    quality.issues.forEach(function (issue) {
      md += '- [' + issue.severity.toUpperCase() + '] ' + issue.label + ': ' + issue.desc + ' (' + issue.gain + ')\n'
    })

    md += '\n## Improvements\n\n'
    improvements.forEach(function (imp) {
      md += '- **' + imp.label + '** (' + imp.priority + '): ' + imp.reason + ' — expected gain ' + imp.gain + '\n'
    })
    return md
  }

  function exportPDF (profile, health, quality, improvements) {
    if (!profile) return '<html><body><h1>No data</h1></body></html>'
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var bg = isDark ? '#0F172A' : '#FFFFFF'
    var text = isDark ? '#E2E8F0' : '#1E293B'
    var cardBg = isDark ? '#1E293B' : '#F8FAFC'
    var u = profile.user || {}

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Portfolio Builder — ' + esc(u.name || 'Developer') + '</title>'
    html += '<style>body{font-family:Inter,sans-serif;background:' + bg + ';color:' + text + ';padding:40px;line-height:1.6}h1{font-size:28px;margin-bottom:4px}h2{font-size:20px;border-bottom:2px solid #4F46E5;padding-bottom:6px;margin-top:32px}.section{background:' + cardBg + ';border-radius:12px;padding:20px;margin:16px 0}.score{font-size:48px;font-weight:700;color:#4F46E5}.grid{display:flex;flex-wrap:wrap;gap:12px}.factor{flex:1;min-width:140px;padding:12px;background:' + bg + ';border-radius:8px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid ' + (isDark ? '#334155' : '#E2E8F0') + '}th{font-weight:600}</style></head><body>'
    html += '<h1>Portfolio Builder — ' + esc(u.name || 'Developer') + '</h1>'
    html += '<p>Generated ' + new Date().toLocaleDateString() + '</p>'

    html += '<div class="section"><h2>Portfolio Health</h2><div class="score">' + health.score + '/100</div><div class="grid">'
    for (var key in health.factors) {
      var f = health.factors[key]
      var c = f.score >= 60 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'
      html += '<div class="factor"><div style="color:' + c + ';font-size:24px;font-weight:600">' + f.score + '</div><div>' + f.label + '</div></div>'
    }
    html += '</div></div>'

    html += '<div class="section"><h2>Quality Issues</h2><table><tr><th>Issue</th><th>Severity</th><th>Gain</th></tr>'
    quality.issues.forEach(function (issue) {
      html += '<tr><td>' + issue.label + '</td><td>' + issue.severity + '</td><td>' + issue.gain + '</td></tr>'
    })
    html += '</table></div>'

    html += '<div class="section"><h2>Improvements</h2><table><tr><th>Improvement</th><th>Priority</th><th>Gain</th></tr>'
    improvements.forEach(function (imp) {
      html += '<tr><td>' + imp.label + '</td><td>' + imp.priority + '</td><td>' + imp.gain + '</td></tr>'
    })
    html += '</table></div>'

    html += '<p style="text-align:center;margin-top:40px;font-size:12px;opacity:0.5">Generated by SkillPilot AI — Portfolio Builder</p></body></html>'
    return html
  }

  function esc (str) {
    if (typeof str !== 'string') return str || ''
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
  }

  return {
    THEMES: THEMES,
    getProfile: getProfile,
    calculateHealth: calculateHealth,
    evaluateQuality: evaluateQuality,
    generateImprovements: generateImprovements,
    generateHTML: generateHTML,
    exportJSON: exportJSON,
    exportMarkdown: exportMarkdown,
    exportPDF: exportPDF
  }
})()
