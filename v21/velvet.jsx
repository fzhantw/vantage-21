// velvet.jsx — Variation 1: Velvet & Brass
// Vegas underground felt-table aesthetic. Brass dividers, stitched leather
// edges, classic playing-card faces. Dealer dashboard reads as a brass HUD
// inlaid into the felt. Card backs use a damask-style lattice in deep
// burgundy. Goal: feel expensive, lived-in, slightly conspiratorial.

const V = V21_THEMES.velvet;

// Suit glyph with hand-set serif numerals + corner mini-suit. Used at
// multiple sizes — the `size` prop scales everything proportionally.
function VelvetCard({ card, size = 1, hidden = false, lifted = false, glow = false }) {
  const w = 48 * size, h = 68 * size;
  if (hidden) {
    return (
      <div style={{
        width: w, height: h, borderRadius: 5,
        background: 'linear-gradient(135deg, #4a1d1d 0%, #2d0d0d 100%)',
        boxShadow: lifted
          ? `0 6px 14px rgba(0,0,0,0.55), 0 0 0 1px ${V.brass}`
          : `0 2px 4px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,162,99,0.5)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* damask lattice */}
        <div style={{ position: 'absolute', inset: 4, borderRadius: 3,
          border: `1px solid rgba(201,162,99,0.4)`,
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0 4px, rgba(201,162,99,0.12) 4px 5px), repeating-linear-gradient(-45deg, transparent 0 4px, rgba(201,162,99,0.12) 4px 5px)`,
        }} />
        {/* center monogram */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: V.fontDisplay, fontSize: 16 * size, fontStyle: 'italic',
          color: V.brass, letterSpacing: -1, textShadow: '0 1px 0 rgba(0,0,0,0.4)' }}>V21</div>
      </div>
    );
  }
  const c = V21_RED(card.s) ? '#a82828' : '#1a1a1a';
  return (
    <div style={{
      width: w, height: h, borderRadius: 5,
      background: 'linear-gradient(180deg, #fdf6e3 0%, #f0e3c2 100%)',
      boxShadow: glow
        ? `0 0 0 1.5px ${V.brassHi}, 0 0 18px rgba(244,210,138,0.5), 0 4px 8px rgba(0,0,0,0.45)`
        : lifted
        ? `0 6px 14px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(0,0,0,0.4)`
        : `0 2px 4px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(0,0,0,0.3)`,
      position: 'relative', color: c,
      fontFamily: V.fontDisplay,
    }}>
      <div style={{ position: 'absolute', top: 3 * size, left: 4 * size,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        lineHeight: 0.95 }}>
        <div style={{ fontSize: 13 * size, fontWeight: 600 }}>{card.v}</div>
        <div style={{ fontSize: 11 * size }}>{card.s}</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 26 * size, fontWeight: 500 }}>{card.s}</div>
      <div style={{ position: 'absolute', bottom: 3 * size, right: 4 * size,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        lineHeight: 0.95, transform: 'rotate(180deg)' }}>
        <div style={{ fontSize: 13 * size, fontWeight: 600 }}>{card.v}</div>
        <div style={{ fontSize: 11 * size }}>{card.s}</div>
      </div>
    </div>
  );
}

// Brass plaque — used for section headers (預視 / Stash).
function BrassPlaque({ children, lit = false }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      borderRadius: 2,
      background: lit
        ? `linear-gradient(180deg, ${V.brassHi}, ${V.brass})`
        : `linear-gradient(180deg, #6a4f25, #3d2c14)`,
      color: lit ? '#3d2c14' : V.brassHi,
      fontFamily: V.fontDisplay, fontStyle: 'italic',
      fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
      boxShadow: 'inset 0 1px 0 rgba(255,230,170,0.4), inset 0 -1px 0 rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.45)',
      textShadow: '0 1px 0 rgba(255,255,255,0.18)',
    }}>{children}</div>
  );
}

// Player seat — half-disc with chip stack and hand. Active seat
// rim-lights in brass.
function VelvetSeat({ p, active }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '8px 6px 10px',
      background: active
        ? `linear-gradient(180deg, rgba(201,162,99,0.18), rgba(201,162,99,0.04))`
        : 'rgba(0,0,0,0.18)',
      borderRadius: '14px 14px 4px 4px',
      border: active ? `1px solid ${V.brassHi}` : '1px solid rgba(201,162,99,0.18)',
      boxShadow: active ? `0 0 14px rgba(244,210,138,0.35) inset, 0 0 18px rgba(244,210,138,0.2)` : 'none',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ fontFamily: V.fontDisplay, fontStyle: 'italic',
          fontSize: 13, color: active ? V.brassHi : V.ink, fontWeight: 600 }}>{p.name}</div>
        <div style={{ fontFamily: V.fontDisplay, fontSize: 11, color: V.inkDim,
          fontVariantNumeric: 'tabular-nums' }}>{p.chips}</div>
      </div>
      {/* chip pile */}
      <div style={{ display: 'flex', gap: 1, alignItems: 'center', marginBottom: 6 }}>
        {Array.from({ length: Math.min(p.bet, 5) }).map((_, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #e94560, #6a0e1e)',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.5), 0 1px 1px rgba(0,0,0,0.4)' }} />
        ))}
        <span style={{ marginLeft: 4, fontSize: 10, color: V.brass,
          fontFamily: V.fontDisplay, fontStyle: 'italic' }}>注 {p.bet}</span>
      </div>
      {/* hand — fanned */}
      <div style={{ height: 56, position: 'relative' }}>
        {p.hand.map((c, i) => {
          const n = p.hand.length;
          const off = (i - (n - 1) / 2) * 12;
          const rot = (i - (n - 1) / 2) * 6;
          return (
            <div key={i} style={{ position: 'absolute', left: '50%', top: 0,
              transform: `translateX(calc(-50% + ${off}px)) rotate(${rot}deg)`,
              transformOrigin: 'bottom center' }}>
              <VelvetCard card={c} size={0.72} hidden={c.hidden} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: active ? V.brassHi : V.inkDim,
        fontFamily: V.fontUI, textAlign: 'center', minHeight: 14, fontStyle: active ? 'italic' : 'normal' }}>
        {p.hint}
      </div>
    </div>
  );
}

function VelvetScreen() {
  const sc = V21_SCENE;
  return (
    <div style={{
      width: '100%', height: '100%', background: V.bg,
      color: V.ink, fontFamily: V.fontUI,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* status ribbon — stitched leather */}
      <div style={{ position: 'absolute', top: 56, left: 12, right: 12,
        padding: '6px 12px',
        background: 'linear-gradient(180deg, #4a1818, #2a0d0d)',
        borderRadius: 4,
        border: `1px solid ${V.brass}`,
        boxShadow: 'inset 0 1px 0 rgba(255,200,150,0.18), 0 2px 6px rgba(0,0,0,0.5)',
        fontFamily: V.fontDisplay, fontStyle: 'italic',
        fontSize: 12, color: V.ink, textAlign: 'center', letterSpacing: 0.3,
        zIndex: 5,
      }}>
        ⚜  {sc.status}  ⚜
      </div>

      {/* dealer's brass HUD — fixed top-right corner of felt */}
      <div style={{ position: 'absolute', top: 96, left: 12, right: 12, zIndex: 4 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Future-3 */}
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)',
            borderRadius: 8, padding: '6px 8px',
            border: `1px solid ${V.brass}` }}>
            <BrassPlaque lit>預視 · NEXT 3</BrassPlaque>
            <div style={{ display: 'flex', gap: 3, marginTop: 6,
              justifyContent: 'space-between' }}>
              {sc.next3.map((c, i) => (
                <div key={i} style={{ position: 'relative', opacity: 1 - i * 0.18 }}>
                  <VelvetCard card={c} size={0.55} />
                  <div style={{ position: 'absolute', top: -4, left: -4,
                    width: 12, height: 12, borderRadius: '50%',
                    background: V.brass, color: '#1a1a1a',
                    fontSize: 8, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Stash */}
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)',
            borderRadius: 8, padding: '6px 8px',
            border: `1px solid ${V.brass}` }}>
            <BrassPlaque>暗格 · STASH</BrassPlaque>
            <div style={{ display: 'flex', gap: 3, marginTop: 6, alignItems: 'center', height: 38 }}>
              {sc.stash.map((c, i) => (
                <VelvetCard key={i} card={c} size={0.55} lifted />
              ))}
              <div style={{ flex: 1, fontSize: 9, color: V.inkDim,
                fontStyle: 'italic', fontFamily: V.fontDisplay,
                paddingLeft: 4 }}>
                {sc.stash.length === 0 ? '空' : '點選即可發出'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* dealer table — center stage. Curved felt with brass inlay. */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, padding: '0 14px' }}>
        <div style={{
          background: `radial-gradient(ellipse at 50% 30%, ${V.feltHi}, ${V.felt} 70%)`,
          borderRadius: '20px 20px 14px 14px',
          padding: '14px 12px 16px',
          border: `1.5px solid ${V.brass}`,
          boxShadow: 'inset 0 1px 0 rgba(244,210,138,0.4), inset 0 -8px 24px rgba(0,0,0,0.5), 0 6px 18px rgba(0,0,0,0.4)',
          position: 'relative',
        }}>
          {/* engraved monogram */}
          <div style={{ position: 'absolute', inset: 14, borderRadius: 12,
            border: `0.5px dashed ${V.brass}`, opacity: 0.35, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontFamily: V.fontDisplay, fontStyle: 'italic',
              fontSize: 13, color: V.brassHi, letterSpacing: 1 }}>THE HOUSE</div>
            <div style={{ fontFamily: V.fontDisplay, fontSize: 11, fontStyle: 'italic',
              color: V.ink }}>明面 {sc.dealer.score}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12,
            justifyContent: 'center', minHeight: 80 }}>
            {/* deck */}
            <div style={{ position: 'relative', width: 38, height: 54 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ position: 'absolute', top: -i * 1.5, left: -i * 1.5 }}>
                  <VelvetCard card={null} size={0.79} hidden />
                </div>
              ))}
              <div style={{ position: 'absolute', bottom: -14, left: '50%',
                transform: 'translateX(-50%)', fontSize: 9,
                fontFamily: V.fontDisplay, fontStyle: 'italic',
                color: V.brassHi, whiteSpace: 'nowrap' }}>{sc.deckCount} 牌</div>
            </div>
            {/* dealer hand: 1 hidden + 2 face */}
            <div style={{ position: 'relative', width: 124, height: 60 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, transform: 'rotate(-6deg)' }}>
                <VelvetCard hidden />
              </div>
              <div style={{ position: 'absolute', left: 32, top: -2 }}>
                <VelvetCard card={sc.dealer.cards[0]} />
              </div>
              <div style={{ position: 'absolute', left: 64, top: 0, transform: 'rotate(4deg)' }}>
                <VelvetCard card={sc.dealer.cards[1]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* three seats — bottom of felt, rim-lit */}
      <div style={{ position: 'absolute', top: 432, left: 12, right: 12,
        display: 'flex', gap: 6 }}>
        {sc.players.map(p => (
          <VelvetSeat key={p.id} p={p} active={p.status === 'active'} />
        ))}
      </div>

      {/* action rail — bottom brass bar */}
      <div style={{ position: 'absolute', bottom: 34, left: 12, right: 12,
        background: 'linear-gradient(180deg, #2a1810, #100806)',
        borderRadius: 10, padding: 8,
        border: `1px solid ${V.brass}`,
        boxShadow: 'inset 0 1px 0 rgba(244,210,138,0.3), 0 -4px 12px rgba(0,0,0,0.5)',
        display: 'flex', gap: 6 }}>
        <button style={{
          flex: 2, padding: '10px 0', borderRadius: 5, border: 'none',
          background: `linear-gradient(180deg, ${V.brassHi}, ${V.brass})`,
          color: '#2a1810', fontFamily: V.fontDisplay, fontStyle: 'italic',
          fontSize: 14, fontWeight: 700, letterSpacing: 0.6,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.3)',
        }}>發給 B</button>
        <button style={{
          flex: 2, padding: '10px 0', borderRadius: 5,
          border: `1px solid ${V.brass}`,
          background: 'rgba(201,162,99,0.08)', color: V.brassHi,
          fontFamily: V.fontDisplay, fontStyle: 'italic',
          fontSize: 13, fontWeight: 600, letterSpacing: 0.4,
        }}>扣下此牌</button>
        <button style={{
          flex: 1.4, padding: '10px 0', borderRadius: 5,
          border: `1px solid ${V.danger}`,
          background: 'rgba(200,73,47,0.15)', color: V.danger,
          fontFamily: V.fontDisplay, fontStyle: 'italic',
          fontSize: 12, fontWeight: 600 }}>財迷</button>
      </div>
    </div>
  );
}

window.VelvetScreen = VelvetScreen;
