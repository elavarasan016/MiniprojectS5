// ============================================================================
// PROFILE KEYWORD ENGINE & COUNTERFACTUAL SIMULATOR — RecruiterLens AI
// Modules 7 & 8: Evidence-Backed Keyword Gap Analysis & In-Memory Visibility Simulation
// ============================================================================

const { TAXONOMY, ALL_CANONICAL_SKILLS, matchSkillInText } = require("./taxonomy");
const { extractQueryRequirements, executeSearch } = require("./searchEngine");

/**
 * Find supporting sentence/phrase in resume text for a given term
 */
function findEvidenceInText(term, rawText) {
  if (!rawText || !term) return null;
  const sentences = rawText.split(/(?<=[.!?\n])\s+/);
  for (const s of sentences) {
    if (s.toLowerCase().includes(term.toLowerCase())) {
      const clean = s.trim().replace(/\s+/g, " ");
      if (clean.length > 10 && clean.length < 250) {
        return clean;
      }
    }
  }
  return null;
}

/**
 * ── MODULE 7: EVIDENCE-BASED KEYWORD GAP ANALYSIS ──
 * Analyzes candidate resume vs recruiter query requirements
 */
function performKeywordGapAnalysis(candidate, recruiterQuery) {
  if (!candidate) throw new Error("Candidate is required for gap analysis.");
  const query = (recruiterQuery || "").trim();
  const reqs = extractQueryRequirements(query);

  const candText = (candidate.rawText || "").toLowerCase();
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());

  const matched = [];
  const weak = [];
  const missing = [];
  const recommendations = [];

  // Check canonical skills
  reqs.skills.forEach(skill => {
    const isExplicit = candSkills.includes(skill.toLowerCase());
    const aliasObj = ALL_CANONICAL_SKILLS.find(s => s.name === skill);
    let inText = false;
    let matchingAliasUsed = skill;

    if (aliasObj) {
      for (const a of aliasObj.aliases) {
        if (matchSkillInText(a, candText)) {
          inText = true;
          matchingAliasUsed = a;
          break;
        }
      }
    } else {
      inText = matchSkillInText(skill, candText);
    }

    const evidenceSentence = findEvidenceInText(matchingAliasUsed, candidate.rawText);

    if (isExplicit) {
      matched.push({
        term: skill,
        type: "canonical_skill",
        evidence: evidenceSentence || `Listed explicitly in candidate's verified skills list.`,
        classification: "supported"
      });
    } else if (inText) {
      weak.push({
        term: skill,
        type: "canonical_skill",
        evidence: evidenceSentence || `Mentioned in resume text ("${matchingAliasUsed}"), but omitted from primary skills header.`,
        classification: "supported"
      });

      recommendations.push({
        term: skill,
        type: "promote_weak_skill",
        classification: "supported",
        confidence: "High (Evidence-Backed)",
        title: `Promote "${skill}" to Primary Skills Section`,
        description: `Your resume mentions "${matchingAliasUsed}" in project/experience descriptions, but recruiter search engines prioritize structured skill tags. Adding it explicitly aligns your profile without altering your true experience.`,
        evidenceFound: evidenceSentence || `Contextual mention of "${matchingAliasUsed}" detected in resume body.`,
        recruiterRequirement: `Required by search query: "${query}"`
      });
    } else {
      // Missing completely
      missing.push({
        term: skill,
        type: "canonical_skill",
        evidence: null,
        classification: "unsupported"
      });

      recommendations.push({
        term: skill,
        type: "missing_skill_gap",
        classification: "unsupported",
        confidence: "Evidence Missing (Do NOT Fabricate)",
        title: `Requirement Gap: "${skill}"`,
        description: `This search explicitly seeks experience in ${skill}. If you have authentic project or coursework experience in this area, detail it in your projects. If not, do NOT claim it—recruiter audits and interview checks will identify false claims.`,
        evidenceFound: "No mention detected in verified resume.",
        recruiterRequirement: `Requested by recruiter in query: "${query}"`
      });
    }
  });

  // Check general query tokens
  reqs.generalKeywords.forEach(kw => {
    const evidence = findEvidenceInText(kw, candidate.rawText);
    if (candText.includes(kw.toLowerCase())) {
      matched.push({
        term: kw,
        type: "general_keyword",
        evidence: evidence || `Found in candidate profile text.`,
        classification: "supported"
      });
    } else {
      missing.push({
        term: kw,
        type: "general_keyword",
        evidence: null,
        classification: "requires_confirmation"
      });

      recommendations.push({
        term: kw,
        type: "phrasing_gap",
        classification: "requires_confirmation",
        confidence: "Candidate Confirmation Required",
        title: `Terminology Alignment: "${kw}"`,
        description: `Recruiter uses the keyword "${kw}". Confirm whether any of your completed work directly involved "${kw}" before updating profile wording.`,
        evidenceFound: "Keyword not explicitly found in current resume.",
        recruiterRequirement: `Keyword from search: "${query}"`
      });
    }
  });

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    query,
    totalRequirements: reqs.allRequirements.length,
    matchedCount: matched.length,
    weakCount: weak.length,
    missingCount: missing.length,
    matched,
    weak,
    missing,
    recommendations
  };
}

/**
 * ── MODULE 8: COUNTERFACTUAL VISIBILITY SIMULATOR ──
 * "What if this evidence-supported keyword were represented more clearly in the profile?"
 * 
 * Simulates in memory without permanently modifying candidate profile in database.
 */
function simulateCounterfactual(allCandidates, candidateId, query, proposedChange) {
  const candidate = allCandidates.find(c => c.id === candidateId);
  if (!candidate) throw new Error("Candidate not found.");

  const {
    term,
    classification = "supported", // 'supported' | 'requires_confirmation' | 'unsupported'
    type = "promote_weak_skill"
  } = proposedChange;

  if (!term) throw new Error("Proposed term to simulate is required.");

  // CRITICAL CONSTRAINT: Block unsupported additions unless confirmed
  if (classification === "unsupported") {
    throw new Error(
      `Cannot simulate unsupported skill "${term}": No supporting evidence exists in candidate's resume. CareerLens truth constraints prohibit hallucinated skills.`
    );
  }

  // 1. Run baseline search across the candidate pool
  const originalSearch = executeSearch(allCandidates, { query, mode: "combined" });
  const originalCandidateResult = originalSearch.results.find(r => r.candidate.id === candidateId);
  const originalRank = originalCandidateResult ? originalCandidateResult.rank : allCandidates.length;
  const originalScore = originalCandidateResult ? originalCandidateResult.overallScore : 0;
  const originalKwScore = originalCandidateResult ? originalCandidateResult.keywordScore : 0;
  const originalSemScore = originalCandidateResult ? originalCandidateResult.semanticScore : 0;

  // 2. Create in-memory counterfactual copy of candidate (NEVER touches store)
  const simulatedSkills = Array.from(new Set([...(candidate.skills || []), term]));
  const simulatedRawText = `${candidate.rawText}\nTechnical Skills: ${term}`;

  const simulatedCandidate = {
    ...candidate,
    skills: simulatedSkills,
    rawText: simulatedRawText,
    completeness: Math.min(100, (candidate.completeness || 70) + 5)
  };

  // 3. Replace candidate in candidate pool *in-memory* for this simulation run
  const simulatedPool = allCandidates.map(c => (c.id === candidateId ? simulatedCandidate : c));

  // 4. Run identical search on simulated pool
  const simulatedSearch = executeSearch(simulatedPool, { query, mode: "combined" });
  const simulatedCandidateResult = simulatedSearch.results.find(r => r.candidate.id === candidateId);
  const simulatedRank = simulatedCandidateResult ? simulatedCandidateResult.rank : originalRank;
  const simulatedScore = simulatedCandidateResult ? simulatedCandidateResult.overallScore : originalScore;
  const simulatedKwScore = simulatedCandidateResult ? simulatedCandidateResult.keywordScore : originalKwScore;
  const simulatedSemScore = simulatedCandidateResult ? simulatedCandidateResult.semanticScore : originalSemScore;

  // 5. Calculate Differences
  const scoreDelta = simulatedScore - originalScore;
  const rankDelta = originalRank - simulatedRank; // positive means moved up in ranking

  // 6. Generate transparent rationale
  let explanation = "";
  if (rankDelta > 0) {
    explanation = `Promoting verified skill "${term}" improved candidate match score by +${scoreDelta}% (${originalScore}% → ${simulatedScore}%), moving their rank up from #${originalRank} to #${simulatedRank} in the recruiter search pool.`;
  } else if (scoreDelta > 0) {
    explanation = `Adding "${term}" raised keyword match score by +${scoreDelta}% (${originalScore}% → ${simulatedScore}%), but candidate remains at rank #${originalRank} because higher-ranked candidates still maintain stronger overall alignment across other search criteria.`;
  } else {
    explanation = `Adding "${term}" produced no measurable ranking change for query "${query}" because "${term}" was not a discriminating factor for this specific query.`;
  }

  return {
    candidateId,
    candidateName: candidate.name,
    query,
    simulatedTerm: term,
    evidenceClassification: classification,
    isSimulationOnly: true,
    original: {
      rank: originalRank,
      overallScore: originalScore,
      keywordScore: originalKwScore,
      semanticScore: originalSemScore
    },
    simulated: {
      rank: simulatedRank,
      overallScore: simulatedScore,
      keywordScore: simulatedKwScore,
      semanticScore: simulatedSemScore
    },
    deltas: {
      rankDelta,
      scoreDelta,
      rankImproved: rankDelta > 0,
      scoreImproved: scoreDelta > 0
    },
    explanation,
    disclaimer: "Counterfactual visibility simulation results are non-guaranteed estimates based on the current recruiter pool and query weights."
  };
}

module.exports = {
  performKeywordGapAnalysis,
  simulateCounterfactual
};
