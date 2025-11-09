import type { GameConfig, Choice } from './types';
import { HumanGame } from './human-game';
import { getPresetById } from './presets';

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

const setupMaxRounds = document.getElementById('setup-max-rounds') as HTMLInputElement;
const setupMaxRoundsValue = document.getElementById('setup-max-rounds-value') as HTMLSpanElement;

const setupDailyCons = document.getElementById('setup-daily-cons') as HTMLInputElement;
const setupDailyConsValue = document.getElementById('setup-daily-cons-value') as HTMLSpanElement;

const startGameButton = document.getElementById('start-game') as HTMLButtonElement;

// Apply preset to sliders
function applyPreset(presetId: string) {
  const preset = getPresetById(presetId);
  if (!preset) return;

  setupStartingFood.value = preset.startingFood.toString();
  setupStagProb.value = (preset.stagProbability * 100).toString();
  setupDailyCons.value = preset.dailyConsumption.toString();

  // Update description
  setupPresetDescription.textContent = preset.description;

  // Update value displays
  setupStartingFoodValue.textContent = setupStartingFood.value;
  setupStagProbValue.textContent = setupStagProb.value + '%';
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
setupMaxRounds.addEventListener('input', () => {
  setupMaxRoundsValue.textContent = setupMaxRounds.value;
});
setupDailyCons.addEventListener('input', () => {
  setupPresetSelect.value = 'custom';
  setupDailyConsValue.textContent = setupDailyCons.value;
});

// Start game
startGameButton.addEventListener('click', () => {
  const config: GameConfig = {
    startingFood: parseInt(setupStartingFood.value),
    stagProbability: parseInt(setupStagProb.value) / 100,
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

  // Update stag description with probability and expected value
  const stagProb = state.config.stagProbability;
  const expectedValue = stagProb * 5;

  if (stagProb < 1) {
    const probPercent = (stagProb * 100).toFixed(0);
    const ev = expectedValue.toFixed(1);
    stagDescLine1.textContent = `Both Stag: +5 each (${probPercent}% chance, EV: +${ev})`;
  } else {
    stagDescLine1.textContent = 'Both Stag: +5 each';
  }

  // Hide all screens except choice
  gameScreen.style.display = 'none';
  choiceScreen.style.display = 'block';
  transitionScreen.style.display = 'none';
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
    // Player 2 just chose, show outcome
    showOutcome();
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

// Outcome screen
const outcomeText = document.getElementById('outcome-text') as HTMLDivElement;
const continueButton = document.getElementById('continue-button') as HTMLButtonElement;

function showOutcome() {
  if (!game) return;

  const state = game.getState();
  const lastRound = game.getLastRound();

  if (!lastRound) return;

  const player1Name = state.players[0].name;
  const player2Name = state.players[1].name;

  let outcomeHTML = `<h2>Round ${lastRound.round} Results</h2>`;
  outcomeHTML += `<p><strong>${player1Name}:</strong> ${lastRound.player1Choice === 'stag' ? 'Stag 🦌' : 'Hare 🐇'}</p>`;
  outcomeHTML += `<p><strong>${player2Name}:</strong> ${lastRound.player2Choice === 'stag' ? 'Stag 🦌' : 'Hare 🐇'}</p>`;

  if (lastRound.player1Choice === 'stag' && lastRound.player2Choice === 'stag') {
    if (lastRound.stagAppeared) {
      outcomeHTML += `<p class="success">The stag appeared! Both players get +5 food.</p>`;
    } else {
      outcomeHTML += `<p class="failure">The stag didn't appear! Both players get 0 food.</p>`;
    }
  }

  outcomeHTML += `<div class="food-changes">`;
  outcomeHTML += `<p><strong>${player1Name}:</strong> ${lastRound.player1FoodChange >= 0 ? '+' : ''}${lastRound.player1FoodChange} food → ${lastRound.player1CurrentFood} total</p>`;
  outcomeHTML += `<p><strong>${player2Name}:</strong> ${lastRound.player2FoodChange >= 0 ? '+' : ''}${lastRound.player2FoodChange} food → ${lastRound.player2CurrentFood} total</p>`;
  outcomeHTML += `</div>`;

  outcomeText.innerHTML = outcomeHTML;

  choiceScreen.style.display = 'none';
  transitionScreen.style.display = 'none';
  outcomeScreen.style.display = 'block';

  // Update game metrics
  updateGameMetrics();
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
  outcomeScreen.style.display = 'none';
  gameOverScreen.style.display = 'block';
}

playAgainButton.addEventListener('click', () => {
  game = null;
  gameOverScreen.style.display = 'none';
  setupScreen.style.display = 'block';
});

// Initialize
setupStartingFoodValue.textContent = setupStartingFood.value;
setupStagProbValue.textContent = setupStagProb.value + '%';
setupMaxRoundsValue.textContent = setupMaxRounds.value;
setupDailyConsValue.textContent = setupDailyCons.value;
