const PlacementData = {
  trends: {
    2024: { avgPackage: 650000, maxPackage: 3200000, placementRate: 78, totalStudents: 1200 },
    2025: { avgPackage: 720000, maxPackage: 3500000, placementRate: 82, totalStudents: 1350 },
    2026: { avgPackage: 800000, maxPackage: 4000000, placementRate: 85, totalStudents: 1500 }
  },
  industryDemand: {
    'AI & Machine Learning': { demand: 'critical', avgPremium: 35, growthRate: 28 },
    'Data Science & Analytics': { demand: 'high', avgPremium: 25, growthRate: 22 },
    'Cloud Computing': { demand: 'critical', avgPremium: 30, growthRate: 25 },
    'Cyber Security': { demand: 'high', avgPremium: 28, growthRate: 30 },
    'Full Stack Development': { demand: 'high', avgPremium: 15, growthRate: 18 },
    'DevOps': { demand: 'high', avgPremium: 22, growthRate: 20 },
    'Product Management': { demand: 'medium', avgPremium: 20, growthRate: 15 },
    'Data Engineering': { demand: 'high', avgPremium: 25, growthRate: 24 }
  },
  skillPremiums: {
    'Machine Learning': 30,
    'Deep Learning': 35,
    'AWS': 25,
    'Kubernetes': 28,
    'TensorFlow': 32,
    'PyTorch': 32,
    'LLMs': 40,
    'System Design': 20,
    'Cloud Computing': 25,
    'Data Engineering': 22
  },
  topHiringPatterns: [
    { company: 'Google', roles: ['SWE', 'ML Engineer', 'Data Scientist'], avgSkillCount: 8 },
    { company: 'Microsoft', roles: ['SWE', 'Data Scientist', 'Cloud Engineer'], avgSkillCount: 7 },
    { company: 'Amazon', roles: ['SDE', 'Data Engineer', 'ML Engineer'], avgSkillCount: 8 },
    { company: 'TCS Digital', roles: ['Software Engineer', 'Data Analyst', 'Cloud Engineer'], avgSkillCount: 6 },
    { company: 'Infosys', roles: ['Software Engineer', 'Data Analyst', 'Testing'], avgSkillCount: 5 }
  ],
  placementTips: [
    { category: 'Resume', tips: ['Quantify achievements with metrics', 'Tailor resume to target role', 'Keep it to 1 page for freshers'] },
    { category: 'Technical', tips: ['Master DSA for coding rounds', 'Build 2-3 strong portfolio projects', 'Practice system design basics'] },
    { category: 'Soft Skills', tips: ['Prepare your introduction (30 seconds)', 'Practice behavioral questions (STAR method)', 'Research the company before interviews'] },
    { category: 'Preparation', tips: ['Start preparing 6 months before placement season', 'Give mock interviews regularly', 'Solve 100+ LeetCode problems'] }
  ],
  collegeComparison: [
    { tier: 'Tier 1 (IITs/NITs)', avgPackage: 1800000, topPackage: 4500000, placementRate: 92 },
    { tier: 'Tier 2 (State Govt/Deemed)', avgPackage: 800000, topPackage: 2500000, placementRate: 78 },
    { tier: 'Tier 3 (Private/Others)', avgPackage: 450000, topPackage: 1200000, placementRate: 60 }
  ],
  domainSalaries: {
    'Data Science': { fresher: { min: 600000, max: 1200000 }, experienced: { min: 1200000, max: 3000000 } },
    'Machine Learning': { fresher: { min: 800000, max: 1500000 }, experienced: { min: 1500000, max: 3500000 } },
    'Software Engineering': { fresher: { min: 500000, max: 1000000 }, experienced: { min: 1000000, max: 2500000 } },
    'Cloud Engineering': { fresher: { min: 700000, max: 1300000 }, experienced: { min: 1300000, max: 2800000 } },
    'Data Analytics': { fresher: { min: 400000, max: 800000 }, experienced: { min: 800000, max: 1800000 } },
    'Cyber Security': { fresher: { min: 600000, max: 1200000 }, experienced: { min: 1200000, max: 2800000 } }
  }
}

if (typeof window !== 'undefined') window.PlacementData = PlacementData

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlacementData }
}
