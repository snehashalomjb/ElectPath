import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks';
import './Chat.css';

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. /gm, '<span class="list-num">$1.</span> ')
    .replace(/^- /gm, '<span class="list-dot">•</span> ')
    .replace(/\n\n/g, '</p><p class="bubble-para">')
    .replace(/\n/g, '<br/>');
}

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hi! I'm **ElectPath AI** — your personal voting guide.\n\nI can help you with:\n- 📋 **Register to vote** step by step\n- 🪪 **Voter ID** requirements by state\n- 📅 **Deadlines & key dates**\n- 🗳️ **Election Day** complete guide\n- ✉️ **Mail-in & absentee** voting\n- 🇮🇳 **Voter ID India** (EPIC via ECI)\n\nWhat would you like to know?`,
  time: '2026-01-01T00:00:00.000Z',  // stable — avoids timestamp drift on hot reload
  followUps: ['How do I register to vote?', 'What ID do I need?', 'When is Election Day?', 'How does mail-in voting work?'],
};

function ChatBubble({ msg, isStreaming }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`bubble-row ${isUser ? 'bubble-right' : 'bubble-left'} fade-in-up`}>
      {!isUser && <div className="avatar bot-avatar">🤖</div>}
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
        <div className="bubble-text" dangerouslySetInnerHTML={{ __html: `<p>${formatMessage(msg.content || '')}</p>` }} />
        {isStreaming && <span className="stream-cursor" />}
        <span className="bubble-time">
          {msg.time && new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && <div className="avatar user-avatar">👤</div>}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="bubble-row bubble-left fade-in">
      <div className="avatar bot-avatar">🤖</div>
      <div className="bubble bubble-bot typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

function FollowUpChips({ chips, onSelect }) {
  if (!chips?.length) return null;
  return (
    <div className="followup-chips fade-in-up">
      <span className="followup-label">💡 Suggested:</span>
      <div className="chips-row">
        {chips.map((chip, i) => (
          <button key={i} className="followup-chip" onClick={() => onSelect(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const [savedProfile] = useLocalStorage('electpath_profile', null);
  const [messages, setMessages] = useLocalStorage('electpath_chat', [WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSupported] = useState(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const normalizedMessages = messages.map(m => ({ ...m, time: m.time ? new Date(m.time) : new Date() }));

  const sendMessage = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || isThinking || isStreaming) return;

    const userMsg = { id: Date.now(), role: 'user', content: msg, time: new Date() };
    // Cap history at 60 messages to prevent localStorage overflow (BUG-004)
    setMessages(prev => {
      const next = [...prev, userMsg];
      return next.length > 60 ? next.slice(next.length - 60) : next;
    });
    setInput('');
    setCharCount(0);
    setIsThinking(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const history = normalizedMessages
      .filter(m => m.id !== 'welcome')
      .slice(-14)
      .map(m => ({ role: m.role, content: m.content }));

    const botId = Date.now() + 1;
    // Abort controller to cancel fetch on unmount (BUG-005)
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history,
          userProfile: savedProfile ? {
            name: savedProfile.name,
            age: savedProfile.age,
            location: savedProfile.location,
            hasVoterId: savedProfile.hasVoterId,
          } : null,
        }),
        signal: controller.signal,  // abort on unmount
      });

      if (!response.ok) throw new Error('Server error');

      setIsThinking(false);
      setIsStreaming(true);

      setMessages(prev => [...prev, { id: botId, role: 'assistant', content: '', time: new Date(), followUps: [] }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let followUps = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'delta') {
              fullContent += parsed.content;
              setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: fullContent } : m));
            } else if (parsed.type === 'done') {
              followUps = parsed.followUps || [];
              if (parsed.isDemo) setIsDemoMode(true);
            }
          } catch (_) {}
        }
      }

      setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: fullContent, followUps, time: new Date() } : m));
    } catch (err) {
      if (err.name === 'AbortError') return; // BUG-005: clean unmount
      setIsThinking(false);
      setMessages(prev => [...prev, {
        id: botId, role: 'assistant', time: new Date(), followUps: [],
        content: `⚠️ **Connection error**\n\nMake sure the backend is running on port 5000.\n*${err.message}*`,
      }]);
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isThinking, isStreaming, normalizedMessages, savedProfile, setMessages]);

  // BUG-005: cancel in-flight stream when component unmounts
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const toggleVoice = () => {
    if (!voiceSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (voiceActive) { recognitionRef.current?.stop(); setVoiceActive(false); return; }

    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = true;
    recognitionRef.current = r;
    r.onstart = () => setVoiceActive(true);
    r.onend   = () => setVoiceActive(false);
    r.onerror = () => setVoiceActive(false);
    r.onresult = (e) => {
      const t = Array.from(e.results).map(x => x[0].transcript).join('');
      setInput(t);
      setCharCount(t.length);
      if (e.results[e.results.length - 1].isFinal) { r.stop(); sendMessage(t); }
    };
    r.start();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME_MSG, time: new Date() }]);
    setShowClearConfirm(false);
    setIsDemoMode(false);
  };

  const busy = isThinking || isStreaming;
  const lastBotMsg = [...normalizedMessages].reverse().find(m => m.role === 'assistant' && !busy);
  const lastFollowUps = lastBotMsg?.followUps || [];

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-bot-info">
          <div className="chat-bot-avatar">
            <span>🤖</span>
            <span className={`avatar-status-dot ${busy ? 'thinking' : 'online'}`} />
          </div>
          <div>
            <h3>ElectPath AI</h3>
            <span className="chat-status">
              {isThinking ? '✦ Thinking…' : isStreaming ? '✦ Responding…' : isDemoMode ? '◈ Demo mode' : '● Online'}
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          {isDemoMode && <span className="demo-badge">Demo</span>}
          {savedProfile?.name && (
            <div className="profile-chip">👤 {savedProfile.name.split(' ')[0]}</div>
          )}
          <button className="icon-btn" title="Clear chat" onClick={() => setShowClearConfirm(true)} aria-label="Clear chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Clear confirm */}
      {showClearConfirm && (
        <div className="clear-overlay fade-in">
          <div className="clear-modal">
            <p>🗑️ Clear all chat history?</p>
            <div className="clear-modal-btns">
              <button className="btn-cancel" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="btn-confirm" onClick={clearChat}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile context banner */}
      {savedProfile?.name && (
        <div className="profile-context-banner">
          <span>🎯</span>
          <span>Personalised for <strong>{savedProfile.name}</strong> · {savedProfile.location} · {savedProfile.hasVoterId ? 'Has Voter ID ✅' : 'Needs Voter ID ⚠️'}</span>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages" id="chat-messages">
        {normalizedMessages.map((msg, i) => (
          <ChatBubble key={msg.id || i} msg={msg}
            isStreaming={isStreaming && i === normalizedMessages.length - 1 && msg.role === 'assistant'} />
        ))}
        {isThinking && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up chips */}
      {!busy && lastFollowUps.length > 0 && (
        <FollowUpChips chips={lastFollowUps} onSelect={sendMessage} />
      )}

      {/* Input */}
      <div className="chat-input-bar">
        {voiceActive && (
          <div className="voice-banner">
            <span className="voice-pulse" /> Listening… speak now
          </div>
        )}
        <div className={`chat-input-wrap ${voiceActive ? 'voice-mode' : ''}`}>
          {voiceSupported && (
            <button id="voice-btn" className={`icon-input-btn voice-btn ${voiceActive ? 'active' : ''}`}
              onClick={toggleVoice} title={voiceActive ? 'Stop' : 'Voice input'} type="button">
              {voiceActive ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              )}
            </button>
          )}

          <textarea ref={inputRef} id="chat-input" className="chat-input"
            placeholder={voiceActive ? 'Listening…' : 'Ask about elections, voting, registration…'}
            value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
            rows={1} maxLength={500} disabled={voiceActive} aria-label="Chat input" />

          {charCount > 400 && <span className="char-count" style={{color: charCount > 470 ? 'var(--alert)' : undefined}}>{500 - charCount}</span>}

          <button id="chat-send-btn" className={`send-btn ${input.trim() && !busy ? 'send-active' : ''}`}
            onClick={() => sendMessage(input)} disabled={!input.trim() || busy} type="button">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter new line{voiceSupported ? ' · 🎙️ Voice available' : ''}</p>
      </div>
    </div>
  );
}
