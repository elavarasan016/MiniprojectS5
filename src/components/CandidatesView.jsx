import { useState, useEffect, useRef } from 'react';
import { 
  Users, Upload, Search, Trash2, Eye, FileText, CheckCircle, 
  AlertCircle, ExternalLink, Mail, Phone, Globe, 
  GraduationCap, Briefcase, Filter, X, Plus, Sparkles, ShieldAlert,
  ArrowRight, Check, Copy, Tag, RefreshCw
} from 'lucide-react';
import { 
  fetchCandidates, fetchCandidate, uploadResumes, 
  createManualCandidate, deleteCandidate 
} from '../services/api';

const POPULAR_SKILL_CHIPS = ['Python', 'React', 'AWS', 'Docker', 'SQL', 'Node.js', 'Machine Learning', 'Kubernetes'];

export default function CandidatesView({ onSelectCandidate, onNavigateToSearch, onNavigateToSecurity }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('all');

  // Selected Candidate for Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'skills' | 'raw'
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Manual Creation Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Delete Confirmation
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, [searchQuery, skillFilter, educationFilter]);

  async function loadCandidates() {
    try {
      setLoading(true);
      const res = await fetchCandidates({
        search: searchQuery,
        skill: skillFilter,
        education: educationFilter
      });
      setCandidates(res.candidates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setUploadFeedback(null);
      const res = await uploadResumes(files);
      setUploadFeedback({
        success: res.success,
        count: res.uploadedCount,
        errors: res.errors || []
      });
      await loadCandidates();
    } catch (err) {
      setUploadFeedback({
        success: false,
        error: err.message
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleViewDetails(id) {
    try {
      setDetailLoading(true);
      setDetailTab('overview');
      const cand = await fetchCandidate(id);
      setSelectedCandidate(cand);
    } catch (err) {
      alert(`Could not load candidate details: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteCandidateId) return;
    try {
      await deleteCandidate(deleteCandidateId);
      if (selectedCandidate?.id === deleteCandidateId) {
        setSelectedCandidate(null);
      }
      setDeleteCandidateId(null);
      await loadCandidates();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualText.trim()) return;
    try {
      setManualSubmitting(true);
      await createManualCandidate({ name: manualName, rawText: manualText });
      setShowManualModal(false);
      setManualName('');
      setManualText('');
      await loadCandidates();
    } catch (err) {
      alert(`Failed to create candidate: ${err.message}`);
    } finally {
      setManualSubmitting(false);
    }
  }

  function handleCopyRawText(text) {
    navigator.clipboard.writeText(text);
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2000);
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6
          }}>
            <Users size={14} />
            CANDIDATE POOL &amp; RESUME INVENTORY
          </div>
          <h2 style={{ fontSize: '1.85rem', color: '#F8FAFC', fontWeight: 800 }}>
            Candidate Profile Database
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 3 }}>
            Inspect extracted profiles, audit verified competencies, and upload new candidate resumes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowManualModal(true)}
            className="btn btn-secondary"
          >
            <Plus size={15} />
            <span>Paste Resume Text</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
          >
            <Upload size={15} />
            <span>{uploading ? 'Processing Resumes...' : 'Upload Resumes'}</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileUpload(e.target.files)} 
            multiple 
            accept=".pdf,.docx,.txt" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        style={{ marginBottom: 26 }}
      >
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: 'rgba(99, 102, 241, 0.15)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto'
        }}>
          <Upload size={24} color={isDragOver ? 'var(--cyan)' : 'var(--indigo)'} />
        </div>
        <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '1rem', marginBottom: 4 }}>
          Drag &amp; drop resumes here, or click to upload
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Supports <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>PDF</span>, <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>DOCX</span>, and <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>TXT</span> files up to 10MB. Multiple files processed in batch with deterministic skill taxonomy.
        </div>
      </div>

      {/* Upload Feedback Banner */}
      {uploadFeedback && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 12,
          marginBottom: 24,
          background: uploadFeedback.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${uploadFeedback.success ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {uploadFeedback.success ? <CheckCircle size={18} color="var(--emerald)" /> : <AlertCircle size={18} color="var(--rose)" />}
            <div>
              <div style={{ fontWeight: 700, color: uploadFeedback.success ? '#6EE7B7' : '#FECDD3', fontSize: '0.9rem' }}>
                {uploadFeedback.success ? `Successfully processed and indexed ${uploadFeedback.count} resume(s)!` : 'Upload encountered issues'}
              </div>
              {uploadFeedback.errors && uploadFeedback.errors.length > 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Errors: {uploadFeedback.errors.map(e => `${e.filename}: ${e.error}`).join(' | ')}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setUploadFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Modern Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
            <input
              type="text"
              placeholder="Search by candidate name, skill, or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: 40, borderRadius: 'var(--radius-full)' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Education Filter */}
          <select
            value={educationFilter}
            onChange={(e) => setEducationFilter(e.target.value)}
            className="select"
            style={{ width: 'auto', minWidth: 180, borderRadius: 'var(--radius-full)' }}
          >
            <option value="all">All Education Levels</option>
            <option value="Master's / Ph.D.">Master's / Ph.D.</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Diploma / Associate">Diploma / Associate</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || skillFilter || educationFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSkillFilter('');
                setEducationFilter('all');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 1-Click Skill Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Skill:</span>
          {POPULAR_SKILL_CHIPS.map(skill => {
            const isSelected = skillFilter.toLowerCase() === skill.toLowerCase();
            return (
              <button
                key={skill}
                onClick={() => setSkillFilter(isSelected ? '' : skill)}
                className={`query-chip ${isSelected ? 'active' : ''}`}
                style={{ fontSize: '0.76rem', padding: '4px 10px' }}
              >
                <span>{skill}</span>
                {isSelected && <Check size={11} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading candidate profiles...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="card" style={{ padding: 50, textAlign: 'center' }}>
          <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 14px auto' }} />
          <h3 style={{ color: '#F8FAFC', marginBottom: 6 }}>No Candidate Profiles Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 20px' }}>
            No profiles match your filter criteria, or the candidate database is empty.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
          >
            Upload Resume Files
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {candidates.map(candidate => {
            const initials = (candidate.name || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2);
            return (
              <div 
                key={candidate.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 22
                }}
              >
                <div>
                  {/* Top Bar: Avatar, Name & Completeness */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="cand-avatar">
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: '#F8FAFC', fontWeight: 700 }}>
                          {candidate.name}
                        </h3>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          {candidate.filename}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: candidate.completeness >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: candidate.completeness >= 80 ? '#6EE7B7' : '#FDE68A',
                      border: `1px solid ${candidate.completeness >= 80 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                      padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 5
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: candidate.completeness >= 80 ? '#10B981' : '#F59E0B'
                      }} />
                      <span>{candidate.completeness}% Match Depth</span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {candidate.email && candidate.email !== 'Not Provided' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={13} color="var(--cyan)" />
                        <span>{candidate.email}</span>
                      </div>
                    )}
                    {candidate.educationLevel && candidate.educationLevel !== 'Not Specified' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <GraduationCap size={13} color="var(--indigo)" />
                        <span>{candidate.educationLevel}</span>
                      </div>
                    )}
                    {candidate.estimatedExperience && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Briefcase size={13} color="var(--pink)" />
                        <span>{candidate.estimatedExperience}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      EXTRACTED SKILLS ({candidate.skills?.length || 0}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(candidate.skills || []).slice(0, 7).map(skill => (
                        <span key={skill} className="badge badge-indigo" style={{ fontSize: '0.73rem' }}>
                          {skill}
                        </span>
                      ))}
                      {(candidate.skills || []).length > 7 && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
                          +{(candidate.skills || []).length - 7} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14, marginTop: 8
                }}>
                  <button
                    onClick={() => handleViewDetails(candidate.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onNavigateToSecurity && onNavigateToSecurity(candidate.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: 'rgba(244, 63, 94, 0.35)', color: 'var(--rose)' }}
                      title="Run ResumeGuard prompt injection scan"
                    >
                      <ShieldAlert size={13} />
                      <span>Security</span>
                    </button>

                    <button
                      onClick={() => onSelectCandidate && onSelectCandidate(candidate.id)}
                      className="btn btn-primary btn-sm"
                      title="Analyze keyword gaps and run counterfactuals"
                    >
                      <Sparkles size={13} />
                      <span>Audit Gaps</span>
                    </button>

                    <button
                      onClick={() => setDeleteCandidateId(candidate.id)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: 'var(--rose)', borderRadius: 'var(--radius-full)', padding: '6px 9px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Delete candidate profile"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(4, 7, 15, 0.85)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="anim-scale" style={{
            background: 'linear-gradient(180deg, #10172B 0%, #0A0F1D 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-xl)', maxWidth: 840, width: '100%',
            maxHeight: '88vh', overflowY: 'auto', padding: 32, boxShadow: 'var(--shadow-card-hover)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="cand-avatar" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                  {(selectedCandidate.name || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: '#F8FAFC', fontWeight: 800 }}>
                    {selectedCandidate.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    File: {selectedCandidate.filename} &bull; Uploaded: {new Date(selectedCandidate.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)',
                  borderRadius: '50%', width: 34, height: 34, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                onClick={() => setDetailTab('overview')}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  background: detailTab === 'overview' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: detailTab === 'overview' ? '#FFF' : '#94A3B8'
                }}
              >
                Profile Overview
              </button>
              <button
                onClick={() => setDetailTab('skills')}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  background: detailTab === 'skills' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: detailTab === 'skills' ? '#FFF' : '#94A3B8'
                }}
              >
                Categorized Skills ({selectedCandidate.skills?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab('raw')}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  background: detailTab === 'raw' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: detailTab === 'raw' ? '#FFF' : '#94A3B8'
                }}
              >
                Raw Resume Text
              </button>
            </div>

            {/* Tab 1: Overview */}
            {detailTab === 'overview' && (
              <div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14,
                  background: 'rgba(255, 255, 255, 0.03)', padding: 18, borderRadius: 12,
                  border: '1px solid var(--border)', marginBottom: 20
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Email</div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.88rem', marginTop: 2 }}>{selectedCandidate.email}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Phone</div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.88rem', marginTop: 2 }}>{selectedCandidate.phone}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Education</div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.88rem', marginTop: 2 }}>{selectedCandidate.educationLevel}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Experience</div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.88rem', marginTop: 2 }}>{selectedCandidate.estimatedExperience}</div>
                  </div>
                </div>

                {/* Online Profiles */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  {selectedCandidate.github && (
                    <a 
                      href={selectedCandidate.github} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary btn-sm"
                      style={{ gap: 6 }}
                    >
                      <Globe size={13} color="var(--cyan)" />
                      <span>GitHub: {selectedCandidate.github}</span>
                    </a>
                  )}
                  {selectedCandidate.linkedin && (
                    <a 
                      href={selectedCandidate.linkedin} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary btn-sm"
                      style={{ gap: 6 }}
                    >
                      <Globe size={13} color="var(--indigo)" />
                      <span>LinkedIn: {selectedCandidate.linkedin}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Categorized Skills */}
            {detailTab === 'skills' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
                {selectedCandidate.categorizedSkills && Object.entries(selectedCandidate.categorizedSkills).map(([cat, skills]) => {
                  if (!skills || skills.length === 0) return null;
                  return (
                    <div key={cat} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                        {cat.replace(/_/g, ' ')} ({skills.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {skills.map(s => (
                          <span key={s} className="badge badge-indigo" style={{ fontSize: '0.74rem' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Raw Resume */}
            {detailTab === 'raw' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button 
                    onClick={() => handleCopyRawText(selectedCandidate.rawText || '')}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 5 }}
                  >
                    {copiedRawText ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                    <span>{copiedRawText ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <div style={{
                  background: '#070A14', border: '1px solid var(--border)', borderRadius: 10,
                  padding: 18, maxHeight: 300, overflowY: 'auto', fontSize: '0.8rem',
                  color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6
                }}>
                  {selectedCandidate.rawText || 'No raw text available.'}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 18 }}>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const id = selectedCandidate.id;
                  setSelectedCandidate(null);
                  onSelectCandidate && onSelectCandidate(id);
                }}
                className="btn btn-primary"
              >
                <Sparkles size={14} />
                <span>Audit Keywords &amp; Fragility</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Paste Text Modal */}
      {showManualModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(4, 7, 15, 0.85)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="anim-scale" style={{
            background: 'linear-gradient(180deg, #10172B 0%, #0A0F1D 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-xl)', maxWidth: 640, width: '100%',
            padding: 28, boxShadow: 'var(--shadow-card-hover)'
          }}>
            <h3 style={{ color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 800, marginBottom: 6 }}>
              Add Candidate via Resume Text
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 18 }}>
              Paste raw resume text directly. The deterministic NLP parser will extract contact details, verify skills, and index the profile.
            </p>

            <form onSubmit={handleManualSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label>Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Resume Content (Experience, Skills, Education)</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste resume text here..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="textarea"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="btn btn-secondary"
                  disabled={manualSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={manualSubmitting}
                >
                  {manualSubmitting ? 'Parsing & Indexing...' : 'Extract & Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(4, 7, 15, 0.88)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="anim-scale" style={{
            background: 'linear-gradient(180deg, #10172B 0%, #0A0F1D 100%)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--radius-xl)', maxWidth: 450, width: '100%',
            padding: 28, textAlign: 'center', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
              <Trash2 size={26} color="var(--rose)" />
            </div>
            <h3 style={{ color: '#F8FAFC', marginBottom: 8, fontSize: '1.25rem', fontWeight: 800 }}>
              Delete Candidate Profile?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: 22, lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this candidate from the recruitment database? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button 
                onClick={() => setDeleteCandidateId(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="btn"
                style={{ background: 'var(--rose)', color: 'white' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
