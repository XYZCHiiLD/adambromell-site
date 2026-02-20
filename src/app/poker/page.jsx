'use client';

import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Plus, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";

// ─── DESIGN TOKENS — adambromell.info ───────────────────────────────────────
const C = {
  // Surfaces
  bg:        "#ffffff",        // page background (site white)
  surface:   "#f5f1ec",        // card / panel surface (warm off-white)
  input:     "#ede8e1",        // input / stepper backgrounds
  border:    "#d4ccc3",        // all borders

  // Text
  text:      "#111111",        // primary text
  muted:     "#888888",        // secondary / label text
  faint:     "#bbbbbb",        // placeholder / disabled

  // Brand
  ribbon:    "#C5003E",        // Ribbon Red — primary accent
  sandstorm: "#D89B6A",        // Sandstorm — warm secondary / warning
  allure:    "#94C5CC",        // Allure — info / add-ons
  deepBlue:  "#1F3B73",        // Deep Blue — structural
};

// ─── CHIP BADGE COLORS ───────────────────────────────────────────────────────
const CHIP_COLORS = {
  1:    { bg: "#ffffff",    text: "#111111", border: C.border },
  5:    { bg: C.ribbon,     text: "#ffffff", border: "transparent" },
  25:   { bg: C.deepBlue,   text: "#ffffff", border: "transparent" },
  100:  { bg: "#4b5563",    text: "#ffffff", border: "transparent" },
  500:  { bg: "#7c3aed",    text: "#ffffff", border: "transparent" },
  1000: { bg: C.sandstorm,  text: "#111111", border: "transparent" },
};

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
const INIT_CONFIG = {
  numPlayers: 8,
  buyIn: 20,
  allowAddOns: true,
  addOnAmount: 20,
  addOnCutoffLevel: 4,
  chipSet: [
    { denom: 1,    qty: 100 },
    { denom: 5,    qty: 150 },
    { denom: 25,   qty: 100 },
    { denom: 100,  qty: 100 },
    { denom: 500,  qty: 25  },
    { denom: 1000, qty: 25  },
  ],
  startingStack: [
    { denom: 1,   qty: 10 },
    { denom: 5,   qty: 8  },
    { denom: 25,  qty: 10 },
    { denom: 100, qty: 12 },
  ],
  blindStructure: [
    { id: 1, sb: 25,  bb: 50,   duration: 15 },
    { id: 2, sb: 50,  bb: 100,  duration: 15 },
    { id: 3, sb: 75,  bb: 150,  duration: 15 },
    { id: 4, sb: 100, bb: 200,  duration: 15 },
    { id: 5, sb: 150, bb: 300,  duration: 15 },
    { id: 6, sb: 200, bb: 400,  duration: 15 },
    { id: 7, sb: 300, bb: 600,  duration: 15 },
    { id: 8, sb: 500, bb: 1000, duration: 15 },
  ],
  colorUp: [
    { levelIdx: 4, denoms: [1, 5] },
    { levelIdx: 6, denoms: [25]   },
  ],
  playerNames: [],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1000) { const k = n / 1000; return k === Math.floor(k) ? `${k}K` : `${k.toFixed(1)}K`; }
  return String(n);
}
function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function stackTotal(stack) {
  return stack.reduce((sum, s) => sum + s.denom * s.qty, 0);
}

const SERIF   = "'Crimson Text', Georgia, serif";
const DISPLAY = "'TAYBigBird', 'Crimson Text', Georgia, serif";
const MONO    = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace";

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function PokerPage() {
  const [screen, setScreen] = useState("setup");
  const [config, setConfig] = useState(INIT_CONFIG);
  const [gs, setGs]         = useState(null);

  function startGame(cfg) {
    const players = Array.from({ length: cfg.numPlayers }, (_, i) => ({
      id: i,
      name: cfg.playerNames[i]?.trim() || `Seat ${i + 1}`,
      status: "active",
      addOns: 0,
    }));
    setConfig(cfg);
    setGs({ players, levelIdx: 0, timeRemaining: cfg.blindStructure[0].duration * 60, isRunning: false, alert: null });
    setScreen("live");
  }

  if (screen === "setup") return <SetupScreen initCfg={config} onStart={startGame} />;
  return <LiveScreen config={config} gs={gs} setGs={setGs} onBack={() => setScreen("setup")} />;
}

// ─── SETUP SCREEN ────────────────────────────────────────────────────────────
function SetupScreen({ initCfg, onStart }) {
  const [tab, setTab]               = useState("game");
  const [cfg, setCfg]               = useState(initCfg);
  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: initCfg.numPlayers }, (_, i) => initCfg.playerNames?.[i] || "")
  );

  function setNumPlayers(n) {
    const v = Math.max(2, Math.min(20, n));
    setCfg(c => ({ ...c, numPlayers: v }));
    setPlayerNames(prev => {
      const arr = [...prev];
      while (arr.length < v) arr.push("");
      return arr.slice(0, v);
    });
  }

  const stackVal = stackTotal(cfg.startingStack);
  const maxSets  = cfg.numPlayers * (cfg.allowAddOns ? 2 : 1);
  const warnings = cfg.chipSet.reduce((acc, chip) => {
    const se   = cfg.startingStack.find(s => s.denom === chip.denom);
    const need = (se?.qty || 0) * maxSets;
    if (need > chip.qty) acc.push(`$${chip.denom}: need ${need}, have ${chip.qty}`);
    return acc;
  }, []);

  const TABS = [
    { id: "game",   label: "Game"   },
    { id: "chips",  label: "Chips"  },
    { id: "blinds", label: "Blinds" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ maxWidth: 480, margin: "0 auto", background: C.bg, color: C.text }}>

      <div className="px-5 pt-8 pb-3">
        <h1 className="leading-none mb-1" style={{ fontFamily: DISPLAY, fontSize: "2rem", color: C.ribbon }}>
          Tournament Companion
        </h1>
        <p style={{ fontFamily: SERIF, color: C.muted, fontSize: "0.85rem" }}>
          Configure before you deal
        </p>
      </div>

      <div className="flex px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="mr-6 py-2.5 text-sm border-b-2 transition-colors"
            style={{ fontFamily: SERIF, fontWeight: 600, borderBottomColor: tab === t.id ? C.ribbon : "transparent", color: tab === t.id ? C.ribbon : C.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-40 space-y-4">
        {tab === "game"   && <GameTab cfg={cfg} setCfg={setCfg} playerNames={playerNames} setPlayerNames={setPlayerNames} setNumPlayers={setNumPlayers} />}
        {tab === "chips"  && <ChipsTab cfg={cfg} setCfg={setCfg} stackVal={stackVal} />}
        {tab === "blinds" && <BlindsTab cfg={cfg} setCfg={setCfg} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 py-4"
        style={{ maxWidth: 480, margin: "0 auto", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        {warnings.length > 0 && (
          <div className="mb-3 p-3 rounded-xl" style={{ background: "#fef8f2", border: `1px solid ${C.sandstorm}` }}>
            <p className="text-xs font-bold mb-1" style={{ fontFamily: SERIF, color: C.sandstorm }}>⚠ Chip shortage (worst-case with add-ons)</p>
            {warnings.map((w, i) => <p key={i} className="text-xs" style={{ fontFamily: SERIF, color: C.sandstorm }}>{w}</p>)}
          </div>
        )}
        <button onClick={() => onStart({ ...cfg, playerNames })}
          className="w-full py-4 rounded-2xl active:scale-95 transition-all"
          style={{ background: C.ribbon, color: "#fff", fontFamily: SERIF, fontWeight: 700, fontSize: "1.1rem" }}>
          Start Game →
        </button>
      </div>
    </div>
  );
}

// ── Game Tab ──────────────────────────────────────────────────────────────────
function GameTab({ cfg, setCfg, playerNames, setPlayerNames, setNumPlayers }) {
  return (
    <>
      <Card title="Players">
        <Row label="Number of Players"><Stepper value={cfg.numPlayers} onChange={setNumPlayers} min={2} max={20} /></Row>
        <Row label="Buy-in Amount"><MoneyInput value={cfg.buyIn} onChange={v => setCfg(c => ({ ...c, buyIn: v }))} /></Row>
      </Card>
      <Card title="Add-ons">
        <Row label="Allow Add-ons"><Toggle value={cfg.allowAddOns} onChange={v => setCfg(c => ({ ...c, allowAddOns: v }))} /></Row>
        {cfg.allowAddOns && (
          <>
            <Row label="Add-on Amount"><MoneyInput value={cfg.addOnAmount} onChange={v => setCfg(c => ({ ...c, addOnAmount: v }))} /></Row>
            <Row label="Add-ons Close After Level">
              <Stepper value={cfg.addOnCutoffLevel} onChange={v => setCfg(c => ({ ...c, addOnCutoffLevel: v }))} min={1} max={cfg.blindStructure.length} />
            </Row>
          </>
        )}
      </Card>
      <Card title="Seat Names (Optional)">
        <div className="grid grid-cols-2 gap-2">
          {playerNames.map((name, i) => (
            <input key={i} value={name}
              onChange={e => { const n = [...playerNames]; n[i] = e.target.value; setPlayerNames(n); }}
              placeholder={`Seat ${i + 1}`}
              className="text-sm px-3 py-2 rounded-xl focus:outline-none"
              style={{ fontFamily: SERIF, background: C.input, border: `1px solid ${C.border}`, color: C.text }}
            />
          ))}
        </div>
      </Card>
    </>
  );
}

// ── Chips Tab ─────────────────────────────────────────────────────────────────
function ChipsTab({ cfg, setCfg, stackVal }) {
  function updateInventory(denom, qty) {
    setCfg(c => ({ ...c, chipSet: c.chipSet.map(ch => ch.denom === denom ? { ...ch, qty: Math.max(0, qty) } : ch) }));
  }
  function updateStackQty(denom, qty) {
    setCfg(c => {
      if (qty <= 0) return { ...c, startingStack: c.startingStack.filter(s => s.denom !== denom) };
      const exists = c.startingStack.some(s => s.denom === denom);
      if (exists) return { ...c, startingStack: c.startingStack.map(s => s.denom === denom ? { ...s, qty } : s) };
      return { ...c, startingStack: [...c.startingStack, { denom, qty }].sort((a, b) => a.denom - b.denom) };
    });
  }

  return (
    <>
      <Card title="Chip Inventory">
        {cfg.chipSet.map(chip => (
          <div key={chip.denom} className="flex items-center gap-3">
            <ChipBadge denom={chip.denom} />
            <span className="text-sm flex-1" style={{ fontFamily: SERIF, color: C.text }}>${chip.denom.toLocaleString()}</span>
            <input type="number" value={chip.qty}
              onChange={e => updateInventory(chip.denom, parseInt(e.target.value) || 0)}
              className="text-sm w-20 px-2 py-1.5 rounded-lg text-right focus:outline-none"
              style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text, fontFamily: MONO }}
            />
          </div>
        ))}
      </Card>
      <Card title={`Starting Stack — ${stackVal.toLocaleString()} chip value`}>
        {cfg.chipSet.map(chip => {
          const se  = cfg.startingStack.find(s => s.denom === chip.denom);
          const qty = se?.qty || 0;
          return (
            <div key={chip.denom} className="flex items-center gap-3">
              <ChipBadge denom={chip.denom} />
              <span className="text-sm flex-1" style={{ fontFamily: SERIF, color: C.text }}>${chip.denom.toLocaleString()}</span>
              <Stepper value={qty} onChange={v => updateStackQty(chip.denom, v)} min={0} max={99} small />
              <span className="text-xs w-20 text-right tabular-nums" style={{ fontFamily: MONO, color: C.muted }}>
                = {(chip.denom * qty).toLocaleString()}
              </span>
            </div>
          );
        })}
      </Card>
    </>
  );
}

// ── Blinds Tab ────────────────────────────────────────────────────────────────
function BlindsTab({ cfg, setCfg }) {
  function updateLevel(id, field, val) {
    setCfg(c => ({ ...c, blindStructure: c.blindStructure.map(l => l.id === id ? { ...l, [field]: Math.max(0, val) } : l) }));
  }
  function removeLevel(id) {
    setCfg(c => ({ ...c, blindStructure: c.blindStructure.filter(l => l.id !== id) }));
  }
  function addLevel() {
    const last = cfg.blindStructure[cfg.blindStructure.length - 1];
    setCfg(c => ({ ...c, blindStructure: [...c.blindStructure, { id: Date.now(), sb: last ? last.sb * 2 : 25, bb: last ? last.bb * 2 : 50, duration: last?.duration || 15 }] }));
  }
  function setAllDurations(d) {
    setCfg(c => ({ ...c, blindStructure: c.blindStructure.map(l => ({ ...l, duration: d })) }));
  }
  function toggleColorUp(levelIdx, denom) {
    setCfg(c => {
      const existing = c.colorUp.find(cu => cu.levelIdx === levelIdx);
      if (existing) {
        const newDenoms = existing.denoms.includes(denom)
          ? existing.denoms.filter(d => d !== denom)
          : [...existing.denoms, denom].sort((a, b) => a - b);
        if (newDenoms.length === 0) return { ...c, colorUp: c.colorUp.filter(cu => cu.levelIdx !== levelIdx) };
        return { ...c, colorUp: c.colorUp.map(cu => cu.levelIdx === levelIdx ? { ...cu, denoms: newDenoms } : cu) };
      }
      return { ...c, colorUp: [...c.colorUp, { levelIdx, denoms: [denom] }].sort((a, b) => a.levelIdx - b.levelIdx) };
    });
  }

  const colorableChips = cfg.chipSet.filter(ch => ch.denom <= 100).map(ch => ch.denom);

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ fontFamily: SERIF, color: C.muted }}>Set all:</span>
        {[10, 15, 20, 30].map(d => (
          <button key={d} onClick={() => setAllDurations(d)}
            className="px-3 py-1 text-xs rounded-full active:scale-95 transition-all"
            style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text, fontFamily: SERIF }}>
            {d}m
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {cfg.blindStructure.map((level, idx) => {
          const cu = cfg.colorUp.find(c => c.levelIdx === idx);
          return (
            <div key={level.id} className="rounded-xl p-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold w-12 flex-shrink-0" style={{ fontFamily: MONO, color: C.ribbon }}>Lv {idx + 1}</span>
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <LabeledInput label="SB"  value={level.sb}       onChange={v => updateLevel(level.id, "sb", v)} />
                  <LabeledInput label="BB"  value={level.bb}       onChange={v => updateLevel(level.id, "bb", v)} />
                  <LabeledInput label="Min" value={level.duration} onChange={v => updateLevel(level.id, "duration", v)} />
                </div>
                <button onClick={() => removeLevel(level.id)} className="p-1 ml-1 flex-shrink-0" style={{ color: C.faint }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ fontFamily: SERIF, color: C.faint }}>Color up:</span>
                {colorableChips.map(denom => {
                  const active = cu?.denoms.includes(denom);
                  return (
                    <button key={denom} onClick={() => toggleColorUp(idx, denom)}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors"
                      style={{ borderColor: active ? C.ribbon : C.border, color: active ? C.ribbon : C.faint, background: active ? "rgba(197,0,62,0.06)" : "transparent", fontFamily: SERIF }}>
                      ${denom}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={addLevel}
        className="w-full py-3 border-2 border-dashed text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
        style={{ borderColor: C.border, color: C.muted, fontFamily: SERIF }}>
        <Plus size={14} /> Add Level
      </button>
    </>
  );
}

// ─── LIVE SCREEN ─────────────────────────────────────────────────────────────
function LiveScreen({ config, gs, setGs, onBack }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedPid, setSelectedPid] = useState(null);

  const level     = config.blindStructure[gs.levelIdx];
  const totalSecs = level.duration * 60;
  const progress  = Math.min(100, ((totalSecs - gs.timeRemaining) / totalSecs) * 100);
  const isFirst   = gs.levelIdx === 0;
  const isLast    = gs.levelIdx >= config.blindStructure.length - 1;

  useEffect(() => {
    if (!gs.isRunning) return;
    const id = setInterval(() => {
      setGs(prev => {
        if (!prev.isRunning) return prev;
        if (prev.timeRemaining <= 1) {
          const nextIdx = prev.levelIdx + 1;
          if (nextIdx >= config.blindStructure.length) return { ...prev, timeRemaining: 0, isRunning: false };
          const nextLevel    = config.blindStructure[nextIdx];
          const cu           = config.colorUp.find(c => c.levelIdx === nextIdx);
          const addOnClosing = config.allowAddOns && (nextIdx + 1) > config.addOnCutoffLevel;
          return { ...prev, levelIdx: nextIdx, timeRemaining: nextLevel.duration * 60, isRunning: true,
            alert: { level: nextIdx + 1, sb: nextLevel.sb, bb: nextLevel.bb, colorUp: cu?.denoms || null, addOnClosing } };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gs.isRunning, config]);

  function advanceLevel(dir) {
    const nextIdx = gs.levelIdx + dir;
    if (nextIdx < 0 || nextIdx >= config.blindStructure.length) return;
    const nextLevel    = config.blindStructure[nextIdx];
    const cu           = dir > 0 ? config.colorUp.find(c => c.levelIdx === nextIdx) : null;
    const addOnClosing = dir > 0 && config.allowAddOns && (nextIdx + 1) > config.addOnCutoffLevel;
    setGs(prev => ({ ...prev, levelIdx: nextIdx, timeRemaining: nextLevel.duration * 60,
      alert: dir > 0 ? { level: nextIdx + 1, sb: nextLevel.sb, bb: nextLevel.bb, colorUp: cu?.denoms || null, addOnClosing } : null }));
  }

  function toggleTimer()  { setGs(prev => ({ ...prev, isRunning: !prev.isRunning })); }
  function dismissAlert() { setGs(prev => ({ ...prev, alert: null })); }
  function markBusted(pid)  { setGs(prev => ({ ...prev, players: prev.players.map(p => p.id === pid ? { ...p, status: "busted" } : p) })); setSelectedPid(null); }
  function markActive(pid)  { setGs(prev => ({ ...prev, players: prev.players.map(p => p.id === pid ? { ...p, status: "active" } : p) })); setSelectedPid(null); }
  function toggleAddOn(pid) { setGs(prev => ({ ...prev, players: prev.players.map(p => p.id !== pid ? p : { ...p, addOns: p.addOns > 0 ? p.addOns - 1 : 1 }) })); setSelectedPid(null); }

  const activePlayers = gs.players.filter(p => p.status === "active");
  const totalAddOns   = gs.players.reduce((sum, p) => sum + p.addOns, 0);
  const addOnsOpen    = config.allowAddOns && (gs.levelIdx + 1) <= config.addOnCutoffLevel;
  const stackVal      = stackTotal(config.startingStack);
  const prizePool     = config.numPlayers * config.buyIn + totalAddOns * config.addOnAmount;

  const timerRed   = gs.timeRemaining <= 60;
  const timerAmber = !timerRed && gs.timeRemaining <= 180;
  const timerColor = timerRed ? C.ribbon : timerAmber ? C.sandstorm : C.text;
  const barColor   = timerRed ? C.ribbon : timerAmber ? C.sandstorm : C.ribbon;

  const selectedPlayer = gs.players.find(p => p.id === selectedPid);

  return (
    <div className="min-h-screen flex flex-col" style={{ maxWidth: 480, margin: "0 auto", background: C.bg, color: C.text }}>

      {/* Level-up Alert */}
      {gs.alert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(255,255,255,0.92)" }}>
          <div className="w-full max-w-sm p-7 text-center space-y-4 rounded-3xl"
            style={{ background: C.bg, border: `2px solid ${C.ribbon}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: "3rem" }}>🔔</div>
            <div>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ fontFamily: SERIF, color: C.muted }}>Level Up</p>
              <p className="font-black" style={{ fontFamily: MONO, fontSize: "2rem", color: C.text }}>Level {gs.alert.level}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: SERIF, color: C.muted }}>New Blinds</p>
              <p className="font-black" style={{ fontFamily: MONO, fontSize: "3rem", lineHeight: 1, color: C.text }}>
                {fmt(gs.alert.sb)} / {fmt(gs.alert.bb)}
              </p>
            </div>
            {gs.alert.colorUp && (
              <div className="rounded-xl p-3" style={{ background: "#fef8f2", border: `1px solid ${C.sandstorm}` }}>
                <p className="font-semibold text-sm" style={{ fontFamily: SERIF, color: C.sandstorm }}>
                  🎨 Color up ${gs.alert.colorUp.join(", $")} chips now
                </p>
              </div>
            )}
            {gs.alert.addOnClosing && (
              <div className="rounded-xl p-3" style={{ background: "#fff0f3", border: `1px solid ${C.ribbon}` }}>
                <p className="font-semibold text-sm" style={{ fontFamily: SERIF, color: C.ribbon }}>
                  ⛔ Add-ons are now closed
                </p>
              </div>
            )}
            <button onClick={dismissAlert}
              className="w-full py-4 rounded-2xl active:scale-95 transition-all"
              style={{ background: C.ribbon, color: "#fff", fontFamily: SERIF, fontWeight: 700, fontSize: "1.1rem" }}>
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Player Action Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: "rgba(255,255,255,0.88)" }}>
          <div className="w-full max-w-xs p-5 space-y-3 rounded-2xl"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold" style={{ fontFamily: SERIF, color: C.text }}>{selectedPlayer.name}</p>
              <button onClick={() => setSelectedPid(null)} style={{ color: C.faint }}><X size={20} /></button>
            </div>
            <p className="text-sm" style={{ fontFamily: SERIF, color: C.muted }}>
              {selectedPlayer.status === "active" ? "Active" : "Out"}
              {selectedPlayer.addOns > 0 && ` · ${selectedPlayer.addOns} add-on${selectedPlayer.addOns > 1 ? "s" : ""}`}
            </p>
            {selectedPlayer.status === "active"
              ? <button onClick={() => markBusted(selectedPlayer.id)} className="w-full py-3 font-bold rounded-xl active:scale-95 transition-all"
                  style={{ background: C.ribbon, color: "#fff", fontFamily: SERIF }}>Mark Out</button>
              : <button onClick={() => markActive(selectedPlayer.id)} className="w-full py-3 font-bold rounded-xl active:scale-95 transition-all"
                  style={{ background: C.deepBlue, color: "#fff", fontFamily: SERIF }}>Reinstate</button>
            }
            {addOnsOpen && selectedPlayer.status === "active" && (
              <button onClick={() => toggleAddOn(selectedPlayer.id)} className="w-full py-3 font-bold rounded-xl active:scale-95 transition-all"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontFamily: SERIF }}>
                {selectedPlayer.addOns > 0 ? "Remove Add-on" : "Grant Add-on"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timer Block */}
      <div className="flex-shrink-0 px-5 pt-5 pb-5" style={{ borderBottom: `1px solid ${C.border}` }}>

        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="text-xs transition-colors hover:opacity-60"
            style={{ color: C.muted, fontFamily: SERIF }}>← Setup</button>
          <span className="text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase"
            style={{ fontFamily: MONO, background: C.ribbon, color: "#fff" }}>
            Level {gs.levelIdx + 1}
          </span>
          <span className="text-xs" style={{ color: C.muted, fontFamily: SERIF }}>
            {activePlayers.length} / {gs.players.length} left
          </span>
        </div>

        <div className="text-center mb-2">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ fontFamily: SERIF, color: C.muted }}>Blinds</p>
          <p className="font-black" style={{ fontFamily: MONO, fontSize: "3.25rem", lineHeight: 1.05, letterSpacing: "-1px", color: C.text }}>
            {fmt(level.sb)} / {fmt(level.bb)}
          </p>
        </div>

        <div className="text-center font-black transition-colors"
          style={{ fontFamily: MONO, fontSize: "5.5rem", lineHeight: 1, letterSpacing: "-3px", color: timerColor }}>
          {fmtTime(gs.timeRemaining)}
        </div>

        <div className="h-1.5 rounded-full my-4 overflow-hidden" style={{ background: C.input }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: barColor }} />
        </div>

        <div className="flex items-center justify-center gap-6 mb-3">
          <button onClick={() => advanceLevel(-1)} disabled={isFirst}
            className="p-3 rounded-full disabled:opacity-20 active:scale-90 transition-all"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }}>
            <SkipBack size={22} />
          </button>
          <button onClick={toggleTimer}
            className="p-5 rounded-full active:scale-90 transition-all"
            style={{ background: C.ribbon, color: "#fff", boxShadow: "0 0 28px rgba(197,0,62,0.25)" }}>
            {gs.isRunning ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button onClick={() => advanceLevel(1)} disabled={isLast}
            className="p-3 rounded-full disabled:opacity-20 active:scale-90 transition-all"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }}>
            <SkipForward size={22} />
          </button>
        </div>

        {!isLast && (
          <p className="text-center text-xs" style={{ color: C.muted, fontFamily: SERIF }}>
            Next: {fmt(config.blindStructure[gs.levelIdx + 1].sb)} / {fmt(config.blindStructure[gs.levelIdx + 1].bb)}
          </p>
        )}
      </div>

      {/* Player Grid */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {config.allowAddOns && (
          <p className="text-xs text-center mb-3" style={{ fontFamily: SERIF, color: addOnsOpen ? C.allure : C.faint }}>
            {addOnsOpen ? `Add-ons open · close after Level ${config.addOnCutoffLevel}` : "Add-ons closed"}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {gs.players.map(p => {
            const active = p.status === "active";
            return (
              <button key={p.id} onClick={() => setSelectedPid(p.id)}
                className="text-left p-3 rounded-xl transition-all active:scale-95"
                style={{ background: active ? C.surface : C.bg, border: `1px solid ${active ? C.border : C.input}`, opacity: active ? 1 : 0.4 }}>
                <p className="text-xs font-semibold truncate leading-tight"
                  style={{ fontFamily: SERIF, color: active ? C.text : C.muted, textDecoration: active ? "none" : "line-through" }}>
                  {p.name}
                </p>
                <p className="text-xs mt-1 font-medium" style={{ fontFamily: SERIF, color: active ? C.deepBlue : C.ribbon }}>
                  {active ? "Active" : "Out"}
                </p>
                {p.addOns > 0 && <p className="text-xs" style={{ color: C.allure, fontFamily: SERIF }}>+{p.addOns}</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Panel */}
      <div className="flex-shrink-0" style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
        <button onClick={() => setSummaryOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:opacity-70">
          <span className="text-sm" style={{ fontFamily: SERIF, color: C.muted }}>
            Prize Pool: <span className="font-bold" style={{ color: C.ribbon }}>${prizePool.toLocaleString()}</span>
          </span>
          {summaryOpen
            ? <ChevronDown size={16} style={{ color: C.faint }} />
            : <ChevronUp   size={16} style={{ color: C.faint }} />}
        </button>
        {summaryOpen && (
          <div className="grid grid-cols-2 gap-2 px-5 pb-5">
            <SumCard label="Buy-in Total"     value={`$${(config.numPlayers * config.buyIn).toLocaleString()}`} />
            <SumCard label="Add-on Total"     value={`$${(totalAddOns * config.addOnAmount).toLocaleString()}`} />
            <SumCard label="Add-ons Taken"    value={String(totalAddOns)} />
            <SumCard label="Players Out"      value={`${gs.players.length - activePlayers.length} / ${gs.players.length}`} />
            <SumCard label="Chips In Play"    value={(stackVal * config.numPlayers + totalAddOns * stackVal).toLocaleString()} />
            <SumCard label="Total Prize Pool" value={`$${prizePool.toLocaleString()}`} accent />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: SERIF, color: C.ribbon }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3" style={{ minHeight: "2.5rem" }}>
      <span className="text-sm" style={{ fontFamily: SERIF, color: C.text }}>{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative flex-shrink-0 rounded-full transition-colors"
      style={{ width: "3rem", height: "1.5rem", background: value ? C.ribbon : C.input, border: `1px solid ${C.border}` }}>
      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: value ? "translateX(1.375rem)" : "translateX(0.125rem)" }} />
    </button>
  );
}

function MoneyInput({ value, onChange }) {
  return (
    <div className="flex items-center rounded-xl px-3 py-1.5 gap-1"
      style={{ background: C.input, border: `1px solid ${C.border}` }}>
      <span style={{ color: C.muted, fontFamily: SERIF }}>$</span>
      <input type="number" value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="bg-transparent text-sm w-16 focus:outline-none text-right"
        style={{ fontFamily: SERIF, color: C.text }}
      />
    </div>
  );
}

function Stepper({ value, onChange, min = 0, max = 99, small = false }) {
  const sz = small ? "w-7 h-7 text-sm" : "w-9 h-9 text-base";
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - 1))}
        className={`${sz} flex items-center justify-center rounded-lg font-bold active:scale-90 transition-all`}
        style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }}>−</button>
      <span className={`font-semibold text-center tabular-nums ${small ? "w-5 text-sm" : "w-7"}`}
        style={{ fontFamily: MONO, color: C.text }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        className={`${sz} flex items-center justify-center rounded-lg font-bold active:scale-90 transition-all`}
        style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }}>+</button>
    </div>
  );
}

function ChipBadge({ denom }) {
  const col = CHIP_COLORS[denom] || { bg: "#4b5563", text: "#fff", border: "transparent" };
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ width: "2.25rem", height: "2.25rem", background: col.bg, color: col.text, border: `1px solid ${col.border}`, fontFamily: MONO }}>
      {denom >= 1000 ? `${denom / 1000}K` : `$${denom}`}
    </div>
  );
}

function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ fontFamily: SERIF, color: C.muted }}>{label}</p>
      <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="text-sm w-full px-2 py-1.5 rounded-lg focus:outline-none"
        style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text, fontFamily: MONO }}
      />
    </div>
  );
}

function SumCard({ label, value, accent }) {
  return (
    <div className="rounded-xl p-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <p className="text-xs" style={{ fontFamily: SERIF, color: C.muted }}>{label}</p>
      <p className="font-bold text-lg leading-tight mt-0.5" style={{ fontFamily: MONO, color: accent ? C.ribbon : C.text }}>{value}</p>
    </div>
  );
}
