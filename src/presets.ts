import type { GamePreset } from './types';

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own parameters',
    startingFood: 0,
    stagProbability: 1.0,
    stagPayoff: 5,
    dailyConsumption: 0,
  },
  {
    id: 'safe-world',
    name: 'Safe World',
    description: 'Stags always appear in the same size - cooperation is clearly optimal',
    startingFood: 10,
    stagProbability: 1.0,
    stagPayoff: 5,
    dailyConsumption: 2.5,
  },
  {
    id: 'harsh-world-high',
    name: 'Harsh World - High Resource',
    description: 'Stags appear seldom but are huge - more risky environment (30 starting food)',
    startingFood: 30,
    stagProbability: 0.35,
    stagPayoff: 15,
    dailyConsumption: 2.5,
  },
  {
    id: 'harsh-world-low',
    name: 'Harsh World - Low Resource',
    description: 'Stags appear seldom but are huge - more risky environment (5 starting food)',
    startingFood: 5,
    stagProbability: 0.35,
    stagPayoff: 15,
    dailyConsumption: 2.5,
  },
  {
    id: 'ea-dilemma',
    name: 'EA Dilemma',
    description: 'Cooperation is optimal long-term but risky short-term',
    startingFood: 5,
    stagProbability: 0.6,
    stagPayoff: 5,
    dailyConsumption: 2.5,
  },
];

export function getPresetById(id: string): GamePreset | undefined {
  return GAME_PRESETS.find((preset) => preset.id === id);
}
