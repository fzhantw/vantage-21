// split.jsx — Variation 4: Split-Second
// Stretch concept: every dealer action runs against a countdown. The screen
// is built around a giant timer ring around the active player. Cards arrive
// pre-decided by the player; the dealer's window to "intervene" (deal /
// stash) is short. Hot palette (sodium orange) signals urgency.

const S = V21_THEMES.split;

function SplitCard({ card, size = 1, hidden = false, accent = S.accent, dim = false }) {
  const w = 46 * size, h = 64 * size;
  if (hidden) {
    return (
      <div style={{
        width: w, height: h, borderRadius: 4,
        background: '#1a1d24', border: `1px solid ${S.cool}`,
        position: 'relative', overflow: 'hidden',
        opacity: dim ? 0.5 : 1,
      }}>
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0 3px, rgba(58,142,255,0.12) 3px 4px)`,
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: S.fontDisplay, fontSize: 10 * size, fontWeight: 700,
          color: S.cool }}>?</div>
      </div>
    );
  }
  const c = V21_RED(card.s) ? S.accent : S.ink;
  return (
    <div style={{
      width: w, height: h, borderRadius: 4,
      background: '#fcfcfc',
      border: `1px solid ${accent}`,
      boxShadow: `0 2px 6px rgba(0,0,0,0.6)`,
      color: V21_RED(card.s) ? '#d73f1f' : '#0a0c10',
      fontFamily: S.fontDisplay,
      position: 'relative', opacity: dim ? 0.5 : 1,
    }}>
      <div style={{ position: 'absolute', top: 3 * size, left: 4 * size,
        fontSize: 13 * size, fontWeight: 700, lineHeight: 1 }}>{card.v}</div>
      <div style={{ position: 'absolute', top: 16 * size, left: 4 * size,
        fontSize: 9 * size }}>{card.s}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22 * size }}>{card.s}</div>
    </div>
  );
}

// Countdown ring around active player
function CountdownRing({ pct, size = 88, color = S.accent }) {
  const r = size / 2 - 4;
  const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

function SplitSeat({ p, active }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: '8px 6px',
      background: active ? 'rgba(255,85,48,0.08)' : S.bg2,
      border: active ? `1px solid ${S.accent}` : `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 6,
      boxShadow: active ? `0 0 16px rgba(255,85,48,0.3)` : 'none',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: S.fontDisplay, fontSize: 10, fontWeight: 700,
          color: active ? S.accent : S.ink, letterSpacing: 1 }}>
          {p.name.replace('閒家 ', 'P_')}
        </div>
        <div style={{ fontFamily: S.fontDisplay, fontSize: 9,
          color: S.inkDim, fontVariantNumeric: 'tabular-nums' }}>
          {p.chips}c
        </div>
      </div>
      <div style={{ fontFamily: S.fontDisplay, fontSize: 8, color: S.inkDim,
        marginTop: 1 }}>BET {p.bet}</div>
      <div style={{ height: 46, position: 'relative', marginTop: 4 }}>
        {p.hand.map((c, i) => (
          <div key={i} style={{ position: 'absolute', left: i * 13, top: i * 1 }}>
            <SplitCard card={c} size={0.62} hidden={c.hidden} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, fontSize: 9, fontFamily: S.fontUI,
        color: active ? S.accent2 : S.inkDim, textAlign: 'center', minHeight: 12 }}>
        {p.hint}
      </div>
    </div>
  );
}

function SplitScreen() {
  const sc = V21_SCENE;
  const remainingSec = 2.4;        // mock countdown: 2.4 / 4.0
  const pct = remainingSec / 4;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: S.bg, color: S.ink, fontFamily: S.fontUI,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* heat-shimmer top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90,
        background: `radial-gradient(ellipse at 50% 0%, rgba(255,85,48,0.25), transparent 70%)`,
        pointerEvents: 'none' }} />

      {/* header — round + global tempo */}
      <div style={{ position: 'absolute', top: 56, left: 12, right: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 5 }}>
        <div style={{ fontFamily: S.fontDisplay, fontSize: 11, fontWeight: 700,
          color: S.inkDim, letterSpacing: 2 }}>R · 03 / TEMPO ▮▮▮▯▯</div>
        <div style={{ fontFamily: S.fontDisplay, fontSize: 11, color: S.accent,
          fontWeight: 700, letterSpacing: 1, textShadow: `0 0 6px ${S.accent}` }}>
          ● LIVE
        </div>
      </div>

      {/* dual readouts: future-3 + stash, compact bars */}
      <div style={{ position: 'absolute', top: 84, left: 12, right: 12,
        display: 'flex', gap: 6, zIndex: 4 }}>
        <div style={{ flex: 1, background: S.bg2, borderRadius: 6,
          padding: '6px 8px',
          borderLeft: `2px solid ${S.cool}` }}>
          <div style={{ fontFamily: S.fontDisplay, fontSize: 9,
            color: S.cool, letterSpacing: 1.5, fontWeight: 700 }}>NEXT 3 ▸</div>
          <div style={{ display: 'flex', gap: 3, marginTop: 4,
            justifyContent: 'space-between' }}>
            {sc.next3.map((c, i) => (
              <SplitCard key={i} card={c} size={0.5} accent={S.cool} dim={i > 0} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: S.bg2, borderRadius: 6,
          padding: '6px 8px',
          borderLeft: `2px solid ${S.accent2}` }}>
          <div style={{ fontFamily: S.fontDisplay, fontSize: 9,
            color: S.accent2, letterSpacing: 1.5, fontWeight: 700 }}>STASH ▸ 1</div>
          <div style={{ display: 'flex', gap: 3, marginTop: 4, height: 36, alignItems: 'center' }}>
            {sc.stash.map((c, i) => (
              <SplitCard key={i} card={c} size={0.5} accent={S.accent2} />
            ))}
            <div style={{ flex: 1, fontSize: 8, color: S.inkDim,
              fontFamily: S.fontDisplay, paddingLeft: 4 }}>READY</div>
          </div>
        </div>
      </div>

      {/* big decision panel: dealer hand + active player + countdown */}
      <div style={{ position: 'absolute', top: 168, left: 12, right: 12, zIndex: 3 }}>
        {/* dealer row */}
        <div style={{ background: S.bg2, borderRadius: 6,
          padding: '10px 12px',
          border: `1px solid rgba(255,255,255,0.08)`,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: S.fontDisplay, fontSize: 9,
            color: S.inkDim, letterSpacing: 1.5, writingMode: 'vertical-rl',
            transform: 'rotate(180deg)' }}>HOUSE</div>
          <div style={{ position: 'relative', width: 32, height: 46 }}>
            <SplitCard hidden size={0.7} />
            <div style={{ position: 'absolute', bottom: -12, left: 0, right: 0,
              textAlign: 'center', fontSize: 8, fontFamily: S.fontDisplay,
              color: S.inkDim }}>{sc.deckCount}</div>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 3 }}>
            <SplitCard hidden size={0.85} />
            <SplitCard card={sc.dealer.cards[0]} size={0.85} accent={S.cool} />
            <SplitCard card={sc.dealer.cards[1]} size={0.85} accent={S.cool} />
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: S.fontDisplay, fontSize: 9, color: S.inkDim }}>SHOW</div>
            <div style={{ fontFamily: S.fontDisplay, fontSize: 22, fontWeight: 700,
              color: S.ink, lineHeight: 1 }}>{sc.dealer.score}</div>
          </div>
        </div>

        {/* countdown decision module — emphasises B and the live timer */}
        <div style={{ marginTop: 10, background: 'rgba(255,85,48,0.06)',
          border: `1px solid ${S.accent}`,
          borderRadius: 6, padding: '12px 14px',
          boxShadow: `0 0 20px rgba(255,85,48,0.18)`,
          position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* countdown ring + count */}
            <div style={{ position: 'relative', width: 88, height: 88,
              flexShrink: 0 }}>
              <CountdownRing pct={pct} />
              <div style={{ position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: S.fontDisplay, fontSize: 26,
                  fontWeight: 700, color: S.accent, lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: `0 0 8px ${S.accent}` }}>2.4</div>
                <div style={{ fontFamily: S.fontDisplay, fontSize: 8,
                  color: S.inkDim, letterSpacing: 1 }}>SECS</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: S.fontDisplay, fontSize: 9,
                color: S.accent, letterSpacing: 2, fontWeight: 700 }}>
                ▌ DECIDE NOW
              </div>
              <div style={{ fontFamily: S.fontUI, fontSize: 13, fontWeight: 700,
                color: S.ink, marginTop: 2 }}>
                B 要牌 — 你要插手嗎？
              </div>
              <div style={{ fontFamily: S.fontUI, fontSize: 10,
                color: S.inkDim, marginTop: 2, lineHeight: 1.4 }}>
                下一張為 ♠6。發給 B 即 14 點，依然安全。<br/>
                扣下後可暗算莊家或他人。
              </div>
            </div>
          </div>
          {/* tempo bar */}
          <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.08)',
            borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${pct * 100}%`, height: '100%',
              background: `linear-gradient(90deg, ${S.accent2}, ${S.accent})`,
              boxShadow: `0 0 8px ${S.accent}` }} />
          </div>
        </div>
      </div>

      {/* three players — small bottom strip */}
      <div style={{ position: 'absolute', top: 470, left: 12, right: 12,
        display: 'flex', gap: 5, zIndex: 5 }}>
        {sc.players.map(p => (
          <SplitSeat key={p.id} p={p} active={p.status === 'active'} />
        ))}
      </div>

      {/* hot action bar — tap = commit */}
      <div style={{ position: 'absolute', bottom: 30, left: 12, right: 12,
        display: 'flex', gap: 6, zIndex: 7 }}>
        <button style={{
          flex: 2, padding: '12px 0',
          background: `linear-gradient(180deg, ${S.accent2}, ${S.accent})`,
          border: 'none', borderRadius: 6,
          color: '#0a0c10', fontFamily: S.fontDisplay,
          fontSize: 14, fontWeight: 700, letterSpacing: 1,
          boxShadow: `0 0 18px rgba(255,85,48,0.5), inset 0 1px 0 rgba(255,255,255,0.3)`,
        }}>DEAL ▸ B</button>
        <button style={{
          flex: 1.6, padding: '12px 0',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${S.cool}`, borderRadius: 6,
          color: S.cool, fontFamily: S.fontDisplay,
          fontSize: 13, fontWeight: 700, letterSpacing: 1,
        }}>STASH</button>
        <button style={{
          flex: 1.2, padding: '12px 0',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6,
          color: S.inkDim, fontFamily: S.fontDisplay,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
        }}>HOLD</button>
      </div>
    </div>
  );
}

window.SplitScreen = SplitScreen;
