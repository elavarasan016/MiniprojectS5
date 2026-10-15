// ============================================================================
// SEARCH FRAGILITY ENGINE — RecruiterLens AI
// Module 6: Multi-Query Search Fragility & Visibility Variation Analysis
// ============================================================================

const { executeSearch } = require("./searchEngine");

/**
 * Pre-defined test query bundles for immediate recruiter simulation
 */
const FRAGILITY_PRESETS = [
  {
    name: "AI & Machine Learning Engineering Variants",
    description: "Evaluates how ML candidates rank across academic vs industry wording",
    queries: [
      "Python Machine Learning Engineer",
      "ML Developer with Scikit-Learn and PyTorch",
      "AI Engineer with NLP and Model Deployment",
      "Predictive Analytics Developer with SQL"
    ]
  },
  {
    name: "Full Stack & Web Architecture Variants",
    description: "Tests frontend/backend phrasing vs full-stack labels",
    queries: [
      "Full Stack Developer React Node.js",
      "TypeScript Frontend Engineer with Next.js",
      "Backend Engineer Express PostgreSQL REST APIs",
      "JavaScript Software Engineer with MongoDB"
    ]
  },
  {
    name: "DevOps & Cloud Infrastructure Variants",
    description: "Compares generic DevOps vs SRE vs containerization queries",
    queries: [
      "DevOps Engineer AWS Kubernetes",
      "Site Reliability Engineer (SRE) Linux Terraform",
      "Cloud Infrastructure Engineer Docker CI/CD",
      "Systems Automation Engineer with Python Bash"
    ]
  },
  {
    name: "Data Analytics & Business Intelligence Variants",
    description: "Checks SQL, Excel, and BI phrasing overlap",
    queries: [
      "Data Analyst SQL Python Excel",
      "Business Intelligence Specialist Power BI Tableau",
      "Data Insights Engineer PostgreSQL Reporting",
      "Quantitative Data Specialist Pandas NumPy"
    ]
  }
];

/**
 * Standard deviation calculation
 */
function standardDeviation(values) {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Analyze Search Fragility across an array of queries
 * 
 * Formula:
 * Search Fragility Score = 0.70 × Normalized Rank Variation + 0.30 × Missing Query Penalty
 * 
 * Bands:
 * 0–30: Relatively stable visibility
 * 31–60: Moderate visibility variation
 * 61–100: High search fragility
 */
function analyzeSearchFragility(candidates, queryList, options = {}) {
  const queries = (queryList || [])
    .map(q => (typeof q === "string" ? q.trim() : ""))
    .filter(Boolean);

  if (queries.length < 2) {
    throw new Error("Fragility analysis requires at least 2 distinct queries for comparative ranking.");
  }

  if (!candidates || candidates.length === 0) {
    return { candidateFragilities: [], querySummaries: [], presets: FRAGILITY_PRESETS };
  }

  const numCandidates = candidates.length;
  // Maximum possible rank difference in candidate pool
  const maxPossibleRankSpan = Math.max(1, numCandidates - 1);

  // 1. Run each search independently across the candidate pool
  const searchRuns = queries.map(query => {
    const searchResult = executeSearch(candidates, {
      query,
      mode: options.mode || "combined",
      weights: options.weights
    });
    return {
      query,
      results: searchResult.results,
      requirements: searchResult.queryRequirements
    };
  });

  // 2. Map candidate visibility across all query runs
  const candidateMatrix = candidates.map(candidate => {
    const ranks = [];
    const scores = [];
    const queryBreakdown = [];
    let unretrievedCount = 0; // candidate scored below viable threshold (< 40) or outside top 10

    searchRuns.forEach(run => {
      const match = run.results.find(r => r.candidate.id === candidate.id);
      if (match) {
        ranks.push(match.rank);
        scores.push(match.overallScore);
        const isLowVisibility = match.overallScore < 45 || match.rank > Math.min(8, numCandidates);
        if (isLowVisibility) unretrievedCount++;

        queryBreakdown.push({
          query: run.query,
          rank: match.rank,
          score: match.overallScore,
          keywordScore: match.keywordScore,
          semanticScore: match.semanticScore,
          matchedSkills: match.matchedSkills,
          missingTerms: match.missingTerms,
          status: match.overallScore >= 70 ? "high" : match.overallScore >= 45 ? "moderate" : "low"
        });
      } else {
        // Not returned
        ranks.push(numCandidates + 1);
        scores.push(0);
        unretrievedCount++;
        queryBreakdown.push({
          query: run.query,
          rank: numCandidates + 1,
          score: 0,
          matchedSkills: [],
          missingTerms: run.requirements?.allRequirements || [],
          status: "missing"
        });
      }
    });

    // 3. Compute Metrics
    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);
    const rankDelta = maxRank - minRank;
    const avgRank = +(ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const rankStdDev = +standardDeviation(ranks).toFixed(2);

    // Normalize rank variation to 0 - 100
    // Max theoretical standard deviation across N candidates is ~ (N-1)/2
    const maxStdDev = Math.max(1, maxPossibleRankSpan / 2);
    const normalizedRankVariation = Math.min(100, Math.round((rankStdDev / maxStdDev) * 100));

    // Normalize missing query penalty (0 - 100)
    const missingQueryPenalty = Math.round((unretrievedCount / queries.length) * 100);

    // Final Fragility Score = 0.70 × Normalized Rank Variation + 0.30 × Missing Query Penalty
    const fragilityScore = Math.min(
      100,
      Math.max(0, Math.round(0.70 * normalizedRankVariation + 0.30 * missingQueryPenalty))
    );

    // Interpretation Band
    let stabilityBand = "Stable Visibility";
    let stabilityColor = "var(--emerald)";
    let bandExplanation = "";

    if (fragilityScore <= 30) {
      stabilityBand = "Stable Visibility";
      stabilityColor = "var(--emerald)";
      bandExplanation = "Profile visibility remains consistent regardless of recruiter query phrasing.";
    } else if (fragilityScore <= 60) {
      stabilityBand = "Moderate Variation";
      stabilityColor = "var(--amber)";
      bandExplanation = "Candidate ranks reasonably well for core queries, but visibility fluctuates with subtle wording changes.";
    } else {
      stabilityBand = "High Search Fragility";
      stabilityColor = "var(--rose)";
      bandExplanation = "Candidate's ranking is highly sensitive to exact recruiter vocabulary, suffering significant drop-offs.";
    }

    // Specific explanation of which queries caused the rank swing
    let detailedReason = "";
    if (rankDelta === 0) {
      detailedReason = `Consistently ranked #${minRank} across all ${queries.length} queries with stable score averaging ${avgScore}%.`;
    } else {
      const bestRun = queryBreakdown.reduce((prev, curr) => (curr.rank < prev.rank ? curr : prev));
      const worstRun = queryBreakdown.reduce((prev, curr) => (curr.rank > prev.rank ? curr : prev));
      detailedReason = `Ranks #${bestRun.rank} for "${bestRun.query}" (${bestRun.score}%), but drops to #${worstRun.rank} for "${worstRun.query}" (${worstRun.score}%). Missing terms such as ${worstRun.missingTerms?.slice(0, 2).join(", ") || "specific keywords"} drove this visibility gap.`;
    }

    return {
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        educationLevel: candidate.educationLevel,
        skills: candidate.skills,
        completeness: candidate.completeness,
        filename: candidate.filename
      },
      fragilityScore,
      stabilityBand,
      stabilityColor,
      bandExplanation,
      rankDelta,
      bestRank: minRank,
      worstRank: maxRank,
      avgRank,
      avgScore,
      rankStdDev,
      unretrievedCount,
      ranks,
      scores,
      queryBreakdown,
      detailedReason
    };
  });

  // Sort candidates by lowest fragility first (most stable to most fragile)
  candidateMatrix.sort((a, b) => a.fragilityScore - b.fragilityScore);

  return {
    queries,
    queryCount: queries.length,
    candidateCount: candidates.length,
    results: candidateMatrix,
    presets: FRAGILITY_PRESETS
  };
}

module.exports = {
  FRAGILITY_PRESETS,
  analyzeSearchFragility
};
