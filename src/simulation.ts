import type { GameConfig, SimulationResult, Strategy } from './types';
import { playFullGame } from './game-logic';

export function runSimulation(
  config: GameConfig,
  player1Strategy: Strategy,
  player2Strategy: Strategy
): SimulationResult {
  const finalState = playFullGame(config, player1Strategy, player2Strategy);

  const player1Survived = finalState.players[0].currentFood > 0;
  const player2Survived = finalState.players[1].currentFood > 0;
  const roundsPlayed = finalState.currentRound;

  // Calculate cooperation rates (% of stag choices)
  const player1StagChoices = finalState.history.filter((r) => r.player1Choice === 'stag').length;
  const player2StagChoices = finalState.history.filter((r) => r.player2Choice === 'stag').length;

  const player1CooperationRate = roundsPlayed > 0 ? player1StagChoices / roundsPlayed : 0;
  const player2CooperationRate = roundsPlayed > 0 ? player2StagChoices / roundsPlayed : 0;

  // Count stag appearance/failure
  const stagAttempts = finalState.history.filter(
    (r) => r.player1Choice === 'stag' && r.player2Choice === 'stag'
  );
  const stagAppearanceCount = stagAttempts.filter((r) => r.stagAppeared).length;
  const stagFailureCount = stagAttempts.filter((r) => !r.stagAppeared).length;

  return {
    finalState,
    player1Survived,
    player2Survived,
    roundsPlayed,
    player1CooperationRate,
    player2CooperationRate,
    stagAppearanceCount,
    stagFailureCount,
  };
}

export function calculateStatistics(result: SimulationResult) {
  const { finalState, player1CooperationRate, player2CooperationRate } = result;

  return {
    player1FinalFood: finalState.players[0].currentFood,
    player2FinalFood: finalState.players[1].currentFood,
    player1CooperationRate: (player1CooperationRate * 100).toFixed(1) + '%',
    player2CooperationRate: (player2CooperationRate * 100).toFixed(1) + '%',
    totalRounds: finalState.currentRound,
    winner: finalState.winner,
    stagAttempts: result.stagAppearanceCount + result.stagFailureCount,
    stagSuccesses: result.stagAppearanceCount,
    stagFailures: result.stagFailureCount,
    stagSuccessRate:
      result.stagAppearanceCount + result.stagFailureCount > 0
        ? (
            (result.stagAppearanceCount / (result.stagAppearanceCount + result.stagFailureCount)) *
            100
          ).toFixed(1) + '%'
        : 'N/A',
  };
}
