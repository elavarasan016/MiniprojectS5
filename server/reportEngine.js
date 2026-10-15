// ============================================================================
// CANDIDATE PROFILE VISIBILITY REPORT ENGINE — RecruiterLens AI
// Module 9: Comprehensive Candidate Visibility Audit, Archetype Suitability, & Fragility
// ============================================================================

const { executeSearch } = require("./searchEngine");
const { analyzeSearchFragility } = require("./fragilityEngine");
const { performKeywordGapAnalysis } = require("./profileEngine");

// Standard industry job archetypes for visibility benchmarking
const BENCHMARK_ARCHETYPES = [
  { role: "Machine Learning / AI Engineer", query: "Python Machine Learning PyTorch Deep Learning NLP Model Deployment" },
  { role: "Full Stack Web Developer", query: "React TypeScript Next.js Node.js Express PostgreSQL REST APIs" },
  { role: "Cloud DevOps & SRE Engineer", query: "AWS Kubernetes Docker Terraform CI/CD Linux" },
  { role: "Backend Systems Engineer", query: "Java Spring Boot REST APIs Kafka MySQL Microservices" },
  { role: "Frontend UI Specialist", query: "React Next.js TypeScript Tailwind CSS Redux Responsive Design" },
  { role: "Data Analyst / BI Specialist", query: "Python SQL Excel Power BI Tableau PostgreSQL Pandas" }
];

/**
 * Generate full Candidate Profile Visibility Report
 */
function generateCandidateReport(candidate, allCandidates) {
  if (!candidate) throw new Error("Candidate is required for report generation.");

  // 1. Archetype Suitability Scores
  const archetypeScores = BENCHMARK_ARCHETYPES.map(arch => {
    const searchRes = executeSearch(allCandidates, { query: arch.query, mode: "combined" });
    const match = searchRes.results.find(r => r.candidate.id === candidate.id);
    const score = match ? match.overallScore : 0;
    const rank = match ? match.rank : allCandidates.length;

    return {
      role: arch.role,
      queryUsed: arch.query,
      score,
      rank,
      percentile: Math.round(((allCandidates.length - rank + 1) / allCandidates.length) * 100),
      suitabilityBand: score >= 75 ? "High Fit" : score >= 50 ? "Moderate Fit" : "Low Alignment",
      matchedSkills: match ? match.matchedSkills : [],
      missingRequirements: match ? match.missingTerms : []
    };
  });

  // Identify highest alignment archetype
  const bestFit = archetypeScores.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

  // 2. Multi-query Fragility analysis for candidate's top archetype
  let fragilityProfile = null;
  try {
    const fragilityRes = analyzeSearchFragility(allCandidates, [
      bestFit.queryUsed,
      `${bestFit.role} Developer`,
      `Senior ${bestFit.role}`
    ]);
    const candidateFragility = fragilityRes.results.find(r => r.candidate.id === candidate.id);
    if (candidateFragility) {
      fragilityProfile = {
        fragilityScore: candidateFragility.fragilityScore,
        stabilityBand: candidateFragility.stabilityBand,
        rankDelta: candidateFragility.rankDelta,
        bestRank: candidateFragility.bestRank,
        worstRank: candidateFragility.worstRank,
        explanation: candidateFragility.detailedReason
      };
    }
  } catch (err) {
    console.warn("Fragility profile generation notice:", err.message);
  }

  // 3. Evidence-Backed Gap Analysis for top archetype
  const gapAnalysis = performKeywordGapAnalysis(candidate, bestFit.queryUsed);

  // 4. Profile Completeness Audit Breakdown
  const completenessBreakdown = [
    { item: "Candidate Name & Header", satisfied: Boolean(candidate.name && candidate.name !== "Candidate Profile"), weight: 15 },
    { item: "Direct Contact Email", satisfied: Boolean(candidate.email && candidate.email !== "Not Provided"), weight: 15 },
    { item: "Phone Number", satisfied: Boolean(candidate.phone && candidate.phone !== "Not Provided"), weight: 10 },
    { item: "GitHub / Portfolio Presence", satisfied: Boolean(candidate.github || candidate.linkedin), weight: 10 },
    { item: "Core Technical Skills Count (≥ 5)", satisfied: (candidate.skills || []).length >= 5, weight: 25 },
    { item: "Identifiable Education Credential", satisfied: candidate.educationLevel !== "Not Specified", weight: 15 },
    { item: "Quantified Experience Details", satisfied: (candidate.experienceYearsNum || 0) > 0, weight: 10 }
  ];

  return {
    generatedAt: new Date().toISOString(),
    candidate: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      github: candidate.github,
      linkedin: candidate.linkedin,
      educationLevel: candidate.educationLevel,
      estimatedExperience: candidate.estimatedExperience,
      completeness: candidate.completeness,
      totalSkillsCount: (candidate.skills || []).length,
      skills: candidate.skills,
      categorizedSkills: candidate.categorizedSkills,
      filename: candidate.filename,
      rawText: candidate.rawText
    },
    primarySpecialization: bestFit.role,
    primaryFitScore: bestFit.score,
    archetypeSuitability: archetypeScores,
    fragilityProfile,
    keywordGapAnalysis: {
      query: bestFit.queryUsed,
      matched: gapAnalysis.matched,
      weak: gapAnalysis.weak,
      missing: gapAnalysis.missing,
      recommendations: gapAnalysis.recommendations
    },
    completenessAudit: {
      score: candidate.completeness,
      breakdown: completenessBreakdown
    }
  };
}

module.exports = {
  BENCHMARK_ARCHETYPES,
  generateCandidateReport
};
