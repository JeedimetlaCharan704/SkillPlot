var DemoProfile = {
  user: {
    id: 'usr_demo_001',
    name: 'Aryan Sharma',
    email: 'aryan.sharma@skillpilot.ai',
    role: 'student',
    avatar: null,
    cgpa: 8.5,
    githubUsername: 'aryan-dev',
    linkedinUrl: 'https://linkedin.com/in/aryansharma',
    joinedAt: '2026-01-15T08:00:00.000Z',
    bio: 'BCA student passionate about AI, full-stack development, and building products that help people grow.',
    phone: '+91 9876543210',
    location: 'Aurora Campus, Hyderabad',
    degree: 'BCA',
    department: 'Computer Applications',
    semester: '6th Semester',
    rollNo: 'AU24BCA045'
  },

  skills: [
    { name: 'Python', level: 85, category: 'Programming Languages', importance: 0.95, growthTrend: 'stable' },
    { name: 'JavaScript', level: 80, category: 'Programming Languages', importance: 0.90, growthTrend: 'stable' },
    { name: 'TypeScript', level: 60, category: 'Programming Languages', importance: 0.85, growthTrend: 'growing' },
    { name: 'Java', level: 65, category: 'Programming Languages', importance: 0.75, growthTrend: 'declining' },
    { name: 'C++', level: 50, category: 'Programming Languages', importance: 0.60, growthTrend: 'stable' },
    { name: 'Machine Learning', level: 55, category: 'AI & Data Science', importance: 0.95, growthTrend: 'growing' },
    { name: 'Data Analysis', level: 70, category: 'AI & Data Science', importance: 0.90, growthTrend: 'growing' },
    { name: 'Deep Learning', level: 35, category: 'AI & Data Science', importance: 0.85, growthTrend: 'growing' },
    { name: 'NLP', level: 30, category: 'AI & Data Science', importance: 0.80, growthTrend: 'growing' },
    { name: 'TensorFlow', level: 25, category: 'AI & Data Science', importance: 0.85, growthTrend: 'growing' },
    { name: 'React', level: 75, category: 'Frontend', importance: 0.85, growthTrend: 'stable' },
    { name: 'HTML/CSS', level: 90, category: 'Frontend', importance: 0.80, growthTrend: 'stable' },
    { name: 'Node.js', level: 70, category: 'Backend', importance: 0.85, growthTrend: 'stable' },
    { name: 'Express', level: 65, category: 'Backend', importance: 0.80, growthTrend: 'stable' },
    { name: 'SQL', level: 75, category: 'Databases', importance: 0.90, growthTrend: 'stable' },
    { name: 'MongoDB', level: 60, category: 'Databases', importance: 0.80, growthTrend: 'stable' },
    { name: 'Git', level: 80, category: 'Dev Tools', importance: 0.85, growthTrend: 'stable' },
    { name: 'Docker', level: 40, category: 'DevOps', importance: 0.80, growthTrend: 'growing' },
    { name: 'AWS', level: 30, category: 'Cloud', importance: 0.90, growthTrend: 'growing' },
    { name: 'Communication', level: 75, category: 'Soft Skills', importance: 0.85, growthTrend: 'stable' },
    { name: 'Problem Solving', level: 80, category: 'Soft Skills', importance: 0.90, growthTrend: 'stable' },
    { name: 'Teamwork', level: 78, category: 'Soft Skills', importance: 0.80, growthTrend: 'stable' }
  ],

  projects: [
    {
      id: 'proj_1',
      name: 'SkillPilot AI',
      description: 'AI-powered career intelligence platform featuring resume analysis, career recommendation engine, skill gap detection, placement prediction, and portfolio builder with recruiter readiness scoring.',
      technologies: ['JavaScript', 'Chart.js', 'CSS', 'localStorage'],
      url: 'https://github.com/aryan-dev/skillpilot',
      demoUrl: null,
      completed: true,
      year: 2026,
      complexityScore: 85,
      impactScore: 90
    },
    {
      id: 'proj_2',
      name: 'ML Resume Analyzer',
      description: 'Machine learning based resume scoring system that analyzes keyword density, section coverage, and formatting to compute ATS compatibility and provide improvement suggestions.',
      technologies: ['Python', 'scikit-learn', 'NLTK', 'Flask'],
      url: 'https://github.com/aryan-dev/resume-analyzer',
      demoUrl: null,
      completed: true,
      year: 2025,
      complexityScore: 75,
      impactScore: 80
    },
    {
      id: 'proj_3',
      name: 'E-Commerce Dashboard',
      description: 'Real-time analytics dashboard for e-commerce platforms featuring sales forecasting, customer segmentation, and inventory optimization using ML models.',
      technologies: ['React', 'Python', 'Pandas', 'D3.js', 'Node.js'],
      url: 'https://github.com/aryan-dev/ecom-dashboard',
      demoUrl: null,
      completed: true,
      year: 2025,
      complexityScore: 80,
      impactScore: 75
    },
    {
      id: 'proj_4',
      name: 'Smart Campus Portal',
      description: 'Integrated campus management system with attendance tracking, grade analysis, event management, and placement preparation modules.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Firebase'],
      url: 'https://github.com/aryan-dev/campus-portal',
      demoUrl: null,
      completed: true,
      year: 2024,
      complexityScore: 70,
      impactScore: 85
    },
    {
      id: 'proj_5',
      name: 'GitHub Contribution Tracker',
      description: 'CLI tool and web dashboard to track GitHub contributions, visualize language distribution, and assess project quality metrics across repositories.',
      technologies: ['Python', 'GitHub API', 'Chart.js'],
      url: null,
      demoUrl: null,
      completed: false,
      year: 2026,
      complexityScore: 60,
      impactScore: 65
    }
  ],

  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2025-11-15',
      url: 'https://aws.amazon.com/certification/',
      category: 'Cloud',
      skillMapping: ['AWS', 'Cloud Computing']
    },
    {
      id: 'cert_2',
      name: 'Google Data Analytics Professional',
      issuer: 'Google via Coursera',
      date: '2025-08-20',
      url: 'https://coursera.org/',
      category: 'Data Science',
      skillMapping: ['Data Analysis', 'SQL', 'Python']
    },
    {
      id: 'cert_3',
      name: 'Meta Front-End Developer Professional',
      issuer: 'Meta via Coursera',
      date: '2025-06-10',
      url: 'https://coursera.org/',
      category: 'Development',
      skillMapping: ['React', 'JavaScript', 'HTML/CSS']
    }
  ],

  internships: [
    {
      id: 'intern_1',
      company: 'TechSolutions Inc.',
      role: 'Software Development Intern',
      duration: '3 months',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      technologies: ['React', 'Node.js', 'MongoDB'],
      skillsGained: ['React', 'Node.js', 'MongoDB', 'Team Collaboration'],
      completed: true,
      year: 2025
    }
  ],

  github: {
    username: 'aryan-dev',
    repoCount: 18,
    stars: 24,
    followers: 12,
    following: 8,
    languages: {
      JavaScript: 35,
      Python: 28,
      TypeScript: 12,
      HTML: 10,
      CSS: 8,
      Java: 5,
      Others: 2
    },
    activityScore: 72,
    contributionScore: 65,
    lastActive: '2026-05-28'
  },

  linkedin: {
    profileUrl: 'https://linkedin.com/in/aryansharma',
    completeness: 70,
    connections: 186,
    recommendations: 2
  },

  badges: [
    { id: 'first_login', name: 'First Login', unlockedAt: '2026-01-15T08:00:00.000Z', condition: 'Log in for the first time' },
    { id: 'profile_complete', name: 'Profile Pro', unlockedAt: '2026-01-15T10:00:00.000Z', condition: 'Complete all profile sections' },
    { id: 'resume_uploaded', name: 'Resume Ready', unlockedAt: '2026-01-16T14:00:00.000Z', condition: 'Upload your resume' },
    { id: 'career_explorer', name: 'Career Explorer', unlockedAt: '2026-01-18T09:00:00.000Z', condition: 'Check 3+ career paths' },
    { id: 'skill_tracker', name: 'Skill Tracker', unlockedAt: '2026-01-20T11:00:00.000Z', condition: 'Add 10+ skills to your profile' },
    { id: 'streak_7', name: '7-Day Streak', unlockedAt: '2026-01-22T18:00:00.000Z', condition: 'Maintain a 7-day learning streak' }
  ],

  learningHistory: [
    { type: 'skill_learned', title: 'Completed TypeScript basics', date: '2026-05-20', category: 'Programming Languages' },
    { type: 'skill_learned', title: 'Learned Docker fundamentals', date: '2026-05-18', category: 'DevOps' },
    { type: 'project_added', title: 'Added GitHub Contribution Tracker', date: '2026-05-15', category: 'Projects' },
    { type: 'certification_earned', title: 'Earned AWS Cloud Practitioner', date: '2025-11-15', category: 'Cloud' },
    { type: 'skill_learned', title: 'Learned AWS basics', date: '2025-11-10', category: 'Cloud' },
    { type: 'resume_uploaded', title: 'Uploaded resume for analysis', date: '2025-10-05', category: 'Resume' },
    { type: 'certification_earned', title: 'Earned Google Data Analytics Professional', date: '2025-08-20', category: 'Data Science' },
    { type: 'internship_completed', title: 'Completed internship at TechSolutions Inc.', date: '2025-08-31', category: 'Internship' },
    { type: 'skill_learned', title: 'Learned Machine Learning concepts', date: '2025-07-15', category: 'AI & Data Science' },
    { type: 'project_added', title: 'Added ML Resume Analyzer', date: '2025-06-20', category: 'Projects' },
    { type: 'internship_started', title: 'Started internship at TechSolutions Inc.', date: '2025-06-01', category: 'Internship' },
    { type: 'certification_earned', title: 'Earned Meta Front-End Developer Professional', date: '2025-06-10', category: 'Development' },
    { type: 'skill_learned', title: 'Learned React', date: '2025-05-10', category: 'Frontend' },
    { type: 'project_added', title: 'Added E-Commerce Dashboard', date: '2025-04-15', category: 'Projects' },
    { type: 'project_added', title: 'Added Smart Campus Portal', date: '2024-11-20', category: 'Projects' }
  ],

  learningStreak: {
    current: 12,
    longest: 21,
    lastActive: new Date().toDateString()
  },

  resumeAnalysis: {
    resumeScore: 82,
    atsScore: 78,
    keywordMatch: {
      matched: [
        { keyword: 'Python', count: 4, category: 'Programming Languages' },
        { keyword: 'JavaScript', count: 6, category: 'Programming Languages' },
        { keyword: 'React', count: 3, category: 'Frontend' },
        { keyword: 'Node.js', count: 2, category: 'Backend' },
        { keyword: 'SQL', count: 3, category: 'Databases' },
        { keyword: 'Machine Learning', count: 2, category: 'AI & Data Science' },
        { keyword: 'Git', count: 2, category: 'Dev Tools' },
        { keyword: 'Docker', count: 1, category: 'DevOps' },
        { keyword: 'Data Analysis', count: 3, category: 'AI & Data Science' },
        { keyword: 'Agile', count: 1, category: 'Methodologies' }
      ],
      missing: [
        { keyword: 'Kubernetes', importance: 0.6, category: 'DevOps' },
        { keyword: 'TensorFlow', importance: 0.8, category: 'AI & Data Science' },
        { keyword: 'AWS', importance: 0.9, category: 'Cloud' },
        { keyword: 'GraphQL', importance: 0.5, category: 'Backend' }
      ]
    },
    sections: { present: ['Education', 'Skills', 'Projects', 'Experience'], missing: ['Certifications'] },
    strengths: ['Strong keyword presence in programming languages', 'Good section coverage (4/5 required sections)', 'Well formatted with contact info and links'],
    weaknesses: ['Missing Certifications section', 'No Machine Learning project detailed', 'Could add more cloud computing keywords'],
    suggestions: ['Add "Certifications" section to showcase AWS and Google certs', 'Include a dedicated ML/AI project with results', 'Add cloud keywords (AWS, GCP, Azure) to improve ATS score', 'Quantify achievements with metrics and numbers'],
    formatScore: 85,
    lengthScore: 90,
    confidence: 'High'
  },

  careerRecommendations: {
    topRecommendation: { title: 'Data Scientist', matchPercentage: 78 },
    recommendations: []
  },

  placementPrediction: {
    probability: 76,
    overallScore: 76,
    topCompanies: [
      { name: 'TCS Digital', matchScore: 74 },
      { name: 'Infosys', matchScore: 70 },
      { name: 'Accenture', matchScore: 72 },
      { name: 'Wipro', matchScore: 66 },
      { name: 'Cognizant', matchScore: 64 }
    ]
  },

  _meta: {
    isDemo: true,
    description: 'Pre-configured demo profile showcasing all SkillPilot AI features',
    lastUpdated: new Date().toISOString()
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DemoProfile }
}

// Patch for window access (const at top level does not create window property)
if (typeof window !== 'undefined') {
  window.DemoProfile = DemoProfile
}
