// theatre2.jsx — Variation 03b: The Theatre, with a Curtain Clock
// Develops 03 (the magician's stage) further and folds in 04's countdown
// pressure. The clock is reframed as a stage device: a brass hourglass /
// metronome embedded in the proscenium. Sand falls into a tray that doubles
// as a tempo bar; when it's almost empty, the spotlight pulses red and the
// audience whispers louder.
//
// New beats vs theatre.jsx:
//  · Brass hourglass top-center (sand drains over 4s)
//  · Proscenium tempo bar — sand pours into a brass tray
//  · Spotlight turns from gold → blood-red as time runs out
//  · "幕快落" stage-direction line below the act title
//  · Cue cards gain hotkey numerals and a primary-button pulse
//  · Active audience box vibrates subtly in the final second

const T2 = V21_THEMES.theatre;

// Reuse the same card from theatre.jsx via a slim local copy so this
// file stands alone if theatre.jsx is removed later.
function T2Card({ card, size = 1, hidden = false, lit = false, floating = false, urgent = false }) {
  const w = 50 * size, h = 70 * size;
  if (hidden) {
    return (
      <div style={{
        width: w, height: h, borderRadius: 3,
        background: `linear-gradient(135deg, ${T2.velvet} 0%, ${T2.velvetDeep} 100%)`,
        border: `1px solid ${T2.gold}`,
        boxShadow: lit
          ? `0 8px 24px rgba(0,0,0,0.7), 0 0 18px rgba(212,165,67,0.4)`
          : `0 4px 8px rgba(0,0,0,0.6)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 3,
          border: `0.5px solid ${T2.gold}`, opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T2.fontDisplay, fontSize: 18 * size,
          color: T2.gold, letterSpacing: 2,
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
        ? `0 12px 30px rgba(0,0,0,0.65), 0 0 ${urgent ? 32 : 24}px ${urgent ? 'rgba(255,90,60,0.5)' : 'rgba(255,247,217,0.3)'}`
        : lit
        ? `0 6px 14px rgba(0,0,0,0.5), 0 0 16px rgba(255,247,217,0.4)`
        : `0 3px 8px rgba(0,0,0,0.55)`,
      position: 'relative', color: c, fontFamily: T2.fontDisplay,
    }}>
      <div style={{ position: 'absolute', top: 4 * size, left: 5 * size,
        fontSize: 14 * size, lineHeight: 1, fontWeight: 400 }}>{card.v}</div>
      <div style={{ position: 'absolute', top: 18 * size, left: 5 * size,
        fontSize: 10 * size }}>{card.s}</div>
      <div style={{ position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30 * size, fontFamily: 'serif', fontWeight: 400 }}>{card.s}</div>
      <div style={{ position: 'absolute', bottom: 4 * size, right: 5 * size,
        fontSize: 14 * size, lineHeight: 1, transform: 'rotate(180deg)' }}>{card.v}</div>
    </div>
  );
}

// Brass pendulum — swings on a tighter beat as time runs out. Hangs to
// the LEFT of the hourglass like a stage metronome.
function BrassPendulum({ urgent }) {
  // animation duration shortens when urgent
  const dur = urgent ? '0.45s' : '0.95s';
  const armLen = 26;
  return (
    <svg width="20" height="46" viewBox="0 0 20 46" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="t2-pend-rod" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f4d28a" />
          <stop offset="100%" stopColor="#8a6a28" />
        </linearGradient>
      </defs>
      {/* pivot */}
      <circle cx="10" cy="3" r="2" fill="#f4d28a" />
      <g style={{
        transformOrigin: '10px 3px',
        animation: `t2-swing ${dur} ease-in-out infinite`,
      }}>
        <line x1="10" y1="3" x2="10" y2={3 + armLen}
          stroke="url(#t2-pend-rod)" strokeWidth="1.2" />
        <circle cx="10" cy={3 + armLen + 4} r="4.5"
          fill={urgent ? '#ff8a5a' : '#d4a543'}
          stroke="#8a6a28" strokeWidth="0.6"
          style={{ filter: urgent
            ? 'drop-shadow(0 0 4px rgba(255,120,80,0.8))'
            : 'drop-shadow(0 0 2px rgba(212,165,67,0.6))' }} />
      </g>
    </svg>
  );
}

// Brass hourglass — sand drains over `total` seconds, currently at `secs`.
// Top bulb fills with `pct` of remaining sand; bottom bulb fills with 1-pct.
function BrassHourglass({ pct, urgent }) {
  // pct = remaining / total; 1 → all top, 0 → all bottom.
  const W = 56, H = 78;
  const sand = urgent ? '#ff7a4a' : T2.gold;
  const stroke = T2.gold;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ filter: urgent
        ? `drop-shadow(0 0 8px rgba(255,120,80,0.6))`
        : `drop-shadow(0 0 6px rgba(212,165,67,0.4))` }}>
      {/* frame caps */}
      <rect x="6" y="3" width={W-12} height="5" rx="1" fill={stroke} />
      <rect x="6" y={H-8} width={W-12} height="5" rx="1" fill={stroke} />
      {/* glass outline (two triangles meeting at neck) */}
      <path d={`M10 8 L${W-10} 8 L${W/2+2} ${H/2} L${W/2-2} ${H/2} Z`}
        fill="rgba(20,8,8,0.85)" stroke={stroke} strokeWidth="1" />
      <path d={`M${W/2-2} ${H/2} L${W/2+2} ${H/2} L${W-10} ${H-8} L10 ${H-8} Z`}
        fill="rgba(20,8,8,0.85)" stroke={stroke} strokeWidth="1" />
      {/* top sand — its top edge falls as time passes */}
      <clipPath id="top-bulb">
        <path d={`M11 9 L${W-11} 9 L${W/2+2} ${H/2-1} L${W/2-2} ${H/2-1} Z`} />
      </clipPath>
      <rect x="0" y={9 + (1-pct) * (H/2 - 10)}
        width={W} height={H/2}
        fill={sand} clipPath="url(#top-bulb)" opacity="0.9" />
      {/* falling stream */}
      {pct > 0.02 && (
        <rect x={W/2-0.6} y={H/2} width="1.2" height={(1-pct) * (H/2 - 10) + 4}
          fill={sand} opacity="0.85" />
      )}
      {/* bottom sand pile — grows mound-shape over time */}
      <clipPath id="bot-bulb">
        <path d={`M${W/2-2} ${H/2+1} L${W/2+2} ${H/2+1} L${W-11} ${H-9} L11 ${H-9} Z`} />
      </clipPath>
      <rect x="0" y={H-9 - (1-pct) * (H/2 - 10)}
        width={W} height={H/2}
        fill={sand} clipPath="url(#bot-bulb)" opacity="0.9" />
      {/* neck rivets */}
      <circle cx={W/2} cy={H/2} r="1.4" fill={stroke} />
    </svg>
  );
}

// Audience balcony — same silhouette idea as theatre.jsx, with a tremor on
// the active box when time is running out.
function T2Audience({ p, active, urgent, whisper }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: '6px 5px 8px',
      background: active
        ? `linear-gradient(180deg, rgba(212,165,67,0.2), rgba(122,31,31,0.1))`
        : `linear-gradient(180deg, rgba(58,10,10,0.7), rgba(20,4,4,0.85))`,
      borderRadius: '24px 24px 4px 4px',
      border: active
        ? `1.5px solid ${urgent ? '#ff7a4a' : T2.gold}`
        : `1px solid rgba(212,165,67,0.25)`,
      boxShadow: active
        ? `0 0 ${urgent ? 26 : 20}px ${urgent ? 'rgba(255,120,80,0.55)' : 'rgba(212,165,67,0.5)'}, inset 0 0 12px rgba(255,247,217,0.15)`
        : `inset 0 -4px 12px rgba(0,0,0,0.6)`,
      position: 'relative',
      transform: active ? 'translateY(-3px)' : 'none',
      animation: active && urgent ? 't2-tremor 0.6s ease-in-out infinite' : 'none',
      transition: 'transform .3s, border-color .3s',
    }}>
      {/* whisper bubble — pops above non-active boxes when urgent */}
      {whisper && !active && (
        <div style={{ position: 'absolute', top: -16, left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: T2.fontUI, fontSize: 8, fontStyle: 'italic',
          color: T2.inkDim, whiteSpace: 'nowrap',
          background: 'rgba(20,4,4,0.85)',
          border: `0.5px solid ${T2.gold}`,
          padding: '1px 5px', borderRadius: 6,
          animation: 't2-whisper 1.8s ease-in-out infinite',
          pointerEvents: 'none',
        }}>{whisper}</div>
      )}
      {active && (
        <div style={{ position: 'absolute', top: -32, left: '50%',
          width: 80, height: 60, transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse at 50% 100%, ${urgent ? 'rgba(255,180,140,0.5)' : 'rgba(255,247,217,0.4)'}, transparent 70%)`,
          pointerEvents: 'none' }} />
      )}
      <div style={{ textAlign: 'center', fontFamily: T2.fontDisplay,
        fontSize: 14, letterSpacing: 2,
        color: active ? (urgent ? '#ffd0b8' : T2.spot) : T2.gold,
        textShadow: active ? `0 0 8px ${urgent ? '#ff7a4a' : T2.spot}` : 'none',
      }}>{['壹','貳','叁'][p.id]}</div>
      <div style={{ textAlign: 'center', fontSize: 9, color: T2.inkDim,
        fontFamily: T2.fontUI, marginTop: -2 }}>注 {p.bet} · 餘 {p.chips}</div>
      <div style={{ height: 50, position: 'relative', marginTop: 4 }}>
        {p.hand.map((c, i) => {
          const n = p.hand.length;
          const off = (i - (n - 1) / 2) * 14;
          const rot = (i - (n - 1) / 2) * 8;
          return (
            <div key={i} style={{ position: 'absolute', left: '50%', top: 0,
              transform: `translateX(calc(-50% + ${off}px)) rotate(${rot}deg)`,
              transformOrigin: 'bottom center' }}>
              <T2Card card={c} size={0.6} hidden={c.hidden} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 4, fontSize: 10,
        color: active ? (urgent ? '#ffb89c' : T2.spot) : T2.inkDim,
        fontFamily: T2.fontUI, textAlign: 'center', minHeight: 14,
        fontStyle: active ? 'italic' : 'normal' }}>
        {p.hint}
      </div>
    </div>
  );
}

function TheatreScreen2() {
  const sc = V21_SCENE;
  // Live countdown — drains 4.0s → 0; loops for demo. Mirrors split.jsx but
  // re-skinned with brass + sand semantics.
  const TOTAL = 4.0;
  const [secs, setSecs] = React.useState(2.4);
  React.useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => {
        const n = s - 0.05;
        return n <= 0 ? TOTAL : n;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);
  const pct = secs / TOTAL;
  const urgent = secs <= 1.2;
  const drum = secs <= 0.5;

  return (
    <div style={{
      width: '100%', height: '100%', background: T2.bg,
      color: T2.ink, fontFamily: T2.fontUI,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* keyframes for the tremor + pulse */}
      <style>{`
        @keyframes t2-tremor { 0%,100%{transform:translate(0,-3px)} 25%{transform:translate(-1px,-3px)} 50%{transform:translate(1px,-2px)} 75%{transform:translate(-1px,-3px)} }
        @keyframes t2-pulse  { 0%,100%{box-shadow: 0 4px 10px rgba(0,0,0,0.6), 0 0 0 0 rgba(255,120,80,0.6)} 50%{box-shadow: 0 4px 10px rgba(0,0,0,0.6), 0 0 0 6px rgba(255,120,80,0)} }
        @keyframes t2-spot   { 0%,100%{opacity:0.85} 50%{opacity:1} }
        @keyframes t2-swing  { 0%{transform:rotate(-22deg)} 50%{transform:rotate(22deg)} 100%{transform:rotate(-22deg)} }
        @keyframes t2-drum   { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.08);opacity:1} }
        @keyframes t2-glove  { 0%,100%{transform:translateY(0) rotate(-8deg)} 50%{transform:translateY(-3px) rotate(-8deg)} }
        @keyframes t2-trap   { 0%{opacity:0.4} 50%{opacity:1} 100%{opacity:0.4} }
        @keyframes t2-whisper{ 0%{opacity:0;transform:translateY(2px)} 30%,70%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-2px)} }
      `}</style>

      {/* curtain edges */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 18,
        background: `linear-gradient(90deg, ${T2.velvet} 0%, ${T2.velvetDeep} 100%)`,
        boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.7)',
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 6px), linear-gradient(90deg, ${T2.velvet}, ${T2.velvetDeep})`,
        zIndex: 6, pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 18,
        background: `linear-gradient(-90deg, ${T2.velvet} 0%, ${T2.velvetDeep} 100%)`,
        boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.7)',
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 6px), linear-gradient(-90deg, ${T2.velvet}, ${T2.velvetDeep})`,
        zIndex: 6, pointerEvents: 'none',
      }} />

      {/* proscenium title — tighter, with stage direction */}
      <div style={{ position: 'absolute', top: 50, left: 22, right: 22,
        textAlign: 'center', zIndex: 5 }}>
        <div style={{ fontFamily: T2.fontDisplay, fontSize: 11,
          color: T2.gold, letterSpacing: 6, opacity: 0.7 }}>第 七 幕</div>
        <div style={{ fontFamily: T2.fontDisplay, fontSize: 18,
          color: urgent ? '#ffb89c' : T2.spot, letterSpacing: 3,
          textShadow: `0 0 8px ${urgent ? 'rgba(255,150,110,0.6)' : 'rgba(255,247,217,0.5)'}`,
          transition: 'color .4s, text-shadow .4s' }}>
          B 之 抉 擇
        </div>
        <div style={{ fontFamily: T2.fontUI, fontSize: 9, fontStyle: 'italic',
          color: urgent ? '#ffb89c' : T2.inkDim, marginTop: 2,
          letterSpacing: 1, transition: 'color .3s' }}>
          ── {urgent ? '幕 · 將 · 落' : '幕間 · 沙漏未盡'} ──
        </div>
      </div>

      {/* brass hourglass — pinned center, just below the title.
          Pendulum hangs to the LEFT, "秒待" stays right. */}
      <div style={{ position: 'absolute', top: 96, left: '50%',
        transform: 'translateX(-50%)', zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: T2.fontDisplay,
          fontSize: 22, fontWeight: 400, letterSpacing: 1,
          color: urgent ? '#ff8a5a' : T2.gold,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          textShadow: urgent ? '0 0 10px rgba(255,120,80,0.7)' : '0 0 6px rgba(212,165,67,0.5)',
          width: 38, textAlign: 'right',
        }}>{secs.toFixed(1)}</div>
        <BrassPendulum urgent={urgent} />
        <BrassHourglass pct={pct} urgent={urgent} />
        {/* drum kick — only flashes in the very last 0.5s */}
        <div style={{ width: 14, height: 14, borderRadius: '50%',
          border: `1px solid ${T2.gold}`,
          background: drum ? 'radial-gradient(circle, #ff8a5a, #c8492f)' : 'transparent',
          animation: drum ? 't2-drum 0.25s ease-in-out infinite' : 'none',
          boxShadow: drum ? '0 0 10px rgba(255,120,80,0.9)' : 'none',
          transition: 'background .1s',
        }} />
        <div style={{ fontFamily: T2.fontDisplay, fontSize: 10,
          color: T2.gold, letterSpacing: 2, opacity: 0.75,
          width: 38 }}>秒 · 待</div>
      </div>

      {/* spotlight cone — gold → red as urgency rises */}
      <div style={{ position: 'absolute', top: 178, left: '50%',
        transform: 'translateX(-50%)',
        width: 240, height: 180,
        background: urgent
          ? 'radial-gradient(ellipse at 50% 30%, rgba(255,140,90,0.22) 0%, transparent 65%)'
          : 'radial-gradient(ellipse at 50% 30%, rgba(255,247,217,0.18) 0%, transparent 65%)',
        animation: urgent ? 't2-spot 0.45s ease-in-out infinite' : 'none',
        pointerEvents: 'none', zIndex: 1, transition: 'background .4s',
      }} />

      {/* the script — left wing. When urgent, the cards lean forward
          like the script is being flipped to the next page. */}
      <div style={{ position: 'absolute', top: 188, left: 22, width: 88, zIndex: 4 }}>
        <div style={{ fontFamily: T2.fontDisplay, fontSize: 10,
          color: T2.gold, letterSpacing: 3,
          textAlign: 'center', marginBottom: 4,
          borderBottom: `0.5px solid ${T2.gold}`, paddingBottom: 2,
          display: 'flex', justifyContent: 'space-between' }}>
          <span>劇</span><span style={{ opacity: 0.5 }}>·</span><span>本</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3,
          alignItems: 'center' }}>
          {sc.next3.map((c, i) => (
            <div key={i} style={{ position: 'relative',
              transform: `translateX(${i * 6}px) rotate(${urgent ? -2 + i * 2 : 0}deg)`,
              opacity: 1 - i * 0.2,
              transition: 'transform .35s' }}>
              <T2Card card={c} size={0.55} />
              <div style={{ position: 'absolute', top: '50%', right: -16,
                transform: 'translateY(-50%)',
                fontFamily: T2.fontDisplay, fontSize: 9,
                color: T2.gold, letterSpacing: 1 }}>{['壹','貳','叁'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* trap door — right wing — gets a faint pulsing glow when stash
          has cards, suggesting "ready to spring" */}
      <div style={{ position: 'absolute', top: 188, right: 22, width: 88, zIndex: 4 }}>
        <div style={{ fontFamily: T2.fontDisplay, fontSize: 10,
          color: T2.gold, letterSpacing: 3,
          textAlign: 'center', marginBottom: 4,
          borderBottom: `0.5px solid ${T2.gold}`, paddingBottom: 2 }}>
          暗 · 門
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3,
          alignItems: 'center', minHeight: 80, position: 'relative' }}>
          {sc.stash.length > 0 && (
            <div style={{ position: 'absolute', inset: -6,
              borderRadius: 6,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(212,165,67,0.18), transparent 70%)',
              animation: 't2-trap 1.4s ease-in-out infinite',
              pointerEvents: 'none' }} />
          )}
          {sc.stash.map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <T2Card card={c} size={0.55} lit />
              <div style={{ position: 'absolute', inset: -3,
                border: `0.5px dashed ${T2.gold}`,
                borderRadius: 4, pointerEvents: 'none' }} />
            </div>
          ))}
          {sc.stash.length === 0 && (
            <div style={{ width: 28, height: 40,
              border: `0.5px dashed ${T2.gold}`, opacity: 0.4,
              borderRadius: 3 }} />
          )}
          <div style={{ fontSize: 8, color: T2.inkDim, fontStyle: 'italic',
            textAlign: 'center', fontFamily: T2.fontUI, marginTop: 2 }}>
            點觸喚出
          </div>
        </div>
      </div>

      {/* dealer hand — magician's white-glove cue floats above the
          drawn card, hinting which card is "in play" */}
      <div style={{ position: 'absolute', top: 232, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 3 }}>
        <div style={{ position: 'relative', width: 150, height: 110 }}>
          {/* white-glove silhouette pointing at the lit card */}
          <div style={{ position: 'absolute', left: 70, top: -28,
            transformOrigin: 'bottom center',
            animation: urgent ? 't2-glove 0.5s ease-in-out infinite' : 't2-glove 1.6s ease-in-out infinite',
          }}>
            <svg width="38" height="32" viewBox="0 0 38 32" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="t2-glove-g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fff7d9" />
                  <stop offset="100%" stopColor="#d4c79a" />
                </linearGradient>
              </defs>
              {/* cuff */}
              <rect x="2" y="22" width="16" height="9" rx="1.5"
                fill={T2.velvet} stroke={T2.gold} strokeWidth="0.5" />
              {/* palm + fingers (stylised) */}
              <path d="M4 22 Q3 16 7 13 Q9 10 13 11 L20 7 Q25 5 27 9 Q29 12 26 16 L22 19 L20 22 Z"
                fill="url(#t2-glove-g)" stroke="#8a6a28" strokeWidth="0.4" />
              {/* index finger pointing right */}
              <path d="M22 12 L33 8 Q36 8 36 10 L25 14 Z"
                fill="url(#t2-glove-g)" stroke="#8a6a28" strokeWidth="0.4" />
              {/* button */}
              <circle cx="10" cy="26" r="0.9" fill={T2.gold} />
            </svg>
          </div>
          <div style={{ position: 'absolute', left: 8, top: 30,
            transform: 'rotate(-12deg)' }}>
            <T2Card hidden size={0.85} />
          </div>
          <div style={{ position: 'absolute', left: 36, top: 8,
            transform: 'rotate(-10deg)' }}>
            <T2Card hidden floating urgent={urgent} />
          </div>
          <div style={{ position: 'absolute', left: 70, top: 2 }}>
            <T2Card card={sc.dealer.cards[0]} floating lit urgent={urgent} />
          </div>
          <div style={{ position: 'absolute', left: 108, top: 8,
            transform: 'rotate(8deg)' }}>
            <T2Card card={sc.dealer.cards[1]} floating lit urgent={urgent} />
          </div>
        </div>
        <div style={{ marginTop: 4, fontFamily: T2.fontDisplay,
          fontSize: 11, color: T2.gold, letterSpacing: 4 }}>
          魔 · 術 · 師   <span style={{ color: T2.spot, marginLeft: 4 }}>{sc.dealer.score}</span>
        </div>
      </div>

      {/* tempo bar — sand pours into a brass tray below the stage.
          Width drains as `pct` decreases. A tiny sand pile grows on top. */}
      <div style={{ position: 'absolute', top: 410, left: 22, right: 22,
        zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', marginBottom: 3 }}>
          <div style={{ fontFamily: T2.fontDisplay, fontSize: 9,
            color: T2.gold, letterSpacing: 3, opacity: 0.85 }}>
            節 · 拍
          </div>
          <div style={{ fontFamily: T2.fontUI, fontSize: 8, fontStyle: 'italic',
            color: urgent ? '#ffb89c' : T2.inkDim, letterSpacing: 1,
            transition: 'color .3s' }}>
            {drum ? '一 · 鼓 · 起 ！' : urgent ? '觀眾屏息 · 動作！' : '魔術師等候你的口令'}
          </div>
        </div>
        {/* sand mound — grows from left as time passes */}
        <div style={{ position: 'relative', height: 10 }}>
          <div style={{ position: 'absolute', left: 0, bottom: 5,
            width: `${(1 - pct) * 100}%`, height: 6,
            background: urgent
              ? 'radial-gradient(ellipse at 50% 100%, #ff9a5a 0%, #c8782a 60%, transparent 100%)'
              : 'radial-gradient(ellipse at 50% 100%, #f4d28a 0%, #8a6a28 60%, transparent 100%)',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            opacity: 0.75, pointerEvents: 'none', transition: 'background .3s',
          }} />
          {/* falling grain */}
          {pct > 0.02 && (
            <div style={{ position: 'absolute',
              left: `calc(${(1 - pct) * 100}% - 0.5px)`,
              top: -10, width: 1, height: 16,
              background: urgent ? '#ff9a5a' : T2.gold,
              opacity: 0.7,
            }} />
          )}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
            height: 5, borderRadius: 1,
            background: 'rgba(0,0,0,0.55)',
            border: `0.5px solid ${T2.gold}`,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.7)',
            overflow: 'hidden' }}>
            <div style={{
              width: `${pct * 100}%`, height: '100%',
              background: urgent
                ? `linear-gradient(90deg, #ff5a30, #ff9a5a)`
                : `linear-gradient(90deg, #8a6a28, ${T2.gold})`,
              boxShadow: urgent ? '0 0 6px rgba(255,120,80,0.7)' : '0 0 4px rgba(212,165,67,0.5)',
              transition: 'background .3s',
            }} />
          </div>
        </div>
      </div>

      {/* audience — three balconies. Whispers pop on the non-active
          boxes when urgent, like a rumour spreading through the crowd. */}
      <div style={{ position: 'absolute', top: 442, left: 22, right: 22,
        display: 'flex', gap: 5, zIndex: 5 }}>
        {sc.players.map((p, i) => (
          <T2Audience key={p.id} p={p}
            active={p.status === 'active'}
            urgent={urgent}
            whisper={urgent ? ['他撐不住…', '快了快了', '靜——'][i] : null} />
        ))}
      </div>

      {/* cue cards — bottom action rail. Primary card pulses when urgent. */}
      <div style={{ position: 'absolute', bottom: 32, left: 22, right: 22,
        display: 'flex', gap: 6, zIndex: 7 }}>
        <button style={{
          flex: 2, padding: '12px 0',
          background: urgent
            ? `linear-gradient(180deg, #ffae6b, #c8782a)`
            : `linear-gradient(180deg, ${T2.gold}, #8a6a28)`,
          border: 'none', borderRadius: 2,
          color: '#1a0a0a', fontFamily: T2.fontDisplay,
          fontSize: 14, letterSpacing: 4, position: 'relative',
          boxShadow: 'inset 0 1px 0 rgba(255,247,217,0.5), 0 4px 10px rgba(0,0,0,0.6)',
          animation: urgent ? 't2-pulse 0.7s ease-in-out infinite' : 'none',
          transition: 'background .3s',
        }}>
          <span style={{ position: 'absolute', top: 3, left: 5,
            fontSize: 8, opacity: 0.6, letterSpacing: 0 }}>1</span>
          賜 · 牌
        </button>
        <button style={{
          flex: 2, padding: '12px 0',
          background: 'rgba(255,247,217,0.06)',
          border: `1px solid ${T2.gold}`, borderRadius: 2,
          color: T2.gold, fontFamily: T2.fontDisplay,
          fontSize: 13, letterSpacing: 3, position: 'relative',
        }}>
          <span style={{ position: 'absolute', top: 3, left: 5,
            fontSize: 8, opacity: 0.6, letterSpacing: 0 }}>2</span>
          藏 · 入 暗 門
        </button>
        <button style={{
          flex: 1.4, padding: '12px 0',
          background: 'rgba(122,31,31,0.4)',
          border: `1px solid ${T2.velvet}`, borderRadius: 2,
          color: T2.spot, fontFamily: T2.fontDisplay,
          fontSize: 12, letterSpacing: 2, position: 'relative',
        }}>
          <span style={{ position: 'absolute', top: 3, left: 5,
            fontSize: 8, opacity: 0.6, letterSpacing: 0 }}>3</span>
          誘 · 餌
        </button>
      </div>
    </div>
  );
}

window.TheatreScreen2 = TheatreScreen2;
