import type { GameConfig, Strategy } from './types';
import { runSimulation, calculateStatistics } from './simulation';
import { findBreakevenProbability, generateHeatmap } from './analysis';
import {
  createFoodOverTimeChart,
  createChoiceDistributionChart,
  createHeatmapTable,
} from './visualization';
import { getPresetById } from './presets';

// Get DOM elements
const presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
const presetDescription = document.getElementById('preset-description') as HTMLParagraphElement;
const startingFoodSlider = document.getElementById('starting-food') as HTMLInputElement;
const startingFoodValue = document.getElementById('starting-food-value') as HTMLSpanElement;

const stagProbSlider = document.getElementById('stag-prob') as HTMLInputElement;
const stagProbValue = document.getElementById('stag-prob-value') as HTMLSpanElement;

const maxRoundsSlider = document.getElementById('max-rounds') as HTMLInputElement;
const maxRoundsValue = document.getElementById('max-rounds-value') as HTMLSpanElement;

const dailyConsSlider = document.getElementById('daily-cons') as HTMLInputElement;
const dailyConsValue = document.getElementById('daily-cons-value') as HTMLSpanElement;

const player1StrategySelect = document.getElementById('player1-strategy') as HTMLSelectElement;
const player2StrategySelect = document.getElementById('player2-strategy') as HTMLSelectElement;

const runSimButton = document.getElementById('run-simulation') as HTMLButtonElement;
const findBreakevenButton = document.getElementById('find-breakeven') as HTMLButtonElement;
const generateHeatmapButton = document.getElementById('generate-heatmap') as HTMLButtonElement;

const resultsSection = document.getElementById('results-section') as HTMLDivElement;
const statsTable = document.getElementById('stats-table') as HTMLTableElement;
const breakevenResult = document.getElementById('breakeven-result') as HTMLDivElement;

// Update slider value displays
function updateSliderValues() {
  startingFoodValue.textContent = startingFoodSlider.value;
  stagProbValue.textContent = stagProbSlider.value + '%';
  maxRoundsValue.textContent = maxRoundsSlider.value;
  dailyConsValue.textContent = dailyConsSlider.value;
}

// When sliders change, switch to custom preset
startingFoodSlider.addEventListener('input', () => {
  presetSelect.value = 'custom';
  updateSliderValues();
});
stagProbSlider.addEventListener('input', () => {
  presetSelect.value = 'custom';
  updateSliderValues();
});
maxRoundsSlider.addEventListener('input', updateSliderValues);
dailyConsSlider.addEventListener('input', () => {
  presetSelect.value = 'custom';
  updateSliderValues();
});

// Apply preset to sliders
function applyPreset(presetId: string) {
  const preset = getPresetById(presetId);
  if (!preset) return;

  startingFoodSlider.value = preset.startingFood.toString();
  stagProbSlider.value = (preset.stagProbability * 100).toString();
  dailyConsSlider.value = preset.dailyConsumption.toString();

  // Update description
  presetDescription.textContent = preset.description;

  updateSliderValues();
}

// Handle preset selection
presetSelect.addEventListener('change', () => {
  applyPreset(presetSelect.value);
});

// Get current configuration
function getCurrentConfig(): GameConfig {
  return {
    startingFood: parseInt(startingFoodSlider.value),
    stagProbability: parseInt(stagProbSlider.value) / 100,
    maxRounds: parseInt(maxRoundsSlider.value),
    dailyConsumption: parseFloat(dailyConsSlider.value),
  };
}

// Run simulation
runSimButton.addEventListener('click', () => {
  const config = getCurrentConfig();
  const player1Strategy = player1StrategySelect.value as Strategy;
  const player2Strategy = player2StrategySelect.value as Strategy;

  const result = runSimulation(config, player1Strategy, player2Strategy);
  const stats = calculateStatistics(result);

  // Show results section
  resultsSection.style.display = 'block';

  // Create charts
  createFoodOverTimeChart('food-chart', result);
  createChoiceDistributionChart('choice-chart', result);

  // Update statistics table
  statsTable.innerHTML = `
    <tr>
      <th>Metric</th>
      <th>Player 1</th>
      <th>Player 2</th>
    </tr>
    <tr>
      <td>Final Food</td>
      <td>${stats.player1FinalFood}</td>
      <td>${stats.player2FinalFood}</td>
    </tr>
    <tr>
      <td>Cooperation Rate</td>
      <td>${stats.player1CooperationRate}</td>
      <td>${stats.player2CooperationRate}</td>
    </tr>
    <tr>
      <td colspan="3"><strong>Game Statistics</strong></td>
    </tr>
    <tr>
      <td>Total Rounds</td>
      <td colspan="2">${stats.totalRounds}</td>
    </tr>
    <tr>
      <td>Winner</td>
      <td colspan="2">${stats.winner === 1 ? 'Player 1' : stats.winner === 2 ? 'Player 2' : 'Tie'}</td>
    </tr>
    <tr>
      <td>Stag Attempts</td>
      <td colspan="2">${stats.stagAttempts}</td>
    </tr>
    <tr>
      <td>Stag Successes</td>
      <td colspan="2">${stats.stagSuccesses}</td>
    </tr>
    <tr>
      <td>Stag Failures</td>
      <td colspan="2">${stats.stagFailures}</td>
    </tr>
    <tr>
      <td>Actual Success Rate</td>
      <td colspan="2">${stats.stagSuccessRate}</td>
    </tr>
  `;
});

// Find breakeven probability
findBreakevenButton.addEventListener('click', () => {
  const config = getCurrentConfig();
  breakevenResult.textContent = 'Calculating...';
  breakevenResult.style.display = 'block';

  // Use setTimeout to allow UI to update
  setTimeout(() => {
    const breakeven = findBreakevenProbability(config, 0.01);
    breakevenResult.innerHTML = `
      <strong>Breakeven Stag Probability:</strong> ${(breakeven * 100).toFixed(1)}%<br>
      <small>At this probability, Always Stag and Always Hare have similar survival rates.</small>
    `;
  }, 100);
});

// Generate heatmap
generateHeatmapButton.addEventListener('click', () => {
  const config = getCurrentConfig();
  const heatmapContainer = document.getElementById('heatmap-container');

  if (heatmapContainer) {
    heatmapContainer.innerHTML = '<p>Generating heatmap...</p>';

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const heatmapData = generateHeatmap(config);
      createHeatmapTable('heatmap-container', heatmapData);
    }, 100);
  }
});

// Initialize slider values
updateSliderValues();
