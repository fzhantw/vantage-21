let deck = [];
let dealerHand = [];
let dealerStash = [];
let players = [
    { id: 0, name: '閒家 A', chips: 10, hand: [], bet: 0, status: 'waiting' },
    { id: 1, name: '閒家 B', chips: 10, hand: [], bet: 0, status: 'waiting' },
    { id: 2, name: '閒家 C', chips: 10, hand: [], bet: 0, status: 'waiting' }
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
    // Deck Preview
    const futureDiv = document.getElementById('future-cards');
    futureDiv.innerHTML = '';
    deck.slice(0, 3).forEach(card => futureDiv.appendChild(createCardElement(card)));

    // Stash
    const stashDiv = document.getElementById('stash-cards');
    stashDiv.innerHTML = '';
    dealerStash.forEach((card, idx) => {
        const el = createCardElement(card);
        el.style.cursor = 'pointer';
        el.title = '點擊使用此牌';
        el.onclick = () => useStashedCard(idx);
        stashDiv.appendChild(el);
    });

    // Dealer
    const dealerDiv = document.getElementById('dealer-cards');
    dealerDiv.innerHTML = '';
    dealerHand.forEach(card => dealerDiv.appendChild(createCardElement(card)));
    document.getElementById('dealer-score').textContent = `分數: ${calculateScore(dealerHand)}`;

    // Players
    players.forEach(p => {
        const pBox = document.getElementById(`player-${p.id}`);
        pBox.querySelector('.chips').textContent = `籌碼: ${p.chips}`;
        pBox.querySelector('.bet').textContent = `注好: ${p.bet}`;
        
        const pCards = pBox.querySelector('.cards');
        pCards.innerHTML = '';
        p.hand.forEach((card, idx) => {
            // First card is hidden for players (Hole Card)
            const isHidden = (idx === 0 && phase !== 'resolved');
            pCards.appendChild(createCardElement(card, isHidden));
        });

        const statusHint = document.getElementById(`player-${p.id}-status`);
        const controls = pBox.querySelector('.player-controls');
        
        pBox.classList.remove('active', 'stand', 'bust');
        if (p.status === 'bust') pBox.classList.add('bust');
        if (p.status === 'stand') pBox.classList.add('stand');

        if (currentPlayerTurn === p.id && phase === 'player-turn') {
            pBox.classList.add('active');
            const wantsHit = shouldPlayerHit(p);
            statusHint.textContent = wantsHit ? "我想要牌！" : "我停牌。";
            controls.style.display = wantsHit ? "flex" : "none";
            if (!wantsHit) {
                p.status = 'stand';
                setTimeout(nextTurn, 1000);
            }
        } else {
            statusHint.textContent = p.status === 'stand' ? "已停牌" : (p.status === 'bust' ? "爆牌了！" : "等待中...");
            controls.style.display = "none";
        }
    });

    document.getElementById('dealer-hit-btn').disabled = (phase !== 'dealer-turn');
    document.getElementById('dealer-stand-btn').disabled = (phase !== 'dealer-turn');
    document.getElementById('next-round-btn').disabled = (phase !== 'idle' && phase !== 'resolved');
    document.getElementById('lure-btn').disabled = (phase !== 'idle' && phase !== 'resolved');
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
        p.status = 'playing';
        p.bet = isLured ? Math.min(p.chips, 5) : Math.min(p.chips, 1 + Math.floor(Math.random() * 2));
        p.chips -= p.bet;
    });
    isLured = false;
    
    document.getElementById('game-status').textContent = "正在發送起始牌...";
    updateUI();

    // Initial Deal (2 cards each)
    for (let i = 0; i < 2; i++) {
        for (let p of players) {
            p.hand.push(deck.shift());
            updateUI();
            await new Promise(r => setTimeout(r, 300));
        }
        dealerHand.push(deck.shift());
        updateUI();
        await new Promise(r => setTimeout(r, 300));
    }

    phase = 'player-turn';
    currentPlayerTurn = 0;
    document.getElementById('game-status').textContent = "現在是閒家回合，你可以決定是否發牌或扣牌。";
    updateUI();
}

function giveCardToPlayer() {
    const p = players[currentPlayerTurn];
    p.hand.push(deck.shift());
    if (calculateScore(p.hand) > 21) {
        p.status = 'bust';
        nextTurn();
    }
    updateUI();
}

function stashCard() {
    dealerStash.push(deck.shift());
    // After stashing, the player still evaluates if they want another card (the new next one)
    document.getElementById('game-status').textContent = "你扣下了一張牌！這張牌現在在你的倉庫中。";
    updateUI();
}

function useStashedCard(index) {
    if (phase !== 'dealer-turn' && phase !== 'player-turn') return;
    
    const card = dealerStash.splice(index, 1)[0];
    dealerHand.push(card);
    updateUI();
}

function nextTurn() {
    currentPlayerTurn++;
    if (currentPlayerTurn >= players.length) {
        phase = 'dealer-turn';
        document.getElementById('game-status').textContent = "輪到莊家（你）的回合了。";
    }
    updateUI();
}

function dealerHit() {
    dealerHand.push(deck.shift());
    if (calculateScore(dealerHand) > 21) {
        dealerStand();
    }
    updateUI();
}

function dealerStand() {
    phase = 'resolved';
    resolveRound();
}

function resolveRound() {
    const dealerScore = calculateScore(dealerHand);
    let msg = "回合結束。";

    players.forEach(p => {
        const pScore = calculateScore(p.hand);
        if (p.status === 'bust') {
            msg += ` ${p.name} 爆牌；`;
        } else if (dealerScore > 21 || pScore > dealerScore) {
            p.chips += p.bet * 2;
            msg += ` ${p.name} 獲勝；`;
        } else if (pScore < dealerScore) {
            msg += ` ${p.name} 輸了；`;
        } else {
            p.chips += p.bet;
            msg += ` ${p.name} 平手；`;
        }
    });

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
    isLured = true;
    document.getElementById('game-status').textContent = "魔術：財迷心竅已發動，下一局閒家將會豪賭。";
};

// Bind Player Controls (Dynamic delegation or direct bind)
document.querySelectorAll('.player-box').forEach(box => {
    box.querySelector('.give-btn').onclick = giveCardToPlayer;
    box.querySelector('.stash-btn').onclick = stashCard;
});

updateUI();
