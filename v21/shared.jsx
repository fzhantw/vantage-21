// shared.jsx — Vantage 21 redesign primitives
// A single canonical "scene" used across all four design directions, plus
// helpers for cards / suits. Keeping the data identical across artboards
// makes the visual differences read as design choices, not content drift.

const V21_SUIT = { S: '♠', H: '♥', D: '♦', C: '♣' };
const V21_RED  = (s) => s === '♥' || s === '♦';

// One canonical mid-round scene shown in every variation.
//  · Player B is currently active (亮起黃框 in source design)
//  · Dealer has 1 hidden + 2 face cards = 10
//  · Future-3 preview shows ♠6 ♥6 ♣3 (next deck)
//  · Stash holds nothing yet
//  · Lure 已使用：所有閒家加注到 5
const V21_SCENE = {
  status: '閒家 B 思考中 — 你要發、要扣，還是讓他自然爆？',
  deckCount: 41,
  next3: [{ s: '♠', v: '6' }, { s: '♥', v: '6' }, { s: '♣', v: '3' }],
  stash: [{ s: '♦', v: 'Q' }],
  dealer: {
    hidden: { s: '♥', v: 'A' },     // revealed in resolved screens only
    cards:  [{ s: '♠', v: '8' }, { s: '♥', v: '2' }],
    score: 10,
  },
  players: [
    { id: 0, name: '閒家 A', chips: 8, bet: 5, status: 'stand',
      hand: [{ s: '♣', v: '9', hidden: true }, { s: '♥', v: '5' }, { s: '♦', v: '4' }],
      hint: '已停牌 · 18' },
    { id: 1, name: '閒家 B', chips: 5, bet: 5, status: 'active',
      hand: [{ s: '♠', v: '7', hidden: true }, { s: '♣', v: '8' }],
      hint: '我想要牌！' },
    { id: 2, name: '閒家 C', chips: 12, bet: 5, status: 'wait',
      hand: [{ s: '♠', v: 'K', hidden: true }, { s: '♦', v: '6' }],
      hint: '等待中…' },
  ],
};

// Pretty card text — uses real suit glyphs and rank labels.
const V21_CARD_TXT = ({ s, v }) => `${s}${v}`;

// ─── Theme tokens ───────────────────────────────────────────────
// Each theme is a self-contained palette + font set. Used by each
// variation file; `velvet`/`neon`/`theatre`/`split` reach for tokens
// directly rather than going through CSS variables — keeps each file
// readable on its own.
const V21_THEMES = {
  velvet: {
    name: 'Velvet & Brass',
    bg:    'radial-gradient(ellipse at 50% 35%, #2d4d3d 0%, #142922 60%, #0a1814 100%)',
    felt:  '#1d3a2c',
    feltHi:'#2a4d3b',
    brass: '#c9a263',
    brassHi:'#f4d28a',
    ink:   '#f0e6cc',
    inkDim:'rgba(240,230,204,0.55)',
    danger:'#c8492f',
    fontDisplay: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontUI:      '"Noto Sans TC", -apple-system, sans-serif',
  },
  neon: {
    name: 'Neon Vault',
    bg:    'radial-gradient(circle at 50% 0%, #1a0b3a 0%, #0a0420 50%, #000 100%)',
    panel: 'rgba(20, 8, 50, 0.55)',
    cyan:  '#42f5e3',
    magenta:'#ff3ec9',
    violet:'#9b6bff',
    yellow:'#fff36b',
    ink:   '#e8e0ff',
    inkDim:'rgba(232,224,255,0.55)',
    fontDisplay: '"JetBrains Mono", ui-monospace, monospace',
    fontUI:      '"Noto Sans TC", -apple-system, sans-serif',
  },
  theatre: {
    name: 'The Theatre',
    bg:    'radial-gradient(ellipse at 50% -10%, #6a1a1a 0%, #1a0606 50%, #000 100%)',
    spot:  '#fff7d9',
    velvet:'#7a1f1f',
    velvetDeep:'#3a0a0a',
    gold:  '#d4a543',
    ink:   '#f5ecd6',
    inkDim:'rgba(245,236,214,0.5)',
    fontDisplay: '"Bebas Neue", "Noto Serif TC", serif',
    fontUI:      '"Noto Serif TC", "Noto Sans TC", serif',
  },
  split: {
    name: 'Split-Second',
    bg:    '#080a0d',
    bg2:   '#11151b',
    accent:'#ff5530',
    accent2:'#ffb13a',
    cool:  '#3a8eff',
    ink:   '#f0f2f7',
    inkDim:'rgba(240,242,247,0.55)',
    fontDisplay: '"JetBrains Mono", ui-monospace, monospace',
    fontUI:      '"Noto Sans TC", -apple-system, sans-serif',
  },
};

// ─── Phone shell ────────────────────────────────────────────────
// Wrap any variation screen in a tight iPhone bezel. We stamp
// `data-screen-label` on the inner screen so DOM mentions resolve
// to the variant the user clicked.
function V21Phone({ label, children, dark = true, scrollable = false }) {
  return (
    <IOSDevice width={360} height={760} dark={dark}>
      <div data-screen-label={label} className="v21-screen"
        style={{ width: '100%', height: '100%', position: 'relative',
          overflow: scrollable ? 'auto' : 'hidden' }}>
        {children}
      </div>
    </IOSDevice>
  );
}

// ─── Suit glyph + small re-usable card components ──────────────
// Each variation re-skins these via theme overrides.

// Tiny pip used for next-3 / stash chips when space is short.
function V21Pip({ card, size = 12, color }) {
  if (!card) return null;
  return (
    <span style={{
      fontSize: size, fontFamily: 'serif',
      color: color ?? (V21_RED(card.s) ? '#e25c5c' : 'currentColor'),
      lineHeight: 1, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums',
    }}>{V21_CARD_TXT(card)}</span>
  );
}

Object.assign(window, {
  V21_SUIT, V21_RED, V21_SCENE, V21_CARD_TXT, V21_THEMES,
  V21Phone, V21Pip,
});
