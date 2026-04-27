// theatre.jsx — Variation 3: The Theatre
// Bold reframe: the dealer is a stage magician, the round is a performance.
// Center: spotlight pool with hovering dealer hand. Players are silhouetted
// audience boxes around a curved proscenium. Future-3 = "the script",
// Stash = "trap door (暗門)", actions = "cue card" buttons.

const T = V21_THEMES.theatre;

function TheatreCard({ card, size = 1, hidden = false, lit = false, floating = false }) {
  const w = 50 * size, h = 70 * size;
  if (hidden) {
    return (
      <div style={{
        width: w, height: h, borderRadius: 3,
        background: `linear-gradient(135deg, ${T.velvet} 0%, ${T.velvetDeep} 100%)`,
        border: `1px solid ${T.gold}`,
        boxShadow: lit
          ? `0 8px 24px rgba(0,0,0,0.7), 0 0 18px rgba(212,165,67,0.4)`
          : `0 4px 8px rgba(0,0,0,0.6)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 3,
          border: `0.5px solid ${T.gold}`,
          opacity: 0.7,
        }} />
        <div style={{ position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 18 * size,
          color: T.gold, letterSpacing: 2,
          textShadow: '0 0 8px rgba(212,165,67,0.6)' }}>★</div>
      </div>
    );
  }
  const c = V21_RED(card.s) ? '#a01818' : '#1a1212';
  return (
    <div style={{
      width: w, height: h, borderRadius: 3,
      background: lit
        ? 'linear-gradient(180deg, #fffaeb 0%, #f0dfae 100%)'
        : 'linear-gradient(180deg, #f5e8c8 0%, #d6c08c 100%)',
      boxShadow: floating
        ? `0 12px 30px rgba(0,0,0,0.65), 0 0 24px rgba(255,247,217,0.3)`
        : lit
        ? `0 6px 14px rgba(0,0,0,0.5), 0 0 16px rgba(255,247,217,0.4)`
        : `0 3px 8px rgba(0,0,0,0.55)`,
      position: 'relative', color: c,
      fontFamily: T.fontDisplay,
    }}>
      <div style={{ position: 'absolute', top: 4 * size, left: 5 * size,
        fontSize: 14 * size, lineHeight: 1, fontWeight: 400 }}>{card.v}</div>
      <div style={{ position: 'absolute', top: 18 * size, left: 5 * size,
        fontSize: 10 * size }}>{card.s}</div>
      <div style={{ position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30 * size, fontFamily: 'serif', fontWeight: 400 }}>{card.s}</div>
      <div style={{ position: 'absolute', bottom: 4 * size, right: 5 * size,
        fontSize: 14 * size, lineHeight: 1,
        transform: 'rotate(180deg)' }}>{card.v}</div>
    </div>
  );
}

// Audience box — players are silhouetted balconies
function AudienceBox({ p, active }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '6px 5px 8px',
      background: active
        ? `linear-gradient(180deg, rgba(212,165,67,0.2), rgba(122,31,31,0.1))`
        : `linear-gradient(180deg, rgba(58,10,10,0.7), rgba(20,4,4,0.85))`,
      borderRadius: '24px 24px 4px 4px',
      border: active ? `1.5px solid ${T.gold}` : `1px solid rgba(212,165,67,0.25)`,
      boxShadow: active
        ? `0 0 20px rgba(212,165,67,0.5), inset 0 0 12px rgba(255,247,217,0.15)`
        : `inset 0 -4px 12px rgba(0,0,0,0.6)`,
      position: 'relative',
      transform: active ? 'translateY(-3px)' : 'none',
      transition: 'transform .3s',
    }}>
      {/* spotlight glow on active */}
      {active && (
        <div style={{ position: 'absolute', top: -32, left: '50%',
          width: 80, height: 60, transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse at 50% 100%, rgba(255,247,217,0.4), transparent 70%)`,
          pointerEvents: 'none' }} />
      )}
      <div style={{ textAlign: 'center', fontFamily: T.fontDisplay,
        fontSize: 14, letterSpacing: 2,
        color: active ? T.spot : T.gold,
        textShadow: active ? `0 0 8px ${T.spot}` : 'none',
      }}>{['壹','貳','叁'][p.id]}</div>
      <div style={{ textAlign: 'center', fontSize: 9, color: T.inkDim,
        fontFamily: T.fontUI, marginTop: -2 }}>注 {p.bet} · 餘 {p.chips}</div>
      <div style={{ height: 50, position: 'relative', marginTop: 4 }}>
        {p.hand.map((c, i) => {
          const n = p.hand.length;
          const off = (i - (n - 1) / 2) * 14;
          const rot = (i - (n - 1) / 2) * 8;
          return (
            <div key={i} style={{ position: 'absolute', left: '50%', top: 0,
              transform: `translateX(calc(-50% + ${off}px)) rotate(${rot}deg)`,
              transformOrigin: 'bottom center' }}>
              <TheatreCard card={c} size={0.6} hidden={c.hidden} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: active ? T.spot : T.inkDim,
        fontFamily: T.fontUI, textAlign: 'center', minHeight: 14,
        fontStyle: active ? 'italic' : 'normal' }}>
        {p.hint}
      </div>
    </div>
  );
}

function TheatreScreen() {
  const sc = V21_SCENE;
  return (
    <div style={{
      width: '100%', height: '100%', background: T.bg,
      color: T.ink, fontFamily: T.fontUI,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* curtain edges */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 18,
        background: `linear-gradient(90deg, ${T.velvet} 0%, ${T.velvetDeep} 100%)`,
        boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.7)',
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 6px), linear-gradient(90deg, ${T.velvet}, ${T.velvetDeep})`,
        zIndex: 6, pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 18,
        background: `linear-gradient(-90deg, ${T.velvet} 0%, ${T.velvetDeep} 100%)`,
        boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.7)',
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 6px), linear-gradient(-90deg, ${T.velvet}, ${T.velvetDeep})`,
        zIndex: 6, pointerEvents: 'none',
      }} />

      {/* proscenium arch with title */}
      <div style={{ position: 'absolute', top: 50, left: 22, right: 22,
        textAlign: 'center', zIndex: 5 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 11,
          color: T.gold, letterSpacing: 6, opacity: 0.7 }}>第 七 幕</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 18,
          color: T.spot, letterSpacing: 3,
          textShadow: `0 0 8px rgba(255,247,217,0.5)` }}>
          B 之 抉 擇
        </div>
        <div style={{ fontFamily: T.fontUI, fontSize: 10, fontStyle: 'italic',
          color: T.inkDim, marginTop: 2, fontWeight: 400 }}>
          『{sc.status}』
        </div>
      </div>

      {/* spotlight cone behind dealer hand */}
      <div style={{ position: 'absolute', top: 110, left: '50%',
        transform: 'translateX(-50%)',
        width: 240, height: 180,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(255,247,217,0.18) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* the script — future-3 — left wing */}
      <div style={{ position: 'absolute', top: 122, left: 22, width: 88, zIndex: 4 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 10,
          color: T.gold, letterSpacing: 3,
          textAlign: 'center', marginBottom: 4,
          borderBottom: `0.5px solid ${T.gold}`, paddingBottom: 2 }}>
          劇 · 本
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3,
          alignItems: 'center' }}>
          {sc.next3.map((c, i) => (
            <div key={i} style={{ position: 'relative',
              transform: `translateX(${i * 6}px)`, opacity: 1 - i * 0.2 }}>
              <TheatreCard card={c} size={0.55} />
              <div style={{ position: 'absolute', top: '50%', right: -16,
                transform: 'translateY(-50%)',
                fontFamily: T.fontDisplay, fontSize: 9,
                color: T.gold, letterSpacing: 1 }}>{['壹','貳','叁'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* trap door — stash — right wing */}
      <div style={{ position: 'absolute', top: 122, right: 22, width: 88, zIndex: 4 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 10,
          color: T.gold, letterSpacing: 3,
          textAlign: 'center', marginBottom: 4,
          borderBottom: `0.5px solid ${T.gold}`, paddingBottom: 2 }}>
          暗 · 門
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3,
          alignItems: 'center', minHeight: 80 }}>
          {sc.stash.map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <TheatreCard card={c} size={0.55} lit />
              <div style={{ position: 'absolute', inset: -3,
                border: `0.5px dashed ${T.gold}`,
                borderRadius: 4, pointerEvents: 'none' }} />
            </div>
          ))}
          {sc.stash.length === 0 && (
            <div style={{ width: 28, height: 40,
              border: `0.5px dashed ${T.gold}`, opacity: 0.4,
              borderRadius: 3 }} />
          )}
          <div style={{ fontSize: 8, color: T.inkDim, fontStyle: 'italic',
            textAlign: 'center', fontFamily: T.fontUI, marginTop: 2 }}>
            點觸喚出
          </div>
        </div>
      </div>

      {/* center stage — dealer hand floating in spotlight */}
      <div style={{ position: 'absolute', top: 178, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 3 }}>
        <div style={{ position: 'relative', width: 150, height: 100 }}>
          {/* deck — tucked behind */}
          <div style={{ position: 'absolute', left: 8, top: 18,
            transform: 'rotate(-12deg)' }}>
            <TheatreCard hidden size={0.85} />
          </div>
          {/* dealer hand — floating cards in spotlight */}
          <div style={{ position: 'absolute', left: 36, top: -4,
            transform: 'rotate(-10deg)' }}>
            <TheatreCard hidden floating />
          </div>
          <div style={{ position: 'absolute', left: 70, top: -10 }}>
            <TheatreCard card={sc.dealer.cards[0]} floating lit />
          </div>
          <div style={{ position: 'absolute', left: 108, top: -4,
            transform: 'rotate(8deg)' }}>
            <TheatreCard card={sc.dealer.cards[1]} floating lit />
          </div>
        </div>
        <div style={{ marginTop: 8, fontFamily: T.fontDisplay,
          fontSize: 11, color: T.gold, letterSpacing: 4 }}>
          魔 · 術 · 師   <span style={{ color: T.spot, marginLeft: 4 }}>{sc.dealer.score}</span>
        </div>
      </div>

      {/* audience — three balconies */}
      <div style={{ position: 'absolute', top: 442, left: 22, right: 22,
        display: 'flex', gap: 5, zIndex: 5 }}>
        {sc.players.map(p => (
          <AudienceBox key={p.id} p={p} active={p.status === 'active'} />
        ))}
      </div>

      {/* cue cards — bottom action rail. Hand-lettered tickets. */}
      <div style={{ position: 'absolute', bottom: 32, left: 22, right: 22,
        display: 'flex', gap: 6, zIndex: 7 }}>
        <button style={{
          flex: 2, padding: '12px 0',
          background: `linear-gradient(180deg, ${T.gold}, #8a6a28)`,
          border: 'none', borderRadius: 2,
          color: '#1a0a0a', fontFamily: T.fontDisplay,
          fontSize: 14, letterSpacing: 4,
          boxShadow: 'inset 0 1px 0 rgba(255,247,217,0.5), 0 4px 10px rgba(0,0,0,0.6)',
        }}>賜 · 牌</button>
        <button style={{
          flex: 2, padding: '12px 0',
          background: 'rgba(255,247,217,0.06)',
          border: `1px solid ${T.gold}`, borderRadius: 2,
          color: T.gold, fontFamily: T.fontDisplay,
          fontSize: 13, letterSpacing: 3,
        }}>藏 · 入 暗 門</button>
        <button style={{
          flex: 1.4, padding: '12px 0',
          background: 'rgba(122,31,31,0.4)',
          border: `1px solid ${T.velvet}`, borderRadius: 2,
          color: T.spot, fontFamily: T.fontDisplay,
          fontSize: 12, letterSpacing: 2,
        }}>誘 · 餌</button>
      </div>
    </div>
  );
}

window.TheatreScreen = TheatreScreen;
