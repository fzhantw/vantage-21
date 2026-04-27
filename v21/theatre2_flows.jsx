// theatre2_flows.jsx — 03b 全流程展開
// 9 個流程,每個 3 張連續畫面,展示中間轉場。
// 共用 03b 的劇場美學:紅幕、銅金、聚光、沙漏。
//
// 為了讓每張畫面都簡潔可讀,這裡用一個 StageShell 統一處理紅幕、
// 標題列、底部動作鍵位的固定元素;每個 frame 的差異集中在中央
// 舞台 + 沙漏狀態 + 旁白。

const F = V21_THEMES.theatre;

// 共用樣式速記
const fxOnce = `
  @keyframes fx-fly { 0%{transform:translate(40px,-40px) rotate(-30deg);opacity:0} 100%{transform:translate(0,0) rotate(0);opacity:1} }
  @keyframes fx-flutter { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes fx-shimmer { 0%,100%{opacity:.7} 50%{opacity:1} }
`;

// 牌(精簡版) — 重用 03b 的卡牌語彙,但縮一小號做流程畫面
function FCard({ card, size = 1, hidden = false, lit = false, rotate = 0, fly = false, dim = false, x = 0, y = 0 }) {
  const w = 44 * size, h = 62 * size;
  const base = {
    width: w, height: h, borderRadius: 3,
    position: 'absolute', left: x, top: y,
    transform: `rotate(${rotate}deg)`,
    opacity: dim ? 0.35 : 1,
    transition: 'all .35s cubic-bezier(.2,.8,.2,1)',
    animation: fly ? 'fx-fly .55s cubic-bezier(.2,.8,.2,1) both' : 'none',
  };
  if (hidden) {
    return (
      <div style={{ ...base,
        background: `linear-gradient(135deg, ${F.velvet}, ${F.velvetDeep})`,
        border: `1px solid ${F.gold}`,
        boxShadow: lit ? `0 6px 14px rgba(0,0,0,.6), 0 0 14px rgba(212,165,67,.4)` : `0 3px 6px rgba(0,0,0,.6)`,
      }}>
        <div style={{ position: 'absolute', inset: 2, border: `0.5px solid ${F.gold}`, opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: F.fontDisplay, fontSize: 14 * size, color: F.gold, textShadow: '0 0 6px rgba(212,165,67,.6)' }}>★</div>
      </div>
    );
  }
  const c = V21_RED(card.s) ? '#a01818' : '#1a1212';
  return (
    <div style={{ ...base,
      background: lit ? 'linear-gradient(180deg,#fffaeb,#f0dfae)' : 'linear-gradient(180deg,#f5e8c8,#d6c08c)',
      boxShadow: lit ? `0 5px 12px rgba(0,0,0,.5), 0 0 14px rgba(255,247,217,.4)` : `0 3px 6px rgba(0,0,0,.55)`,
      color: c, fontFamily: F.fontDisplay,
    }}>
      <div style={{ position: 'absolute', top: 3 * size, left: 4 * size, fontSize: 12 * size, lineHeight: 1 }}>{card.v}</div>
      <div style={{ position: 'absolute', top: 14 * size, left: 4 * size, fontSize: 8 * size }}>{card.s}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24 * size, fontFamily: 'serif' }}>{card.s}</div>
    </div>
  );
}

// 共用舞台殼 — 紅幕 + 標題 + 沙漏 + 子節 + 底部一行動作
function StageShell({ act, title, stage, hourPct = 1, urgent = false, narration, children }) {
  return (
    <div style={{ width: '100%', height: '100%', background: F.bg, color: F.ink,
      fontFamily: F.fontUI, position: 'relative', overflow: 'hidden' }}>
      <style>{fxOnce}</style>
      {/* 紅幕邊 */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 14,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,.3) 0 2px, transparent 2px 6px), linear-gradient(90deg, ${F.velvet}, ${F.velvetDeep})`,
        boxShadow: 'inset -3px 0 6px rgba(0,0,0,.7)', zIndex: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 14,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,.3) 0 2px, transparent 2px 6px), linear-gradient(-90deg, ${F.velvet}, ${F.velvetDeep})`,
        boxShadow: 'inset 3px 0 6px rgba(0,0,0,.7)', zIndex: 6, pointerEvents: 'none' }} />

      {/* 標題列 */}
      <div style={{ position: 'absolute', top: 50, left: 18, right: 18, textAlign: 'center', zIndex: 5 }}>
        <div style={{ fontFamily: F.fontDisplay, fontSize: 10, color: F.gold, letterSpacing: 5, opacity: .7 }}>{act}</div>
        <div style={{ fontFamily: F.fontDisplay, fontSize: 16, color: urgent ? '#ffb89c' : F.spot, letterSpacing: 2,
          textShadow: `0 0 8px ${urgent ? 'rgba(255,150,110,.6)' : 'rgba(255,247,217,.5)'}` }}>{title}</div>
        {stage && <div style={{ fontFamily: F.fontUI, fontSize: 8, fontStyle: 'italic',
          color: urgent ? '#ffb89c' : F.inkDim, marginTop: 2, letterSpacing: 1 }}>── {stage} ──</div>}
      </div>

      {/* 微型沙漏(右上角) */}
      <div style={{ position: 'absolute', top: 96, right: 22, zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ fontFamily: F.fontDisplay, fontSize: 11, fontVariantNumeric: 'tabular-nums',
          color: urgent ? '#ff8a5a' : F.gold, textShadow: urgent ? '0 0 6px rgba(255,120,80,.7)' : 'none' }}>
          {(hourPct * 4).toFixed(1)}
        </div>
        <svg width="14" height="20" viewBox="0 0 14 20">
          <rect x="1" y="0" width="12" height="2" fill={F.gold} />
          <rect x="1" y="18" width="12" height="2" fill={F.gold} />
          <path d="M2 2 L12 2 L8 10 L6 10 Z" fill="rgba(20,8,8,.85)" stroke={F.gold} strokeWidth=".6" />
          <path d="M6 10 L8 10 L12 18 L2 18 Z" fill="rgba(20,8,8,.85)" stroke={F.gold} strokeWidth=".6" />
          <path d={`M2 ${2 + (1 - hourPct) * 7} L12 ${2 + (1 - hourPct) * 7} L8 10 L6 10 Z`}
            fill={urgent ? '#ff8a5a' : F.gold} opacity=".85" />
          <path d={`M2 18 L12 18 L${12 - (1 - hourPct) * 4} ${18 - (1 - hourPct) * 7} L${2 + (1 - hourPct) * 4} ${18 - (1 - hourPct) * 7} Z`}
            fill={urgent ? '#ff8a5a' : F.gold} opacity=".85" />
        </svg>
      </div>

      {/* 中央舞台 */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: 130, paddingBottom: 60 }}>
        {children}
      </div>

      {/* 旁白 */}
      {narration && (
        <div style={{ position: 'absolute', bottom: 18, left: 22, right: 22, zIndex: 7,
          fontFamily: F.fontUI, fontSize: 10, fontStyle: 'italic',
          color: F.inkDim, textAlign: 'center', letterSpacing: 1,
          borderTop: `0.5px solid ${F.gold}`, paddingTop: 6, opacity: .85 }}>
          {narration}
        </div>
      )}
    </div>
  );
}

// 旁白 / 提示 / 標籤 通用迷你元件
function Beat({ children, color = F.gold, top, left, right, size = 9, letter = 3 }) {
  return (
    <div style={{ position: 'absolute', top, left, right,
      fontFamily: F.fontDisplay, fontSize: size, color,
      letterSpacing: letter, textAlign: 'center', zIndex: 4 }}>{children}</div>
  );
}

// ───────────────────────────────────────────────
// 流程 1 · 開場入座 — 紅幕升起 → 洗牌 → 入座
// ───────────────────────────────────────────────
function F1_Curtain() {
  return (
    <StageShell act="幕 · 啟" title="紅 幕 升 起" stage="觀眾入場 · 燈火漸亮"
      narration="魔術師走上中央,摘下高帽 — 沙漏未起。">
      {/* 升起的紅幕 — 上方留條縫 */}
      <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 220,
        background: `linear-gradient(180deg, ${F.velvet} 0%, #5a1414 70%, transparent 100%)`,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 4px, transparent 4px 14px), linear-gradient(180deg, ${F.velvet}, #5a1414)`,
        boxShadow: 'inset 0 -10px 30px rgba(0,0,0,.7)', zIndex: 4, pointerEvents: 'none' }} />
      {/* 高帽 */}
      <div style={{ position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%)' }}>
        <svg width="80" height="70" viewBox="0 0 80 70">
          <ellipse cx="40" cy="62" rx="32" ry="6" fill="rgba(0,0,0,.4)" />
          <rect x="22" y="18" width="36" height="40" rx="2" fill="#0a0606" stroke={F.gold} strokeWidth=".6" />
          <ellipse cx="40" cy="18" rx="18" ry="3" fill="#1a0a0a" stroke={F.gold} strokeWidth=".6" />
          <rect x="22" y="42" width="36" height="3" fill={F.velvet} />
          <ellipse cx="40" cy="58" rx="22" ry="3" fill="#0a0606" stroke={F.gold} strokeWidth=".6" />
        </svg>
      </div>
      <Beat top={360} left={0} right={0}>魔 · 術 · 師 · 登 · 場</Beat>
    </StageShell>
  );
}
function F2_Shuffle() {
  // 牌張呈扇形展開
  return (
    <StageShell act="幕 · 啟" title="洗 牌" stage="銀河瀑布 · 五十二張"
      narration="牌張在指尖瀑布而下,觀眾屏息。">
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 200 }}>
        {[...Array(13)].map((_, i) => {
          const angle = (i - 6) * 7;
          const x = 180 + (i - 6) * 14;
          const y = 60 + Math.abs(i - 6) * 3;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, transformOrigin: 'bottom center',
              transform: `rotate(${angle}deg)` }}>
              <FCard hidden size={0.9} />
            </div>
          );
        })}
      </div>
      <Beat top={420} left={0} right={0}>五 · 十 · 二 · 章 · 劇 · 本</Beat>
    </StageShell>
  );
}
function F3_Seats() {
  // 三個觀眾席就座 + 籌碼壓注
  return (
    <StageShell act="幕 · 啟" title="入 · 座 · 押 · 注" stage="觀眾席亮燈 · 三注落定"
      narration="壹 · 貳 · 叁 各押五枚 — 燈光漸暗,沙漏待啟。">
      <div style={{ position: 'absolute', top: 200, left: 22, right: 22, display: 'flex', gap: 8 }}>
        {['壹','貳','叁'].map((n, i) => (
          <div key={i} style={{ flex: 1, padding: '12px 6px',
            background: `linear-gradient(180deg, rgba(58,10,10,.7), rgba(20,4,4,.85))`,
            borderRadius: '24px 24px 4px 4px', border: `1px solid ${F.gold}`,
            textAlign: 'center', position: 'relative' }}>
            <div style={{ fontFamily: F.fontDisplay, fontSize: 16, color: F.gold, letterSpacing: 2 }}>{n}</div>
            <div style={{ marginTop: 8, height: 30, position: 'relative' }}>
              {[0,1,2,3,4].map(j => (
                <div key={j} style={{ position: 'absolute', left: '50%', bottom: j * 4,
                  transform: 'translateX(-50%)', width: 18, height: 4, borderRadius: '50%',
                  background: j % 2 ? F.gold : '#c8492f', boxShadow: '0 1px 2px rgba(0,0,0,.6)' }} />
              ))}
            </div>
            <div style={{ fontSize: 8, color: F.inkDim, fontFamily: F.fontUI, marginTop: 2 }}>注 5</div>
          </div>
        ))}
      </div>
      {/* 中央等待中的莊家位置 — 空位 */}
      <Beat top={400} left={0} right={0} color={F.spot} size={11}>魔 · 術 · 師 · 待 · 啟 · 沙 · 漏</Beat>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 2 · 第一輪發牌
// ───────────────────────────────────────────────
function F4_DealStart() {
  return (
    <StageShell act="幕 · 一" title="發 牌" stage="袖中飛出 · 第一張" hourPct={1}
      narration="魔術師抬手 — 沙漏倒置,時間始流。">
      <div style={{ position: 'absolute', top: 180, left: 0, right: 0, height: 220 }}>
        {/* 牌堆 */}
        <div style={{ position: 'absolute', left: 24, top: 30 }}>
          {[0,1,2,3].map(i => (
            <FCard key={i} hidden size={0.9} x={i * 1} y={-i * 1} />
          ))}
        </div>
        {/* 飛行軌跡(虛線) */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <path d="M70 60 Q170 20 270 80" stroke={F.gold} strokeWidth="0.8"
            strokeDasharray="3 3" fill="none" opacity=".6" />
        </svg>
        {/* 一張正在飛 */}
        <div style={{ position: 'absolute', left: 270, top: 80, transform: 'rotate(-12deg)' }}>
          <FCard hidden size={0.9} lit />
        </div>
      </div>
      <Beat top={400} left={0} right={0}>第 · 一 · 張 · 翼 · 也</Beat>
    </StageShell>
  );
}
function F5_DealAll() {
  // 所有人都拿到第一張
  return (
    <StageShell act="幕 · 一" title="三 家 · 莊 一" stage="第一輪派發完成" hourPct={0.95}
      narration="人手一張,皆藏其面 — 風暴前的靜默。">
      <div style={{ position: 'absolute', top: 170, left: 0, right: 0, height: 100,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 80, height: 90 }}>
          <FCard hidden size={1} x={0} y={0} />
          <Beat top={70} left={0} right={0} size={9}>魔 · 術 · 師</Beat>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 360, left: 22, right: 22, display: 'flex', gap: 8 }}>
        {['壹','貳','叁'].map((n, i) => (
          <div key={i} style={{ flex: 1, position: 'relative', height: 100, textAlign: 'center' }}>
            <div style={{ position: 'relative', height: 60 }}>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                <FCard hidden size={0.7} />
              </div>
            </div>
            <div style={{ fontFamily: F.fontDisplay, fontSize: 10, color: F.gold, letterSpacing: 2 }}>{n}</div>
          </div>
        ))}
      </div>
    </StageShell>
  );
}
function F6_DealReveal() {
  // 每人翻開明牌
  const sc = V21_SCENE;
  return (
    <StageShell act="幕 · 一" title="明 牌 · 落 定" stage="第二張翻開 · 點數浮現" hourPct={0.9}
      narration="點數浮現:壹 9、貳 8、叁 6 — B 開始計算。">
      {/* 莊家:1 暗 + 1 明 */}
      <div style={{ position: 'absolute', top: 165, left: 0, right: 0, height: 100,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 110, height: 90 }}>
          <FCard hidden size={0.95} x={0} y={6} rotate={-8} />
          <FCard card={sc.dealer.cards[0]} lit size={0.95} x={42} y={0} />
          <Beat top={72} left={0} right={0} size={9}>魔 · 術 · 師 · ?+8</Beat>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 350, left: 22, right: 22, display: 'flex', gap: 8 }}>
        {sc.players.map((p, i) => (
          <div key={i} style={{ flex: 1, position: 'relative', height: 110, textAlign: 'center' }}>
            <div style={{ position: 'relative', height: 70 }}>
              <FCard hidden size={0.65} x={6} y={4} rotate={-6} />
              <FCard card={p.hand[1] || sc.next3[i]} lit={p.status === 'active'} size={0.65} x={28} y={0} />
            </div>
            <div style={{ fontFamily: F.fontDisplay, fontSize: 10, color: F.gold, letterSpacing: 2 }}>{['壹','貳','叁'][i]}</div>
          </div>
        ))}
      </div>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 3 · 玩家行動(B 思考 → 要牌 → 落定)
// ───────────────────────────────────────────────
function F7_Bthink() {
  return (
    <StageShell act="幕 · 三" title="B · 之 · 抉 擇" stage="閒家 B 點頭 · 要牌" hourPct={0.6}
      narration="B 抬眼,輕點 — 觀眾席屏息。">
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 100,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 86, padding: 8, border: `1.5px solid ${F.gold}`, borderRadius: '24px 24px 4px 4px',
          background: 'linear-gradient(180deg, rgba(212,165,67,.2), rgba(122,31,31,.1))',
          textAlign: 'center', boxShadow: '0 0 18px rgba(212,165,67,.5)' }}>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 16, color: F.spot, letterSpacing: 2,
            textShadow: '0 0 8px rgba(255,247,217,.6)' }}>貳</div>
          <div style={{ position: 'relative', height: 60, marginTop: 4 }}>
            <FCard hidden size={0.75} x={6} y={0} rotate={-8} />
            <FCard card={{s:'♣',v:'8'}} lit size={0.75} x={32} y={0} rotate={6} />
          </div>
          <div style={{ fontSize: 9, color: F.spot, fontStyle: 'italic', marginTop: 6,
            fontFamily: F.fontUI }}>「我要牌!」</div>
        </div>
      </div>
      <Beat top={360} left={0} right={0} color={F.spot} size={10}>暗 · 牌 = ?  · 明 · 牌 = 8 · 求 · 13</Beat>
    </StageShell>
  );
}
function F8_BdrawFlying() {
  return (
    <StageShell act="幕 · 三" title="一 · 牌 · 飛 · 來" stage="魔術師抬手 · 牌在空中" hourPct={0.45}
      narration="一張白光劃過劇場 — 那是 ♠6。">
      <svg style={{ position: 'absolute', top: 180, left: 0, width: '100%', height: 220 }}>
        <path d="M180 30 Q220 80 180 180" stroke={F.gold} strokeWidth="0.6"
          strokeDasharray="3 3" fill="none" opacity=".7" />
      </svg>
      <div style={{ position: 'absolute', top: 180, left: 150 }}>
        <FCard hidden size={0.9} lit rotate={-15} fly />
      </div>
      <div style={{ position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 10px', border: `0.5px solid ${F.gold}`,
          borderRadius: 2, background: 'rgba(0,0,0,.6)' }}>
          <span style={{ fontFamily: F.fontDisplay, fontSize: 11, color: '#a01818' }}>♠ 6</span>
          <span style={{ fontFamily: F.fontUI, fontSize: 9, color: F.inkDim, marginLeft: 8 }}>第一張劇本</span>
        </div>
      </div>
    </StageShell>
  );
}
function F9_BlandSafe() {
  return (
    <StageShell act="幕 · 三" title="14 · 點 · 安 全" stage="B 微笑 · 觀眾鼓掌" hourPct={1}
      narration="掌聲雷動,沙漏歸位 — 換下一位思考者。">
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 100,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 110, padding: 8, border: `1.5px solid ${F.gold}`, borderRadius: '24px 24px 4px 4px',
          background: 'linear-gradient(180deg, rgba(212,165,67,.25), rgba(122,31,31,.15))', textAlign: 'center' }}>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 16, color: F.spot, letterSpacing: 2 }}>貳</div>
          <div style={{ position: 'relative', height: 70, marginTop: 4 }}>
            <FCard hidden size={0.7} x={6} y={4} rotate={-12} />
            <FCard card={{s:'♣',v:'8'}} size={0.7} x={32} y={0} />
            <FCard card={{s:'♠',v:'6'}} lit size={0.7} x={58} y={4} rotate={10} />
          </div>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 18, color: F.gold, marginTop: 6 }}>14</div>
          <div style={{ fontSize: 8, color: F.inkDim, fontStyle: 'italic', fontFamily: F.fontUI }}>安全著陸</div>
        </div>
      </div>
      <Beat top={400} left={0} right={0} color={F.spot} size={10}>掌 · 聲 · 雷 · 動</Beat>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 4 · 暗門使用
// ───────────────────────────────────────────────
function F10_TrapHover() {
  return (
    <StageShell act="幕 · 暗" title="暗 · 門 · 啟 動" stage="魔術師指向右側暗門" hourPct={0.7}
      narration="袖口微啟 — 一張牌將被藏入時間之外。">
      <div style={{ position: 'absolute', top: 180, right: 26, width: 110, padding: 8,
        border: `1px dashed ${F.gold}`, borderRadius: 6,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(212,165,67,.18), transparent 70%)',
        textAlign: 'center', boxShadow: '0 0 22px rgba(212,165,67,.4)' }}>
        <div style={{ fontFamily: F.fontDisplay, fontSize: 11, color: F.gold, letterSpacing: 3 }}>暗 · 門</div>
        <div style={{ position: 'relative', height: 50, marginTop: 6 }}>
          <FCard hidden size={0.6} x={28} y={0} lit />
        </div>
        <div style={{ fontSize: 8, color: F.spot, fontStyle: 'italic', fontFamily: F.fontUI, marginTop: 4 }}>
          ◐ 點觸喚出
        </div>
      </div>
      <Beat top={350} left={0} right={0} size={10}>選 · 一 · 張 · 藏 · 入 · 時 · 外</Beat>
    </StageShell>
  );
}
function F11_TrapDrop() {
  // 牌正在沉入暗門 — 漏斗動效
  return (
    <StageShell act="幕 · 暗" title="沉 · 入" stage="牌沒入地板的金光中" hourPct={0.55}
      narration="一陣金粉,牌消失了 — 只待下一幕重現。">
      <div style={{ position: 'absolute', top: 220, left: '50%', transform: 'translateX(-50%)',
        width: 140, height: 160, textAlign: 'center' }}>
        {/* 漏斗光柱 */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(212,165,67,.6), transparent 60%)',
          clipPath: 'polygon(20% 0, 80% 0, 60% 100%, 40% 100%)' }} />
        <div style={{ position: 'absolute', left: 50, top: 60 }}>
          <FCard card={{s:'♦',v:'Q'}} size={0.7} lit rotate={6} />
        </div>
        {/* 金粉點 */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ position: 'absolute',
            left: 30 + Math.random() * 80, top: 100 + i * 6,
            width: 2, height: 2, background: F.gold, opacity: .6 - i * .05,
            borderRadius: '50%' }} />
        ))}
      </div>
      <Beat top={420} left={0} right={0} color={F.gold} size={10}>♦ · Q · 入 · 暗 · 門</Beat>
    </StageShell>
  );
}
function F12_TrapClose() {
  return (
    <StageShell act="幕 · 暗" title="封 · 印" stage="暗門關閉 · 一張在裡" hourPct={1}
      narration="觀眾席悄聲議論 — 莊家的牌少了一張。">
      <div style={{ position: 'absolute', top: 200, right: 26, width: 110, padding: 8,
        border: `1px solid ${F.gold}`, borderRadius: 6,
        background: 'rgba(20,4,4,.9)', textAlign: 'center' }}>
        <div style={{ fontFamily: F.fontDisplay, fontSize: 11, color: F.gold, letterSpacing: 3 }}>暗 · 門 · 1</div>
        <div style={{ position: 'relative', height: 50, marginTop: 6 }}>
          <div style={{ width: 28, height: 40, margin: '0 auto', borderRadius: 3,
            background: F.velvetDeep, border: `0.5px solid ${F.gold}`,
            boxShadow: 'inset 0 0 6px rgba(212,165,67,.4)' }} />
        </div>
        <div style={{ fontSize: 8, color: F.gold, fontFamily: F.fontUI, marginTop: 4 }}>已封 · 待用</div>
      </div>
      <Beat top={380} left={0} right={0} size={10}>下 · 一 · 幕 · 啟 · 用</Beat>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 5 · 誘餌(全桌跟注)
// ───────────────────────────────────────────────
function F13_LurePlay() {
  return (
    <StageShell act="幕 · 誘" title="誘 · 餌" stage="魔術師佯裝失手" hourPct={0.8}
      narration="一張紅心 Q 滑落 — 是真失手?還是劇本?">
      <div style={{ position: 'absolute', top: 200, left: '50%', transform: 'translateX(-50%) rotate(-25deg)' }}>
        <FCard card={{s:'♥',v:'Q'}} size={1.2} lit />
      </div>
      <Beat top={340} left={0} right={0} color={F.spot} size={10}>「啊 — 失 · 手 · 了 ?」</Beat>
      <Beat top={370} left={0} right={0} color={F.inkDim} size={9} letter={1}>(觀眾席:壹竊喜 · 貳遲疑 · 叁起身)</Beat>
    </StageShell>
  );
}
function F14_LureFollow() {
  // 三家籌碼飛入中央
  return (
    <StageShell act="幕 · 誘" title="跟 · 注" stage="三家加碼 · 籌碼飛中央" hourPct={0.65}
      narration="壹貳叁皆下重注 — 籌碼如蝶,湧向魔術師。">
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d="M50 500 Q160 320 180 290" stroke={F.gold} strokeWidth=".6" strokeDasharray="3 3" fill="none" opacity=".5" />
        <path d="M180 510 Q180 360 180 290" stroke={F.gold} strokeWidth=".6" strokeDasharray="3 3" fill="none" opacity=".5" />
        <path d="M310 500 Q200 320 180 290" stroke={F.gold} strokeWidth=".6" strokeDasharray="3 3" fill="none" opacity=".5" />
      </svg>
      <div style={{ position: 'absolute', top: 270, left: '50%', transform: 'translateX(-50%)' }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ position: 'absolute', left: -10 + (i % 4) * 4, bottom: i * 3,
            width: 22, height: 5, borderRadius: '50%',
            background: i % 2 ? F.gold : '#c8492f', boxShadow: '0 1px 2px rgba(0,0,0,.6)' }} />
        ))}
      </div>
      <Beat top={400} left={0} right={0}>跟 · 10 · 跟 · 10 · 跟 · 10</Beat>
    </StageShell>
  );
}
function F15_LurePot() {
  return (
    <StageShell act="幕 · 誘" title="底 · 池 · 三 · 倍" stage="燈光收攏 · 重心壓向莊家" hourPct={0.5}
      narration="底池漲至 30 — 賭注高了,沙漏走得更快了。">
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '14px 20px', border: `1px solid ${F.gold}`,
          borderRadius: 2, background: 'rgba(0,0,0,.55)', boxShadow: '0 0 24px rgba(212,165,67,.4)' }}>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 9, color: F.gold, letterSpacing: 4 }}>底 · 池</div>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 38, color: F.spot,
            fontVariantNumeric: 'tabular-nums', textShadow: '0 0 12px rgba(255,247,217,.6)' }}>30</div>
          <div style={{ fontFamily: F.fontUI, fontSize: 8, color: F.inkDim, fontStyle: 'italic' }}>三 · 倍 · 沸 · 騰</div>
        </div>
      </div>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 6 · 倒數逾時 → 強制結算
// ───────────────────────────────────────────────
function F16_TimeLow() {
  return (
    <StageShell act="幕 · 急" title="幕 · 將 · 落" stage="沙漏將盡 · 鼓聲漸密" hourPct={0.18} urgent
      narration="觀眾屏息 — 0.7 秒,你的選擇?">
      <div style={{ position: 'absolute', top: 200, left: '50%', transform: 'translateX(-50%) scale(1.4)' }}>
        <svg width="56" height="78" viewBox="0 0 56 78" style={{ filter: 'drop-shadow(0 0 12px rgba(255,120,80,.7))' }}>
          <rect x="6" y="3" width="44" height="5" rx="1" fill={F.gold} />
          <rect x="6" y="70" width="44" height="5" rx="1" fill={F.gold} />
          <path d="M10 8 L46 8 L30 39 L26 39 Z" fill="rgba(20,8,8,.85)" stroke={F.gold} strokeWidth="1" />
          <path d="M26 39 L30 39 L46 70 L10 70 Z" fill="rgba(20,8,8,.85)" stroke={F.gold} strokeWidth="1" />
          <path d="M10 35 L46 35 L30 39 L26 39 Z" fill="#ff8a5a" opacity=".9" />
          <rect x="27.4" y="39" width="1.2" height="22" fill="#ff8a5a" />
          <path d="M14 70 L42 70 L42 50 L14 50 Z" fill="#ff8a5a" opacity=".9" />
        </svg>
      </div>
      <Beat top={360} left={0} right={0} color="#ff8a5a" size={12}>0 · 7 · 秒</Beat>
      <Beat top={390} left={0} right={0} color={F.inkDim} size={9} letter={1}>(觀眾席:他撐不住 · 快了 · 靜——)</Beat>
    </StageShell>
  );
}
function F17_TimeOut() {
  return (
    <StageShell act="幕 · 急" title="沙 · 盡 · 強 · 制" stage="紅光爆發 · 系統介入" hourPct={0} urgent
      narration="沙漏空了 — 主角失語,劇本自動翻頁。">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(255,90,60,.4), transparent 60%)',
        animation: 'fx-shimmer 0.4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '10px 20px', border: `2px solid #ff5a30`,
          background: 'rgba(122,31,31,.55)', boxShadow: '0 0 28px rgba(255,90,60,.6)' }}>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 22, color: '#ffd0b8', letterSpacing: 4 }}>強 · 制 · 發 · 牌</div>
          <div style={{ fontFamily: F.fontUI, fontSize: 10, color: F.inkDim, fontStyle: 'italic', marginTop: 4 }}>
            依劇本自動執行
          </div>
        </div>
      </div>
    </StageShell>
  );
}
function F18_TimeForced() {
  return (
    <StageShell act="幕 · 急" title="第 · 三 · 張 · 落" stage="自動翻面 · 點數宣告" hourPct={1}
      narration="♣3 翻開 — 點數 17,B 默不作聲。">
      <div style={{ position: 'absolute', top: 200, left: '50%', transform: 'translateX(-50%)', width: 140 }}>
        <div style={{ position: 'relative', height: 80 }}>
          <FCard hidden size={0.85} x={0} y={6} rotate={-12} />
          <FCard card={{s:'♣',v:'8'}} size={0.85} x={36} y={0} />
          <FCard card={{s:'♣',v:'3'}} size={0.85} lit x={72} y={4} rotate={10} fly />
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, fontFamily: F.fontDisplay,
          fontSize: 24, color: F.gold }}>17</div>
      </div>
      <Beat top={380} left={0} right={0} color={F.inkDim} size={9} letter={1}>系 · 統 · 結 · 算 · 中</Beat>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 7 · 翻牌結算
// ───────────────────────────────────────────────
function F19_DealerHole() {
  return (
    <StageShell act="幕 · 終" title="魔 · 術 · 師 · 翻 · 底" stage="暗牌將露其面" hourPct={0.4}
      narration="袖口翻轉 — 觀眾席探身。">
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, height: 100,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 120, height: 100 }}>
          <FCard hidden size={1} x={0} y={6} rotate={-10} />
          <FCard card={{s:'♠',v:'8'}} size={1} x={42} y={0} lit />
          <FCard card={{s:'♥',v:'2'}} size={1} x={84} y={6} rotate={10} lit />
        </div>
      </div>
      <Beat top={320} left={0} right={0} color={F.spot} size={11}>明 · 點 = 10  · 暗 · 牌 = ?</Beat>
    </StageShell>
  );
}
function F20_DealerReveal() {
  return (
    <StageShell act="幕 · 終" title="♥ · A · 現" stage="暗牌翻面 · 21 點!" hourPct={0.3} urgent
      narration="一陣寒意 — 黑桃 8 + 紅心 2 + 紅心 A = 21,完美。">
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, height: 100,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 140, height: 100 }}>
          <FCard card={{s:'♥',v:'A'}} size={1} x={0} y={6} rotate={-10} lit fly />
          <FCard card={{s:'♠',v:'8'}} size={1} x={42} y={0} lit />
          <FCard card={{s:'♥',v:'2'}} size={1} x={84} y={6} rotate={10} lit />
        </div>
      </div>
      <Beat top={320} left={0} right={0} color="#ff8a5a" size={20} letter={6}>21</Beat>
      <Beat top={360} left={0} right={0} color={F.inkDim} size={9} letter={1}>(觀眾席:啊——)</Beat>
    </StageShell>
  );
}
function F21_Result() {
  return (
    <StageShell act="幕 · 終" title="勝 · 負 · 落 · 燈" stage="壹勝 · 貳負 · 叁負" hourPct={1}
      narration="紅燈 / 綠燈各歸其位 — 三點 18 唯獨壹存活。">
      <div style={{ position: 'absolute', top: 210, left: 22, right: 22, display: 'flex', gap: 8 }}>
        {[
          { n: '壹', score: 18, win: true },
          { n: '貳', score: 17, win: false },
          { n: '叁', score: 19, win: false },
        ].map((p, i) => (
          <div key={i} style={{ flex: 1, padding: 10, textAlign: 'center',
            border: `1.5px solid ${p.win ? '#7ad48a' : '#c8492f'}`,
            background: p.win ? 'rgba(122,212,138,.12)' : 'rgba(200,73,47,.12)',
            borderRadius: '24px 24px 4px 4px',
            boxShadow: `0 0 20px ${p.win ? 'rgba(122,212,138,.5)' : 'rgba(200,73,47,.5)'}` }}>
            <div style={{ fontFamily: F.fontDisplay, fontSize: 14, color: F.gold, letterSpacing: 2 }}>{p.n}</div>
            <div style={{ fontFamily: F.fontDisplay, fontSize: 24,
              color: p.win ? '#a8f0b8' : '#ffb89c', marginTop: 4 }}>{p.score}</div>
            <div style={{ fontFamily: F.fontDisplay, fontSize: 10, color: p.win ? '#7ad48a' : '#c8492f',
              letterSpacing: 3, marginTop: 4 }}>{p.win ? '勝' : '敗'}</div>
          </div>
        ))}
      </div>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 8 · 回合間(籌碼結算 · 下一幕預告)
// ───────────────────────────────────────────────
function F22_ChipsMove() {
  return (
    <StageShell act="幕 · 間" title="籌 · 碼 · 飛 · 流" stage="底池散往壹席" hourPct={1}
      narration="魔術師揮袖 — 30 枚籌碼如雁飛入壹的箱中。">
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d="M180 290 Q120 380 70 480" stroke={F.gold} strokeWidth=".8" strokeDasharray="3 3" fill="none" opacity=".7" />
      </svg>
      {[0,1,2,3,4,5].map(i => (
        <div key={i} style={{ position: 'absolute',
          left: 180 - i * 18, top: 290 + i * 30,
          width: 22, height: 5, borderRadius: '50%',
          background: i % 2 ? F.gold : '#c8492f',
          opacity: 1 - i * .12,
          boxShadow: '0 1px 2px rgba(0,0,0,.6)' }} />
      ))}
      <Beat top={430} left={0} right={0}>+ · 30 · → · 壹</Beat>
    </StageShell>
  );
}
function F23_Score() {
  return (
    <StageShell act="幕 · 間" title="計 · 分 · 板" stage="第 7 幕落 · 籌碼結餘" hourPct={1}
      narration="一輪 = 一幕,三幕後決勝負。">
      <div style={{ position: 'absolute', top: 200, left: 22, right: 22 }}>
        <div style={{ border: `0.5px solid ${F.gold}`, borderRadius: 2, padding: 12 }}>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 9, color: F.gold, letterSpacing: 3,
            borderBottom: `0.5px solid ${F.gold}`, paddingBottom: 4 }}>計 · 分 · 板</div>
          {[
            { n: '壹', delta: '+30', total: 38, win: true },
            { n: '貳', delta: '-10', total: -5, win: false },
            { n: '叁', delta: '-10', total: 2, win: false },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: i < 2 ? '0.5px dashed rgba(212,165,67,.3)' : 'none',
              fontFamily: F.fontDisplay, color: F.ink }}>
              <span style={{ color: F.gold, letterSpacing: 2, fontSize: 14 }}>{p.n}</span>
              <span style={{ color: p.win ? '#a8f0b8' : '#ffb89c', fontSize: 14 }}>{p.delta}</span>
              <span style={{ color: F.spot, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{p.total}</span>
            </div>
          ))}
        </div>
      </div>
    </StageShell>
  );
}
function F24_NextAct() {
  return (
    <StageShell act="幕 · 間" title="下 · 一 · 幕" stage="紅幕半降 · 等待重啟" hourPct={1}
      narration="按下『再來一幕』,沙漏即將重啟。">
      <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 320,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 4px, transparent 4px 14px), linear-gradient(180deg, ${F.velvet}, #5a1414)`,
        boxShadow: 'inset 0 -10px 30px rgba(0,0,0,.7)', zIndex: 4, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <button style={{ padding: '14px 36px',
          background: `linear-gradient(180deg, ${F.gold}, #8a6a28)`,
          border: 'none', borderRadius: 2, color: '#1a0a0a',
          fontFamily: F.fontDisplay, fontSize: 16, letterSpacing: 5,
          boxShadow: 'inset 0 1px 0 rgba(255,247,217,.5), 0 6px 14px rgba(0,0,0,.6)' }}>
          再 · 啟 · 沙 · 漏
        </button>
        <div style={{ fontFamily: F.fontUI, fontSize: 9, color: F.inkDim, fontStyle: 'italic', marginTop: 12 }}>
          幕 · 八 · 預 · 告 — 暗門中尚有 ♦Q
        </div>
      </div>
    </StageShell>
  );
}

// ───────────────────────────────────────────────
// 流程 9 · 失敗 · 爆牌
// ───────────────────────────────────────────────
function F25_BustDraw() {
  return (
    <StageShell act="幕 · 落" title="第 · 三 · 張" stage="一張紅心 J 飛來" hourPct={0.4} urgent
      narration="貳堅持要牌 — 一張紅心 J 朝他飛去。">
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d="M180 200 Q200 320 200 420" stroke="#ff8a5a" strokeWidth=".8" strokeDasharray="3 3" fill="none" />
      </svg>
      <div style={{ position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%) rotate(-18deg)' }}>
        <FCard card={{s:'♥',v:'J'}} size={1} lit fly />
      </div>
    </StageShell>
  );
}
function F26_BustReveal() {
  return (
    <StageShell act="幕 · 落" title="爆 · 點 · 25" stage="貳的點數溢出 · 紅燈大作" hourPct={0.2} urgent
      narration="7 + 8 + 10 = 25,溢出 — 觀眾席嘩然。">
      <div style={{ position: 'absolute', top: 180, left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{ width: 130, padding: 10, border: `2px solid #ff5a30`,
          background: 'rgba(122,31,31,.4)',
          borderRadius: '24px 24px 4px 4px', textAlign: 'center',
          boxShadow: '0 0 28px rgba(255,90,60,.6)',
          animation: 'fx-shimmer 0.5s ease-in-out infinite' }}>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 14, color: '#ffd0b8', letterSpacing: 2 }}>貳</div>
          <div style={{ position: 'relative', height: 70, marginTop: 6 }}>
            <FCard card={{s:'♠',v:'7'}} size={0.65} x={4} y={4} rotate={-12} dim />
            <FCard card={{s:'♣',v:'8'}} size={0.65} x={32} y={0} dim />
            <FCard card={{s:'♥',v:'J'}} size={0.65} x={60} y={4} rotate={10} lit />
          </div>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 32, color: '#ff5a30',
            textShadow: '0 0 12px rgba(255,90,60,.8)', marginTop: 4 }}>25</div>
          <div style={{ fontFamily: F.fontDisplay, fontSize: 11, color: '#ffb89c', letterSpacing: 4 }}>爆</div>
        </div>
      </div>
    </StageShell>
  );
}
function F27_BustCurtain() {
  // 紅幕自上而下覆蓋
  return (
    <StageShell act="幕 · 落" title="幕 · 落" stage="紅幕降下 · 觀眾鼓掌" hourPct={0}
      narration="這一幕，貳 已退場。下一幕,沙漏為誰而起?">
      <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: '90%',
        backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 4px, transparent 4px 14px), linear-gradient(180deg, ${F.velvet} 0%, #5a1414 60%, ${F.velvetDeep} 100%)`,
        boxShadow: 'inset 0 -16px 40px rgba(0,0,0,.8)', zIndex: 5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 6 }}>
        <div style={{ fontFamily: F.fontDisplay, fontSize: 32, color: F.spot, letterSpacing: 8,
          textShadow: '0 0 12px rgba(255,247,217,.6)' }}>劇 · 終</div>
        <div style={{ fontFamily: F.fontUI, fontSize: 10, color: '#f0dfae', fontStyle: 'italic', marginTop: 8 }}>
          ── 鞠 · 躬 ──
        </div>
      </div>
    </StageShell>
  );
}

Object.assign(window, {
  F1_Curtain, F2_Shuffle, F3_Seats,
  F4_DealStart, F5_DealAll, F6_DealReveal,
  F7_Bthink, F8_BdrawFlying, F9_BlandSafe,
  F10_TrapHover, F11_TrapDrop, F12_TrapClose,
  F13_LurePlay, F14_LureFollow, F15_LurePot,
  F16_TimeLow, F17_TimeOut, F18_TimeForced,
  F19_DealerHole, F20_DealerReveal, F21_Result,
  F22_ChipsMove, F23_Score, F24_NextAct,
  F25_BustDraw, F26_BustReveal, F27_BustCurtain,
});
