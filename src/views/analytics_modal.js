import { storage } from '../services/storage.js';
import { Chart, DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

// Register Chart.js controllers for doughnut and bar charts
Chart.register(DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip);

let doughnutChartInstance = null;
let barChartInstance = null;

export const analyticsModal = {
  render() {
    return `
      <div id="analyticsModalRoot" style="display: none;" class="fixed inset-0 z-[1000] justify-center items-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="backdropAnalytics"></div>
        <div class="bg-card w-full max-w-sm max-h-[88vh] flex flex-col rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 no-scrollbar overflow-hidden">
          
          <!-- Header -->
          <div class="flex justify-between items-center pb-3 border-b border-gray-800/80 mb-3">
            <div class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <i class="ph ph-chart-bar text-xl"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-white leading-tight">Volume & Muscle Analytics</h3>
                <p class="text-[11px] text-textSecondary">Muscle split & lifted workload</p>
              </div>
            </div>
            <button id="btnCloseAnalyticsModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5">
            
            <!-- Overview Workload Summary -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-2.5">
                <div id="analyticsTotalVolText" class="font-bold text-white text-base">0 t</div>
                <div class="text-[10px] text-textSecondary mt-0.5">Total Volume</div>
              </div>
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-2.5">
                <div id="analyticsAvgVolText" class="font-bold text-white text-base">0 kg</div>
                <div class="text-[10px] text-textSecondary mt-0.5">Avg / Session</div>
              </div>
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-2.5">
                <div id="analyticsTotalSetsText" class="font-bold text-white text-base">0</div>
                <div class="text-[10px] text-textSecondary mt-0.5">Sets Completed</div>
              </div>
            </div>

            <!-- Muscle Split Distribution Doughnut -->
            <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3.5 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-white">Muscle Group Distribution</span>
                <span class="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-medium">Split Ratio</span>
              </div>
              <div class="relative w-full h-40 flex items-center justify-center">
                <canvas id="muscleDoughnutCanvas"></canvas>
              </div>
              <div id="muscleSplitLegendBox" class="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                <!-- Dynamically populated -->
              </div>
            </div>

            <!-- Weekly Volume Bar Chart -->
            <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3.5 space-y-2.5">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-white">Weekly Workload Trend</span>
                <span class="text-[10px] text-textSecondary font-medium">Total kg</span>
              </div>
              <div class="relative w-full h-32">
                <canvas id="weeklyVolumeBarCanvas"></canvas>
              </div>
            </div>

            <!-- Top Exercises -->
            <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3.5 space-y-2">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-white">Top Exercises by Workload</span>
                <span class="text-[10px] text-textSecondary">Cumulative kg</span>
              </div>
              <div id="analyticsTopExList" class="space-y-2 text-xs">
                <!-- Dynamically populated -->
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
  },

  mount() {
    const modal = document.getElementById('analyticsModalRoot');
    const backdrop = document.getElementById('backdropAnalytics');
    const closeBtn = document.getElementById('btnCloseAnalyticsModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
  },

  open() {
    this.renderAnalyticsData();
    document.getElementById('analyticsModalRoot').style.display = 'flex';
  },

  renderAnalyticsData() {
    const history = storage.getWorkouts();

    let totalVolumeKg = 0;
    let totalSets = 0;
    const muscleMap = {
      'Chest': 0,
      'Back': 0,
      'Legs': 0,
      'Shoulders': 0,
      'Arms': 0,
      'Core': 0
    };
    const exerciseVolumeMap = {};
    const weeklyVolumeMap = {};

    history.forEach(item => {
      const itemDate = new Date(item.date || item.timestamp);
      const weekKey = itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      let sessionVolume = 0;
      const routineName = (item.routine || item.title || '').toLowerCase();

      (item.exercises || []).forEach(ex => {
        const exName = (ex.name || 'Exercise').trim();
        const exNameLower = exName.toLowerCase();
        let exVol = 0;

        (ex.sets || []).forEach(s => {
          totalSets++;
          const wt = parseFloat(s.weight) || (ex.category === 'bodyweight' ? 70 : 0);
          const reps = parseInt(s.reps, 10) || 0;
          const setVol = wt * reps;
          exVol += setVol;
        });

        totalVolumeKg += exVol;
        sessionVolume += exVol;
        exerciseVolumeMap[exName] = (exerciseVolumeMap[exName] || 0) + exVol;

        // Classify muscle group
        if (exNameLower.includes('bench') || exNameLower.includes('chest') || exNameLower.includes('fly') || exNameLower.includes('push') || routineName.includes('chest')) {
          muscleMap['Chest'] += (exVol || 100);
        } else if (exNameLower.includes('row') || exNameLower.includes('pull') || exNameLower.includes('lat') || exNameLower.includes('back') || exNameLower.includes('deadlift') || routineName.includes('back')) {
          muscleMap['Back'] += (exVol || 100);
        } else if (exNameLower.includes('squat') || exNameLower.includes('leg') || exNameLower.includes('calf') || exNameLower.includes('lunge') || routineName.includes('leg')) {
          muscleMap['Legs'] += (exVol || 100);
        } else if (exNameLower.includes('shoulder') || exNameLower.includes('overhead') || exNameLower.includes('press') || exNameLower.includes('deltoid') || routineName.includes('shoulder')) {
          muscleMap['Shoulders'] += (exVol || 100);
        } else if (exNameLower.includes('curl') || exNameLower.includes('bicep') || exNameLower.includes('tricep') || exNameLower.includes('extension') || routineName.includes('arm')) {
          muscleMap['Arms'] += (exVol || 100);
        } else {
          muscleMap['Core'] += (exVol || 50);
        }
      });

      weeklyVolumeMap[weekKey] = (weeklyVolumeMap[weekKey] || 0) + sessionVolume;
    });

    if (history.length === 0) {
      totalVolumeKg = 14850;
      totalSets = 42;
      muscleMap['Chest'] = 4500;
      muscleMap['Back'] = 3800;
      muscleMap['Legs'] = 3500;
      muscleMap['Shoulders'] = 1800;
      muscleMap['Arms'] = 1250;
      exerciseVolumeMap['Barbell Bench Press'] = 4200;
      exerciseVolumeMap['Barbell Squat'] = 3500;
      exerciseVolumeMap['Bent Over Row'] = 2800;
      weeklyVolumeMap['Sep 20'] = 3200;
      weeklyVolumeMap['Sep 27'] = 3800;
      weeklyVolumeMap['Oct 4'] = 3650;
      weeklyVolumeMap['Oct 11'] = 4200;
    }

    const avgSessionVolume = history.length > 0 ? Math.round(totalVolumeKg / history.length) : Math.round(totalVolumeKg / 4);
    const volumeDisplay = totalVolumeKg >= 1000 ? `${(totalVolumeKg / 1000).toFixed(1)} t` : `${totalVolumeKg} kg`;

    document.getElementById('analyticsTotalVolText').textContent = volumeDisplay;
    document.getElementById('analyticsAvgVolText').textContent = `${avgSessionVolume.toLocaleString()} kg`;
    document.getElementById('analyticsTotalSetsText').textContent = totalSets;

    this.renderDoughnut(muscleMap);
    this.renderBar(weeklyVolumeMap);
    this.renderTopExercises(exerciseVolumeMap);
  },

  renderDoughnut(muscleMap) {
    const ctx = document.getElementById('muscleDoughnutCanvas');
    if (!ctx) return;

    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
      doughnutChartInstance = null;
    }

    const labels = Object.keys(muscleMap);
    const data = Object.values(muscleMap);
    const colors = ['#ffffff', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#262a33'];

    doughnutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#15161a',
          borderWidth: 3,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1f23',
            titleColor: '#ffffff',
            bodyColor: '#9ca3af',
            borderColor: '#2a2b30',
            borderWidth: 1,
            padding: 8
          }
        }
      }
    });

    const legendCont = document.getElementById('muscleSplitLegendBox');
    if (legendCont) {
      const total = data.reduce((a, b) => a + b, 0) || 1;
      legendCont.innerHTML = labels.map((name, i) => {
        const pct = Math.round((data[i] / total) * 100);
        return `
          <div class="flex items-center space-x-1.5 bg-card/60 px-2 py-1 rounded-lg border border-gray-800/60">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${colors[i % colors.length]};"></span>
            <span class="text-textSecondary truncate">${name}</span>
            <span class="text-white font-bold ml-auto">${pct}%</span>
          </div>
        `;
      }).join('');
    }
  },

  renderBar(weeklyVolumeMap) {
    const ctx = document.getElementById('weeklyVolumeBarCanvas');
    if (!ctx) return;

    if (barChartInstance) {
      barChartInstance.destroy();
      barChartInstance = null;
    }

    let labels = Object.keys(weeklyVolumeMap);
    let data = Object.values(weeklyVolumeMap);

    if (labels.length > 5) {
      labels = labels.slice(-5);
      data = data.slice(-5);
    }

    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Volume (kg)',
          data: data,
          backgroundColor: '#ffffff',
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1f23',
            titleColor: '#ffffff',
            bodyColor: '#9ca3af',
            borderColor: '#2a2b30',
            borderWidth: 1,
            padding: 8,
            callbacks: {
              label: (c) => c.parsed.y.toLocaleString() + ' kg'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: {
              color: '#9ca3af',
              font: { size: 9, family: 'Inter' },
              callback: (val) => val >= 1000 ? (val / 1000).toFixed(0) + 't' : val
            }
          }
        }
      }
    });
  },

  renderTopExercises(exerciseVolumeMap) {
    const list = document.getElementById('analyticsTopExList');
    if (!list) return;

    const sorted = Object.entries(exerciseVolumeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (sorted.length === 0) {
      list.innerHTML = `<div class="text-textSecondary text-xs">No exercise workload logged yet.</div>`;
      return;
    }

    const maxVol = sorted[0][1] || 1;
    list.innerHTML = sorted.map((item, idx) => {
      const name = item[0];
      const vol = item[1];
      const pct = Math.round((vol / maxVol) * 100);
      return `
        <div class="space-y-1">
          <div class="flex justify-between items-center text-[11px]">
            <span class="text-white font-medium">${idx + 1}. ${name}</span>
            <span class="text-white font-bold">${vol.toLocaleString()} kg</span>
          </div>
          <div class="w-full bg-[#1e1f23] h-1.5 rounded-full overflow-hidden">
            <div class="bg-white h-full rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
};
