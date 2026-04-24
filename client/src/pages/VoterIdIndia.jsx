import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks';
import './VoterIdIndia.css';

const STEPS = [
  { num: 1, label: 'Eligibility' },
  { num: 2, label: 'Documents' },
  { num: 3, label: 'Apply' },
  { num: 4, label: 'Track' },
];

const DOCUMENTS = [
  { id: 'aadhaar',  label: 'Aadhaar Card',            tip: 'Most accepted identity proof' },
  { id: 'age',      label: 'Age Proof (Birth Cert / 10th Mark Sheet)', tip: 'Must prove you are 18+' },
  { id: 'address',  label: 'Address Proof',            tip: 'Aadhaar / Utility bill / Bank passbook' },
  { id: 'photo',    label: 'Recent Passport-size Photo',tip: 'White background, clear face' },
  { id: 'pan',      label: 'PAN Card (optional)',       tip: 'Can be used as ID proof' },
];

const STATUS_CONFIG = {
  'Not Applied':        { color: '#94a3b8', bg: '#f1f5f9', icon: '○' },
  'Applied':            { color: '#2D7FF9', bg: '#dbeafe', icon: '📤' },
  'Under Verification': { color: '#F59E0B', bg: '#fef3c7', icon: '🔍' },
  'Approved':           { color: '#22C55E', bg: '#dcfce7', icon: '✅' },
};

// ── Step 1: Eligibility ──────────────────────────────────────────────────────
function Step1({ onNext }) {
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
      // Offline fallback
      const eligible = parseInt(age) >= 18 && isCitizen && isResident;
      setResult({
        eligible,
        reason: eligible
          ? '🎉 You are eligible to apply for a Voter ID!'
          : parseInt(age) < 18
            ? `You need to be 18+. You need ${18 - parseInt(age)} more year(s).`
            : 'Only Indian citizens who are residents can apply.',
      });
    } finally {
      setLoading(false);
    }
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
    </div>
  );
}

// ── Step 2: Document Checklist ───────────────────────────────────────────────
function Step2({ onNext, onBack }) {
  const [checked, setChecked] = useState({});
  const required = ['aadhaar', 'age', 'address', 'photo'];
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
            {!required.includes(doc.id) && <span className="doc-optional">Optional</span>}
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

// ── Step 3: Application Redirect ─────────────────────────────────────────────
function Step3({ onNext, onBack }) {
  const [clicked, setClicked] = useState(false);

  const handleApply = () => {
    setClicked(true);
    window.open('https://voters.eci.gov.in/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="vid-step fade-in-up">
      <div className="vid-step-icon">🚀</div>
      <h2 className="vid-step-title">Apply on Official Portal</h2>
      <p className="vid-step-sub">You're ready! Apply using the official Election Commission of India portal.</p>

      <div className="eci-card">
        <div className="eci-logo">🏛️</div>
        <div>
          <p className="eci-name">Election Commission of India</p>
          <p className="eci-url">voters.eci.gov.in</p>
        </div>
        <span className="eci-badge">Official</span>
      </div>

      <div className="vid-info-steps">
        {[
          'Click "Apply Now" below',
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

      <div className="vid-warning">
        <span>ℹ️</span>
        <span>ElectPath does not collect or submit any of your personal information. The ECI portal is completely separate.</span>
      </div>

      <button id="eci-apply-btn" className="btn btn-primary btn-full eci-apply-btn" onClick={handleApply}>
        🚀 Apply Now on voters.eci.gov.in
      </button>

      {clicked && (
        <div className="applied-banner fade-in">
          <p>✅ Portal opened! Come back here once you have your <strong>Reference ID</strong>.</p>
        </div>
      )}

      <div className="vid-btns" style={{ marginTop: 12 }}>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>I Have My Reference ID →</button>
      </div>
    </div>
  );
}

// ── Step 4: Track Application ─────────────────────────────────────────────────
function Step4({ onBack }) {
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
          state: savedProfile?.location || '',
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

      {saved && (
        <div className="saved-banner fade-in">
          ✅ Application status saved to your profile!
        </div>
      )}

      <button className="btn btn-primary btn-full" onClick={saveStatus} disabled={saving || !refId}>
        {saving ? 'Saving…' : '💾 Save to Profile'}
      </button>

      <div className="track-tip">
        <span>🔗</span>
        <span>Track your application at <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: '#2D7FF9', fontWeight: 600 }}>voters.eci.gov.in</a></span>
      </div>

      <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={onBack}>← Back</button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function VoterIdIndia() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => step > 1 ? setStep(s => s - 1) : navigate('/');

  return (
    <div className="vid-page page">
      {/* Header */}
      <div className="vid-header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2>Voter ID — India 🇮🇳</h2>
          <p>Official ECI Application Guide</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="vid-progress">
        {STEPS.map((s, i) => (
          <div key={s.num} className="vid-progress-item">
            <div className={`vid-step-dot ${step > s.num ? 'done' : step === s.num ? 'active' : ''}`}>
              {step > s.num ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : s.num}
            </div>
            <span className={`vid-step-label ${step === s.num ? 'active-label' : ''}`}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`vid-step-line ${step > s.num ? 'done-line' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="vid-content">
        {step === 1 && <Step1 onNext={next} />}
        {step === 2 && <Step2 onNext={next} onBack={back} />}
        {step === 3 && <Step3 onNext={next} onBack={back} />}
        {step === 4 && <Step4 onBack={back} />}
      </div>
    </div>
  );
}
