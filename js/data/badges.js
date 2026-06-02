const BadgeDefinitions = [
  {
    id: 'first_login',
    name: 'First Launch',
    description: 'Logged into SkillPilot AI for the first time',
    icon: 'fa-rocket',
    color: 'var(--primary)',
    condition: 'Login once',
    rarity: 'common'
  },
  {
    id: 'profile_complete',
    name: 'Profile Pro',
    description: 'Completed all profile sections including skills, projects, and links',
    icon: 'fa-user-check',
    color: 'var(--success)',
    condition: 'Fill all profile fields',
    rarity: 'common'
  },
  {
    id: 'resume_uploaded',
    name: 'Resume Uploaded',
    description: 'Uploaded resume for AI analysis',
    icon: 'fa-file-lines',
    color: 'var(--primary)',
    condition: 'Upload your resume',
    rarity: 'common'
  },
  {
    id: 'resume_scored',
    name: 'Resume Analyzed',
    description: 'Received AI-powered resume analysis with score and suggestions',
    icon: 'fa-chart-bar',
    color: 'var(--accent)',
    condition: 'Complete resume analysis',
    rarity: 'common'
  },
  {
    id: 'career_explorer',
    name: 'Career Explorer',
    description: 'Explored 3+ career paths with match analysis',
    icon: 'fa-compass',
    color: 'var(--info)',
    condition: 'View 3+ career paths',
    rarity: 'common'
  },
  {
    id: 'skill_tracker',
    name: 'Skill Tracker',
    description: 'Completed skill gap analysis for a target role',
    icon: 'fa-bullseye',
    color: 'var(--success)',
    condition: 'Complete skill gap analysis',
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: 'fa-fire',
    color: 'var(--warning)',
    condition: '7 consecutive days active',
    rarity: 'uncommon'
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintained a 30-day learning streak',
    icon: 'fa-fire-flame-curved',
    color: 'var(--warning)',
    condition: '30 consecutive days active',
    rarity: 'rare'
  },
  {
    id: 'placement_predicted',
    name: 'Placement Predictor',
    description: 'Generated placement probability analysis',
    icon: 'fa-chart-line',
    color: 'var(--primary)',
    condition: 'Run placement prediction',
    rarity: 'common'
  },
  {
    id: 'portfolio_built',
    name: 'Portfolio Builder',
    description: 'Generated portfolio analysis with readiness score',
    icon: 'fa-briefcase',
    color: 'var(--accent)',
    condition: 'Build your portfolio',
    rarity: 'common'
  },
  {
    id: 'github_connected',
    name: 'GitHub Connected',
    description: 'Connected GitHub profile and viewed analytics',
    icon: 'fa-github',
    color: 'var(--dark)',
    condition: 'Connect GitHub account',
    rarity: 'common'
  },
  {
    id: 'roadmap_generated',
    name: 'Roadmap Ready',
    description: 'Generated a personalized learning roadmap',
    icon: 'fa-road',
    color: 'var(--success)',
    condition: 'Create a learning roadmap',
    rarity: 'common'
  },
  {
    id: 'all_modules',
    name: 'SkillPilot Explorer',
    description: 'Visited every module in SkillPilot AI',
    icon: 'fa-crown',
    color: 'var(--warning)',
    condition: 'Visit all 10 pages',
    rarity: 'rare'
  },
  {
    id: 'recruiter_ready',
    name: 'Recruiter Ready',
    description: 'Achieved Recruiter Readiness Score above 80',
    icon: 'fa-medal',
    color: 'var(--accent)',
    condition: 'Recruiter score > 80',
    rarity: 'epic'
  },
  {
    id: 'top_performer',
    name: 'Top Performer',
    description: 'Achieved career readiness score above 90',
    icon: 'fa-trophy',
    color: 'var(--warning)',
    condition: 'Career readiness > 90',
    rarity: 'legendary'
  }
]

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BadgeDefinitions }
}
