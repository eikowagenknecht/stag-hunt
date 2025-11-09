import type { GameConfig, Choice } from './types';
import { HumanGame } from './human-game';
import { getPresetById } from './presets';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

let game: HumanGame | null = null;

// Setup screen elements
const setupPresetSelect = document.getElementById('setup-preset-select') as HTMLSelectElement;
const setupPresetDescription = document.getElementById(
  'setup-preset-description'
) as HTMLParagraphElement;
const setupScreen = document.getElementById('setup-screen') as HTMLDivElement;
const gameScreen = document.getElementById('game-screen') as HTMLDivElement;
const choiceScreen = document.getElementById('choice-screen') as HTMLDivElement;
const transitionScreen = document.getElementById('transition-screen') as HTMLDivElement;
const revealScreen = document.getElementById('reveal-screen') as HTMLDivElement;
const outcomeScreen = document.getElementById('outcome-screen') as HTMLDivElement;
const gameOverScreen = document.getElementById('game-over-screen') as HTMLDivElement;

const player1NameInput = document.getElementById('player1-name') as HTMLInputElement;
const player2NameInput = document.getElementById('player2-name') as HTMLInputElement;

const setupStartingFood = document.getElementById('setup-starting-food') as HTMLInputElement;
const setupStartingFoodValue = document.getElementById(
  'setup-starting-food-value'
) as HTMLSpanElement;

const setupStagProb = document.getElementById('setup-stag-prob') as HTMLInputElement;
const setupStagProbValue = document.getElementById('setup-stag-prob-value') as HTMLSpanElement;

const setupStagPayoff = document.getElementById('setup-stag-payoff') as HTMLInputElement;
const setupStagPayoffValue = document.getElementById('setup-stag-payoff-value') as HTMLSpanElement;

const setupDailyCons = document.getElementById('setup-daily-cons') as HTMLInputElement;
const setupDailyConsValue = document.getElementById('setup-daily-cons-value') as HTMLSpanElement;

const setupMaxRounds = document.getElementById('setup-max-rounds') as HTMLInputElement;
const setupMaxRoundsValue = document.getElementById('setup-max-rounds-value') as HTMLSpanElement;

const startGameButton = document.getElementById('start-game') as HTMLButtonElement;

// Advanced settings toggle
const toggleAdvancedSettingsButton = document.getElementById('toggle-advanced-settings') as HTMLButtonElement;
const advancedSettingsToggleIcon = document.getElementById('advanced-settings-toggle-icon') as HTMLSpanElement;
const advancedSettingsContent = document.getElementById('advanced-settings-content') as HTMLDivElement;

toggleAdvancedSettingsButton.addEventListener('click', () => {
  const isHidden = advancedSettingsContent.style.display === 'none';
  advancedSettingsContent.style.display = isHidden ? 'block' : 'none';
  advancedSettingsToggleIcon.textContent = isHidden ? '▼' : '▶';
});

// Apply preset to sliders
function applyPreset(presetId: string) {
  const preset = getPresetById(presetId);
  if (!preset) return;

  setupStartingFood.value = preset.startingFood.toString();
  setupStagProb.value = (preset.stagProbability * 100).toString();
  setupStagPayoff.value = preset.stagPayoff.toString();
  setupDailyCons.value = preset.dailyConsumption.toString();

  // Update description
  setupPresetDescription.textContent = preset.description;

  // Update value displays
  setupStartingFoodValue.textContent = setupStartingFood.value;
  setupStagProbValue.textContent = setupStagProb.value + '%';
  setupStagPayoffValue.textContent = setupStagPayoff.value;
  setupDailyConsValue.textContent = setupDailyCons.value;
}

// Handle preset selection
setupPresetSelect.addEventListener('change', () => {
  applyPreset(setupPresetSelect.value);
});

// Update slider displays (and switch to custom on manual change)
setupStartingFood.addEventListener('input', () => {
  setupPresetSelect.value = 'custom';
  setupStartingFoodValue.textContent = setupStartingFood.value;
});
setupStagProb.addEventListener('input', () => {
  setupPresetSelect.value = 'custom';
  setupStagProbValue.textContent = setupStagProb.value + '%';
});
setupStagPayoff.addEventListener('input', () => {
  setupPresetSelect.value = 'custom';
  setupStagPayoffValue.textContent = setupStagPayoff.value;
});
setupDailyCons.addEventListener('input', () => {
  setupPresetSelect.value = 'custom';
  setupDailyConsValue.textContent = setupDailyCons.value;
});
setupMaxRounds.addEventListener('input', () => {
  setupMaxRoundsValue.textContent = setupMaxRounds.value;
});

// Start game
startGameButton.addEventListener('click', () => {
  const config: GameConfig = {
    startingFood: parseInt(setupStartingFood.value),
    stagProbability: parseInt(setupStagProb.value) / 100,
    stagPayoff: parseFloat(setupStagPayoff.value),
    maxRounds: parseInt(setupMaxRounds.value),
    dailyConsumption: parseFloat(setupDailyCons.value),
  };

  const player1Name = player1NameInput.value.trim() || 'Player 1';
  const player2Name = player2NameInput.value.trim() || 'Player 2';

  game = new HumanGame(config, player1Name, player2Name);

  setupScreen.style.display = 'none';
  gameScreen.style.display = 'block';

  updateGameMetrics();
  showChoiceScreen();
});

// Choice screen elements
const currentPlayerName = document.getElementById('current-player-name') as HTMLSpanElement;
const choiceCurrentFood = document.getElementById('choice-current-food') as HTMLSpanElement;
const choiceDailyConsumptionContainer = document.getElementById('choice-daily-consumption-container') as HTMLDivElement;
const choiceDailyConsumption = document.getElementById('choice-daily-consumption') as HTMLSpanElement;
const stagDescLine1 = document.getElementById('stag-desc-line1') as HTMLSpanElement;
const choiceStagButton = document.getElementById('choice-stag') as HTMLButtonElement;
const choiceHareButton = document.getElementById('choice-hare') as HTMLButtonElement;

function showChoiceScreen() {
  if (!game || game.isGameOver()) return;

  const playerTurn = game.getCurrentPlayerTurn();
  const state = game.getState();
  const playerName = state.players[playerTurn - 1].name;
  const currentFood = state.players[playerTurn - 1].currentFood;

  currentPlayerName.textContent = playerName;
  choiceCurrentFood.textContent = currentFood.toString();
  choiceDailyConsumption.textContent = state.config.dailyConsumption.toString();

  // Hide daily consumption if it's 0
  if (state.config.dailyConsumption === 0) {
    choiceDailyConsumptionContainer.style.display = 'none';
  } else {
    choiceDailyConsumptionContainer.style.display = 'flex';
  }

  // Update stag description with probability and expected value
  const stagProb = state.config.stagProbability;
  const stagPayoff = state.config.stagPayoff;
  const expectedValue = stagProb * stagPayoff;

  if (stagProb < 1) {
    const probPercent = (stagProb * 100).toFixed(0);
    const ev = expectedValue.toFixed(1);
    stagDescLine1.textContent = `Both Stag: +${stagPayoff} each (${probPercent}% chance, EV: +${ev})`;
  } else {
    stagDescLine1.textContent = `Both Stag: +${stagPayoff} each`;
  }

  // Hide all screens except choice
  gameScreen.style.display = 'none';
  choiceScreen.style.display = 'block';
  transitionScreen.style.display = 'none';
  revealScreen.style.display = 'none';
  outcomeScreen.style.display = 'none';
}

choiceStagButton.addEventListener('click', () => handleChoice('stag'));
choiceHareButton.addEventListener('click', () => handleChoice('hare'));

function handleChoice(choice: Choice) {
  if (!game) return;

  const playerTurn = game.getCurrentPlayerTurn();
  game.recordChoice(playerTurn, choice);

  if (playerTurn === 1) {
    // Player 1 just chose, show transition to Player 2
    showTransition();
  } else {
    // Player 2 just chose, show reveal screen
    showReveal();
  }
}

// Transition screen
const readyButton = document.getElementById('ready-button') as HTMLButtonElement;
const transitionPlayerName = document.getElementById('transition-player-name') as HTMLSpanElement;

function showTransition() {
  if (!game) return;

  const state = game.getState();
  const player2Name = state.players[1].name;

  transitionPlayerName.textContent = player2Name;

  choiceScreen.style.display = 'none';
  transitionScreen.style.display = 'block';
}

readyButton.addEventListener('click', () => {
  showChoiceScreen();
});

// Reveal screen
const revealButton = document.getElementById('reveal-button') as HTMLButtonElement;

function showReveal() {
  choiceScreen.style.display = 'none';
  revealScreen.style.display = 'block';
}

revealButton.addEventListener('click', () => {
  showOutcome();
});

// Outcome screen
const outcomeText = document.getElementById('outcome-text') as HTMLDivElement;
const outcomeChartCanvas = document.getElementById('outcome-chart') as HTMLCanvasElement;
const continueButton = document.getElementById('continue-button') as HTMLButtonElement;
let outcomeChart: Chart | null = null;

function showOutcome() {
  if (!game) return;

  const state = game.getState();
  const lastRound = game.getLastRound();

  if (!lastRound) return;

  const player1Name = state.players[0].name;
  const player2Name = state.players[1].name;

  // Calculate hunt payoffs before consumption
  const stagPayoff = state.config.stagPayoff;
  let player1HuntPayoff = 0;
  let player2HuntPayoff = 0;

  if (lastRound.player1Choice === 'stag' && lastRound.player2Choice === 'stag') {
    if (lastRound.stagAppeared) {
      player1HuntPayoff = stagPayoff;
      player2HuntPayoff = stagPayoff;
    } else {
      player1HuntPayoff = 0;
      player2HuntPayoff = 0;
    }
  } else if (lastRound.player1Choice === 'hare' && lastRound.player2Choice === 'hare') {
    player1HuntPayoff = 2;
    player2HuntPayoff = 2;
  } else if (lastRound.player1Choice === 'stag' && lastRound.player2Choice === 'hare') {
    player1HuntPayoff = 0;
    player2HuntPayoff = 4;
  } else {
    player1HuntPayoff = 4;
    player2HuntPayoff = 0;
  }

  let outcomeHTML = `<h2>Round ${lastRound.round} Results</h2>`;

  outcomeHTML += `<div class="choices-row">`;
  outcomeHTML += `<div class="choice-box player1"><strong>${player1Name}:</strong><br>${lastRound.player1Choice === 'stag' ? 'Stag 🦌' : 'Hare 🐇'}</div>`;
  outcomeHTML += `<div class="choice-box player2"><strong>${player2Name}:</strong><br>${lastRound.player2Choice === 'stag' ? 'Stag 🦌' : 'Hare 🐇'}</div>`;
  outcomeHTML += `</div>`;

  if (lastRound.player1Choice === 'stag' && lastRound.player2Choice === 'stag') {
    if (lastRound.stagAppeared) {
      outcomeHTML += `<p class="success">✓ The stag appeared!</p>`;
    } else {
      outcomeHTML += `<p class="failure">✗ The stag didn't appear!</p>`;
    }
  }

  const player1StartingFood = lastRound.player1CurrentFood - lastRound.player1FoodChange;

  outcomeHTML += `<div class="player-breakdown">`;
  outcomeHTML += `<strong>${player1Name}:</strong>`;
  outcomeHTML += `<div class="breakdown-calculation">`;
  outcomeHTML += `<div class="calc-box"><span class="calc-value">${player1StartingFood}</span><span class="calc-label">Starting</span></div>`;
  outcomeHTML += `<span class="calc-symbol">+</span>`;
  outcomeHTML += `<div class="calc-box positive"><span class="calc-value">+${player1HuntPayoff}</span><span class="calc-label">Hunt</span></div>`;
  if (state.config.dailyConsumption > 0) {
    outcomeHTML += `<span class="calc-symbol">−</span>`;
    outcomeHTML += `<div class="calc-box negative"><span class="calc-value">${state.config.dailyConsumption}</span><span class="calc-label">Consumption</span></div>`;
  }
  outcomeHTML += `<span class="calc-symbol">=</span>`;
  outcomeHTML += `<div class="calc-box result ${lastRound.player1CurrentFood > player1StartingFood ? 'positive' : lastRound.player1CurrentFood < player1StartingFood ? 'negative' : ''}"><span class="calc-value">${lastRound.player1CurrentFood}</span><span class="calc-label">Result</span></div>`;
  outcomeHTML += `</div>`;
  outcomeHTML += `</div>`;

  const player2StartingFood = lastRound.player2CurrentFood - lastRound.player2FoodChange;

  outcomeHTML += `<div class="player-breakdown">`;
  outcomeHTML += `<strong>${player2Name}:</strong>`;
  outcomeHTML += `<div class="breakdown-calculation">`;
  outcomeHTML += `<div class="calc-box"><span class="calc-value">${player2StartingFood}</span><span class="calc-label">Starting</span></div>`;
  outcomeHTML += `<span class="calc-symbol">+</span>`;
  outcomeHTML += `<div class="calc-box positive"><span class="calc-value">+${player2HuntPayoff}</span><span class="calc-label">Hunt</span></div>`;
  if (state.config.dailyConsumption > 0) {
    outcomeHTML += `<span class="calc-symbol">−</span>`;
    outcomeHTML += `<div class="calc-box negative"><span class="calc-value">${state.config.dailyConsumption}</span><span class="calc-label">Consumption</span></div>`;
  }
  outcomeHTML += `<span class="calc-symbol">=</span>`;
  outcomeHTML += `<div class="calc-box result ${lastRound.player2CurrentFood > player2StartingFood ? 'positive' : lastRound.player2CurrentFood < player2StartingFood ? 'negative' : ''}"><span class="calc-value">${lastRound.player2CurrentFood}</span><span class="calc-label">Result</span></div>`;
  outcomeHTML += `</div>`;
  outcomeHTML += `</div>`;

  outcomeText.innerHTML = outcomeHTML;

  // Create food over time chart
  createOutcomeChart();

  choiceScreen.style.display = 'none';
  transitionScreen.style.display = 'none';
  revealScreen.style.display = 'none';
  outcomeScreen.style.display = 'block';

  // Update game metrics and history
  updateGameMetrics();
  updateRoundHistory();
}

function createOutcomeChart() {
  if (!game) return;

  const state = game.getState();

  // Destroy existing chart if it exists
  if (outcomeChart) {
    outcomeChart.destroy();
  }

  const labels = ['Start', ...state.history.map((r) => `R${r.round}`)];
  const player1Data = [state.config.startingFood, ...state.history.map((r) => r.player1CurrentFood)];
  const player2Data = [state.config.startingFood, ...state.history.map((r) => r.player2CurrentFood)];

  const ctx = outcomeChartCanvas.getContext('2d');
  if (!ctx) return;

  outcomeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: state.players[0].name,
          data: player1Data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: state.players[1].name,
          data: player2Data,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Food',
          },
        },
      },
    },
  });
}

continueButton.addEventListener('click', () => {
  if (!game) return;

  if (game.isGameOver()) {
    showGameOver();
  } else {
    outcomeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    showChoiceScreen();
  }
});

// Round history toggle
const toggleHistoryButton = document.getElementById('toggle-history') as HTMLButtonElement;
const historyToggleIcon = document.getElementById('history-toggle-icon') as HTMLSpanElement;
const roundHistoryContent = document.getElementById('round-history-content') as HTMLDivElement;
const historyTableBody = document.getElementById('history-table-body') as HTMLTableSectionElement;

toggleHistoryButton.addEventListener('click', () => {
  const isHidden = roundHistoryContent.style.display === 'none';
  roundHistoryContent.style.display = isHidden ? 'block' : 'none';
  historyToggleIcon.classList.toggle('expanded', isHidden);
});

function updateRoundHistory() {
  if (!game) return;

  const state = game.getState();
  const history = state.history;

  historyTableBody.innerHTML = '';

  history.forEach((round) => {
    const row = document.createElement('tr');

    const stagStatus = round.player1Choice === 'stag' && round.player2Choice === 'stag'
      ? (round.stagAppeared ? '✓' : '✗')
      : '-';

    row.innerHTML = `
      <td>${round.round}</td>
      <td>${round.player1Choice === 'stag' ? '🦌' : '🐇'}</td>
      <td>${round.player2Choice === 'stag' ? '🦌' : '🐇'}</td>
      <td>${stagStatus}</td>
      <td class="${round.player1FoodChange >= 0 ? 'food-gain' : 'food-loss'}">${round.player1FoodChange >= 0 ? '+' : ''}${round.player1FoodChange}</td>
      <td class="${round.player2FoodChange >= 0 ? 'food-gain' : 'food-loss'}">${round.player2FoodChange >= 0 ? '+' : ''}${round.player2FoodChange}</td>
      <td>${round.player1CurrentFood}</td>
      <td>${round.player2CurrentFood}</td>
    `;

    historyTableBody.appendChild(row);
  });
}

// Game metrics
const metricsRound = document.getElementById('metrics-round') as HTMLSpanElement;
const metricsPlayer1Name = document.getElementById('metrics-player1-name') as HTMLDivElement;
const metricsPlayer2Name = document.getElementById('metrics-player2-name') as HTMLDivElement;
const metricsPlayer1Food = document.getElementById('metrics-player1-food') as HTMLSpanElement;
const metricsPlayer2Food = document.getElementById('metrics-player2-food') as HTMLSpanElement;

function updateGameMetrics() {
  if (!game) return;

  const state = game.getState();
  metricsRound.textContent = state.currentRound.toString();
  metricsPlayer1Name.textContent = state.players[0].name;
  metricsPlayer2Name.textContent = state.players[1].name;
  metricsPlayer1Food.textContent = state.players[0].currentFood.toString();
  metricsPlayer2Food.textContent = state.players[1].currentFood.toString();
}

// Game over screen
const gameOverText = document.getElementById('game-over-text') as HTMLDivElement;
const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;

function showGameOver() {
  if (!game) return;

  const state = game.getState();
  const winner = game.getWinner();
  const player1Name = state.players[0].name;
  const player2Name = state.players[1].name;

  let gameOverHTML = `<h2>Game Over!</h2>`;

  if (winner === 1) {
    gameOverHTML += `<p class="winner">${player1Name} wins!</p>`;
  } else if (winner === 2) {
    gameOverHTML += `<p class="winner">${player2Name} wins!</p>`;
  } else {
    gameOverHTML += `<p class="tie">It's a tie!</p>`;
  }

  gameOverHTML += `<div class="final-stats">`;
  gameOverHTML += `<h3>Final Statistics</h3>`;
  gameOverHTML += `<p><strong>${player1Name}:</strong> ${state.players[0].currentFood} food</p>`;
  gameOverHTML += `<p><strong>${player2Name}:</strong> ${state.players[1].currentFood} food</p>`;
  gameOverHTML += `<p><strong>Rounds Played:</strong> ${state.currentRound}</p>`;

  const player1Stag = state.history.filter((r) => r.player1Choice === 'stag').length;
  const player2Stag = state.history.filter((r) => r.player2Choice === 'stag').length;
  const player1CoopRate = ((player1Stag / state.currentRound) * 100).toFixed(1);
  const player2CoopRate = ((player2Stag / state.currentRound) * 100).toFixed(1);

  gameOverHTML += `<p><strong>${player1Name} Cooperation:</strong> ${player1CoopRate}%</p>`;
  gameOverHTML += `<p><strong>${player2Name} Cooperation:</strong> ${player2CoopRate}%</p>`;

  gameOverHTML += `</div>`;

  gameOverText.innerHTML = gameOverHTML;

  gameScreen.style.display = 'none';
  choiceScreen.style.display = 'none';
  transitionScreen.style.display = 'none';
  revealScreen.style.display = 'none';
  outcomeScreen.style.display = 'none';
  gameOverScreen.style.display = 'block';
}

playAgainButton.addEventListener('click', () => {
  game = null;
  gameOverScreen.style.display = 'none';
  setupScreen.style.display = 'block';
});

// Initialize - apply the custom preset on load
applyPreset('custom');
setupMaxRoundsValue.textContent = setupMaxRounds.value;
