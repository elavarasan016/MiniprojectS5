import { useState, useEffect } from 'react';
import { 
  Users, Search, Award, TrendingUp, Layers, Upload, ArrowRight,
  Clock, CheckCircle, AlertTriangle, Sparkles, Database, FileText, 
  ShieldAlert, Compass, Play, RefreshCw, BarChart2, ShieldCheck, Zap
} from 'lucide-react';
import { fetchDashboard } from '../services/api';

export default function DashboardView({ onNavigate, onSelectCandidate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1240, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 440, margin: '0 auto', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto 20px auto' }} />
          <h3 style={{ color: '#F8FAFC', marginBottom: 8, fontSize: '1.15rem' }}>Loading RecruiterLens AI</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Indexing candidates & aggregating search telemetry...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: 32, textAlign: 'center' }} className="card">
        <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <AlertTriangle size={28} color="var(--rose)" />
        </div>
        <h3 style={{ marginBottom: 8, color: '#F8FAFC' }}>Unable to Connect to Backend Engine</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
          {error || 'Make sure the Node.js server is active on port 5000.'}
        </p>
        <button onClick={loadDashboard} className="btn btn-primary">
          <RefreshCw size={15} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const {
    totalCandidates = 0,
    totalResumesProcessed = 0,
    totalSearches = 0,
    avgMatchScore = 72,
    strongProfileCount = 0,
    topSkills = [],
    categoryStats = {},
    recentSearches = [],
    recentUploads = []
  } = stats;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        marginBottom: 32,
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 220, height: 220,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(99, 102, 241, 0.18)', color: '#A5B4FC',
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 700, marginBottom: 14,
              border: '1px solid rgba(99, 102, 241, 0.35)', letterSpacing: '0.04em'
            }}>
              <Sparkles size={14} color="#67E8F9" />
              INTELLIGENT ATS SIMULATOR &amp; PROMPT INJECTION DEFENSE
            </div>
            
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)', marginBottom: 12, color: '#F8FAFC', fontWeight: 800 }}>
              Recruiter Search &amp; Fragility Intelligence Hub
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.65 }}>
              Understand how modern ATS and recruiter boolean algorithms evaluate tech resumes. 
              Uncover how small phrasing variations alter search visibility, test verified skill promotions, and defend against adversarial resume prompt injection attacks.
            </p>
          </div>

          {/* Quick Action Launch Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240 }}>
            <button 
              onClick={() => onNavigate('search')}
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '12px 20px' }}
            >
              <Search size={16} />
              <span>Simulate ATS Search</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigate('fragility')}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', padding: '12px 20px', borderColor: 'rgba(6, 182, 212, 0.4)' }}
            >
              <Layers size={16} color="var(--cyan)" />
              <span style={{ color: 'var(--cyan)' }}>Test Query Fragility</span>
            </button>
            <button 
              onClick={() => onNavigate('security')}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', padding: '12px 20px', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            >
              <ShieldAlert size={16} color="var(--rose)" />
              <span style={{ color: 'var(--rose)' }}>ResumeGuard Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Interactive Recruiter Workflow Guide */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={18} color="var(--cyan)" />
            <h3 style={{ fontSize: '1.05rem', color: '#F8FAFC', fontWeight: 700 }}>
              Interactive Recruiter Workflow Guide
            </h3>
            <span className="badge badge-indigo">Click any step to begin</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          
          {/* Step 1 */}
          <div 
            onClick={() => onNavigate('candidates')}
            className="workflow-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem'
                }}>01</span>
                <Users size={18} color="var(--indigo)" />
              </div>
              <h4 style={{ color: '#F8FAFC', marginBottom: 6, fontSize: '1rem' }}>Candidate Pool</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {totalCandidates} resumes indexed. View extracted skill profiles, education, contact data, or upload your own resumes.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 600, marginTop: 14 }}>
              <span>Browse Candidates</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => onNavigate('search')}
            className="workflow-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem'
                }}>02</span>
                <Search size={18} color="var(--cyan)" />
              </div>
              <h4 style={{ color: '#F8FAFC', marginBottom: 6, fontSize: '1rem' }}>ATS Search Simulator</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Simulate natural language, keyword, and boolean queries with transparent ranking breakdowns.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 600, marginTop: 14 }}>
              <span>Run Search Simulation</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => onNavigate('fragility')}
            className="workflow-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(139, 92, 246, 0.2)', color: 'var(--violet)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem'
                }}>03</span>
                <Layers size={18} color="var(--violet)" />
              </div>
              <h4 style={{ color: '#F8FAFC', marginBottom: 6, fontSize: '1rem' }}>Fragility &amp; Keyword Gaps</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Discover ranking volatility across synonyms and test evidence-backed counterfactual promotions.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 600, marginTop: 14 }}>
              <span>Analyze Fragility</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => onNavigate('security')}
            className="workflow-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(244, 63, 94, 0.2)', color: 'var(--rose)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem'
                }}>04</span>
                <ShieldAlert size={18} color="var(--rose)" />
              </div>
              <h4 style={{ color: '#F8FAFC', marginBottom: 6, fontSize: '1rem' }}>ResumeGuard Security</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Scan for hidden instructions, zero-width steganography, and forced 100% score override exploits.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--rose)', fontSize: '0.8rem', fontWeight: 600, marginTop: 14 }}>
              <span>Scan Security Threats</span>
              <ArrowRight size={13} />
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 18,
        marginBottom: 32
      }}>
        {/* Total Candidates */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              CANDIDATE POOL
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99, 102, 241, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
              <Users size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
            {totalCandidates}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="dot-live" />
            <span>{totalResumesProcessed} verified resumes indexed</span>
          </div>
        </div>

        {/* Searches Performed */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              SEARCH SIMULATIONS
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(6, 182, 212, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
              <Search size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
            {totalSearches}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Keyword, Semantic &amp; Boolean queries
          </div>
        </div>

        {/* Avg Match Score */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              AVG MATCH SCORE
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16, 185, 129, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
              <Award size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
            {avgMatchScore}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Across all evaluated candidate profiles
          </div>
        </div>

        {/* High Evidence Profiles */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              HIGH EVIDENCE PROFILES
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(236, 72, 153, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)' }}>
              <CheckCircle size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
            {strongProfileCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            &ge; 80% completeness &amp; contact depth
          </div>
        </div>
      </div>

      {/* Middle Grid: Skills Distribution & Fragility Indicator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24, marginBottom: 32 }}>
        
        {/* Top Extracted Skills */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', marginBottom: 3 }}>
                Top Skills in Candidate Database
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Extracted via deterministic token-boundary NLP &amp; canonical alias mapping
              </p>
            </div>
            <button 
              onClick={() => onNavigate('candidates')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {topSkills.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No candidates uploaded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topSkills.map((item, idx) => {
                const percent = Math.min(100, Math.round((item.count / totalCandidates) * 100));
                return (
                  <div key={item.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{item.skill}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {item.count} profiles ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(255, 255, 255, 0.07)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: idx === 0 
                          ? 'var(--grad-primary)' 
                          : idx < 3 ? 'var(--cyan)' : 'var(--indigo)',
                        borderRadius: 4,
                        transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Fragility Overview & Category Density */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', marginBottom: 3 }}>
                Search Fragility &amp; Taxonomy Breakdown
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Taxonomy skill counts across technical hiring disciplines
              </p>
            </div>
            <button 
              onClick={() => onNavigate('fragility')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: '#F472B6', borderColor: 'rgba(236, 72, 153, 0.3)' }}
            >
              <span>Test Variants</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: 'rgba(236, 72, 153, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Layers size={20} color="var(--pink)" />
            </div>
            <div style={{ fontSize: '0.84rem' }}>
              <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: 2 }}>
                Why Search Fragility Matters
              </div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Minor recruiter query changes (e.g. &quot;ML Engineer&quot; vs &quot;AI Developer&quot;) can shift candidate rankings by 5+ positions. Run our multi-query suite to uncover hidden ranking volatility.
              </div>
            </div>
          </div>

          {/* Category badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {Object.entries(categoryStats).map(([cat, count]) => {
              const label = cat.replace(/_/g, ' ').toUpperCase();
              return (
                <div key={cat} style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.2s'
                }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cyan)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Searches & Recent Candidates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
        
        {/* Recent Recruiter Searches */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={17} color="var(--cyan)" />
              <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>
                Recent Recruiter Searches
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('search')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Simulate New Search
            </button>
          </div>

          {recentSearches.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              No search simulations recorded yet.
              <div style={{ marginTop: 10 }}>
                <button 
                  onClick={() => onNavigate('search')}
                  className="btn btn-primary btn-sm"
                >
                  Run First Search
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentSearches.map((s, idx) => (
                <div 
                  key={s.id || idx} 
                  onClick={() => onNavigate('search')}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', marginBottom: 2 }}>
                      &quot;{s.query}&quot;
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Mode: <span style={{ textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 600 }}>{s.mode}</span> &bull; {s.resultsCount} candidates matched
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--emerald)' }}>
                      {s.topScore}% top
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      avg {s.avgScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Profiles in Store */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={17} color="var(--indigo)" />
              <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>
                Candidate Profiles in Store
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('candidates')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--indigo-light)' }}
            >
              <span>Manage All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentUploads.map(c => {
              const initials = (c.name || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2);
              return (
                <div 
                  key={c.id} 
                  onClick={() => onSelectCandidate && onSelectCandidate(c.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'var(--grad-primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.84rem', flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {c.filename} &bull; {c.skillsCount} skills detected
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      background: c.completeness >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: c.completeness >= 80 ? '#6EE7B7' : '#FDE68A',
                      padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: 700
                    }}>
                      {c.completeness}% completeness
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
