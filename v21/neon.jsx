// neon.jsx — Variation 2: Neon Vault
// Cyber-noir, glow-stroke geometry. Dealer dashboard becomes a HUD with
// scan lines and probability readouts. Cards are wireframe + holographic.
// Cyan / magenta / yellow on deep violet. Plays into the "future-3 = a
// peek into the matrix" metaphor.

const N = V21_THEMES.neon;

function NeonCard({ card, size = 1, hidden = false, glow = null, dim = false }) {
  const w = 48 * size, h = 68 * size;
  const stroke = glow || (hidden ? N.violet : (V21_RED(card?.s) ? N.magenta : N.cyan));
  if (hidden) {
    return (
      <div style={{
        width: w, height: h, borderRadius: 4,
        background: 'rgba(20,8,50,0.6)',
        border: `1px solid ${stroke}`,
        boxShadow: `0 0 8px ${stroke}, inset 0 0 12px rgba(155,107,255,0.25)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* holographic grid */}
        <div style={{ position: 'absolute', inset: 4,
          backgroundImage: `linear-gradient(${stroke} 1px, transparent 1px), linear-gradient(90deg, ${stroke} 1px, transparent 1px)`,
          backgroundSize: '6px 6px', opacity: 0.25 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: N.fontDisplay, fontSize: 10 * size, fontWeight: 700,
          color: stroke, letterSpacing: 1, textShadow: `0 0 4px ${stroke}` }}>V21</div>
      </div>
    );
  }
  const opacity = dim ? 0.55 : 1;
  return (
    <div style={{
      width: w, height: h, borderRadius: 4,
      background: 'rgba(8,4,20,0.85)',
      border: `1px solid ${stroke}`,
      boxShadow: `0 0 6px ${stroke}, inset 0 0 8px rgba(${V21_RED(card.s) ? '255,62,201' : '66,245,227'},0.15)`,
      color: stroke, fontFamily: N.fontDisplay,
      position: 'relative', opacity,
    }}>
      <div style={{ position: 'absolute', top: 3 * size, left: 4 * size,
        fontSize: 11 * size, fontWeight: 700, lineHeight: 1,
        textShadow: `0 0 3px ${stroke}` }}>{card.v}</div>
      <div style={{ position: 'absolute', top: 14 * size, left: 4 * size,
        fontSize: 9 * size }}>{card.s}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22 * size, textShadow: `0 0 6px ${stroke}, 0 0 12px ${stroke}` }}>{card.s}</div>
      <div style={{ position: 'absolute', bottom: 3 * size, right: 4 * size,
        fontSize: 11 * size, fontWeight: 700, lineHeight: 1,
        transform: 'rotate(180deg)' }}>{card.v}</div>
    </div>
  );
}

function NeonSeat({ p, active }) {
  const accent = active ? N.yellow : N.violet;
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '8px 6px',
      background: active ? 'rgba(255,243,107,0.06)' : 'rgba(155,107,255,0.05)',
      border: `1px solid ${accent}`,
      borderRadius: 4,
      boxShadow: active ? `0 0 12px rgba(255,243,107,0.4)` : 'none',
      position: 'relative',
    }}>
      {/* corner brackets */}
      {['tl','tr','bl','br'].map((k) => {
        const m = { tl: { top: -1, left: -1 }, tr: { top: -1, right: -1 },
                    bl: { bottom: -1, left: -1 }, br: { bottom: -1, right: -1 } }[k];
        return <div key={k} style={{ position: 'absolute', ...m, width: 6, height: 6,
          borderTop: k.includes('t') ? `2px solid ${accent}` : 'none',
          borderBottom: k.includes('b') ? `2px solid ${accent}` : 'none',
          borderLeft: k.includes('l') ? `2px solid ${accent}` : 'none',
          borderRight: k.includes('r') ? `2px solid ${accent}` : 'none' }} />;
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: N.fontDisplay, fontSize: 10, fontWeight: 700,
          color: accent, letterSpacing: 1 }}>{p.name.replace('閒家 ', 'P_')}</div>
        <div style={{ fontFamily: N.fontDisplay, fontSize: 9, color: N.inkDim,
          fontVariantNumeric: 'tabular-nums' }}>♦{p.chips}</div>
      </div>
      <div style={{ fontFamily: N.fontDisplay, fontSize: 8, color: N.inkDim,
        marginBottom: 4 }}>BET ▌{p.bet}</div>
      <div style={{ height: 50, position: 'relative' }}>
        {p.hand.map((c, i) => (
          <div key={i} style={{ position: 'absolute', left: i * 14, top: i * 2 }}>
            <NeonCard card={c} size={0.62} hidden={c.hidden} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, fontSize: 9, fontFamily: N.fontDisplay,
        color: active ? N.yellow : N.inkDim, textAlign: 'center', minHeight: 12,
        textShadow: active ? `0 0 4px ${N.yellow}` : 'none' }}>
        {active ? `> ${p.hint}` : p.hint}
      </div>
    </div>
  );
}

function NeonScreen() {
  const sc = V21_SCENE;
  // bust probability for active player B (score 8 vs deck): cards >13 would bust → 0
  // — we just hardcode plausible probes for HUD readouts
  return (
    <div style={{
      width: '100%', height: '100%', background: N.bg,
      color: N.ink, fontFamily: N.fontUI,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* scan lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 2px, rgba(66,245,227,0.025) 2px 3px)',
      }} />

      {/* status — terminal style */}
      <div style={{ position: 'absolute', top: 56, left: 12, right: 12,
        padding: '6px 10px',
        background: 'rgba(8,4,20,0.7)',
        border: `1px solid ${N.cyan}`,
        boxShadow: `0 0 8px rgba(66,245,227,0.3), inset 0 0 8px rgba(66,245,227,0.08)`,
        fontFamily: N.fontDisplay, fontSize: 10, color: N.cyan,
        letterSpacing: 0.4, zIndex: 5,
      }}>
        <span style={{ color: N.yellow }}>▌SYS:</span> {sc.status}
      </div>

      {/* HUD — Future-3 / Stash with telemetry */}
      <div style={{ position: 'absolute', top: 92, left: 12, right: 12, zIndex: 4,
        display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: N.panel,
          border: `1px solid ${N.violet}`,
          boxShadow: `0 0 8px rgba(155,107,255,0.4)`,
          borderRadius: 4, padding: '6px 8px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontFamily: N.fontDisplay, fontSize: 9, color: N.violet,
            letterSpacing: 1, textShadow: `0 0 4px ${N.violet}` }}>
            <span>▌ ORACLE.NEXT_3</span><span style={{ color: N.cyan }}>●REC</span>
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 5,
            justifyContent: 'space-between', alignItems: 'center' }}>
            {sc.next3.map((c, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <NeonCard card={c} size={0.55} dim={i > 0} />
                <div style={{ position: 'absolute', top: -5, left: -3,
                  fontSize: 7, fontFamily: N.fontDisplay,
                  color: N.yellow, fontWeight: 700,
                  textShadow: `0 0 3px ${N.yellow}` }}>T+{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: N.panel,
          border: `1px solid ${N.magenta}`,
          boxShadow: `0 0 8px rgba(255,62,201,0.4)`,
          borderRadius: 4, padding: '6px 8px' }}>
          <div style={{ fontFamily: N.fontDisplay, fontSize: 9,
            color: N.magenta, letterSpacing: 1,
            textShadow: `0 0 4px ${N.magenta}` }}>▌ STASH.VAULT [1/∞]</div>
          <div style={{ display: 'flex', gap: 3, marginTop: 5, alignItems: 'center', height: 38 }}>
            {sc.stash.map((c, i) => (
              <NeonCard key={i} card={c} size={0.55} glow={N.yellow} />
            ))}
            <div style={{ flex: 1, fontSize: 8, color: N.inkDim,
              fontFamily: N.fontDisplay, paddingLeft: 4 }}>
              TAP TO_DEPLOY
            </div>
          </div>
        </div>
      </div>

      {/* dealer arena — wire-frame circle with dealer hand at top */}
      <div style={{ position: 'absolute', top: 192, left: 0, right: 0,
        padding: '0 14px' }}>
        <div style={{
          background: 'rgba(8,4,20,0.6)',
          border: `1px solid ${N.cyan}`,
          boxShadow: `0 0 16px rgba(66,245,227,0.3), inset 0 0 24px rgba(66,245,227,0.08)`,
          borderRadius: 6, padding: '12px 12px 16px',
          position: 'relative',
        }}>
          {/* HUD readouts */}
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontFamily: N.fontDisplay, fontSize: 9, marginBottom: 8 }}>
            <span style={{ color: N.cyan, letterSpacing: 1 }}>▌DEALER.HAND</span>
            <span style={{ color: N.yellow }}>SHOW={sc.dealer.score}</span>
            <span style={{ color: N.magenta }}>HOLE=?</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14,
            justifyContent: 'center', minHeight: 80 }}>
            <div style={{ position: 'relative', width: 38, height: 54 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ position: 'absolute', top: -i * 2, left: -i * 2 }}>
                  <NeonCard size={0.79} hidden />
                </div>
              ))}
              <div style={{ position: 'absolute', bottom: -14, left: 0, right: 0,
                textAlign: 'center', fontSize: 8, fontFamily: N.fontDisplay,
                color: N.cyan, textShadow: `0 0 3px ${N.cyan}` }}>{sc.deckCount}</div>
            </div>
            <div style={{ position: 'relative', width: 130, height: 60 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, transform: 'rotate(-4deg)' }}>
                <NeonCard hidden />
              </div>
              <div style={{ position: 'absolute', left: 36, top: -2 }}>
                <NeonCard card={sc.dealer.cards[0]} />
              </div>
              <div style={{ position: 'absolute', left: 72, top: 0, transform: 'rotate(4deg)' }}>
                <NeonCard card={sc.dealer.cards[1]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* three players */}
      <div style={{ position: 'absolute', top: 422, left: 12, right: 12,
        display: 'flex', gap: 6 }}>
        {sc.players.map(p => (
          <NeonSeat key={p.id} p={p} active={p.status === 'active'} />
        ))}
      </div>

      {/* action bar */}
      <div style={{ position: 'absolute', bottom: 34, left: 12, right: 12,
        display: 'flex', gap: 6 }}>
        <button style={{
          flex: 2, padding: '11px 0', borderRadius: 4,
          border: `1px solid ${N.cyan}`, background: 'rgba(66,245,227,0.12)',
          color: N.cyan, fontFamily: N.fontDisplay, fontWeight: 700,
          fontSize: 13, letterSpacing: 1,
          textShadow: `0 0 4px ${N.cyan}`,
          boxShadow: `0 0 10px rgba(66,245,227,0.4), inset 0 0 8px rgba(66,245,227,0.15)`,
        }}>▶ DEAL_B</button>
        <button style={{
          flex: 2, padding: '11px 0', borderRadius: 4,
          border: `1px solid ${N.magenta}`, background: 'rgba(255,62,201,0.1)',
          color: N.magenta, fontFamily: N.fontDisplay, fontWeight: 700,
          fontSize: 13, letterSpacing: 1,
          textShadow: `0 0 4px ${N.magenta}`,
        }}>◢ STASH</button>
        <button style={{
          flex: 1.4, padding: '11px 0', borderRadius: 4,
          border: `1px solid ${N.yellow}`, background: 'rgba(255,243,107,0.08)',
          color: N.yellow, fontFamily: N.fontDisplay, fontWeight: 700,
          fontSize: 11, letterSpacing: 0.6,
        }}>$ LURE</button>
      </div>
    </div>
  );
}

window.NeonScreen = NeonScreen;
