import React, { useState, useMemo } from "react";
import { Check, X, ChevronRight, Sparkles, RotateCcw, Trophy, Info } from "lucide-react";

/* =====================================================================
   ENGINE — ported verbatim (logic-only, types stripped) from your
   colorMap.ts / display.ts, so this game reads real engine output,
   not an invented palette. Swap WORDS_RAW below with real dumps from
   pipeline.ts / cache.db and everything downstream stays correct.
   ===================================================================== */

const COLOR_SILENT = "#000000";
const COLOR_CONSONANT = "#000000";
const SYLLABIC_MARKER = "\u200d";
const DIPHTHONG_START = "#FF3399";
const DIPHTHONG_END = "#CC0000";
const SCHWA = "#888888"; // as literally defined in display.ts (distinct from colorMap's own schwa hex)

const COLOR_MAP = {
  æ: "#00b0f0",
  ʌ: "#008E40", a: "#008E40", ɑ: "#008E40",
  ə: "#000000", ɜ: "#000000", ər: "#000000", er: "#000000", ɐ: "#000000",
  e: "#EE5B00", ɛ: "#EE5B00",
  ɪ: "#CC0000", i: "#CC0000", "iː": "#CC0000",
  ɒ: "#FF3399", ɔ: "#FF3399", o: "#FF3399",
  ʊ: "#7030A0", u: "#7030A0", "uː": "#7030A0",
  "oʊ": "#FCD116", "əw": "#FCD116",
  "eɪ": "#00246C", "eỷ": "#00246C",
  ju: "#833C0B", "ỷu": "#833C0B", "juː": "#833C0B",
  "aɪ": "#4472C4", "aỷ": "#4472C4",
  aw: "#23D300", "aʊ": "#23D300",
  "oɪ": "#FF3399", "oỷ": "#FF3399", "ɔɪ": "#FF3399",
  j: "#CC0000", ỷ: "#CC0000", w: "#000000",
};

const SIMPLE_GRADIENT_SOUNDS = new Set(["ʌ", "ɪ", "ɒ", "ɔ", "ʊ"]);
function simpleGradientHex(sound) {
  if (!SIMPLE_GRADIENT_SOUNDS.has(sound)) return null;
  return COLOR_MAP[sound] ?? null;
}
function simpleGradientCss(hex) {
  return `linear-gradient(to right, ${hex} 0%, ${hex} 70%, #000000 100%)`;
}

const GRAPHIC_CONSONANT_LETTERS = new Set("bcdfghjklmnpqrstvwxyz");
function isGraphicConsonant(t) {
  return t.length > 0 && [...t.toLowerCase()].every((c) => GRAPHIC_CONSONANT_LETTERS.has(c));
}
function isMute(n) {
  if (n.c === COLOR_SILENT) return true;
  if (!n.t || n.t.length === 0) return false;
  const hasVowelColor = n.c !== COLOR_CONSONANT && n.c !== "" && n.c !== undefined;
  if (hasVowelColor && isGraphicConsonant(n.t)) return true;
  return false;
}
function isVowelNode(n) {
  if (!n.t || n.t.length === 0) return false;
  if (isMute(n)) return false;
  if (n.c === COLOR_CONSONANT || n.x || n.c === "") return false;
  return true;
}
function classifySyllabic(nodes) {
  const trueSyllabic = new Set();
  const diphthongGlide = new Set();
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].s !== SYLLABIC_MARKER) continue;
    const prev = i > 0 ? nodes[i - 1] : null;
    if (prev && prev.c === SCHWA) trueSyllabic.add(i);
    else diphthongGlide.add(i);
  }
  return { trueSyllabic, diphthongGlide };
}
function buildDiphthongSet(nodes, diphthongGlide) {
  const result = new Set();
  for (let i = 0; i < nodes.length; i++) {
    if (!diphthongGlide.has(i)) continue;
    if (i > 0 && isVowelNode(nodes[i - 1]) && nodes[i].t.length > 0) {
      result.add(i - 1);
      result.add(i);
    }
  }
  return result;
}
function buildUnderlineSet(nodes, diphthongGlide) {
  const result = new Set();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.underlineOverride === "deny") continue;
    if (n.underlineOverride === "force" && !n.x) {
      result.add(i);
      continue;
    }
    if (!n.u || n.x || !isVowelNode(n) || isMute(n)) continue;
    result.add(i);
    let j = i + 1;
    while (j < nodes.length) {
      const next = nodes[j];
      if (next.underlineOverride === "deny") break;
      if (diphthongGlide.has(j) && !next.x) {
        result.add(j);
        j++;
      } else break;
    }
  }
  return result;
}
function resolveDisplay(nodes) {
  const { trueSyllabic, diphthongGlide } = classifySyllabic(nodes);
  const diphthongSet = buildDiphthongSet(nodes, diphthongGlide);
  const underlineSet = buildUnderlineSet(nodes, diphthongGlide);

  const underlineColorMap = new Map();
  let runStart = null;
  for (let i = 0; i <= nodes.length; i++) {
    const hit = i < nodes.length && underlineSet.has(i);
    if (hit && runStart === null) runStart = i;
    if ((!hit || i === nodes.length) && runStart !== null) {
      let anchorColor;
      for (let k = runStart; k < i; k++) {
        const rn = nodes[k];
        if (isVowelNode(rn) && !isMute(rn)) { anchorColor = rn.c; break; }
      }
      if (!anchorColor) {
        const rn = nodes[runStart];
        anchorColor = rn.c && rn.c !== "" ? rn.c : COLOR_CONSONANT;
      }
      for (let j = runStart; j < i; j++) underlineColorMap.set(j, anchorColor);
      runStart = null;
    }
  }

  return nodes.map((n, i) => {
    const isTrueSyl = trueSyllabic.has(i);
    const isGlide = diphthongGlide.has(i);
    const isDiph = diphthongSet.has(i);
    const isUnder = underlineSet.has(i);
    const isSylVR = !!n.syllabicOverride;
    const mute = isMute(n) || (isGlide && !isDiph);
    const simpleHex = !isDiph && !isTrueSyl && !isSylVR && !mute ? simpleGradientHex(n.s) : null;
    const runAnchor = underlineColorMap.get(i) ?? COLOR_CONSONANT;

    let color;
    let gradientCss;
    if (isSylVR) color = "#FFFFFF";
    else if (isTrueSyl) color = COLOR_CONSONANT;
    else if (isDiph) color = isUnder && !mute ? runAnchor : "transparent";
    else if (simpleHex) {
      if (isUnder && !mute) color = runAnchor;
      else { color = "transparent"; gradientCss = simpleGradientCss(simpleHex); }
    } else if (mute) color = COLOR_SILENT;
    else color = n.c && n.c !== "" ? n.c : COLOR_CONSONANT;

    if (isUnder && !isTrueSyl && !isSylVR && !mute) color = runAnchor;

    return {
      t: n.t ?? "",
      color,
      underline: isUnder && !isTrueSyl && !isSylVR && !mute,
      gradient: (isDiph && !(isUnder && !mute)) || !!gradientCss,
      gradientCss,
      mute,
      syllabic: isTrueSyl,
      syllabicVR: isSylVR,
      underlineColor: runAnchor,
      sound: n.s && n.s !== SYLLABIC_MARKER ? n.s : "",
    };
  });
}

/* =====================================================================
   DATE EȘANTION — RenderNode[] construite manual ca stand-in pentru
   ieșirea reală a pipeline.ts. Convenție dedusă din codul tău: consoane
   normale au c:'' (x:true face treaba), doar literele CU ADEVĂRAT mute
   primesc explicit c:'#000000' (COLOR_SILENT).
   ===================================================================== */

const WORDS_RAW = {
  night: [
    { t: "n", s: "n", c: "", x: true, u: false },
    { t: "i", s: "aɪ", c: "#4472C4", x: false, u: false },
    { t: "gh", s: "", c: "#4472C4", x: false, u: false }, // consoană grafică, dar poartă culoarea vocalei -> mută
    { t: "t", s: "t", c: "", x: true, u: false },
  ],
  castle: [
    { t: "c", s: "k", c: "", x: true, u: false },
    { t: "a", s: "ɑ", c: "#008E40", x: false, u: true },
    { t: "s", s: "s", c: "", x: true, u: false },
    { t: "t", s: "", c: "#000000", x: true, u: false }, // mută adevărată
    { t: "le", s: "l", c: "", x: true, u: false },
  ],
  understand: [
    { t: "u", s: "ʌ", c: "#008E40", x: false, u: false },
    { t: "n", s: "n", c: "", x: true, u: false },
    { t: "d", s: "d", c: "", x: true, u: false },
    { t: "er", s: "ər", c: "#000000", x: false, u: false },
    { t: "s", s: "s", c: "", x: true, u: false },
    { t: "t", s: "t", c: "", x: true, u: false },
    { t: "a", s: "æ", c: "#00b0f0", x: false, u: true },
    { t: "n", s: "n", c: "", x: true, u: false },
    { t: "d", s: "d", c: "", x: true, u: false },
  ],
  coin: [
    { t: "c", s: "k", c: "", x: true, u: false },
    { t: "o", s: "ɔ", c: "#FF3399", x: false, u: false },
    { t: "i", s: SYLLABIC_MARKER, c: "", x: false, u: false },
    { t: "n", s: "n", c: "", x: true, u: false },
  ],
};

const WORDS = Object.fromEntries(
  Object.entries(WORDS_RAW).map(([w, nodes]) => [w, resolveDisplay(nodes)])
);

// Nuclee de culoare pentru nivelul 1 — direct din COLOR_MAP real (excludem
// grupul negru schwa/silent, care e ambiguu intenționat de motor)
const VOWEL_QUIZ_POOL = [
  { label: "æ", hex: "#00b0f0" },
  { label: "ʌ", hex: "#008E40" },
  { label: "e", hex: "#EE5B00" },
  { label: "ɪ", hex: "#CC0000" },
  { label: "ɒ", hex: "#FF3399" },
  { label: "ʊ", hex: "#7030A0" },
  { label: "eɪ", hex: "#00246C" },
  { label: "aɪ", hex: "#4472C4" },
  { label: "aʊ", hex: "#23D300" },
  { label: "juː", hex: "#833C0B" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* =====================================================================
   UI PRIMITIVES
   ===================================================================== */

const INK = "#1c1917";
const btnStyle = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "1px solid #d6d3d1",
  background: "white",
  fontFamily: "Inter, sans-serif",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  color: INK,
};

function ProgressBar({ value, max }) {
  return (
    <div style={{ background: "#e7e2d8", borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, background: "linear-gradient(90deg, #0d9488, #14b8a6)", height: "100%", transition: "width 0.4s ease" }} />
    </div>
  );
}
function XPBadge({ xp }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a16207", fontWeight: 600, fontSize: 14 }}>
      <Sparkles size={16} /> {xp} XP
    </div>
  );
}
function FeedbackFlash({ status }) {
  if (!status) return null;
  const ok = status === "ok";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: ok ? "#166534" : "#991b1b", background: ok ? "#dcfce7" : "#fee2e2" }}>
      {ok ? <Check size={14} /> : <X size={14} />} {ok ? "Corect" : "Mai încearcă"}
    </div>
  );
}

// randează un cuvânt din DisplayNode[], cu control asupra a ce se "dezvăluie"
function WordView({ nodes, reveal = { mute: true, underline: true, gradient: true }, onClickNode, selected = new Set() }) {
  return (
    <div style={{ fontFamily: "Fraunces, serif", fontSize: 48, fontWeight: 700, display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
      {nodes.map((n, i) => {
        let style = { cursor: onClickNode ? "pointer" : "default", padding: "0 1px", borderRadius: 6 };
        if (n.gradient && reveal.gradient) {
          style.backgroundImage = n.gradientCss || `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`;
          style.WebkitBackgroundClip = "text";
          style.backgroundClip = "text";
          style.color = "transparent";
        } else if (n.gradient && !reveal.gradient) {
          style.color = INK; // ascundem gradientul intenționat — utilizatorul trebuie să-l deducă
        } else {
          style.color = n.color === "transparent" ? INK : n.color;
        }
        if (n.underline && reveal.underline) {
          style.textDecoration = "underline";
          style.textDecorationColor = n.underlineColor;
          style.textDecorationThickness = "3px";
        }
        if (selected.has(i)) {
          style.background = "#e7e5e4";
        }
        return (
          <span key={i} style={style} onClick={() => onClickNode && onClickNode(i)}>
            {n.t}
          </span>
        );
      })}
    </div>
  );
}

/* =====================================================================
   NIVELE
   ===================================================================== */

// Nivel 1 — culoare -> sunet IPA (direct din COLOR_MAP real)
function Level1({ onDone, addXp }) {
  const items = useMemo(() => shuffle(VOWEL_QUIZ_POOL).slice(0, 5), []);
  const [i, setI] = useState(0);
  const [status, setStatus] = useState(null);
  const item = items[i];
  const options = useMemo(() => {
    const distractors = shuffle(VOWEL_QUIZ_POOL.filter((x) => x.hex !== item.hex)).slice(0, 3);
    return shuffle([item, ...distractors]);
  }, [item]);

  const pick = (opt) => {
    const correct = opt.hex === item.hex;
    setStatus(correct ? "ok" : "bad");
    if (correct) {
      addXp(10);
      setTimeout(() => {
        setStatus(null);
        if (i + 1 < items.length) setI(i + 1);
        else onDone();
      }, 500);
    } else setTimeout(() => setStatus(null), 500);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#57534e", marginBottom: 24 }}>Ce sunet IPA reprezintă această culoare?</p>
      <div style={{ width: 100, height: 100, borderRadius: 16, background: item.hex, margin: "0 auto 28px" }} />
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {options.map((opt) => (
          <button key={opt.label} onClick={() => pick(opt)} style={btnStyle}>{opt.label}</button>
        ))}
      </div>
      <FeedbackFlash status={status} />
    </div>
  );
}

// Nivel 2 — vânează literele mute (color-blind by design: mut = negru = consoană, exact ca-n motor)
function Level2({ onDone, addXp }) {
  const words = ["night", "castle"];
  const [wi, setWi] = useState(0);
  const [picked, setPicked] = useState(new Set());
  const [status, setStatus] = useState(null);
  const nodes = WORDS[words[wi]];
  const muteIdx = new Set(nodes.map((n, i) => (n.mute ? i : null)).filter((x) => x !== null));

  const toggle = (i) => {
    if (status) return;
    const next = new Set(picked);
    next.has(i) ? next.delete(i) : next.add(i);
    setPicked(next);
  };
  const check = () => {
    const correct = picked.size === muteIdx.size && [...picked].every((i) => muteIdx.has(i));
    setStatus(correct ? "ok" : "bad");
    if (correct) addXp(15);
    setTimeout(() => {
      setStatus(null);
      if (correct) {
        setPicked(new Set());
        if (wi + 1 < words.length) setWi(wi + 1);
        else onDone();
      }
    }, 800);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#57534e", marginBottom: 8 }}>Click pe literele mute.</p>
      <p style={{ color: "#a8a29e", fontSize: 12, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <Info size={13} /> nu te baza pe culoare — mut arată la fel de negru ca o consoană normală
      </p>
      <div style={{ marginBottom: 24 }}>
        <WordView nodes={nodes} onClickNode={toggle} selected={picked} />
      </div>
      <button onClick={check} style={{ ...btnStyle, background: "#0d9488", color: "white", border: "none" }}>Verifică</button>
      <div style={{ marginTop: 12 }}><FeedbackFlash status={status} /></div>
    </div>
  );
}

// Nivel 3 — accentul: subliniere ascunsă, userul trebuie s-o localizeze
function Level3({ onDone, addXp }) {
  const nodes = WORDS["understand"];
  const [picked, setPicked] = useState(new Set());
  const [status, setStatus] = useState(null);
  const underIdx = new Set(nodes.map((n, i) => (n.underline ? i : null)).filter((x) => x !== null));

  const toggle = (i) => {
    if (status) return;
    const next = new Set(picked);
    next.has(i) ? next.delete(i) : next.add(i);
    setPicked(next);
  };
  const check = () => {
    const correct = picked.size === underIdx.size && [...picked].every((i) => underIdx.has(i));
    setStatus(correct ? "ok" : "bad");
    if (correct) { addXp(20); setTimeout(onDone, 800); }
    else setTimeout(() => setStatus(null), 600);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#57534e", marginBottom: 24 }}>Click pe vocala accentuată din cuvânt (subliniere ascunsă).</p>
      <div style={{ marginBottom: 24 }}>
        <WordView nodes={nodes} reveal={{ mute: true, underline: false, gradient: true }} onClickNode={toggle} selected={picked} />
      </div>
      <button onClick={check} style={{ ...btnStyle, background: "#0d9488", color: "white", border: "none" }}>Verifică</button>
      <div style={{ marginTop: 12 }}><FeedbackFlash status={status} /></div>
    </div>
  );
}

// Nivel 4 — gradientul: ascuns, userul trebuie să găsească vocala/difongul care l-ar primi
function Level4({ onDone, addXp }) {
  const words = ["understand", "coin"];
  const [wi, setWi] = useState(0);
  const [picked, setPicked] = useState(new Set());
  const [status, setStatus] = useState(null);
  const nodes = WORDS[words[wi]];
  const gradIdx = new Set(nodes.map((n, i) => (n.gradient ? i : null)).filter((x) => x !== null));

  const toggle = (i) => {
    if (status) return;
    const next = new Set(picked);
    next.has(i) ? next.delete(i) : next.add(i);
    setPicked(next);
  };
  const check = () => {
    const correct = picked.size === gradIdx.size && [...picked].every((i) => gradIdx.has(i));
    setStatus(correct ? "ok" : "bad");
    if (correct) addXp(20);
    setTimeout(() => {
      setStatus(null);
      if (correct) {
        setPicked(new Set());
        if (wi + 1 < words.length) setWi(wi + 1);
        else onDone();
      }
    }, 800);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#57534e", marginBottom: 24 }}>
        Click pe partea cuvântului care ar primi gradient (vocală laxă neaccentuată sau diftong).
      </p>
      <div style={{ marginBottom: 24 }}>
        <WordView nodes={nodes} reveal={{ mute: true, underline: true, gradient: false }} onClickNode={toggle} selected={picked} />
      </div>
      <button onClick={check} style={{ ...btnStyle, background: "#0d9488", color: "white", border: "none" }}>Verifică</button>
      <div style={{ marginTop: 12 }}><FeedbackFlash status={status} /></div>
    </div>
  );
}

// Nivel 5 — boss: cuvântul complet, toate straturile dezvăluite
function Level5({ onDone, addXp }) {
  const nodes = WORDS["understand"];
  const [status, setStatus] = useState(null);
  const underIdx = [...nodes.keys()].find((i) => nodes[i].underline);
  const options = shuffle(["u", "er", "a"]);

  const pick = (letter) => {
    const correct = nodes[underIdx].t === letter;
    setStatus(correct ? "ok" : "bad");
    if (correct) { addXp(30); setTimeout(onDone, 700); }
    else setTimeout(() => setStatus(null), 500);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#57534e", marginBottom: 24 }}>Boss final — citește tot cuvântul, cu toate straturile active.</p>
      <div style={{ marginBottom: 28 }}>
        <WordView nodes={nodes} />
      </div>
      <p style={{ marginBottom: 14, fontWeight: 600 }}>Care literă poartă accentul principal?</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} style={btnStyle}>{opt}</button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}><FeedbackFlash status={status} /></div>
    </div>
  );
}

const LEVELS_META = [
  { title: "Vocalele", subtitle: "culoare → sunet (COLOR_MAP real)", Comp: Level1 },
  { title: "Literele mute", subtitle: "isMute() real", Comp: Level2 },
  { title: "Accentul", subtitle: "buildUnderlineSet() real", Comp: Level3 },
  { title: "Gradientul", subtitle: "buildDiphthongSet() + simpleGradient", Comp: Level4 },
  { title: "Cuvântul complet", subtitle: "resolveDisplay() integral", Comp: Level5 },
];

export default function Decodorul() {
  const [levelIdx, setLevelIdx] = useState(-1);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);
  const addXp = (n) => setXp((x) => x + n);
  const advance = () => (levelIdx + 1 >= LEVELS_META.length ? setFinished(true) : setLevelIdx((l) => l + 1));
  const restart = () => { setLevelIdx(-1); setXp(0); setFinished(false); };
  const CurrentComp = levelIdx >= 0 && levelIdx < LEVELS_META.length ? LEVELS_META[levelIdx].Comp : null;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#faf7f2", minHeight: 520, borderRadius: 16, padding: "32px 24px", color: INK, maxWidth: 640, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22 }}>Decodorul</div>
        <XPBadge xp={xp} />
      </div>

      {levelIdx === -1 && !finished && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#57534e", marginBottom: 12, lineHeight: 1.6 }}>
            Rulează pe engine-ul tău real (colorMap.ts + display.ts portate 1:1).
            Cuvintele „night", „castle", „understand", „coin" sunt date eșantion
            construite manual — ca stand-in pentru pipeline.ts.
          </p>
          <button onClick={advance} style={{ ...btnStyle, background: "#0d9488", color: "white", border: "none", padding: "12px 28px" }}>
            Start <ChevronRight size={16} style={{ display: "inline", verticalAlign: "-2px" }} />
          </button>
        </div>
      )}

      {!finished && levelIdx >= 0 && (
        <>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#78716c", marginBottom: 6 }}>
              <span>Nivel {levelIdx + 1}/{LEVELS_META.length} — {LEVELS_META[levelIdx].title}</span>
              <span>{LEVELS_META[levelIdx].subtitle}</span>
            </div>
            <ProgressBar value={levelIdx} max={LEVELS_META.length} />
          </div>
          <CurrentComp onDone={advance} addXp={addXp} />
        </>
      )}

      {finished && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Trophy size={40} color="#a16207" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Decodor complet</div>
          <p style={{ color: "#57534e", marginBottom: 20 }}>Ai strâns {xp} XP.</p>
          <button onClick={restart} style={{ ...btnStyle, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RotateCcw size={15} /> Reia jocul
          </button>
        </div>
      )}
    </div>
  );
}
