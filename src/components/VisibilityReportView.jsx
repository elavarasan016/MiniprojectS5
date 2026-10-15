import { useState, useEffect } from 'react';
import { 
  FileText, Award, CheckCircle, AlertTriangle, Printer, 
  Download, ArrowRight, ShieldCheck, UserCheck, Layers, 
  Target, Sparkles, GraduationCap, Briefcase, Mail, Phone,
  ChevronDown
} from 'lucide-react';
import { fetchCandidates, fetchCandidateReport } from '../services/api';

export default function VisibilityReportView({ initialCandidateId = null }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidateId);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    try {
      const res = await fetchCandidates();
      const list = res.candidates || [];
      setCandidates(list);
      if (list.length > 0) {
        const id = initialCandidateId && list.some(c => c.id === initialCandidateId)
          ? initialCandidateId
          : list[0].id;
        setSelectedCandidateId(id);
        loadReport(id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadReport(candId) {
    if (!candId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCandidateReport(candId);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadJSON() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.candidate.name.replace(/\s+/g, '_')}_Visibility_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Top Header & Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6
          }}>
            <FileText size={14} />
            CANDIDATE PROFILE VISIBILITY REPORT
          </div>
          <h2 style={{ fontSize: '1.85rem', color: '#F8FAFC', fontWeight: 800 }}>
            Candidate Visibility &amp; Suitability Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 3 }}>
            Comprehensive search audit, archetype benchmarking, and evidence-backed optimization roadmap.
          </p>
        </div>

        {/* Actions & Candidate Switcher */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedCandidateId || ''}
            onChange={(e) => {
              setSelectedCandidateId(e.target.value);
              loadReport(e.target.value);
            }}
            className="select"
            style={{ width: 'auto', minWidth: 200, borderRadius: 'var(--radius-full)' }}
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            title="Print or Save as PDF"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="btn btn-secondary btn-sm"
            title="Export full structured report JSON"
          >
            <Download size={13} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generating multi-dimensional candidate visibility report...
          </p>
        </div>
      ) : error || !report ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <AlertTriangle size={36} color="var(--rose)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#F8FAFC', marginBottom: 6 }}>Report Could Not Be Generated</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{error || 'Unknown error occurred.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="printable-report">
          
          {/* Candidate Profile Summary Header Card */}
          <div className="card" style={{
            padding: 28,
            background: 'linear-gradient(135deg, rgba(15, 22, 41, 0.95) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid var(--border-bright)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', fontWeight: 800 }}>
                    {report.candidate.name}
                  </h1>
                  <span className="badge badge-cyan" style={{ fontSize: '0.78rem', padding: '4px 12px' }}>
                    Primary Fit: {report.primarySpecialization} ({report.primaryFitScore}%)
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {report.candidate.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} color="var(--cyan)" />
                      <span>{report.candidate.email}</span>
                    </div>
                  )}
                  {report.candidate.educationLevel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <GraduationCap size={14} color="var(--indigo)" />
                      <span>{report.candidate.educationLevel}</span>
                    </div>
                  )}
                  {report.candidate.estimatedExperience && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={14} color="var(--pink)" />
                      <span>{report.candidate.estimatedExperience}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Completeness Index */}
              <div style={{
                textAlign: 'right', background: 'rgba(255, 255, 255, 0.04)',
                padding: '14px 22px', borderRadius: 12, border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROFILE COMPLETENESS</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--emerald)', marginTop: 2 }}>
                  {report.candidate.completeness}%
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {report.candidate.totalSkillsCount} verified skills indexed
                </div>
              </div>
            </div>
          </div>

          {/* Archetype Suitability Benchmark Grid */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', fontWeight: 800 }}>
                  Role Suitability Benchmarking (6 Industry Archetypes)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Evaluates candidate percentile rank against candidate pool requirements
                </p>
              </div>
              <Award size={20} color="var(--cyan)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {report.archetypeSuitability.map((arch, i) => (
                <div key={i} style={{
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.92rem' }}>
                      {arch.role}
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)',
                      background: arch.score >= 75 ? 'rgba(16, 185, 129, 0.15)' : arch.score >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      color: arch.score >= 75 ? '#6EE7B7' : arch.score >= 50 ? '#FDE68A' : 'var(--text-muted)'
                    }}>
                      {arch.suitabilityBand}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--cyan)' }}>
                      {arch.score}%
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Rank #{arch.rank} (Top {arch.percentile}%)
                    </div>
                  </div>

                  <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${arch.score}%`, height: '100%',
                      background: arch.score >= 75 ? 'var(--emerald)' : arch.score >= 50 ? 'var(--cyan)' : 'var(--text-muted)',
                      borderRadius: 3
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Fragility Profile & Completeness Audit */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
            
            {/* Search Fragility Profile */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', fontWeight: 800 }}>
                  Search Fragility Profile
                </h3>
                <Layers size={18} color="var(--pink)" />
              </div>

              {report.fragilityProfile ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pink)' }}>
                        {report.fragilityProfile.fragilityScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Band: <strong style={{ color: '#F8FAFC' }}>{report.fragilityProfile.stabilityBand}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Rank range: #{report.fragilityProfile.bestRank} – #{report.fragilityProfile.worstRank}
                      <div style={{ color: 'var(--amber)', fontWeight: 700 }}>
                        &plusmn;{report.fragilityProfile.rankDelta} pos volatility
                      </div>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55,
                    background: 'rgba(255, 255, 255, 0.03)', padding: 14, borderRadius: 8, border: '1px solid var(--border)'
                  }}>
                    {report.fragilityProfile.explanation}
                  </p>
                </div>
              ) : (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Fragility index computed across synonymous job titles.
                </div>
              )}
            </div>

            {/* Profile Integrity Audit */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', fontWeight: 800 }}>
                  Profile Completeness &amp; Truth Lock Audit
                </h3>
                <ShieldCheck size={18} color="var(--emerald)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.completenessAudit?.breakdown.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)', fontSize: '0.84rem'
                  }}>
                    <span style={{ color: item.satisfied ? '#F8FAFC' : 'var(--text-muted)', fontWeight: item.satisfied ? 600 : 400 }}>
                      {item.satisfied ? '✓' : '✕'} {item.item}
                    </span>
                    <span style={{
                      fontSize: '0.74rem', fontWeight: 700,
                      color: item.satisfied ? 'var(--emerald)' : 'var(--rose)'
                    }}>
                      {item.satisfied ? `+${item.weight} pts` : 'Missing (0)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Evidence-Backed Improvement Roadmap */}
          <div className="card" style={{ padding: 24, border: '1px solid var(--border-bright)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', fontWeight: 800 }}>
                  Evidence-Backed Visibility Optimization Roadmap
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Actionable suggestions strictly grounded in verified resume text evidence
                </p>
              </div>
              <Target size={20} color="var(--cyan)" />
            </div>

            {report.keywordGapAnalysis?.recommendations.length === 0 ? (
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', padding: 18, textAlign: 'center' }}>
                Profile exhibits high alignment with primary archetype requirements.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {report.keywordGapAnalysis?.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.92rem' }}>
                        {rec.title}
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)',
                        background: rec.classification === 'supported' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: rec.classification === 'supported' ? '#6EE7B7' : '#FECDD3'
                      }}>
                        {rec.confidence}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                      {rec.description}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Supporting Resume Citation: &quot;{rec.evidenceFound}&quot;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
