export type Choice = 'stag' | 'hare';

export type Strategy =
  | 'always-stag'
  | 'always-hare'
  | 'tit-for-tat'
  | 'random'
  | 'cautious';

export interface GameConfig {
  startingFood: number;
  stagProbability: number; // 0-1
  stagPayoff: number;
  maxRounds: number;
  dailyConsumption: number;
}

export interface Player {
  id: 1 | 2;
  name: string;
  currentFood: number;
  strategy: Strategy;
}

export interface RoundResult {
  round: number;
  player1Choice: Choice;
  player2Choice: Choice;
  stagAppeared: boolean;
  player1FoodChange: number;
  player2FoodChange: number;
  player1CurrentFood: number;
  player2CurrentFood: number;
}

export interface GameState {
  config: GameConfig;
  players: [Player, Player];
  currentRound: number;
  history: RoundResult[];
  gameOver: boolean;
  winner?: 1 | 2 | 'tie';
}

export interface SimulationResult {
  finalState: GameState;
  player1Survived: boolean;
  player2Survived: boolean;
  roundsPlayed: number;
  player1CooperationRate: number;
  player2CooperationRate: number;
  stagAppearanceCount: number;
  stagFailureCount: number;
}

export interface HeatmapPoint {
  stagProbability: number;
  dailyConsumption: number;
  avgRoundsSurvived: number;
}

export interface GamePreset {
  id: string;
  name: string;
  description: string;
  startingFood: number;
  stagProbability: number; // 0-1
  stagPayoff: number;
  dailyConsumption: number;
}
