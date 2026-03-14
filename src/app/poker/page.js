'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '@/styles/theme';

// ── Blind Schedule ────────────────────────────────────────────────────────────
const BLIND_SCHEDULE = [
  { level: 1,  sb: 5,   bb: 10   },
  { level: 2,  sb: 10,  bb: 25   },
  { level: 3,  sb: 25,  bb: 50   },
  { level: 4,  sb: 25,  bb: 75   },
  { level: 5,  sb: 50,  bb: 100  },
  { level: 6,  sb: 75,  bb: 150  },
  { level: 7,  sb: 100, bb: 200  },
  { level: 8,  sb: 150, bb: 300  },
  { level: 9,  sb: 200, bb: 500  },
  { level: 10, sb: 250, bb: 500  },
  { level: 11, sb: 500, bb: 1000 },
  { level: 12, sb: 750, bb: 1500 },
];

const STARTING_STACK = [
  { chip: 5,   qty: 10, colour: colors.ribbonRed  },
  { chip: 25,  qty: 6,  colour: colors.deepBlue   },
  { chip: 100, qty: 8,  colour: colors.textGray   },
];

const LEVEL_DURATION = 15 * 60;
const WARN_AT = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPayouts(n) {
  if (n <= 5) return [{ place: '1st', pct: 1.0 }];
  if (n <= 7) return [{ place: '1st', pct: 0.65 }, { place: '2nd', pct: 0.35 }];
  return [{ place: '1st', pct: 0.50 }, { place: '2nd', pct: 0.30 }, { place: '3rd', pct: 0.20 }];
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function formatMoney(v) {
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

// ── Shared style primitives ───────────────────────────────────────────────────
const t = {
  mono: { fontFamily: 'monospace' },
  label: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 3, color: '#8B8B80' },
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [numPlayers,  setNumPlayers]  = useState(6);
  const [playerNames, setPlayerNames] = useState(Array(8).fill('').map((_, i) => `Player ${i + 1}`));
  const [targetHours, setTargetHours] = useState(3);
  const [buyIn,       setBuyIn]       = useState(20);
  const [rebuyWindow, setRebuyWindow] = useState(90);

  const handleNumChange = n => {
    setNumPlayers(n);
    setPlayerNames(prev => {
      const next = [...prev];
      while (next.length < n) next.push(`Player ${next.length + 1}`);
      return next;
    });
  };

  const pill = (active) => ({
    ...t.mono,
    fontSize: 12,
    padding: '5px 9px',
    borderRadius: 3,
    cursor: 'pointer',
    border: active ? `1px solid ${colors.black}` : '1px solid #D1CFC6',
    background: active ? colors.black : colors.cloudDancer,
    color: active ? colors.white : '#374151',
    fontWeight: active ? 'bold' : 'normal',
  });

  return (
    <div style={{ minHeight: '100vh', background: colors.white, maxWidth: 480, margin: '0 auto', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div style={{ background: colors.black, padding: '20px 16px 14px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ color: colors.ribbonRed, fontSize: 22 }}>♠</span>
          <span style={{ ...t.mono, color: colors.white, fontSize: 26, letterSpacing: 10, fontWeight: 'bold' }}>HOLD'EM</span>
          <span style={{ color: colors.ribbonRed, fontSize: 22 }}>♥</span>
        </div>
        <div style={{ ...t.label, marginTop: 4 }}>Home Game Companion</div>
      </div>

      <div style={{ padding: '0 16px 40px' }}>

        {/* Game Settings */}
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ ...t.label, marginBottom: 16 }}>GAME SETTINGS</div>

          {[
            {
              label: 'Players',
              content: (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[2,3,4,5,6,7,8].map(n => (
                    <button key={n} style={pill(numPlayers === n)} onClick={() => handleNumChange(n)}>{n}</button>
                  ))}
                </div>
              ),
            },
            {
              label: 'Duration',
              content: (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[2, 2.5, 3, 3.5, 4].map(h => (
                    <button key={h} style={pill(targetHours === h)} onClick={() => setTargetHours(h)}>{h}h</button>
                  ))}
                </div>
              ),
            },
            {
              label: 'Buy-In',
              content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1CFC6', borderRadius: 3, padding: '5px 10px', background: colors.cloudDancer }}>
                  <span style={{ ...t.mono, fontSize: 13, color: '#8B8B80' }}>$</span>
                  <input style={{ background: 'transparent', border: 'none', color: colors.black, width: 56, fontSize: 14, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }}
                    type="number" value={buyIn} min={5} step={5} onChange={e => setBuyIn(Number(e.target.value))} />
                </div>
              ),
            },
            {
              label: 'Re-buy Window',
              content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1CFC6', borderRadius: 3, padding: '5px 10px', background: colors.cloudDancer }}>
                  <input style={{ background: 'transparent', border: 'none', color: colors.black, width: 56, fontSize: 14, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }}
                    type="number" value={rebuyWindow} min={15} step={15} onChange={e => setRebuyWindow(Number(e.target.value))} />
                  <span style={{ ...t.mono, fontSize: 12, color: '#8B8B80' }}>min</span>
                </div>
              ),
            },
          ].map(({ label, content }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <label style={{ ...t.mono, color: '#374151', fontSize: 13 }}>{label}</label>
              {content}
            </div>
          ))}
        </section>

        {/* Players */}
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ ...t.label, marginBottom: 16 }}>PLAYERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {playerNames.slice(0, numPlayers).map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...t.mono, color: colors.ribbonRed, fontSize: 12, width: 18, fontWeight: 'bold' }}>{i + 1}</span>
                <input
                  style={{ flex: 1, border: '1px solid #D1CFC6', borderRadius: 3, color: colors.black, padding: '7px 10px', fontSize: 14, fontFamily: 'monospace', outline: 'none', background: colors.cloudDancer }}
                  value={name}
                  onChange={e => { const next = [...playerNames]; next[i] = e.target.value; setPlayerNames(next); }}
                  placeholder={`Player ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Starting Stack */}
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ ...t.label, marginBottom: 16 }}>STARTING STACK PER PLAYER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {STARTING_STACK.map(sc => (
              <div key={sc.chip} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: sc.colour, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px dashed rgba(255,255,255,0.4)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span style={{ color: colors.white, fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}>{sc.chip}</span>
                </div>
                <span style={{ color: '#8B8B80', fontSize: 11, fontFamily: 'monospace' }}>×{sc.qty}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 22, fontFamily: 'monospace', fontWeight: 'bold', color: colors.black }}>1,000</span>
              <span style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', color: '#8B8B80', letterSpacing: 1 }}>100 BB at 5/10</span>
            </div>
          </div>
        </section>

        <button
          style={{ width: '100%', background: colors.ribbonRed, border: 'none', color: colors.white, padding: 16, fontSize: 14, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 'bold', borderRadius: 3, cursor: 'pointer', marginTop: 24 }}
          onClick={() => onStart({ numPlayers, playerNames: playerNames.slice(0, numPlayers), targetHours, buyIn, rebuyWindow })}>
          START GAME
        </button>
      </div>
    </div>
  );
}

// ── Game Screen ───────────────────────────────────────────────────────────────
function GameScreen({ config, onEnd }) {
  const { numPlayers, playerNames, buyIn, rebuyWindow } = config;
  const [levelIdx,  setLevelIdx]  = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(LEVEL_DURATION);
  const [elapsed,   setElapsed]   = useState(0);
  const [running,   setRunning]   = useState(true);
  const [flash,     setFlash]     = useState(false);
  const [activeTab, setActiveTab] = useState('timer');
  const [players,   setPlayers]   = useState(playerNames.map(name => ({ name, totalIn: buyIn, rebuys: 0, active: true })));

  const warnedRef   = useRef(false);
  const levelIdxRef = useRef(0);
  levelIdxRef.current = levelIdx;

  const currentBlind  = BLIND_SCHEDULE[levelIdx];
  const nextBlind     = BLIND_SCHEDULE[levelIdx + 1];
  const rebuyOpen     = elapsed < rebuyWindow * 60;
  const totalPot      = players.reduce((sum, p) => sum + p.totalIn, 0);
  const activePlayers = players.filter(p => p.active).length;
  const isWarning     = timeLeft <= WARN_AT;

  const advanceLevel = useCallback(() => {
    const next = levelIdxRef.current + 1;
    if (next < BLIND_SCHEDULE.length) { setLevelIdx(next); playLevelUp(); }
    setTimeLeft(LEVEL_DURATION);
    warnedRef.current = false;
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 0) { advanceLevel(); return LEVEL_DURATION; }
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
  const dash = circ - (((LEVEL_DURATION - timeLeft) / LEVEL_DURATION) * circ);

  const tabs = ['timer', 'players', 'schedule', 'payouts'];

  return (
    <div style={{ minHeight: '100vh', background: flash ? colors.flax : colors.white, transition: 'background 0.4s', maxWidth: 480, margin: '0 auto', fontFamily: 'Georgia, serif' }}>

      {/* Bar */}
      <div style={{ background: colors.black, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
        <span style={{ ...t.mono, color: colors.white, fontSize: 13, letterSpacing: 3 }}>♠ HOLD'EM</span>
        <span style={{ ...t.mono, fontSize: 10, letterSpacing: 1, color: colors.white, padding: '3px 8px', borderRadius: 2, background: rebuyOpen ? colors.piquantGreen : colors.allure }}>
          {rebuyOpen ? 'RE-BUYS OPEN' : 'CLOSED'}
        </span>
        <span style={{ ...t.mono, fontSize: 13, fontWeight: 'bold', color: colors.sandstorm }}>POT: {formatMoney(totalPot)}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `2px solid ${colors.black}` }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, background: colors.white, border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${colors.ribbonRed}` : '2px solid transparent',
            color: activeTab === tab ? colors.ribbonRed : '#8B8B80',
            padding: '10px 0', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, cursor: 'pointer',
            fontWeight: activeTab === tab ? 'bold' : 'normal',
          }}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 40px' }}>

        {/* TIMER */}
        {activeTab === 'timer' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 16 }}>
            <div style={{ ...t.label }}>LEVEL {currentBlind.level} / {BLIND_SCHEDULE.length}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {[{ meta: 'SMALL BLIND', val: currentBlind.sb }, { meta: 'BIG BLIND', val: currentBlind.bb }].map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 9, letterSpacing: 2, fontFamily: 'monospace', color: '#8B8B80' }}>{b.meta}</span>
                  <span style={{ fontSize: 48, fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1, color: isWarning ? colors.ribbonRed : colors.black }}>{b.val}</span>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke={colors.cloudDancer} strokeWidth="7" />
                <circle cx="60" cy="60" r="52" fill="none"
                  stroke={isWarning ? colors.ribbonRed : colors.deepBlue}
                  strokeWidth="7" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
              </svg>
              <span style={{ position: 'absolute', fontSize: 24, fontFamily: 'monospace', fontWeight: 'bold', color: isWarning ? colors.ribbonRed : colors.black }}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {nextBlind && (
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#8B8B80', letterSpacing: 2 }}>
                NEXT: {nextBlind.sb} / {nextBlind.bb}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={() => setRunning(r => !r)}
                style={{ flex: 1, background: colors.black, border: 'none', color: colors.white, padding: 12, fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, borderRadius: 3, cursor: 'pointer', fontWeight: 'bold' }}>
                {running ? '⏸  PAUSE' : '▶  RESUME'}
              </button>
              <button onClick={advanceLevel}
                style={{ flex: 1, background: colors.cloudDancer, border: '1px solid #D1CFC6', color: '#374151', padding: 12, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, borderRadius: 3, cursor: 'pointer' }}>
                SKIP ▶▶
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, color: '#8B8B80', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 }}>
              <span>ELAPSED: {formatTime(elapsed)}</span>
              <span style={{ color: '#D1CFC6' }}>|</span>
              <span>ACTIVE: {activePlayers}</span>
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {activeTab === 'players' && (
          <div style={{ paddingTop: 16 }}>
            {players.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #D1CFC6', opacity: p.active ? 1 : 0.4 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 15, color: colors.black, fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8B8B80', marginTop: 2 }}>
                    {p.rebuys > 0 ? `${p.rebuys} re-buy${p.rebuys > 1 ? 's' : ''}` : 'Original buy-in'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', color: colors.ribbonRed }}>{formatMoney(p.totalIn)}</span>
                  {p.active ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {rebuyOpen && (
                        <button onClick={() => rebuy(i)} style={{ background: colors.white, border: `1px solid ${colors.piquantGreen}`, color: colors.piquantGreen, padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', borderRadius: 2, cursor: 'pointer' }}>
                          + RE-BUY
                        </button>
                      )}
                      <button onClick={() => eliminate(i)} style={{ background: colors.white, border: `1px solid ${colors.allure}`, color: colors.allure, padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', borderRadius: 2, cursor: 'pointer' }}>
                        ✕ OUT
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: colors.allure, fontSize: 11, fontFamily: 'monospace' }}>ELIMINATED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === 'schedule' && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', color: '#8B8B80', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, padding: '6px 10px', borderBottom: '1px solid #D1CFC6', marginBottom: 2 }}>
              <span>LVL</span><span>START</span><span>SB</span><span>BB</span>
            </div>
            {BLIND_SCHEDULE.map((b, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr',
                padding: '8px 10px', borderRadius: 2, fontFamily: 'monospace', fontSize: 13,
                background: i === levelIdx ? colors.cloudDancer : 'transparent',
                borderLeft: `3px solid ${i === levelIdx ? colors.ribbonRed : 'transparent'}`,
              }}>
                <span style={{ color: i === levelIdx ? colors.ribbonRed : '#8B8B80', fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{b.level}</span>
                <span style={{ color: i === levelIdx ? '#374151' : '#8B8B80' }}>{i * 15}m</span>
                <span style={{ color: i === levelIdx ? colors.black : '#374151' }}>{b.sb}</span>
                <span style={{ color: i === levelIdx ? colors.black : '#374151', fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{b.bb}</span>
              </div>
            ))}
          </div>
        )}

        {/* PAYOUTS */}
        {activeTab === 'payouts' && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ padding: '16px 0 12px', borderBottom: '1px solid #D1CFC6', marginBottom: 12 }}>
              <div style={{ fontSize: 32, fontFamily: 'monospace', fontWeight: 'bold', color: colors.black }}>{formatMoney(totalPot)}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#8B8B80', marginTop: 2 }}>{numPlayers} players — {formatMoney(buyIn)} buy-in</div>
            </div>
            {getPayouts(numPlayers).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${colors.cloudDancer}` }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#374151', width: 36 }}>{p.place}</span>
                <div style={{ flex: 1, height: 5, background: colors.cloudDancer, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${p.pct * 100}%`, background: i === 0 ? colors.ribbonRed : i === 1 ? colors.deepBlue : colors.piquantGreen }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', color: colors.black, width: 70, textAlign: 'right' }}>{formatMoney(totalPot * p.pct)}</span>
              </div>
            ))}
            <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#8B8B80', marginTop: 8 }}>Pot updates live as re-buys are added.</p>
            <button
              onClick={() => onEnd(players, totalPot, numPlayers)}
              style={{ width: '100%', background: colors.allure, border: 'none', color: colors.white, padding: 16, fontSize: 14, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 'bold', borderRadius: 3, cursor: 'pointer', marginTop: 16 }}>
              END GAME
            </button>
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
    <div style={{ minHeight: '100vh', background: colors.white, maxWidth: 480, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: colors.black, padding: '20px 16px 14px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ color: colors.ribbonRed, fontSize: 22 }}>♣</span>
          <span style={{ fontFamily: 'monospace', color: colors.white, fontSize: 26, letterSpacing: 10, fontWeight: 'bold' }}>GAME OVER</span>
          <span style={{ color: colors.ribbonRed, fontSize: 22 }}>♦</span>
        </div>
      </div>
      <div style={{ padding: '0 16px 40px' }}>
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ ...t.label, marginBottom: 12 }}>FINAL POT</div>
          <div style={{ fontSize: 36, fontFamily: 'monospace', fontWeight: 'bold', color: colors.black, marginBottom: 16 }}>{formatMoney(totalPot)}</div>
          {payouts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #D1CFC6' }}>
              <span style={{ fontFamily: 'monospace', color: '#8B8B80', fontSize: 12, letterSpacing: 2 }}>{p.place}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 22, color: i === 0 ? colors.ribbonRed : '#374151' }}>{formatMoney(totalPot * p.pct)}</span>
            </div>
          ))}
        </section>
        <section style={{ borderBottom: '1px solid #D1CFC6', padding: '20px 0' }}>
          <div style={{ ...t.label, marginBottom: 12 }}>PLAYER SUMMARY</div>
          {players.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #D1CFC6' }}>
              <span style={{ fontFamily: 'monospace', color: '#374151' }}>{p.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: p.active ? colors.piquantGreen : colors.allure }}>{p.active ? 'ACTIVE' : 'OUT'}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: colors.black }}>{formatMoney(p.totalIn)}</span>
            </div>
          ))}
        </section>
        <button
          onClick={onRestart}
          style={{ width: '100%', background: colors.ribbonRed, border: 'none', color: colors.white, padding: 16, fontSize: 14, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 'bold', borderRadius: 3, cursor: 'pointer', marginTop: 24 }}>
          NEW GAME
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function PokerPage() {
  const [screen,  setScreen]  = useState('setup');
  const [config,  setConfig]  = useState(null);
  const [endData, setEndData] = useState(null);

  if (screen === 'setup') return <SetupScreen onStart={cfg => { setConfig(cfg); setScreen('game'); }} />;
  if (screen === 'game')  return <GameScreen config={config} onEnd={(pl, pot, n) => { setEndData({ players: pl, totalPot: pot, numPlayers: n }); setScreen('end'); }} />;
  if (screen === 'end')   return <EndScreen {...endData} onRestart={() => setScreen('setup')} />;
}
