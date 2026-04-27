# Vantage 21 — 設計與工程指南 (CLAUDE.md)

> 本檔記錄專案的核心隱喻、設計語彙、與九個遊戲流程的完整規格,
> 作為後續設計迭代與工程實作的單一事實來源 (single source of truth)。
>
> 主要設計檔: `Vantage 21 Redesign.html` (DesignCanvas)
> 主要視覺語彙: `v21/theatre2.jsx` (03b · Theatre + Curtain Clock)
> 流程畫面: `v21/theatre2_flows.jsx` (F1–F27,共九流程二十七幀)

---

## 0 · 核心隱喻

**「魔術師獨幕劇 + 沙漏倒數」**

把 21 點(Blackjack)的賭桌,翻譯為一場觀眾席圍觀的劇場演出:

- **荷官 = 魔術師**(高帽、白手套、鞠躬)
- **發牌 = 揭幕**(牌張從袖口飛出,劃過聚光)
- **思考時間 = 沙漏**(銅製沙漏取代秒環,沙落為節拍)
- **時間壓力 = 鼓點與紅光**(≤ 1.2s 時聚光由金轉紅)
- **暗門 = 道具藏牌**(把牌藏入時間之外,下幕重現)
- **回合 = 一幕**(三幕後決勝負)
- **失敗 = 紅幕降下**(劇終、鞠躬、退場)

設計三原則:
1. **戲劇先於資訊** — 每個 UI 元素都要對應劇場語彙,而非單純 HUD。
2. **節奏先於數字** — 用沙、鼓、燈光的變化承載時間,而非倒數秒數。
3. **緊張先於效率** — 接受 0.4s 的儀式感,換得每個決定都被觀看。

---

## 1 · 視覺語彙系統

### 色彩 (`V21_THEMES.theatre`)

| 變數 | 用途 | 值 |
|---|---|---|
| `bg` | 舞台底 / 木地板 | `#1a0a0a` |
| `velvet` / `velvetDeep` | 紅幕主色 / 暗部 | `#7a1f1f` / `#4a1010` |
| `gold` | 銅製道具、邊框、字 | `#d4a543` |
| `spot` | 聚光、亮牌、勝色 | `#fff7d9` |
| `ink` / `inkDim` | 主文字 / 次文字 | `#f0dfae` / `#a08866` |
| 警示紅 (緊急) | 沙盡、爆牌 | `#ff5a30` ~ `#ff8a5a` |
| 勝色綠 | 勝燈 | `#7ad48a` ~ `#a8f0b8` |

### 字體
- `fontDisplay`: 襯線體,用於標題、數字、劇情語氣 (`"DM Serif Display", "Cormorant Garamond", serif`)
- `fontUI`: 等寬或書信體,用於旁白、stage direction (`"EB Garamond", "Spectral", serif`)

### 共用元件 (見 `theatre2_flows.jsx`)
- `<StageShell>` — 紅幕邊 + 標題列 + 沙漏 + 旁白底
  - props: `act`, `title`, `stage`, `hourPct (0–1)`, `urgent`, `narration`
- `<FCard>` — 牌
  - props: `card {s,v}`, `size`, `hidden`, `lit`, `rotate`, `fly`, `dim`, `x`, `y`
- `<Beat>` — 中央劇情字幕(間隔字 · 等距 · 大寫劇本感)

---

## 2 · 九大遊戲流程

每個流程 (F*) 至少 3 個關鍵幀,展示中間轉場。
以下規格列出**狀態機 · UI 變化 · 資料條件 · 動效節奏 · 工程注意點**。

---

### 流程 1 · 開場入座 (F1–F3)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F1 | 幕啟 · 紅幕升起 | 上方紅幕仍降一半,中央高帽 | 「魔術師走上中央,摘下高帽。」 |
| F2 | 洗牌 · 銀河瀑布 | 13 張暗牌呈扇形展開 | 「五十二章劇本。」 |
| F3 | 入座 · 三注落定 | 三個觀眾席亭子,各壓 5 籌碼 | 「壹貳叁押注,沙漏待啟。」 |

**狀態機**: `IDLE → SHUFFLING → BETTING → READY`
**資料**:
- `players: [{ id: '壹'|'貳'|'叁', bet: 5, stack: number }]`
- `deck: Card[52]` (洗牌後)
**動效**:
- F1 紅幕 transform: `translateY(0%)` ← `translateY(-100%)`,曲線 `cubic-bezier(.5,0,.5,1)`,2.4s
- F2 牌張依序從牌堆中心展開,每張間隔 80ms,用 `transform: rotate()` + 半徑展
- F3 籌碼從畫面外飛入,`fx-fly` keyframes
**工程注意**:
- 押注金額來自上一回合,新玩家用預設 `defaultBet`
- 此階段不啟動沙漏 (`hourPct = 1`)

---

### 流程 2 · 第一輪發牌 (F4–F6)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F4 | 飛出第一張 | 牌堆 → 弧線軌跡 → 飛行中的牌 | 「魔術師抬手,沙漏倒置,時間始流。」 |
| F5 | 三家持牌 | 莊家 1 暗牌,三家各 1 暗牌 | 「人手一張,皆藏其面。」 |
| F6 | 明牌落定 | 莊家(暗+明 8),三家明牌 9/8/6 | 「點數浮現:9 · 8 · 6。」 |

**狀態機**: `READY → DEAL_R1_DEALER → DEAL_R1_PLAYERS → DEAL_R2 → REVEAL_UPCARDS`
**動效**:
- 每張飛行 0.55s,`cubic-bezier(.2,.8,.2,1)`
- 沙漏在 F4 第一張落下時啟動 (`hourPct: 1 → 0.95`)
- 翻面用 3D `rotateY(180deg)`,中段切換正反
**工程注意**:
- 牌張位置固定 slot,`x/y` 由 layout 算出而非寫死
- 點數計算函式 `score(hand)` 處理 A 的 1/11 雙值
- 莊家暗牌 (hole card) 不在前端記憶體,後端控制

---

### 流程 3 · 玩家行動 · 要 / 停 / 加注 (F7–F9)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F7 | B 抉擇 | 聚光打在 B 觀眾席,顯示「我要牌!」 | 「B 抬眼,輕點。」 |
| F8 | 飛牌軌跡 | 弧線從魔術師 → B,牌在空中 | 「一張白光劃過劇場 — 是 ♠6。」 |
| F9 | 14 點 · 安全 | B 三張在前,大字「14」 | 「掌聲雷動,沙漏歸位。」 |

**狀態機**: `PLAYER_TURN(i) → ACTION{HIT|STAND|DOUBLE|SPLIT} → DEAL_CARD → CHECK_BUST → NEXT_PLAYER`
**互動**:
- 動作鍵盤捷徑: `1 = Hit / 2 = Stand / 3 = Double`
- 鈕標上小字提示鍵位,與 03b Theatre 主畫面一致
**動效**:
- 沙漏在玩家回合每次 reset 為 `hourPct: 1`
- 安全著陸時聚光 spike: `box-shadow` 從 0 → 24px 金光,200ms 後回穩
**資料條件**:
- 點數 21 自動 stand
- 點數 > 21 觸發 F25 (爆牌流程)
- 第 5 張仍 ≤ 21 觸發「五龍」勝利特效 (待擴充)

---

### 流程 4 · 暗門使用 (F10–F12)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F10 | 暗門啟動 | 右側虛線方框、金光呼吸 | 「袖口微啟,選一張藏入時外。」 |
| F11 | 牌沉入金光 | 漏斗光柱 + 金粉粒子 | 「一陣金粉,牌消失了。」 |
| F12 | 封印 · 待用 | 金邊方塊 + 「暗門 · 1」 | 「下一幕啟用。」 |

**狀態機**: `STASH_HOVER → STASH_DROP → STASH_LOCKED`
**互動**:
- 點擊牌張 → 拖曳到右側暗門 → 鬆手沉入
- 替代互動: 牌張角落「◐」icon 點擊
**動效**:
- 金粉用 8 個 `<div>` + `position: absolute` + 隨機 left,opacity 漸退
- 漏斗用 `clip-path: polygon(20% 0, 80% 0, 60% 100%, 40% 100%)`
**資料**:
- `player.stash: Card[]`,最多容量 1(預設)或 2(進階規則)
- 暗門中的牌可在下一回合「換一張手牌」
**工程注意**:
- 暗門是本作的非標準規則,需明確 onboarding 教學
- 後端驗證 stash 操作,防止作弊

---

### 流程 5 · 誘餌 · 全桌跟注 (F13–F15)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F13 | 魔術師佯失手 | ♥Q 滑落桌面 | 「啊 — 失手了?」 |
| F14 | 籌碼蝶飛 | 三條虛線軌跡 + 八枚籌碼向中央 | 「跟 10 · 跟 10 · 跟 10。」 |
| F15 | 底池沸騰 | 中央方框「底池 30」,三倍標示 | 「底池漲至 30 — 沙漏走得更快。」 |

**狀態機**: `LURE_TRIGGER → CALL_PHASE → POT_UPDATE`
**動效**:
- 誘餌牌的旋轉角 -25°,模擬「掉落」
- 籌碼飛行用 SVG path animation,各 800ms 錯開 100ms
- 底池數字用 `useCountUp` 從 10 → 30
**資料**:
- 觸發條件: 莊家明牌弱 (≤ 6) 且後端 `lureMode = true` 時開啟
- 跟注最低為當前底注的 2x
**工程注意**:
- 此流程是「賽局心理」設計而非規則必須,可作為高難度模式選項
- 誘餌權重隨關卡進度調整

---

### 流程 6 · 倒數逾時 · 強制結算 (F16–F18)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F16 | 0.7 秒 · 鼓密 | 沙漏放大 + 紅光暈 + 「0.7秒」 | 「觀眾屏息 — 你的選擇?」 |
| F17 | 沙盡 · 強制 | 紅光全屏脈動 + 「強制發牌」橫幅 | 「主角失語,劇本自動翻頁。」 |
| F18 | 自動發第三張 | ♣3 飛入 B,大字「17」 | 「系統結算中。」 |

**狀態機**: `URGENT (≤ 1.2s) → URGENT_CRITICAL (≤ 0.5s) → TIMEOUT → AUTO_ACTION`
**動效**:
- `≤ 1.2s`: 聚光由金轉紅,觀眾席微震 (`transform: translateX` 0.5~1px 抖動)
- `≤ 0.5s`: 主動作鈕 `box-shadow` 紅光脈動 (0.3s 週期)
- `= 0s`: 全屏紅光暈 0.4s,然後自動執行「停牌」(stand)
**自動規則**:
- 超時預設動作: `stand`
- 進階模式: 玩家可在設定中選 `auto_action: 'stand' | 'hit_if_below_15'`
**工程注意**:
- 倒數時鐘使用 `requestAnimationFrame`,但**權威時間源是後端**
- 切勿用 `setTimeout` 計時(瀏覽器分頁背景時不準)
- 後端送出「將要逾時」廣播 (T-1.2s) 讓前端進入 URGENT 狀態

---

### 流程 7 · 翻牌結算 (F19–F21)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F19 | 袖口將翻 | 莊家三張(1 暗 2 明) | 「袖口翻轉 — 觀眾席探身。」 |
| F20 | ♥A 現 · 21! | 暗牌翻面為 ♥A,大字「21」 | 「黑桃 8 + 紅心 2 + 紅心 A = 21,完美。」 |
| F21 | 勝負落燈 | 三家亭子,綠/紅燈各歸位 | 「壹勝 · 貳負 · 叁負。」 |

**狀態機**: `ALL_PLAYERS_DONE → DEALER_REVEAL → DEALER_DRAW (if total < 17) → COMPARE → SETTLE`
**勝負規則** (標準 21 點):
- 玩家 > 21: 爆,玩家敗(無論莊家)
- 玩家 ≤ 21,莊家 > 21: 玩家勝
- 兩者皆 ≤ 21: 比點數,大者勝;同點為和
- Blackjack (A + 10/J/Q/K) 通常賠 1.5x
**動效**:
- 暗牌翻面 0.4s,用 `transform: rotateY()` + `backface-visibility`
- 勝/負燈為亭子的 `box-shadow` 由灰轉色 + 0.3s 內向外擴
**工程注意**:
- `compareHands(player, dealer)` 純函式,易測試
- 結算金額更新 `player.stack`,動畫見流程 8

---

### 流程 8 · 回合間 · 結算與預告 (F22–F24)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F22 | 籌碼飛入壹席 | 弧線軌跡 + 6 枚籌碼漸退 | 「魔術師揮袖 — 30 枚如雁飛入。」 |
| F23 | 計分板 | 三行 "壹/貳/叁" + 增減 + 餘額 | 「一輪 = 一幕,三幕後決勝負。」 |
| F24 | 再啟沙漏 | 紅幕半降 + 大金鈕「再啟沙漏」 | 「按下再來一幕,沙漏即將重啟。」 |

**狀態機**: `SETTLE_CHIPS → SHOW_SCOREBOARD → READY_NEXT`
**資料**:
- `round: { idx: number, totalRounds: 3 }`
- `scoreboard: [{ player, delta, total }]`
**動效**:
- 籌碼飛行用 path + 串列發射 (60ms 間隔)
- 計分板數字用 `useCountUp`
- 再啟鈕長按聚光由暗轉亮(模擬點亮舞台)
**工程注意**:
- 三幕(回合)後進入「終局結算」(待設計)
- 暗門中的牌跨幕保留,但要在新幕開始時提示

---

### 流程 9 · 失敗 · 爆牌退場 (F25–F27)

| Frame | 名稱 | 關鍵視覺 | 旁白 |
|---|---|---|---|
| F25 | 紅心 J 飛來 | 紅色弧線 + ♥J 旋轉飛入 | 「貳堅持要牌 — 一張紅心 J 朝他飛去。」 |
| F26 | 爆 · 25 | B 三張(7+8+J=25) + 紅光大字「爆」 | 「7 + 8 + 10 = 25,溢出。」 |
| F27 | 幕落 · 鞠躬 | 紅幕降至 90%,中央「劇終 · 鞠躬」 | 「下一幕,沙漏為誰而起?」 |

**狀態機**: `BUST_DETECTED → BUST_REVEAL → ELIMINATE_PLAYER`
**動效**:
- 爆牌的卡片 dim,新牌 lit + fly
- 「爆」字 `text-shadow` 紅光 + `fx-shimmer` 0.5s 閃
- 紅幕從 0% → 90% 高度,2s,曲線急停
**結局處理**:
- 玩家籌碼歸零 → 觀看其他玩家完成本幕 → 下幕重新買入或退場
- 籌碼歸零三次 → 進入「終曲」結算畫面(待設計)
**工程注意**:
- 爆牌玩家的觀看模式 UI 與主動模式區分 (灰調 + 「觀眾席」標籤)
- 復活機制(若有)需後端授權

---

## 3 · 全局狀態機

```
IDLE
  → SHUFFLING → BETTING → READY
  → DEAL_R1_DEALER → DEAL_R1_PLAYERS → DEAL_R2 → REVEAL_UPCARDS
  → PLAYER_TURN_LOOP {
      → URGENT (≤ 1.2s)
      → URGENT_CRITICAL (≤ 0.5s)
      → TIMEOUT → AUTO_ACTION
      → ACTION{HIT|STAND|DOUBLE|SPLIT|STASH}
      → BUST? → BUST_REVEAL
    }
  → DEALER_REVEAL → DEALER_DRAW → COMPARE → SETTLE
  → SETTLE_CHIPS → SHOW_SCOREBOARD → READY_NEXT
  → (round < 3) ? BETTING : FINALE
```

---

## 4 · 工程建議結構

```
src/
  components/
    StageShell.tsx         # 共用劇場殼
    FCard.tsx              # 牌
    Beat.tsx               # 字幕
    Hourglass.tsx          # 沙漏
    Curtain.tsx            # 紅幕(可控制升降)
    SpotLight.tsx          # 聚光
    ChipStack.tsx          # 籌碼堆
  scenes/                  # 對應 F1–F27 的場景組件
    Act1_Open/
    Act2_Deal/
    ...
  state/
    gameMachine.ts         # XState 或 Zustand,實作上方狀態機
    types.ts               # Card, Player, Round, GameState
  game/
    rules.ts               # score(), compareHands(), validateAction()
    deck.ts                # shuffle(), draw()
  net/
    socket.ts              # 後端時間源同步、防作弊
  audio/
    cues.ts                # 紅幕、沙漏、籌碼、鼓點音效觸發
```

**技術選型建議**:
- 狀態機: **XState** (流程明確、可視化除錯)
- 動畫: **Framer Motion** + **CSS keyframes** 混用
- 音效: **Howler.js**(已有 fallback、可控音量)
- 後端: **WebSocket** + 權威時鐘 + 牌堆狀態

---

## 5 · 待擴充

以下尚未在 v1 設計中完整體現,建議下一輪迭代:

- [ ] **Onboarding** — 第一次玩的教學幕(暗門、誘餌規則的劇情化解說)
- [ ] **終局結算** — 三幕後的勝者鞠躬畫面
- [ ] **Five-Card Charlie** — 第 5 張仍 ≤ 21 的「五龍」特效
- [ ] **Split / Double Down** — 分牌 / 雙倍下注的劇場語彙
- [ ] **音效設計** — 紅幕摩擦、沙漏細沙、籌碼撞擊、鼓點
- [ ] **多人連線** — 觀眾席真實玩家化的 socket 設計
- [ ] **無障礙** — 振動 / 高對比 / 旁白讀稿的 a11y 模式

---

## 6 · 設計決策紀錄

| 決策 | 選擇 | 替代方案 | 理由 |
|---|---|---|---|
| 倒數視覺 | 銅製沙漏 | 進度條 / 秒數 | 與劇場隱喻一致;沙的物理性比抽象進度更逼人 |
| 緊急閾值 | 1.2s / 0.5s | 3s / 1s | A/B 測試後手感最緊;太早觸發會疲勞 |
| 暗門容量 | 1 張 | 2 張 / 無限 | 1 張保留「珍惜每一次決定」的劇情張力 |
| 動作鍵位 | 1/2/3 | WASD / 滑鼠 | 直覺對應「要/停/加」三選一 |
| 配色 | 紅 + 銅金 | 黑金 / 純黑 | 紅幕是劇場核心符號,銅金提供溫度與光線層次 |
| 字體 | 襯線體 | 無襯線 | 襯線承載儀式感,與 HUD 語言區隔 |

---

_最後更新:_ 由 Vantage 21 設計團隊維護。
新增流程或修改視覺時,**先更新本檔再寫程式**。
