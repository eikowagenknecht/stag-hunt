# Modified Stag Hunt Game - Requirements Specification

## Overview
An interactive web-based simulation of the Stag Hunt game with uncertainty and starvation mechanics, designed for Effective Altruist (EA) group presentations. The application consists of two pages: a simulation/analysis tool and a human vs human game mode.

## Purpose
To showcase how uncertainty and survival pressure affect cooperation in game theory scenarios, making the traditionally "obvious" cooperative strategy more interesting and risky.

---

## Game Mechanics

### Payoff Matrix
| Player 1 / Player 2 | Stag | Hare |
|---------------------|------|------|
| **Stag** | 5/5 (if stag appears) or 0/0 (if not) | 0/4 |
| **Hare** | 4/0 | 2/2 |

### Core Rules
1. **Daily Cycle**: Each round = 1 day
2. **Food Tracking**: Players track CURRENT food level (not cumulative)
   - Start with X food (configurable)
   - Hunt outcome determines food gained
   - At end of each day: consume Y food (configurable daily consumption rate)
3. **Uncertainty**: When both players hunt Stag, it only appears with probability P (configurable)
4. **Game End Conditions**:
   - Any player reaches ≤0 food (starvation)
   - Maximum rounds reached
5. **Food Calculation per Round**:
   ```
   new_food = current_food + hunt_payoff - daily_consumption
   ```

---

## Page 1: Simulation & Analysis Tool

### File: `index.html`

### Game Presets
Predefined scenario configurations for quick setup and interesting comparisons:

1. **Custom**: User-defined parameters
2. **Safe World**: High stag probability (90%), low consumption (0.5) - cooperation clearly optimal
3. **Harsh World**: Low stag probability (30%), high consumption (2) - survival difficult
4. **EA Dilemma**: Moderate stag probability (60%), medium-high consumption (1.5) - cooperation optimal long-term but risky short-term
5. **High Stakes**: Very limited food (3 starting), standard parameters - every decision matters
6. **Abundance**: Plenty of starting food (20), low pressure - explore strategies without survival stress
7. **Unreliable Stag**: Low stag probability (40%) - is cooperation worth the risk?
8. **Reliable Stag**: Very high stag probability (95%) - cooperation rewarded
9. **Tight Margins**: Moderate probability (70%) but high consumption (2) - no room for error

When a preset is selected, the sliders automatically update. Manual slider adjustment switches back to "Custom" preset.

### Configurable Parameters (Sliders)
1. **Starting Food**: 0-20 (default: 5)
2. **Stag Appearance Probability**: 0%-100% (default: 70%)
3. **Number of Rounds**: 1-50 (default: 20)
4. **Daily Food Consumption**: 0-5 (default: 1)

### Strategy Options
Players can choose from the following strategies:
- **Always Stag**: Always hunt stag (full cooperation)
- **Always Hare**: Always hunt hare (defection)
- **Tit-for-Tat**: Start with stag, then copy other player's last move
- **Random**: 50/50 random choice each round
- **Cautious**: Hunt hare if food < threshold, otherwise stag

### Features

#### 1. Basic Simulation
- Select strategy for Player 1 and Player 2
- Click "Run Simulation" to see outcome
- Display results with visualizations

#### 2. Breakeven Finder
- "Find Breakeven Probability" button
- Automatically calculates the stag appearance probability where:
  - Always Stag and Always Hare strategies have equal expected survival
- Shows the breakeven point percentage

#### 3. Heatmap Analysis
- 2D heatmap showing survival rates across parameter combinations
- X-axis: Stag appearance probability (0%-100%)
- Y-axis: Daily food consumption (0-5)
- Color intensity: Average rounds survived
- Helps identify "safe" vs "risky" parameter spaces

### Visualizations

#### 1. Food Over Time (Line Graph)
- X-axis: Round number (days)
- Y-axis: Current food level
- Two lines: Player 1 (blue), Player 2 (red)
- Mark starvation point if applicable
- Annotate rounds where stag failed to appear

#### 2. Choice Distribution (Bar Chart or Pie Chart)
- Show percentage of Stag choices vs Hare choices
- Separate stats for Player 1 and Player 2

#### 3. Statistics Table
Display:
- Final food levels
- Rounds survived
- Cooperation rate (% of stag choices)
- Number of times stag appeared vs failed
- Starvation events (who starved first, if applicable)

---

## Page 2: Human vs Human Game

### File: `play.html`

### Purpose
Interactive game for two humans to play against each other on a single device (mobile-friendly), with private choice-making to simulate simultaneous decisions.

### Gameplay Flow

#### 1. Setup Screen
- Input player names (Player 1, Player 2)
- Configure game parameters (same 4 sliders as simulation page)
- "Start Game" button

#### 2. Game Loop

**Metrics Dashboard** (Always visible between turns):
- Current food: Player 1 and Player 2
- Current round number
- History of last 3 rounds (choices and outcomes)

**Turn Sequence**:
1. **Player 1's Private Choice**
   - Screen shows: "Player 1 ([name]), make your choice"
   - Temporary fullscreen overlay (hides metrics)
   - Two large buttons: "Hunt Stag 🦌" / "Hunt Hare 🐇"
   - Choice is recorded but hidden

2. **Transition Screen**
   - "Pass phone to Player 2"
   - "Ready" button to continue
   - Prevents accidental reveal of Player 1's choice

3. **Player 2's Private Choice**
   - Same private choice interface as Player 1

4. **Outcome Reveal**
   - Show both players' choices simultaneously
   - If both chose Stag: show stag appearance result (appeared/failed with animation)
   - Display food changes for both players
   - Updated metrics dashboard
   - "Continue to Next Round" button

5. **Repeat** until game end condition

#### 3. Game Over Screen
- Winner announcement (who survived longer or had more food)
- Final statistics (same as simulation page)
- "Play Again" button (returns to setup)
- "Change Parameters" button

### Mobile-Friendly Design
- Large touch targets (buttons)
- Readable fonts (minimum 16px)
- Fullscreen choice screens for privacy
- Portrait orientation optimized
- Works on phones 320px+ width

---

## Technical Implementation

### Stack
- **TypeScript**: All application logic
- **Chart.js**: Data visualizations
- **Vite**: Build tool and bundler
- **No backend**: Pure static site (client-side only)

### Project Structure
```
stag-hunt/
├── docs/
│   └── requirement.md          # This file
├── src/
│   ├── types.ts                # TypeScript interfaces and types
│   ├── game-logic.ts           # Core game rules, payoff calculation
│   ├── simulation.ts           # Automated strategy simulation
│   ├── analysis.ts             # Breakeven finder, heatmap generation
│   ├── visualization.ts        # Chart.js wrapper functions
│   ├── human-game.ts           # Human vs human game controller
│   ├── main.ts                 # Simulation page (index.html) controller
│   └── play.ts                 # Play page (play.html) controller
├── public/
│   ├── index.html              # Simulation page
│   ├── play.html               # Human game page
│   └── style.css               # Shared styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Key TypeScript Types

```typescript
interface Player {
  id: 1 | 2;
  name: string;
  currentFood: number;
  strategy: Strategy;
}

type Choice = 'stag' | 'hare';

type Strategy =
  | 'always-stag'
  | 'always-hare'
  | 'tit-for-tat'
  | 'random'
  | 'cautious';

interface GameConfig {
  startingFood: number;
  stagProbability: number;  // 0-1
  maxRounds: number;
  dailyConsumption: number;
}

interface RoundResult {
  round: number;
  player1Choice: Choice;
  player2Choice: Choice;
  stagAppeared: boolean;
  player1FoodChange: number;
  player2FoodChange: number;
  player1CurrentFood: number;
  player2CurrentFood: number;
}

interface GameState {
  config: GameConfig;
  players: [Player, Player];
  currentRound: number;
  history: RoundResult[];
  gameOver: boolean;
  winner?: 1 | 2 | 'tie';
}
```

### Deployment
- **Target**: Static hosting (GitHub Pages, Netlify, Vercel)
- **Build output**: `dist/` folder with bundled HTML, CSS, JS
- **No server required**: All computation happens client-side
- **Build command**: `pnpm run build`
- **Dev server**: `pnpm run dev`

---

## UI/UX Requirements

### Visual Design
- Clean, professional appearance (suitable for EA group presentation)
- Clear visual hierarchy
- Consistent color scheme:
  - Player 1: Blue
  - Player 2: Red
  - Stag: Green
  - Hare: Orange
  - Starvation/danger: Red highlight

### Responsiveness
- Desktop: Side-by-side layouts for comparison
- Mobile (play.html): Vertical stack, large touch targets
- Simulation page: Usable but optimized for desktop/tablet
- Play page: Optimized for mobile (one phone, passed between players)

### Accessibility
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support (simulation page)
- High contrast for readability

---

## Success Criteria

### Functional Requirements
- [ ] All sliders work and update simulations in real-time
- [ ] Strategies execute correctly according to rules
- [ ] Starvation detection works properly
- [ ] Charts update correctly with simulation data
- [ ] Breakeven finder produces accurate results
- [ ] Heatmap shows meaningful parameter exploration
- [ ] Human game enforces private choices
- [ ] Game state persists correctly across rounds

### Non-Functional Requirements
- [ ] Site loads in <2 seconds
- [ ] No runtime errors in console
- [ ] Works in modern browsers (Chrome, Firefox, Safari)
- [ ] Mobile-friendly (play.html tested on actual phones)
- [ ] Code is typed with TypeScript (no `any` types)
- [ ] Deployable as static site without configuration

---

## Future Enhancements (Out of Scope for V1)
- Multi-agent simulation (population dynamics)
- Additional strategies (Pavlov, Win-Stay-Lose-Shift)
- Save/export simulation results
- Scenario presets ("Safe World", "Harsh World")
- Monte Carlo simulation (run 100+ trials)
- Expected value calculator overlay
- Network effects (players can switch strategies based on neighbors)

---

## Questions for EA Group Discussion
The simulation should help explore:
1. **Risk vs Reward**: When does uncertainty make cooperation too risky?
2. **Safety Margins**: How much "buffer" food is needed to safely cooperate?
3. **Breakeven Points**: What probability makes stag hunting rational?
4. **Real-World Parallels**: Climate action, pandemic preparation, AI safety
5. **Time Horizons**: Does cooperation work better in shorter vs longer games?
