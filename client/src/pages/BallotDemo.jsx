import { useState } from 'react';
import './BallotDemo.css';

/* ── Indian Political Parties Data ──────────────────────────────────────── */
const PARTIES = [
  {
    id: 'bjp',
    name: 'Bharatiya Janata Party',
    abbr: 'BJP',
    symbol: '🪷',     // Lotus
    symbolName: 'Lotus',
    color: '#FF6B00',
    candidate: 'Rajesh Kumar Sharma',
    serial: 1,
  },
  {
    id: 'inc',
    name: 'Indian National Congress',
    abbr: 'INC',
    symbol: '✋',     // Hand
    symbolName: 'Hand',
    color: '#0066CC',
    candidate: 'Priya Anand Mehta',
    serial: 2,
  },
  {
    id: 'aap',
    name: 'Aam Aadmi Party',
    abbr: 'AAP',
    symbol: '🧹',     // Broom
    symbolName: 'Broom',
    color: '#1FC6D5',
    candidate: 'Suresh Chandra Gupta',
    serial: 3,
  },
  {
    id: 'sp',
    name: 'Samajwadi Party',
    abbr: 'SP',
    symbol: '🚲',     // Bicycle
    symbolName: 'Bicycle',
    color: '#E63946',
    candidate: 'Mohammad Irfan Khan',
    serial: 4,
  },
  {
    id: 'bsp',
    name: 'Bahujan Samaj Party',
    abbr: 'BSP',
    symbol: '🐘',     // Elephant
    symbolName: 'Elephant',
    color: '#6A0DAD',
    candidate: 'Savita Devi Maurya',
    serial: 5,
  },
  {
    id: 'nota',
    name: 'None of the Above',
    abbr: 'NOTA',
    symbol: '✖️',
    symbolName: 'Cross',
    color: '#64748B',
    candidate: '',
    serial: 6,
  },
];

const STEPS = [
  {
    step: 1,
    title: 'Go to Polling Station',
    desc: 'Bring your Voter ID card or any approved photo ID to your assigned polling station.',
    icon: '🏛️',
  },
  {
    step: 2,
    title: 'Identity Verification',
    desc: 'The polling officer checks your name in the electoral roll and marks your finger with indelible ink.',
    icon: '🖊️',
  },
  {
    step: 3,
    title: 'Enter the Voting Booth',
    desc: 'Proceed to the EVM (Electronic Voting Machine) booth in private.',
    icon: '🚪',
  },
  {
    step: 4,
    title: 'Find Your Party on EVM',
    desc: 'Locate the party or candidate you wish to vote for. The symbol helps identify them easily.',
    icon: '🔍',
  },
  {
    step: 5,
    title: 'Press the Blue Button',
    desc: 'Press the blue button next to your chosen party/candidate. A red light will blink and a beep will confirm your vote.',
    icon: '🔵',
  },
  {
    step: 6,
    title: 'VVPAT Verification',
    desc: 'The Voter Verifiable Paper Audit Trail (VVPAT) machine shows your vote on paper for 7 seconds.',
    icon: '🧾',
  },
];

export default function BallotDemo() {
  const [activeTab, setActiveTab] = useState('how'); // 'how' | 'evm' | 'parties'
  const [selectedParty, setSelectedParty] = useState(null);
  const [voted, setVoted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const handleVote = (party) => {
    if (voted) return;
    setSelectedParty(party);
    setTimeout(() => {
      setVoted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 600);
  };

  const resetVote = () => {
    setSelectedParty(null);
    setVoted(false);
  };

  return (
    <div className="ballot-page page">
      {/* Header */}
      <header className="ballot-header">
        <div className="ballot-header-bg" />
        <div className="ballot-header-content">
          <div className="ballot-badge">🗳️ Interactive Demo</div>
          <h1 className="ballot-title">How to Vote</h1>
          <p className="ballot-subtitle">
            Learn the voting process with India's EVM system
          </p>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="ballot-tabs">
        <button
          id="tab-how"
          className={`ballot-tab ${activeTab === 'how' ? 'active' : ''}`}
          onClick={() => setActiveTab('how')}
        >
          📋 Process
        </button>
        <button
          id="tab-evm"
          className={`ballot-tab ${activeTab === 'evm' ? 'active' : ''}`}
          onClick={() => setActiveTab('evm')}
        >
          🖥️ Try EVM
        </button>
        <button
          id="tab-parties"
          className={`ballot-tab ${activeTab === 'parties' ? 'active' : ''}`}
          onClick={() => setActiveTab('parties')}
        >
          🏛️ Parties
        </button>
      </div>

      {/* ── TAB: How to Vote ──────────────────────────────────────────── */}
      {activeTab === 'how' && (
        <div className="ballot-content">
          <p className="ballot-intro">
            Tap each step to learn more about the voting process in India.
          </p>
          <div className="steps-list">
            {STEPS.map((s) => (
              <div
                key={s.step}
                id={`step-${s.step}`}
                className={`step-card ${activeStep === s.step ? 'expanded' : ''}`}
                onClick={() =>
                  setActiveStep(activeStep === s.step ? null : s.step)
                }
              >
                <div className="step-header">
                  <div className="step-num">{s.step}</div>
                  <span className="step-icon">{s.icon}</span>
                  <p className="step-title">{s.title}</p>
                  <span className="step-chevron">
                    {activeStep === s.step ? '▲' : '▼'}
                  </span>
                </div>
                {activeStep === s.step && (
                  <div className="step-body">
                    <p>{s.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Ink finger reminder */}
          <div className="ink-reminder fade-in-up">
            <span className="ink-icon">☝️</span>
            <div>
              <p className="ink-title">Indelible Ink Mark</p>
              <p className="ink-sub">
                Your left index finger will be marked with ink to prevent
                double voting. This ink lasts 2–3 weeks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: EVM Simulator ───────────────────────────────────────── */}
      {activeTab === 'evm' && (
        <div className="ballot-content">
          <p className="ballot-intro">
            This is a simulation of India's Electronic Voting Machine. Press a
            button to cast your vote!
          </p>

          {/* Confetti overlay */}
          {showConfetti && (
            <div className="confetti-overlay">
              {['🎉', '🥳', '🎊', '✅', '🇮🇳'].map((e, i) => (
                <span key={i} className="confetti-item" style={{ '--delay': `${i * 0.15}s`, '--left': `${10 + i * 18}%` }}>
                  {e}
                </span>
              ))}
            </div>
          )}

          {/* EVM Machine */}
          <div className="evm-machine">
            <div className="evm-top">
              <div className="evm-screen">
                {!voted ? (
                  <>
                    <div className="evm-screen-label">ELECTION COMMISSION OF INDIA</div>
                    <div className="evm-screen-title">Cast Your Vote</div>
                    <div className="evm-blink">● READY</div>
                  </>
                ) : (
                  <>
                    <div className="evm-screen-label">ELECTION COMMISSION OF INDIA</div>
                    <div className="evm-voted-msg">✅ VOTE RECORDED</div>
                    <div className="evm-voted-party">
                      {selectedParty?.symbol} {selectedParty?.abbr}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="evm-body">
              <div className="evm-label-row">
                <span>S.No.</span>
                <span>Symbol</span>
                <span>Party</span>
                <span>Candidate</span>
                <span>Vote</span>
              </div>
              {PARTIES.map((p) => (
                <div
                  key={p.id}
                  className={`evm-row ${selectedParty?.id === p.id ? 'evm-row-selected' : ''} ${voted && selectedParty?.id !== p.id ? 'evm-row-dim' : ''}`}
                >
                  <span className="evm-serial">{p.serial}</span>
                  <span className="evm-symbol">{p.symbol}</span>
                  <div className="evm-party-info">
                    <span className="evm-party-abbr">{p.abbr}</span>
                    {p.candidate && (
                      <span className="evm-candidate">{p.candidate}</span>
                    )}
                  </div>
                  <button
                    id={`vote-btn-${p.id}`}
                    className={`evm-button ${selectedParty?.id === p.id ? 'evm-button-lit' : ''} ${voted ? 'evm-button-disabled' : ''}`}
                    onClick={() => handleVote(p)}
                    disabled={voted}
                    style={{ '--party-color': p.color }}
                    aria-label={`Vote for ${p.name}`}
                  >
                    {selectedParty?.id === p.id && !voted ? '●' : voted && selectedParty?.id === p.id ? '✔' : '●'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {voted && (
            <div className="vote-success fade-in-up">
              <div className="vote-success-icon">{selectedParty?.symbol}</div>
              <div>
                <p className="vote-success-title">
                  You voted for {selectedParty?.name}!
                </p>
                <p className="vote-success-sub">
                  In a real election, your vote is now securely recorded.
                </p>
              </div>
              <button
                id="reset-vote-btn"
                className="vote-reset-btn"
                onClick={resetVote}
              >
                Try Again
              </button>
            </div>
          )}

          {/* VVPAT Info */}
          <div className="vvpat-card fade-in-up">
            <div className="vvpat-header">
              <span>🧾</span>
              <strong>VVPAT — Voter Verification</strong>
            </div>
            <p className="vvpat-text">
              After pressing the button, the VVPAT machine prints a paper slip
              showing your chosen party symbol, name, and serial number. This is
              visible for 7 seconds before it drops into a sealed box.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB: Party Symbols ───────────────────────────────────────── */}
      {activeTab === 'parties' && (
        <div className="ballot-content">
          <p className="ballot-intro">
            Each party has a unique symbol to help all voters — including those
            who cannot read — identify their chosen party on the EVM.
          </p>
          <div className="parties-grid">
            {PARTIES.filter((p) => p.id !== 'nota').map((p) => (
              <div
                key={p.id}
                id={`party-card-${p.id}`}
                className="party-card fade-in-up"
                style={{ '--party-color': p.color }}
              >
                <div
                  className="party-symbol-circle"
                  style={{ background: p.color + '22', borderColor: p.color + '55' }}
                >
                  <span className="party-symbol-emoji">{p.symbol}</span>
                </div>
                <div className="party-card-info">
                  <div className="party-abbr" style={{ color: p.color }}>
                    {p.abbr}
                  </div>
                  <div className="party-full-name">{p.name}</div>
                  <div className="party-symbol-name">
                    Symbol: <strong>{p.symbolName}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NOTA Card */}
          <div className="nota-card fade-in-up">
            <div className="nota-left">
              <span className="nota-icon">✖️</span>
              <div>
                <p className="nota-title">NOTA — None of the Above</p>
                <p className="nota-sub">
                  If you don't want to vote for any candidate, you can press
                  NOTA. It is always the last option on the EVM ballot.
                </p>
              </div>
            </div>
          </div>

          {/* Symbol importance */}
          <div className="symbol-info-card fade-in-up">
            <p className="symbol-info-title">🎯 Why Symbols Matter</p>
            <ul className="symbol-info-list">
              <li>India has a literacy rate of ~77% — symbols help all voters</li>
              <li>Symbols are assigned by the Election Commission of India</li>
              <li>National parties keep their symbols across all states</li>
              <li>State parties have state-specific symbols</li>
            </ul>
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
