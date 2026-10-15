import { useState, useEffect, Component } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import CandidatesView from './components/CandidatesView';
import SearchSimulatorView from './components/SearchSimulatorView';
import FragilityStudioView from './components/FragilityStudioView';
import KeywordEngineView from './components/KeywordEngineView';
import VisibilityReportView from './components/VisibilityReportView';
import PromptInjectionSecurityView from './components/PromptInjectionSecurityView';
import { fetchCandidates, resetDemoCandidates } from './services/api';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RecruiterLens AI Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#080A18', color: '#fff', padding: 24, textAlign: 'center'
        }}>
          <div style={{
            maxWidth: 520, padding: 32, borderRadius: 16, background: '#0D1025',
            border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#EF4444', marginBottom: 12 }}>An Error Occurred</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred in RecruiterLens AI.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              🔄 Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ambient Glow & Modern Background Grid
const BGGrid = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: `
      radial-gradient(ellipse at 15% 10%, rgba(99, 102, 241, 0.16) 0%, transparent 45%),
      radial-gradient(ellipse at 85% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 60%),
      radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)
    `,
    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 36px 36px'
  }} />
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidateCount, setCandidateCount] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [searchQueryContext, setSearchQueryContext] = useState('');
  const [fragilityQueriesContext, setFragilityQueriesContext] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    refreshCandidateCount();
  }, [activeTab]);

  async function refreshCandidateCount() {
    try {
      const res = await fetchCandidates();
      setCandidateCount(res.total || 0);
    } catch {
      // ignore in background
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleResetDemo() {
    try {
      const res = await resetDemoCandidates();
      setCandidateCount(res.total || 0);
      showToast("Demo candidate database successfully re-seeded with 6 diverse profiles!");
      // If on current view, trigger refresh by staying on tab
      const current = activeTab;
      setActiveTab('');
      setTimeout(() => setActiveTab(current), 10);
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    }
  }

  // Navigation Handlers
  function navigateToSearch(prefillQuery = '') {
    if (prefillQuery) setSearchQueryContext(prefillQuery);
    setActiveTab('search');
  }

  function navigateToFragility(queryList = []) {
    if (queryList.length > 0) setFragilityQueriesContext(queryList);
    setActiveTab('fragility');
  }

  function navigateToKeywords(candId = null, query = '') {
    if (candId) setSelectedCandidateId(candId);
    if (query) setSearchQueryContext(query);
    setActiveTab('keywords');
  }

  function navigateToReport(candId = null) {
    if (candId) setSelectedCandidateId(candId);
    setActiveTab('reports');
  }

  function navigateToSecurity(candId = null) {
    if (candId) setSelectedCandidateId(candId);
    setActiveTab('security');
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', color: 'var(--text-primary)' }}>
        <BGGrid />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="toast toast-success" style={{
            position: 'fixed', top: 84, right: 24, zIndex: 999,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: '1.1rem' }}>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onResetDemo={handleResetDemo}
          candidateCount={candidateCount}
        />

        <main style={{ position: 'relative', zIndex: 1, paddingBottom: 60 }}>
          {activeTab === 'dashboard' && (
            <div className="anim-fade">
              <DashboardView
                onNavigate={(tab) => setActiveTab(tab)}
                onSelectCandidate={(candId) => navigateToKeywords(candId)}
              />
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="anim-fade">
              <CandidatesView
                onSelectCandidate={(candId) => navigateToKeywords(candId)}
                onNavigateToSearch={(q) => navigateToSearch(q)}
                onNavigateToSecurity={(candId) => navigateToSecurity(candId)}
              />
            </div>
          )}

          {activeTab === 'search' && (
            <div className="anim-fade">
              <SearchSimulatorView
                initialQuery={searchQueryContext}
                onSelectCandidate={(candId, q) => navigateToKeywords(candId, q)}
                onNavigateToFragility={(qList) => navigateToFragility(qList)}
              />
            </div>
          )}

          {activeTab === 'fragility' && (
            <div className="anim-fade">
              <FragilityStudioView
                initialQueries={fragilityQueriesContext}
                onSelectCandidate={(candId, q) => navigateToKeywords(candId, q)}
              />
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="anim-fade">
              <KeywordEngineView
                initialCandidateId={selectedCandidateId}
                initialQuery={searchQueryContext || 'Python developer with machine learning and SQL'}
                onNavigateToReport={(candId) => navigateToReport(candId)}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="anim-fade">
              <VisibilityReportView
                initialCandidateId={selectedCandidateId}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="anim-fade">
              <PromptInjectionSecurityView
                initialCandidateId={selectedCandidateId}
              />
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
