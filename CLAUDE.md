# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

No build step or server is required. Open `index.html` directly in a browser:

```
open index.html
```

Or serve locally with any static file server (e.g. `python3 -m http.server`).

## Project Overview

**Magician Blackjack** (魔術師 21 點：掌控者) — a single-page browser game where the player acts as the dealer/magician against three AI-controlled players. The UI is in Traditional Chinese.

The entire game logic lives in three files:

- `script.js` — all game state and logic
- `index.html` — static layout; player boxes are hardcoded for exactly 3 players
- `style.css` — dark-themed styling, card visuals

## Architecture

### State Model (`script.js`)

Global mutable state at the top of the file drives everything:

- `deck` — shuffled array of card objects `{ suit, value }`
- `dealerHand` / `dealerStash` — dealer's cards and stash pile
- `players[]` — 3 player objects: `{ id, name, chips, hand, bet, status }`
- `phase` — game FSM: `'idle' | 'initial-deal' | 'player-turn' | 'dealer-turn' | 'resolved'`
- `currentPlayerTurn` — index into `players[]`, or -1 when no player is active
- `selectedStashIndex` — which stash card is selected (-1 = none)

`updateUI()` is the single re-render function — it reads all global state and rewrites the DOM wholesale. Call it after any state mutation.

### Game Flow

`startRound()` → animated initial deal (async with `setTimeout` delays) → `phase = 'player-turn'` → `updateUI()` drives each player's AI turn, auto-advancing via `setTimeout(nextTurn, 1000)` when a player stands → after all players, `phase = 'dealer-turn'` → human dealer acts → `dealerStand()` → `resolveRound()` → `checkGameOver()`.

### Magician Mechanics

The player-as-dealer has two special powers:
1. **Stash** (`stashCard`): draws the next deck card into `dealerStash` instead of giving it to a player, deferring it for later use.
2. **Give from stash** (`giveCardToPlayer` / `dealerHit`): if `selectedStashIndex !== -1`, the selected stash card is used instead of drawing from the deck.

### AI Logic

`shouldPlayerHit(player)` in `script.js:57` is the sole AI decision function. It uses real-time bust probability against the remaining deck, adjusted by the dealer's visible score as a risk threshold.

### Hole Card

Each player's first card is hidden (`isHidden = idx === 0 && phase !== 'resolved'`) and revealed at resolution.

### Win Condition

`checkGameOver()`: game ends when any player reaches ≥ 20 chips (player loses) or all players reach 0 chips (player wins).
