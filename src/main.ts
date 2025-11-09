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
const stagEvValue = document.getElementById('stag-ev') as HTMLSpanElement;

const stagPayoffSlider = document.getElementById('stag-payoff') as HTMLInputElement;
const stagPayoffValue = document.getElementById('stag-payoff-value') as HTMLSpanElement;

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
const historyBody = document.getElementById('history-body') as HTMLTableSectionElement;
const breakevenResult = document.getElementById('breakeven-result') as HTMLDivElement;

// Update slider value displays
function updateSliderValues() {
  startingFoodValue.textContent = startingFoodSlider.value;
  stagProbValue.textContent = stagProbSlider.value + '%';
  stagPayoffValue.textContent = stagPayoffSlider.value;

  // Calculate and display expected value for cooperative stag hunting
  const stagProb = parseInt(stagProbSlider.value) / 100;
  const stagPayoff = parseFloat(stagPayoffSlider.value);
  const expectedValue = (stagProb * stagPayoff).toFixed(1);
  stagEvValue.textContent = `Expected food gain: ${expectedValue}`;

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
stagPayoffSlider.addEventListener('input', () => {
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
  stagPayoffSlider.value = preset.stagPayoff.toString();
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
    stagPayoff: parseFloat(stagPayoffSlider.value),
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
  createFoodOverTimeChart('food-chart', result, player1Strategy, player2Strategy);
  createChoiceDistributionChart('choice-chart', result, player1Strategy, player2Strategy);

  // Update statistics table
  statsTable.innerHTML = `
    <tr>
      <th></th>
      <th>P1</th>
      <th>P2</th>
    </tr>
    <tr>
      <td>Final Food</td>
      <td>${stats.player1FinalFood}</td>
      <td>${stats.player2FinalFood}</td>
    </tr>
    <tr>
      <td>Cooperation</td>
      <td>${stats.player1CooperationRate}</td>
      <td>${stats.player2CooperationRate}</td>
    </tr>
    <tr>
      <td>Winner</td>
      <td colspan="2">${stats.winner === 1 ? 'Player 1' : stats.winner === 2 ? 'Player 2' : 'Tie'}</td>
    </tr>
    <tr>
      <td>Rounds</td>
      <td colspan="2">${stats.totalRounds}</td>
    </tr>
    <tr>
      <td>Stag Attempts</td>
      <td colspan="2">${stats.stagAttempts} (${stats.stagSuccesses} success, ${stats.stagFailures} fail) - ${stats.stagSuccessRate}</td>
    </tr>
  `;

  // Populate round-by-round history table
  historyBody.innerHTML = result.finalState.history
    .map((round) => {
      const p1ChoiceDisplay = round.player1Choice === 'stag' ? 'Stag' : 'Hare';
      const p2ChoiceDisplay = round.player2Choice === 'stag' ? 'Stag' : 'Hare';
      const stagAppearedDisplay = round.stagAppeared ? 'Yes' : 'No';
      const p1FoodChange = round.player1FoodChange >= 0 ? `+${round.player1FoodChange.toFixed(1)}` : round.player1FoodChange.toFixed(1);
      const p2FoodChange = round.player2FoodChange >= 0 ? `+${round.player2FoodChange.toFixed(1)}` : round.player2FoodChange.toFixed(1);

      // Add color coding based on food change
      const p1ChangeClass = round.player1FoodChange > 0 ? 'food-gain' : round.player1FoodChange < 0 ? 'food-loss' : '';
      const p2ChangeClass = round.player2FoodChange > 0 ? 'food-gain' : round.player2FoodChange < 0 ? 'food-loss' : '';

      return `
        <tr>
          <td>${round.round}</td>
          <td>${p1ChoiceDisplay}</td>
          <td>${p2ChoiceDisplay}</td>
          <td>${stagAppearedDisplay}</td>
          <td class="${p1ChangeClass}">${p1FoodChange}</td>
          <td class="${p2ChangeClass}">${p2FoodChange}</td>
          <td>${round.player1CurrentFood.toFixed(1)}</td>
          <td>${round.player2CurrentFood.toFixed(1)}</td>
        </tr>
      `;
    })
    .join('');
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
