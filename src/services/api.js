// ============================================================================
// API CLIENT SERVICE — RecruiterLens AI
// Front-end service for Recruiter Search Simulator & Keyword Engine API
// ============================================================================

const BASE_URL = '/api';

async function handleResponse(res) {
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: text || `HTTP ${res.status}` };
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// 1. Dashboard Stats
export async function fetchDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`);
  return handleResponse(res);
}

// 2. Candidates
export async function fetchCandidates(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.skill) params.append('skill', filters.skill);
  if (filters.education && filters.education !== 'all') params.append('education', filters.education);
  if (filters.minCompleteness) params.append('minCompleteness', filters.minCompleteness);

  const res = await fetch(`${BASE_URL}/candidates?${params.toString()}`);
  return handleResponse(res);
}

export async function fetchCandidate(id) {
  const res = await fetch(`${BASE_URL}/candidates/${id}`);
  return handleResponse(res);
}

export async function uploadResumes(files) {
  const formData = new FormData();
  if (Array.isArray(files)) {
    files.forEach(f => formData.append('files', f));
  } else if (files instanceof FileList) {
    Array.from(files).forEach(f => formData.append('files', f));
  } else {
    formData.append('files', files);
  }

  const res = await fetch(`${BASE_URL}/candidates/upload`, {
    method: 'POST',
    body: formData
  });
  return handleResponse(res);
}

export async function createManualCandidate({ rawText, name }) {
  const res = await fetch(`${BASE_URL}/candidates/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, name })
  });
  return handleResponse(res);
}

export async function deleteCandidate(id) {
  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function resetDemoCandidates() {
  const res = await fetch(`${BASE_URL}/candidates/reset-demo`, {
    method: 'POST'
  });
  return handleResponse(res);
}

// 3. Recruiter Search Simulator
export async function performSearch({ query, mode = 'combined', filters = {}, weights }) {
  const res = await fetch(`${BASE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, mode, filters, weights })
  });
  return handleResponse(res);
}

// 4. Search Fragility Analysis
export async function performFragilityAnalysis({ queries, mode = 'combined', weights }) {
  const res = await fetch(`${BASE_URL}/fragility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries, mode, weights })
  });
  return handleResponse(res);
}

// 5. Keyword Gap Analysis
export async function performGapAnalysis({ candidateId, query }) {
  const res = await fetch(`${BASE_URL}/gap-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, query })
  });
  return handleResponse(res);
}

// 6. Counterfactual Simulation
export async function simulateCounterfactual({ candidateId, query, proposedChange }) {
  const res = await fetch(`${BASE_URL}/counterfactual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, query, proposedChange })
  });
  return handleResponse(res);
}

// 7. Full Visibility Report
export async function fetchCandidateReport(id) {
  const res = await fetch(`${BASE_URL}/candidates/${id}/report`);
  return handleResponse(res);
}

// 8. Taxonomy Dictionary
export async function fetchTaxonomy() {
  const res = await fetch(`${BASE_URL}/taxonomy`);
  return handleResponse(res);
}

// 9. ResumeGuard — Prompt Injection Security
export async function scanResumeSecurity({ candidateId, rawText, file, filename }) {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    if (candidateId) formData.append('candidateId', candidateId);
    const res = await fetch(`${BASE_URL}/security/scan`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  }

  const res = await fetch(`${BASE_URL}/security/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, rawText, filename })
  });
  return handleResponse(res);
}

export async function fetchSecurityReports() {
  const res = await fetch(`${BASE_URL}/security/reports`);
  return handleResponse(res);
}

export async function fetchSecurityReport(id) {
  const res = await fetch(`${BASE_URL}/security/reports/${id}`);
  return handleResponse(res);
}

export async function fetchCandidateSecurityReport(candidateId) {
  const res = await fetch(`${BASE_URL}/security/candidate/${candidateId}`);
  return handleResponse(res);
}

export async function deleteSecurityReport(id) {
  const res = await fetch(`${BASE_URL}/security/reports/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function rescanSecurityReport(id) {
  const res = await fetch(`${BASE_URL}/security/rescan/${id}`, {
    method: 'POST'
  });
  return handleResponse(res);
}

// 10. Health Check
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

