import { useState } from 'react';
import { 
  Search, Users, LayoutDashboard, Layers, Target, FileText, 
  RotateCcw, Info, CheckCircle, ShieldCheck, ShieldAlert, Sparkles,
  HelpCircle, BookOpen, ExternalLink, X, Compass, ChevronRight
} from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, onResetDemo, candidateCount = 0 }) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalTab, setModalTab] = useState('guide'); // 'guide' | 'formulas'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidates', icon: Users, badge: candidateCount },
    { id: 'search', label: 'Recruiter Search', icon: Search },
    { id: 'fragility', label: 'Fragility Studio', icon: Layers, highlight: true },
    { id: 'keywords', label: 'Keyword Engine', icon: Target },
    { id: 'reports', label: 'Visibility Reports', icon: FileText },
    { id: 'security', label: 'ResumeGuard', icon: ShieldAlert, alert: true },
  ];

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8, 12, 22, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 24px',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      }}>
        {/* Brand Identity */}
        <div 
          onClick={() => onTabChange('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.55)',
            position: 'relative'
          }}>
            <Search size={20} color="white" strokeWidth={2.5} />
            <span style={{
              position: 'absolute', top: -3, right: -3, width: 9, height: 9,
              borderRadius: '50%', background: '#10B981', border: '2px solid #080C16'
            }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.12rem', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
                RecruiterLens <span className="gradient-text">AI</span>
              </span>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC',
                fontSize: '0.68rem', padding: '2px 7px', borderRadius: 6, fontWeight: 700,
                border: '1px solid rgba(99, 102, 241, 0.35)', letterSpacing: '0.04em'
              }}>
                v1.2 PRO
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 1, fontWeight: 500 }}>
              Recruiter ATS Simulator & Fragility Engine
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(15, 22, 41, 0.85)',
          padding: '4px', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 15px', borderRadius: 'var(--radius-full)',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.84rem', fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: isActive ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.45)' : 'none',
                  outline: 'none',
                }}
              >
                <Icon 
                  size={15} 
                  color={isActive ? '#FFFFFF' : (item.alert ? '#FB7185' : item.highlight ? '#22D3EE' : '#94A3B8')} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span style={{
                    fontSize: '0.7rem', padding: '1px 6px', borderRadius: 999,
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(99, 102, 241, 0.25)',
                    color: isActive ? '#FFF' : '#A5B4FC',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Live Status indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '5px 12px', borderRadius: 'var(--radius-full)',
            fontSize: '0.74rem', color: '#6EE7B7', fontWeight: 600
          }}>
            <span className="dot-live" style={{ width: 7, height: 7 }} />
            <span>Deterministic NLP</span>
          </div>

          {/* Reset Demo Pool */}
          <button
            onClick={onResetDemo}
            className="btn btn-secondary btn-sm"
            title="Reload pre-seeded candidate pool"
            style={{ gap: 6, fontSize: '0.78rem' }}
          >
            <RotateCcw size={13} />
            <span>Reset Demo Pool</span>
          </button>

          {/* User Guide & System Formulas Modal */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              borderColor: 'rgba(99, 102, 241, 0.35)',
              color: '#A5B4FC'
            }}
            title="View User Guide & System Architecture"
          >
            <HelpCircle size={14} color="#A5B4FC" />
            <span>User Guide</span>
          </button>
        </div>
      </header>

      {/* Modern Interactive Guide & Documentation Modal */}
      {showInfoModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(4, 7, 15, 0.82)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="anim-scale" style={{
            background: 'linear-gradient(180deg, #10172B 0%, #0A0F1D 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-xl)', maxWidth: 680, width: '100%',
            padding: 30, boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
            maxHeight: '88vh', overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                  <Sparkles size={13} />
                  WELCOME TO RECRUITERLENS AI
                </div>
                <h3 style={{ color: '#F8FAFC', fontSize: '1.35rem', fontWeight: 800 }}>
                  User Guide & System Architecture
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: 2 }}>
                  Everything you need to know about navigating and testing the platform
                </p>
              </div>
              <button 
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)',
                  borderRadius: '50%', width: 34, height: 34, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                onClick={() => setModalTab('guide')}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  background: modalTab === 'guide' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: modalTab === 'guide' ? '#FFF' : '#94A3B8'
                }}
              >
                🚀 4-Step Quick Start Workflow
              </button>
              <button
                onClick={() => setModalTab('formulas')}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  background: modalTab === 'formulas' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: modalTab === 'formulas' ? '#FFF' : '#94A3B8'
                }}
              >
                📐 Mathematical Scoring Formulas
              </button>
            </div>

            {/* Tab 1: Workflow */}
            {modalTab === 'guide' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800 }}>1</span>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.92rem' }}>Candidate Pool & Resume Ingestion</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', paddingLeft: 32 }}>
                    Upload realistic resumes (.pdf, .docx, .txt) or use the pre-loaded 6 demo profiles. Deterministic NLP extracts skills, contact details, and experience.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800 }}>2</span>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.92rem' }}>Simulate Recruiter Search</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', paddingLeft: 32 }}>
                    Enter job queries or pick pre-set searches. Compare Combined, Exact Keyword, Vector Semantic, and Boolean search modes with full transparent score breakdowns.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--violet)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800 }}>3</span>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.92rem' }}>Fragility Studio & Keyword Engine</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', paddingLeft: 32 }}>
                    See how query phrasing swings rankings (e.g., &quot;ML Engineer&quot; vs &quot;AI Developer&quot;). Run counterfactual simulations on evidence-supported skills without fabricating credentials.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--rose)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800 }}>4</span>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.92rem' }}>ResumeGuard Security & Export</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', paddingLeft: 32 }}>
                    Scan candidate resumes for adversarial prompt injections, steganography, or instruction overrides with isolated qualification scoring.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Formulas */}
            {modalTab === 'formulas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: '#A5B4FC', marginBottom: 6 }}>
                    🎯 Candidate Ranking Formula (0–100):
                  </div>
                  <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6, color: '#6EE7B7', fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>
                    Final Score = 0.50 × Semantic + 0.40 × Keyword + 0.10 × Completeness
                  </code>
                  <div style={{ fontSize: '0.78rem', marginTop: 8, color: '#94A3B8', lineHeight: 1.5 }}>
                    • Semantic: TF-IDF &amp; Cosine similarity across profile concept vectors.<br/>
                    • Keyword: Exact, boundary-checked token overlap with canonical alias lookup.<br/>
                    • Completeness: Contact integrity, credential depth, and impact statements.
                  </div>
                </div>

                <div style={{ background: 'rgba(236, 72, 153, 0.08)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: '#F472B6', marginBottom: 6 }}>
                    ⚡ Search Fragility Formula (Key Innovation):
                  </div>
                  <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6, color: '#FDE68A', fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>
                    Fragility Score = 0.70 × Normalized Rank Variation + 0.30 × Missing Penalty
                  </code>
                  <div style={{ fontSize: '0.78rem', marginTop: 8, color: '#94A3B8', lineHeight: 1.5 }}>
                    • 0–30: Stable visibility across phrasing variants.<br/>
                    • 31–60: Moderate ranking variation (fluctuates ±2–4 positions).<br/>
                    • 61–100: High search fragility (candidate collapses or drops out).
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowInfoModal(false)}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
