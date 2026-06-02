const mongoose = require('mongoose')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const User = require('./models/User')
const Profile = require('./models/Profile')
const env = require('./config/env')

const DEMO_SKILLS = [
  { name: 'Python', category: 'Programming Languages', level: 92, importance: 95, growthTrend: 'up' },
  { name: 'JavaScript', category: 'Programming Languages', level: 88, importance: 90, growthTrend: 'up' },
  { name: 'React', category: 'Frontend', level: 85, importance: 85, growthTrend: 'up' },
  { name: 'Node.js', category: 'Backend', level: 80, importance: 80, growthTrend: 'up' },
  { name: 'MongoDB', category: 'Databases', level: 75, importance: 70, growthTrend: 'stable' },
  { name: 'SQL', category: 'Databases', level: 78, importance: 75, growthTrend: 'stable' },
  { name: 'TensorFlow', category: 'AI & Data Science', level: 72, importance: 85, growthTrend: 'up' },
  { name: 'Machine Learning', category: 'AI & Data Science', level: 76, importance: 90, growthTrend: 'up' },
  { name: 'Deep Learning', category: 'AI & Data Science', level: 68, importance: 80, growthTrend: 'up' },
  { name: 'Docker', category: 'DevOps', level: 65, importance: 70, growthTrend: 'up' },
  { name: 'Git', category: 'Dev Tools', level: 90, importance: 80, growthTrend: 'stable' },
  { name: 'Data Structures', category: 'Programming Languages', level: 88, importance: 95, growthTrend: 'stable' },
  { name: 'Algorithms', category: 'Programming Languages', level: 85, importance: 95, growthTrend: 'stable' },
  { name: 'Communication', category: 'Soft Skills', level: 82, importance: 80, growthTrend: 'stable' },
  { name: 'Teamwork', category: 'Soft Skills', level: 85, importance: 75, growthTrend: 'stable' },
  { name: 'Problem Solving', category: 'Soft Skills', level: 90, importance: 90, growthTrend: 'stable' },
]

const DEMO_PROJECTS = [
  {
    title: 'AI-Powered Career Platform',
    description: 'Built a full-stack career intelligence platform with resume analysis, placement prediction, and skill gap analysis using React, Node.js, and MongoDB.',
    technologies: ['React', 'Node.js', 'MongoDB', 'TensorFlow'],
    url: 'https://github.com/aryan-dev/career-platform',
    githubUrl: 'https://github.com/aryan-dev/career-platform',
    startDate: '2025-09-01',
    endDate: '2026-04-15',
    impactScore: 92,
    complexityScore: 88,
    completed: true
  },
  {
    title: 'Real-time Chat Application',
    description: 'Developed a scalable real-time chat application with WebSocket support, user authentication, and message persistence.',
    technologies: ['Socket.io', 'Express', 'PostgreSQL', 'Redis'],
    url: 'https://github.com/aryan-dev/chat-app',
    githubUrl: 'https://github.com/aryan-dev/chat-app',
    startDate: '2025-05-01',
    endDate: '2025-08-30',
    impactScore: 78,
    complexityScore: 72,
    completed: true
  },
  {
    title: 'Machine Learning Model Deployment Pipeline',
    description: 'Designed an automated ML pipeline for model training, evaluation, and deployment using Docker and Kubernetes.',
    technologies: ['Python', 'Docker', 'Kubernetes', 'MLflow'],
    url: 'https://github.com/aryan-dev/ml-pipeline',
    githubUrl: 'https://github.com/aryan-dev/ml-pipeline',
    startDate: '2025-11-01',
    endDate: '2026-02-28',
    impactScore: 85,
    complexityScore: 90,
    completed: true
  },
  {
    title: 'E-commerce Recommendation Engine',
    description: 'Built a collaborative filtering recommendation system achieving 23% improvement in user engagement.',
    technologies: ['Python', 'Scikit-learn', 'FastAPI', 'PostgreSQL'],
    url: 'https://github.com/aryan-dev/recommendation-engine',
    githubUrl: 'https://github.com/aryan-dev/recommendation-engine',
    startDate: '2025-03-01',
    endDate: '2025-06-15',
    impactScore: 82,
    complexityScore: 76,
    completed: true
  },
  {
    title: 'Personal Portfolio Website',
    description: 'Created an interactive portfolio website with dark mode, animations, and performance optimization.',
    technologies: ['React', 'Next.js', 'Framer Motion', 'Vercel'],
    url: 'https://aryan-sharma.dev',
    githubUrl: 'https://github.com/aryan-dev/portfolio',
    startDate: '2025-01-15',
    endDate: '2025-02-20',
    impactScore: 70,
    complexityScore: 55,
    completed: true
  },
]

const DEMO_CERTIFICATIONS = [
  {
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    url: 'https://aws.amazon.com/certification/',
    issueDate: '2025-08-15',
    expiryDate: '2028-08-15',
    credentialId: 'AWS-ASA-2025-12345',
    skillMapping: ['Cloud Computing', 'AWS', 'Architecture']
  },
  {
    name: 'Deep Learning Specialization',
    issuer: 'deeplearning.ai',
    url: 'https://www.coursera.org/specializations/deep-learning',
    issueDate: '2025-06-10',
    credentialId: 'DL-SPEC-2025-6789',
    skillMapping: ['TensorFlow', 'Neural Networks', 'Deep Learning']
  },
  {
    name: 'Google Data Analytics Professional Certificate',
    issuer: 'Google',
    url: 'https://grow.google/certificates/data-analytics/',
    issueDate: '2025-04-20',
    credentialId: 'GDA-2025-4567',
    skillMapping: ['Data Analysis', 'SQL', 'Statistics']
  },
  {
    name: 'MongoDB Associate Developer',
    issuer: 'MongoDB University',
    url: 'https://learn.mongodb.com/',
    issueDate: '2025-11-05',
    credentialId: 'MDB-DEV-2025-8901',
    skillMapping: ['MongoDB', 'NoSQL', 'Database Design']
  },
]

const DEMO_INTERNSHIPS = [
  {
    company: 'TechCorp India',
    role: 'Software Engineering Intern',
    description: 'Worked on building RESTful APIs and microservices for the company\'s flagship product. Reduced API response time by 40% through query optimization.',
    startDate: '2025-05-01',
    endDate: '2025-07-31',
    skillsGained: ['Node.js', 'PostgreSQL', 'Docker', 'Microservices'],
    url: '',
    completed: true
  },
  {
    company: 'AI Startup Labs',
    role: 'Data Science Intern',
    description: 'Developed ML models for customer churn prediction achieving 89% accuracy. Built automated data pipelines and visualization dashboards.',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    skillsGained: ['Python', 'Scikit-learn', 'Pandas', 'Tableau'],
    url: '',
    completed: true
  },
]

const DEMO_EDUCATION = [
  {
    institution: 'Indian Institute of Technology',
    degree: 'B.Tech',
    field: 'Computer Science and Engineering',
    startYear: 2023,
    endYear: 2027,
    grade: '8.5/10'
  }
]

async function seedDemoData () {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 })
    console.log('[Seed] Connected to MongoDB')

    const studentUser = await User.findOne({ email: 'student@skillpilot.ai' })
    if (!studentUser) {
      console.log('[Seed] Student user not found. Run node src/seed.js first.')
      process.exit(1)
    }

    let profile = await Profile.findOne({ user: studentUser._id })
    if (!profile) {
      profile = await Profile.create({ user: studentUser._id })
    }

    profile.headline = 'Computer Science Student & Full-Stack Developer'
    profile.bio = 'Passionate CS undergraduate with expertise in full-stack development, machine learning, and cloud computing. Built 5+ production-ready projects and interned at leading tech companies. Looking for opportunities in software engineering and data science roles.'
    profile.phone = '+91-9876543210'
    profile.location = 'Mumbai, India'
    profile.skills = DEMO_SKILLS
    profile.projects = DEMO_PROJECTS
    profile.certifications = DEMO_CERTIFICATIONS
    profile.internships = DEMO_INTERNSHIPS
    profile.education = DEMO_EDUCATION
    profile.socialLinks = {
      github: 'https://github.com/aryan-dev',
      linkedin: 'https://linkedin.com/in/aryansharma',
      twitter: 'https://twitter.com/aryansharma',
      portfolio: 'https://aryan-sharma.dev'
    }
    profile.preferences = {
      careerGoals: ['Become a lead data scientist at a top tech company', 'Build AI products that impact millions of users'],
      preferredRoles: ['Software Engineer', 'Data Scientist', 'Machine Learning Engineer'],
      preferredLocations: ['Bangalore', 'Mumbai', 'Remote'],
      workType: 'remote'
    }

    await profile.save()
    console.log('[Seed] Demo profile data populated for student@skillpilot.ai')

    // Also seed mentor profile
    const mentorUser = await User.findOne({ email: 'mentor@skillpilot.ai' })
    if (mentorUser) {
      let mentorProfile = await Profile.findOne({ user: mentorUser._id })
      if (!mentorProfile) {
        mentorProfile = await Profile.create({ user: mentorUser._id })
      }
      mentorProfile.headline = 'Senior Software Engineer & Mentor'
      mentorProfile.bio = 'Industry professional with 8+ years of experience in software development and team leadership. Passionate about mentoring the next generation of engineers.'
      mentorProfile.location = 'Bangalore, India'
      mentorProfile.skills = [
        { name: 'System Design', category: 'Backend', level: 95, importance: 95, growthTrend: 'stable' },
        { name: 'Java', category: 'Programming Languages', level: 92, importance: 90, growthTrend: 'stable' },
        { name: 'Microservices', category: 'Backend', level: 90, importance: 88, growthTrend: 'up' },
        { name: 'Mentoring', category: 'Soft Skills', level: 95, importance: 85, growthTrend: 'stable' },
        { name: 'Technical Leadership', category: 'Soft Skills', level: 90, importance: 90, growthTrend: 'up' },
      ]
      mentorProfile.socialLinks = {
        github: 'https://github.com/priyapatel',
        linkedin: 'https://linkedin.com/in/drpriyapatel',
      }
      await mentorProfile.save()
      console.log('[Seed] Demo profile data populated for mentor@skillpilot.ai')
    }

    console.log('[Seed] Done!')
    process.exit(0)
  } catch (err) {
    console.error('[Seed] Error:', err.message)
    process.exit(1)
  }
}

seedDemoData()
