'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '@/styles/theme';

// ── Constants ─────────────────────────────────────────────────────────────────
const CHIP_COL = { 5: colors.ribbonRed, 25: colors.deepBlue, 100: colors.textGray, 500: colors.piquantGreen, 1000: colors.flax };

const STACK_PRESETS = {
  10:  [{ chip: 5,   qty: 10 }, { chip: 25,  qty: 6 }, { chip: 100, qty: 8  }],
  25:  [{ chip: 25,  qty: 4  }, { chip: 100, qty: 4 }, { chip: 500, qty: 4  }],
  50:  [{ chip: 100, qty: 10 }, { chip: 500, qty: 4 }, { chip: 1000, qty: 2 }],
  100: [{ chip: 100, qty: 10 }, { chip: 500, qty: 6 }, { chip: 1000, qty: 6 }],
};

const BLIND_OPTS = [
  { sb: 5,  bb: 10  },
  { sb: 10, bb: 25  },
  { sb: 25, bb: 50  },
  { sb: 50, bb: 100 },
];

const MASTER = [
  { sb: 5,    bb: 10   }, { sb: 10,   bb: 25   }, { sb: 25,   bb: 50   },
  { sb: 25,   bb: 75   }, { sb: 50,   bb: 100  }, { sb: 75,   bb: 150  },
  { sb: 100,  bb: 200  }, { sb: 150,  bb: 300  }, { sb: 200,  bb: 500  },
  { sb: 250,  bb: 500  }, { sb: 500,  bb: 1000 }, { sb: 750,  bb: 1500 },
  { sb: 1000, bb: 2000 }, { sb: 1500, bb: 3000 }, { sb: 2000, bb: 5000 },
  { sb: 2500, bb: 5000 },
];

const BB_IDX = { 10: 0, 25: 1, 50: 2, 100: 4 };
const LVL_DUR = 15 * 60;
const WARN_AT = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────
function snapBlind(v) {
  if (v <= 15)  return Math.round(v / 5) * 5;
  if (v <= 100) return Math.round(v / 25) * 25;
  if (v <= 600) return Math.round(v / 100) * 100;
  return Math.round(v / 500) * 500;
}

function genBlinds(bb, hours) {
  const n     = Math.round(hours * 60 / 15);
  const start = BB_IDX[bb] || 0;
  const out   = [];
  for (let i = 0; i < n; i++) {
    const idx = start + i;
    if (idx < MASTER.length) {
      out.push({ level: i + 1, ...MASTER[idx] });
    } else {
      const last = out[out.length - 1];
      const nb   = Math.max(snapBlind(last.bb * 1.5), last.bb + 100);
      const ns   = Math.max(snapBlind(nb / 2), 5);
      out.push({ level: i + 1, sb: ns, bb: nb });
    }
  }
  return out;
}

function getStack(bb) {
  return (STACK_PRESETS[bb] || STACK_PRESETS[10]).map(c => ({ ...c, colour: CHIP_COL[c.chip] }));
}

function stackTotal(bb) {
  return getStack(bb).reduce((s, c) => s + c.chip * c.qty, 0);
}

function getPayouts(n) {
  if (n <= 5) return [{ place: '1st', pct: 1.0 }];
  if (n <= 7) return [{ place: '1st', pct: 0.65 }, { place: '2nd', pct: 0.35 }];
  return [{ place: '1st', pct: 0.50 }, { place: '2nd', pct: 0.30 }, { place: '3rd', pct: 0.20 }];
}

function fmtT(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function fmtM(v) {
  return `$${Number(v).toFixed(2).replace(/\.00$/, '')}`;
}

// ── Sound ─────────────────────────────────────────────────────────────────────
function playTone(freq, dur, gain, type = 'sine', delay = 0) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = type;
    g.gain.setValueAtTime(gain, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur);
  } catch (_) {}
}

function playWarning() {
  playTone(660, 0.12, 0.25, 'sine', 0);
  playTone(780, 0.12, 0.25, 'sine', 0.18);
  playTone(880, 0.20, 0.30, 'sine', 0.36);
}

function playLevelUp() {
  playTone(523, 0.20, 0.35, 'triangle', 0);
  playTone(784, 0.35, 0.35, 'triangle', 0.22);
}

// ── Shared primitives ─────────────────────────────────────────────────────────
const pill = (active) => ({
  fontFamily: 'monospace',
  fontSize: 13,
  padding: '6px 12px',
  borderRadius: 3,
  border: active ? `1px solid ${colors.black}` : '1px solid #D1CFC6',
  background: active ? colors.black : colors.cloudDancer,
  color: active ? colors.white : colors.textGray,
  fontWeight: active ? 'bold' : 'normal',
  cursor: 'pointer',
});

const baseBtn = {
  width: '100%',
  border: 'none',
  padding: 16,
  fontSize: 14,
  letterSpacing: 4,
  fontFamily: 'monospace',
  fontWeight: 'bold',
  borderRadius: 3,
  cursor: 'pointer',
  marginTop: 12,
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [numPlayers,  setNumPlayers]  = useState(6);
  const [playerNames, setPlayerNames] = useState(Array(8).fill('').map((_, i) => `Player ${i + 1}`));
  const [targetHours, setTargetHours] = useState(3);
  const [buyIn,       setBuyIn]       = useState(20);
  const [rebuyWindow, setRebuyWindow] = useState(90);
  const [startBb,     setStartBb]     = useState(10);

  const handleNumChange = n => {
    setNumPlayers(n);
    setPlayerNames(prev => {
      const next = [...prev];
      while (next.length < n) next.push(`Player ${next.length + 1}`);
      return next;
    });
  };

  const stk = getStack(startBb);
  const tot = stackTotal(startBb);
  const sb  = BLIND_OPTS.find(o => o.bb === startBb)?.sb || 5;

  return (
    <div style={{ minHeight: '100vh', background: colors.white, maxWidth: 640, margin: '0 auto', fontFamily: 'Georgia, serif' }}>

      <div style={{ background: colors.black, padding: 'clamp(14px, 4vw, 24px) clamp(16px, 5vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(18px, 5vw, 26px)' }}>♠</span>
          <span style={{ fontFamily: 'monospace', color: colors.white, fontSize: 'clamp(20px, 6vw, 28px)', letterSpacing: 8, fontWeight: 'bold' }}>HOLD'EM</span>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(18px, 5vw, 26px)' }}>♥</span>
        </div>
        <div style={{ color: '#8B8B80', fontSize: 11, letterSpacing: 3, fontFamily: 'monospace', marginTop: 4, textAlign: 'center' }}>Home Game Companion</div>
      </div>

      <div style={{ padding: '0 clamp(16px, 5vw, 32px) 48px' }}>

        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 16 }}>GAME SETTINGS</div>

          {[
            { label: 'Players', content: <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{[2,3,4,5,6,7,8].map(n => <button key={n} style={pill(numPlayers === n)} onClick={() => handleNumChange(n)}>{n}</button>)}</div> },
            { label: 'Duration', content: <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{[2, 2.5, 3, 3.5, 4].map(h => <button key={h} style={pill(targetHours === h)} onClick={() => setTargetHours(h)}>{h}h</button>)}</div> },
            { label: 'Starting Blinds', content: <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{BLIND_OPTS.map(o => <button key={o.bb} style={pill(startBb === o.bb)} onClick={() => setStartBb(o.bb)}>{o.sb}/{o.bb}</button>)}</div> },
            { label: 'Buy-In', content: <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1CFC6', borderRadius: 3, padding: '6px 12px', background: colors.cloudDancer }}><span style={{ color: '#8B8B80', fontFamily: 'monospace', fontSize: 13 }}>$</span><input style={{ background: 'transparent', border: 'none', color: colors.black, width: 60, fontSize: 15, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} type="number" value={buyIn} min={5} step={5} onChange={e => setBuyIn(Number(e.target.value))} /></div> },
            { label: 'Re-buy Window', content: <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1CFC6', borderRadius: 3, padding: '6px 12px', background: colors.cloudDancer }}><input style={{ background: 'transparent', border: 'none', color: colors.black, width: 60, fontSize: 15, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} type="number" value={rebuyWindow} min={15} step={15} onChange={e => setRebuyWindow(Number(e.target.value))} /><span style={{ color: '#8B8B80', fontFamily: 'monospace', fontSize: 12 }}>min</span></div> },
          ].map(({ label, content }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <label style={{ color: colors.textGray, fontSize: 'clamp(12px, 3vw, 14px)', fontFamily: 'monospace' }}>{label}</label>
              {content}
            </div>
          ))}
        </section>

        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 16 }}>PLAYERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {playerNames.slice(0, numPlayers).map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: colors.ribbonRed, fontSize: 13, fontFamily: 'monospace', width: 20, fontWeight: 'bold' }}>{i + 1}</span>
                <input
                  style={{ flex: 1, border: '1px solid #D1CFC6', borderRadius: 3, color: colors.black, padding: '8px 12px', fontSize: 15, fontFamily: 'monospace', outline: 'none', background: colors.cloudDancer }}
                  value={name}
                  onChange={e => { const next = [...playerNames]; next[i] = e.target.value; setPlayerNames(next); }}
                  placeholder={`Player ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </section>

        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 16 }}>STARTING STACK PER PLAYER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {stk.map(sc => (
              <div key={sc.chip} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: sc.colour, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px dashed rgba(255,255,255,0.4)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span style={{ color: colors.white, fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' }}>{sc.chip}</span>
                </div>
                <span style={{ color: '#8B8B80', fontSize: 11, fontFamily: 'monospace' }}>×{sc.qty}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 'clamp(20px, 5vw, 26px)', fontFamily: 'monospace', fontWeight: 'bold', color: colors.black }}>{tot.toLocaleString()}</span>
              <span style={{ display: 'block', fontSize: 12, fontFamily: 'monospace', color: '#8B8B80', letterSpacing: 1 }}>100 BB at {sb}/{startBb}</span>
            </div>
          </div>
        </section>

        <button style={{ ...baseBtn, background: colors.ribbonRed, color: colors.white }}
          onClick={() => onStart({ numPlayers, playerNames: playerNames.slice(0, numPlayers), targetHours, buyIn, rebuyWindow, startBb })}>
          START GAME
        </button>
      </div>
    </div>
  );
}

// ── Game Screen ───────────────────────────────────────────────────────────────
function GameScreen({ config, onReset, onEnd }) {
  const { numPlayers, playerNames, buyIn, rebuyWindow, targetHours, startBb } = config;
  const blinds = genBlinds(startBb, targetHours);

  const [levelIdx,  setLevelIdx]  = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(LVL_DUR);
  const [elapsed,   setElapsed]   = useState(0);
  const [running,   setRunning]   = useState(true);
  const [flash,     setFlash]     = useState(false);
  const [activeTab, setActiveTab] = useState('timer');
  const [players,   setPlayers]   = useState(playerNames.map(name => ({ name, totalIn: buyIn, rebuys: 0, active: true })));

  const warnedRef   = useRef(false);
  const levelIdxRef = useRef(0);
  levelIdxRef.current = levelIdx;

  const currentBlind  = blinds[levelIdx] || blinds[blinds.length - 1];
  const nextBlind     = blinds[levelIdx + 1];
  const rebuyOpen     = elapsed < rebuyWindow * 60;
  const totalPot      = players.reduce((sum, p) => sum + p.totalIn, 0);
  const activePlayers = players.filter(p => p.active).length;
  const isWarning     = timeLeft <= WARN_AT;

  const advanceLevel = useCallback(() => {
    const next = levelIdxRef.current + 1;
    if (next < blinds.length) { setLevelIdx(next); playLevelUp(); }
    setTimeLeft(LVL_DUR);
    warnedRef.current = false;
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
  }, [blinds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 0) { advanceLevel(); return LVL_DUR; }
        if (next === WARN_AT && !warnedRef.current) { warnedRef.current = true; playWarning(); }
        return next;
      });
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running, advanceLevel]);

  const rebuy     = i => setPlayers(p => p.map((pl, idx) => idx === i ? { ...pl, totalIn: pl.totalIn + buyIn, rebuys: pl.rebuys + 1 } : pl));
  const eliminate = i => setPlayers(p => p.map((pl, idx) => idx === i ? { ...pl, active: false } : pl));

  const circ = 2 * Math.PI * 52;
  const dash = circ - (((LVL_DUR - timeLeft) / LVL_DUR) * circ);

  return (
    <div style={{ minHeight: '100vh', background: flash ? colors.flax : colors.white, transition: 'background 0.4s', maxWidth: 640, margin: '0 auto', fontFamily: 'Georgia, serif' }}>

      <div style={{ background: colors.black, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px clamp(12px, 4vw, 20px)' }}>
        <span style={{ fontFamily: 'monospace', color: colors.white, fontSize: 'clamp(11px, 3vw, 14px)', letterSpacing: 3 }}>♠ HOLD'EM</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, color: colors.white, padding: '3px 8px', borderRadius: 2, background: rebuyOpen ? colors.piquantGreen : colors.allure }}>
          {rebuyOpen ? 'RE-BUYS OPEN' : 'CLOSED'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 'clamp(11px, 3vw, 14px)', fontWeight: 'bold', color: colors.sandstorm }}>POT: {fmtM(totalPot)}</span>
          <button onClick={onReset} style={{ fontFamily: 'monospace', fontSize: 10, color: '#8B8B80', background: 'transparent', border: '1px solid #444', borderRadius: 2, padding: '3px 8px', letterSpacing: 1, cursor: 'pointer' }}>RESET</button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: `2px solid ${colors.black}` }}>
        {['timer', 'players', 'schedule', 'payouts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, background: colors.white, border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${colors.ribbonRed}` : '2px solid transparent',
            color: activeTab === tab ? colors.ribbonRed : '#8B8B80',
            padding: '11px 0', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, cursor: 'pointer',
            fontWeight: activeTab === tab ? 'bold' : 'normal',
          }}>{tab.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ padding: '0 clamp(16px, 5vw, 32px) 48px' }}>

        {activeTab === 'timer' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(16px, 4vw, 32px) 0', gap: 'clamp(12px, 3vw, 20px)' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, fontFamily: 'monospace', color: '#8B8B80' }}>
              LEVEL {currentBlind.level} / {blinds.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 4vw, 28px)' }}>
              {[{ m: 'SMALL BLIND', v: currentBlind.sb }, { m: 'BIG BLIND', v: currentBlind.bb }].map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, fontFamily: 'monospace', color: '#8B8B80' }}>{b.m}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1, fontSize: 'clamp(36px, 9vw, 68px)', color: isWarning ? colors.ribbonRed : colors.black }}>{b.v}</span>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', width: 'clamp(120px, 28vw, 180px)', height: 'clamp(120px, 28vw, 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="64" cy="64" r="52" fill="none" stroke={colors.cloudDancer} strokeWidth="7" />
                <circle cx="64" cy="64" r="52" fill="none"
                  stroke={isWarning ? colors.ribbonRed : colors.deepBlue}
                  strokeWidth="7" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
              </svg>
              <span style={{ position: 'absolute', fontSize: 'clamp(20px, 5vw, 30px)', fontFamily: 'monospace', fontWeight: 'bold', color: isWarning ? colors.ribbonRed : colors.black }}>
                {fmtT(timeLeft)}
              </span>
            </div>
            {nextBlind && <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#8B8B80', letterSpacing: 2 }}>NEXT: {nextBlind.sb} / {nextBlind.bb}</div>}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button style={{ flex: 1, background: colors.black, border: 'none', color: colors.white, padding: 13, fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, borderRadius: 3, cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setRunning(r => !r)}>{running ? '⏸  PAUSE' : '▶  RESUME'}</button>
              <button style={{ flex: 1, background: colors.cloudDancer, border: '1px solid #D1CFC6', color: colors.textGray, padding: 13, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, borderRadius: 3, cursor: 'pointer' }}
                onClick={advanceLevel}>SKIP ▶▶</button>
            </div>
            <div style={{ display: 'flex', gap: 14, color: '#8B8B80', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 }}>
              <span>ELAPSED: {fmtT(elapsed)}</span>
              <span style={{ color: '#D1CFC6' }}>|</span>
              <span>ACTIVE: {activePlayers}</span>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div style={{ paddingTop: 16 }}>
            {players.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #D1CFC6', opacity: p.active ? 1 : 0.4 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 'clamp(13px, 3vw, 16px)', color: colors.black, fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8B8B80', marginTop: 3 }}>
                    {p.rebuys > 0 ? `${p.rebuys} re-buy${p.rebuys > 1 ? 's' : ''}` : 'Original buy-in'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 'clamp(14px, 3vw, 17px)', fontWeight: 'bold', color: colors.ribbonRed }}>{fmtM(p.totalIn)}</span>
                  {p.active ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {rebuyOpen && <button style={{ background: colors.white, border: `1px solid ${colors.piquantGreen}`, color: colors.piquantGreen, padding: '5px 10px', fontSize: 11, fontFamily: 'monospace', borderRadius: 2, cursor: 'pointer' }} onClick={() => rebuy(i)}>+ RE-BUY</button>}
                      <button style={{ background: colors.white, border: `1px solid ${colors.allure}`, color: colors.allure, padding: '5px 10px', fontSize: 11, fontFamily: 'monospace', borderRadius: 2, cursor: 'pointer' }} onClick={() => eliminate(i)}>✕ OUT</button>
                    </div>
                  ) : (
                    <span style={{ color: colors.allure, fontSize: 11, fontFamily: 'monospace' }}>ELIMINATED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', color: '#8B8B80', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, padding: '6px 10px', borderBottom: '1px solid #D1CFC6', marginBottom: 2 }}>
              <span>LVL</span><span>START</span><span>SB</span><span>BB</span>
            </div>
            {blinds.map((b, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '9px 10px', borderRadius: 2, fontFamily: 'monospace', fontSize: 'clamp(12px, 3vw, 14px)', background: i === levelIdx ? colors.cloudDancer : 'transparent', borderLeft: `3px solid ${i === levelIdx ? colors.ribbonRed : 'transparent'}` }}>
                <span style={{ color: i === levelIdx ? colors.ribbonRed : '#8B8B80', fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{b.level}</span>
                <span style={{ color: i === levelIdx ? colors.textGray : '#8B8B80' }}>{i * 15}m</span>
                <span style={{ color: i === levelIdx ? colors.black : colors.textGray }}>{b.sb}</span>
                <span style={{ color: i === levelIdx ? colors.black : colors.textGray, fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{b.bb}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ padding: '16px 0 12px', borderBottom: '1px solid #D1CFC6', marginBottom: 12 }}>
              <div style={{ fontSize: 'clamp(24px, 6vw, 34px)', fontFamily: 'monospace', fontWeight: 'bold', color: colors.black }}>{fmtM(totalPot)}</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#8B8B80', marginTop: 2 }}>{numPlayers} players — {fmtM(buyIn)} buy-in</div>
            </div>
            {getPayouts(numPlayers).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${colors.cloudDancer}` }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: colors.textGray, width: 36 }}>{p.place}</span>
                <div style={{ flex: 1, height: 5, background: colors.cloudDancer, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${p.pct * 100}%`, background: i === 0 ? colors.ribbonRed : i === 1 ? colors.deepBlue : colors.piquantGreen }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 'bold', color: colors.black, width: 72, textAlign: 'right' }}>{fmtM(totalPot * p.pct)}</span>
              </div>
            ))}
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8B8B80', marginTop: 10 }}>Pot updates live as re-buys are added.</p>
            <button style={{ ...baseBtn, background: colors.allure, color: colors.white }}
              onClick={() => onEnd(players, totalPot, numPlayers)}>END GAME</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── End Screen ────────────────────────────────────────────────────────────────
function EndScreen({ players, totalPot, numPlayers, onRestart }) {
  const payouts = getPayouts(numPlayers);
  return (
    <div style={{ minHeight: '100vh', background: colors.white, maxWidth: 640, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: colors.black, padding: 'clamp(14px, 4vw, 24px) clamp(16px, 5vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(18px, 5vw, 26px)' }}>♣</span>
          <span style={{ fontFamily: 'monospace', color: colors.white, fontSize: 'clamp(20px, 6vw, 28px)', letterSpacing: 8, fontWeight: 'bold' }}>GAME OVER</span>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(18px, 5vw, 26px)' }}>♦</span>
        </div>
      </div>
      <div style={{ padding: '0 clamp(16px, 5vw, 32px) 48px' }}>
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 12 }}>FINAL POT</div>
          <div style={{ fontSize: 'clamp(28px, 7vw, 40px)', fontFamily: 'monospace', fontWeight: 'bold', color: colors.black, marginBottom: 16 }}>{fmtM(totalPot)}</div>
          {payouts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid #D1CFC6' }}>
              <span style={{ fontFamily: 'monospace', color: '#8B8B80', fontSize: 12, letterSpacing: 2 }}>{p.place}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 'clamp(18px, 5vw, 24px)', color: i === 0 ? colors.ribbonRed : colors.textGray }}>{fmtM(totalPot * p.pct)}</span>
            </div>
          ))}
        </section>
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 12 }}>PLAYER SUMMARY</div>
          {players.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #D1CFC6' }}>
              <span style={{ fontFamily: 'monospace', color: colors.textGray, fontSize: 'clamp(12px, 3vw, 15px)' }}>{p.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: p.active ? colors.piquantGreen : colors.allure }}>{p.active ? 'ACTIVE' : 'OUT'}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: colors.black, fontSize: 'clamp(12px, 3vw, 15px)' }}>{fmtM(p.totalIn)}</span>
            </div>
          ))}
        </section>
        <button style={{ ...baseBtn, background: colors.ribbonRed, color: colors.white }} onClick={onRestart}>NEW GAME</button>
        <button style={{ ...baseBtn, background: colors.white, color: colors.black, border: '1px solid #D1CFC6' }} onClick={onRestart}>RESET</button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function PokerPage() {
  const [screen,  setScreen]  = useState('setup');
  const [config,  setConfig]  = useState(null);
  const [endData, setEndData] = useState(null);

  const reset = () => setScreen('setup');

  if (screen === 'setup') return <SetupScreen onStart={cfg => { setConfig(cfg); setScreen('game'); }} />;
  if (screen === 'game')  return <GameScreen config={config} onReset={reset} onEnd={(pl, pot, n) => { setEndData({ players: pl, totalPot: pot, numPlayers: n }); setScreen('end'); }} />;
  if (screen === 'end')   return <EndScreen {...endData} onRestart={reset} />;
}
