import type { GamePreset } from './types';

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own parameters',
    startingFood: 5,
    stagProbability: 0.7,
    dailyConsumption: 1,
  },
  {
    id: 'safe-world',
    name: 'Safe World',
    description: 'High stag probability, low consumption - cooperation is clearly optimal',
    startingFood: 10,
    stagProbability: 0.9,
    dailyConsumption: 0.5,
  },
  {
    id: 'harsh-world',
    name: 'Harsh World',
    description: 'Low stag probability, high consumption - survival is difficult',
    startingFood: 5,
    stagProbability: 0.3,
    dailyConsumption: 2,
  },
  {
    id: 'ea-dilemma',
    name: 'EA Dilemma',
    description: 'Cooperation is optimal long-term but risky short-term',
    startingFood: 5,
    stagProbability: 0.6,
    dailyConsumption: 1.5,
  },
  {
    id: 'high-stakes',
    name: 'High Stakes',
    description: 'Very limited food, every decision matters',
    startingFood: 3,
    stagProbability: 0.7,
    dailyConsumption: 1,
  },
  {
    id: 'abundance',
    name: 'Abundance',
    description: 'Plenty of starting food, low pressure',
    startingFood: 20,
    stagProbability: 0.5,
    dailyConsumption: 1,
  },
  {
    id: 'unreliable-stag',
    name: 'Unreliable Stag',
    description: 'Stag rarely appears - is cooperation worth the risk?',
    startingFood: 8,
    stagProbability: 0.4,
    dailyConsumption: 1,
  },
  {
    id: 'reliable-stag',
    name: 'Reliable Stag',
    description: 'Stag almost always appears - cooperation is rewarded',
    startingFood: 5,
    stagProbability: 0.95,
    dailyConsumption: 1,
  },
  {
    id: 'tight-margins',
    name: 'Tight Margins',
    description: 'Moderate stag probability but high consumption - no room for error',
    startingFood: 4,
    stagProbability: 0.7,
    dailyConsumption: 2,
  },
];

export function getPresetById(id: string): GamePreset | undefined {
  return GAME_PRESETS.find((preset) => preset.id === id);
}
