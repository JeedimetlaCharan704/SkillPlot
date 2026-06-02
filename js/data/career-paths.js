const CareerPaths = [
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Analyze complex datasets to drive business decisions using statistical methods, machine learning, and data visualization.',
    salaryRange: { min: 800000, max: 2500000 },
    difficulty: 'intermediate',
    demandLevel: 'high',
    icon: 'fa-chart-line',
    color: 'var(--primary)',
    skills: [
      { name: 'Python', weight: 0.95 }, { name: 'Machine Learning', weight: 0.90 },
      { name: 'SQL', weight: 0.85 }, { name: 'Statistics', weight: 0.85 },
      { name: 'Data Analysis', weight: 0.80 }, { name: 'Data Visualization', weight: 0.75 },
      { name: 'Deep Learning', weight: 0.70 }, { name: 'R', weight: 0.50 },
      { name: 'Big Data', weight: 0.60 }, { name: 'Communication', weight: 0.55 }
    ],
    roadmaps: {
      '30': ['Python foundations for data analysis', 'Statistics refresher (probability, distributions, hypothesis testing)', 'SQL for data querying', 'Pandas and NumPy basics', 'Data visualization with Matplotlib/Seaborn'],
      '60': ['Machine Learning fundamentals (supervised/unsupervised)', 'Scikit-learn workshops', 'Feature engineering and model evaluation', 'Real-world dataset project', 'Introduction to Deep Learning'],
      '90': ['End-to-end ML pipeline project', 'Big data tools (Spark basics)', 'MLOps fundamentals', 'Kaggle competition participation', 'Portfolio project: predictive model deployment']
    }
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    description: 'Design and deploy machine learning models at scale. Build ML pipelines, optimize performance, and productionize AI solutions.',
    salaryRange: { min: 1000000, max: 3000000 },
    difficulty: 'advanced',
    demandLevel: 'high',
    icon: 'fa-brain',
    color: 'var(--accent)',
    skills: [
      { name: 'Python', weight: 0.95 }, { name: 'Machine Learning', weight: 0.95 },
      { name: 'Deep Learning', weight: 0.85 }, { name: 'TensorFlow', weight: 0.80 },
      { name: 'PyTorch', weight: 0.80 }, { name: 'Docker', weight: 0.75 },
      { name: 'SQL', weight: 0.70 }, { name: 'MLOps', weight: 0.75 },
      { name: 'Cloud Computing', weight: 0.70 }, { name: 'Data Engineering', weight: 0.65 }
    ],
    roadmaps: {
      '30': ['Python advanced concepts', 'ML algorithms deep dive', 'TensorFlow/PyTorch setup and basics', 'Neural network architecture', 'Model training and evaluation'],
      '60': ['ML pipeline design and automation', 'Docker containerization for ML', 'Model deployment strategies', 'API development for ML models', 'Cloud ML services (AWS SageMaker, GCP AI)'],
      '90': ['End-to-end MLOps project', 'CI/CD for machine learning', 'Model monitoring and retraining', 'Distributed training concepts', 'Production-grade ML system design']
    }
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    description: 'Build intelligent systems using LLMs, NLP, computer vision, and generative AI. Integrate AI capabilities into real-world applications.',
    salaryRange: { min: 1200000, max: 3500000 },
    difficulty: 'advanced',
    demandLevel: 'high',
    icon: 'fa-robot',
    color: 'var(--secondary)',
    skills: [
      { name: 'Python', weight: 0.95 }, { name: 'Deep Learning', weight: 0.90 },
      { name: 'NLP', weight: 0.85 }, { name: 'LLMs', weight: 0.85 },
      { name: 'TensorFlow', weight: 0.75 }, { name: 'PyTorch', weight: 0.80 },
      { name: 'Computer Vision', weight: 0.70 }, { name: 'RAG', weight: 0.75 },
      { name: 'APIs', weight: 0.70 }, { name: 'Cloud Computing', weight: 0.65 }
    ],
    roadmaps: {
      '30': ['Python for AI/ML', 'Neural networks fundamentals', 'NLP basics (tokenization, embeddings, transformers)', 'Working with LLM APIs (OpenAI, Claude)', 'Prompt engineering'],
      '60': ['RAG architecture and implementation', 'Fine-tuning LLMs', 'Computer vision with CNN architectures', 'Building AI-powered applications', 'Vector databases and embeddings'],
      '90': ['Multi-modal AI systems', 'AI agent development', 'Production AI deployment', 'AI ethics and safety', 'Portfolio: end-to-end AI application']
    }
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Transform raw data into actionable insights. Create dashboards, reports, and visualizations that drive business strategy.',
    salaryRange: { min: 500000, max: 1500000 },
    difficulty: 'beginner',
    demandLevel: 'high',
    icon: 'fa-magnifying-glass-chart',
    color: 'var(--success)',
    skills: [
      { name: 'SQL', weight: 0.95 }, { name: 'Excel', weight: 0.90 },
      { name: 'Data Analysis', weight: 0.85 }, { name: 'Data Visualization', weight: 0.85 },
      { name: 'Python', weight: 0.75 }, { name: 'Statistics', weight: 0.70 },
      { name: 'Tableau', weight: 0.75 }, { name: 'Power BI', weight: 0.70 },
      { name: 'Communication', weight: 0.65 }, { name: 'Critical Thinking', weight: 0.60 }
    ],
    roadmaps: {
      '30': ['SQL fundamentals (queries, joins, aggregations)', 'Excel advanced functions and pivot tables', 'Statistics basics for analysis', 'Python for data analysis (Pandas)', 'Data cleaning techniques'],
      '60': ['Data visualization principles', 'Tableau/Power BI dashboard creation', 'Exploratory data analysis projects', 'Business metrics and KPIs', 'A/B testing fundamentals'],
      '90': ['End-to-end analytics project', 'Data storytelling and presentation', 'Automated reporting systems', 'Advanced SQL (window functions, CTEs)', 'Portfolio: interactive dashboard']
    }
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    description: 'Design, implement, and manage cloud infrastructure. Ensure scalability, security, and reliability of cloud-based systems.',
    salaryRange: { min: 900000, max: 2800000 },
    difficulty: 'intermediate',
    demandLevel: 'high',
    icon: 'fa-cloud',
    color: 'var(--info)',
    skills: [
      { name: 'AWS', weight: 0.95 }, { name: 'Docker', weight: 0.85 },
      { name: 'Kubernetes', weight: 0.80 }, { name: 'Linux', weight: 0.85 },
      { name: 'DevOps', weight: 0.80 }, { name: 'Terraform', weight: 0.75 },
      { name: 'CI/CD', weight: 0.75 }, { name: 'Networking', weight: 0.70 },
      { name: 'Python', weight: 0.65 }, { name: 'Security', weight: 0.60 }
    ],
    roadmaps: {
      '30': ['Linux command line and scripting', 'Networking fundamentals', 'AWS/GCP/Azure core services', 'IaaS, PaaS, SaaS concepts', 'Cloud security basics'],
      '60': ['Docker containerization', 'Kubernetes orchestration', 'Infrastructure as Code (Terraform)', 'CI/CD pipeline setup', 'Cloud architecture patterns'],
      '90': ['Multi-cloud architecture', 'Kubernetes in production', 'Cloud security advanced', 'Cost optimization strategies', 'Portfolio: cloud infrastructure project']
    }
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cyber Security Analyst',
    description: 'Protect organizational assets from cyber threats. Monitor systems, conduct vulnerability assessments, and implement security measures.',
    salaryRange: { min: 700000, max: 2400000 },
    difficulty: 'intermediate',
    demandLevel: 'high',
    icon: 'fa-shield-halved',
    color: 'var(--error)',
    skills: [
      { name: 'Network Security', weight: 0.90 }, { name: 'Linux', weight: 0.80 },
      { name: 'Security Tools', weight: 0.85 }, { name: 'Python', weight: 0.75 },
      { name: 'Cryptography', weight: 0.70 }, { name: 'Cloud Security', weight: 0.70 },
      { name: 'Incident Response', weight: 0.75 }, { name: 'Compliance', weight: 0.65 },
      { name: 'Ethical Hacking', weight: 0.70 }, { name: 'Communication', weight: 0.55 }
    ],
    roadmaps: {
      '30': ['Network protocols and security', 'Linux security fundamentals', 'Security tools (nmap, Wireshark, Metasploit)', 'Cryptography basics', 'Security frameworks (NIST, ISO 27001)'],
      '60': ['Vulnerability assessment and pentesting', 'Incident response procedures', 'Cloud security (CSPM, CWPP)', 'SIEM tools and log analysis', 'CTF challenges and labs'],
      '90': ['Advanced penetration testing', 'Security automation with Python', 'Compliance and audit preparation', 'Security architecture design', 'Portfolio: security assessment project']
    }
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    description: 'Build end-to-end web applications. Design and implement both frontend interfaces and backend services with modern technologies.',
    salaryRange: { min: 600000, max: 2200000 },
    difficulty: 'beginner',
    demandLevel: 'high',
    icon: 'fa-laptop-code',
    color: 'var(--warning)',
    skills: [
      { name: 'JavaScript', weight: 0.95 }, { name: 'React', weight: 0.90 },
      { name: 'Node.js', weight: 0.85 }, { name: 'SQL', weight: 0.80 },
      { name: 'HTML/CSS', weight: 0.90 }, { name: 'Git', weight: 0.80 },
      { name: 'TypeScript', weight: 0.75 }, { name: 'MongoDB', weight: 0.70 },
      { name: 'REST APIs', weight: 0.80 }, { name: 'Docker', weight: 0.60 }
    ],
    roadmaps: {
      '30': ['HTML/CSS fundamentals', 'JavaScript core concepts', 'React basics (components, state, props)', 'Node.js and Express basics', 'Git version control'],
      '60': ['Full CRUD application development', 'Database design (SQL + MongoDB)', 'Authentication and authorization', 'RESTful API design', 'Frontend-backend integration'],
      '90': ['Full-stack project with deployment', 'TypeScript advanced patterns', 'Testing (unit, integration, e2e)', 'CI/CD and DevOps basics', 'Portfolio: production-ready application']
    }
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Bridge development and operations. Automate infrastructure, streamline deployments, and ensure system reliability and scalability.',
    salaryRange: { min: 1000000, max: 3000000 },
    difficulty: 'intermediate',
    demandLevel: 'high',
    icon: 'fa-arrows-spin',
    color: 'var(--accent)',
    skills: [
      { name: 'Docker', weight: 0.95 }, { name: 'Kubernetes', weight: 0.90 },
      { name: 'Linux', weight: 0.90 }, { name: 'CI/CD', weight: 0.85 },
      { name: 'Terraform', weight: 0.80 }, { name: 'Cloud Computing', weight: 0.80 },
      { name: 'Python', weight: 0.75 }, { name: 'Monitoring', weight: 0.70 },
      { name: 'Git', weight: 0.75 }, { name: 'Scripting', weight: 0.70 }
    ],
    roadmaps: {
      '30': ['Linux system administration', 'Shell scripting (Bash)', 'Git advanced workflows', 'Docker fundamentals', 'CI/CD concepts and tools'],
      '60': ['Kubernetes orchestration', 'Terraform Infrastructure as Code', 'Monitoring (Prometheus, Grafana)', 'Cloud provider services', 'Configuration management'],
      '90': ['Production Kubernetes', 'Service mesh (Istio/Linkerd)', 'Security in DevOps (DevSecOps)', 'Multi-cloud architecture', 'Portfolio: automated infrastructure project']
    }
  },
  {
    id: 'product-manager',
    title: 'Technical Product Manager',
    description: 'Define product vision and strategy. Bridge business goals, user needs, and technical execution to deliver impactful products.',
    salaryRange: { min: 1200000, max: 3500000 },
    difficulty: 'intermediate',
    demandLevel: 'medium',
    icon: 'fa-chart-bar',
    color: 'var(--secondary)',
    skills: [
      { name: 'Communication', weight: 0.95 }, { name: 'Product Strategy', weight: 0.90 },
      { name: 'Data Analysis', weight: 0.80 }, { name: 'User Research', weight: 0.80 },
      { name: 'Agile', weight: 0.85 }, { name: 'SQL', weight: 0.70 },
      { name: 'Wireframing', weight: 0.65 }, { name: 'A/B Testing', weight: 0.70 },
      { name: 'Leadership', weight: 0.75 }, { name: 'Technical Literacy', weight: 0.70 }
    ],
    roadmaps: {
      '30': ['Product management fundamentals', 'User research and interviews', 'PRD writing and requirements', 'Data-driven decision making', 'Agile and Scrum methodology'],
      '60': ['Product analytics and metrics', 'A/B testing and experimentation', 'Wireframing and prototyping', 'Stakeholder management', 'Go-to-market strategy'],
      '90': ['Product roadmap development', 'Cross-functional leadership', 'Product launch management', 'OKR and KPI frameworks', 'Portfolio: product case study']
    }
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    description: 'Design, develop, and maintain software systems. Write clean, scalable code and collaborate on complex technical projects.',
    salaryRange: { min: 700000, max: 2500000 },
    difficulty: 'beginner',
    demandLevel: 'high',
    icon: 'fa-code',
    color: 'var(--primary)',
    skills: [
      { name: 'JavaScript', weight: 0.85 }, { name: 'Python', weight: 0.85 },
      { name: 'Java', weight: 0.75 }, { name: 'Data Structures', weight: 0.85 },
      { name: 'Algorithms', weight: 0.85 }, { name: 'SQL', weight: 0.75 },
      { name: 'Git', weight: 0.80 }, { name: 'System Design', weight: 0.70 },
      { name: 'Problem Solving', weight: 0.90 }, { name: 'Communication', weight: 0.70 }
    ],
    roadmaps: {
      '30': ['Data structures and algorithms', 'Object-oriented programming', 'Database fundamentals (SQL)', 'Git and collaboration', 'Clean code principles'],
      '60': ['System design fundamentals', 'API development', 'Testing (unit + integration)', 'Design patterns', 'Open source contribution'],
      '90': ['Distributed systems concepts', 'Performance optimization', 'System design interview prep', 'Production deployment experience', 'Portfolio: scalable application']
    }
  }
]

if (typeof window !== 'undefined') window.CareerPaths = CareerPaths

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CareerPaths }
}
