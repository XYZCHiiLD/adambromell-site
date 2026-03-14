'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bebas_Neue } from 'next/font/google';
import { colors } from '@/styles/theme';

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], display: 'swap' });
const DISPLAY = bebasNeue.style.fontFamily;

// ── Chip data ─────────────────────────────────────────────────────────────────
const CHIP_COL  = { 1:'#E8E8E0', 5:'#C5003E', 25:'#00A878', 100:'#003D6A', 500:'#7B2D8B', 1000:'#F5E6C8' };
const CHIP_TEXT = { 1:'#374151', 5:'#fff',     25:'#fff',    100:'#fff',    500:'#fff',    1000:'#374151'  };
const GOLD = '#D4AF37';

const STACK_PRESETS = {
  10:  [{ chip:5,  qty:10 }, { chip:25,  qty:10 }, { chip:100, qty:2  }, { chip:500,  qty:1 }],
  25:  [{ chip:5,  qty:10 }, { chip:25,  qty:10 }, { chip:100, qty:12 }, { chip:500,  qty:2 }],
  50:  [{ chip:25, qty:8  }, { chip:100, qty:8  }, { chip:500, qty:4  }, { chip:1000, qty:2 }],
  100: [{ chip:25, qty:8  }, { chip:100, qty:12 }, { chip:500, qty:6  }, { chip:1000, qty:2 }],
};

const BLIND_OPTS = [{ sb:5, bb:10 }, { sb:10, bb:25 }, { sb:25, bb:50 }, { sb:50, bb:100 }];

const MASTER = [
  { sb:5,   bb:10   }, { sb:10,  bb:25   }, { sb:25,  bb:50   }, { sb:25,  bb:75   },
  { sb:50,  bb:100  }, { sb:75,  bb:150  }, { sb:100, bb:200  }, { sb:150, bb:300  },
  { sb:200, bb:500  }, { sb:250, bb:500  }, { sb:500, bb:1000 }, { sb:750, bb:1500 },
  { sb:1000,bb:2000 }, { sb:1500,bb:3000 }, { sb:2000,bb:5000 }, { sb:2500,bb:5000 },
];

const BB_IDX    = { 10:0, 25:1, 50:2, 100:4 };
const LVL_DUR   = 15 * 60;
const WARN_AT   = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────
function snapBlind(v) {
  if (v <= 15)  return Math.round(v / 5) * 5;
  if (v <= 100) return Math.round(v / 25) * 25;
  if (v <= 600) return Math.round(v / 100) * 100;
  return Math.round(v / 500) * 500;
}

function genBlinds(bb, hours) {
  const n = Math.round(hours * 60 / 15), start = BB_IDX[bb] || 0, out = [];
  for (let i = 0; i < n; i++) {
    const idx = start + i;
    if (idx < MASTER.length) { out.push({ level: i + 1, ...MASTER[idx] }); }
    else {
      const last = out[out.length - 1];
      const nb = Math.max(snapBlind(last.bb * 1.5), last.bb + 100);
      const ns = Math.max(snapBlind(nb / 2), 5);
      out.push({ level: i + 1, sb: ns, bb: nb });
    }
  }
  return out;
}

function getStack(bb) {
  return (STACK_PRESETS[bb] || STACK_PRESETS[10]).map(c => ({ ...c, colour: CHIP_COL[c.chip], textColour: CHIP_TEXT[c.chip] }));
}
function stackTotal(bb) { return getStack(bb).reduce((s, c) => s + c.chip * c.qty, 0); }
function stackNote(bb) {
  const tot = stackTotal(bb), sb = BLIND_OPTS.find(o => o.bb === bb)?.sb || 0;
  const bbCount = Math.round(tot / bb), limited = bb === 100;
  return {
    label:   limited ? `~${bbCount} BB at ${sb}/${bb}` : `${bbCount} BB at ${sb}/${bb}`,
    warning: limited ? 'Supply limit — chip set cannot reach 100 BB at this level' : null,
  };
}

function getPayoutSplits(n) {
  if (n <= 5) return [{ place: '1st', pct: 1.0 }];
  if (n <= 7) return [{ place: '1st', pct: 0.65 }, { place: '2nd', pct: 0.35 }];
  return [{ place: '1st', pct: 0.50 }, { place: '2nd', pct: 0.30 }, { place: '3rd', pct: 0.20 }];
}

function calcPayouts(numPlayers, totalPot) {
  const splits = getPayoutSplits(numPlayers);
  if (splits.length === 1) return [{ ...splits[0], amount: totalPot }];
  const others = splits.slice(1).map(p => ({ ...p, amount: Math.round(totalPot * p.pct / 5) * 5 }));
  const firstAmount = totalPot - others.reduce((s, p) => s + p.amount, 0);
  return [{ ...splits[0], amount: firstAmount }, ...others];
}

function fmtT(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function fmtM(v) { return `$${Math.round(Number(v))}`; }

// ── Sound ─────────────────────────────────────────────────────────────────────
function playTone(freq, dur, gain, type = 'sine', delay = 0) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = type;
    g.gain.setValueAtTime(gain, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + dur);
  } catch (_) {}
}
function playWarning() { playTone(660, .12, .25, 'sine', 0); playTone(780, .12, .25, 'sine', .18); playTone(880, .2, .3, 'sine', .36); }
function playLevelUp()  { playTone(523, .2, .35, 'triangle', 0); playTone(784, .35, .35, 'triangle', .22); }

// ── Shared primitives ─────────────────────────────────────────────────────────
const pill = active => ({
  fontFamily: 'monospace', fontSize: 12, padding: '6px 11px', borderRadius: 6,
  border: active ? `1px solid ${colors.black}` : '1px solid #D1CFC6',
  background: active ? colors.black : colors.cloudDancer,
  color: active ? colors.white : colors.textGray,
  fontWeight: active ? 'bold' : 'normal', cursor: 'pointer',
});

// ── Nav icons ─────────────────────────────────────────────────────────────────
const ICONS = {
  timer: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>,
  players: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  schedule: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>,
  payouts: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
};

// ── Chip component ────────────────────────────────────────────────────────────
function Chip({ chip, qty, colour, textColour }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: colour,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', border: `3.5px solid ${GOLD}`,
        boxShadow: `0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}>
        <div style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', border: `1.5px dashed rgba(212,175,55,0.5)` }} />
        <span style={{ color: textColour, fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>{chip}</span>
      </div>
      <span style={{ color: '#8B8B80', fontSize: 11, fontFamily: 'monospace' }}>×{qty}</span>
    </div>
  );
}

// ── Bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
  const items = [
    { key: 'timer',    label: 'TIMER'   },
    { key: 'players',  label: 'PLAYERS' },
    { key: 'schedule', label: 'BLINDS'  },
    { key: 'payouts',  label: 'PAYOUTS' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64, background: colors.black,
      display: 'flex', borderTop: '1px solid #222', zIndex: 100,
    }}>
      {items.map(({ key, label }) => (
        <button key={key} onClick={() => setTab(key)} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          background: 'transparent', border: 'none',
          color: tab === key ? colors.ribbonRed : '#555',
          cursor: 'pointer', padding: '8px 0', transition: 'color 0.15s',
        }}>
          {ICONS[key]}
          <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: 1, fontWeight: tab === key ? 'bold' : 'normal' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Setup screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [numPlayers,  setNumPlayers]  = useState(6);
  const [playerNames, setPlayerNames] = useState(Array(8).fill('').map((_, i) => `Player ${i + 1}`));
  const [targetHours, setTargetHours] = useState(3);
  const [buyIn,       setBuyIn]       = useState(20);
  const [rebuyWindow, setRebuyWindow] = useState(90);
  const [startBb,     setStartBb]     = useState(10);

  const handleNumChange = n => {
    setNumPlayers(n);
    setPlayerNames(prev => { const next = [...prev]; while (next.length < n) next.push(`Player ${next.length + 1}`); return next; });
  };

  const stk = getStack(startBb), tot = stackTotal(startBb), note = stackNote(startBb);

  const Card = ({ children }) => (
    <div style={{ background: colors.white, borderRadius: 12, padding: '20px', marginBottom: 16, border: '1px solid #D1CFC6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.cloudDancer, fontFamily: 'Georgia, serif' }}>
      <div style={{ background: colors.black, padding: '28px 20px 22px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(28px,7vw,38px)' }}>♠</span>
          <span style={{ fontFamily: DISPLAY, color: colors.white, fontSize: 'clamp(40px,11vw,60px)', letterSpacing: 10, fontWeight: 'bold' }}>HOLD'EM</span>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(28px,7vw,38px)' }}>♥</span>
        </div>
        <div style={{ color: '#aaa', fontSize: 13, letterSpacing: 4, fontFamily: 'monospace', marginTop: 6, fontWeight: 'bold' }}>HOME GAME COMPANION</div>
      </div>

      <div style={{ padding: '20px 16px 60px', maxWidth: 600, margin: '0 auto' }}>
        <Card>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 18 }}>GAME SETTINGS</div>
          {[
            { label: 'Players',        el: <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{[2,3,4,5,6,7,8].map(n => <button key={n} style={pill(numPlayers===n)} onClick={() => handleNumChange(n)}>{n}</button>)}</div> },
            { label: 'Duration',       el: <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{[2,2.5,3,3.5,4].map(h => <button key={h} style={pill(targetHours===h)} onClick={() => setTargetHours(h)}>{h}h</button>)}</div> },
            { label: 'Starting Blinds',el: <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{BLIND_OPTS.map(o => <button key={o.bb} style={pill(startBb===o.bb)} onClick={() => setStartBb(o.bb)}>{o.sb}/{o.bb}</button>)}</div> },
            { label: 'Buy-In',         el: <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1CFC6', borderRadius: 8, padding: '7px 12px', background: colors.cloudDancer }}><span style={{ color: '#8B8B80', fontFamily: 'monospace', fontSize: 13 }}>$</span><input style={{ background: 'transparent', border: 'none', color: colors.black, width: 60, fontSize: 15, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} type="number" value={buyIn} min={5} step={5} onChange={e => setBuyIn(Number(e.target.value))}/></div> },
            { label: 'Re-buy Window',  el: <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1CFC6', borderRadius: 8, padding: '7px 12px', background: colors.cloudDancer }}><input style={{ background: 'transparent', border: 'none', color: colors.black, width: 50, fontSize: 15, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} type="number" value={rebuyWindow} min={15} step={15} onChange={e => setRebuyWindow(Number(e.target.value))}/><span style={{ color: '#8B8B80', fontFamily: 'monospace', fontSize: 12 }}>min</span></div> },
          ].map(({ label, el }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <label style={{ color: colors.textGray, fontSize: 13, fontFamily: 'monospace' }}>{label}</label>
              {el}
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 16 }}>PLAYERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {playerNames.slice(0, numPlayers).map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: colors.ribbonRed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: colors.white, fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' }}>{i + 1}</span>
                </div>
                <input style={{ flex: 1, border: '1px solid #D1CFC6', borderRadius: 8, color: colors.black, padding: '8px 12px', fontSize: 14, fontFamily: 'monospace', outline: 'none', background: colors.cloudDancer }}
                  value={name}
                  onChange={e => { const next = [...playerNames]; next[i] = e.target.value; setPlayerNames(next); }}
                  placeholder={`Player ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 16 }}>STARTING STACK PER PLAYER</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px,4vw,24px)', flexWrap: 'wrap', marginBottom: 16 }}>
            {stk.map(c => <Chip key={c.chip} {...c} />)}
          </div>
          <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #D1CFC6' }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(32px,8vw,42px)', color: colors.black, letterSpacing: 2 }}>{tot.toLocaleString()}</span>
            <span style={{ display: 'block', fontSize: 12, fontFamily: 'monospace', color: '#8B8B80', marginTop: 2 }}>{note.label}</span>
            {note.warning && <span style={{ display: 'block', fontSize: 10, fontFamily: 'monospace', color: colors.allure, marginTop: 6, lineHeight: 1.5 }}>{note.warning}</span>}
          </div>
        </Card>

        <button style={{
          width: '100%', background: colors.ribbonRed, border: 'none', color: colors.white,
          padding: '18px', fontSize: 14, letterSpacing: 5, fontFamily: 'monospace',
          fontWeight: 'bold', borderRadius: 12, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(197,0,62,0.35)',
        }} onClick={() => onStart({ numPlayers, playerNames: playerNames.slice(0, numPlayers), targetHours, buyIn, rebuyWindow, startBb })}>
          START GAME
        </button>
      </div>
    </div>
  );
}

// ── Game screen ───────────────────────────────────────────────────────────────
function GameScreen({ config, onReset, onEnd }) {
  const { numPlayers, playerNames, buyIn, rebuyWindow, targetHours, startBb } = config;
  const blinds = genBlinds(startBb, targetHours);

  const [levelIdx,  setLevelIdx]  = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(LVL_DUR);
  const [elapsed,   setElapsed]   = useState(0);
  const [running,   setRunning]   = useState(true);
  const [flash,     setFlash]     = useState(false);
  const [levelKey,  setLevelKey]  = useState(0);
  const [tab,       setTab]       = useState('timer');
  const [players,   setPlayers]   = useState(playerNames.map(name => ({ name, totalIn: buyIn, rebuys: 0, active: true })));

  const warnedRef   = useRef(false);
  const levelIdxRef = useRef(0);
  levelIdxRef.current = levelIdx;

  const cur  = blinds[levelIdx] || blinds[blinds.length - 1];
  const nxt  = blinds[levelIdx + 1];
  const rebuyOpen     = elapsed < rebuyWindow * 60;
  const totalPot      = players.reduce((s, p) => s + p.totalIn, 0);
  const activePlayers = players.filter(p => p.active).length;
  const isWarning     = timeLeft <= WARN_AT;
  const payoutData    = calcPayouts(numPlayers, totalPot);

  const advanceLevel = useCallback(() => {
    const next = levelIdxRef.current + 1;
    if (next < blinds.length) { setLevelIdx(next); playLevelUp(); }
    setTimeLeft(LVL_DUR); warnedRef.current = false;
    setFlash(true); setTimeout(() => setFlash(false), 900);
    setLevelKey(k => k + 1);
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

  const rebuy     = i => setPlayers(p => p.map((pl, x) => x === i ? { ...pl, totalIn: pl.totalIn + buyIn, rebuys: pl.rebuys + 1 } : pl));
  const eliminate = i => setPlayers(p => p.map((pl, x) => x === i ? { ...pl, active: false } : pl));

  const circ = 2 * Math.PI * 54;
  const dash = circ - (((LVL_DUR - timeLeft) / LVL_DUR) * circ);

  return (
    <div style={{ minHeight: '100vh', background: colors.black, fontFamily: 'Georgia, serif' }}>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: colors.black, borderBottom: '1px solid #222', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <span style={{ fontFamily: 'monospace', color: colors.white, fontSize: 15, letterSpacing: 3, fontWeight: 'bold' }}>♠ HOLD'EM</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.white, padding: '4px 10px', borderRadius: 20, background: rebuyOpen ? colors.piquantGreen : colors.allure, fontWeight: 'bold', letterSpacing: 1 }}>
          {rebuyOpen ? 'RE-BUYS OPEN' : 'CLOSED'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', color: colors.sandstorm }}>{fmtM(totalPot)}</span>
          <button onClick={onReset} style={{ fontFamily: 'monospace', fontSize: 12, color: '#999', background: 'transparent', border: '1px solid #444', borderRadius: 4, padding: '4px 10px', letterSpacing: 1, cursor: 'pointer', fontWeight: 'bold' }}>RESET</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 64 }}>

        {/* TIMER */}
        {tab === 'timer' && (
          <div style={{
            minHeight: 'calc(100vh - 52px - 64px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(20px,4vh,40px) 20px',
            gap: 'clamp(14px,3vh,24px)',
            background: flash ? colors.flax : colors.cloudDancer,
            transition: 'background 0.4s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 1, background: '#C8C6BC' }} />
              <span style={{ fontSize: 10, letterSpacing: 4, fontFamily: 'monospace', color: '#8B8B80' }}>LEVEL {cur.level} OF {blinds.length}</span>
              <div style={{ width: 40, height: 1, background: '#C8C6BC' }} />
            </div>

            {/* Blind numbers */}
            <div key={levelKey} style={{
              display: 'flex', alignItems: 'center', gap: 'clamp(20px,5vw,48px)',
              animation: 'blindIn 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              {[{ m: 'SB', v: cur.sb }, { m: 'BB', v: cur.bb }].map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 9, letterSpacing: 3, fontFamily: 'monospace', color: '#8B8B80' }}>{b.m}</span>
                  <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(60px,15vw,100px)', lineHeight: 1, color: isWarning ? colors.ribbonRed : colors.black, transition: 'color 0.3s', letterSpacing: 2 }}>{b.v}</span>
                </div>
              ))}
            </div>

            {/* Ring */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="clamp(160px,38vw,210px)" height="clamp(160px,38vw,210px)" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="#D1CFC6" strokeWidth="6" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={isWarning ? colors.ribbonRed : colors.deepBlue} strokeWidth="6"
                  strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
              </svg>
              <span style={{ position: 'absolute', fontFamily: DISPLAY, fontSize: 'clamp(28px,7vw,40px)', color: isWarning ? colors.ribbonRed : colors.black, letterSpacing: 2, transition: 'color 0.3s' }}>{fmtT(timeLeft)}</span>
            </div>

            {nxt && (
              <div style={{ background: colors.white, borderRadius: 8, padding: '8px 20px', border: '1px solid #D1CFC6' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8B8B80', letterSpacing: 2 }}>NEXT &nbsp; {nxt.sb} / {nxt.bb}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 400 }}>
              <button style={{ flex: 1, background: colors.black, border: 'none', color: colors.white, padding: '14px', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setRunning(r => !r)}>{running ? '⏸  PAUSE' : '▶  RESUME'}</button>
              <button style={{ flex: 1, background: colors.white, border: '1px solid #D1CFC6', color: colors.textGray, padding: '14px', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, borderRadius: 10, cursor: 'pointer' }}
                onClick={advanceLevel}>SKIP ▶▶</button>
            </div>

            <div style={{ display: 'flex', gap: 20, background: colors.white, borderRadius: 8, padding: '10px 24px', border: '1px solid #D1CFC6' }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8B8B80' }}><span style={{ color: colors.black, fontWeight: 'bold' }}>{fmtT(elapsed)}</span> ELAPSED</span>
              <span style={{ color: '#D1CFC6' }}>·</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8B8B80' }}><span style={{ color: colors.black, fontWeight: 'bold' }}>{activePlayers}</span> ACTIVE</span>
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {tab === 'players' && (
          <div style={{ padding: '16px', background: colors.cloudDancer, minHeight: 'calc(100vh - 52px - 64px)' }}>
            {players.map((p, i) => (
              <div key={i} style={{ background: colors.white, borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: '1px solid #D1CFC6', opacity: p.active ? 1 : 0.4, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.active ? colors.ribbonRed : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: colors.white, fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>{i + 1}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 15, color: colors.black, fontWeight: 'bold' }}>{p.name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8B8B80', marginTop: 2 }}>
                        {p.rebuys > 0 ? `${p.rebuys} re-buy${p.rebuys > 1 ? 's' : ''}` : 'Original buy-in'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 28, color: p.active ? colors.ribbonRed : '#aaa', letterSpacing: 1, lineHeight: 1 }}>{fmtM(p.totalIn)}</span>
                    {p.active ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {rebuyOpen && <button style={{ background: colors.white, border: `1.5px solid ${colors.piquantGreen}`, color: colors.piquantGreen, padding: '5px 10px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => rebuy(i)}>+ RE-BUY</button>}
                        <button style={{ background: colors.white, border: `1.5px solid ${colors.allure}`, color: colors.allure, padding: '5px 10px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, cursor: 'pointer' }} onClick={() => eliminate(i)}>✕ OUT</button>
                      </div>
                    ) : (
                      <span style={{ color: colors.allure, fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 }}>ELIMINATED</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE */}
        {tab === 'schedule' && (
          <div style={{ padding: '16px', background: colors.cloudDancer, minHeight: 'calc(100vh - 52px - 64px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr', color: '#8B8B80', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, padding: '8px 16px', marginBottom: 6 }}>
              <span>#</span><span>TIME</span><span>SB</span><span>BB</span>
            </div>
            {blinds.map((b, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr',
                padding: '12px 16px', borderRadius: 10, marginBottom: 5,
                background: i === levelIdx ? colors.black : colors.white,
                border: i === levelIdx ? 'none' : '1px solid #D1CFC6',
                opacity: i < levelIdx ? 0.45 : 1,
              }}>
                <span style={{ fontFamily: DISPLAY, fontSize: i === levelIdx ? 28 : 22, letterSpacing: 1, color: i === levelIdx ? colors.ribbonRed : i < levelIdx ? '#aaa' : colors.textGray, alignSelf: 'center', fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{b.level}</span>
                <span style={{ fontFamily: 'monospace', fontSize: i === levelIdx ? 15 : 12, color: i === levelIdx ? '#aaa' : '#8B8B80', alignSelf: 'center', fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{i * 15}m</span>
                <span style={{ fontFamily: 'monospace', fontSize: i === levelIdx ? 17 : 14, fontWeight: 'bold', color: i === levelIdx ? colors.white : i < levelIdx ? '#aaa' : colors.textGray, alignSelf: 'center' }}>{b.sb}</span>
                <span style={{ fontFamily: DISPLAY, fontSize: i === levelIdx ? 28 : 22, letterSpacing: 1, color: i === levelIdx ? colors.white : i < levelIdx ? '#aaa' : colors.black, alignSelf: 'center', fontWeight: i === levelIdx ? 'bold' : 'normal' }}>{b.bb}</span>
              </div>
            ))}
          </div>
        )}

        {/* PAYOUTS */}
        {tab === 'payouts' && (
          <div style={{ padding: '16px', background: colors.cloudDancer, minHeight: 'calc(100vh - 52px - 64px)' }}>
            <div style={{ background: colors.black, borderRadius: 12, padding: '24px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(52px,13vw,72px)', color: colors.white, letterSpacing: 2, lineHeight: 1, fontWeight: 'bold' }}>{fmtM(totalPot)}</div>
              <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#aaa', marginTop: 8, letterSpacing: 1, fontWeight: 'bold' }}>{numPlayers} PLAYERS · {fmtM(buyIn)} BUY-IN</div>
            </div>

            {payoutData.map((p, i) => (
              <div key={i} style={{ background: colors.white, borderRadius: 12, padding: '18px 20px', marginBottom: 10, border: '1px solid #D1CFC6', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? colors.ribbonRed : i === 1 ? colors.deepBlue : colors.piquantGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: colors.white, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 }}>{p.place.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: colors.cloudDancer, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${p.pct * 100}%`, background: i === 0 ? colors.ribbonRed : i === 1 ? colors.deepBlue : colors.piquantGreen }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8B8B80', letterSpacing: 1 }}>{Math.round(p.pct * 100)}% OF POT</span>
                </div>
                <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,8vw,40px)', color: colors.black, letterSpacing: 1, lineHeight: 1 }}>{fmtM(p.amount)}</span>
              </div>
            ))}

            <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#8B8B80', textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
              Rounded to nearest $5 · Updates with re-buys
            </p>

            <button style={{ width: '100%', background: colors.allure, border: 'none', color: colors.white, padding: '16px', fontSize: 14, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 'bold', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}
              onClick={() => onEnd(players, totalPot, numPlayers)}>END GAME</button>
          </div>
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      <style>{`
        @keyframes blindIn {
          0%   { transform: scale(0.82); opacity: 0; }
          65%  { transform: scale(1.07); }
          100% { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── End screen ────────────────────────────────────────────────────────────────
function EndScreen({ players, totalPot, numPlayers, onRestart }) {
  const po = calcPayouts(numPlayers, totalPot);
  return (
    <div style={{ minHeight: '100vh', background: colors.cloudDancer, fontFamily: 'Georgia, serif' }}>
      <div style={{ background: colors.black, padding: '28px 20px 22px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(28px,7vw,38px)' }}>♣</span>
          <span style={{ fontFamily: DISPLAY, color: colors.white, fontSize: 'clamp(40px,11vw,60px)', letterSpacing: 10, fontWeight: 'bold' }}>GAME OVER</span>
          <span style={{ color: colors.ribbonRed, fontSize: 'clamp(28px,7vw,38px)' }}>♦</span>
        </div>
      </div>
      <div style={{ padding: '20px 16px 60px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: colors.black, borderRadius: 12, padding: '28px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: '#aaa', fontFamily: 'monospace', marginBottom: 8, fontWeight: 'bold' }}>FINAL POT</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(58px,15vw,84px)', color: colors.white, letterSpacing: 2, lineHeight: 1, fontWeight: 'bold' }}>{fmtM(totalPot)}</div>
        </div>

        {po.map((p, i) => (
          <div key={i} style={{ background: colors.white, borderRadius: 12, padding: '18px 20px', marginBottom: 10, border: '1px solid #D1CFC6', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? colors.ribbonRed : i === 1 ? colors.deepBlue : colors.piquantGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: colors.white, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}>{p.place.toUpperCase()}</span>
            </div>
            <span style={{ fontFamily: 'monospace', color: '#8B8B80', fontSize: 12, flex: 1, letterSpacing: 1 }}>{p.place}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,8vw,40px)', color: i === 0 ? colors.ribbonRed : colors.black, letterSpacing: 1, lineHeight: 1 }}>{fmtM(p.amount)}</span>
          </div>
        ))}

        <div style={{ background: colors.white, borderRadius: 12, padding: '18px 20px', marginBottom: 16, marginTop: 8, border: '1px solid #D1CFC6' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8B8B80', fontFamily: 'monospace', marginBottom: 14 }}>PLAYER SUMMARY</div>
          {players.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < players.length - 1 ? '1px solid #F0EEE4' : 'none' }}>
              <span style={{ fontFamily: 'monospace', color: colors.textGray, fontSize: 13 }}>{p.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: p.active ? colors.piquantGreen : colors.allure, letterSpacing: 1 }}>{p.active ? 'ACTIVE' : 'OUT'}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: colors.black, fontSize: 13 }}>{fmtM(p.totalIn)}</span>
            </div>
          ))}
        </div>

        <button style={{ width: '100%', background: colors.ribbonRed, border: 'none', color: colors.white, padding: '18px', fontSize: 14, letterSpacing: 5, fontFamily: 'monospace', fontWeight: 'bold', borderRadius: 12, cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 14px rgba(197,0,62,0.35)' }} onClick={onRestart}>NEW GAME</button>
        <button style={{ width: '100%', background: colors.white, border: '1px solid #D1CFC6', color: colors.black, padding: '16px', fontSize: 14, letterSpacing: 5, fontFamily: 'monospace', fontWeight: 'bold', borderRadius: 12, cursor: 'pointer' }} onClick={onRestart}>RESET</button>
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
  if (screen === 'game')  return <GameScreen  config={config} onReset={reset} onEnd={(pl, pot, n) => { setEndData({ players: pl, totalPot: pot, numPlayers: n }); setScreen('end'); }} />;
  if (screen === 'end')   return <EndScreen   {...endData} onRestart={reset} />;
}
