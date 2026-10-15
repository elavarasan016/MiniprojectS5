// ============================================================================
// CANDIDATE DATA STORE & ANALYTICS — RecruiterLens AI
// In-memory candidate storage with local file persistence & rich presets
// ============================================================================

const fs = require("fs");
const path = require("path");
const { extractProfileFromText } = require("./taxonomy");

const DATA_DIR = path.join(__dirname, "data");
const CANDIDATES_FILE = path.join(DATA_DIR, "candidates.json");
const SEARCHES_FILE = path.join(DATA_DIR, "searches.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create data dir:", e.message);
  }
}

// ── Realistic Pre-seeded Resumes for Instant Demonstration ──────────────────
const SEED_PROFILES = [
  {
    filename: "Aarav_Sharma_ML_Engineer.txt",
    rawText: `AARAV SHARMA
Email: aarav.sharma@techmail.com | Phone: +91 98765 43210
Location: Bengaluru, India | GitHub: https://github.com/aarav-sharma | LinkedIn: https://linkedin.com/in/aaravsharma-ml

PROFESSIONAL SUMMARY
Results-driven Machine Learning Engineer with 3+ years of experience designing and deploying scalable predictive models, NLP pipelines, and data systems. Proficient in Python, PyTorch, Scikit-Learn, and SQL. Built production microservices with FastAPI and Docker on AWS.

TECHNICAL SKILLS
- Programming Languages: Python, SQL, C++, Bash
- ML & AI: Machine Learning, Deep Learning, NLP, PyTorch, Scikit-Learn, Pandas & NumPy, Model Deployment
- Databases & Storage: PostgreSQL, Redis
- Cloud & DevOps: AWS, Docker, Git, CI/CD, Linux
- Frameworks & APIs: FastAPI, REST APIs

EXPERIENCE
Machine Learning Engineer | DataCore Labs (2022 - Present)
- Architected an NLP text classification system processing 500k customer reviews daily using PyTorch and Transformer architectures, improving sentiment accuracy by 24%.
- Developed end-to-end ML training pipelines with Scikit-Learn, Pandas, and PostgreSQL, cutting feature generation time by 40%.
- Containerized inference services using Docker and deployed REST endpoints with FastAPI on AWS EC2, maintaining sub-80ms p95 latency.
- Partnered with product teams to design A/B testing infrastructure evaluating predictive model performance.

Junior AI Developer | Cognitive Analytics (2021 - 2022)
- Built regression and classification models using Python, NumPy, and Scikit-Learn for churn prediction.
- Automated SQL reporting queries against PostgreSQL database, reducing manual analysis overhead by 15 hours weekly.

EDUCATION
B.Tech in Computer Science and Engineering
National Institute of Technology (2017 - 2021) | CGPA: 8.8/10

PROJECTS
- Neural Semantic Search Engine: Built vector retrieval service combining PyTorch embeddings with PostgreSQL pgvector for document semantic search.
- Real-time Fraud Detection Pipeline: Deployed streaming anomaly detection model with FastAPI and Docker handling 1,200 req/sec.`
  },
  {
    filename: "Priya_Patel_FullStack_React_Node.txt",
    rawText: `PRIYA PATEL
Email: priya.patel.dev@gmail.com | Phone: +91 98234 56789
Location: Pune, India | GitHub: https://github.com/priyapatel-dev | LinkedIn: https://linkedin.com/in/priyapatel-fullstack

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 4 years of hands-on experience building high-throughput web applications with React, Next.js, TypeScript, and Node.js. Passionate about performant user interfaces, responsive design, and robust RESTful APIs backed by MongoDB and PostgreSQL.

CORE COMPETENCIES
- Languages: TypeScript, JavaScript, HTML/CSS, SQL
- Frontend: React, Next.js, Redux, Tailwind CSS, Responsive Design
- Backend: Node.js, Express, REST APIs, GraphQL
- Databases: PostgreSQL, MongoDB, Redis
- Tools & Cloud: Git, Docker, AWS, Postman, Jira, CI/CD

EXPERIENCE
Full Stack Software Engineer | Nimbus Technologies (2022 - Present)
- Led frontend architecture for enterprise SaaS analytics dashboard utilizing React, Next.js, and TypeScript, improving Core Web Vitals by 35%.
- Implemented performant backend microservices with Node.js and Express handling 2M+ API calls daily with PostgreSQL and Redis caching.
- Designed reusable UI component system in Tailwind CSS and Storybook, accelerating feature delivery by 28%.
- Integrated automated CI/CD pipelines via GitHub Actions ensuring continuous deployment with zero downtime.

Frontend Developer | PixelCraft Solutions (2020 - 2022)
- Developed responsive client web apps using React, Redux, and modern JavaScript.
- Collaborated with UI/UX designers in Figma to transform high-fidelity wireframes into accessible web interfaces.
- Consumed REST APIs and implemented client-side state caching with Redux.

EDUCATION
Bachelor of Engineering (B.E.) in Information Technology
Pune University (2016 - 2020)

PROJECTS
- DevPulse Collaborative Task Board: Real-time Kanban board built with React, Node.js, Express, and MongoDB.
- E-Commerce Microservices Platform: Headless commerce store with Next.js, Tailwind CSS, and Stripe integration.`
  },
  {
    filename: "Rohan_Deshmukh_DevOps_SRE.txt",
    rawText: `ROHAN DESHMUKH
Email: rohan.deshmukh.sre@outlook.com | Phone: +91 91234 98765
Location: Hyderabad, India | GitHub: https://github.com/rohand-devops | LinkedIn: https://linkedin.com/in/rohandeshmukh-cloud

SUMMARY
Cloud DevOps & Site Reliability Engineer with 5+ years of experience managing distributed cloud infrastructure across AWS and Azure. Deep expertise in Kubernetes, Docker, Terraform, CI/CD automation, and Linux system engineering.

TECHNICAL SKILLS
- Cloud Platforms: AWS, Microsoft Azure, Google Cloud (GCP)
- Containers & Orchestration: Kubernetes, Docker
- Infrastructure as Code (IaC): Terraform, Ansible
- CI/CD & Automation: GitHub Actions, Jenkins, Git, Linux, Bash
- Observability & Web Servers: Nginx, Prometheus, Grafana
- Scripting & Backend: Python, Go, Shell Scripting

EXPERIENCE
Lead DevOps Engineer | CloudScale Infra (2021 - Present)
- Architected multi-region Kubernetes clusters on AWS EKS serving 15M monthly active users with 99.99% availability.
- Automated 100% of cloud provisioning using Terraform, reducing environment stand-up time from 3 days to 25 minutes.
- Built end-to-end CI/CD pipelines for 40+ microservices using GitHub Actions and Docker container scanning.
- Designed proactive alerting and observability dashboards with Prometheus, Grafana, and Nginx reverse proxies.

Systems Engineer | Enterprise Net Services (2019 - 2021)
- Managed Linux server infrastructure across 200+ instances on AWS EC2.
- Created Python and Bash automation scripts for backup verification and log rotation.

EDUCATION
B.Tech in Computer Engineering
JNTU Hyderabad (2015 - 2019)

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate
- Certified Kubernetes Administrator (CKA)`
  },
  {
    filename: "Ananya_Iyer_Data_Analyst.txt",
    rawText: `ANANYA IYER
Email: ananya.iyer.analytics@gmail.com | Phone: +91 97654 32109
Location: Chennai, India | LinkedIn: https://linkedin.com/in/ananyaiyer-data

SUMMARY
Detail-oriented Data Analyst with 3 years of expertise turning raw data into strategic insights. Highly proficient in SQL, Python, Excel, Power BI / Tableau, and PostgreSQL. Experienced in statistical modeling, business intelligence, and ETL automation.

TECHNICAL SKILLS
- Languages & Tools: Python, SQL, Excel, Power BI / Tableau, Postman
- Data & Analytics: Data Science, Pandas & NumPy, Matplotlib, Scikit-Learn
- Databases: PostgreSQL, MySQL, SQLite
- Collaboration: Jira, Git

EXPERIENCE
Data Analyst | FinMetrics Global (2022 - Present)
- Authored complex SQL queries against PostgreSQL data warehouse to track KPI metrics, churn rates, and revenue projections.
- Built interactive executive dashboards in Power BI / Tableau used by C-suite stakeholders for weekly decision making.
- Developed automated Python ETL pipelines using Pandas and NumPy to clean and aggregate 10GB+ financial transactions daily.
- Created forecasting models using Scikit-Learn that improved quarterly sales forecast accuracy by 18%.

Junior Business Analyst | Insights Consulting (2021 - 2022)
- Analyzed consumer purchase behavior using advanced Excel formulas, pivot tables, and MySQL queries.
- Prepared weekly slide decks and visualizations for retail client engagements.

EDUCATION
Bachelor of Science (B.Sc) in Statistics & Computer Applications
Madras Christian College (2018 - 2021) | Distinction`
  },
  {
    filename: "Vikram_Sengupta_Java_Backend.txt",
    rawText: `VIKRAM SENGUPTA
Email: vikram.sengupta@enterprise.io | Phone: +91 93456 78901
Location: Kolkata, India | GitHub: https://github.com/vikrams-dev | LinkedIn: https://linkedin.com/in/vikram-sengupta-sde

PROFESSIONAL SUMMARY
Senior Java Backend Developer with 6 years of experience building resilient distributed microservices. Specialized in Java, Spring Boot, REST APIs, Kafka, MySQL, and Docker. Strong background in system design, database optimization, and cloud deployment.

CORE SKILLS
- Programming: Java, SQL, Go
- Frameworks: Spring Boot, REST APIs, GraphQL
- Distributed Systems: Kafka, RabbitMQ, Redis
- Databases: MySQL, PostgreSQL, Oracle DB
- Tools & Cloud: Docker, Kubernetes, AWS, Git, Jira, CI/CD

EXPERIENCE
Senior Backend Engineer | PayWave Core (2021 - Present)
- Engineered transaction processing backend in Java and Spring Boot handling 8,000 TPS with zero data loss.
- Decoupled synchronous monolithic architecture using Apache Kafka message streaming, reducing peak latency by 55%.
- Optimized complex MySQL queries and indexing strategies, decreasing database CPU utilization by 30%.
- Containerized backend services with Docker and deployed on AWS Kubernetes clusters.

Software Developer | TCS Enterprise (2018 - 2021)
- Developed RESTful web services in Spring Boot and Core Java for multinational banking client.
- Integrated Oracle DB and MySQL persistence layers using Spring Data JPA.

EDUCATION
Bachelor of Technology (B.Tech) in Information Technology
Heritage Institute of Technology (2014 - 2018)`
  },
  {
    filename: "Sneha_Mukherjee_AI_NLP_Researcher.txt",
    rawText: `SNEHA MUKHERJEE
Email: sneha.mukherjee.ai@gmail.com | Phone: +91 94321 09876
Location: Bengaluru, India | GitHub: https://github.com/snehamukherjee-ai | LinkedIn: https://linkedin.com/in/snehamukherjee-nlp

SUMMARY
AI and NLP Engineer with 3+ years specializing in Large Language Models (LLMs), Natural Language Processing (NLP), PyTorch, and Deep Learning. Experienced in fine-tuning open-source models, retrieval-augmented generation (RAG), and Model Deployment on cloud infrastructure.

SKILLS
- AI & Deep Learning: Natural Language Processing (NLP), Large Language Models (LLMs), Deep Learning, PyTorch, TensorFlow, Hugging Face, Scikit-Learn
- Languages: Python, SQL, C++
- Frameworks & Deployment: FastAPI, Model Deployment, Docker, Linux, Git
- Cloud & Data: AWS, PostgreSQL, Pandas & NumPy

EXPERIENCE
AI Research Engineer | CortexAI Labs (2022 - Present)
- Developed RAG knowledge retrieval systems combining LLM reasoning with vector databases for automated legal document synthesis.
- Fine-tuned transformer models using PyTorch and Hugging Face on specialized corpora, outperforming base models by 31% on domain benchmarks.
- Deployed real-time inference microservices using FastAPI and Docker on AWS GPU instances.

NLP Developer | DeepSense Tech (2021 - 2022)
- Implemented named entity recognition (NER) and summarization pipelines using Python, TensorFlow, and Scikit-Learn.
- Processed multi-gigabyte unstructured text corpora using Pandas and NumPy.

EDUCATION
M.Tech in Artificial Intelligence
Indian Institute of Science (IISc) (2019 - 2021)
B.Tech in Computer Science (2015 - 2019)`
  }
];

// In-Memory state
let candidates = [];
let searchHistory = [];

/**
 * Initialize Store with persisted file or rich demo seed
 */
function initStore() {
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      const data = fs.readFileSync(CANDIDATES_FILE, "utf-8");
      candidates = JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read candidates file, will re-seed:", err.message);
  }

  if (!candidates || candidates.length === 0) {
    resetToDemo();
  }

  try {
    if (fs.existsSync(SEARCHES_FILE)) {
      const sData = fs.readFileSync(SEARCHES_FILE, "utf-8");
      searchHistory = JSON.parse(sData);
    }
  } catch (err) {
    searchHistory = [];
  }
}

/**
 * Save candidates to JSON file
 */
function persistCandidates() {
  try {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist candidates:", err.message);
  }
}

/**
 * Save searches to JSON file
 */
function persistSearches() {
  try {
    fs.writeFileSync(SEARCHES_FILE, JSON.stringify(searchHistory.slice(0, 50), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist searches:", err.message);
  }
}

/**
 * Reset to rich demo presets
 */
function resetToDemo() {
  candidates = SEED_PROFILES.map((p, index) => {
    const extracted = extractProfileFromText(p.rawText, p.filename);
    return {
      id: `cand_${Date.now()}_${index + 1}`,
      filename: p.filename,
      uploadedAt: new Date(Date.now() - (SEED_PROFILES.length - index) * 3600000).toISOString(),
      ...extracted
    };
  });
  persistCandidates();
  return candidates;
}

// ── CRUD Operations ─────────────────────────────────────────────────────────

function getAllCandidates() {
  return candidates;
}

function getCandidateById(id) {
  return candidates.find(c => c.id === id) || null;
}

function addCandidate(rawText, originalFilename = "Uploaded Resume") {
  // Check duplicate content
  const existing = candidates.find(c => 
    c.filename.toLowerCase() === originalFilename.toLowerCase() ||
    (c.rawText && c.rawText.trim() === rawText.trim())
  );
  if (existing) {
    throw new Error(`Candidate with filename "${originalFilename}" or identical resume already exists (ID: ${existing.id}).`);
  }

  const extracted = extractProfileFromText(rawText, originalFilename);
  const newCandidate = {
    id: `cand_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    filename: originalFilename,
    uploadedAt: new Date().toISOString(),
    ...extracted
  };

  candidates.unshift(newCandidate);
  persistCandidates();
  return newCandidate;
}

function deleteCandidate(id) {
  const index = candidates.findIndex(c => c.id === id);
  if (index === -1) return false;
  candidates.splice(index, 1);
  persistCandidates();
  return true;
}

// ── Search & Analytics Logging ──────────────────────────────────────────────

function logSearch(searchRecord) {
  const record = {
    id: `search_${Date.now()}`,
    timestamp: new Date().toISOString(),
    query: searchRecord.query,
    mode: searchRecord.mode || "combined",
    totalCandidates: candidates.length,
    resultsCount: searchRecord.resultsCount || 0,
    topScore: searchRecord.topScore || 0,
    avgScore: searchRecord.avgScore || 0
  };
  searchHistory.unshift(record);
  if (searchHistory.length > 50) searchHistory.pop();
  persistSearches();
  return record;
}

function getSearchHistory(limit = 10) {
  return searchHistory.slice(0, limit);
}

function getDashboardStats() {
  const totalCandidates = candidates.length;
  const totalSearches = searchHistory.length;

  // Compute skill frequency
  const skillCountMap = {};
  let totalScoreSum = 0;
  let strongMatchCount = 0;

  candidates.forEach(c => {
    (c.skills || []).forEach(skill => {
      skillCountMap[skill] = (skillCountMap[skill] || 0) + 1;
    });
    if (c.completeness >= 80) strongMatchCount++;
  });

  const topSkills = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  // Average score from search history or candidate completeness
  const avgMatchScore = searchHistory.length > 0
    ? Math.round(searchHistory.reduce((acc, s) => acc + (s.avgScore || 0), 0) / searchHistory.length)
    : 72;

  // Category breakdown
  const categoryStats = {
    programming_languages: 0,
    frameworks_libraries: 0,
    databases: 0,
    cloud_devops: 0,
    ai_machine_learning: 0,
    tools_platforms: 0
  };

  candidates.forEach(c => {
    if (c.categorizedSkills) {
      Object.keys(categoryStats).forEach(cat => {
        categoryStats[cat] += (c.categorizedSkills[cat] || []).length;
      });
    }
  });

  return {
    totalCandidates,
    totalResumesProcessed: totalCandidates,
    totalSearches,
    avgMatchScore,
    strongProfileCount: strongMatchCount,
    topSkills,
    categoryStats,
    recentSearches: getSearchHistory(5),
    recentUploads: candidates.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name,
      filename: c.filename,
      uploadedAt: c.uploadedAt,
      skillsCount: (c.skills || []).length,
      completeness: c.completeness
    }))
  };
}

// Initialize on module load
initStore();

module.exports = {
  getAllCandidates,
  getCandidateById,
  addCandidate,
  deleteCandidate,
  resetToDemo,
  logSearch,
  getSearchHistory,
  getDashboardStats
};
