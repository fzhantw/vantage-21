let deck = [];
let futureCards = [];
let dealerHand = [];
let players = [
    { id: 0, name: '閒家 A', chips: 10, hand: [], bet: 0, status: 'playing' },
    { id: 1, name: '閒家 B', chips: 10, hand: [], bet: 0, status: 'playing' },
    { id: 2, name: '閒家 C', chips: 10, hand: [], bet: 0, status: 'playing' }
];
let isLured = false;
let skipUsed = false;
let gameActive = false;

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Initialize Game
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
    for (let card of hand) {
        score += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function updateUI() {
    // Future Cards
    const futureDiv = document.getElementById('future-cards');
    futureDiv.innerHTML = '';
    futureCards = deck.slice(0, 3);
    futureCards.forEach(card => {
        const cardEl = createCardElement(card);
        futureDiv.appendChild(cardEl);
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
        pBox.querySelector('.bet').textContent = `本局注好: ${p.bet}`;
        const pCards = pBox.querySelector('.cards');
        pCards.innerHTML = '';
        p.hand.forEach(card => pCards.appendChild(createCardElement(card)));
        pBox.querySelector('.score').textContent = `分數: ${calculateScore(p.hand)}`;
        
        if (calculateScore(p.hand) > 21) pBox.classList.add('bust');
        else pBox.classList.remove('bust');
    });

    document.getElementById('skip-card-btn').disabled = skipUsed || !gameActive;
    document.getElementById('lure-btn').disabled = gameActive;
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.className = 'card' + (['♥', '♦'].includes(card.suit) ? ' red' : '');
    el.textContent = `${card.suit}${card.value}`;
    return el;
}

async function startRound() {
    if (checkGameOver()) return;
    
    initDeck();
    gameActive = true;
    skipUsed = false;
    dealerHand = [];
    players.forEach(p => {
        p.hand = [];
        p.bet = isLured ? Math.min(p.chips, Math.floor(Math.random() * 3) + 3) : Math.min(p.chips, Math.floor(Math.random() * 2) + 1);
        p.chips -= p.bet;
    });

    // Initial Deal
    dealerHand.push(deck.shift());
    players.forEach(p => p.hand.push(deck.shift()));
    dealerHand.push(deck.shift());
    players.forEach(p => p.hand.push(deck.shift()));

    updateUI();
    document.getElementById('next-round-btn').disabled = true;
    
    // AI Players turn
    for (let p of players) {
        while (calculateScore(p.hand) < 17) {
            p.hand.push(deck.shift());
            updateUI();
            await new Promise(r => setTimeout(r, 500));
        }
    }

    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('game-status').textContent = "輪到你了，莊家。";
    isLured = false; 
}

function dealerHit() {
    dealerHand.push(deck.shift());
    updateUI();
    if (calculateScore(dealerHand) > 21) {
        dealerStand();
    }
}

function dealerStand() {
    gameActive = false;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
    document.getElementById('next-round-btn').disabled = false;
    resolveRound();
}

function resolveRound() {
    const dealerScore = calculateScore(dealerHand);
    let status = "";

    players.forEach(p => {
        const pScore = calculateScore(p.hand);
        if (pScore > 21) {
            // Player bust, Dealer wins bet
            status += `${p.name} 爆牌，你贏了注好。`;
        } else if (dealerScore > 21 || pScore > dealerScore) {
            // Dealer bust or Player higher, Player wins
            p.chips += p.bet * 2;
            status += `${p.name} 贏了。`;
        } else if (pScore < dealerScore) {
            // Dealer higher, Dealer wins
            status += `${p.name} 輸了。`;
        } else {
            // Push
            p.chips += p.bet;
            status += `${p.name} 平手。`;
        }
    });

    document.getElementById('game-status').textContent = status || "回合結束。";
    updateUI();
    checkGameOver();
}

function checkGameOver() {
    const doubleUp = players.find(p => p.chips >= 20);
    const allBroke = players.every(p => p.chips <= 0);

    if (doubleUp) {
        alert(`遊戲結束！${doubleUp.name} 籌碼翻倍走人了，你輸了！`);
        location.reload();
        return true;
    }
    if (allBroke) {
        alert("恭喜！你贏光了所有閒家的籌碼，大獲全勝！");
        location.reload();
        return true;
    }
    return false;
}

document.getElementById('next-round-btn').addEventListener('click', startRound);
document.getElementById('hit-btn').addEventListener('click', dealerHit);
document.getElementById('stand-btn').addEventListener('click', dealerStand);

document.getElementById('skip-card-btn').addEventListener('click', () => {
    if (!skipUsed && gameActive) {
        deck.shift();
        skipUsed = true;
        updateUI();
        document.getElementById('game-status').textContent = "你使用了扣牌能力！下一張牌已被移除。";
    }
});

document.getElementById('lure-btn').addEventListener('click', () => {
    isLured = true;
    document.getElementById('game-status').textContent = "你正在引誘閒家下大注...（下一局生效）";
});

initDeck();
updateUI();
