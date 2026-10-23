import { storage } from '../services/storage.js';
import { native } from '../services/native.js';

export const savedWorkoutsView = {
  activeFilter: 'All',
  searchQuery: '',

  render() {
    const history = storage.getWorkouts();
    const stats = this.calculateStats(history);

    return `
      <div class="px-5 pt-safe pb-32 space-y-5 w-full max-w-lg mx-auto">
        <!-- Header -->
        <header class="flex justify-between items-center pt-2 pb-3">
          <button id="btnSavedBack" class="w-10 h-10 bg-card rounded-full flex justify-center items-center hover:bg-cardHover transition-colors border border-gray-800/80 active:scale-95" title="Back">
            <i class="ph ph-caret-left text-xl text-white"></i>
          </button>
          <div class="text-center">
            <h1 class="text-lg font-bold text-white tracking-tight">Saved Workouts</h1>
            <p id="savedTotalCountLabel" class="text-[11px] text-textSecondary">${history.length} workouts recorded</p>
          </div>
          <button id="btnSavedLogNew" class="w-10 h-10 bg-white text-black rounded-full flex justify-center items-center hover:bg-gray-200 transition-colors shadow-sm active:scale-95" title="Log New Workout">
            <i class="ph ph-plus font-extrabold text-base"></i>
          </button>
        </header>

        <!-- Performance Summary Card -->
        <div class="bg-card rounded-3xl p-4 border border-gray-800/70 shadow-lg space-y-3">
          <div class="flex items-center justify-between text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            <span>Performance Summary</span>
            <i class="ph ph-chart-line-up text-white text-base"></i>
          </div>
          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="bg-[#15161a] rounded-2xl p-2.5 border border-gray-800/60">
              <div id="statTotalWorkouts" class="font-extrabold text-lg text-white">${stats.sessions}</div>
              <div class="text-[10px] text-textSecondary mt-0.5">Sessions</div>
            </div>
            <div class="bg-[#15161a] rounded-2xl p-2.5 border border-gray-800/60">
              <div id="statTotalDuration" class="font-extrabold text-lg text-white">${stats.duration}</div>
              <div class="text-[10px] text-textSecondary mt-0.5">Total Time</div>
            </div>
            <div class="bg-[#15161a] rounded-2xl p-2.5 border border-gray-800/60">
              <div id="statTotalRest" class="font-extrabold text-lg text-white">${stats.rest}</div>
              <div class="text-[10px] text-textSecondary mt-0.5">Rest Time</div>
            </div>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="space-y-2.5">
          <div class="relative">
            <i class="ph ph-magnifying-glass absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"></i>
            <input id="savedWorkoutSearchInput" type="text" placeholder="Search workouts or routines..." class="w-full bg-card border border-gray-800/80 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-gray-600 transition-colors" value="${this.searchQuery}">
          </div>

          <div id="savedRoutineFilterPills" class="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <!-- Filter pills -->
          </div>
        </div>

        <!-- Workout Cards List -->
        <div class="space-y-3">
          <div class="flex justify-between items-center px-0.5">
            <h2 class="font-bold text-xs text-textSecondary uppercase tracking-wider">Workout History</h2>
            <span id="savedFilteredBadge" class="text-[11px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-medium">0 items</span>
          </div>

          <div id="savedWorkoutsListContainer" class="space-y-3">
            <!-- Cards rendered here -->
          </div>
        </div>

        <!-- MODAL: Workout Details View -->
        <div id="savedWorkoutDetailModal" style="display: none;" class="fixed inset-0 z-[999] justify-center items-center p-5">
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="backdropWorkoutDetail"></div>
          <div class="bg-card w-full max-w-sm max-h-[85vh] flex flex-col rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 no-scrollbar overflow-hidden">
            <!-- Header -->
            <div class="flex justify-between items-start pb-3 border-b border-gray-800/80 mb-3">
              <div>
                <h3 id="modalDetailTitle" class="text-base font-bold text-white">Workout Details</h3>
                <p id="modalDetailDate" class="text-xs text-textSecondary mt-0.5"></p>
              </div>
              <button id="btnCloseWorkoutDetailModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                <i class="ph ph-x"></i>
              </button>
            </div>

            <!-- Stats badges -->
            <div class="flex flex-wrap gap-1.5 mb-3 text-xs">
              <span id="modalDetailRoutine" class="flex items-center space-x-1 text-white bg-[#15161a] border border-gray-800 px-2.5 py-1 rounded-lg">
                <i class="ph ph-lightning text-amber-400"></i>
                <span id="modalDetailRoutineText">Routine</span>
              </span>
              <span class="flex items-center space-x-1 text-gray-300 bg-[#15161a] border border-gray-800 px-2.5 py-1 rounded-lg">
                <i class="ph ph-timer text-blue-400"></i>
                <span id="modalDetailDurationText">30 min</span>
              </span>
              <span class="flex items-center space-x-1 text-amber-300 bg-[#15161a] border border-gray-800 px-2.5 py-1 rounded-lg">
                <i class="ph-fill ph-hourglass-simple text-amber-400"></i>
                <span>Rest: <span id="modalDetailRestText">8 min</span></span>
              </span>
              <span id="modalDetailVolume" class="flex items-center space-x-1 text-gray-300 bg-[#15161a] border border-gray-800 px-2.5 py-1 rounded-lg">
                <i class="ph ph-barbell text-gray-400"></i>
                <span id="modalDetailVolumeText">0 exercises</span>
              </span>
            </div>

            <!-- Scrollable exercises list -->
            <div class="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5" id="modalDetailExercisesContainer">
              <!-- Rendered dynamically -->
            </div>

            <!-- Notes if any -->
            <div id="modalDetailNotesBox" class="mt-3 bg-[#15161a] rounded-2xl p-3 border border-gray-800/80 hidden">
              <div class="text-[10px] uppercase font-bold text-textSecondary mb-1">Notes</div>
              <p id="modalDetailNotesText" class="text-xs text-gray-300 whitespace-pre-wrap"></p>
            </div>

            <!-- Action buttons -->
            <div class="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-gray-800/80">
              <button id="btnModalRepeatWorkout" class="bg-white text-black font-bold rounded-xl py-2.5 text-xs hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1.5 shadow-sm active:scale-95">
                <i class="ph ph-arrow-clockwise font-bold"></i>
                <span>Repeat Workout</span>
              </button>
              <button id="btnModalDeleteWorkout" class="bg-card hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 text-gray-400 hover:text-red-400 font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center space-x-1.5 active:scale-95">
                <i class="ph ph-trash"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  calculateStats(history) {
    let totalDurSeconds = 0;
    let totalRestSeconds = 0;

    history.forEach(item => {
      let dSec = item.durationSeconds;
      if (!dSec && item.duration) {
        const match = item.duration.match(/(\d+)\s*min/);
        if (match) dSec = parseInt(match[1], 10) * 60;
      }
      totalDurSeconds += (dSec || 1800);

      let rSec = item.restDurationSeconds;
      if (!rSec && item.restDuration) {
        const rMatch = item.restDuration.match(/(\d+)\s*min/);
        if (rMatch) rSec = parseInt(rMatch[1], 10) * 60;
      }
      totalRestSeconds += (rSec || Math.round((dSec || 1800) * 0.25));
    });

    const dH = Math.floor(totalDurSeconds / 3600);
    const dM = Math.floor((totalDurSeconds % 3600) / 60);

    const rH = Math.floor(totalRestSeconds / 3600);
    const rM = Math.floor((totalRestSeconds % 3600) / 60);

    return {
      sessions: history.length,
      duration: `${dH}h ${dM}m`,
      rest: `${rH}h ${rM}m`
    };
  },

  mount(router) {
    const btnBack = document.getElementById('btnSavedBack');
    if (btnBack) {
      btnBack.onclick = () => {
        native.hapticLight();
        router.navigate('dashboard');
      };
    }

    const btnLogNew = document.getElementById('btnSavedLogNew');
    if (btnLogNew) {
      btnLogNew.onclick = () => {
        native.hapticLight();
        router.navigate('log');
      };
    }

    const searchInput = document.getElementById('savedWorkoutSearchInput');
    if (searchInput) {
      searchInput.oninput = () => {
        this.searchQuery = searchInput.value.toLowerCase().trim();
        this.renderWorkoutsList(router);
      };
    }

    this.renderFilterPills(router);
    this.renderWorkoutsList(router);

    // Modal listeners
    const modal = document.getElementById('savedWorkoutDetailModal');
    const backdrop = document.getElementById('backdropWorkoutDetail');
    const closeBtn = document.getElementById('btnCloseWorkoutDetailModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
  },

  renderFilterPills(router) {
    const container = document.getElementById('savedRoutineFilterPills');
    if (!container) return;

    const routines = ['All', ...storage.getRoutines()];
    container.innerHTML = routines.map(r => `
      <button class="btn-filter-pill px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${this.activeFilter === r ? 'bg-white text-black shadow-sm' : 'bg-card text-textSecondary hover:text-white border border-gray-800'}" data-routine="${r}">
        ${r}
      </button>
    `).join('');

    container.onclick = (e) => {
      const btn = e.target.closest('.btn-filter-pill');
      if (btn) {
        native.hapticLight();
        this.activeFilter = btn.dataset.routine;
        this.renderFilterPills(router);
        this.renderWorkoutsList(router);
      }
    };
  },

  renderWorkoutsList(router) {
    const history = storage.getWorkouts();
    const container = document.getElementById('savedWorkoutsListContainer');
    const badge = document.getElementById('savedFilteredBadge');
    if (!container) return;

    let filtered = history.map((item, originalIndex) => ({ ...item, originalIndex }));

    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(item => (item.routine || '').toLowerCase() === this.activeFilter.toLowerCase());
    }

    if (this.searchQuery) {
      filtered = filtered.filter(item => 
        (item.title || '').toLowerCase().includes(this.searchQuery) ||
        (item.routine || '').toLowerCase().includes(this.searchQuery) ||
        (item.notes || '').toLowerCase().includes(this.searchQuery) ||
        (item.exercises || []).some(ex => (ex.name || '').toLowerCase().includes(this.searchQuery))
      );
    }

    if (badge) badge.textContent = `${filtered.length} workout${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-card/40 rounded-3xl p-8 text-center text-textSecondary space-y-3 border border-dashed border-gray-800">
          <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-white text-xl">
            <i class="ph ph-barbell"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-white">No workouts found</p>
            <p class="text-xs text-textSecondary mt-1">${history.length === 0 ? "You haven't recorded any workouts yet." : "No matches for your current filter or search."}</p>
          </div>
          <button id="btnQuickLogFromEmpty" class="text-xs font-bold text-black bg-white hover:bg-gray-200 px-4 py-2 rounded-xl transition-all shadow-sm">
            + Log New Workout
          </button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnQuickLogFromEmpty');
      if (emptyBtn) emptyBtn.onclick = () => router.navigate('log');
      return;
    }

    container.innerHTML = filtered.map(item => {
      const idx = item.originalIndex;
      const dateObj = new Date(item.date || item.timestamp);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const exCount = (item.exercises || []).length;
      let totalSets = 0;
      (item.exercises || []).forEach(ex => { totalSets += (ex.sets || []).length; });

      return `
        <div class="workout-card bg-card border border-gray-800/80 hover:border-gray-600 rounded-3xl p-4 flex flex-col space-y-3 cursor-pointer transition-all active:scale-[0.99] shadow-md" data-index="${idx}">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-bold text-sm text-white">${item.title}</h3>
                <span class="text-[10px] bg-white/10 text-gray-200 px-2 py-0.5 rounded-full font-bold">${item.routine || 'Workout'}</span>
              </div>
              <p class="text-[11px] text-textSecondary mt-0.5">
                <i class="ph ph-calendar text-xs mr-0.5"></i>${dateStr} at ${timeStr}
              </p>
            </div>
            <div class="flex items-center space-x-1" onclick="event.stopPropagation()">
              <button class="btn-repeat-card p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors" data-index="${idx}" title="Log again">
                <i class="ph ph-arrow-clockwise text-base"></i>
              </button>
              <button class="btn-delete-card p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors" data-index="${idx}" title="Delete">
                <i class="ph ph-trash text-base"></i>
              </button>
            </div>
          </div>

          <!-- Stats Strip -->
          <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span class="flex items-center space-x-1 bg-[#15161a] border border-gray-800 px-2 py-0.5 rounded-lg text-white">
              <i class="ph ph-timer text-xs text-blue-400"></i>
              <span>${item.duration || '30 min'}</span>
            </span>
            <span class="flex items-center space-x-1 bg-[#15161a] border border-gray-800 px-2 py-0.5 rounded-lg text-white">
              <i class="ph-fill ph-hourglass-simple text-xs text-amber-400"></i>
              <span>Rest: ${item.restDuration || '8 min'}</span>
            </span>
            <span class="flex items-center space-x-1 bg-[#15161a] border border-gray-800 px-2 py-0.5 rounded-lg text-white">
              <i class="ph ph-barbell text-xs text-gray-400"></i>
              <span>${exCount} exercises • ${totalSets} sets</span>
            </span>
          </div>

          <!-- Exercise preview tags -->
          ${exCount > 0 ? `
            <div class="flex flex-wrap gap-1 pt-0.5 border-t border-gray-800/60">
              ${(item.exercises || []).slice(0, 3).map(ex => `
                <span class="text-[10px] bg-[#15161a] text-textSecondary px-2 py-0.5 rounded border border-gray-800">${ex.name} (${(ex.sets || []).length}s)</span>
              `).join('')}
              ${exCount > 3 ? `<span class="text-[10px] text-textSecondary px-1 py-0.5">+${exCount - 3} more</span>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.onclick = (e) => {
      const repeatBtn = e.target.closest('.btn-repeat-card');
      if (repeatBtn) {
        e.stopPropagation();
        const idx = parseInt(repeatBtn.dataset.index, 10);
        this.repeatWorkout(idx, router);
        return;
      }

      const delBtn = e.target.closest('.btn-delete-card');
      if (delBtn) {
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.index, 10);
        storage.deleteWorkout(idx);
        native.hapticLight();
        this.renderWorkoutsList(router);
        router.showToast('Workout deleted');
        return;
      }

      const card = e.target.closest('.workout-card');
      if (card) {
        const idx = parseInt(card.dataset.index, 10);
        this.openWorkoutDetail(idx, router);
      }
    };
  },

  openWorkoutDetail(index, router) {
    const history = storage.getWorkouts();
    const log = history[index];
    if (!log) return;

    native.hapticLight();
    const modal = document.getElementById('savedWorkoutDetailModal');
    document.getElementById('modalDetailTitle').textContent = log.title;

    const dateObj = new Date(log.date || log.timestamp);
    document.getElementById('modalDetailDate').textContent = dateObj.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    document.getElementById('modalDetailRoutineText').textContent = log.routine || 'Workout';
    document.getElementById('modalDetailDurationText').textContent = log.duration || '30 min';
    document.getElementById('modalDetailRestText').textContent = log.restDuration || '8 min';

    let totalSets = 0;
    (log.exercises || []).forEach(ex => { totalSets += (ex.sets || []).length; });
    document.getElementById('modalDetailVolumeText').textContent = `${(log.exercises || []).length} exercises • ${totalSets} sets`;

    // Exercises
    const exContainer = document.getElementById('modalDetailExercisesContainer');
    exContainer.innerHTML = (log.exercises || []).map(ex => {
      const isWeighted = ex.category === 'weighted';
      const isBW = ex.category === 'bodyweight';
      const catBadge = isWeighted ? '<span class="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">Weighted</span>' :
                      (isBW ? '<span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Bodyweight</span>' : 
                      '<span class="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">Mix</span>');

      return `
        <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3">
          <div class="flex justify-between items-center mb-1.5">
            <span class="font-bold text-xs text-white">${ex.name}</span>
            ${catBadge}
          </div>
          <div class="text-[11px] text-textSecondary flex flex-wrap gap-1.5">
            ${(ex.sets || []).map((s, sIdx) => {
              let wText = s.weight;
              if (isBW) wText = 'BW';
              else if (ex.category === 'mix') wText = `BW ${s.weight}kg`;
              else wText = `${s.weight}kg`;
              return `<span class="bg-card px-2 py-0.5 rounded text-gray-300 font-medium">Set ${sIdx + 1}: <strong class="text-white">${wText} × ${s.reps}</strong></span>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Notes
    const notesBox = document.getElementById('modalDetailNotesBox');
    const notesText = document.getElementById('modalDetailNotesText');
    if (log.notes) {
      notesText.textContent = log.notes;
      notesBox.classList.remove('hidden');
    } else {
      notesBox.classList.add('hidden');
    }

    // Buttons
    document.getElementById('btnModalRepeatWorkout').onclick = () => {
      modal.style.display = 'none';
      this.repeatWorkout(index, router);
    };

    document.getElementById('btnModalDeleteWorkout').onclick = () => {
      modal.style.display = 'none';
      storage.deleteWorkout(index);
      native.hapticLight();
      this.renderWorkoutsList(router);
      router.showToast('Workout deleted');
    };

    modal.style.display = 'flex';
  },

  repeatWorkout(index, router) {
    const history = storage.getWorkouts();
    const log = history[index];
    if (!log) return;

    const tpl = {
      title: log.title,
      routine: log.routine,
      exercises: log.exercises,
      notes: log.notes
    };

    router.loadWorkoutTemplate(tpl);
    router.navigate('log');
  }
};
