// prototype.jsx — Vantage 21 · F1–F27 互動原型
//
// 把 theatre2_flows.jsx 的 27 個關鍵幀,串成一個可走通的狀態機,
// 作為後續工程開發的單一基準 (single source of truth)。
//
// 設計原則:
//   1. 每一幀 = 一個 scene id,scene id 對應 CLAUDE.md 的狀態機
//   2. 場景之間用「關鍵動作 (onAction)」推進,搭配自動推進 (autoAdvance)
//   3. 中央播放器有 prev / play / next / step / restart + 鍵盤捷徑
//   4. 旁邊有 dev panel:當前 state、可跳到任意幀、看見 inferred 全局狀態
//
// 重要:這不是遊戲,而是「可被工程拿來當骨架的故事板」。所有資料、互動、
// 動效都來自 theatre2_flows.jsx 內現成元件,prototype 只負責編排。

const PT = V21_THEMES.theatre;

// ──────────────────────────────────────────────────────────
// 1 · 場景表 — 對應 CLAUDE.md 的全局狀態機
// ──────────────────────────────────────────────────────────
//
// 每個 scene:
//   id        — F1..F27,作為 url hash + dev panel 鍵值
//   act       — 屬於哪一幕(F1-F3=開場,F4-F6=發牌, …)
//   machine   — 對應後端狀態機節點
//   Comp      — 渲染元件
//   nextHint  — 下一動作的提示文字(顯示在主鈕上)
//   urgent    — 是否進入緊張模式(影響鈕色 / 鼓點)
//   auto      — 自動推進延遲秒數;null = 等手動
//
const SCENES = [
  // 流程 1 · 開場入座
  { id: 'F1',  act: 1, flow: '開場入座', machine: 'IDLE',           Comp: F1_Curtain,      nextHint: '洗 牌',      auto: 2.4 },
  { id: 'F2',  act: 1, flow: '開場入座', machine: 'SHUFFLING',      Comp: F2_Shuffle,      nextHint: '入 座',      auto: 2.4 },
  { id: 'F3',  act: 1, flow: '開場入座', machine: 'BETTING',        Comp: F3_Seats,        nextHint: '啟 沙 漏',  auto: null },

  // 流程 2 · 第一輪發牌
  { id: 'F4',  act: 2, flow: '第一輪發牌', machine: 'DEAL_R1_DEALER',   Comp: F4_DealStart,   nextHint: '繼 續 發',  auto: 1.6 },
  { id: 'F5',  act: 2, flow: '第一輪發牌', machine: 'DEAL_R1_PLAYERS',  Comp: F5_DealAll,     nextHint: '翻 明 牌',  auto: 1.6 },
  { id: 'F6',  act: 2, flow: '第一輪發牌', machine: 'REVEAL_UPCARDS',   Comp: F6_DealReveal,  nextHint: '輪 到 B',   auto: 1.8 },

  // 流程 3 · 玩家行動
  { id: 'F7',  act: 3, flow: '玩家行動', machine: 'PLAYER_TURN',      Comp: F7_Bthink,      nextHint: '發 牌',     urgent: false, auto: null, branch: true },
  { id: 'F8',  act: 3, flow: '玩家行動', machine: 'DEAL_CARD',        Comp: F8_BdrawFlying, nextHint: '落 定',     auto: 1.2 },
  { id: 'F9',  act: 3, flow: '玩家行動', machine: 'CHECK_BUST',       Comp: F9_BlandSafe,   nextHint: '進 入 暗 門', auto: 1.8 },

  // 流程 4 · 暗門使用
  { id: 'F10', act: 4, flow: '暗門使用', machine: 'STASH_HOVER',      Comp: F10_TrapHover,  nextHint: '沉 入',     auto: null },
  { id: 'F11', act: 4, flow: '暗門使用', machine: 'STASH_DROP',       Comp: F11_TrapDrop,   nextHint: '封 印',     auto: 1.4 },
  { id: 'F12', act: 4, flow: '暗門使用', machine: 'STASH_LOCKED',     Comp: F12_TrapClose,  nextHint: '誘 餌 出 場', auto: 1.6 },

  // 流程 5 · 誘餌
  { id: 'F13', act: 5, flow: '誘餌',     machine: 'LURE_TRIGGER',     Comp: F13_LurePlay,   nextHint: '跟 注',     auto: 1.6 },
  { id: 'F14', act: 5, flow: '誘餌',     machine: 'CALL_PHASE',       Comp: F14_LureFollow, nextHint: '底 池 沸 騰', auto: 1.6 },
  { id: 'F15', act: 5, flow: '誘餌',     machine: 'POT_UPDATE',       Comp: F15_LurePot,    nextHint: '進 入 急 迫', auto: 1.8 },

  // 流程 6 · 倒數逾時
  { id: 'F16', act: 6, flow: '倒數逾時', machine: 'URGENT',           Comp: F16_TimeLow,    nextHint: '沙 盡',     urgent: true,  auto: 2.0 },
  { id: 'F17', act: 6, flow: '倒數逾時', machine: 'TIMEOUT',          Comp: F17_TimeOut,    nextHint: '強 制 發 牌', urgent: true,  auto: 1.4 },
  { id: 'F18', act: 6, flow: '倒數逾時', machine: 'AUTO_ACTION',      Comp: F18_TimeForced, nextHint: '進 入 結 算', auto: 1.8 },

  // 流程 7 · 翻牌結算
  { id: 'F19', act: 7, flow: '翻牌結算', machine: 'DEALER_REVEAL',    Comp: F19_DealerHole, nextHint: '揭 曉 暗 牌', auto: 1.6 },
  { id: 'F20', act: 7, flow: '翻牌結算', machine: 'COMPARE',          Comp: F20_DealerReveal, nextHint: '落 燈',   urgent: true,  auto: 1.8 },
  { id: 'F21', act: 7, flow: '翻牌結算', machine: 'SETTLE',           Comp: F21_Result,     nextHint: '結 算',     auto: 2.2 },

  // 流程 8 · 回合間
  { id: 'F22', act: 8, flow: '回合間',   machine: 'SETTLE_CHIPS',     Comp: F22_ChipsMove,  nextHint: '看 計 分',   auto: 1.8 },
  { id: 'F23', act: 8, flow: '回合間',   machine: 'SHOW_SCOREBOARD',  Comp: F23_Score,      nextHint: '預 告 下 幕', auto: 2.2 },
  { id: 'F24', act: 8, flow: '回合間',   machine: 'READY_NEXT',       Comp: F24_NextAct,    nextHint: '看 失 敗 路 線', auto: null },

  // 流程 9 · 失敗 · 爆牌
  { id: 'F25', act: 9, flow: '爆牌退場', machine: 'BUST_DETECTED',    Comp: F25_BustDraw,   nextHint: '揭 露 點 數', urgent: true,  auto: 1.4 },
  { id: 'F26', act: 9, flow: '爆牌退場', machine: 'BUST_REVEAL',      Comp: F26_BustReveal, nextHint: '紅 幕 降',   urgent: true,  auto: 2.0 },
  { id: 'F27', act: 9, flow: '爆牌退場', machine: 'ELIMINATE_PLAYER', Comp: F27_BustCurtain, nextHint: '回 到 開 場', auto: null },
];

const SCENE_BY_ID = Object.fromEntries(SCENES.map((s, i) => [s.id, { ...s, idx: i }]));

// 全局推斷狀態 — 隨 scene idx 演進。供 dev panel 顯示。
function inferGameState(idx) {
  // 最簡化的 inference;真實後端會由 server 維護。
  const stash = idx >= 11 ? ['♦Q'] : []; // F12 之後暗門有牌
  const pot = idx >= 14 ? 30 : (idx >= 2 ? 15 : 0);
  const round = idx < 21 ? 1 : 2;
  const playerB =
    idx < 6  ? { hand: ['?', '8'], score: 8 } :
    idx < 9  ? { hand: ['?', '8', '6'], score: 14 } :
    idx < 18 ? { hand: ['?', '8'], score: 8 } :
    idx < 25 ? { hand: ['?', '8', '3'], score: 17 } :
                { hand: ['7', '8', 'J'], score: 25, bust: true };
  return { round, pot, stash, playerB };
}

// ──────────────────────────────────────────────────────────
// 2 · Header — 標題列 + 進度 + 流程章節 chips
// ──────────────────────────────────────────────────────────
function PrototypeHeader({ idx, onJump }) {
  const flows = [];
  let currentFlow = null;
  SCENES.forEach((s, i) => {
    if (s.flow !== currentFlow) {
      currentFlow = s.flow;
      flows.push({ flow: s.flow, act: s.act, start: i, end: i });
    } else {
      flows[flows.length - 1].end = i;
    }
  });

  return (
    <div style={{ padding: '20px 28px 12px', borderBottom: `0.5px solid rgba(212,165,67,.25)`,
      background: 'linear-gradient(180deg, #14080a 0%, #0a0606 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: PT.fontDisplay, fontSize: 11, color: PT.gold,
            letterSpacing: 6, opacity: .7 }}>VANTAGE · 21</div>
          <div style={{ fontFamily: PT.fontDisplay, fontSize: 22, color: PT.spot,
            letterSpacing: 3, marginTop: 2,
            textShadow: '0 0 8px rgba(255,247,217,.4)' }}>
            F1 — F27 · 互 動 原 型
          </div>
          <div style={{ fontFamily: PT.fontUI, fontSize: 11, color: PT.inkDim,
            fontStyle: 'italic', marginTop: 4, letterSpacing: 1 }}>
            九個流程,二十七幕,從幕啟到劇終 — 工程基準稿
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: PT.fontDisplay, fontSize: 32, color: PT.gold,
            fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {String(idx + 1).padStart(2, '0')}<span style={{ opacity: .35, fontSize: 20 }}> / 27</span>
          </div>
          <div style={{ fontFamily: PT.fontUI, fontSize: 10, color: PT.inkDim,
            letterSpacing: 2 }}>{SCENES[idx].id}  ·  {SCENES[idx].machine}</div>
        </div>
      </div>

      {/* 流程章節 chips */}
      <div style={{ display: 'flex', gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
        {flows.map((f, i) => {
          const active = idx >= f.start && idx <= f.end;
          const done = idx > f.end;
          return (
            <button key={i} onClick={() => onJump(f.start)}
              style={{
                padding: '5px 9px', fontFamily: PT.fontDisplay, fontSize: 10,
                letterSpacing: 1.5, cursor: 'pointer',
                border: `0.5px solid ${active ? PT.gold : 'rgba(212,165,67,.3)'}`,
                background: active
                  ? `linear-gradient(180deg, rgba(212,165,67,.25), rgba(122,31,31,.15))`
                  : done ? 'rgba(212,165,67,.05)' : 'transparent',
                color: active ? PT.spot : done ? PT.gold : PT.inkDim,
                borderRadius: 2,
              }}>
              {f.act} · {f.flow}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 3 · 進度條 — 27 個刻度
// ──────────────────────────────────────────────────────────
function ProgressTicks({ idx, onJump }) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: '10px 28px',
      background: 'rgba(0,0,0,.4)', borderBottom: `0.5px solid rgba(212,165,67,.15)` }}>
      {SCENES.map((s, i) => {
        const active = i === idx;
        const passed = i < idx;
        return (
          <button key={s.id} onClick={() => onJump(i)} title={`${s.id} · ${s.machine}`}
            style={{
              flex: 1, height: 18, cursor: 'pointer',
              border: 'none', padding: 0, position: 'relative',
              background: active
                ? (s.urgent ? 'linear-gradient(180deg,#ff8a5a,#c8492f)' : `linear-gradient(180deg, ${PT.spot}, ${PT.gold})`)
                : passed ? 'rgba(212,165,67,.4)' : 'rgba(212,165,67,.08)',
              boxShadow: active
                ? (s.urgent ? '0 0 10px rgba(255,120,80,.7)' : '0 0 8px rgba(212,165,67,.6)')
                : 'none',
              transition: 'background .2s',
            }}>
            {active && (
              <div style={{ position: 'absolute', top: -14, left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: PT.fontDisplay, fontSize: 8, color: PT.gold,
                letterSpacing: 1, whiteSpace: 'nowrap' }}>{s.id}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 4 · 中央 Phone Stage(裡頭跑當前 frame)
// ──────────────────────────────────────────────────────────
function PhoneStage({ scene }) {
  const Comp = scene.Comp;
  return (
    <div style={{ position: 'relative' }}>
      {/* 舞台聚光底 */}
      <div style={{ position: 'absolute', inset: -40,
        background: scene.urgent
          ? 'radial-gradient(ellipse at 50% 50%, rgba(255,120,80,.18), transparent 60%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(212,165,67,.12), transparent 60%)',
        pointerEvents: 'none' }} />
      <IOSDevice width={360} height={760} dark={true}>
        <div data-screen-label={`Prototype · ${scene.id}`} className="v21-screen"
          style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Comp />
        </div>
      </IOSDevice>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 5 · 控制鈕(prev / play / next / restart)
// ──────────────────────────────────────────────────────────
function Controls({ idx, playing, onPrev, onNext, onPlay, onRestart, scene }) {
  const isLast = idx === SCENES.length - 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: '14px 0' }}>
      <CtrlBtn onClick={onPrev} disabled={idx === 0} hotkey="←">
        ◂ 上 一 幕
      </CtrlBtn>
      <CtrlBtn onClick={onRestart} hotkey="R" tone="muted">
        ↺ 重 開
      </CtrlBtn>
      <CtrlBtn onClick={onPlay} hotkey="Space" tone="muted" wide>
        {playing ? '❚❚ 暫 停' : '▸ 自 動 播 放'}
      </CtrlBtn>
      <CtrlBtn onClick={onNext} disabled={isLast} hotkey="→" tone={scene.urgent ? 'urgent' : 'primary'} wide>
        {isLast ? '已 是 最 後' : `${scene.nextHint} ▸`}
      </CtrlBtn>
    </div>
  );
}

function CtrlBtn({ children, onClick, disabled, hotkey, tone = 'ghost', wide }) {
  const tones = {
    primary: { bg: `linear-gradient(180deg, ${PT.gold}, #8a6a28)`,    color: '#1a0a0a', border: PT.gold },
    urgent:  { bg: 'linear-gradient(180deg,#ffae6b,#c8492f)',         color: '#1a0a0a', border: '#ff8a5a' },
    muted:   { bg: 'rgba(255,247,217,.06)',                            color: PT.gold,   border: PT.gold },
    ghost:   { bg: 'rgba(122,31,31,.4)',                               color: PT.spot,   border: PT.velvet },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        position: 'relative',
        padding: wide ? '11px 22px' : '11px 14px',
        minWidth: wide ? 160 : 100,
        background: disabled ? 'rgba(50,30,30,.4)' : t.bg,
        border: `1px solid ${disabled ? 'rgba(212,165,67,.2)' : t.border}`,
        borderRadius: 2,
        color: disabled ? PT.inkDim : t.color,
        fontFamily: PT.fontDisplay,
        fontSize: 13, letterSpacing: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        boxShadow: disabled ? 'none'
          : tone === 'primary' || tone === 'urgent'
            ? 'inset 0 1px 0 rgba(255,247,217,.4), 0 4px 10px rgba(0,0,0,.5)'
            : '0 2px 6px rgba(0,0,0,.5)',
      }}>
      {children}
      {hotkey && (
        <span style={{ position: 'absolute', top: -7, right: 4,
          fontFamily: PT.fontUI, fontSize: 8, letterSpacing: 0,
          padding: '1px 4px', background: '#0a0606',
          border: `0.5px solid rgba(212,165,67,.5)`,
          color: PT.inkDim, borderRadius: 2 }}>{hotkey}</span>
      )}
    </button>
  );
}

// ──────────────────────────────────────────────────────────
// 6 · Dev Panel — 場景列表 + 全局推斷狀態
// ──────────────────────────────────────────────────────────
function DevPanel({ idx, onJump, branchOnHit, collapsed, onToggle }) {
  const scene = SCENES[idx];
  const state = inferGameState(idx);

  if (collapsed) {
    return (
      <button onClick={onToggle} title="展開 Dev Panel"
        style={{ width: 28, alignSelf: 'stretch', cursor: 'pointer',
          background: 'linear-gradient(180deg, rgba(20,8,8,.7), rgba(10,4,4,.85))',
          border: `0.5px solid rgba(212,165,67,.2)`,
          color: PT.gold, fontFamily: PT.fontDisplay,
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          letterSpacing: 4, fontSize: 11, padding: '12px 0' }}>
        ▸ DEV · STATE
      </button>
    );
  }

  return (
    <div style={{ width: 260, alignSelf: 'stretch', flexShrink: 0,
      background: 'linear-gradient(180deg, rgba(20,8,8,.7), rgba(10,4,4,.85))',
      border: `0.5px solid rgba(212,165,67,.2)`,
      padding: 14, overflow: 'auto', maxHeight: '100%', position: 'relative',
      fontFamily: PT.fontUI, color: PT.ink, fontSize: 11 }}>
      <button onClick={onToggle}
        style={{ position: 'absolute', top: 8, right: 8, cursor: 'pointer',
          width: 18, height: 18, padding: 0,
          background: 'transparent', border: `0.5px solid ${PT.gold}`,
          color: PT.gold, fontSize: 11, lineHeight: 1, borderRadius: 2 }}
        title="收起">◂</button>

      {/* 區塊:當前狀態 */}
      <SectionTitle>當 · 前 · 狀 · 態</SectionTitle>
      <KV k="scene"   v={scene.id} highlight />
      <KV k="machine" v={scene.machine} />
      <KV k="flow"    v={`${scene.act} · ${scene.flow}`} />
      <KV k="urgent"  v={scene.urgent ? '是' : '否'} tone={scene.urgent ? 'urgent' : 'normal'} />
      <KV k="auto"    v={scene.auto != null ? `${scene.auto}s` : '等手動'} />

      {/* 區塊:推斷遊戲狀態 */}
      <SectionTitle style={{ marginTop: 14 }}>遊 · 戲 · 推 · 斷</SectionTitle>
      <KV k="round" v={`${state.round} / 3`} />
      <KV k="pot"   v={state.pot} />
      <KV k="stash" v={state.stash.length ? state.stash.join(' · ') : '空'} />
      <KV k="B.hand"  v={state.playerB.hand.join(' · ')} />
      <KV k="B.score" v={state.playerB.score + (state.playerB.bust ? ' (爆)' : '')}
        tone={state.playerB.bust ? 'urgent' : 'normal'} />

      {/* 區塊:F7 分支(玩家行動) */}
      {scene.branch && (
        <React.Fragment>
          <SectionTitle style={{ marginTop: 14 }}>玩 · 家 · 分 · 支</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <BranchBtn onClick={() => branchOnHit('hit')}>
              <strong>1</strong> · 要 牌 (Hit) → F8
            </BranchBtn>
            <BranchBtn onClick={() => branchOnHit('stand')}>
              <strong>2</strong> · 停 牌 (Stand) → F19
            </BranchBtn>
            <BranchBtn onClick={() => branchOnHit('stash')}>
              <strong>3</strong> · 入 暗 門 → F10
            </BranchBtn>
          </div>
        </React.Fragment>
      )}

      {/* 區塊:全部場景跳轉 */}
      <SectionTitle style={{ marginTop: 14 }}>全 · 部 · 場 · 景</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {SCENES.map((s, i) => (
          <button key={s.id} onClick={() => onJump(i)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 6px', cursor: 'pointer',
              background: i === idx
                ? `linear-gradient(90deg, ${PT.velvet}, transparent)`
                : 'transparent',
              border: 'none',
              borderLeft: i === idx
                ? `2px solid ${s.urgent ? '#ff8a5a' : PT.gold}`
                : '2px solid transparent',
              color: i === idx ? PT.spot : (i < idx ? PT.gold : PT.inkDim),
              fontFamily: PT.fontUI, fontSize: 10,
              textAlign: 'left',
            }}>
            <span>
              <span style={{ fontFamily: PT.fontDisplay, letterSpacing: 1, marginRight: 6,
                color: i === idx ? PT.spot : PT.gold, opacity: i < idx ? .6 : 1 }}>
                {s.id}
              </span>
              <span>{s.flow}</span>
            </span>
            <span style={{ fontSize: 8, fontFamily: 'ui-monospace, monospace',
              opacity: .6, letterSpacing: 0 }}>{s.machine}</span>
          </button>
        ))}
      </div>

      {/* 區塊:鍵盤捷徑 */}
      <SectionTitle style={{ marginTop: 14 }}>鍵 · 盤</SectionTitle>
      <div style={{ fontSize: 10, color: PT.inkDim, lineHeight: 1.7, fontFamily: PT.fontUI }}>
        <div><kbd>←</kbd> / <kbd>→</kbd>  上 / 下一幕</div>
        <div><kbd>Space</kbd>  自動播放</div>
        <div><kbd>R</kbd>  重置到 F1</div>
        <div><kbd>1 / 2 / 3</kbd>  F7 玩家分支</div>
        <div><kbd>Home</kbd> / <kbd>End</kbd>  跳到開頭/結尾</div>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return (
    <div style={{
      fontFamily: PT.fontDisplay, fontSize: 10, color: PT.gold,
      letterSpacing: 4, paddingBottom: 4, marginBottom: 6,
      borderBottom: `0.5px solid rgba(212,165,67,.3)`, ...style,
    }}>{children}</div>
  );
}
function KV({ k, v, highlight, tone = 'normal' }) {
  const c = tone === 'urgent' ? '#ff8a5a' : (highlight ? PT.spot : PT.ink);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      padding: '3px 0', fontFamily: PT.fontUI, fontSize: 11,
      borderBottom: '0.5px dashed rgba(212,165,67,.12)' }}>
      <span style={{ color: PT.inkDim, fontSize: 10 }}>{k}</span>
      <span style={{ color: c, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
        {String(v)}
      </span>
    </div>
  );
}
function BranchBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        textAlign: 'left', padding: '6px 8px',
        background: 'rgba(212,165,67,.08)',
        border: `0.5px solid ${PT.gold}`, borderRadius: 2,
        color: PT.spot, fontFamily: PT.fontUI, fontSize: 11,
        cursor: 'pointer', letterSpacing: 0.5,
      }}>{children}</button>
  );
}

// ──────────────────────────────────────────────────────────
// 7 · 旁白條 + 工程備註(右側 sidecar)
// ──────────────────────────────────────────────────────────
function Sidecar({ scene, collapsed, onToggle }) {
  if (collapsed) {
    return (
      <button onClick={onToggle} title="展開旁白"
        style={{ width: 28, alignSelf: 'stretch', cursor: 'pointer',
          background: 'linear-gradient(180deg, rgba(20,8,8,.5), rgba(10,4,4,.7))',
          border: `0.5px solid rgba(212,165,67,.15)`, borderLeft: 'none',
          color: PT.gold, fontFamily: PT.fontDisplay,
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          letterSpacing: 4, fontSize: 11, padding: '12px 0' }}>
        ◂ NOTES · NARRATION
      </button>
    );
  }
  return (
    <div style={{ width: 230, alignSelf: 'stretch', flexShrink: 0, position: 'relative',
      padding: 14, color: PT.ink, fontSize: 11,
      background: 'linear-gradient(180deg, rgba(20,8,8,.5), rgba(10,4,4,.7))',
      border: `0.5px solid rgba(212,165,67,.15)`, borderLeft: 'none',
      fontFamily: PT.fontUI }}>
      <button onClick={onToggle}
        style={{ position: 'absolute', top: 8, right: 8, cursor: 'pointer',
          width: 18, height: 18, padding: 0,
          background: 'transparent', border: `0.5px solid ${PT.gold}`,
          color: PT.gold, fontSize: 11, lineHeight: 1, borderRadius: 2 }}
        title="收起">▸</button>
      <SectionTitle>旁 · 白 · 與 · 節 · 拍</SectionTitle>
      <div style={{ fontFamily: PT.fontUI, fontStyle: 'italic',
        color: PT.spot, fontSize: 12, lineHeight: 1.7,
        padding: '6px 0 10px',
        borderLeft: `2px solid ${PT.gold}`, paddingLeft: 10,
        marginBottom: 12 }}>
        {NARRATIONS[scene.id]}
      </div>

      <SectionTitle>工 · 程 · 注 · 意</SectionTitle>
      <div style={{ fontSize: 10, color: PT.inkDim, lineHeight: 1.7,
        fontFamily: PT.fontUI }}>
        {ENG_NOTES[scene.id]}
      </div>

      <SectionTitle style={{ marginTop: 14 }}>檔 · 案</SectionTitle>
      <div style={{ fontSize: 9, color: PT.inkDim,
        fontFamily: 'ui-monospace, monospace' }}>
        v21/theatre2_flows.jsx<br/>
        → {scene.Comp.name}
      </div>
    </div>
  );
}

// 旁白文 — 對應 CLAUDE.md
const NARRATIONS = {
  F1:  '魔術師走上中央,摘下高帽。',
  F2:  '五十二章劇本,在指尖瀑布而下。',
  F3:  '壹貳叁押注 — 沙漏待啟,聚光待亮。',
  F4:  '魔術師抬手,沙漏倒置 — 時間始流。',
  F5:  '人手一張,皆藏其面。風暴前的靜默。',
  F6:  '點數浮現:9 · 8 · 6 — B 開始計算。',
  F7:  'B 抬眼,輕點 — 觀眾席屏息。「我要牌!」',
  F8:  '一張白光劃過劇場 — 那是 ♠6。',
  F9:  '掌聲雷動,沙漏歸位 — 14 點安全著陸。',
  F10: '袖口微啟 — 一張牌將被藏入時間之外。',
  F11: '一陣金粉,牌消失了 — 只待下一幕重現。',
  F12: '暗門封印 · 觀眾席悄聲議論。',
  F13: '一張紅心 Q 滑落 — 是真失手?還是劇本?',
  F14: '壹貳叁皆下重注 — 籌碼如蝶,湧向魔術師。',
  F15: '底池漲至 30 — 賭注高了,沙漏走得更快。',
  F16: '觀眾屏息 — 0.7 秒,你的選擇?',
  F17: '沙漏空了 — 主角失語,劇本自動翻頁。',
  F18: '♣3 翻開 — 點數 17,B 默不作聲。',
  F19: '袖口翻轉 — 觀眾席探身。',
  F20: '黑桃 8 + 紅心 2 + 紅心 A = 21,完美。',
  F21: '紅綠落燈 — 三點 18 唯獨壹存活。',
  F22: '魔術師揮袖 — 30 枚籌碼如雁飛入壹的箱中。',
  F23: '一輪 = 一幕,三幕後決勝負。',
  F24: '按下「再啟沙漏」— 第八幕即將升起。',
  F25: '貳堅持要牌 — 一張紅心 J 朝他飛去。',
  F26: '7 + 8 + 10 = 25,溢出 — 觀眾席嘩然。',
  F27: '這一幕,貳已退場。下一幕,沙漏為誰而起?',
};

// 工程注意事項 — 給後續開發看的
const ENG_NOTES = {
  F1:  '紅幕 transform translateY -100% → 0,2.4s ease。沙漏 hourPct=1。不接受任何輸入。',
  F2:  '52 張牌 fan-out;真實後端在此 shuffle 並 commit。前端僅展示。',
  F3:  '讀取上一回合 bet,新玩家用 defaultBet。FSM: BETTING → READY 由「啟沙漏」觸發。',
  F4:  '此幀啟動 server-authored countdown。前端訂閱 tick,不要用 setTimeout。',
  F5:  'hole card 不存在於前端記憶體 — 後端持有,僅在 F19 時下發。',
  F6:  'score(hand) 處理 A 的 1/11 雙值。客戶端僅顯示,計算需後端驗證。',
  F7:  '主動作鍵 1=Hit / 2=Stand / 3=Stash。此處有分支 — 見 dev panel。',
  F8:  '飛行 0.55s ease-out。後端送出實際抽到的牌,前端只負責動效。',
  F9:  '若 score=21 自動 stand;若 >21 進入 F25 線。第 5 張仍 ≤21 觸發五龍特效。',
  F10: 'stash 容量上限 1(預設)。後端必須驗證,防止本地竄改 stash 多張。',
  F11: '金粉粒子 8 顆 absolute div;漏斗用 clip-path polygon。',
  F12: 'stash 中的牌跨幕保留;新幕開場提示 onboarding。',
  F13: '誘餌權重隨關卡進度調整。觸發條件:dealer up-card ≤ 6 且 lureMode=true。',
  F14: '跟注最低為當前底注 2x。每位玩家可拒絕(F14b 待補)。',
  F15: 'pot 數字用 useCountUp 從 10 → 30,1.2s。',
  F16: 'URGENT 狀態:聚光由金轉紅 + 觀眾席微震 + 主鈕脈動。',
  F17: '0.4s 全屏紅光暈,然後執行 auto_action(預設 stand)。',
  F18: '系統自動派發第 3 張;結算邏輯與玩家主動 hit 完全相同。',
  F19: '此前 hole card 由後端首次下發。動畫前禁止前端讀取。',
  F20: 'rotateY 0.4s + backface-visibility。compareHands 純函式,可單測。',
  F21: '結算金額更新 player.stack;每席 box-shadow 0.3s 內向外擴。',
  F22: 'path animation 60ms 串列發射;每枚籌碼 800ms。',
  F23: 'useCountUp 結算 delta;round=3 後進入 FINALE(待設計)。',
  F24: '長按聚光由暗轉亮(模擬點亮舞台)。stash 中牌需顯示提醒。',
  F25: 'BUST_DETECTED 由後端 emit;前端只播動效,不計算。',
  F26: '"爆"字 text-shadow 紅光 + fx-shimmer 0.5s 閃。',
  F27: '紅幕 0% → 90%,2s ease-out。爆牌玩家進入觀眾模式 UI。',
};

// ──────────────────────────────────────────────────────────
// 8 · 主元件
// ──────────────────────────────────────────────────────────
function Prototype() {
  // 從 hash 還原狀態 — 工程可以分享 url 直接到某幀
  const initial = (() => {
    const h = (window.location.hash || '').replace('#', '').toUpperCase();
    return SCENE_BY_ID[h]?.idx ?? 0;
  })();

  const [idx, setIdx] = React.useState(initial);
  const [playing, setPlaying] = React.useState(false);
  const scene = SCENES[idx];

  // 視窗寬度自動收合 — 防止三欄重疊
  const [vw, setVw] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  React.useEffect(() => {
    const onR = () => setVw(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  const [devUserCollapsed, setDevUserCollapsed] = React.useState(null);
  const [sideUserCollapsed, setSideUserCollapsed] = React.useState(null);
  const autoCollapseDev  = vw < 1100;
  const autoCollapseSide = vw < 980;
  const devCollapsed  = devUserCollapsed  ?? autoCollapseDev;
  const sideCollapsed = sideUserCollapsed ?? autoCollapseSide;

  // hash 同步
  React.useEffect(() => {
    window.location.hash = scene.id;
    window.parent?.postMessage({ slideIndexChanged: idx }, '*');
  }, [idx, scene.id]);

  // 自動播放邏輯 — 利用每個 scene 的 auto 秒數
  React.useEffect(() => {
    if (!playing) return;
    const dur = (scene.auto ?? 2.0) * 1000;
    const t = setTimeout(() => {
      setIdx(i => {
        if (i === SCENES.length - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, dur);
    return () => clearTimeout(t);
  }, [playing, idx, scene.auto]);

  const next    = React.useCallback(() => setIdx(i => Math.min(SCENES.length - 1, i + 1)), []);
  const prev    = React.useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const jump    = React.useCallback((i) => { setIdx(i); setPlaying(false); }, []);
  const restart = React.useCallback(() => { setIdx(0); setPlaying(false); }, []);
  const togglePlay = React.useCallback(() => setPlaying(p => !p), []);

  // F7 分支處理
  const branch = React.useCallback((kind) => {
    if (kind === 'hit')   jump(SCENE_BY_ID.F8.idx);
    if (kind === 'stand') jump(SCENE_BY_ID.F19.idx);
    if (kind === 'stash') jump(SCENE_BY_ID.F10.idx);
  }, [jump]);

  // 鍵盤捷徑
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { next(); }
      else if (e.key === 'ArrowLeft') { prev(); }
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'r' || e.key === 'R') { restart(); }
      else if (e.key === 'Home') { jump(0); }
      else if (e.key === 'End') { jump(SCENES.length - 1); }
      else if (scene.branch && (e.key === '1' || e.key === '2' || e.key === '3')) {
        branch({ '1': 'hit', '2': 'stand', '3': 'stash' }[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, togglePlay, restart, jump, branch, scene.branch]);

  return (
    <div style={{ width: '100vw', minHeight: '100vh',
      background: `radial-gradient(ellipse at 50% -10%, ${PT.velvetDeep} 0%, #0a0606 50%, #000 100%)`,
      color: PT.ink, fontFamily: PT.fontUI,
      display: 'flex', flexDirection: 'column' }}>

      <PrototypeHeader idx={idx} onJump={jump} />
      <ProgressTicks idx={idx} onJump={jump} />

      {/* 主體 — 三欄式;窄視窗時側欄自動收合 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch',
        padding: '20px 14px 8px', gap: 12, minHeight: 0 }}>
        <DevPanel idx={idx} onJump={jump} branchOnHit={branch}
          collapsed={devCollapsed}
          onToggle={() => setDevUserCollapsed(c => !(c ?? autoCollapseDev))} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start', gap: 8,
          minWidth: 0 }}>
          <PhoneStage scene={scene} />
          <Controls
            idx={idx} playing={playing} scene={scene}
            onPrev={prev} onNext={next} onPlay={togglePlay} onRestart={restart} />
        </div>

        <Sidecar scene={scene}
          collapsed={sideCollapsed}
          onToggle={() => setSideUserCollapsed(c => !(c ?? autoCollapseSide))} />
      </div>

      {/* 底部備註 */}
      <div style={{ textAlign: 'center', padding: '8px 16px 18px',
        fontFamily: PT.fontUI, fontSize: 9, color: PT.inkDim,
        letterSpacing: 1, fontStyle: 'italic' }}>
        Vantage 21 · 工程基準稿 · 場景組件來自 v21/theatre2_flows.jsx · 視覺主軸見 v21/theatre2.jsx · 規格見 CLAUDE.md
      </div>
    </div>
  );
}

window.Prototype = Prototype;
