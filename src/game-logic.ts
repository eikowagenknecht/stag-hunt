import type { Choice, GameConfig, GameState, Player, RoundResult, Strategy } from './types';

export function createGameState(
  config: GameConfig,
  player1Strategy: Strategy,
  player2Strategy: Strategy,
  player1Name: string = 'Player 1',
  player2Name: string = 'Player 2'
): GameState {
  return {
    config,
    players: [
      {
        id: 1,
        name: player1Name,
        currentFood: config.startingFood,
        strategy: player1Strategy,
      },
      {
        id: 2,
        name: player2Name,
        currentFood: config.startingFood,
        strategy: player2Strategy,
      },
    ],
    currentRound: 0,
    history: [],
    gameOver: false,
  };
}

export function determineChoice(
  player: Player,
  opponentLastChoice: Choice | null,
  currentFood: number,
  dailyConsumption: number
): Choice {
  switch (player.strategy) {
    case 'always-stag':
      return 'stag';

    case 'always-hare':
      return 'hare';

    case 'tit-for-tat':
      // Start with stag, then copy opponent's last move
      return opponentLastChoice ?? 'stag';

    case 'random':
      return Math.random() < 0.5 ? 'stag' : 'hare';

    case 'cautious':
      // Hunt hare if food is below daily consumption threshold, otherwise stag
      return currentFood <= dailyConsumption ? 'hare' : 'stag';

    default:
      return 'hare';
  }
}

export function calculatePayoff(
  player1Choice: Choice,
  player2Choice: Choice,
  stagAppeared: boolean,
  stagPayoff: number
): { player1Payoff: number; player2Payoff: number } {
  // Both hunt stag
  if (player1Choice === 'stag' && player2Choice === 'stag') {
    if (stagAppeared) {
      return { player1Payoff: stagPayoff, player2Payoff: stagPayoff };
    } else {
      return { player1Payoff: 0, player2Payoff: 0 };
    }
  }

  // Both hunt hare
  if (player1Choice === 'hare' && player2Choice === 'hare') {
    return { player1Payoff: 2, player2Payoff: 2 };
  }

  // Mixed: one stag, one hare
  if (player1Choice === 'stag' && player2Choice === 'hare') {
    return { player1Payoff: 0, player2Payoff: 4 };
  }

  // player1Choice === 'hare' && player2Choice === 'stag'
  return { player1Payoff: 4, player2Payoff: 0 };
}

export function doesStagAppear(probability: number): boolean {
  return Math.random() < probability;
}

export function playRound(state: GameState): GameState {
  if (state.gameOver) {
    return state;
  }

  const round = state.currentRound + 1;
  const [player1, player2] = state.players;

  // Get last choices for tit-for-tat strategy
  const lastRound = state.history[state.history.length - 1];
  const player1LastOpponentChoice = lastRound?.player2Choice ?? null;
  const player2LastOpponentChoice = lastRound?.player1Choice ?? null;

  // Determine choices
  const player1Choice = determineChoice(player1, player2LastOpponentChoice, player1.currentFood, state.config.dailyConsumption);
  const player2Choice = determineChoice(player2, player1LastOpponentChoice, player2.currentFood, state.config.dailyConsumption);

  // Determine if stag appears (only relevant if both hunt stag)
  const stagAppeared =
    player1Choice === 'stag' && player2Choice === 'stag'
      ? doesStagAppear(state.config.stagProbability)
      : false;

  // Calculate payoffs
  const { player1Payoff, player2Payoff } = calculatePayoff(
    player1Choice,
    player2Choice,
    stagAppeared,
    state.config.stagPayoff
  );

  // Update food: add payoff, subtract daily consumption
  const player1NewFood = player1.currentFood + player1Payoff - state.config.dailyConsumption;
  const player2NewFood = player2.currentFood + player2Payoff - state.config.dailyConsumption;

  // Create round result
  const roundResult: RoundResult = {
    round,
    player1Choice,
    player2Choice,
    stagAppeared,
    player1FoodChange: player1Payoff - state.config.dailyConsumption,
    player2FoodChange: player2Payoff - state.config.dailyConsumption,
    player1CurrentFood: player1NewFood,
    player2CurrentFood: player2NewFood,
  };

  // Update players
  const updatedPlayers: [Player, Player] = [
    { ...player1, currentFood: player1NewFood },
    { ...player2, currentFood: player2NewFood },
  ];

  // Check for game over conditions
  const player1Starved = player1NewFood <= 0;
  const player2Starved = player2NewFood <= 0;
  const maxRoundsReached = round >= state.config.maxRounds;

  let gameOver = player1Starved || player2Starved || maxRoundsReached;
  let winner: 1 | 2 | 'tie' | undefined;

  if (gameOver) {
    if (player1Starved && player2Starved) {
      winner = 'tie';
    } else if (player1Starved) {
      winner = 2;
    } else if (player2Starved) {
      winner = 1;
    } else if (maxRoundsReached) {
      // Both survived to the end
      if (player1NewFood > player2NewFood) {
        winner = 1;
      } else if (player2NewFood > player1NewFood) {
        winner = 2;
      } else {
        winner = 'tie';
      }
    }
  }

  return {
    ...state,
    players: updatedPlayers,
    currentRound: round,
    history: [...state.history, roundResult],
    gameOver,
    winner,
  };
}

export function playFullGame(
  config: GameConfig,
  player1Strategy: Strategy,
  player2Strategy: Strategy
): GameState {
  let state = createGameState(config, player1Strategy, player2Strategy);

  while (!state.gameOver) {
    state = playRound(state);
  }

  return state;
}
