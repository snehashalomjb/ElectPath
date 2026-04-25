import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks';
import { useLang } from '../context/LangContext';
import { INDIA_STATES } from '../data/indiaStates';
import './VoterIdIndia.css';

/* ── Constants ────────────────────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: 'State'       },
  { num: 2, label: 'Eligibility' },
  { num: 3, label: 'Documents'   },
  { num: 4, label: 'Apply'       },
  { num: 5, label: 'Track'       },
];

const DOCUMENTS = [
  { id: 'aadhaar', label: 'Aadhaar Card',                      tip: 'Most accepted identity proof',          required: true },
  { id: 'age',     label: 'Age Proof (Birth Cert / 10th)',      tip: 'Must prove you are 18+',                required: true },
  { id: 'address', label: 'Address Proof',                      tip: 'Aadhaar / Utility bill / Passbook',     required: true },
  { id: 'photo',   label: 'Passport-size Photo',                tip: 'White background, clear face',          required: true },
  { id: 'pan',     label: 'PAN Card',                           tip: 'Can be used as ID proof',               required: false },
];

const STATUS_CONFIG = {
  'Not Applied':        { color: '#94a3b8', bg: '#f1f5f9', icon: '○' },
  'Applied':            { color: '#2D7FF9', bg: '#dbeafe', icon: '📤' },
  'Under Verification': { color: '#F59E0B', bg: '#fef3c7', icon: '🔍' },
  'Approved':           { color: '#22C55E', bg: '#dcfce7', icon: '✅' },
};

/* ── Step 0: State Selector ───────────────────────────────────────────────── */
function Step0({ onNext, selectedState, setSelectedState }) {
  const { t } = useLang();
  const [search, setSearch] = useState('');

  const filtered = INDIA_STATES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vid-step fade-in-up">
      <div className="vid-step-icon">🗺️</div>
      <h2 className="vid-step-title">{t('selectState')}</h2>
      <p className="vid-step-sub">{t('stateHelp')}</p>

      <div className="input-group" style={{ marginBottom: 10 }}>
        <input
          id="state-search"
          className="input-field"
          placeholder="Search state or UT…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="state-grid">
        {filtered.map(s => (
          <button
            key={s.code}
            className={`state-chip ${selectedState?.code === s.code ? 'selected' : ''}`}
            onClick={() => setSelectedState(s)}
          >
            {selectedState?.code === s.code && <span className="state-check">✓</span>}
            {s.name}
          </button>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', gridColumn: '1/-1', textAlign: 'center', padding: '16px 0' }}>
            No results for "{search}"
          </p>
        )}
      </div>

      {selectedState && (
        <div className="state-selected-card fade-in">
          <div className="state-selected-info">
            <span className="state-selected-name">📍 {selectedState.name}</span>
            <a href={selectedState.ceo} target="_blank" rel="noopener noreferrer" className="state-ceo-link">
              Visit State CEO Portal ↗
            </a>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-full"
        style={{ marginTop: 14 }}
        onClick={onNext}
        disabled={!selectedState}
      >
        Continue with {selectedState ? selectedState.name : 'selected state'} →
      </button>
    </div>
  );
}

/* ── Step 1: Eligibility ──────────────────────────────────────────────────── */
function Step1({ onNext, onBack }) {
  const [age, setAge] = useState('');
  const [isCitizen, setIsCitizen] = useState(null);
  const [isResident, setIsResident] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!age || isCitizen === null || isResident === null) return;
    setLoading(true);
    try {
      const res = await fetch('/api/voter/eligibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: parseInt(age), isCitizen, isResident }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      const eligible = parseInt(age) >= 18 && isCitizen && isResident;
      setResult({
        eligible,
        reason: eligible
          ? '🎉 You are eligible to apply for a Voter ID!'
          : parseInt(age) < 18
            ? `You need to be 18+. You need ${18 - parseInt(age)} more year(s).`
            : 'Only Indian citizens who are residents can apply.',
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="vid-step fade-in-up">
      <div className="vid-step-icon">🗳️</div>
      <h2 className="vid-step-title">Check Your Eligibility</h2>
      <p className="vid-step-sub">To vote in India, you must be an Indian citizen aged 18 or above.</p>

      <div className="input-group">
        <label htmlFor="vid-age">Your Age</label>
        <input id="vid-age" type="number" className="input-field" placeholder="e.g. 20"
          value={age} onChange={e => { setAge(e.target.value); setResult(null); }} min="1" max="120" />
      </div>

      <div className="vid-radio-group">
        <label className="vid-radio-label">Are you an Indian citizen?</label>
        <div className="vid-radio-row">
          {[true, false].map(v => (
            <button key={String(v)}
              className={`vid-radio-btn ${isCitizen === v ? 'selected' : ''}`}
              onClick={() => { setIsCitizen(v); setResult(null); }}>
              {v ? '✅ Yes' : '❌ No'}
            </button>
          ))}
        </div>
      </div>

      <div className="vid-radio-group">
        <label className="vid-radio-label">Are you ordinarily resident in India?</label>
        <div className="vid-radio-row">
          {[true, false].map(v => (
            <button key={String(v)}
              className={`vid-radio-btn ${isResident === v ? 'selected' : ''}`}
              onClick={() => { setIsResident(v); setResult(null); }}>
              {v ? '✅ Yes' : '❌ No'}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-full"
        onClick={check} disabled={!age || isCitizen === null || isResident === null || loading}>
        {loading ? 'Checking…' : 'Check Eligibility'}
      </button>

      {result && (
        <div className={`eligibility-result fade-in ${result.eligible ? 'eligible' : 'not-eligible'}`}>
          <span className="result-icon">{result.eligible ? '🎉' : '⚠️'}</span>
          <div>
            <p className="result-status">{result.eligible ? 'You are Eligible!' : 'Not Eligible Yet'}</p>
            <p className="result-reason">{result.reason}</p>
          </div>
        </div>
      )}

      {result?.eligible && (
        <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={onNext}>
          Continue → Documents Checklist
        </button>
      )}

      <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={onBack}>← Back</button>
    </div>
  );
}

/* ── Step 2: Document Checklist ───────────────────────────────────────────── */
function Step2({ onNext, onBack }) {
  const [checked, setChecked] = useState({});
  const required = DOCUMENTS.filter(d => d.required).map(d => d.id);
  const allReady = required.every(id => checked[id]);
  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="vid-step fade-in-up">
      <div className="vid-step-icon">📋</div>
      <h2 className="vid-step-title">Document Checklist</h2>
      <p className="vid-step-sub">Tick each document you have ready before applying on the official portal.</p>

      <div className="vid-warning">
        <span>⚠️</span>
        <span>ElectPath does not submit your application. You'll complete it on the official ECI portal.</span>
      </div>

      <div className="doc-list">
        {DOCUMENTS.map(doc => (
          <button key={doc.id} className={`doc-item ${checked[doc.id] ? 'checked' : ''}`}
            onClick={() => toggle(doc.id)}>
            <div className={`doc-check ${checked[doc.id] ? 'done' : ''}`}>
              {checked[doc.id] && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div className="doc-info">
              <span className="doc-label">{doc.label}</span>
              <span className="doc-tip">{doc.tip}</span>
            </div>
            {!doc.required && <span className="doc-optional">Optional</span>}
          </button>
        ))}
      </div>

      <div className="doc-progress">
        <span>{Object.values(checked).filter(Boolean).length} of {DOCUMENTS.length} checked</span>
        <div className="doc-bar">
          <div className="doc-bar-fill"
            style={{ width: `${(Object.values(checked).filter(Boolean).length / DOCUMENTS.length) * 100}%` }} />
        </div>
      </div>

      <div className="vid-btns">
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!allReady}>
          {allReady ? 'Ready to Apply →' : 'Tick all required docs'}
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Apply ────────────────────────────────────────────────────────── */
function Step3({ onNext, onBack, selectedState }) {
  const [clicked, setClicked] = useState(false);

  const handleApply = (url) => {
    setClicked(true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="vid-step fade-in-up">
      <div className="vid-step-icon">🚀</div>
      <h2 className="vid-step-title">Apply on Official Portal</h2>
      <p className="vid-step-sub">You're ready! Apply via ECI or your state's CEO portal.</p>

      {/* ECI National portal */}
      <div className="eci-card">
        <div className="eci-logo">🏛️</div>
        <div>
          <p className="eci-name">Election Commission of India</p>
          <p className="eci-url">voters.eci.gov.in</p>
        </div>
        <span className="eci-badge">Official</span>
      </div>
      <button id="eci-apply-btn" className="btn btn-primary btn-full eci-apply-btn"
        onClick={() => handleApply('https://voters.eci.gov.in/')}>
        🚀 Apply on ECI Portal
      </button>

      {/* State CEO portal */}
      {selectedState && (
        <>
          <div className="state-divider"><span>or use your state portal</span></div>
          <div className="eci-card" style={{ marginTop: 0 }}>
            <div className="eci-logo">📍</div>
            <div>
              <p className="eci-name">{selectedState.name} CEO Portal</p>
              <p className="eci-url">{selectedState.ceo.replace('https://', '')}</p>
            </div>
          </div>
          <button className="btn btn-outline btn-full"
            onClick={() => handleApply(selectedState.ceo)}>
            🌐 Open {selectedState.name} Portal
          </button>
        </>
      )}

      <div className="vid-info-steps" style={{ marginTop: 14 }}>
        {[
          'Select "New Voter Registration (Form 6)"',
          'Fill in your details and upload documents',
          'Submit and note your Reference ID',
        ].map((s, i) => (
          <div key={i} className="info-step">
            <span className="info-step-num">{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {clicked && (
        <div className="applied-banner fade-in">
          <p>✅ Portal opened! Return here with your <strong>Reference ID</strong>.</p>
        </div>
      )}

      <div className="vid-btns" style={{ marginTop: 12 }}>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>I Have My Reference ID →</button>
      </div>
    </div>
  );
}

/* ── Step 4: Track ────────────────────────────────────────────────────────── */
function Step4({ onBack, selectedState }) {
  const [savedProfile] = useLocalStorage('electpath_profile', null);
  const [refId, setRefId] = useState('');
  const [status, setStatus] = useState('Applied');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusCfg = STATUS_CONFIG[status];

  const saveStatus = async () => {
    setSaving(true);
    try {
      await fetch('/api/voter/apply-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: savedProfile?.name || `guest_${Date.now()}`,
          referenceId: refId,
          voterIdStatus: status,
          documentsUploaded: true,
          state: selectedState?.name || savedProfile?.location || '',
        }),
      });
    } catch (_) {}
    setSaved(true);
    setSaving(false);
  };

  return (
    <div className="vid-step fade-in-up">
      <div className="vid-step-icon">📊</div>
      <h2 className="vid-step-title">Track Your Application</h2>
      <p className="vid-step-sub">Save your Reference ID and track your Voter ID status here.</p>

      {selectedState && (
        <a href={selectedState.ceo} target="_blank" rel="noopener noreferrer" className="track-state-link">
          📍 Track on {selectedState.name} CEO Portal ↗
        </a>
      )}

      <div className="input-group">
        <label htmlFor="ref-id">Reference / Application ID</label>
        <input id="ref-id" type="text" className="input-field"
          placeholder="e.g. ECI20261234567"
          value={refId} onChange={e => setRefId(e.target.value)} />
      </div>

      <div className="vid-radio-group">
        <label className="vid-radio-label">Current Status</label>
        <div className="status-btn-row">
          {Object.keys(STATUS_CONFIG).map(s => (
            <button key={s}
              className={`status-btn ${status === s ? 'active' : ''}`}
              style={status === s ? { background: STATUS_CONFIG[s].bg, borderColor: STATUS_CONFIG[s].color, color: STATUS_CONFIG[s].color } : {}}
              onClick={() => { setStatus(s); setSaved(false); }}>
              {STATUS_CONFIG[s].icon} {s}
            </button>
          ))}
        </div>
      </div>

      <div className="status-display" style={{ background: statusCfg.bg, borderColor: statusCfg.color }}>
        <span style={{ fontSize: '1.6rem' }}>{statusCfg.icon}</span>
        <div>
          <p style={{ fontWeight: 700, color: statusCfg.color }}>{status}</p>
          {refId && <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Ref: {refId}</p>}
        </div>
      </div>

      {saved && <div className="saved-banner fade-in">✅ Application status saved to your profile!</div>}

      <button className="btn btn-primary btn-full" onClick={saveStatus} disabled={saving || !refId}>
        {saving ? 'Saving…' : '💾 Save to Profile'}
      </button>

      <div className="track-tip">
        <span>🔗</span>
        <span>Track at <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer"
          style={{ color: '#2D7FF9', fontWeight: 600 }}>voters.eci.gov.in</a></span>
      </div>

      <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={onBack}>← Back</button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function VoterIdIndia() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [selectedState, setSelectedState] = useState(null);

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => step > 0 ? setStep(s => s - 1) : navigate('/');

  return (
    <div className="vid-page page">
      {/* Header */}
      <div className="vid-header">
        <button className="back-btn" onClick={back} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2>{t('voterIdTitle')}</h2>
          <p>Official ECI Application Guide</p>
        </div>
        {selectedState && (
          <span className="vid-state-pill">📍 {selectedState.code}</span>
        )}
      </div>

      {/* Progress */}
      <div className="vid-progress">
        {STEPS.map((s, i) => (
          <div key={s.num} className="vid-progress-item">
            <div className={`vid-step-dot ${step > s.num - 1 ? 'done' : step === s.num - 1 ? 'active' : ''}`}>
              {step > s.num - 1 ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : s.num}
            </div>
            <span className={`vid-step-label ${step === s.num - 1 ? 'active-label' : ''}`}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`vid-step-line ${step > s.num - 1 ? 'done-line' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="vid-content">
        {step === 0 && <Step0 onNext={next} selectedState={selectedState} setSelectedState={setSelectedState} />}
        {step === 1 && <Step1 onNext={next} onBack={back} />}
        {step === 2 && <Step2 onNext={next} onBack={back} />}
        {step === 3 && <Step3 onNext={next} onBack={back} selectedState={selectedState} />}
        {step === 4 && <Step4 onBack={back} selectedState={selectedState} />}
      </div>
    </div>
  );
}
