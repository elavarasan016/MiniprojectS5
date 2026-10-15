import { useState, useEffect } from 'react';
import { 
  Search, Sliders, CheckCircle, AlertCircle, HelpCircle, 
  Sparkles, Award, ArrowRight, UserCheck, Layers, ChevronDown, 
  ChevronUp, RotateCcw, Target, ShieldCheck, Zap, Info, Filter, Check
} from 'lucide-react';
import { performSearch } from '../services/api';

const SAMPLE_QUERIES = [
  { icon: '🐍', label: 'Python & ML', query: "Python developer with machine learning and SQL" },
  { icon: '⚛️', label: 'React & Node', query: "Full Stack React developer with Node.js and TypeScript" },
  { icon: '🤖', label: 'AI & NLP', query: "AI engineer with NLP and model deployment experience" },
  { icon: '☁️', label: 'Cloud & DevOps', query: "Cloud DevOps engineer with AWS, Kubernetes, and Terraform" },
  { icon: '📊', label: 'Data Analytics', query: "Data analyst with Python, Excel, and SQL" },
  { icon: '☕', label: 'Java Backend', query: "Java backend engineer with Spring Boot and Kafka" }
];

export default function SearchSimulatorView({ onSelectCandidate, onNavigateToFragility, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery || SAMPLE_QUERIES[0].query);
  const [mode, setMode] = useState('combined'); // 'combined' | 'keyword' | 'semantic' | 'boolean'
  
  // Scoring Weights (Module 5 configurable weights)
  const [weights, setWeights] = useState({ semantic: 0.50, keyword: 0.40, completeness: 0.10 });
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);

  // Filters
  const [minScore, setMinScore] = useState(0);
  const [educationFilter, setEducationFilter] = useState('all');
  const [minCompleteness, setMinCompleteness] = useState(0);

  // Results
  const [results, setResults] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [queryReqs, setQueryReqs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedExplanation, setExpandedExplanation] = useState({});

  useEffect(() => {
    handleSearch();
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await performSearch({
        query: query.trim(),
        mode,
        filters: {
          minScore: minScore > 0 ? minScore : undefined,
          education: educationFilter,
          minCompleteness: minCompleteness > 0 ? minCompleteness : undefined
        },
        weights
      });
      setResults(res.results || []);
      setTotalCandidates(res.totalCandidates || 0);
      setQueryReqs(res.queryRequirements);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleQueryPreset(q) {
    setQuery(q);
    setTimeout(() => {
      performSearch({
        query: q,
        mode,
        filters: {
          minScore: minScore > 0 ? minScore : undefined,
          education: educationFilter,
          minCompleteness: minCompleteness > 0 ? minCompleteness : undefined
        },
        weights
      }).then(res => {
        setResults(res.results || []);
        setTotalCandidates(res.totalCandidates || 0);
        setQueryReqs(res.queryRequirements);
      });
    }, 50);
  }

  function toggleExplanation(id) {
    setExpandedExplanation(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6
        }}>
          <Search size={14} />
          RECRUITER SEARCH SIMULATOR &amp; ATS RANKING ENGINE
        </div>
        <h2 style={{ fontSize: '1.85rem', color: '#F8FAFC', fontWeight: 800 }}>
          Recruiter Search &amp; Ranking Simulator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 800, marginTop: 4 }}>
          Simulate how recruiter search engines and ATS evaluate candidates. Test Combined AI + Keyword, Pure Boolean, or Vector Semantic modes with complete ranking transparency.
        </p>
      </div>

      {/* Main Search Control Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        
        {/* Search Input Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="var(--cyan)" style={{ position: 'absolute', left: 16, top: 16 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={mode === 'boolean' ? 'e.g. python AND (sql OR postgresql) NOT java' : 'Enter job requirements e.g. "Python developer with machine learning and SQL"'}
              className="input"
              style={{
                paddingLeft: 46,
                paddingRight: 16,
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 'var(--radius-full)',
                fontSize: '0.96rem',
                border: '1px solid var(--border-bright)'
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn btn-primary"
            style={{ padding: '0 28px', fontSize: '0.92rem' }}
            disabled={loading}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Searching...' : 'Simulate Search'}</span>
          </button>
        </div>

        {/* 1-Click Role Query Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            QUICK PRESETS:
          </span>
          {SAMPLE_QUERIES.map(item => (
            <button
              key={item.label}
              onClick={() => handleQueryPreset(item.query)}
              className={`query-chip ${query === item.query ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Search Mode Selector & Formula Drawer Toggle */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 14, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginRight: 4 }}>
              MODE:
            </span>
            {[
              { id: 'combined', label: 'Smart Combined (AI + Keyword)', hint: 'Balanced 50/40/10' },
              { id: 'keyword', label: 'Exact Keyword (BM25)', hint: 'Strict lexical overlap' },
              { id: 'semantic', label: 'Semantic Similarity', hint: 'TF-IDF vector cosine' },
              { id: 'boolean', label: 'Boolean Logic', hint: 'AND / OR / NOT' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setTimeout(handleSearch, 20);
                }}
                className={`btn btn-sm ${mode === m.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem' }}
                title={m.hint}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Config Scoring Weights Button */}
          <button
            onClick={() => setShowWeightsConfig(!showWeightsConfig)}
            className="btn btn-secondary btn-sm"
          >
            <Sliders size={13} />
            <span>Customize Weights</span>
            {showWeightsConfig ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Boolean Syntax Helper (When boolean mode is active) */}
        {mode === 'boolean' && (
          <div style={{
            marginTop: 14, padding: 14, borderRadius: 10,
            background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)',
            fontSize: '0.82rem', color: 'var(--text-secondary)'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>Boolean Syntax Guide: </span>
            Use uppercase <code>AND</code>, <code>OR</code>, and <code>NOT</code> with optional parentheses. 
            Example: <code>python AND (sql OR postgresql) NOT java</code>. Candidates matching the full Boolean truth condition will qualify.
          </div>
        )}

        {/* Configurable Formula Sliders Drawer */}
        {showWeightsConfig && (
          <div style={{
            marginTop: 16, padding: 18, borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F8FAFC' }}>
                Adjust Ranking Formula Weights (Sum: 1.0)
              </span>
              <button
                onClick={() => {
                  setWeights({ semantic: 0.50, keyword: 0.40, completeness: 0.10 });
                  setTimeout(handleSearch, 20);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={12} />
                <span>Reset to Standard (0.50 / 0.40 / 0.10)</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
              {/* Semantic Weight Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Semantic Vector Weight</span>
                  <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>{weights.semantic.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.semantic}
                  onChange={(e) => setWeights({ ...weights, semantic: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--cyan)' }}
                />
              </div>

              {/* Keyword Weight Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Keyword Overlap Weight</span>
                  <span style={{ fontWeight: 700, color: 'var(--indigo-light)' }}>{weights.keyword.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.keyword}
                  onChange={(e) => setWeights({ ...weights, keyword: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--indigo)' }}
                />
              </div>

              {/* Completeness Weight Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Profile Completeness Weight</span>
                  <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>{weights.completeness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.completeness}
                  onChange={(e) => setWeights({ ...weights, completeness: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--emerald)' }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <button 
                onClick={handleSearch}
                className="btn btn-secondary btn-sm"
              >
                Apply Custom Weights &amp; Re-score
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Query Requirements Banner */}
      {queryReqs && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 24, fontSize: '0.82rem'
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Detected Search Criteria:</span>
          {queryReqs.skills.map(s => (
            <span key={s} className="badge badge-indigo">
              {s}
            </span>
          ))}
          {queryReqs.generalKeywords.map(k => (
            <span key={k} className="badge badge-muted">
              &quot;{k}&quot;
            </span>
          ))}
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC' }}>
            Simulated Candidate Rankings ({results.length} of {totalCandidates} matched)
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            Evaluated via {mode} mode
          </span>
        </div>

        <button
          onClick={() => onNavigateToFragility && onNavigateToFragility([query])}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'rgba(236, 72, 153, 0.35)', color: '#F472B6' }}
        >
          <Layers size={13} color="var(--pink)" />
          <span>Test This Query in Fragility Studio</span>
        </button>
      </div>

      {/* Results List */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Calculating rank vectors, keyword density, and semantic embeddings...
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--amber)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#F8FAFC', marginBottom: 6 }}>No Candidates Match This Query</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 460, margin: '0 auto 18px' }}>
            No candidate profiles satisfy the requirements for &quot;{query}&quot; under {mode} search. Try using Smart Combined mode or removing restrictive filters.
          </p>
          <button 
            onClick={() => { setMode('combined'); handleSearch(); }}
            className="btn btn-primary"
          >
            Switch to Smart Combined Mode
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results.map((res, index) => {
            const cand = res.candidate;
            const isExpanded = expandedExplanation[cand.id];
            const rankMedal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

            return (
              <div 
                key={cand.id}
                className="card"
                style={{
                  padding: 22,
                  border: index === 0 ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid var(--border)',
                  background: index === 0 ? 'linear-gradient(135deg, rgba(17, 24, 43, 0.95) 0%, rgba(6, 182, 212, 0.05) 100%)' : 'var(--bg-card)'
                }}
              >
                {/* Main Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  
                  {/* Candidate Identity */}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {/* Rank Badge */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: index === 0 
                        ? 'linear-gradient(135deg, #06B6D4, #6366F1)' 
                        : index < 3 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${index === 0 ? 'var(--cyan)' : 'var(--border)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: index === 0 ? '#0B0F19' : 'var(--text-muted)' }}>RANK</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: index === 0 ? '#0B0F19' : '#F8FAFC', marginTop: -2 }}>
                        #{res.rank}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', fontWeight: 800 }}>
                          {cand.name}
                        </h3>
                        {rankMedal && <span style={{ fontSize: '1.1rem' }}>{rankMedal}</span>}
                        {index === 0 && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                            TOP RANKED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {cand.educationLevel} &bull; {cand.estimatedExperience} &bull; {cand.filename}
                      </div>
                    </div>
                  </div>

                  {/* Component Score Pills */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Overall Score */}
                    <div style={{
                      textAlign: 'center', padding: '8px 16px', borderRadius: 10,
                      background: res.overallScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : res.overallScore >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      border: `1px solid ${res.overallScore >= 80 ? 'rgba(16, 185, 129, 0.4)' : res.overallScore >= 60 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`
                    }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>OVERALL MATCH</div>
                      <div style={{
                        fontSize: '1.45rem', fontWeight: 800,
                        color: res.overallScore >= 80 ? 'var(--emerald)' : res.overallScore >= 60 ? 'var(--amber)' : 'var(--rose)'
                      }}>
                        {res.overallScore}%
                      </div>
                    </div>

                    {/* Breakdown Mini Bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.74rem', minWidth: 140 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Keyword ({weights.keyword * 100}%):</span>
                        <span style={{ fontWeight: 700, color: 'var(--indigo-light)' }}>{res.keywordScore}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                        <div style={{ width: `${res.keywordScore}%`, height: '100%', background: 'var(--indigo)', borderRadius: 2 }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: 2 }}>
                        <span>Semantic ({weights.semantic * 100}%):</span>
                        <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>{res.semanticScore}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                        <div style={{ width: `${res.semanticScore}%`, height: '100%', background: 'var(--cyan)', borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Analysis Badges: Matched, Weak, Missing */}
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem' }}>
                  {/* Matched skills */}
                  {res.matchedSkills && res.matchedSkills.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>Matched:</span>
                      {res.matchedSkills.map(m => (
                        <span key={m} className="badge badge-green">
                          ✓ {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Weak skills */}
                  {res.weaklyRepresentedTerms && res.weaklyRepresentedTerms.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--amber)', fontWeight: 700 }}>Weak in Profile:</span>
                      {res.weaklyRepresentedTerms.map(w => (
                        <span key={w} className="badge badge-amber">
                          ⚠ {w}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Missing requirements */}
                  {res.missingTerms && res.missingTerms.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--rose)', fontWeight: 700 }}>Missing:</span>
                      {res.missingTerms.map(m => (
                        <span key={m} className="badge badge-rose">
                          ✕ {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explanation Drawer & Action Buttons */}
                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
                }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, maxWidth: 650 }}>
                    <ShieldCheck size={15} color="var(--cyan)" style={{ flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {res.explanation}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => toggleExplanation(cand.id)}
                      className="btn btn-ghost btn-sm"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Why Ranked Here'}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <button
                      onClick={() => onSelectCandidate && onSelectCandidate(cand.id, query)}
                      className="btn btn-primary btn-sm"
                    >
                      <Target size={13} />
                      <span>Audit Skill Gaps</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Explanation Expansion */}
                {isExpanded && (
                  <div className="anim-fade" style={{
                    marginTop: 14, padding: 16, borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
                    fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6
                  }}>
                    <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                      Transparent Deterministic Scoring Breakdown:
                    </div>
                    {res.explanation}
                    <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Formula Applied: Final Score = ({weights.semantic} &times; {res.semanticScore}%) + ({weights.keyword} &times; {res.keywordScore}%) + ({weights.completeness} &times; {res.completenessScore}%) = <strong style={{ color: '#F8FAFC' }}>{res.overallScore}%</strong>.
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
