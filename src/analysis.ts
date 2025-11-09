import type { GameConfig, HeatmapPoint } from './types';
import { runSimulation } from './simulation';

export function findBreakevenProbability(
  baseConfig: GameConfig,
  precision: number = 0.01
): number {
  let low = 0;
  let high = 1;
  let bestProbability = 0.5;

  // Binary search for the probability where Always Stag ≈ Always Hare
  while (high - low > precision) {
    const mid = (low + high) / 2;
    const testConfig = { ...baseConfig, stagProbability: mid };

    // Run simulations
    const stagResult = runSimulation(testConfig, 'always-stag', 'always-stag');
    const hareResult = runSimulation(testConfig, 'always-hare', 'always-hare');

    const stagRounds = stagResult.roundsPlayed;
    const hareRounds = hareResult.roundsPlayed;

    if (Math.abs(stagRounds - hareRounds) <= 1) {
      // Close enough
      bestProbability = mid;
      break;
    }

    if (stagRounds < hareRounds) {
      // Stag is worse, need higher probability
      low = mid;
    } else {
      // Stag is better, can lower probability
      high = mid;
    }

    bestProbability = mid;
  }

  return bestProbability;
}

export function generateHeatmap(
  baseConfig: GameConfig,
  probabilities: number[] = [0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  consumptions: number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]
): HeatmapPoint[] {
  const heatmapData: HeatmapPoint[] = [];

  for (const prob of probabilities) {
    for (const consumption of consumptions) {
      const testConfig: GameConfig = {
        ...baseConfig,
        stagProbability: prob,
        dailyConsumption: consumption,
      };

      // Run simulation with both players using always-stag strategy
      const result = runSimulation(testConfig, 'always-stag', 'always-stag');

      heatmapData.push({
        stagProbability: prob,
        dailyConsumption: consumption,
        avgRoundsSurvived: result.roundsPlayed,
      });
    }
  }

  return heatmapData;
}

export function findOptimalStrategy(
  config: GameConfig,
  trials: number = 10
): { strategy: string; avgRounds: number }[] {
  const strategies = ['always-stag', 'always-hare', 'tit-for-tat', 'random', 'cautious'] as const;
  const results: { strategy: string; avgRounds: number }[] = [];

  for (const strategy of strategies) {
    let totalRounds = 0;

    for (let i = 0; i < trials; i++) {
      const result = runSimulation(config, strategy, strategy);
      totalRounds += result.roundsPlayed;
    }

    results.push({
      strategy,
      avgRounds: totalRounds / trials,
    });
  }

  return results.sort((a, b) => b.avgRounds - a.avgRounds);
}
