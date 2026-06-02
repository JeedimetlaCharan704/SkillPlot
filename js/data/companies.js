const CompaniesData = [
  { name: 'Google', industry: 'Technology', type: 'FAANG', avgSalary: { min: 1800000, max: 3500000 }, globalRank: 1, minScore: 85, roles: ['SWE', 'ML Engineer', 'Data Scientist'] },
  { name: 'Microsoft', industry: 'Technology', type: 'FAANG', avgSalary: { min: 1600000, max: 3000000 }, globalRank: 2, minScore: 82, roles: ['SWE', 'Data Scientist', 'Cloud Engineer'] },
  { name: 'Amazon', industry: 'Technology', type: 'FAANG', avgSalary: { min: 1500000, max: 2800000 }, globalRank: 3, minScore: 80, roles: ['SDE', 'Data Engineer', 'ML Engineer'] },
  { name: 'Apple', industry: 'Technology', type: 'FAANG', avgSalary: { min: 1700000, max: 3200000 }, globalRank: 4, minScore: 86, roles: ['SWE', 'ML Engineer'] },
  { name: 'Meta', industry: 'Technology', type: 'FAANG', avgSalary: { min: 1900000, max: 3600000 }, globalRank: 5, minScore: 87, roles: ['SWE', 'Data Scientist', 'AI Engineer'] },
  { name: 'Netflix', industry: 'Technology', type: 'FAANG', avgSalary: { min: 2000000, max: 4000000 }, globalRank: 6, minScore: 88, roles: ['SDE', 'Data Engineer'] },
  { name: 'TCS Digital', industry: 'IT Services', type: 'Indian IT', avgSalary: { min: 700000, max: 1200000 }, globalRank: 10, minScore: 65, roles: ['Software Engineer', 'Data Analyst', 'Cloud Engineer'] },
  { name: 'Infosys', industry: 'IT Services', type: 'Indian IT', avgSalary: { min: 500000, max: 900000 }, globalRank: 12, minScore: 58, roles: ['Software Engineer', 'Data Analyst', 'Testing'] },
  { name: 'Wipro', industry: 'IT Services', type: 'Indian IT', avgSalary: { min: 450000, max: 800000 }, globalRank: 15, minScore: 55, roles: ['Software Engineer', 'Testing'] },
  { name: 'Accenture', industry: 'Consulting', type: 'MNC', avgSalary: { min: 600000, max: 1100000 }, globalRank: 8, minScore: 62, roles: ['Consultant', 'Data Analyst', 'Tech Analyst'] },
  { name: 'Cognizant', industry: 'IT Services', type: 'Indian IT', avgSalary: { min: 500000, max: 900000 }, globalRank: 14, minScore: 56, roles: ['Software Engineer', 'Data Analyst'] },
  { name: 'JPMorgan Chase', industry: 'Finance', type: 'Investment Bank', avgSalary: { min: 1200000, max: 2200000 }, globalRank: 7, minScore: 78, roles: ['Tech Analyst', 'Quant Developer', 'Data Scientist'] },
  { name: 'Goldman Sachs', industry: 'Finance', type: 'Investment Bank', avgSalary: { min: 1400000, max: 2500000 }, globalRank: 9, minScore: 80, roles: ['Tech Analyst', 'Quant', 'Data Engineer'] },
  { name: 'Morgan Stanley', industry: 'Finance', type: 'Investment Bank', avgSalary: { min: 1300000, max: 2400000 }, globalRank: 11, minScore: 76, roles: ['Tech Analyst', 'Data Scientist'] },
  { name: 'Flipkart', industry: 'E-commerce', type: 'Indian Tech', avgSalary: { min: 1000000, max: 2000000 }, globalRank: 13, minScore: 72, roles: ['SDE', 'Data Analyst', 'ML Engineer'] },
  { name: 'Intel', industry: 'Semiconductor', type: 'Technology', avgSalary: { min: 1400000, max: 2600000 }, globalRank: 16, minScore: 78, roles: ['SWE', 'ML Engineer', 'Data Scientist'] },
  { name: 'Adobe', industry: 'Software', type: 'Technology', avgSalary: { min: 1600000, max: 2800000 }, globalRank: 17, minScore: 82, roles: ['SDE', 'Data Scientist', 'ML Engineer'] },
  { name: 'Oracle', industry: 'Software', type: 'Technology', avgSalary: { min: 1200000, max: 2200000 }, globalRank: 18, minScore: 74, roles: ['SWE', 'Data Engineer', 'Cloud Engineer'] },
  { name: 'Salesforce', industry: 'Software', type: 'Technology', avgSalary: { min: 1300000, max: 2400000 }, globalRank: 19, minScore: 76, roles: ['SDE', 'Data Analyst'] },
  { name: 'Uber', industry: 'Technology', type: 'Mobility', avgSalary: { min: 1500000, max: 2700000 }, globalRank: 20, minScore: 80, roles: ['SDE', 'Data Scientist', 'ML Engineer'] },
  { name: 'Deloitte', industry: 'Consulting', type: 'Big 4', avgSalary: { min: 800000, max: 1500000 }, globalRank: 21, minScore: 68, roles: ['Consultant', 'Tech Analyst', 'Data Analyst'] },
  { name: 'EY', industry: 'Consulting', type: 'Big 4', avgSalary: { min: 750000, max: 1400000 }, globalRank: 22, minScore: 66, roles: ['Consultant', 'Tech Analyst'] },
  { name: 'PwC', industry: 'Consulting', type: 'Big 4', avgSalary: { min: 750000, max: 1400000 }, globalRank: 23, minScore: 66, roles: ['Consultant', 'Tech Analyst'] },
  { name: 'KPMG', industry: 'Consulting', type: 'Big 4', avgSalary: { min: 700000, max: 1300000 }, globalRank: 24, minScore: 64, roles: ['Consultant', 'Tech Analyst'] },
  { name: 'Zomato', industry: 'Food Tech', type: 'Indian Tech', avgSalary: { min: 800000, max: 1600000 }, globalRank: 25, minScore: 68, roles: ['SDE', 'Data Analyst'] },
  { name: 'Swiggy', industry: 'Food Tech', type: 'Indian Tech', avgSalary: { min: 800000, max: 1500000 }, globalRank: 26, minScore: 68, roles: ['SDE', 'Data Analyst'] },
  { name: 'Paytm', industry: 'Fintech', type: 'Indian Tech', avgSalary: { min: 900000, max: 1800000 }, globalRank: 27, minScore: 70, roles: ['SDE', 'Data Engineer'] },
  { name: 'Razorpay', industry: 'Fintech', type: 'Indian Tech', avgSalary: { min: 1000000, max: 2000000 }, globalRank: 28, minScore: 72, roles: ['SDE', 'Data Analyst'] },
  { name: 'Stripe', industry: 'Fintech', type: 'Technology', avgSalary: { min: 1800000, max: 3200000 }, globalRank: 29, minScore: 84, roles: ['SDE', 'Data Engineer'] },
  { name: 'Samsung', industry: 'Electronics', type: 'Conglomerate', avgSalary: { min: 900000, max: 1800000 }, globalRank: 30, minScore: 70, roles: ['SWE', 'ML Engineer', 'Data Scientist'] },
  { name: 'LinkedIn', industry: 'Technology', type: 'Social', avgSalary: { min: 1600000, max: 3000000 }, globalRank: 31, minScore: 82, roles: ['SDE', 'Data Scientist', 'ML Engineer'] },
  { name: 'Nvidia', industry: 'Semiconductor', type: 'Technology', avgSalary: { min: 2000000, max: 3800000 }, globalRank: 35, minScore: 86, roles: ['ML Engineer', 'Data Scientist', 'SWE'] }
]

if (typeof window !== 'undefined') window.CompaniesData = CompaniesData
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CompaniesData }
}
