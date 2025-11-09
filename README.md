# Stag Hunt Game Simulation

> **Note**: This was quickly hacked together with Claude in about an hour for my local EA group. There might be bugs.

An interactive web-based simulation of the Stag Hunt game with uncertainty and starvation mechanics, designed for EA (Effective Altruist) group presentations.

## Features

- **Simulation Tool**: Test different strategies with configurable parameters
- **Analysis Tools**: Breakeven finder and heatmap analysis
- **Human vs Human Mode**: Play on one phone with private choices
- **Visualizations**: Food tracking, choice distribution, and statistics

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
pnpm run build
```

The built static site will be in the `dist/` folder, ready for deployment.

### Preview Build

```bash
pnpm run preview
```

## Game Mechanics

- **Payoff Matrix**: Stag (5/5 if appears), Hare (2/2 safe), or Mixed (0/4)
- **Uncertainty**: Stag only appears with configurable probability
- **Starvation**: Players consume food daily; game ends if anyone reaches 0 food
- **Strategy vs Survival**: Classic cooperation dilemma with added risk

## Project Structure

- `src/types.ts` - TypeScript type definitions
- `src/game-logic.ts` - Core game rules
- `src/simulation.ts` - Strategy simulation engine
- `src/analysis.ts` - Breakeven and heatmap tools
- `src/visualization.ts` - Chart.js visualizations
- `src/human-game.ts` - Human vs human game logic
- `src/main.ts` - Simulation page controller
- `src/play.ts` - Play page controller

## Deployment

This is a static site with no backend requirements. Deploy to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Requirements

See `docs/requirement.md` for full specification.
