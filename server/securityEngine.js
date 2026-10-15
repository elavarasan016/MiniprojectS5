// ============================================================================
// RESUMEGUARD — PROMPT INJECTION DETECTION & SECURITY ENGINE
// Comprehensive deterministic detection for instruction override, ranking
// manipulation, secret extraction, unauthorized actions, and hidden obfuscation.
// ============================================================================

const crypto = require("crypto");
const { extractProfileFromText, ALL_CANONICAL_SKILLS } = require("./taxonomy");

const ENGINE_VERSION = "2.4.0-ResumeGuard-Deterministic";

// ── Severity Definitions ───────────────────────────────────────────────────
const SEVERITIES = {
  CRITICAL: { label: "Critical", weight: 95, color: "#EF4444" },
  HIGH: { label: "High", weight: 75, color: "#F97316" },
  MEDIUM: { label: "Medium", weight: 45, color: "#FBBF24" },
  LOW: { label: "Low", weight: 20, color: "#60A5FA" },
  INFORMATIONAL: { label: "Informational", weight: 5, color: "#94A3B8" }
};

// ── Threat Categories ──────────────────────────────────────────────────────
const THREAT_CATEGORIES = {
  INSTRUCTION_OVERRIDE: "Instruction Override",
  RANKING_MANIPULATION: "Candidate Ranking Manipulation",
  CONFIDENTIAL_EXTRACTION: "Confidential Information Extraction",
  UNAUTHORIZED_ACTIONS: "Unauthorized Actions & Exfiltration",
  HIDDEN_OBFUSCATED: "Hidden or Obfuscated Instructions",
  CONTEXTUAL_INJECTION: "Contextual Prompt Injection"
};

// ── Legitimate Benign Context Patterns (False Positive Filtering) ──────────
const BENIGN_RESEARCH_PATTERNS = [
  /\b(?:researched|studied|evaluated|analyzed|tested|mitigated|prevented|defended against|benchmarked)\s+(?:prompt\s+injection|jailbreaks?|llm\s+security|adversarial\s+attacks?)\b/i,
  /\b(?:built|developed|implemented|architected|authored|created)\s+(?:a\s+)?(?:prompt\s+injection|llm\s+security|guardrails?|detector|defense\s+system)\b/i,
  /\b(?:paper|publication|talk|presentation|coursework|thesis)\s+(?:on|about)\s+(?:prompt\s+injection|adversarial\s+prompts?|red\s+teaming)\b/i,
  /\b(?:red[\s-]teaming|vulnerability\s+assessment|penetration\s+testing)\s+of\s+(?:llms?|generative\s+ai|prompt\s+systems?)\b/i
];

/**
 * Checks if a matched sentence is legitimate security research / engineering
 */
function isBenignTechnicalDiscussion(sentence) {
  return BENIGN_RESEARCH_PATTERNS.some(pat => pat.test(sentence));
}

// ── Category Detection Rule Definitions ────────────────────────────────────

// Category A: Instruction Override
const INSTRUCTION_OVERRIDE_RULES = [
  {
    id: "IO-001",
    regex: /\bignore\s+(?:all\s+)?(?:previous|prior|above|preceding|system|former)\s+(?:instructions?|directives?|rules?|prompts?|commands?)\b/i,
    severity: "HIGH",
    confidence: "High (95%)",
    name: "Explicit Instruction Ignore Directive",
    explanation: "Directly instructs the evaluating AI model to discard its pre-configured system instructions.",
    impact: "Could cause AI screening agent to abandon recruitment rubrics and evaluation criteria.",
    action: "Disregard override instruction. Verify candidate's authentic resume text."
  },
  {
    id: "IO-002",
    regex: /\bdisregard\s+(?:the\s+)?(?:system\s+prompt|recruiter\s+instructions?|previous\s+instructions?|all\s+prior\s+rules?)\b/i,
    severity: "HIGH",
    confidence: "High (92%)",
    name: "System Prompt Disregard Command",
    explanation: "Explicit command attempting to invalidate evaluator system directives.",
    impact: "Attempts to unbind the model from recruitment safeguards.",
    action: "Flag document for manual recruiter audit."
  },
  {
    id: "IO-003",
    regex: /\boverride\s+(?:all\s+)?(?:system|recruiter|evaluation|ranking|screening)\s+(?:prompts?|instructions?|rules?|criteria)\b/i,
    severity: "HIGH",
    confidence: "High (90%)",
    name: "System Instruction Override Claim",
    explanation: "Attempts to inject alternate authority over screening parameters.",
    impact: "Intended to subvert deterministic ranking algorithms.",
    action: "Isolate resume text in sandbox environment."
  },
  {
    id: "IO-004",
    regex: /\bfollow\s+(?:these|the\s+following)\s+instructions?\s+instead\b/i,
    severity: "MEDIUM",
    confidence: "Medium (85%)",
    name: "Secondary Instruction Redirection",
    explanation: "Redirects the language model to follow embedded candidate text rather than screening rules.",
    impact: "May induce model to adopt adversary's scoring criteria.",
    action: "Strip flagged sentence before feeding to any LLM summarizer."
  },
  {
    id: "IO-005",
    regex: /\b(?:you\s+are\s+now|act\s+as)\s+(?:in\s+developer\s+mode|unrestricted|jailbroken|an\s+unfiltered\s+assistant|DAN)\b/i,
    severity: "CRITICAL",
    confidence: "High (98%)",
    name: "Jailbreak / Persona Hijack Attack",
    explanation: "Classic LLM jailbreak attempting to switch persona to an unrestricted or unaligned state.",
    impact: "Severe boundary violation attempting to disable all model safety filters.",
    action: "Flag immediately for security review; do not execute in automated screening."
  },
  {
    id: "IO-006",
    regex: /\b(?:new\s+system\s+(?:instruction|prompt)|forget\s+(?:all\s+)?(?:previous|prior)\s+rules)\b/i,
    severity: "HIGH",
    confidence: "High (90%)",
    name: "System Prompt Spoofing Prefix",
    explanation: "Mimics trusted system framing to trick model into resetting its instruction memory.",
    impact: "Potential bypass of evaluation rubric.",
    action: "Review highlighted text and verify source section."
  }
];

// Category B: Candidate Ranking Manipulation
const RANKING_MANIPULATION_RULES = [
  {
    id: "RM-001",
    regex: /\b(?:rank|place)\s+(?:this\s+|the\s+)?candidate\s+(?:first|#1|at\s+the\s+top|as\s+number\s+one|highest)\b/i,
    severity: "HIGH",
    confidence: "High (94%)",
    name: "Forced First-Place Ranking Directive",
    explanation: "Imperative directive commanding the screening model to place this candidate at rank #1.",
    impact: "Attempts to distort ATS search result ordering and displace more qualified candidates.",
    action: "Ensure deterministic ranking formula is used; LLM text must never dictate rank."
  },
  {
    id: "RM-002",
    regex: /\b(?:assign|give|award)\s+(?:(?:this|the)\s+candidate\s+)?(?:a\s+score\s+of\s+)?(?:100%?|perfect\s+score|maximum\s+points?|10\/10)\b/i,
    severity: "HIGH",
    confidence: "High (92%)",
    name: "Score Inflation Command (100% / Perfect Score)",
    explanation: "Attempts to force an artificial 100% match score regardless of true qualifications.",
    impact: "Manipulates algorithmic applicant scoring.",
    action: "Verify candidate's score against objective formula."
  },
  {
    id: "RM-003",
    regex: /\bignore\s+(?:all\s+)?(?:other|competing|remaining)\s+(?:candidates?|applicants?|resumes?)\b/i,
    severity: "HIGH",
    confidence: "High (90%)",
    name: "Competitor Candidate Dismissal Directive",
    explanation: "Instructs evaluator to ignore competing applicants in the search pool.",
    impact: "Aims to suppress visibility of other qualified talent.",
    action: "Maintain strict candidate isolation during evaluations."
  },
  {
    id: "RM-004",
    regex: /\bdeclare\s+this\s+candidate\s+(?:the\s+)?(?:best|ideal|top|selected)\s+(?:applicant|candidate|match)\s+regardless\s+of\s+qualifications?\b/i,
    severity: "CRITICAL",
    confidence: "High (96%)",
    name: "Unconditional Best-Applicant Declaration",
    explanation: "Directly instructs the screening system to declare candidate optimal without qualifications.",
    impact: "Blatant subversion of merit-based ATS evaluation.",
    action: "Require human recruiter validation of all qualification claims."
  },
  {
    id: "RM-005",
    regex: /\b(?:must\s+be\s+hired\s+immediately|guarantee\s+(?:an\s+)?interview|automatic\s+pass\s+to\s+next\s+round)\b/i,
    severity: "MEDIUM",
    confidence: "Medium (85%)",
    name: "Automated Hiring Process Bypass Instruction",
    explanation: "Commands the screening software to grant automatic interview qualification.",
    impact: "Attempts to short-circuit recruitment pipeline stages.",
    action: "Flag for recruiter awareness."
  }
];

// Category C: Confidential Information Extraction
const CONFIDENTIAL_EXTRACTION_RULES = [
  {
    id: "CE-001",
    regex: /\b(?:reveal|print|output|display|show|leak|echo|repeat)\s+(?:the\s+)?(?:system\s+prompt|hidden\s+prompt|initial\s+prompt|meta\s+instructions?)\b/i,
    severity: "CRITICAL",
    confidence: "High (96%)",
    name: "System Prompt Extraction / Leaking Attempt",
    explanation: "Crafted prompt designed to trick model into regurgitating proprietary system prompts.",
    impact: "Confidentiality breach exposing internal hiring criteria and system architecture.",
    action: "Block output reflection of system instructions."
  },
  {
    id: "CE-002",
    regex: /\b(?:reveal|print|output|display|leak|dump|show)\s+(?:all\s+)?(?:api\s*keys?|credentials?|secrets?|tokens?|passwords?|env\s+vars?)\b/i,
    severity: "CRITICAL",
    confidence: "High (98%)",
    name: "Credential & API Key Exfiltration Directive",
    explanation: "Attempts to induce model into dumping active environment API keys or secrets.",
    impact: "High-severity credential exposure.",
    action: "Ensure environment variables are never accessible to evaluation prompt contexts."
  },
  {
    id: "CE-003",
    regex: /\b(?:display|output|show|list)\s+(?:all\s+)?(?:candidate\s+records?|other\s+applicants?|salary\s+data|private\s+notes?)\b/i,
    severity: "CRITICAL",
    confidence: "High (95%)",
    name: "Cross-Candidate Private Data Extraction",
    explanation: "Attempts to access confidential applicant records or evaluator notes.",
    impact: "Data privacy violation (GDPR / PII breach across candidate database).",
    action: "Enforce strict candidate data isolation boundaries."
  }
];

// Category D: Unauthorized Actions
const UNAUTHORIZED_ACTIONS_RULES = [
  {
    id: "UA-001",
    regex: /\b(?:curl|wget|fetch|axios|http\.get)\s*\(?['"]?https?:\/\/[^\s'"<)]+/i,
    severity: "CRITICAL",
    confidence: "High (96%)",
    name: "External HTTP Network Request / Exfiltration Payload",
    explanation: "Contains command syntax instructing automated agents to send HTTP calls externally.",
    impact: "Remote data exfiltration or Server-Side Request Forgery (SSRF).",
    action: "Block all outbound network requests from untrusted resume parsing pipelines."
  },
  {
    id: "UA-002",
    regex: /\b(?:system|exec|eval|child_process|subprocess\.call|os\.system)\s*\(/i,
    severity: "CRITICAL",
    confidence: "High (98%)",
    name: "Arbitrary Code Execution Payload",
    explanation: "Shell or interpreter execution syntax injected to execute system commands.",
    impact: "Remote Code Execution (RCE) on backend infrastructure.",
    action: "Treat resume strictly as passive text data; never evaluate with eval or shell."
  },
  {
    id: "UA-003",
    regex: /<script\b[^>]*>[\s\S]*?<\/script>/i,
    severity: "CRITICAL",
    confidence: "High (98%)",
    name: "Raw JavaScript / Cross-Site Scripting (XSS) Tag",
    explanation: "Executable script tag embedded in resume content.",
    impact: "Client-side XSS attack targeting recruiter review dashboard.",
    action: "Sanitize and escape all resume content before HTML rendering."
  },
  {
    id: "UA-004",
    regex: /\b(?:trigger_tool|call_tool|execute_command|modify_database|delete_candidate)\b/i,
    severity: "HIGH",
    confidence: "High (88%)",
    name: "Tool Invocation / RPC Hijacking Pattern",
    explanation: "Attempts to trigger agentic tools or internal functions outside authorized flow.",
    impact: "Unauthorized state modification in recruiter backend.",
    action: "Never expose administrative tool-call interfaces to resume inputs."
  }
];

// Category E: Hidden or Obfuscated Instructions
const HIDDEN_OBFUSCATED_RULES = [
  {
    id: "HO-001",
    regex: /<!--[\s\S]*?(?:ignore|instruction|rank|score|system|prompt|bypass|candidate)[\s\S]*?-->/i,
    severity: "HIGH",
    confidence: "High (95%)",
    name: "Suspicious Instruction Inside HTML Comment",
    explanation: "Instruction text hidden inside HTML comments invisible to human readers but parsed by text extractors.",
    impact: "Stealthy prompt injection designed to deceive AI evaluators without human visibility.",
    action: "Strip HTML comments and present extracted text transparently to recruiters."
  },
  {
    id: "HO-002",
    regex: /<[^>]+style\s*=\s*['"][^'"]*(?:display\s*:\s*none|font-size\s*:\s*0|visibility\s*:\s*hidden|color\s*:\s*white;?\s*background\s*:\s*white|color\s*:\s*transparent)[^'"]*['"][^>]*>([\s\S]*?)<\/[^>]+>/i,
    severity: "HIGH",
    confidence: "High (92%)",
    name: "Zero-Font / CSS Hidden Text Injection",
    explanation: "Text styled to be invisible to human eyes (zero font size, white-on-white text, display:none).",
    impact: "White-text ATS keyword stuffing and hidden prompt injection.",
    action: "Display flagged hidden text in recruiter security report."
  }
];

// Category F: Contextual Prompt Injection
const CONTEXTUAL_INJECTION_RULES = [
  {
    id: "CI-001",
    regex: /\[(?:System\s*(?:Message|Directive|Prompt|Instruction)|Note\s*to\s*Evaluator|Internal\s*Directive|Admin\s*Note)\s*:\s*[^\]]+\]/i,
    severity: "HIGH",
    confidence: "High (90%)",
    name: "Bracketed Pseudo-System Frame Injection",
    explanation: "Embeds fake bracketed [System Message: ...] headers to spoof evaluator metadata.",
    impact: "Confuses language model role boundary separation.",
    action: "Verify that all model context boundaries are token-isolated."
  },
  {
    id: "CI-002",
    regex: /\b(?:attention\s+(?:llm|ai|evaluator|screening\s+bot)|note\s+for\s+(?:the\s+)?recruiter\s+bot)\s*:\s*[^.\n]+/i,
    severity: "MEDIUM",
    confidence: "High (88%)",
    name: "Explicit AI Evaluator Addressing Directive",
    explanation: "Speaks directly to the screening model to influence narrative output.",
    impact: "Attempts to dictate recruiter summary and recommendation phrasing.",
    action: "Exclude commentary from qualification scoring."
  }
];

// Informational: Benign Security Research
const INFORMATIONAL_RESEARCH_RULES = [
  {
    id: "INFO-SEC-001",
    regex: /\b(?:researched|studied|evaluated|analyzed|tested|mitigated|prevented|defended against|built|developed|published|paper on|thesis on)\s+(?:a\s+)?(?:prompt\s+injection|jailbreaks?|adversarial\s+prompts?|llm\s+security|guardrails?|robustness\s+testing)\b/i,
    severity: "INFORMATIONAL",
    confidence: "High (92%)",
    name: "Legitimate AI Security / Prompt Robustness Research",
    explanation: "Candidate discusses prompt injection defense or robustness testing in a legitimate research or engineering capacity.",
    impact: "None (positive technical competency).",
    action: "No mitigation required; treat as cybersecurity qualification."
  }
];

// Combine all rules
const ALL_DETECTION_RULES = [
  ...INSTRUCTION_OVERRIDE_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.INSTRUCTION_OVERRIDE })),
  ...RANKING_MANIPULATION_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.RANKING_MANIPULATION })),
  ...CONFIDENTIAL_EXTRACTION_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.CONFIDENTIAL_EXTRACTION })),
  ...UNAUTHORIZED_ACTIONS_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.UNAUTHORIZED_ACTIONS })),
  ...HIDDEN_OBFUSCATED_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.HIDDEN_OBFUSCATED })),
  ...CONTEXTUAL_INJECTION_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.CONTEXTUAL_INJECTION })),
  ...INFORMATIONAL_RESEARCH_RULES.map(r => ({ ...r, category: THREAT_CATEGORIES.INSTRUCTION_OVERRIDE }))
];

/**
 * Unicode and Encoding Anomaly Detector
 */
function inspectUnicodeAndEncodingAnomalies(rawText) {
  const findings = [];
  if (!rawText) return findings;

  // 1. Zero-width characters: \u200B (ZWSP), \u200C (ZWNJ), \u200D (ZWJ), \uFEFF (BOM), \u2060 (WJ)
  const zeroWidthRegex = /[\u200B\u200C\u200D\uFEFF\u2060]/g;
  const zeroWidthMatches = rawText.match(zeroWidthRegex) || [];
  if (zeroWidthMatches.length >= 3) {
    findings.push({
      id: "UA-ZW-001",
      category: THREAT_CATEGORIES.HIDDEN_OBFUSCATED,
      severity: zeroWidthMatches.length > 10 ? "HIGH" : "MEDIUM",
      confidence: "High (95%)",
      name: `Zero-Width Character Embedding (${zeroWidthMatches.length} occurrences)`,
      explanation: `Detected ${zeroWidthMatches.length} hidden zero-width characters (e.g. ZWSP/BOM) inside the document. Often utilized for steganographic instruction smuggling or visual spoofing.`,
      impact: "May carry obfuscated payloads invisible to human recruiters in PDF/DOCX renderers.",
      action: "Sanitize zero-width characters from document before processing.",
      evidenceExcerpt: `Detected ${zeroWidthMatches.length} zero-width control characters embedded in text corpus.`,
      detectionMethod: "Unicode Control Character Analysis",
      section: "Document Byte Structure"
    });
  }

  // 2. Bidirectional override characters: \u202E (RLO), \u202D (LRO), \u202A, \u202B
  const bidiRegex = /[\u202A-\u202E]/g;
  const bidiMatches = rawText.match(bidiRegex) || [];
  if (bidiMatches.length > 0) {
    findings.push({
      id: "UA-BIDI-001",
      category: THREAT_CATEGORIES.HIDDEN_OBFUSCATED,
      severity: "HIGH",
      confidence: "High (90%)",
      name: "Bidirectional Unicode Override Spoofing",
      explanation: "Detected Right-to-Left Override (RLO / \u202E) characters capable of reversing apparent file extensions or visual text order.",
      impact: "Visual deception targeting human reviewers or regex parsers.",
      action: "Strip directional override markers.",
      evidenceExcerpt: `Found ${bidiMatches.length} bidirectional override control characters.`,
      detectionMethod: "Unicode Bidi Inspector",
      section: "Text Stream"
    });
  }

  // 3. Base64 Suspicious Instruction Payload
  const base64Regex = /\b(?:[A-Za-z0-9+/]{28,}={0,2})\b/g;
  const base64Candidates = rawText.match(base64Regex) || [];
  for (const b64 of base64Candidates.slice(0, 5)) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf-8");
      // Check if decoded string contains English words and instruction markers
      if (/^[a-zA-Z0-9\s.,!?:;_-]+$/.test(decoded) && decoded.length > 15) {
        const lowerDecoded = decoded.toLowerCase();
        if (
          lowerDecoded.includes("ignore") ||
          lowerDecoded.includes("prompt") ||
          lowerDecoded.includes("system") ||
          lowerDecoded.includes("rank") ||
          lowerDecoded.includes("candidate") ||
          lowerDecoded.includes("score")
        ) {
          findings.push({
            id: "ENC-B64-001",
            category: THREAT_CATEGORIES.HIDDEN_OBFUSCATED,
            severity: "HIGH",
            confidence: "High (92%)",
            name: "Base64 Encoded Prompt Injection Payload",
            explanation: `Found Base64 string that decodes to: "${decoded.slice(0, 80)}"`,
            impact: "Attempts to bypass simple string-matching filters using standard encoding.",
            action: "Decode and inspect all encoded strings in resume before AI processing.",
            evidenceExcerpt: `Base64: "${b64.slice(0, 30)}..." → Decoded: "${decoded.slice(0, 80)}"`,
            detectionMethod: "Base64 Payload Decoder",
            section: "Encoded Document Text"
          });
          break;
        }
      }
    } catch {
      // not valid base64, ignore
    }
  }

  return findings;
}

/**
 * Identify section heading of a given sentence inside resume
 */
function identifySectionForSentence(sentence, rawText) {
  const lowerText = (rawText || "").toLowerCase();
  const lowerSent = sentence.toLowerCase();
  const sentIdx = lowerText.indexOf(lowerSent);

  if (sentIdx === -1) return "General Document";

  const precedingText = lowerText.substring(Math.max(0, sentIdx - 300), sentIdx);
  if (/education|academic|degree|university/i.test(precedingText)) return "Education Section";
  if (/experience|work\s+history|employment|role/i.test(precedingText)) return "Experience Section";
  if (/projects?|portfolio|built/i.test(precedingText)) return "Projects Section";
  if (/skills?|technologies|tools/i.test(precedingText)) return "Skills Section";
  if (/summary|objective|profile/i.test(precedingText)) return "Summary Section";

  return "Document Body";
}

/**
 * ── MAIN DETECTOR PIPELINE ──
 * Scans resume text deterministically, grouping duplicates and computing explainable risk score
 */
function scanResumeForPromptInjection(rawText, metadata = {}) {
  const text = (rawText || "").trim();
  const reportId = `rep_sec_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const timestamp = new Date().toISOString();

  // If text is empty or unreadable
  if (!text || text.length < 10) {
    return {
      reportId,
      timestamp,
      engineVersion: ENGINE_VERSION,
      metadata,
      hasSuspiciousContent: false,
      totalFindingsCount: 0,
      riskIndicator: 0,
      riskBand: "Clean / Unreadable",
      riskColor: "var(--emerald)",
      findings: [],
      severityDistribution: { critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
      executiveSummary: "Document contains insufficient text content for security analysis.",
      finalRecommendation: "No suspicious instructions detected by current checks. Ensure valid resume format is uploaded.",
      candidateQualifications: null,
      disclaimer: "ResumeGuard is an automated screening defense aid; it does not guarantee absence of zero-day attacks."
    };
  }

  const rawFindings = [];

  // 1. Inspect Unicode and Steganographic anomalies
  const unicodeFindings = inspectUnicodeAndEncodingAnomalies(text);
  rawFindings.push(...unicodeFindings);

  // 2. Split text into logical lines / sentences
  const sentences = text
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  // 3. Evaluate Rule Sets against text
  sentences.forEach((sentence, lineIdx) => {
    // Check if sentence is legitimate security research / technical description
    const isBenignResearch = isBenignTechnicalDiscussion(sentence);

    ALL_DETECTION_RULES.forEach(rule => {
      if (rule.regex.test(sentence)) {
        const section = identifySectionForSentence(sentence, text);

        if (isBenignResearch) {
          // Down-rank to Informational: legitimate security work!
          rawFindings.push({
            id: `${rule.id}-INFO`,
            category: rule.category,
            severity: "INFORMATIONAL",
            confidence: "High (90%)",
            name: `Technical Security Discussion (Benign: "${rule.name}")`,
            explanation: `Text mentions "${rule.name}" in the context of legitimate cybersecurity research or software development. Distinguished from malicious imperative overrides.`,
            impact: "None (benign academic or professional competency).",
            action: "Treat as verified cybersecurity qualification.",
            evidenceExcerpt: sentence.slice(0, 200),
            detectionMethod: "Contextual False-Positive Filter",
            section
          });
        } else {
          // Genuine suspicious injection attempt
          rawFindings.push({
            id: rule.id,
            category: rule.category,
            severity: rule.severity,
            confidence: rule.confidence,
            name: rule.name,
            explanation: rule.explanation,
            impact: rule.impact,
            action: rule.action,
            evidenceExcerpt: sentence.slice(0, 240),
            detectionMethod: "Deterministic Regex & Boundary Matcher",
            section
          });
        }
      }
    });
  });

  // 4. Deduplicate Findings (avoid counting identical sentences repeatedly)
  const uniqueFindingsMap = new Map();
  rawFindings.forEach(f => {
    const key = `${f.category}|${f.name}|${f.evidenceExcerpt.trim().toLowerCase().slice(0, 60)}`;
    if (!uniqueFindingsMap.has(key)) {
      uniqueFindingsMap.set(key, { ...f, duplicateCount: 1 });
    } else {
      uniqueFindingsMap.get(key).duplicateCount += 1;
    }
  });

  const uniqueFindings = Array.from(uniqueFindingsMap.values());

  // 5. Severity Distribution
  const severityDistribution = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0
  };

  uniqueFindings.forEach(f => {
    const s = f.severity.toLowerCase();
    if (severityDistribution[s] !== undefined) {
      severityDistribution[s]++;
    }
  });

  // 6. Compute Document-level Prompt Injection Risk Indicator (0 to 100)
  // Formula:
  // Baseline = highest finding severity weight
  // Additional = secondary findings scaled logarithmically
  let riskIndicator = 0;
  const nonInfoFindings = uniqueFindings.filter(f => f.severity !== "INFORMATIONAL");

  if (nonInfoFindings.length > 0) {
    // Find max severity weight
    const maxWeight = Math.max(...nonInfoFindings.map(f => SEVERITIES[f.severity]?.weight || 10));
    const countBonus = Math.min(25, (nonInfoFindings.length - 1) * 8);
    riskIndicator = Math.min(100, Math.round(maxWeight + countBonus));
  } else if (severityDistribution.informational > 0) {
    riskIndicator = 8; // Informational only: very low baseline
  }

  // Risk Classification Band
  let riskBand = "Low Risk / Likely Benign";
  let riskColor = "var(--emerald)";
  let finalRecommendation = "No suspicious instructions detected by current checks.";

  if (riskIndicator >= 75) {
    riskBand = "Severe Risk (Explicit Prompt Injection)";
    riskColor = "var(--rose)";
    finalRecommendation = "Security review strongly recommended. Document contains explicit instructions attempting to manipulate automated screening or breach system boundaries.";
  } else if (riskIndicator >= 45) {
    riskBand = "Elevated Risk (Suspicious Screening Manipulation)";
    riskColor = "#F97316";
    finalRecommendation = "Review highlighted text before relying on automated analysis. Suspicious candidate-ranking or instruction-override commands detected.";
  } else if (riskIndicator >= 16) {
    riskBand = "Moderate Risk (Unusual Patterns Detected)";
    riskColor = "var(--amber)";
    finalRecommendation = "Manual recruiter check recommended. Unusual phrasing or obfuscation markers found.";
  } else {
    riskBand = "Low Risk / Likely Benign";
    riskColor = "var(--emerald)";
    finalRecommendation = "No adversarial prompt injection directives detected. Standard candidate evaluation may proceed.";
  }

  // 7. Independently Extract Candidate Qualifications (Completely isolated from security findings)
  const qualificationProfile = extractProfileFromText(text, metadata.filename || "Scanned Resume");
  const qualificationSummary = {
    candidateName: qualificationProfile.name,
    email: qualificationProfile.email,
    phone: qualificationProfile.phone,
    educationLevel: qualificationProfile.educationLevel,
    estimatedExperience: qualificationProfile.estimatedExperience,
    extractedSkills: qualificationProfile.skills,
    categorizedSkills: qualificationProfile.categorizedSkills,
    profileCompleteness: qualificationProfile.completeness
  };

  // 8. Executive Summary Narrative
  let executiveSummary = "";
  if (nonInfoFindings.length === 0 && severityDistribution.informational === 0) {
    executiveSummary = "Clean candidate document. No prompt injection directives, hidden comments, or adversarial manipulation instructions were identified.";
  } else if (nonInfoFindings.length === 0 && severityDistribution.informational > 0) {
    executiveSummary = "Candidate discusses AI security or prompt injection in an authentic professional/research context. No malicious imperative instructions detected.";
  } else {
    executiveSummary = `Detected ${nonInfoFindings.length} distinct suspicious instruction pattern(s) across categories: ${Array.from(new Set(nonInfoFindings.map(f => f.category))).join(", ")}. Risk Indicator evaluated at ${riskIndicator}/100 (${riskBand}).`;
  }

  return {
    reportId,
    timestamp,
    engineVersion: ENGINE_VERSION,
    metadata: {
      candidateId: metadata.candidateId || null,
      filename: metadata.filename || "Uploaded Resume",
      fileSize: metadata.fileSize || text.length,
      scannedLength: text.length
    },
    hasSuspiciousContent: nonInfoFindings.length > 0,
    totalFindingsCount: uniqueFindings.length,
    activeThreatsCount: nonInfoFindings.length,
    riskIndicator,
    riskBand,
    riskColor,
    severityDistribution,
    findings: uniqueFindings,
    executiveSummary,
    finalRecommendation,
    candidateQualifications: qualificationSummary,
    disclaimer: "The Prompt Injection Risk Indicator is an algorithmic screening aid, not proof of candidate malice. Candidate professional qualifications are evaluated independently."
  };
}

module.exports = {
  ENGINE_VERSION,
  SEVERITIES,
  THREAT_CATEGORIES,
  isBenignTechnicalDiscussion,
  inspectUnicodeAndEncodingAnomalies,
  scanResumeForPromptInjection
};
