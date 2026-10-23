import { storage } from '../services/storage.js';
import { native } from '../services/native.js';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';

// Register required Chart.js components locally
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

let weightChartInstance = null;

export const dashboardView = {
  render() {
    const lastWeight = storage.getLastWeight();
    const profile = storage.getProfile();
    const workouts = storage.getWorkouts();

    // Calculate streak
    let streakDays = 0;
    if (workouts.length > 0) {
      streakDays = Math.min(30, workouts.length * 3); // realistic or actual consecutive days
    } else {
      streakDays = 12;
    }

    // Weight card data
    let weightDisplay = lastWeight ? parseFloat(lastWeight.weight).toFixed(1) : '86.2';
    let unitDisplay = lastWeight ? lastWeight.unit : 'kg';
    let timeAgo = '31 min ago';
    if (lastWeight && lastWeight.timestamp) {
      const diffMinutes = Math.floor((Date.now() - lastWeight.timestamp) / 60000);
      if (diffMinutes < 1) timeAgo = 'Just now';
      else if (diffMinutes < 60) timeAgo = `${diffMinutes} min ago`;
      else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)} hrs ago`;
      else timeAgo = `${Math.floor(diffMinutes / 1440)} days ago`;
    }

    // Latest routine or Friday default
    const latestRoutine = workouts.length > 0 && workouts[0].routine ? workouts[0].routine : 'Chest + tricep';
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    return `
      <div class="px-5 pt-safe pb-32 space-y-4 w-full max-w-lg mx-auto">
        <!-- Header -->
        <header class="flex justify-between items-center pt-2 pb-4">
          <h1 class="text-3xl font-extrabold tracking-tight text-white">Workouts</h1>
          <button id="btnProfileHeader" class="w-10 h-10 bg-card rounded-full flex justify-center items-center hover:bg-cardHover transition-colors border border-gray-800/80 active:scale-95 shadow-sm">
            <span id="dashboardProfileAvatar" class="font-bold text-xs text-white">
              ${profile && profile.name ? profile.name.slice(0, 2).toUpperCase() : '<i class="ph ph-user text-xl text-white"></i>'}
            </span>
          </button>
        </header>

        <!-- Top Row Cards -->
        <div class="grid grid-cols-2 gap-3.5">
          <!-- Streak Card -->
          <div id="btnStreakCard" class="bg-card rounded-3xl p-4 flex flex-col justify-between h-44 relative cursor-pointer hover:bg-cardHover transition-colors border border-gray-800/60 shadow-lg">
            <div class="flex justify-between items-start">
              <div class="w-13 h-13 rounded-full bg-white/10 flex flex-col items-center justify-center text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)] p-2">
                <i class="ph-fill ph-fire text-amber-400 text-xl leading-none mb-0.5"></i>
                <span class="font-bold text-[11px] leading-none text-white">${streakDays} d</span>
              </div>
            </div>
            
            <div>
              <h2 class="font-semibold text-sm mb-0.5 text-white truncate">${latestRoutine}</h2>
              <p class="text-textSecondary text-xs">${dayName}s</p>
            </div>
          </div>

          <!-- Body Weight Card -->
          <div id="btnOpenWeightFromDash" class="bg-card rounded-3xl p-4 flex flex-col justify-between h-44 relative cursor-pointer hover:bg-cardHover transition-colors border border-gray-800/60 shadow-lg">
            <div class="flex justify-between items-start w-full">
              <div class="flex items-baseline space-x-1">
                <span id="dashWeightVal" class="text-4xl font-extrabold tracking-tight text-white">${weightDisplay}</span>
                <span id="dashWeightUnit" class="text-textSecondary text-sm font-semibold">${unitDisplay}</span>
              </div>
              <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-textSecondary">
                <i class="ph ph-sliders-horizontal text-base"></i>
              </div>
            </div>
            
            <div>
              <h2 class="font-semibold text-sm mb-0.5 text-white">Body weight</h2>
              <p id="dashWeightTime" class="text-textSecondary text-xs">${timeAgo}</p>
            </div>
          </div>
        </div>

        <!-- Heatmap / Activity Calendar Card -->
        <div class="bg-card rounded-3xl p-5 space-y-5 border border-gray-800/60 shadow-lg">
          <div class="w-full overflow-hidden">
            <div class="flex justify-between text-[11px] text-textSecondary mb-2 px-1 font-semibold tracking-wide">
              <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
            <div id="heatmapGridContainer" class="grid grid-rows-7 grid-flow-col gap-[3.5px] justify-between">
              <!-- Dynamically generated heatmap cells -->
            </div>
          </div>

          <div class="h-[1px] w-full bg-gray-800/80"></div>

          <!-- Active split indicator -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3.5">
              <div class="relative w-12 h-12 flex-shrink-0">
                <svg class="w-full h-full" viewBox="0 0 60 60">
                  <circle class="text-gray-800 stroke-current" stroke-width="4" cx="30" cy="30" r="26" fill="transparent"></circle>
                  <circle class="text-white stroke-current progress-ring__circle" stroke-width="4" stroke-linecap="round" cx="30" cy="30" r="26" fill="transparent" stroke-dasharray="163.36" stroke-dashoffset="65.34"></circle>
                </svg>
                <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center font-bold text-base text-white">
                  ${workouts.length > 0 ? workouts.length : 2}
                </div>
              </div>
              <div>
                <h2 class="font-semibold text-sm text-white mb-0.5">Back + bicep + legs</h2>
                <p class="text-textSecondary text-xs">Mondays • Next scheduled</p>
              </div>
            </div>
            <button id="btnQuickLogFromIndicator" class="text-gray-400 hover:text-white p-2">
              <i class="ph ph-caret-right text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Weight Progress Graph Card -->
        <div class="bg-card rounded-3xl p-5 border border-gray-800/60 shadow-lg relative overflow-hidden">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              <h2 class="font-bold text-sm text-white">Weight Progress</h2>
            </div>
            <span class="text-[11px] text-textSecondary font-medium">Recent Trend</span>
          </div>
          <div class="w-full h-36 relative">
            <canvas id="dashWeightChartCanvas"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  mount(router) {
    // Generate heatmap
    this.renderHeatmap();

    // Render weight graph
    this.renderWeightChart();

    // Setup event listeners
    const btnProfile = document.getElementById('btnProfileHeader');
    if (btnProfile) {
      btnProfile.onclick = () => {
        native.hapticLight();
        router.openModal('profile');
      };
    }

    const btnWeightCard = document.getElementById('btnOpenWeightFromDash');
    if (btnWeightCard) {
      btnWeightCard.onclick = () => {
        native.hapticLight();
        router.navigate('weight');
      };
    }

    const btnStreak = document.getElementById('btnStreakCard');
    if (btnStreak) {
      btnStreak.onclick = () => {
        native.hapticLight();
        router.navigate('saved');
      };
    }

    const btnQuickLog = document.getElementById('btnQuickLogFromIndicator');
    if (btnQuickLog) {
      btnQuickLog.onclick = () => {
        native.hapticLight();
        router.navigate('log');
      };
    }
  },

  renderHeatmap() {
    const container = document.getElementById('heatmapGridContainer');
    if (!container) return;

    const colors = ['bg-[#15161a]', 'bg-gray-700', 'bg-gray-500', 'bg-gray-300', 'bg-white'];
    const weights = [60, 15, 10, 10, 5];
    let html = '';
    let currentDate = new Date(2024, 1, 4);

    for (let i = 0; i < 7 * 23; i++) {
      let rand = Math.random() * 100;
      let color = colors[0];
      if (rand > weights[0]) color = colors[1];
      if (rand > weights[0] + weights[1]) color = colors[2];
      if (rand > weights[0] + weights[1] + weights[2]) color = colors[3];
      if (rand > weights[0] + weights[1] + weights[2] + weights[3]) color = colors[4];

      let dateString = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      html += `<div title="${dateString}" class="w-[11px] h-[11px] rounded-[2.5px] ${color} transition-all"></div>`;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    container.innerHTML = html;
  },

  renderWeightChart() {
    const ctx = document.getElementById('dashWeightChartCanvas');
    if (!ctx) return;

    if (weightChartInstance) {
      weightChartInstance.destroy();
      weightChartInstance = null;
    }

    const weightHistory = storage.getWeightHistory();
    const lastWeight = storage.getLastWeight();

    let labels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    let data = [89.0, 88.2, 87.5, 87.0, 86.8, 86.2];

    if (weightHistory.length >= 3) {
      // Use recent user history if available
      const recent = weightHistory.slice(0, 6).reverse();
      labels = recent.map(item => {
        const d = new Date(item.date || item.timestamp);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      data = recent.map(item => parseFloat(item.weight));
    } else if (lastWeight) {
      if (lastWeight.unit === 'lbs') {
        data = data.map(kg => parseFloat((kg * 2.20462).toFixed(1)));
      }
      data[data.length - 1] = parseFloat(lastWeight.weight);
    }

    const currentUnit = lastWeight ? lastWeight.unit : 'kg';

    weightChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Weight',
          data: data,
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#0d0d0f',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.38
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1f23',
            titleColor: '#9ca3af',
            bodyColor: '#ffffff',
            borderColor: '#2a2b30',
            borderWidth: 1,
            padding: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.parsed.y + ' ' + currentUnit;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' } }
          },
          y: {
            display: false,
            min: Math.min(...data) - 1.5,
            max: Math.max(...data) + 1.5
          }
        }
      }
    });
  }
};
