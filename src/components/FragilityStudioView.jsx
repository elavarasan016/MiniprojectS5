import { useState, useEffect } from 'react';
import { 
  Layers, Sparkles, TrendingDown, TrendingUp, AlertTriangle, 
  CheckCircle, ArrowRight, Plus, Trash2, RotateCcw, Info, 
  HelpCircle, BarChart2, ShieldCheck, Target, Award, Compass
} from 'lucide-react';
import { performFragilityAnalysis } from '../services/api';

const DEFAULT_PRESETS = [
  {
    icon: '🤖',
    name: "AI & Machine Learning Synonyms",
    queries: [
      "Python Machine Learning Engineer",
      "ML Developer with Scikit-Learn and PyTorch",
      "AI Engineer with NLP and Model Deployment",
      "Predictive Analytics Developer with SQL"
    ]
  },
  {
    icon: '🌐',
    name: "Full Stack & Web Synonyms",
    queries: [
      "Full Stack Developer React Node.js",
      "TypeScript Frontend Engineer with Next.js",
      "Backend Engineer Express PostgreSQL REST APIs",
      "JavaScript Software Engineer with MongoDB"
    ]
  },
  {
    icon: '☁️',
    name: "Cloud & DevOps Synonyms",
    queries: [
      "DevOps Engineer AWS Kubernetes",
      "Site Reliability Engineer (SRE) Linux Terraform",
      "Cloud Infrastructure Engineer Docker CI/CD",
      "Systems Automation Engineer with Python Bash"
    ]
  },
  {
    icon: '📊',
    name: "Data Analytics Synonyms",
    queries: [
      "Data Analyst SQL Python Excel",
      "Business Intelligence Specialist Power BI Tableau",
      "Data Insights Engineer PostgreSQL Reporting",
      "Quantitative Data Specialist Pandas NumPy"
    ]
  }
];

export default function FragilityStudioView({ onSelectCandidate, initialQueries = [] }) {
  const [queries, setQueries] = useState(
    initialQueries.length >= 2 ? initialQueries : DEFAULT_PRESETS[0].queries
  );
  const [newQueryInput, setNewQueryInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fragilityData, setFragilityData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);

  useEffect(() => {
    runAnalysis(queries);
  }, []);

  async function runAnalysis(queryList) {
    if (!queryList || queryList.length < 2) return;
    try {
      setLoading(true);
      setError(null);
      const res = await performFragilityAnalysis({ queries: queryList });
      setFragilityData(res);
      if (res.results?.length > 0) {
        setSelectedCandidateDetail(res.results[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPreset(preset) {
    setQueries([...preset.queries]);
    runAnalysis(preset.queries);
  }

  function handleAddQuery() {
    if (!newQueryInput.trim()) return;
    const updated = [...queries, newQueryInput.trim()];
    setQueries(updated);
    setNewQueryInput('');
    runAnalysis(updated);
  }

  function handleRemoveQuery(index) {
    if (queries.length <= 2) {
      alert("A minimum of 2 queries is required to calculate comparative search fragility.");
      return;
    }
    const updated = queries.filter((_, i) => i !== index);
    setQueries(updated);
    runAnalysis(updated);
  }

  function handleQueryChange(index, value) {
    const updated = [...queries];
    updated[index] = value;
    setQueries(updated);
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#F472B6', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6
        }}>
          <Layers size={14} />
          SEARCH QUERY FRAGILITY STUDIO &amp; RANKING VOLATILITY
        </div>
        <h2 style={{ fontSize: '1.85rem', color: '#F8FAFC', fontWeight: 800 }}>
          Search Fragility Studio
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 840, lineHeight: 1.6, marginTop: 4 }}>
          Recruiters often phrase identical hiring needs with different terms (e.g. &quot;ML Engineer&quot; vs &quot;AI Developer&quot;). 
          This studio tests candidate rank stability across synonymous queries, revealing which profiles hold steady and which drop out.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            TEST BUNDLES:
          </span>
          {DEFAULT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className="query-chip"
              style={{ fontSize: '0.78rem' }}
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Variants Editor Card */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', fontWeight: 700 }}>
              Query Variant Suite ({queries.length} Synonymous Queries)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Add, edit, or remove queries to test rank variance across candidate profiles.
            </p>
          </div>
          <button
            onClick={() => runAnalysis(queries)}
            className="btn btn-primary"
            disabled={loading}
          >
            <Sparkles size={15} />
            <span>{loading ? 'Evaluating Fragility...' : 'Execute Fragility Suite'}</span>
          </button>
        </div>

        {/* Queries List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 14 }}>
          {queries.map((q, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '8px 12px'
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6, background: 'rgba(99, 102, 241, 0.25)',
                color: 'var(--cyan)', fontSize: '0.72rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                Q{idx + 1}
              </span>
              <input
                type="text"
                value={q}
                onChange={(e) => handleQueryChange(idx, e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none', color: '#F8FAFC',
                  fontSize: '0.86rem', outline: 'none', fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => handleRemoveQuery(idx)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                title="Remove query"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom query input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Add another query variant e.g. 'Deep Learning Engineer with PyTorch'..."
            value={newQueryInput}
            onChange={(e) => setNewQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuery()}
            className="input"
            style={{ borderRadius: 'var(--radius-full)' }}
          />
          <button
            onClick={handleAddQuery}
            className="btn btn-secondary"
          >
            <Plus size={15} />
            <span>Add Query</span>
          </button>
        </div>
      </div>

      {/* Fragility Metric Interpretation Guide */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14,
        marginBottom: 28
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 12, padding: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, color: '#6EE7B7', fontSize: '0.85rem', marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
            Stable Visibility (0–30)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Candidate consistently ranks in top results regardless of recruiter phrasing. High resilience.
          </p>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 12, padding: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, color: '#FDE68A', fontSize: '0.85rem', marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
            Moderate Variation (31–60)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Visibility fluctuates based on subtle wording shifts. Rank drops moderately (±2–4 spots) when terms change.
          </p>
        </div>

        <div style={{
          background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 12, padding: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, color: '#FECDD3', fontSize: '0.85rem', marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)' }} />
            High Search Fragility (61–100)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Severe ranking volatility. Candidate drops 5+ positions or completely disappears from recruiter search results.
          </p>
        </div>
      </div>

      {/* Main Fragility Results Matrix */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Computing cross-query rank variance and missing query penalties...
          </p>
        </div>
      ) : !fragilityData || fragilityData.results.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <AlertTriangle size={36} color="var(--amber)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#F8FAFC', marginBottom: 6 }}>No Fragility Data Available</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Ensure candidate resumes are loaded and at least 2 queries are defined in the suite.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Comparison Table */}
          <div className="card" style={{ padding: 22, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', fontWeight: 700 }}>
                  Cross-Query Candidate Fragility Matrix
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click any row to inspect deep-dive diagnostics
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Candidate</th>
                  <th style={{ padding: '12px' }}>Fragility Score</th>
                  <th style={{ padding: '12px' }}>Stability Band</th>
                  <th style={{ padding: '12px' }}>Rank Movement</th>
                  {queries.map((q, i) => (
                    <th key={i} style={{ padding: '12px', minWidth: 100 }}>
                      <span title={q} style={{ color: 'var(--cyan)' }}>Q{i + 1} Rank</span>
                    </th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fragilityData.results.map((item) => {
                  const isSelected = selectedCandidateDetail?.candidate.id === item.candidate.id;
                  return (
                    <tr
                      key={item.candidate.id}
                      onClick={() => setSelectedCandidateDetail(item)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#F8FAFC' }}>
                        {item.candidate.name}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          avg score {item.avgScore}%
                        </div>
                      </td>

                      {/* Fragility Score Badge */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontWeight: 800, fontSize: '1rem', color: item.stabilityColor
                        }}>
                          {item.fragilityScore}
                          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
                        </div>
                      </td>

                      {/* Band */}
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: 700,
                          background: item.fragilityScore <= 30 ? 'rgba(16, 185, 129, 0.15)' : item.fragilityScore <= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: item.stabilityColor,
                          border: `1px solid ${item.fragilityScore <= 30 ? 'rgba(16, 185, 129, 0.35)' : item.fragilityScore <= 60 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`
                        }}>
                          {item.stabilityBand}
                        </span>
                      </td>

                      {/* Rank Movement */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                          {item.rankDelta === 0 ? (
                            <span style={{ color: 'var(--emerald)' }}>0 (Rock Solid)</span>
                          ) : (
                            <span style={{ color: item.rankDelta > 3 ? 'var(--rose)' : 'var(--amber)' }}>
                              &plusmn;{item.rankDelta} pos
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          best #{item.bestRank} &bull; worst #{item.worstRank}
                        </div>
                      </td>

                      {/* Query Ranks */}
                      {item.queryBreakdown.map((qb, i) => (
                        <td key={i} style={{ padding: '14px 12px' }}>
                          <div style={{ fontWeight: 800, color: qb.rank <= 2 ? 'var(--emerald)' : qb.rank <= 4 ? '#F8FAFC' : 'var(--rose)' }}>
                            #{qb.rank}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {qb.score}%
                          </div>
                        </td>
                      ))}

                      {/* Actions */}
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCandidate && onSelectCandidate(item.candidate.id, queries[0]);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '0.74rem' }}
                        >
                          Audit Gaps
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Deep-Dive Inspector for Selected Candidate */}
          {selectedCandidateDetail && (
            <div className="card" style={{ padding: 26, border: '1px solid var(--border-bright)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pink)', fontWeight: 700, marginBottom: 2 }}>
                    DEEP-DIVE FRAGILITY DIAGNOSTIC
                  </div>
                  <h3 style={{ fontSize: '1.35rem', color: '#F8FAFC', fontWeight: 800 }}>
                    {selectedCandidateDetail.candidate.name} — Fragility Audit
                  </h3>
                </div>
                <div style={{
                  background: selectedCandidateDetail.stabilityColor, color: '#0B0F19',
                  padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.88rem'
                }}>
                  Fragility Index: {selectedCandidateDetail.fragilityScore}
                </div>
              </div>

              {/* Rationale Narrative */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 16, marginBottom: 20, fontSize: '0.86rem', lineHeight: 1.6,
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontWeight: 700, color: '#F8FAFC' }}>Ranking Driver Analysis: </span>
                {selectedCandidateDetail.detailedReason}
              </div>

              {/* Visual Rank Progression Grid */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  RANKING &amp; SCORE PROGRESSION ACROSS QUERIES:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {selectedCandidateDetail.queryBreakdown.map((qb, i) => (
                    <div key={i} style={{
                      background: 'rgba(15, 22, 41, 0.75)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 14
                    }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--cyan)', fontWeight: 800, marginBottom: 4 }}>
                        QUERY {i + 1}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#F8FAFC', fontWeight: 600, marginBottom: 10, minHeight: 38 }}>
                        &quot;{qb.query}&quot;
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Rank: </span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: qb.rank <= 2 ? 'var(--emerald)' : '#F8FAFC' }}>
                            #{qb.rank}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Score: </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan)' }}>
                            {qb.score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => onSelectCandidate && onSelectCandidate(selectedCandidateDetail.candidate.id, queries[0])}
                  className="btn btn-primary"
                >
                  <Target size={15} />
                  <span>Test Counterfactual Improvements for this Candidate</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
