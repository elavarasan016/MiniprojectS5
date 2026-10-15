import { useState, useEffect } from 'react';
import { 
  Target, Sparkles, CheckCircle, AlertTriangle, AlertCircle, 
  ArrowRight, ShieldCheck, Play, RotateCcw, TrendingUp, 
  FileText, HelpCircle, Lock, BookOpen, User, Check
} from 'lucide-react';
import { 
  fetchCandidates, performGapAnalysis, simulateCounterfactual 
} from '../services/api';

export default function KeywordEngineView({ 
  initialCandidateId = null, 
  initialQuery = 'Python developer with machine learning and SQL',
  onNavigateToReport 
}) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidateId);
  const [query, setQuery] = useState(initialQuery);

  // Gap Analysis Data
  const [gapData, setGapData] = useState(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [gapError, setGapError] = useState(null);

  // Counterfactual Simulation State
  const [selectedTermToSimulate, setSelectedTermToSimulate] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState(null);

  useEffect(() => {
    loadCandidateList();
  }, []);

  async function loadCandidateList() {
    try {
      const res = await fetchCandidates();
      const list = res.candidates || [];
      setCandidates(list);
      if (list.length > 0) {
        const idToSelect = initialCandidateId && list.some(c => c.id === initialCandidateId)
          ? initialCandidateId
          : list[0].id;
        setSelectedCandidateId(idToSelect);
        runGapAnalysis(idToSelect, query);
      }
    } catch (err) {
      setGapError(err.message);
    }
  }

  async function runGapAnalysis(candId, q) {
    if (!candId || !q.trim()) return;
    try {
      setLoadingGap(true);
      setGapError(null);
      setSimulationResult(null);
      setSelectedTermToSimulate(null);
      const res = await performGapAnalysis({ candidateId: candId, query: q.trim() });
      setGapData(res);
      // Pre-select first supported recommendation if available
      const firstSupported = (res.recommendations || []).find(r => r.classification === 'supported');
      if (firstSupported) {
        setSelectedTermToSimulate(firstSupported);
      }
    } catch (err) {
      setGapError(err.message);
    } finally {
      setLoadingGap(false);
    }
  }

  async function handleSimulate() {
    if (!selectedCandidateId || !query.trim() || !selectedTermToSimulate) return;
    try {
      setSimulating(true);
      setSimError(null);
      const res = await simulateCounterfactual({
        candidateId: selectedCandidateId,
        query: query.trim(),
        proposedChange: {
          term: selectedTermToSimulate.term,
          classification: selectedTermToSimulate.classification,
          type: selectedTermToSimulate.type
        }
      });
      setSimulationResult(res);
    } catch (err) {
      setSimError(err.message);
    } finally {
      setSimulating(false);
    }
  }

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
  const candidateInitials = (selectedCandidate?.name || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6
        }}>
          <Target size={14} />
          EVIDENCE-BASED KEYWORD AUDIT &amp; COUNTERFACTUAL SIMULATOR
        </div>
        <h2 style={{ fontSize: '1.85rem', color: '#F8FAFC', fontWeight: 800 }}>
          Profile Keyword Engine &amp; Visibility Simulator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 840, lineHeight: 1.6, marginTop: 4 }}>
          Audit keyword gaps against target recruiter requirements with strict Truth Lock evidence citations. 
          Test &quot;what-if&quot; counterfactual skill promotions in-memory without hallucinating unverified qualifications.
        </p>
      </div>

      {/* Target Selector Card */}
      <div className="card" style={{ padding: 22, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'center' }}>
          
          {/* Candidate Selector */}
          <div>
            <label>Target Candidate Profile</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cand-avatar" style={{ width: 40, height: 40, fontSize: '0.92rem' }}>
                {candidateInitials}
              </div>
              <select
                value={selectedCandidateId || ''}
                onChange={(e) => {
                  setSelectedCandidateId(e.target.value);
                  runGapAnalysis(e.target.value, query);
                }}
                className="select"
                style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.filename})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recruiter Query Input */}
          <div>
            <label>Target Recruiter Search Query</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runGapAnalysis(selectedCandidateId, query)}
                placeholder="Enter search query..."
                className="input"
                style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
              />
              <button
                onClick={() => runGapAnalysis(selectedCandidateId, query)}
                className="btn btn-primary"
                disabled={loadingGap}
              >
                {loadingGap ? 'Auditing...' : 'Analyze'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Gap Analysis (Left) & Counterfactual Simulator (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 32 }}>
        
        {/* Module 7: Keyword Gap Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', fontWeight: 800 }}>
                Evidence-Based Keyword Gap Audit
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Profile: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{selectedCandidate?.name}</span> &bull; Query: &quot;{query}&quot;
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={14} />
              <span>Truth Lock™ Active</span>
            </div>
          </div>

          {loadingGap ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 14px auto' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                Auditing candidate resume sentences against query requirements...
              </p>
            </div>
          ) : !gapData ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a candidate profile and query to begin analysis.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* Matched Terms */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6EE7B7', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={15} />
                  <span>MATCHED REQUIREMENTS ({gapData.matchedCount})</span>
                </div>
                {gapData.matched.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No direct keyword matches found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gapData.matched.map((m, i) => (
                      <div key={i} style={{
                        background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
                      }}>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>✓ {m.term}</span>
                          <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>EVIDENCE VERIFIED</span>
                        </div>
                        {m.evidence && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 5, fontStyle: 'italic', lineHeight: 1.4 }}>
                            &quot;{m.evidence}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weakly Represented Terms */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FDE68A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} />
                  <span>WEAKLY REPRESENTED / PROMOTABLE ({gapData.weakCount})</span>
                </div>
                {gapData.weak.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No ambiguous or buried skills detected.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gapData.weak.map((w, i) => (
                      <div key={i} style={{
                        background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
                      }}>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>⚠ {w.term}</span>
                          <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>EVIDENCE DETECTED</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.4 }}>
                          Found in resume text but omitted from primary skill headers: &quot;{w.evidence}&quot;
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Requirements */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FECDD3', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={15} />
                  <span>MISSING REQUIREMENTS ({gapData.missingCount})</span>
                </div>
                {gapData.missing.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All query requirements are accounted for.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {gapData.missing.map((m, i) => (
                      <span key={i} className="badge badge-rose">
                        ✕ {m.term}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Module 8: Counterfactual Visibility Simulator */}
        <div className="card" style={{ padding: 24, border: '1px solid var(--border-bright)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', fontWeight: 800 }}>
                Counterfactual Visibility Simulator
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                &quot;What if this verified skill were explicitly promoted?&quot;
              </p>
            </div>
            <Sparkles size={18} color="var(--cyan)" />
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 10, padding: 14, marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-secondary)'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>Simulation Safety Rule: </span>
            Anti-hallucination guardrails prevent fabricating claims. Simulations are restricted to terms supported by verified resume text evidence.
          </div>

          {/* Selectable Proposed Changes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ marginBottom: 10 }}>Select Proposed Skill to Simulate</label>

            {!gapData || !gapData.recommendations || gapData.recommendations.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: 14, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                No candidate recommendations available for this query.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {gapData.recommendations.map((rec, i) => {
                  const isSelected = selectedTermToSimulate?.term === rec.term;
                  const isBlocked = rec.classification === 'unsupported';

                  return (
                    <div
                      key={i}
                      onClick={() => !isBlocked && setSelectedTermToSimulate(rec)}
                      style={{
                        padding: 14, borderRadius: 10,
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isSelected ? 'var(--cyan)' : isBlocked ? 'rgba(244, 63, 94, 0.3)' : 'var(--border)'}`,
                        cursor: isBlocked ? 'not-allowed' : 'pointer',
                        opacity: isBlocked ? 0.6 : 1,
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.9rem' }}>
                          {rec.title}
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)',
                          background: rec.classification === 'supported' ? 'rgba(16, 185, 129, 0.15)' : rec.classification === 'requires_confirmation' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: rec.classification === 'supported' ? '#6EE7B7' : rec.classification === 'requires_confirmation' ? '#FDE68A' : '#FECDD3'
                        }}>
                          {rec.classification === 'supported' ? '✓ EVIDENCE SUPPORTED' : rec.classification === 'requires_confirmation' ? 'CONFIRMATION NEEDED' : 'BLOCKED (NO EVIDENCE)'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {rec.description}
                      </p>
                      {rec.evidenceFound && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 5, fontStyle: 'italic' }}>
                          Evidence: &quot;{rec.evidenceFound}&quot;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Simulation Run Button */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={handleSimulate}
              className="btn btn-primary"
              disabled={simulating || !selectedTermToSimulate || selectedTermToSimulate.classification === 'unsupported'}
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '0.92rem' }}
            >
              <Play size={16} />
              <span>{simulating ? 'Computing Counterfactual Rankings...' : `Simulate Impact of Adding "${selectedTermToSimulate?.term || ''}"`}</span>
            </button>
          </div>

          {/* Simulation Results Display */}
          {simError && (
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', color: 'var(--rose)', fontSize: '0.84rem', marginBottom: 16 }}>
              {simError}
            </div>
          )}

          {simulationResult && (
            <div className="anim-fade" style={{
              background: 'rgba(15, 22, 41, 0.95)', border: '1px solid var(--border-bright)',
              borderRadius: 12, padding: 18
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--cyan)' }}>
                  COUNTERFACTUAL SIMULATION OUTCOME
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  IN-MEMORY ONLY (ZERO MODIFICATION)
                </span>
              </div>

              {/* Comparison Scoreboard */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 14 }}>
                {/* Original */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BASELINE (ORIGINAL)</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC' }}>
                      #{simulationResult.original.rank}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Score: {simulationResult.original.overallScore}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Kw: {simulationResult.original.keywordScore}% &bull; Sem: {simulationResult.original.semanticScore}%
                  </div>
                </div>

                {/* Simulated */}
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)', padding: 12, borderRadius: 8,
                  border: '1px solid rgba(6, 182, 212, 0.35)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 700 }}>COUNTERFACTUAL (SIMULATED)</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)' }}>
                      #{simulationResult.simulated.rank}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--emerald)', fontWeight: 700 }}>
                      Score: {simulationResult.simulated.overallScore}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Kw: {simulationResult.simulated.keywordScore}% &bull; Sem: {simulationResult.simulated.semanticScore}%
                  </div>
                </div>
              </div>

              {/* Delta Banner */}
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 12,
                background: simulationResult.deltas.rankImproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${simulationResult.deltas.rankImproved ? 'rgba(16, 185, 129, 0.35)' : 'var(--border)'}`,
                display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem'
              }}>
                <span style={{ fontWeight: 700, color: simulationResult.deltas.rankImproved ? 'var(--emerald)' : 'var(--text-secondary)' }}>
                  {simulationResult.deltas.rankImproved 
                    ? `▲ Rank Improved by +${simulationResult.deltas.rankDelta} Position(s)!`
                    : 'Rank Unchanged (Score increased by +' + simulationResult.deltas.scoreDelta + '%)'}
                </span>
                <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>
                  +{simulationResult.deltas.scoreDelta}% Match Score
                </span>
              </div>

              {/* Explanation */}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {simulationResult.explanation}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Action Footer */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          onClick={() => onNavigateToReport && onNavigateToReport(selectedCandidateId)}
          className="btn btn-secondary"
          style={{ padding: '10px 24px', fontSize: '0.88rem' }}
        >
          <FileText size={16} />
          <span>Generate Full Profile Visibility Audit Report</span>
        </button>
      </div>

    </div>
  );
}
