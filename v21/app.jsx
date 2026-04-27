// app.jsx — Vantage 21 design canvas
// Wires up the four directions inside DCSection / DCArtboard cards. Each
// artboard wraps its variation in a phone bezel via V21Phone. A second
// section explores the Tweaks-driven theme switcher + dealer-POV variant.

const ART_W = 360, ART_H = 760;

// State-of-play snapshot for each variation (the "current canonical scene"
// is identical so the user can compare visual treatment, not content).
function App() {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "velvet",
    "pov": "overhead",
    "motion": "dramatic"
  }/*EDITMODE-END*/);

  // pick which screen renders inside the live "tweakable" artboard
  const Live = {
    velvet: VelvetScreen,
    neon: NeonScreen,
    theatre: TheatreScreen,
    theatre2: TheatreScreen2,
    split: SplitScreen,
  }[tweaks.theme] || VelvetScreen;

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection id="overview"
          title="Vantage 21 — 四個荷官桌的可能性"
          subtitle="同一局：閒家 B 思考中。看相同的牌局如何被四種視覺語言重述。">

          <DCArtboard id="velvet" label="01 · Velvet & Brass — 拉斯維加斯地下沙龍"
            width={ART_W} height={ART_H}>
            <V21Phone label="01 Velvet & Brass"><VelvetScreen /></V21Phone>
          </DCArtboard>

          <DCArtboard id="neon" label="02 · Neon Vault — 賽博先知 HUD"
            width={ART_W} height={ART_H}>
            <V21Phone label="02 Neon Vault"><NeonScreen /></V21Phone>
          </DCArtboard>

          <DCArtboard id="theatre" label="03 · The Theatre — 魔術師獨幕劇"
            width={ART_W} height={ART_H}>
            <V21Phone label="03 Theatre"><TheatreScreen /></V21Phone>
          </DCArtboard>

          <DCArtboard id="theatre2" label="03b · Theatre + Curtain Clock — 沙漏倒數"
            width={ART_W} height={ART_H}>
            <V21Phone label="03b Theatre + Clock"><TheatreScreen2 /></V21Phone>
          </DCArtboard>

          <DCArtboard id="split" label="04 · Split-Second — 心跳倒數"
            width={ART_W} height={ART_H}>
            <V21Phone label="04 Split-Second"><SplitScreen /></V21Phone>
          </DCArtboard>

          <DCPostIt top={-30} left={ART_W * 5 + 56 + 60 * 5} rotate={3} width={230}>
            <strong>怎麼讀這張板？</strong><br/>
            01 經典升級 / 02 視覺翻新 /<br/>
            03 重塑互動隱喻 /<br/>
            <span style={{ background: 'rgba(212,165,67,0.25)', padding: '0 3px' }}>
              03b 把 04 的倒數時間，<br/>翻譯為劇場語彙（沙漏 + 節拍）
            </span> /<br/>
            04 加入時間壓力<br/><br/>
            Tweaks 可即時切換第二排主題。
          </DCPostIt>

          <DCPostIt top={ART_H + 30} left={ART_W * 3 + 60 * 3} rotate={-2} width={220}>
            <strong>03b 的設計動作</strong><br/>
            • 銅製沙漏取代秒針環<br/>
            • 沙落入舞台下方的「節拍」托盤<br/>
            • 倒數 ≤ 1.2s：聚光由金轉紅，<br/>
              觀眾席微震，主鈕脈動<br/>
            • 提示語切「幕將落 · 動作」<br/>
            • 動作鈕標上 1/2/3 提示鍵位
          </DCPostIt>
        </DCSection>

        {/* ───── 03b 全流程展開 ─────
            每個流程一行 (DCSection),3 個連續畫面展示中間轉場。
            為了讓畫布橫向不太擠,每行只放代表性的關鍵 frame。 */}
        <DCSection id="flow1" title="流程 1 · 開場入座" subtitle="紅幕升起 → 洗牌 → 觀眾入座押注">
          <DCArtboard id="f1a" label="幕啟 · 紅幕升起" width={ART_W} height={ART_H}>
            <V21Phone label="1.1 幕啟"><F1_Curtain /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f1b" label="洗牌 · 銀河瀑布" width={ART_W} height={ART_H}>
            <V21Phone label="1.2 洗牌"><F2_Shuffle /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f1c" label="入座 · 三注落定" width={ART_W} height={ART_H}>
            <V21Phone label="1.3 押注"><F3_Seats /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow2" title="流程 2 · 第一輪發牌" subtitle="袖中飛出 → 三家落定 → 翻明牌">
          <DCArtboard id="f2a" label="飛出第一張" width={ART_W} height={ART_H}>
            <V21Phone label="2.1 飛牌"><F4_DealStart /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f2b" label="三家持牌" width={ART_W} height={ART_H}>
            <V21Phone label="2.2 持牌"><F5_DealAll /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f2c" label="明牌落定" width={ART_W} height={ART_H}>
            <V21Phone label="2.3 翻明"><F6_DealReveal /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow3" title="流程 3 · 玩家行動 · 要 / 停 / 加注" subtitle="思考 → 飛牌 → 安全著陸">
          <DCArtboard id="f3a" label="B 抉擇" width={ART_W} height={ART_H}>
            <V21Phone label="3.1 抉擇"><F7_Bthink /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f3b" label="飛牌軌跡" width={ART_W} height={ART_H}>
            <V21Phone label="3.2 飛牌"><F8_BdrawFlying /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f3c" label="14 點 · 安全" width={ART_W} height={ART_H}>
            <V21Phone label="3.3 安全"><F9_BlandSafe /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow4" title="流程 4 · 暗門使用" subtitle="召喚 → 沉入 → 封印">
          <DCArtboard id="f4a" label="暗門啟動" width={ART_W} height={ART_H}>
            <V21Phone label="4.1 啟動"><F10_TrapHover /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f4b" label="牌沉入金光" width={ART_W} height={ART_H}>
            <V21Phone label="4.2 沉入"><F11_TrapDrop /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f4c" label="封印 · 待用" width={ART_W} height={ART_H}>
            <V21Phone label="4.3 封印"><F12_TrapClose /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow5" title="流程 5 · 誘餌 · 全桌跟注" subtitle="佯失手 → 跟注 → 底池三倍">
          <DCArtboard id="f5a" label="魔術師佯失手" width={ART_W} height={ART_H}>
            <V21Phone label="5.1 誘餌"><F13_LurePlay /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f5b" label="籌碼蝶飛" width={ART_W} height={ART_H}>
            <V21Phone label="5.2 跟注"><F14_LureFollow /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f5c" label="底池沸騰" width={ART_W} height={ART_H}>
            <V21Phone label="5.3 三倍"><F15_LurePot /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow6" title="流程 6 · 倒數逾時 · 強制結算" subtitle="鼓聲漸密 → 紅光爆 → 自動翻牌">
          <DCArtboard id="f6a" label="0.7 秒 · 鼓密" width={ART_W} height={ART_H}>
            <V21Phone label="6.1 將盡"><F16_TimeLow /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f6b" label="沙盡 · 強制" width={ART_W} height={ART_H}>
            <V21Phone label="6.2 介入"><F17_TimeOut /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f6c" label="自動發第三張" width={ART_W} height={ART_H}>
            <V21Phone label="6.3 強發"><F18_TimeForced /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow7" title="流程 7 · 翻牌結算" subtitle="魔術師翻底 → 21 點現 → 勝負落燈">
          <DCArtboard id="f7a" label="袖口將翻" width={ART_W} height={ART_H}>
            <V21Phone label="7.1 將翻"><F19_DealerHole /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f7b" label="♥A 現 · 21!" width={ART_W} height={ART_H}>
            <V21Phone label="7.2 揭曉"><F20_DealerReveal /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f7c" label="勝負落燈" width={ART_W} height={ART_H}>
            <V21Phone label="7.3 落燈"><F21_Result /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow8" title="流程 8 · 回合間 · 結算與預告" subtitle="籌碼飛流 → 計分板 → 下一幕">
          <DCArtboard id="f8a" label="籌碼飛入壹席" width={ART_W} height={ART_H}>
            <V21Phone label="8.1 結算"><F22_ChipsMove /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f8b" label="計分板" width={ART_W} height={ART_H}>
            <V21Phone label="8.2 計分"><F23_Score /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f8c" label="再啟沙漏" width={ART_W} height={ART_H}>
            <V21Phone label="8.3 預告"><F24_NextAct /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="flow9" title="流程 9 · 失敗 · 爆牌退場" subtitle="第三張飛 → 爆 25 → 紅幕降">
          <DCArtboard id="f9a" label="紅心 J 飛來" width={ART_W} height={ART_H}>
            <V21Phone label="9.1 飛來"><F25_BustDraw /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f9b" label="爆 · 25" width={ART_W} height={ART_H}>
            <V21Phone label="9.2 爆"><F26_BustReveal /></V21Phone>
          </DCArtboard>
          <DCArtboard id="f9c" label="幕落 · 鞠躬" width={ART_W} height={ART_H}>
            <V21Phone label="9.3 劇終"><F27_BustCurtain /></V21Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="live"
          title="可調主題 — Tweaks 驅動的活樣本"
          subtitle="開啟工具列「Tweaks」即可切換。也可探索 POV / 動效強度等延伸維度。">

          <DCArtboard id="active" label={`現選 · ${V21_THEMES[tweaks.theme]?.name || ''}`}
            width={ART_W} height={ART_H}>
            <V21Phone label="Tweakable"><Live /></V21Phone>
          </DCArtboard>

          <DCPostIt top={-10} left={ART_W + 80} rotate={-2} width={240}>
            <strong>下一步建議</strong><br/>
            • 加入發牌「飛行」動畫 + 翻面節奏<br/>
            • Stash 點擊改用「拉抽屜」位移<br/>
            • 將 04 的倒數整合進主版本<br/>
            • 補上勝負結算畫面 / 開場引導
          </DCPostIt>
        </DCSection>
      </DesignCanvas>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="主題">
          <TweakRadio
            value={tweaks.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'velvet',   label: 'Velvet' },
              { value: 'neon',     label: 'Neon' },
              { value: 'theatre',  label: 'Theatre' },
              { value: 'theatre2', label: 'Theatre⏳' },
              { value: 'split',    label: 'Split' },
            ]} />
        </TweakSection>
        <TweakSection label="莊家視角">
          <TweakRadio
            value={tweaks.pov}
            onChange={(v) => setTweak('pov', v)}
            options={[
              { value: 'overhead', label: '俯瞰' },
              { value: 'first',    label: '第一人稱' },
            ]} />
        </TweakSection>
        <TweakSection label="動效強度">
          <TweakRadio
            value={tweaks.motion}
            onChange={(v) => setTweak('motion', v)}
            options={[
              { value: 'subtle',   label: '克制' },
              { value: 'dramatic', label: '戲劇' },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
