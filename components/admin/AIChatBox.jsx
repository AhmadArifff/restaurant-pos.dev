'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sendAIQuery } from '@/lib/api';
import { useAIChatStore } from '@/store/aiChatStore';

/* ─── CSS Animations (injected once) ─────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .ai-chat-root {
    font-family: 'Space Grotesk', sans-serif;
    --c-brand: #f97316;
    --c-brand-dim: rgba(249,115,22,0.15);
    --c-brand-glow: rgba(249,115,22,0.35);
    --c-surface: rgba(10,10,14,0.97);
    --c-glass: rgba(255,255,255,0.04);
    --c-border: rgba(255,255,255,0.08);
    --c-border-accent: rgba(249,115,22,0.4);
    --c-text: rgba(255,255,255,0.92);
    --c-muted: rgba(255,255,255,0.45);
    --c-user-bg: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
  }

  /* Scanline overlay */
  .ai-chat-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 0;
    border-radius: inherit;
  }

  /* Ambient glow top */
  .ai-chat-root::after {
    content: '';
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 340px; height: 120px;
    background: radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Header ── */
  .chat-header {
    position: relative;
    z-index: 2;
    padding: 1.1rem 1.25rem 1rem;
    border-bottom: 1px solid var(--c-border);
    background: linear-gradient(180deg, rgba(249,115,22,0.06) 0%, transparent 100%);
  }

  .header-status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
    animation: pulse-green 2s ease-in-out infinite;
  }

  @keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
    50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0.05); }
  }

  .ai-logo-ring {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1.5px solid var(--c-brand);
    box-shadow: 0 0 12px var(--c-brand-glow), inset 0 0 8px rgba(249,115,22,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    animation: logo-breathe 4s ease-in-out infinite;
  }

  @keyframes logo-breathe {
    0%, 100% { box-shadow: 0 0 12px var(--c-brand-glow), inset 0 0 8px rgba(249,115,22,0.08); }
    50%       { box-shadow: 0 0 22px rgba(249,115,22,0.5), inset 0 0 14px rgba(249,115,22,0.15); }
  }

  /* ── Messages ── */
  .chat-messages {
    position: relative;
    z-index: 2;
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(249,115,22,0.3) transparent;
  }

  .chat-messages::-webkit-scrollbar { width: 3px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.4); border-radius: 8px; }

  /* Message enter animation */
  .msg-enter {
    animation: msg-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes msg-slide-in {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* User bubble */
  .bubble-user {
    background: var(--c-user-bg);
    color: #fff;
    border-radius: 18px 18px 4px 18px;
    padding: 0.65rem 1rem;
    font-size: 13.5px;
    line-height: 1.6;
    max-width: 78%;
    word-break: break-word;
    box-shadow: 0 4px 20px rgba(249,115,22,0.25);
    position: relative;
  }

  /* AI bubble */
  .bubble-ai {
    background: var(--c-glass);
    border: 1px solid var(--c-border);
    color: var(--c-text);
    border-radius: 18px 18px 18px 4px;
    padding: 0.7rem 1rem;
    font-size: 13.5px;
    line-height: 1.7;
    max-width: 82%;
    word-break: break-word;
    position: relative;
    backdrop-filter: blur(8px);
  }

  .bubble-ai::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(249,115,22,0.05) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Error bubble */
  .bubble-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5;
    border-radius: 18px 18px 18px 4px;
    padding: 0.7rem 1rem;
    font-size: 13px;
    max-width: 82%;
    word-break: break-word;
  }

  /* Avatar */
  .avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
    flex-shrink: 0;
    letter-spacing: 0.5px;
  }

  .avatar-ai {
    background: rgba(249,115,22,0.12);
    border: 1px solid var(--c-brand-glow);
    color: var(--c-brand);
    box-shadow: 0 0 8px rgba(249,115,22,0.2);
  }

  .avatar-user {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.8);
  }

  .avatar-err {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
  }

  /* Timestamp */
  .ts {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    margin-top: 4px;
    opacity: 0.45;
  }

  /* ── Typing indicator ── */
  .typing-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--c-brand);
    animation: typing 1.2s ease-in-out infinite;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%            { transform: translateY(-6px); opacity: 1; }
  }

  /* ── Empty state ── */
  .empty-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 1rem;
    width: 100%;
  }

  .suggestion-chip {
    background: var(--c-glass);
    border: 1px solid var(--c-border);
    color: var(--c-muted);
    border-radius: 12px;
    padding: 0.55rem 0.75rem;
    font-size: 11.5px;
    font-family: 'Space Grotesk', sans-serif;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    line-height: 1.4;
  }

  .suggestion-chip:hover {
    border-color: var(--c-brand-glow);
    color: var(--c-text);
    background: var(--c-brand-dim);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249,115,22,0.15);
  }

  /* ── Input bar ── */
  .chat-input-bar {
    position: relative;
    z-index: 2;
    padding: 0.85rem 1rem;
    border-top: 1px solid var(--c-border);
    background: rgba(0,0,0,0.3);
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .chat-input {
    flex: 1;
    background: var(--c-glass);
    border: 1px solid var(--c-border);
    color: var(--c-text);
    border-radius: 14px;
    padding: 0.6rem 1rem;
    font-size: 13.5px;
    font-family: 'Space Grotesk', sans-serif;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    line-height: 1.5;
    resize: none;
  }

  .chat-input::placeholder { color: var(--c-muted); }

  .chat-input:focus {
    border-color: var(--c-brand-glow);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  }

  .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

  .send-btn {
    width: 40px; height: 40px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #f97316, #ef4444);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 14px rgba(249,115,22,0.35);
    position: relative;
    overflow: hidden;
  }

  .send-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    border-radius: inherit;
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(249,115,22,0.5);
  }

  .send-btn:active:not(:disabled) { transform: scale(0.95); }
  .send-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

  /* ── Clear button ── */
  .clear-btn {
    width: 100%;
    background: transparent;
    border: 1px solid var(--c-border);
    color: var(--c-muted);
    font-size: 11.5px;
    font-family: 'Space Grotesk', sans-serif;
    border-radius: 10px;
    padding: 0.4rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-btn:hover {
    border-color: rgba(239,68,68,0.4);
    color: #fca5a5;
    background: rgba(239,68,68,0.06);
  }

  /* ── Error banner ── */
  .error-banner {
    position: relative;
    z-index: 2;
    background: rgba(239,68,68,0.07);
    border-top: 1px solid rgba(239,68,68,0.2);
    padding: 0.5rem 1rem;
    font-size: 12px;
    color: #fca5a5;
  }

  /* ── Char counter ── */
  .char-counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--c-muted);
    padding: 0 0.25rem 0.5rem 1rem;
    position: relative; z-index: 2;
  }

  /* ── Orbit animation on empty state ── */
  @keyframes orbit-slow {
    from { transform: rotate(0deg) translateX(24px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(24px) rotate(-360deg); }
  }

  .orbit-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    position: absolute;
    animation: orbit-slow 3s linear infinite;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function AILogo() {
  return (
    <div className="ai-logo-ring">
      <span style={{ fontSize: 16 }}>⚡</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-enter" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <div className="avatar avatar-ai">AI</div>
      <div className="bubble-ai" style={{ padding: '0.65rem 1rem' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 16 }}>
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { icon: '💰', text: 'Revenue hari ini berapa?' },
  { icon: '🔥', text: 'Produk paling laris minggu ini?' },
  { icon: '📦', text: 'Stok mana yang perlu dipesan ulang?' },
  { icon: '📊', text: 'Bandingkan penjualan bulan ini vs bulan lalu' },
];

function EmptyState({ onSelect }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '1.5rem 1rem',
      textAlign: 'center',
    }}>
      {/* Orbiting logo */}
      <div style={{ position: 'relative', width: 72, height: 72, marginBottom: '1.25rem' }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          border: '1.5px solid rgba(249,115,22,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>⚡</div>
        <div className="orbit-dot" style={{
          background: '#f97316',
          top: '50%', left: '50%',
          marginTop: -2.5, marginLeft: -2.5,
          animationDuration: '2.5s',
        }} />
        <div className="orbit-dot" style={{
          background: '#ef4444',
          top: '50%', left: '50%',
          marginTop: -2.5, marginLeft: -2.5,
          animationDuration: '4s',
          animationDelay: '-2s',
        }} />
      </div>

      <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
        AI Business Assistant
      </p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Tanya apapun tentang data<br />bisnis, stok, atau revenue Anda
      </p>

      <div className="empty-grid" style={{ maxWidth: 320 }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => onSelect(s.text)}>
            <span style={{ marginRight: 5 }}>{s.icon}</span>{s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ msg, idx }) {
  const isUser = msg.role === 'user';
  const isError = msg.role === 'error';
  const isAI = msg.role === 'assistant';

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="msg-enter"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animationDelay: `${Math.min(idx * 0.05, 0.3)}s`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row', maxWidth: '88%' }}>
        <div className={`avatar ${isUser ? 'avatar-user' : isError ? 'avatar-err' : 'avatar-ai'}`}>
          {isUser ? 'U' : isError ? '!' : 'AI'}
        </div>
        <div>
          <div className={isUser ? 'bubble-user' : isError ? 'bubble-error' : 'bubble-ai'}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          </div>
          <p className="ts" style={{ textAlign: isUser ? 'right' : 'left', marginTop: 4, marginLeft: isUser ? 0 : 4 }}>
            {formatTime(msg.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function AIChatBox({ isModal = false }) {
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');

  const { messages, isLoading, error, addMessage, setLoading, setError, clearMessages } =
    useAIChatStore();

  useEffect(() => { injectStyles(); }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSend = useCallback(async (text) => {
    const userMessage = (text ?? inputValue).trim();
    if (!userMessage) return;

    setInputValue('');
    inputRef.current?.focus();

    addMessage({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });
    setLoading(true);
    setError(null);

    try {
      const response = await sendAIQuery(userMessage);
      if (!response.data.success) throw new Error(response.data.error || 'Gagal mendapatkan response');

      addMessage({ role: 'assistant', content: response.data.response, timestamp: new Date().toISOString() });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses query';
      setError(msg);
      addMessage({ role: 'error', content: `❌ ${msg}`, timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, [inputValue, addMessage, setLoading, setError]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charsLeft = 500 - inputValue.length;

  return (
    <div
      className="ai-chat-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isModal ? '100%' : '100vh',
        minHeight: isModal ? 450 : 500,
        background: 'var(--c-surface)',
        borderRadius: isModal ? 16 : 0,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--c-border)',
        boxShadow: isModal ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : 'none',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <AILogo />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>
                AI Assistant
              </span>
              <div className="header-status-dot" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11.5, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
              v2.4 · online · query database bisnis
            </p>
          </div>

          {/* Clear icon button */}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              title="Hapus riwayat"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--c-border)',
                borderRadius: 10,
                width: 32, height: 32,
                color: 'rgba(255,255,255,0.35)',
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'var(--c-border)'; }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────── */}
      <div ref={chatContainerRef} className="chat-messages">
        {messages.length === 0 ? (
          <EmptyState onSelect={(txt) => { setInputValue(txt); inputRef.current?.focus(); }} />
        ) : (
          messages.map((msg, idx) => <Message key={idx} msg={msg} idx={idx} />)
        )}

        {isLoading && <TypingIndicator />}
      </div>

      {/* ── Error Banner ────────────────────────────────────── */}
      {error && (
        <div className="error-banner">
          <span style={{ fontWeight: 600 }}>Error · </span>{error}
        </div>
      )}

      {/* ── Input Bar ─────────────────────────────────────── */}
      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder="Tanya tentang sales, stok, revenue…"
          disabled={isLoading}
          rows={1}
          style={{ maxHeight: 96 }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
          }}
        />
        <button
          className="send-btn"
          onClick={() => handleSend()}
          disabled={isLoading || !inputValue.trim()}
          aria-label="Kirim pesan"
        >
          {isLoading
            ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : '↑'}
        </button>
      </div>

      {/* Char counter */}
      {inputValue.length > 400 && (
        <p className="char-counter" style={{ color: charsLeft < 50 ? '#f87171' : 'var(--c-muted)' }}>
          {charsLeft} karakter tersisa
        </p>
      )}

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
