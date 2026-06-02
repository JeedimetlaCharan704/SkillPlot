var DemoStudents = [
  {
    id: 'stu_001', name: 'Aryan Sharma', email: 'aryan.sharma@skillpilot.ai', role: 'student',
    readiness: 82, placementProbability: 76, resumeScore: 82, profileStrength: 78,
    skillLevel: 72, projectsCount: 5, certificationsCount: 3, internshipsCount: 1,
    hasGithub: true, hasLinkedin: true, githubActivity: 72,
    careerInterest: 'Data Science', riskLevel: 'low',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning', 'Data Analysis'],
    weakSkills: ['Docker', 'AWS', 'Kubernetes'],
    learningHistory: [
      { type: 'skill_learned', title: 'Completed TypeScript basics', date: '2026-05-20' },
      { type: 'certification_earned', title: 'Earned AWS Cloud Practitioner', date: '2025-11-15' }
    ],
    recentActivity: '2026-05-28'
  },
  {
    id: 'stu_002', name: 'Priya Patel', email: 'priya.patel@skillpilot.ai', role: 'student',
    readiness: 68, placementProbability: 62, resumeScore: 65, profileStrength: 60,
    skillLevel: 58, projectsCount: 3, certificationsCount: 1, internshipsCount: 0,
    hasGithub: true, hasLinkedin: true, githubActivity: 45,
    careerInterest: 'Full Stack Development', riskLevel: 'medium',
    skills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Git'],
    weakSkills: ['Python', 'SQL', 'Machine Learning', 'Docker'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned Meta Front-End Developer', date: '2025-06-10' },
      { type: 'project_added', title: 'Added Weather Dashboard', date: '2026-03-15' }
    ],
    recentActivity: '2026-05-20'
  },
  {
    id: 'stu_003', name: 'Rahul Verma', email: 'rahul.verma@skillpilot.ai', role: 'student',
    readiness: 45, placementProbability: 38, resumeScore: 42, profileStrength: 35,
    skillLevel: 32, projectsCount: 1, certificationsCount: 0, internshipsCount: 0,
    hasGithub: false, hasLinkedin: false, githubActivity: 0,
    careerInterest: 'Cloud Computing', riskLevel: 'high',
    skills: ['Java', 'C++'],
    weakSkills: ['Python', 'JavaScript', 'SQL', 'Cloud Platforms'],
    learningHistory: [],
    recentActivity: '2026-04-10'
  },
  {
    id: 'stu_004', name: 'Sneha Gupta', email: 'sneha.gupta@skillpilot.ai', role: 'student',
    readiness: 91, placementProbability: 88, resumeScore: 90, profileStrength: 88,
    skillLevel: 85, projectsCount: 7, certificationsCount: 4, internshipsCount: 2,
    hasGithub: true, hasLinkedin: true, githubActivity: 88,
    careerInterest: 'AI & Machine Learning', riskLevel: 'low',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'SQL', 'Data Analysis', 'JavaScript'],
    weakSkills: ['DevOps', 'Docker'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned TensorFlow Developer Certificate', date: '2026-02-15' },
      { type: 'internship_completed', title: 'Completed AI Internship at Google', date: '2025-12-20' },
      { type: 'project_added', title: 'Added NLP Sentiment Analyzer', date: '2026-04-10' }
    ],
    recentActivity: '2026-05-30'
  },
  {
    id: 'stu_005', name: 'Arjun Singh', email: 'arjun.singh@skillpilot.ai', role: 'student',
    readiness: 55, placementProbability: 50, resumeScore: 52, profileStrength: 48,
    skillLevel: 45, projectsCount: 2, certificationsCount: 1, internshipsCount: 0,
    hasGithub: true, hasLinkedin: false, githubActivity: 30,
    careerInterest: 'Backend Development', riskLevel: 'medium',
    skills: ['Java', 'Spring Boot', 'SQL', 'Git'],
    weakSkills: ['JavaScript', 'React', 'Docker', 'Cloud'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned Oracle Java SE 8', date: '2025-09-15' }
    ],
    recentActivity: '2026-05-15'
  },
  {
    id: 'stu_006', name: 'Neha Joshi', email: 'neha.joshi@skillpilot.ai', role: 'student',
    readiness: 73, placementProbability: 70, resumeScore: 72, profileStrength: 68,
    skillLevel: 65, projectsCount: 4, certificationsCount: 2, internshipsCount: 1,
    hasGithub: true, hasLinkedin: true, githubActivity: 55,
    careerInterest: 'Frontend Development', riskLevel: 'low',
    skills: ['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Git', 'Node.js'],
    weakSkills: ['Python', 'SQL', 'DevOps'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned Google UX Design', date: '2025-12-01' },
      { type: 'internship_completed', title: 'Completed Frontend Internship', date: '2025-08-15' }
    ],
    recentActivity: '2026-05-22'
  },
  {
    id: 'stu_007', name: 'Vikram Reddy', email: 'vikram.reddy@skillpilot.ai', role: 'student',
    readiness: 35, placementProbability: 28, resumeScore: 30, profileStrength: 25,
    skillLevel: 22, projectsCount: 0, certificationsCount: 0, internshipsCount: 0,
    hasGithub: false, hasLinkedin: false, githubActivity: 0,
    careerInterest: 'Data Science', riskLevel: 'critical',
    skills: [],
    weakSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
    learningHistory: [],
    recentActivity: '2026-03-01'
  },
  {
    id: 'stu_008', name: 'Ananya Das', email: 'ananya.das@skillpilot.ai', role: 'student',
    readiness: 78, placementProbability: 74, resumeScore: 76, profileStrength: 72,
    skillLevel: 68, projectsCount: 4, certificationsCount: 2, internshipsCount: 1,
    hasGithub: true, hasLinkedin: true, githubActivity: 60,
    careerInterest: 'Data Analytics', riskLevel: 'low',
    skills: ['Python', 'SQL', 'Data Analysis', 'Tableau', 'Excel', 'Statistics'],
    weakSkills: ['Machine Learning', 'Deep Learning', 'Cloud'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned Google Data Analytics Professional', date: '2025-08-20' },
      { type: 'project_added', title: 'Added Sales Dashboard', date: '2026-02-28' }
    ],
    recentActivity: '2026-05-25'
  },
  {
    id: 'stu_009', name: 'Rohit Kumar', email: 'rohit.kumar@skillpilot.ai', role: 'student',
    readiness: 52, placementProbability: 48, resumeScore: 50, profileStrength: 45,
    skillLevel: 40, projectsCount: 2, certificationsCount: 0, internshipsCount: 0,
    hasGithub: true, hasLinkedin: false, githubActivity: 25,
    careerInterest: 'DevOps', riskLevel: 'high',
    skills: ['Linux', 'Git', 'Docker', 'Python'],
    weakSkills: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'JavaScript'],
    learningHistory: [
      { type: 'skill_learned', title: 'Learned Docker fundamentals', date: '2026-04-20' }
    ],
    recentActivity: '2026-05-10'
  },
  {
    id: 'stu_010', name: 'Kavya Nair', email: 'kavya.nair@skillpilot.ai', role: 'student',
    readiness: 85, placementProbability: 82, resumeScore: 84, profileStrength: 80,
    skillLevel: 78, projectsCount: 6, certificationsCount: 3, internshipsCount: 1,
    hasGithub: true, hasLinkedin: true, githubActivity: 75,
    careerInterest: 'Full Stack Development', riskLevel: 'low',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB', 'Git'],
    weakSkills: ['AWS', 'System Design'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned AWS Developer Associate', date: '2026-01-20' },
      { type: 'project_added', title: 'Deployed E-Commerce Platform', date: '2026-04-05' }
    ],
    recentActivity: '2026-05-29'
  },
  {
    id: 'stu_011', name: 'Aditya Sharma', email: 'aditya.sharma@skillpilot.ai', role: 'student',
    readiness: 62, placementProbability: 58, resumeScore: 60, profileStrength: 55,
    skillLevel: 52, projectsCount: 3, certificationsCount: 1, internshipsCount: 0,
    hasGithub: true, hasLinkedin: true, githubActivity: 35,
    careerInterest: 'Mobile Development', riskLevel: 'medium',
    skills: ['Java', 'Kotlin', 'Android', 'Firebase', 'Git'],
    weakSkills: ['Python', 'JavaScript', 'React Native', 'Cloud'],
    learningHistory: [
      { type: 'certification_earned', title: 'Earned Associate Android Developer', date: '2025-11-10' }
    ],
    recentActivity: '2026-05-18'
  },
  {
    id: 'stu_012', name: 'Isha Mehta', email: 'isha.mehta@skillpilot.ai', role: 'student',
    readiness: 40, placementProbability: 35, resumeScore: 38, profileStrength: 32,
    skillLevel: 28, projectsCount: 1, certificationsCount: 0, internshipsCount: 0,
    hasGithub: false, hasLinkedin: true, githubActivity: 0,
    careerInterest: 'Data Science', riskLevel: 'high',
    skills: ['Python'],
    weakSkills: ['SQL', 'Machine Learning', 'Statistics', 'Data Analysis', 'JavaScript'],
    learningHistory: [],
    recentActivity: '2026-04-25'
  }
]

if (typeof window !== 'undefined') { window.DemoStudents = DemoStudents }
