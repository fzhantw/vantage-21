let deck = [];
let dealerHand = [];
let dealerStash = [];
let selectedStashIndex = -1;
let players = [
    { id: 0, name: '閒家 A', chips: 10, hand: [], bet: 0, status: 'waiting', result: null },
    { id: 1, name: '閒家 B', chips: 10, hand: [], bet: 0, status: 'waiting', result: null },
    { id: 2, name: '閒家 C', chips: 10, hand: [], bet: 0, status: 'waiting', result: null }
];
let isLured = false;
let currentPlayerTurn = -1; // -1: none, 0-2: players, 3: dealer
let phase = 'idle'; // idle, initial-deal, player-turn, dealer-turn

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// --- Core Logic ---

function initDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    hand.forEach(card => {
        score += getCardValue(card);
        if (card.value === 'A') aces++;
    });
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

// --- AI Algorithm ---
function shouldPlayerHit(player) {
    const score = calculateScore(player.hand);
    if (score >= 21) return false;
    
    // Smart algorithm:
    // 1. Always hit if < 12
    if (score < 12) return true;
    
    // 2. Risk evaluation for 12-16
    const bustCards = deck.filter(c => score + getCardValue(c) > 21).length;
    const safeCards = deck.length - bustCards;
    const bustProbability = bustCards / deck.length;
    
    // If dealer has high visible card, player takes more risk
    const dealerVisibleScore = calculateScore(dealerHand);
    const riskThreshold = (dealerVisibleScore >= 7) ? 0.6 : 0.4;
    
    return bustProbability < riskThreshold;
}

// --- UI Updates ---

function updateUI() {
    // Deck pile count + empty state
    const deckCountEl = document.querySelector('.deck-count');
    if (deckCountEl) deckCountEl.textContent = deck.length;
    const deckPileEl = document.getElementById('deck-pile');
    if (deckPileEl) deckPileEl.classList.toggle('empty', deck.length === 0);

    // Deck Preview
    const futureDiv = document.getElementById('future-cards');
    if (futureDiv) {
        futureDiv.innerHTML = '';
        deck.slice(0, 3).forEach(card => futureDiv.appendChild(createCardElement(card)));
    }

    // Stash
    const stashDiv = document.getElementById('stash-cards');
    if (stashDiv) {
        stashDiv.innerHTML = '';
        dealerStash.forEach((card, idx) => {
            const el = createCardElement(card);
            el.style.cursor = 'pointer';
            if (idx === selectedStashIndex) {
                el.style.border = '3px solid #ffd700';
                el.style.transform = 'scale(1.1)';
            }
            el.onclick = () => selectStashCard(idx);
            stashDiv.appendChild(el);
        });
    }

    // Dealer
    const dealerDiv = document.getElementById('dealer-cards');
    if (dealerDiv) {
        dealerDiv.innerHTML = '';
        dealerHand.forEach(card => dealerDiv.appendChild(createCardElement(card)));
        document.getElementById('dealer-score').textContent = `分數: ${calculateScore(dealerHand)}`;
    }

    // Players
    players.forEach(p => {
        const pBox = document.getElementById(`player-${p.id}`);
        if (!pBox) return;

        pBox.querySelector('.chips').textContent = `籌碼: ${p.chips}`;
        pBox.querySelector('.bet').textContent = `注好: ${p.bet}`;
        
        const pCards = pBox.querySelector('.cards');
        pCards.innerHTML = '';
        p.hand.forEach((card, idx) => {
            const isHidden = (idx === 0 && phase !== 'resolved');
            pCards.appendChild(createCardElement(card, isHidden));
        });

        const statusHint = document.getElementById(`player-${p.id}-status`);
        
        pBox.classList.remove('active', 'stand', 'bust', 'out', 'result-win', 'result-lose', 'result-draw');
        if (p.status === 'out') {
            pBox.classList.add('out');
            if (statusHint) statusHint.textContent = '籌碼用盡';
        } else if (phase === 'resolved' && p.result) {
            pBox.classList.add(`result-${p.result}`);
            const resultLabel = { win: '🏆 獲勝！', lose: '💀 落敗', draw: '🤝 平手' }[p.result];
            if (statusHint) statusHint.textContent = `${resultLabel}（分數：${calculateScore(p.hand)}）`;
        } else {
            if (p.status === 'bust') pBox.classList.add('bust');
            if (p.status === 'stand') pBox.classList.add('stand');

            if (currentPlayerTurn === p.id && phase === 'player-turn') {
                pBox.classList.add('active');
                
                // Scroll player into view on mobile carousel
                if (window.innerWidth <= 768) {
                    pBox.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }

                const wantsHit = shouldPlayerHit(p);
                if (statusHint) statusHint.textContent = wantsHit ? "我想要牌！" : "我停牌。";
                if (!wantsHit) {
                    p.status = 'stand';
                    setTimeout(nextTurn, 1000);
                }
            } else {
                if (statusHint) statusHint.textContent = p.status === 'stand' ? "已停牌" : (p.status === 'bust' ? "爆牌了！" : "等待中...");
            }
        }
    });

    // Toggle global player actions based on turn
    const pActions = document.getElementById('player-actions');
    const dActions = document.getElementById('dealer-actions');
    
    if (pActions && dActions) {
        if (phase === 'player-turn' && currentPlayerTurn !== -1) {
            const activePlayer = players[currentPlayerTurn];
            if (shouldPlayerHit(activePlayer)) {
                pActions.style.display = 'flex';
            } else {
                pActions.style.display = 'none';
            }
            dActions.style.display = 'none';
        } else if (phase === 'dealer-turn') {
            pActions.style.display = 'none';
            dActions.style.display = 'flex';
        } else {
            pActions.style.display = 'none';
            dActions.style.display = 'none';
        }
    }

    const dHitBtn = document.getElementById('dealer-hit-btn');
    const dStandBtn = document.getElementById('dealer-stand-btn');
    const nextBtn = document.getElementById('next-round-btn');
    const lureBtn = document.getElementById('lure-btn');

    if (dHitBtn) dHitBtn.disabled = (phase !== 'dealer-turn');
    if (dStandBtn) dStandBtn.disabled = (phase !== 'dealer-turn');
    if (nextBtn) nextBtn.disabled = (phase !== 'idle' && phase !== 'resolved');
    if (lureBtn) lureBtn.disabled = (phase === 'initial-deal' || phase === 'dealer-turn' || phase === 'resolved' || isLured);
}

function animateCardFlight(targetCardEl, fromEl) {
    if (!targetCardEl || !fromEl) return;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = targetCardEl.getBoundingClientRect();
    if (toRect.width === 0 || fromRect.width === 0) return;
    const dx = (fromRect.left + fromRect.width / 2) - (toRect.left + toRect.width / 2);
    const dy = (fromRect.top + fromRect.height / 2) - (toRect.top + toRect.height / 2);

    targetCardEl.style.transition = 'none';
    targetCardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(-180deg) scale(0.85)`;
    targetCardEl.style.opacity = '0.4';
    targetCardEl.classList.add('flying');
    void targetCardEl.offsetHeight;

    requestAnimationFrame(() => {
        targetCardEl.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.7, 0.3, 1), opacity 0.3s ease-out';
        targetCardEl.style.transform = '';
        targetCardEl.style.opacity = '';
    });

    setTimeout(() => {
        targetCardEl.classList.remove('flying');
        targetCardEl.style.transition = '';
        targetCardEl.style.transform = '';
        targetCardEl.style.opacity = '';
    }, 500);

    if (fromEl.classList.contains('deck-pile')) {
        fromEl.classList.remove('dealing');
        void fromEl.offsetHeight;
        fromEl.classList.add('dealing');
        setTimeout(() => fromEl.classList.remove('dealing'), 340);
    }
}

function animateLastCardFrom(containerSelector, fromSelector = '#deck-pile') {
    const container = document.querySelector(containerSelector);
    const fromEl = document.querySelector(fromSelector);
    if (!container || !fromEl) return;
    const cards = container.querySelectorAll('.card');
    if (cards.length === 0) return;
    animateCardFlight(cards[cards.length - 1], fromEl);
}

function createCardElement(card, isHidden = false) {
    const el = document.createElement('div');
    if (isHidden) {
        el.className = 'card hidden';
    } else {
        el.className = 'card' + (['♥', '♦'].includes(card.suit) ? ' red' : '');
        el.textContent = `${card.suit}${card.value}`;
    }
    return el;
}

// --- Game Actions ---

async function startRound() {
    initDeck();
    phase = 'initial-deal';
    dealerHand = [];
    players.forEach(p => {
        p.hand = [];
        p.result = null;
        if (p.chips <= 0) {
            p.status = 'out';
            p.bet = 0;
        } else {
            p.status = 'playing';
            const baseBet = 1 + Math.floor(Math.random() * 2);
            p.bet = Math.min(p.chips, isLured ? 5 : baseBet);
            p.chips -= p.bet;
        }
    });
    
    const statusMsg = document.getElementById('game-status');
    if (statusMsg) statusMsg.textContent = "正在發送起始牌...";
    updateUI();

    // Initial Deal (2 cards each, skip 'out' players)
    for (let i = 0; i < 2; i++) {
        for (let p of players) {
            if (p.status === 'out') continue;
            p.hand.push(deck.shift());
            updateUI();
            animateLastCardFrom(`#player-${p.id} .cards`);
            await new Promise(r => setTimeout(r, 300));
        }
        dealerHand.push(deck.shift());
        updateUI();
        animateLastCardFrom('#dealer-cards');
        await new Promise(r => setTimeout(r, 300));
    }

    phase = 'player-turn';
    currentPlayerTurn = -1;
    if (statusMsg) statusMsg.textContent = "現在是閒家回合，你可以決定是否發牌或扣牌。";
    nextTurn();
}

function giveCardToPlayer() {
    const p = players[currentPlayerTurn];
    if (!p) return;
    let card;
    let fromStash = false;

    if (selectedStashIndex !== -1) {
        card = dealerStash.splice(selectedStashIndex, 1)[0];
        selectedStashIndex = -1;
        fromStash = true;
        document.getElementById('game-status').textContent = `你將扣下的牌發給了 ${p.name}！`;
    } else {
        card = deck.shift();
    }

    p.hand.push(card);
    if (calculateScore(p.hand) > 21) {
        p.status = 'bust';
        nextTurn();
    }
    updateUI();
    animateLastCardFrom(`#player-${p.id} .cards`, fromStash ? '#stash-cards' : '#deck-pile');
}

function stashCard() {
    dealerStash.push(deck.shift());
    document.getElementById('game-status').textContent = "你扣下了一張牌！這張牌現在在你的倉庫中。";
    updateUI();
    animateLastCardFrom('#stash-cards');
}

function selectStashCard(index) {
    if (phase !== 'dealer-turn' && phase !== 'player-turn') return;
    
    if (selectedStashIndex === index) {
        selectedStashIndex = -1;
    } else {
        selectedStashIndex = index;
    }
    updateUI();
}

function nextTurn() {
    currentPlayerTurn++;
    while (currentPlayerTurn < players.length && players[currentPlayerTurn].status === 'out') {
        currentPlayerTurn++;
    }
    if (currentPlayerTurn >= players.length) {
        phase = 'dealer-turn';
        document.getElementById('game-status').textContent = "輪到莊家（你）的回合了。";
    }
    updateUI();
}

function dealerHit() {
    let card;
    let fromStash = false;
    if (selectedStashIndex !== -1) {
        card = dealerStash.splice(selectedStashIndex, 1)[0];
        selectedStashIndex = -1;
        fromStash = true;
        document.getElementById('game-status').textContent = "你使用了扣下的牌！";
    } else {
        card = deck.shift();
    }

    dealerHand.push(card);
    if (calculateScore(dealerHand) > 21) {
        dealerStand();
    }
    updateUI();
    animateLastCardFrom('#dealer-cards', fromStash ? '#stash-cards' : '#deck-pile');
}

function dealerStand() {
    phase = 'resolved';
    resolveRound();
}

function resolveRound() {
    const dealerScore = calculateScore(dealerHand);
    let msg = "回合結束。";

    players.forEach(p => {
        if (p.status === 'out') return;
        const pScore = calculateScore(p.hand);
        if (p.status === 'bust') {
            p.result = 'lose';
            msg += ` ${p.name} 爆牌；`;
        } else if (dealerScore > 21 || pScore > dealerScore) {
            p.result = 'win';
            p.chips += p.bet * 2;
            msg += ` ${p.name} 獲勝；`;
        } else if (pScore < dealerScore) {
            p.result = 'lose';
            msg += ` ${p.name} 輸了；`;
        } else {
            p.result = 'draw';
            p.chips += p.bet;
            msg += ` ${p.name} 平手；`;
        }
    });

    isLured = false;
    document.getElementById('game-status').textContent = msg;
    updateUI();
    checkGameOver();
}

function checkGameOver() {
    const winner = players.find(p => p.chips >= 20);
    if (winner) {
        alert(`遊戲結束！${winner.name} 籌碼翻倍（${winner.chips}）走人了！你輸了。`);
        location.reload();
    } else if (players.every(p => p.chips <= 0)) {
        alert("恭喜！你贏光了所有人的籌碼！你是最強的魔術師莊家！");
        location.reload();
    }
}

// --- Event Listeners ---

document.getElementById('next-round-btn').onclick = startRound;
document.getElementById('dealer-hit-btn').onclick = dealerHit;
document.getElementById('dealer-stand-btn').onclick = dealerStand;
document.getElementById('lure-btn').onclick = () => {
    if (isLured) return;
    
    isLured = true;
    if (phase === 'player-turn') {
        players.forEach(p => {
            const currentBet = p.bet;
            const targetBet = 5;
            const increase = Math.min(p.chips, targetBet - currentBet);
            if (increase > 0) {
                p.bet += increase;
                p.chips -= increase;
            }
        });
        document.getElementById('game-status').textContent = "魔術：財迷心竅！閒家經不起你的挑釁，紛紛加注了！";
    } else {
        document.getElementById('game-status').textContent = "魔術：財迷心竅已發動，下一局閒家將會豪賭。";
    }
    updateUI();
};

document.getElementById('global-give-btn').onclick = giveCardToPlayer;
document.getElementById('global-stash-btn').onclick = stashCard;

updateUI();
