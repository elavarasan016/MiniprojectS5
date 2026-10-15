// ============================================================================
// SKILL & KEYWORD TAXONOMY ENGINE — RecruiterLens AI
// Categorized skill dictionary, aliases, and robust boundary-aware extraction
// ============================================================================

const TAXONOMY = {
  programming_languages: [
    { name: "JavaScript", aliases: ["js", "ecmascript", "javascript"] },
    { name: "TypeScript", aliases: ["ts", "typescript"] },
    { name: "Python", aliases: ["py", "python", "python3"] },
    { name: "Java", aliases: ["java", "core java"] },
    { name: "C++", aliases: ["cpp", "c++", "c plus plus"] },
    { name: "C#", aliases: ["c#", "csharp", "c sharp"] },
    { name: "Go", aliases: ["golang", "go language"] },
    { name: "Rust", aliases: ["rust", "rustlang"] },
    { name: "Ruby", aliases: ["ruby", "ruby on rails"] },
    { name: "PHP", aliases: ["php"] },
    { name: "Swift", aliases: ["swift"] },
    { name: "Kotlin", aliases: ["kotlin"] },
    { name: "SQL", aliases: ["sql", "structured query language"] },
    { name: "R", aliases: ["r language", "r programming"] },
    { name: "Scala", aliases: ["scala"] },
    { name: "HTML/CSS", aliases: ["html", "html5", "css", "css3"] }
  ],
  frameworks_libraries: [
    { name: "React", aliases: ["react", "reactjs", "react.js"] },
    { name: "Next.js", aliases: ["nextjs", "next.js", "next"] },
    { name: "Node.js", aliases: ["nodejs", "node.js", "node"] },
    { name: "Express", aliases: ["express", "expressjs", "express.js"] },
    { name: "Angular", aliases: ["angular", "angularjs"] },
    { name: "Vue.js", aliases: ["vue", "vuejs", "vue.js"] },
    { name: "Django", aliases: ["django"] },
    { name: "Flask", aliases: ["flask"] },
    { name: "FastAPI", aliases: ["fastapi", "fast-api"] },
    { name: "Spring Boot", aliases: ["spring boot", "springboot", "spring framework"] },
    { name: ".NET", aliases: [".net", "dotnet", "asp.net", ".net core"] },
    { name: "GraphQL", aliases: ["graphql"] },
    { name: "REST APIs", aliases: ["rest api", "rest apis", "restful", "restful api"] },
    { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"] },
    { name: "Redux", aliases: ["redux", "redux toolkit"] }
  ],
  databases: [
    { name: "PostgreSQL", aliases: ["postgres", "postgresql", "psql"] },
    { name: "MySQL", aliases: ["mysql"] },
    { name: "MongoDB", aliases: ["mongodb", "mongo"] },
    { name: "Redis", aliases: ["redis"] },
    { name: "SQLite", aliases: ["sqlite"] },
    { name: "Cassandra", aliases: ["cassandra"] },
    { name: "DynamoDB", aliases: ["dynamodb", "dynamo"] },
    { name: "Elasticsearch", aliases: ["elasticsearch", "elastic search"] },
    { name: "Oracle DB", aliases: ["oracle db", "oracle sql"] },
    { name: "Firebase", aliases: ["firebase", "firestore"] }
  ],
  cloud_devops: [
    { name: "AWS", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"] },
    { name: "Microsoft Azure", aliases: ["azure", "ms azure", "microsoft azure"] },
    { name: "Google Cloud (GCP)", aliases: ["gcp", "google cloud", "google cloud platform"] },
    { name: "Docker", aliases: ["docker", "containerization"] },
    { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
    { name: "CI/CD", aliases: ["ci/cd", "ci-cd", "continuous integration", "github actions", "gitlab ci", "jenkins"] },
    { name: "Terraform", aliases: ["terraform", "iac", "infrastructure as code"] },
    { name: "Linux", aliases: ["linux", "ubuntu", "bash", "shell scripting"] },
    { name: "Nginx", aliases: ["nginx"] },
    { name: "Git", aliases: ["git", "github", "gitlab", "version control"] }
  ],
  ai_machine_learning: [
    { name: "Machine Learning", aliases: ["ml", "machine learning"] },
    { name: "Deep Learning", aliases: ["dl", "deep learning"] },
    { name: "Natural Language Processing (NLP)", aliases: ["nlp", "natural language processing", "text mining"] },
    { name: "Computer Vision", aliases: ["cv", "computer vision", "opencv"] },
    { name: "PyTorch", aliases: ["pytorch", "torch"] },
    { name: "TensorFlow", aliases: ["tensorflow", "tf", "keras"] },
    { name: "Scikit-Learn", aliases: ["scikit-learn", "sklearn"] },
    { name: "Large Language Models (LLMs)", aliases: ["llm", "llms", "large language models", "generative ai", "genai", "prompt engineering"] },
    { name: "Pandas & NumPy", aliases: ["pandas", "numpy", "scipy"] },
    { name: "Data Science", aliases: ["data science", "data analysis", "data analytics", "data visualization", "matplotlib", "seaborn"] },
    { name: "Model Deployment", aliases: ["model deployment", "mlops", "triton", "onnx", "hugging face", "huggingface"] }
  ],
  tools_platforms: [
    { name: "Postman", aliases: ["postman"] },
    { name: "Jira", aliases: ["jira", "agile", "scrum"] },
    { name: "Figma", aliases: ["figma", "ui/ux", "wireframing"] },
    { name: "Kafka", aliases: ["kafka", "apache kafka", "event streaming"] },
    { name: "RabbitMQ", aliases: ["rabbitmq", "message queue"] },
    { name: "Excel", aliases: ["excel", "spreadsheets", "advanced excel"] },
    { name: "Power BI / Tableau", aliases: ["power bi", "powerbi", "tableau"] }
  ]
};

// Flattened mapping for quick alias lookups
const ALIAS_LOOKUP = {};
const ALL_CANONICAL_SKILLS = [];

Object.entries(TAXONOMY).forEach(([category, skills]) => {
  skills.forEach(skillObj => {
    ALL_CANONICAL_SKILLS.push({ ...skillObj, category });
    skillObj.aliases.forEach(alias => {
      ALIAS_LOOKUP[alias.toLowerCase()] = {
        canonical: skillObj.name,
        category
      };
    });
  });
});

/**
 * Escapes regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Robust word-boundary matching for short or complex skill names.
 * Avoids substring false positives like "c" in "react" or "r" in "docker".
 */
function matchSkillInText(alias, text) {
  const cleanAlias = alias.trim().toLowerCase();
  const lowerText = text.toLowerCase();

  // Special handling for single-letter or symbol skills like "c", "r", "c++", "c#"
  if (cleanAlias === "c") {
    // Only match 'C' when preceded and followed by boundary/whitespace/punctuation, not part of words
    const regex = /(?:^|[\s,;:(/])c(?:[\s,;:)/]|$)/i;
    return regex.test(lowerText);
  }
  if (cleanAlias === "r") {
    const regex = /(?:^|[\s,;:(/])r(?:[\s,;:)/]|$)/i;
    return regex.test(lowerText);
  }
  if (cleanAlias === "go") {
    const regex = /(?:^|[\s,;:(/])go(?:lang)?(?:[\s,;:)/]|$)/i;
    return regex.test(lowerText);
  }
  if (cleanAlias === "c++" || cleanAlias === "cpp") {
    const regex = /(?:^|[\s,;:(/])(?:c\+\+|cpp)(?:[\s,;:)/]|$)/i;
    return regex.test(lowerText);
  }
  if (cleanAlias === "c#" || cleanAlias === "csharp") {
    const regex = /(?:^|[\s,;:(/])(?:c#|csharp)(?:[\s,;:)/]|$)/i;
    return regex.test(lowerText);
  }

  // Standard boundary match
  const escaped = escapeRegex(cleanAlias);
  const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, "i");
  return regex.test(lowerText);
}

/**
 * Extract structured information from raw resume text:
 * - Contact info (Email, Phone, Links, Name)
 * - Categorized Skills
 * - Education
 * - Experience / Project Keywords
 * - Profile Completeness (0-100)
 */
function extractProfileFromText(rawText, originalFilename = "Uploaded Resume") {
  const text = (rawText || "").trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Contact Extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : null;

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);
  const github = githubMatch ? (githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`) : null;

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  const linkedin = linkedinMatch ? (linkedinMatch[0].startsWith("http") ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : null;

  // 2. Candidate Name extraction heuristic
  // Take first prominent line that isn't an email, phone, or generic header
  let name = null;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 40 &&
      !line.includes("@") &&
      !line.match(/\d{5,}/) &&
      !/resume|curriculum|vitae|profile|page\s*\d/i.test(line) &&
      /^[A-Za-z\s.'-]+$/.test(line)
    ) {
      name = line.replace(/^(mr\.|ms\.|dr\.)\s*/i, "").trim();
      break;
    }
  }

  // Fallback to filename if name not found
  if (!name) {
    const baseName = originalFilename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    name = baseName.length > 2 ? baseName : "Candidate Profile";
  }

  // 3. Skill & Keyword Extraction
  const categorizedSkills = {
    programming_languages: [],
    frameworks_libraries: [],
    databases: [],
    cloud_devops: [],
    ai_machine_learning: [],
    tools_platforms: []
  };

  const detectedSkillsSet = new Set();
  const matchedSkillDetails = [];

  ALL_CANONICAL_SKILLS.forEach(skillObj => {
    let matched = false;
    let matchedAlias = "";

    for (const alias of skillObj.aliases) {
      if (matchSkillInText(alias, text)) {
        matched = true;
        matchedAlias = alias;
        break;
      }
    }

    if (matched) {
      detectedSkillsSet.add(skillObj.name);
      categorizedSkills[skillObj.category].push(skillObj.name);
      matchedSkillDetails.push({
        canonical: skillObj.name,
        category: skillObj.category,
        matchedAlias
      });
    }
  });

  const flatSkills = Array.from(detectedSkillsSet);

  // 4. Education extraction
  const educationKeywords = [
    { degree: "Master's / Ph.D.", regex: /\b(m\.?tech|m\.?s|master|ph\.?d|doctorate)\b/i },
    { degree: "Bachelor's Degree", regex: /\b(b\.?tech|b\.?e|b\.?s|bachelor|bca|b\.?sc)\b/i },
    { degree: "Diploma / Associate", regex: /\b(diploma|associate degree)\b/i }
  ];
  let educationLevel = "Not Specified";
  for (const item of educationKeywords) {
    if (item.regex.test(text)) {
      educationLevel = item.degree;
      break;
    }
  }

  // 5. Experience Years estimation (heuristic based on date patterns or explicit mentions)
  let estimatedExperience = null;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i);
  if (expMatch) {
    estimatedExperience = parseFloat(expMatch[1]);
  } else {
    // Check graduation year or oldest year in resume
    const years = (text.match(/\b(20[0-2][0-9]|199[0-9])\b/g) || []).map(Number);
    if (years.length >= 2) {
      const currentYear = new Date().getFullYear();
      const minYear = Math.min(...years);
      if (minYear >= 2010 && minYear <= currentYear) {
        estimatedExperience = Math.min(currentYear - minYear, 15);
      }
    }
  }

  // 6. Profile Completeness Score Calculation (0-100)
  let completeness = 0;
  if (name && name !== "Candidate Profile") completeness += 15;
  if (email) completeness += 15;
  if (phone) completeness += 10;
  if (github || linkedin) completeness += 10;
  if (flatSkills.length >= 3) completeness += 15;
  if (flatSkills.length >= 7) completeness += 10;
  if (educationLevel !== "Not Specified") completeness += 10;
  if (estimatedExperience !== null) completeness += 5;
  if (text.length > 500) completeness += 10;
  completeness = Math.min(100, Math.max(10, completeness));

  return {
    name,
    email: email || "Not Provided",
    phone: phone || "Not Provided",
    github: github || null,
    linkedin: linkedin || null,
    educationLevel,
    estimatedExperience: estimatedExperience !== null ? `${estimatedExperience} years` : "Early Career / Unspecified",
    experienceYearsNum: estimatedExperience !== null ? estimatedExperience : 0,
    skills: flatSkills,
    categorizedSkills,
    matchedSkillDetails,
    completeness,
    textLength: text.length,
    rawText: text
  };
}

module.exports = {
  TAXONOMY,
  ALIAS_LOOKUP,
  ALL_CANONICAL_SKILLS,
  matchSkillInText,
  extractProfileFromText
};
