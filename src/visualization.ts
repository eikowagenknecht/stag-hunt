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
  BarController,
  BarElement,
} from 'chart.js';
import type { SimulationResult, HeatmapPoint } from './types';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarController,
  BarElement
);

function formatStrategyName(strategy: string): string {
  const strategyNames: Record<string, string> = {
    'always-stag': 'Always Stag',
    'always-hare': 'Always Hare',
    'tit-for-tat': 'Tit-for-Tat',
    'random': 'Random',
    'cautious': 'Cautious',
  };
  return strategyNames[strategy] || strategy;
}

export function createFoodOverTimeChart(
  canvasId: string,
  result: SimulationResult,
  player1Strategy?: string,
  player2Strategy?: string
): Chart | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const labels = result.finalState.history.map((r) => `Round ${r.round}`);
  const player1Data = result.finalState.history.map((r) => r.player1CurrentFood);
  const player2Data = result.finalState.history.map((r) => r.player2CurrentFood);

  const p1Label = player1Strategy ? `P1: ${formatStrategyName(player1Strategy)}` : 'Player 1';
  const p2Label = player2Strategy ? `P2: ${formatStrategyName(player2Strategy)}` : 'Player 2';

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: p1Label,
          data: player1Data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: p2Label,
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
          display: true,
          text: 'Food Levels Over Time',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Current Food',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Round',
          },
        },
      },
    },
  });
}

export function createChoiceDistributionChart(
  canvasId: string,
  result: SimulationResult,
  player1Strategy?: string,
  player2Strategy?: string
): Chart | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const player1Stag = result.finalState.history.filter((r) => r.player1Choice === 'stag').length;
  const player1Hare = result.finalState.history.filter((r) => r.player1Choice === 'hare').length;
  const player2Stag = result.finalState.history.filter((r) => r.player2Choice === 'stag').length;
  const player2Hare = result.finalState.history.filter((r) => r.player2Choice === 'hare').length;

  const p1Label = player1Strategy ? `P1: ${formatStrategyName(player1Strategy)}` : 'Player 1';
  const p2Label = player2Strategy ? `P2: ${formatStrategyName(player2Strategy)}` : 'Player 2';

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [p1Label, p2Label],
      datasets: [
        {
          label: 'Stag',
          data: [player1Stag, player2Stag],
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Hare',
          data: [player1Hare, player2Hare],
          backgroundColor: 'rgba(249, 115, 22, 0.7)',
          borderColor: 'rgb(249, 115, 22)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Choice Distribution',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Choices',
          },
        },
      },
    },
  });
}

export function createHeatmapTable(containerId: string, heatmapData: HeatmapPoint[]): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Get unique values for axes
  const probabilities = [...new Set(heatmapData.map((d) => d.stagProbability))].sort(
    (a, b) => a - b
  );
  const consumptions = [...new Set(heatmapData.map((d) => d.dailyConsumption))].sort(
    (a, b) => a - b
  );

  // Find min/max for coloring
  const values = heatmapData.map((d) => d.avgRoundsSurvived);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Create table HTML
  let html = '<table class="heatmap-table"><thead><tr><th>Consumption \\ Probability</th>';

  probabilities.forEach((prob) => {
    html += `<th>${(prob * 100).toFixed(0)}%</th>`;
  });

  html += '</tr></thead><tbody>';

  consumptions.forEach((consumption) => {
    html += `<tr><td>${consumption.toFixed(1)}</td>`;

    probabilities.forEach((prob) => {
      const point = heatmapData.find(
        (d) => d.stagProbability === prob && d.dailyConsumption === consumption
      );

      if (point) {
        const normalized = (point.avgRoundsSurvived - minValue) / (maxValue - minValue);
        const intensity = Math.floor(normalized * 255);
        const bgColor = `rgb(${255 - intensity}, ${255 - intensity / 2}, 255)`;

        html += `<td style="background-color: ${bgColor};" title="Avg Rounds: ${point.avgRoundsSurvived}">${point.avgRoundsSurvived}</td>`;
      } else {
        html += '<td>-</td>';
      }
    });

    html += '</tr>';
  });

  html += '</tbody></table>';

  container.innerHTML = html;
}
