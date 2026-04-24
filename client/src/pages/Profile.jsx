import { useState } from 'react';
import { userApi } from '../api';
import { useLocalStorage } from '../hooks';
import './Profile.css';

const INITIAL_FORM = { name: '', age: '', location: '', hasVoterId: false };

function RecommendationCard({ text, onReset }) {
  return (
    <div className="recommendation-card fade-in-up">
      <div className="rec-icon">🎯</div>
      <div className="rec-content">
        <h3 className="rec-title">Your Personalized Tip</h3>
        <p className="rec-text">{text}</p>
      </div>
      <button id="profile-edit-btn" className="rec-edit-btn" onClick={onReset} aria-label="Edit profile">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </button>
    </div>
  );
}

function ProfileSummary({ user }) {
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className="profile-summary fade-in-up">
      <div className="profile-avatar-large">
        <span>{initials}</span>
      </div>
      <div className="profile-info">
        <h2 className="profile-name">{user.name}</h2>
        <div className="profile-meta">
          <span className="meta-chip">📍 {user.location}</span>
          <span className="meta-chip">🎂 Age {user.age}</span>
          <span className={`meta-chip ${user.hasVoterId ? 'chip-success' : 'chip-alert'}`}>
            {user.hasVoterId ? '✅ Has Voter ID' : '❌ No Voter ID'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [savedProfile, setSavedProfile] = useLocalStorage('electpath_profile', null);
  const [form, setForm] = useState(savedProfile || INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(
    savedProfile?._recommendation || null
  );
  const [submitted, setSubmitted] = useState(!!savedProfile);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.age || isNaN(form.age) || +form.age < 1 || +form.age > 120) return 'Please enter a valid age (1-120).';
    if (!form.location.trim()) return 'Please enter your location.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    try {
      const payload = { ...form, age: parseInt(form.age, 10) };
      const data = await userApi.save(payload);
      const profileToSave = { ...data.user, _recommendation: data.recommendation };
      setSavedProfile(profileToSave);
      setRecommendation(data.recommendation);
      setSubmitted(true);
    } catch (err) {
      // Offline fallback — build recommendation locally
      const localRec = buildLocalRecommendation(form);
      const profileToSave = { ...form, age: parseInt(form.age, 10), _recommendation: localRec };
      setSavedProfile(profileToSave);
      setRecommendation(localRec);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setRecommendation(null);
    setError(null);
  };

  function buildLocalRecommendation(f) {
    if (+f.age < 18) return `Hi ${f.name}! You need to be 18+ to vote. Keep learning about the process in the meantime!`;
    if (!f.hasVoterId) return `Hi ${f.name}! Your next step is to register to vote and get your Voter ID. Check the Election Process guide to get started!`;
    return `Hi ${f.name}! Great — you already have a Voter ID. Make sure to check the Timeline for key dates in ${f.location}.`;
  }

  return (
    <div className="profile-page page">
      {/* Header */}
      <div className="screen-header">
        <h2>My Profile</h2>
        <p>Personalized voting guidance</p>
      </div>

      <div className="profile-content">
        {submitted && savedProfile ? (
          <>
            <ProfileSummary user={savedProfile} />
            {recommendation && (
              <RecommendationCard text={recommendation} onReset={handleReset} />
            )}

            {/* Checklist */}
            <div className="checklist-card fade-in-up" style={{ animationDelay: '0.15s' }}>
              <h3 className="checklist-title">Your Voting Checklist</h3>
              <div className="checklist">
                <CheckItem done={+savedProfile.age >= 18} label="Age 18 or older" />
                <CheckItem done={!!savedProfile.hasVoterId} label="Registered & has Voter ID" />
                <CheckItem done={!!savedProfile.location} label="Know your polling location" />
                <CheckItem done={false} label="Reviewed election timeline" hint="Visit the Timeline tab" />
                <CheckItem done={false} label="Researched candidates" hint="Use AI Assistant for help" />
              </div>
            </div>
          </>
        ) : (
          /* Form */
          <form id="profile-form" className="profile-form fade-in-up" onSubmit={handleSubmit} noValidate>
            <div className="form-header">
              <div className="form-header-icon">👤</div>
              <h3>Tell us about yourself</h3>
              <p>We'll personalise your voting guidance</p>
            </div>

            {error && (
              <div className="form-error" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input-field"
                placeholder="e.g. Jane Smith"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                className="input-field"
                placeholder="e.g. 24"
                value={form.age}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="location">City / State / Location</label>
              <input
                id="location"
                name="location"
                type="text"
                className="input-field"
                placeholder="e.g. Austin, TX"
                value={form.location}
                onChange={handleChange}
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="voter-id-toggle">
              <div className="voter-id-label">
                <span className="voter-id-emoji">🪪</span>
                <div>
                  <p className="voter-id-title">Do you have a Voter ID?</p>
                  <p className="voter-id-sub">Or are you registered to vote?</p>
                </div>
              </div>
              <label className="toggle-switch" htmlFor="hasVoterId" aria-label="Has Voter ID">
                <input
                  id="hasVoterId"
                  name="hasVoterId"
                  type="checkbox"
                  checked={form.hasVoterId}
                  onChange={handleChange}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
              </label>
            </div>

            <button
              id="profile-submit-btn"
              type="submit"
              className={`btn btn-primary btn-full submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Get My Personalized Plan
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CheckItem({ done, label, hint }) {
  return (
    <div className={`check-item ${done ? 'done' : ''}`}>
      <div className={`check-circle ${done ? 'checked' : ''}`}>
        {done && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div>
        <span className="check-label">{label}</span>
        {hint && !done && <span className="check-hint"> — {hint}</span>}
      </div>
    </div>
  );
}
