import type { Choice, GameConfig, GameState, RoundResult } from './types';
import { calculatePayoff, doesStagAppear } from './game-logic';

export class HumanGame {
  private state: GameState;
  private pendingChoice: Choice | null = null;
  private currentPlayerTurn: 1 | 2 = 1;

  constructor(
    config: GameConfig,
    player1Name: string = 'Player 1',
    player2Name: string = 'Player 2'
  ) {
    this.state = {
      config,
      players: [
        {
          id: 1,
          name: player1Name,
          currentFood: config.startingFood,
          strategy: 'always-stag', // Not used in human mode
        },
        {
          id: 2,
          name: player2Name,
          currentFood: config.startingFood,
          strategy: 'always-stag', // Not used in human mode
        },
      ],
      currentRound: 0,
      history: [],
      gameOver: false,
    };
  }

  getState(): GameState {
    return this.state;
  }

  getCurrentPlayerTurn(): 1 | 2 {
    return this.currentPlayerTurn;
  }

  recordChoice(playerId: 1 | 2, choice: Choice): void {
    if (this.state.gameOver) {
      throw new Error('Game is already over');
    }

    if (playerId !== this.currentPlayerTurn) {
      throw new Error(`It's not player ${playerId}'s turn`);
    }

    if (this.currentPlayerTurn === 1) {
      // Player 1 just made their choice, now it's Player 2's turn
      this.pendingChoice = choice;
      this.currentPlayerTurn = 2;
    } else {
      // Player 2 just made their choice, execute the round
      const player1Choice = this.pendingChoice!;
      const player2Choice = choice;
      this.executeRound(player1Choice, player2Choice);

      // Reset for next round
      this.pendingChoice = null;
      this.currentPlayerTurn = 1;
    }
  }

  private executeRound(player1Choice: Choice, player2Choice: Choice): void {
    const round = this.state.currentRound + 1;
    const [player1, player2] = this.state.players;

    // Determine if stag appears
    const stagAppeared =
      player1Choice === 'stag' && player2Choice === 'stag'
        ? doesStagAppear(this.state.config.stagProbability)
        : false;

    // Calculate payoffs
    const { player1Payoff, player2Payoff } = calculatePayoff(
      player1Choice,
      player2Choice,
      stagAppeared,
      this.state.config.stagPayoff
    );

    // Update food
    const player1NewFood =
      player1.currentFood + player1Payoff - this.state.config.dailyConsumption;
    const player2NewFood =
      player2.currentFood + player2Payoff - this.state.config.dailyConsumption;

    // Create round result
    const roundResult: RoundResult = {
      round,
      player1Choice,
      player2Choice,
      stagAppeared,
      player1FoodChange: player1Payoff - this.state.config.dailyConsumption,
      player2FoodChange: player2Payoff - this.state.config.dailyConsumption,
      player1CurrentFood: player1NewFood,
      player2CurrentFood: player2NewFood,
    };

    // Update players
    const updatedPlayers: [typeof player1, typeof player2] = [
      { ...player1, currentFood: player1NewFood },
      { ...player2, currentFood: player2NewFood },
    ];

    // Check for game over
    const player1Starved = player1NewFood <= 0;
    const player2Starved = player2NewFood <= 0;
    const maxRoundsReached = round >= this.state.config.maxRounds;

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
        if (player1NewFood > player2NewFood) {
          winner = 1;
        } else if (player2NewFood > player1NewFood) {
          winner = 2;
        } else {
          winner = 'tie';
        }
      }
    }

    // Update state
    this.state = {
      ...this.state,
      players: updatedPlayers,
      currentRound: round,
      history: [...this.state.history, roundResult],
      gameOver,
      winner,
    };
  }

  isGameOver(): boolean {
    return this.state.gameOver;
  }

  getWinner(): 1 | 2 | 'tie' | undefined {
    return this.state.winner;
  }

  getLastRound(): RoundResult | undefined {
    return this.state.history[this.state.history.length - 1];
  }
}
