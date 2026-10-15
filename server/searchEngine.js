// ============================================================================
// RECRUITER SEARCH SIMULATOR & SCORING ENGINE — RecruiterLens AI
// Modules 4 & 5: Keyword, Semantic, Boolean, and Combined Search Modes
// ============================================================================

const { TAXONOMY, ALIAS_LOOKUP, ALL_CANONICAL_SKILLS, matchSkillInText } = require("./taxonomy");

// Common English stopwords to exclude from raw keyword extraction
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
  "will", "with", "or", "developer", "engineer", "looking", "candidate", "need",
  "experienced", "familiar", "knowledge", "expert", "strong", "proficient", "role",
  "job", "required", "skills", "experience", "work", "plus", "must", "have"
]);

/**
 * Tokenize and normalize text into clean terms
 */
function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_#+.\s-]/g, " ")
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Extract query requirement terms, identifying canonical skills and general keywords
 */
function extractQueryRequirements(queryString) {
  const query = (queryString || "").trim();
  const lowerQuery = query.toLowerCase();

  const matchedSkills = [];
  const queryTerms = [];

  // Match canonical skills first using taxonomy
  ALL_CANONICAL_SKILLS.forEach(skillObj => {
    let hit = false;
    for (const alias of skillObj.aliases) {
      if (matchSkillInText(alias, query)) {
        hit = true;
        break;
      }
    }
    if (hit) {
      matchedSkills.push(skillObj.name);
    }
  });

  // Extract raw keyword tokens
  const tokens = tokenizeText(query);
  tokens.forEach(token => {
    const aliasInfo = ALIAS_LOOKUP[token];
    if (aliasInfo && !matchedSkills.includes(aliasInfo.canonical)) {
      matchedSkills.push(aliasInfo.canonical);
    } else if (!matchedSkills.some(s => s.toLowerCase() === token)) {
      queryTerms.push(token);
    }
  });

  return {
    rawQuery: query,
    skills: matchedSkills,
    generalKeywords: queryTerms,
    allRequirements: [...matchedSkills, ...queryTerms]
  };
}

/**
 * ── 1. KEYWORD SCORING (TF-IDF / Term Matching) ──
 * Evaluates exact, alias, and term-frequency overlap between query and resume
 */
function calculateKeywordScore(candidate, requirements) {
  const reqs = requirements.allRequirements;
  if (reqs.length === 0) return { score: 70, matched: [], missing: [], weak: [] };

  const candText = (candidate.rawText || "").toLowerCase();
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());

  const matched = [];
  const missing = [];
  const weak = [];

  let totalWeight = 0;
  let earnedScore = 0;

  requirements.skills.forEach(skill => {
    totalWeight += 2.0; // Skill requirements carry higher weight
    const isSkillExplicit = candSkills.includes(skill.toLowerCase());
    const aliasEntry = ALL_CANONICAL_SKILLS.find(s => s.name === skill);
    let inText = false;

    if (aliasEntry) {
      inText = aliasEntry.aliases.some(a => matchSkillInText(a, candText));
    } else {
      inText = matchSkillInText(skill, candText);
    }

    if (isSkillExplicit) {
      matched.push(skill);
      earnedScore += 2.0;
    } else if (inText) {
      // Mentioned in text but not in structured skills list
      weak.push(skill);
      earnedScore += 1.2;
    } else {
      missing.push(skill);
    }
  });

  requirements.generalKeywords.forEach(kw => {
    totalWeight += 1.0;
    if (candText.includes(kw.toLowerCase())) {
      matched.push(kw);
      earnedScore += 1.0;
    } else {
      missing.push(kw);
    }
  });

  const rawScore = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 50;
  const normalizedScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score: normalizedScore,
    matched,
    missing,
    weak
  };
}

/**
 * ── 2. SEMANTIC SIMILARITY SCORING (Local Vector Cosine Sim) ──
 * Uses character n-grams and term-vector cosine similarity across candidate profile & query
 */
function calculateLocalSemanticScore(candidate, query) {
  if (!query || !query.trim()) return 70;

  // Build profile vector text
  const profileVectorText = [
    candidate.name || "",
    (candidate.skills || []).join(" "),
    candidate.educationLevel || "",
    candidate.estimatedExperience || "",
    (candidate.rawText || "").slice(0, 3000)
  ].join(" ").toLowerCase();

  const queryTokens = tokenizeText(query);
  const profileTokens = tokenizeText(profileVectorText);

  if (queryTokens.length === 0 || profileTokens.length === 0) return 50;

  // Compute Term Frequency vectors for unique vocabulary
  const vocab = Array.from(new Set([...queryTokens, ...profileTokens]));
  const qVec = new Array(vocab.length).fill(0);
  const pVec = new Array(vocab.length).fill(0);

  const qMap = {};
  queryTokens.forEach(t => { qMap[t] = (qMap[t] || 0) + 1; });

  const pMap = {};
  profileTokens.forEach(t => { pMap[t] = (pMap[t] || 0) + 1; });

  let dotProduct = 0;
  let qMag = 0;
  let pMag = 0;

  vocab.forEach((term, idx) => {
    const qCount = qMap[term] || 0;
    const pCount = pMap[term] || 0;
    // Log damping for term frequency
    const qVal = qCount > 0 ? 1 + Math.log(qCount) : 0;
    const pVal = pCount > 0 ? 1 + Math.log(pCount) : 0;

    qVec[idx] = qVal;
    pVec[idx] = pVal;

    dotProduct += qVal * pVal;
    qMag += qVal * qVal;
    pMag += pVal * pVal;
  });

  if (qMag === 0 || pMag === 0) return 30;

  const rawCosine = dotProduct / (Math.sqrt(qMag) * Math.sqrt(pMag));
  
  // Calculate query token coverage ratio (how many query concepts are present in profile)
  const coveredQueryTokens = queryTokens.filter(qt => pMap[qt] > 0).length;
  const coverageRatio = queryTokens.length > 0 ? coveredQueryTokens / queryTokens.length : 0.5;

  // Blended semantic score: combines raw angle cosine with token concept coverage
  const blendedSim = (rawCosine * 1.8) * 0.4 + (coverageRatio * 0.6);
  const scaledScore = Math.min(99, Math.max(15, Math.round(blendedSim * 100)));
  return scaledScore;
}

/**
 * ── 3. BOOLEAN QUERY PARSER & EVALUATOR ──
 * Parses queries with AND, OR, NOT, and parentheses e.g. "python AND (sql OR postgresql) NOT java"
 */
function evaluateBooleanSearch(candidate, query) {
  const candText = (candidate.rawText || "").toLowerCase();
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());

  function checkTerm(term) {
    const clean = term.trim().toLowerCase();
    if (!clean) return true;

    // Check alias
    const aliasInfo = ALIAS_LOOKUP[clean];
    if (aliasInfo) {
      if (candSkills.includes(aliasInfo.canonical.toLowerCase())) return true;
    }

    // Direct text / skill match
    if (candSkills.includes(clean)) return true;
    return matchSkillInText(clean, candText);
  }

  // Preprocess boolean operators
  let expr = query.trim();

  // Normalize explicit operators
  expr = expr.replace(/\bAND\b/g, " && ");
  expr = expr.replace(/\bOR\b/g, " || ");
  
  // Handle NOT: if preceded by an operator, convert to !, otherwise convert to && !
  expr = expr.replace(/(&&|\|\||\()\s*NOT\b/g, "$1 ! ");
  expr = expr.replace(/\bNOT\b/g, " && ! ");

  // Split into tokens preserving parens, operators, and terms
  const rawTokens = expr.match(/(?:&&|\|\||!|\(|\)|[a-zA-Z0-9_#+.-]+)/g) || [];

  // Insert implicit && between adjacent terms where operator was omitted
  const tokens = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const current = rawTokens[i];
    const prev = i > 0 ? rawTokens[i - 1] : null;

    const isCurrentTerm = !["&&", "||", "!", "(", ")"].includes(current);
    const isPrevTerm = prev && !["&&", "||", "!", "("].includes(prev);

    if (isCurrentTerm && isPrevTerm) {
      tokens.push("&&");
    } else if (current === "!" && isPrevTerm) {
      tokens.push("&&");
    }
    tokens.push(current);
  }

  // Evaluate tokens
  try {
    const evaluatedTokens = tokens.map(tok => {
      if (tok === "&&" || tok === "||" || tok === "!" || tok === "(" || tok === ")") {
        return tok;
      }
      return checkTerm(tok) ? "true" : "false";
    });

    const evalString = evaluatedTokens.join(" ");
    // Safe execution restricted to boolean logic
    if (/^[truefals!\s&|()]+$/.test(evalString)) {
      const fn = new Function(`return !!(${evalString});`);
      return fn();
    }
  } catch (err) {
    console.warn("Boolean parse fallback for query:", query, err.message);
  }

  // Fallback: all words must match (implicit AND)
  const fallbackTerms = tokenizeText(query);
  return fallbackTerms.every(t => checkTerm(t));
}

/**
 * Generate transparent natural language explanation of candidate rank & score
 */
function generateExplanation(candidate, scores, reqs) {
  const { overallScore, keywordScore, semanticScore, completenessScore } = scores;
  const parts = [];

  if (scores.matched.length > 0) {
    parts.push(`Strong matches on: ${scores.matched.slice(0, 4).join(", ")}.`);
  }

  if (scores.weak.length > 0) {
    parts.push(`Weakly represented in profile: ${scores.weak.join(", ")} (found in text but omitted from skills section).`);
  }

  if (scores.missing.length > 0) {
    parts.push(`Missing search requirements: ${scores.missing.slice(0, 3).join(", ")}.`);
  }

  let summary = "";
  if (overallScore >= 80) {
    summary = `High candidate alignment (${overallScore}%). Strong keyword density (${keywordScore}%) and conceptual semantic match (${semanticScore}%).`;
  } else if (overallScore >= 60) {
    summary = `Moderate candidate alignment (${overallScore}%). Core skills present (${keywordScore}%) but some requirements are unrepresented.`;
  } else {
    summary = `Lower alignment (${overallScore}%). Noticeable skill and keyword gaps against the query criteria.`;
  }

  return `${summary} ${parts.join(" ")}`;
}

/**
 * ── MAIN SEARCH EXECUTION FUNCTION ──
 * Supports modes: 'combined', 'keyword', 'semantic', 'boolean'
 * Configurable weights: wSemantic (default 0.50), wKeyword (default 0.40), wCompleteness (default 0.10)
 */
function executeSearch(candidates, options = {}) {
  const {
    query = "",
    mode = "combined", // 'combined' | 'keyword' | 'semantic' | 'boolean'
    filters = {},
    weights = { semantic: 0.50, keyword: 0.40, completeness: 0.10 }
  } = options;

  if (!candidates || candidates.length === 0) {
    return { results: [], totalCandidates: 0, queryRequirements: null };
  }

  const reqs = extractQueryRequirements(query);

  // Apply Hard Filters first
  let filtered = [...candidates];

  if (filters.skills && filters.skills.length > 0) {
    filtered = filtered.filter(cand => {
      const candSkills = (cand.skills || []).map(s => s.toLowerCase());
      return filters.skills.every(skill => candSkills.includes(skill.toLowerCase()));
    });
  }

  if (filters.education && filters.education !== "all") {
    filtered = filtered.filter(cand => cand.educationLevel === filters.education);
  }

  if (filters.minCompleteness) {
    filtered = filtered.filter(cand => cand.completeness >= Number(filters.minCompleteness));
  }

  if (filters.minExperience) {
    filtered = filtered.filter(cand => (cand.experienceYearsNum || 0) >= Number(filters.minExperience));
  }

  // Score Candidates
  const scoredResults = filtered.map(cand => {
    // 1. Keyword Score
    const kwResult = calculateKeywordScore(cand, reqs);
    const keywordScore = kwResult.score;

    // 2. Semantic Score
    const semanticScore = calculateLocalSemanticScore(cand, query);

    // 3. Completeness Score
    const completenessScore = cand.completeness || 60;

    // 4. Boolean Match Check
    let booleanMatches = true;
    if (mode === "boolean") {
      booleanMatches = evaluateBooleanSearch(cand, query);
    }

    // 5. Final Score Calculation based on mode
    let overallScore = 0;
    if (mode === "keyword") {
      overallScore = keywordScore;
    } else if (mode === "semantic") {
      overallScore = semanticScore;
    } else if (mode === "boolean") {
      overallScore = booleanMatches ? Math.max(75, keywordScore) : 0;
    } else {
      // Default: Configurable Combined Formula
      // Final Score = wSemantic × Semantic Score + wKeyword × Keyword Score + wCompleteness × Completeness Score
      const wSem = weights.semantic !== undefined ? weights.semantic : 0.50;
      const wKey = weights.keyword !== undefined ? weights.keyword : 0.40;
      const wComp = weights.completeness !== undefined ? weights.completeness : 0.10;

      const combined = (wSem * semanticScore) + (wKey * keywordScore) + (wComp * completenessScore);
      overallScore = Math.min(100, Math.max(0, Math.round(combined)));
    }

    const scoreDetails = {
      overallScore,
      keywordScore,
      semanticScore,
      completenessScore,
      matched: kwResult.matched,
      missing: kwResult.missing,
      weak: kwResult.weak
    };

    const explanation = generateExplanation(cand, scoreDetails, reqs);

    return {
      candidate: {
        id: cand.id,
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        github: cand.github,
        linkedin: cand.linkedin,
        educationLevel: cand.educationLevel,
        estimatedExperience: cand.estimatedExperience,
        skills: cand.skills,
        categorizedSkills: cand.categorizedSkills,
        completeness: cand.completeness,
        filename: cand.filename,
        rawText: cand.rawText
      },
      overallScore,
      keywordScore,
      semanticScore,
      completenessScore,
      booleanMatches,
      matchedSkills: kwResult.matched,
      missingTerms: kwResult.missing,
      weaklyRepresentedTerms: kwResult.weak,
      explanation
    };
  });

  // Filter out non-matching candidates if in boolean mode
  let finalResults = scoredResults;
  if (mode === "boolean") {
    finalResults = scoredResults.filter(r => r.booleanMatches);
  }

  // Minimum score filter if specified
  if (filters.minScore) {
    finalResults = finalResults.filter(r => r.overallScore >= Number(filters.minScore));
  }

  // Sort descending by overall score
  finalResults.sort((a, b) => b.overallScore - a.overallScore);

  // Assign ranks
  finalResults.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    results: finalResults,
    totalCandidates: candidates.length,
    matchedCount: finalResults.length,
    queryRequirements: reqs,
    mode,
    appliedWeights: weights
  };
}

module.exports = {
  extractQueryRequirements,
  calculateKeywordScore,
  calculateLocalSemanticScore,
  evaluateBooleanSearch,
  executeSearch
};
