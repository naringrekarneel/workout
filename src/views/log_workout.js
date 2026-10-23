import { storage } from '../services/storage.js';
import { native } from '../services/native.js';

class LogWorkoutController {
  constructor() {
    this.currentCategoryFilter = 'all';
    this.selectedRoutine = 'Chest + Tricep';
    this.exercises = [
      {
        name: 'Barbell Bench Press',
        category: 'weighted',
        sets: [
          { weight: '80', reps: '10' },
          { weight: '85', reps: '8' },
          { weight: '90', reps: '6' }
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        category: 'weighted',
        sets: [
          { weight: '30', reps: '12' },
          { weight: '32.5', reps: '10' }
        ]
      },
      {
        name: 'Dips',
        category: 'bodyweight',
        sets: [
          { weight: 'BW', reps: '15' },
          { weight: 'BW', reps: '12' }
        ]
      }
    ];

    // Elapsed timer
    this.elapsedSeconds = 0;
    this.isElapsedRunning = true;
    this.elapsedInterval = null;

    // Rest timer
    this.restSeconds = 0;
    this.totalRestSeconds = 0;
    this.isRestRunning = false;
    this.restInterval = null;
    this.isCountdown = false;

    // Modal state
    this.currentTargetExerciseIndex = -1;
    this.currentEditingSetIndex = -1;
    this.pendingExerciseCategory = 'weighted';

    this.startElapsedTimer();
  }

  startElapsedTimer() {
    if (this.elapsedInterval) clearInterval(this.elapsedInterval);
    this.elapsedInterval = setInterval(() => {
      if (this.isElapsedRunning) {
        this.elapsedSeconds++;
        this.updateElapsedDisplay();
      }
    }, 1000);
  }

  updateElapsedDisplay() {
    const el = document.getElementById('elapsedTimerDisplay');
    if (!el) return;
    const m = Math.floor(this.elapsedSeconds / 60);
    const s = this.elapsedSeconds % 60;
    const h = Math.floor(m / 60);
    if (h > 0) {
      el.textContent = `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
      el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  toggleElapsedTimer() {
    this.isElapsedRunning = !this.isElapsedRunning;
    native.hapticLight();
    const icon = document.getElementById('elapsedPlayIcon');
    const txt = document.getElementById('elapsedPlayText');
    if (icon && txt) {
      if (this.isElapsedRunning) {
        icon.className = 'ph-fill ph-pause';
        txt.textContent = 'Pause';
      } else {
        icon.className = 'ph-fill ph-play';
        txt.textContent = 'Resume';
      }
    }
  }

  resetElapsedTimer() {
    native.hapticLight();
    this.elapsedSeconds = 0;
    this.updateElapsedDisplay();
  }

  updateRestDisplay() {
    const el = document.getElementById('restTimerDisplay');
    if (!el) return;
    const m = Math.floor(this.restSeconds / 60);
    const s = this.restSeconds % 60;
    el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  toggleRestTimer(router) {
    this.isRestRunning = !this.isRestRunning;
    native.hapticLight();
    const icon = document.getElementById('restPlayIcon');
    const txt = document.getElementById('restPlayText');

    if (this.isRestRunning) {
      if (icon && txt) {
        icon.className = 'ph-fill ph-pause';
        txt.textContent = 'Pause';
      }
      if (this.restInterval) clearInterval(this.restInterval);
      this.restInterval = setInterval(() => {
        if (!this.isRestRunning) return;
        this.totalRestSeconds++;
        if (this.isCountdown) {
          if (this.restSeconds > 0) {
            this.restSeconds--;
            this.updateRestDisplay();
            if (this.restSeconds === 0) {
              this.isRestRunning = false;
              clearInterval(this.restInterval);
              native.playTimerChime();
              native.hapticWarning();
              if (router) router.showToast('Rest time is up! Ready for next set 💪');
              if (icon && txt) {
                icon.className = 'ph-fill ph-play';
                txt.textContent = 'Start';
              }
            }
          }
        } else {
          this.restSeconds++;
          this.updateRestDisplay();
        }
      }, 1000);
    } else {
      if (icon && txt) {
        icon.className = 'ph-fill ph-play';
        txt.textContent = 'Resume';
      }
      if (this.restInterval) clearInterval(this.restInterval);
    }
  }

  resetRestTimer() {
    native.hapticLight();
    this.isRestRunning = false;
    this.isCountdown = false;
    if (this.restInterval) clearInterval(this.restInterval);
    this.restSeconds = 0;
    this.updateRestDisplay();
    const icon = document.getElementById('restPlayIcon');
    const txt = document.getElementById('restPlayText');
    if (icon && txt) {
      icon.className = 'ph-fill ph-play';
      txt.textContent = 'Start';
    }
  }

  startRestCountdown(seconds, router) {
    native.hapticMedium();
    this.restSeconds = seconds;
    this.isCountdown = true;
    this.isRestRunning = true;
    this.updateRestDisplay();

    const icon = document.getElementById('restPlayIcon');
    const txt = document.getElementById('restPlayText');
    if (icon && txt) {
      icon.className = 'ph-fill ph-pause';
      txt.textContent = 'Pause';
    }

    if (this.restInterval) clearInterval(this.restInterval);
    this.restInterval = setInterval(() => {
      if (!this.isRestRunning) return;
      this.totalRestSeconds++;
      if (this.restSeconds > 0) {
        this.restSeconds--;
        this.updateRestDisplay();
        if (this.restSeconds === 0) {
          this.isRestRunning = false;
          clearInterval(this.restInterval);
          native.playTimerChime();
          native.hapticWarning();
          if (router) router.showToast('Rest time is up! Ready for next set 💪');
          if (icon && txt) {
            icon.className = 'ph-fill ph-play';
            txt.textContent = 'Start';
          }
        }
      }
    }, 1000);
  }

  render() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const initialIso = now.toISOString().slice(0, 16);

    return `
      <div class="px-5 pt-safe pb-32 space-y-5 w-full max-w-lg mx-auto">
        <!-- Header -->
        <header class="flex justify-between items-center pt-2 pb-3">
          <button id="btnLogBack" class="w-10 h-10 bg-card rounded-full flex justify-center items-center hover:bg-cardHover transition-colors border border-gray-800/80 active:scale-95" title="Back">
            <i class="ph ph-caret-left text-xl text-white"></i>
          </button>
          <h1 class="text-xl font-bold tracking-tight text-white">Log Workout</h1>
          <button id="btnCopyWorkoutModalTrigger" class="w-10 h-10 bg-card rounded-full flex justify-center items-center text-white hover:bg-cardHover transition-colors border border-gray-800/80 active:scale-95" title="Templates / Copy">
            <i class="ph ph-copy text-xl"></i>
          </button>
        </header>

        <!-- Routine Split Selector -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-[11px] text-textSecondary uppercase tracking-wider font-bold">Routine Split</label>
            <button id="btnEditRoutinesTrigger" class="text-xs text-gray-400 hover:text-white flex items-center space-x-1 px-2 py-1 rounded-lg bg-card/60 border border-gray-800/80">
              <i class="ph ph-pencil-simple text-xs"></i>
              <span>Edit Splits</span>
            </button>
          </div>
          <div id="routinePillsContainer" class="flex flex-wrap gap-2 pt-0.5">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Live Workout Timer & Rest Stopwatch Card -->
        <div class="bg-card rounded-3xl p-5 space-y-4 border border-gray-800/60 shadow-xl">
          <!-- Title & Date -->
          <div class="flex justify-between items-center pb-3 border-b border-gray-800/70">
            <div class="flex-1 mr-2">
              <input id="workoutTitleInput" type="text" value="${this.selectedRoutine} Session" class="w-full bg-transparent font-bold text-base text-white focus:outline-none placeholder-gray-600">
              <div class="flex items-center space-x-2 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[11px] text-textSecondary">Session in progress</span>
              </div>
            </div>
            <div class="relative">
              <input id="workoutDateInput" type="datetime-local" value="${initialIso}" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10">
              <div class="text-[11px] font-semibold text-white flex items-center space-x-1 pointer-events-none bg-[#15161a] px-2.5 py-1 rounded-lg border border-gray-800">
                <i class="ph ph-calendar text-textSecondary text-xs"></i>
                <span id="workoutDateDisplay">Today</span>
              </div>
            </div>
          </div>

          <!-- Middle Row: Elapsed Workout Timer & Rest Stopwatch -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Elapsed Timer -->
            <div class="bg-[#15161a] rounded-2xl p-3 flex flex-col justify-between border border-gray-800/60">
              <div class="flex justify-between items-center mb-0.5">
                <span class="text-[10px] uppercase font-bold text-textSecondary tracking-wider">Elapsed</span>
                <i class="ph-fill ph-timer text-blue-400 text-sm"></i>
              </div>
              <div id="elapsedTimerDisplay" class="text-2xl font-extrabold font-mono tracking-tight text-white my-1">00:00</div>
              <div class="flex space-x-1 pt-1">
                <button id="btnToggleElapsed" class="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center space-x-1 active:scale-95">
                  <i id="elapsedPlayIcon" class="ph-fill ${this.isElapsedRunning ? 'ph-pause' : 'ph-play'}"></i>
                  <span id="elapsedPlayText">${this.isElapsedRunning ? 'Pause' : 'Resume'}</span>
                </button>
                <button id="btnResetElapsed" class="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] transition-colors active:scale-95" title="Reset">
                  <i class="ph ph-arrow-counter-clockwise"></i>
                </button>
              </div>
            </div>

            <!-- Rest Stopwatch -->
            <div class="bg-[#15161a] rounded-2xl p-3 flex flex-col justify-between border border-gray-800/60">
              <div class="flex justify-between items-center mb-0.5">
                <span class="text-[10px] uppercase font-bold text-textSecondary tracking-wider">Rest Timer</span>
                <i class="ph-fill ph-hourglass-simple text-amber-400 text-sm"></i>
              </div>
              <div id="restTimerDisplay" class="text-2xl font-extrabold font-mono tracking-tight text-white my-1">00:00</div>
              <div class="flex space-x-1 pt-1">
                <button id="btnToggleRest" class="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center space-x-1 active:scale-95">
                  <i id="restPlayIcon" class="ph-fill ${this.isRestRunning ? 'ph-pause' : 'ph-play'}"></i>
                  <span id="restPlayText">${this.isRestRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button id="btnResetRest" class="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] transition-colors active:scale-95" title="Reset">
                  <i class="ph ph-arrow-counter-clockwise"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Quick Rest Presets -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Quick Rest:</span>
            <div class="flex space-x-1.5">
              <button class="btn-rest-preset px-2.5 py-1 bg-[#15161a] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors active:scale-95" data-sec="30">30s</button>
              <button class="btn-rest-preset px-2.5 py-1 bg-[#15161a] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors active:scale-95" data-sec="60">60s</button>
              <button class="btn-rest-preset px-2.5 py-1 bg-[#15161a] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors active:scale-95" data-sec="90">90s</button>
              <button class="btn-rest-preset px-2.5 py-1 bg-[#15161a] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors active:scale-95" data-sec="120">2m</button>
            </div>
          </div>
        </div>

        <!-- Exercises Section -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-base text-white">Exercises</h3>
            <button id="btnOpenAddExerciseModal" class="text-xs font-bold text-white bg-card hover:bg-cardHover px-3 py-1.5 rounded-full flex items-center space-x-1 border border-gray-800/80 active:scale-95 transition-all">
              <i class="ph ph-plus font-bold"></i>
              <span>Add Exercise</span>
            </button>
          </div>

          <!-- Category Filter Tabs -->
          <div class="bg-card p-1 rounded-2xl flex space-x-1 border border-gray-800/80">
            <button class="category-filter-tab flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all ${this.currentCategoryFilter === 'all' ? 'bg-white text-black shadow-sm' : 'text-textSecondary hover:text-white'}" data-cat="all">All</button>
            <button class="category-filter-tab flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all ${this.currentCategoryFilter === 'weighted' ? 'bg-white text-black shadow-sm' : 'text-textSecondary hover:text-white'}" data-cat="weighted">Weighted</button>
            <button class="category-filter-tab flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all ${this.currentCategoryFilter === 'bodyweight' ? 'bg-white text-black shadow-sm' : 'text-textSecondary hover:text-white'}" data-cat="bodyweight">Bodyweight</button>
            <button class="category-filter-tab flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all ${this.currentCategoryFilter === 'mix' ? 'bg-white text-black shadow-sm' : 'text-textSecondary hover:text-white'}" data-cat="mix">Mix</button>
          </div>

          <!-- Dynamic Exercise Cards List -->
          <div id="exerciseListContainer" class="space-y-3.5">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Workout Notes Section -->
        <div class="bg-card rounded-2xl p-4 flex flex-col space-y-2 border border-gray-800/60 shadow-md">
          <label class="font-medium text-sm text-white flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded-full bg-gray-800 flex justify-center items-center text-white">
              <i class="ph ph-note-pencil text-sm"></i>
            </div>
            <span>Workout Notes</span>
          </label>
          <textarea id="workoutNotesTextarea" class="bg-transparent w-full resize-none focus:outline-none text-xs text-textSecondary pl-9 placeholder-gray-600" rows="2" placeholder="Form cues, pump, energy levels, injuries..."></textarea>
        </div>

        <!-- Floating Bottom Save Button -->
        <div class="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/95 to-transparent z-40 max-w-lg mx-auto">
          <button id="btnSaveWorkoutBottom" class="w-full bg-white text-black font-extrabold rounded-2xl py-3.5 text-sm hover:bg-gray-200 transition-colors shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2">
            <i class="ph ph-check font-extrabold text-base"></i>
            <span>Save Workout Session</span>
          </button>
        </div>

        <!-- MODAL: Add / Edit Set Prompt -->
        <div id="addSetModal" style="display: none;" class="fixed inset-0 z-[999] justify-center items-center p-6">
          <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" id="backdropAddSet"></div>
          <div class="bg-card w-full max-w-sm rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 space-y-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 id="addSetModalTitle" class="text-base font-bold text-white">Add Set</h3>
                <p id="addSetModalSubtitle" class="text-xs text-textSecondary mt-0.5">Enter weight and reps</p>
              </div>
              <button id="btnCloseAddSetModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                <i class="ph ph-x"></i>
              </button>
            </div>

            <form id="formAddSet" class="space-y-3">
              <div id="groupSetWeight" class="space-y-1">
                <label id="labelSetWeight" class="text-[11px] text-textSecondary font-bold uppercase tracking-wider block">Weight (kg)</label>
                <div class="flex items-center bg-[#15161a] border border-gray-700 focus-within:border-white rounded-2xl px-4 py-2.5">
                  <span id="prefixSetWeight" class="text-textSecondary font-bold text-base mr-1 hidden">+</span>
                  <input id="inputSetWeight" type="number" step="0.5" min="0" class="w-full bg-transparent text-white font-bold text-base focus:outline-none" placeholder="0">
                  <span class="text-xs text-textSecondary font-semibold">kg</span>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[11px] text-textSecondary font-bold uppercase tracking-wider block">Reps</label>
                <div class="flex items-center bg-[#15161a] border border-gray-700 focus-within:border-white rounded-2xl px-4 py-2.5">
                  <input id="inputSetReps" type="number" step="1" min="1" class="w-full bg-transparent text-white font-bold text-base focus:outline-none" placeholder="10">
                  <span class="text-xs text-textSecondary font-semibold">reps</span>
                </div>
              </div>

              <div class="pt-2">
                <button type="submit" class="w-full bg-white text-black font-bold rounded-2xl py-3 text-sm hover:bg-gray-200 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center space-x-1.5">
                  <i class="ph ph-check font-bold"></i>
                  <span id="btnSetSubmitText">Log Set</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- MODAL: Exercise Type & Name (2-Step) -->
        <div id="exerciseTypeModal" style="display: none;" class="fixed inset-0 z-[999] justify-center items-center p-6">
          <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" id="backdropExerciseType"></div>
          <div class="bg-card w-full max-w-sm rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 space-y-4">
            
            <!-- STEP 1: Select Type -->
            <div id="exerciseTypeStep1" class="space-y-3.5">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-bold text-white">Add Exercise</h3>
                  <p class="text-xs text-textSecondary">Select training category</p>
                </div>
                <button id="btnCloseExerciseModal1" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                  <i class="ph ph-x"></i>
                </button>
              </div>

              <div class="space-y-2 pt-1">
                <button type="button" class="btn-select-ex-type w-full bg-[#15161a] hover:bg-[#1f2026] border border-gray-800 hover:border-blue-500/50 rounded-2xl p-3.5 text-left flex items-center space-x-3 transition-all" data-type="weighted">
                  <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex justify-center items-center">
                    <i class="ph ph-barbell text-xl"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-sm text-white">Weighted</div>
                    <div class="text-[11px] text-textSecondary">Barbell, Dumbbells, Machines</div>
                  </div>
                  <i class="ph ph-caret-right text-gray-500"></i>
                </button>

                <button type="button" class="btn-select-ex-type w-full bg-[#15161a] hover:bg-[#1f2026] border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-3.5 text-left flex items-center space-x-3 transition-all" data-type="bodyweight">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex justify-center items-center">
                    <i class="ph ph-person-simple-walk text-xl"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-sm text-white">Bodyweight</div>
                    <div class="text-[11px] text-textSecondary">Push-ups, Pull-ups, Dips, Core</div>
                  </div>
                  <i class="ph ph-caret-right text-gray-500"></i>
                </button>

                <button type="button" class="btn-select-ex-type w-full bg-[#15161a] hover:bg-[#1f2026] border border-gray-800 hover:border-purple-500/50 rounded-2xl p-3.5 text-left flex items-center space-x-3 transition-all" data-type="mix">
                  <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex justify-center items-center">
                    <i class="ph ph-lightning text-xl"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-sm text-white">Mix (Weighted Calisthenics)</div>
                    <div class="text-[11px] text-textSecondary">Bodyweight + added weight (+kg)</div>
                  </div>
                  <i class="ph ph-caret-right text-gray-500"></i>
                </button>
              </div>
            </div>

            <!-- STEP 2: Name Input -->
            <div id="exerciseTypeStep2" style="display: none;" class="space-y-3.5">
              <div class="flex justify-between items-center">
                <button type="button" id="btnBackToExStep1" class="flex items-center space-x-1 text-xs text-textSecondary hover:text-white">
                  <i class="ph ph-arrow-left"></i>
                  <span>Back</span>
                </button>
                <button id="btnCloseExerciseModal2" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                  <i class="ph ph-x"></i>
                </button>
              </div>

              <div>
                <div class="flex items-center space-x-2 mb-0.5">
                  <h3 class="text-base font-bold text-white">Exercise Name</h3>
                  <span id="badgeSelectedExCat" class="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-medium"></span>
                </div>
                <p class="text-xs text-textSecondary">Enter exercise name or tap a suggestion</p>
              </div>

              <form id="formAddExName" class="space-y-3">
                <input id="inputExNameModal" type="text" class="w-full bg-[#15161a] border border-gray-700 focus:border-white rounded-2xl px-4 py-3 text-sm text-white focus:outline-none" placeholder="e.g. Overhead Press" autocomplete="off">
                
                <!-- Suggestions -->
                <div id="exSuggestionsContainer" class="flex flex-wrap gap-1.5 pt-1">
                  <!-- Populated dynamically -->
                </div>

                <div class="pt-2">
                  <button type="submit" class="w-full bg-white text-black font-bold rounded-2xl py-3 text-sm hover:bg-gray-200 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center space-x-1.5">
                    <i class="ph ph-plus font-bold"></i>
                    <span>Confirm & Add</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

        <!-- MODAL: Routines Split Editor -->
        <div id="routineEditorModal" style="display: none;" class="fixed inset-0 z-[999] justify-center items-center p-6">
          <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" id="backdropRoutineEditor"></div>
          <div class="bg-card w-full max-w-sm rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-base font-bold text-white">Edit Routines</h3>
                <p class="text-xs text-textSecondary">Customize training splits</p>
              </div>
              <button id="btnCloseRoutineModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                <i class="ph ph-x"></i>
              </button>
            </div>

            <!-- Add new routine -->
            <div class="flex space-x-2">
              <input id="inputNewRoutineName" type="text" placeholder="New split name..." class="flex-1 bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gray-600">
              <button id="btnAddRoutineBtn" type="button" class="px-3.5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
                + Add
              </button>
            </div>

            <!-- List of routines -->
            <div class="space-y-2 max-h-52 overflow-y-auto no-scrollbar" id="routineEditList">
              <!-- Rendered dynamically -->
            </div>

            <div class="pt-1">
              <button id="btnDoneRoutineModal" type="button" class="w-full bg-[#15161a] hover:bg-gray-800 border border-gray-700 text-white font-bold rounded-xl py-2.5 text-xs transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>

        <!-- MODAL: Copy Workout / Reusable Templates -->
        <div id="copyWorkoutModal" style="display: none;" class="fixed inset-0 z-[999] justify-center items-center p-6">
          <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" id="backdropCopyWorkout"></div>
          <div class="bg-card w-full max-w-sm rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 space-y-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-base font-bold text-white">Workout Templates</h3>
                <p class="text-xs text-textSecondary">Save or reuse workouts</p>
              </div>
              <button id="btnCloseCopyModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                <i class="ph ph-x"></i>
              </button>
            </div>

            <div class="space-y-2">
              <button id="btnSaveAsTemplate" type="button" class="w-full bg-[#15161a] hover:bg-[#1f2026] border border-gray-800 rounded-2xl p-3 text-left flex items-center space-x-3 transition-all active:scale-[0.99]">
                <div class="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex justify-center items-center">
                  <i class="ph ph-bookmarks-simple text-lg"></i>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-xs text-white">Save Current as Template</div>
                  <div class="text-[10px] text-textSecondary">Quick-load this exercise structure</div>
                </div>
                <i class="ph ph-caret-right text-gray-500 text-sm"></i>
              </button>

              <button id="btnCopyTextSummary" type="button" class="w-full bg-[#15161a] hover:bg-[#1f2026] border border-gray-800 rounded-2xl p-3 text-left flex items-center space-x-3 transition-all active:scale-[0.99]">
                <div class="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex justify-center items-center">
                  <i class="ph ph-share-network text-lg"></i>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-xs text-white">Copy Workout Text</div>
                  <div class="text-[10px] text-textSecondary">Summary of exercises, weights & reps</div>
                </div>
                <i class="ph ph-caret-right text-gray-500 text-sm"></i>
              </button>
            </div>

            <!-- Templates List -->
            <div class="space-y-1.5 pt-2 border-t border-gray-800">
              <label class="text-[10px] text-textSecondary uppercase tracking-wider font-bold">Saved Templates</label>
              <div id="savedTemplatesListContainer" class="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                <!-- Dynamically rendered templates -->
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  mount(router) {
    this.updateElapsedDisplay();
    this.updateRestDisplay();
    this.renderRoutinePills();
    this.renderExercises();

    // Date
    const dateInput = document.getElementById('workoutDateInput');
    const dateDisplay = document.getElementById('workoutDateDisplay');
    const updateDate = () => {
      if (!dateInput || !dateDisplay) return;
      const d = new Date(dateInput.value);
      dateDisplay.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };
    updateDate();
    if (dateInput) dateInput.addEventListener('change', updateDate);

    // Timers
    const btnToggleEl = document.getElementById('btnToggleElapsed');
    const btnResetEl = document.getElementById('btnResetElapsed');
    if (btnToggleEl) btnToggleEl.onclick = () => this.toggleElapsedTimer();
    if (btnResetEl) btnResetEl.onclick = () => this.resetElapsedTimer();

    const btnToggleR = document.getElementById('btnToggleRest');
    const btnResetR = document.getElementById('btnResetRest');
    if (btnToggleR) btnToggleR.onclick = () => this.toggleRestTimer(router);
    if (btnResetR) btnResetR.onclick = () => this.resetRestTimer();

    // Quick rest presets
    document.querySelectorAll('.btn-rest-preset').forEach(btn => {
      btn.onclick = () => {
        const sec = parseInt(btn.dataset.sec, 10);
        this.startRestCountdown(sec, router);
      };
    });

    // Category filter tabs
    document.querySelectorAll('.category-filter-tab').forEach(tab => {
      tab.onclick = () => {
        native.hapticLight();
        this.currentCategoryFilter = tab.dataset.cat;
        document.querySelectorAll('.category-filter-tab').forEach(t => {
          t.className = 'category-filter-tab flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all text-textSecondary hover:text-white';
        });
        tab.className = 'category-filter-tab flex-1 py-1.5 text-center rounded-xl text-xs font-bold transition-all bg-white text-black shadow-sm';
        this.renderExercises();
      };
    });

    // Back button
    const btnBack = document.getElementById('btnLogBack');
    if (btnBack) {
      btnBack.onclick = () => {
        native.hapticLight();
        router.navigate('dashboard');
      };
    }

    // Save Workout Button
    const btnSave = document.getElementById('btnSaveWorkoutBottom');
    if (btnSave) {
      btnSave.onclick = async () => {
        if (this.exercises.length === 0) {
          router.showToast('Please add at least one exercise');
          return;
        }

        const titleInput = document.getElementById('workoutTitleInput');
        const notesInput = document.getElementById('workoutNotesTextarea');

        const m = Math.floor(this.elapsedSeconds / 60);
        const s = this.elapsedSeconds % 60;
        const h = Math.floor(m / 60);
        let durationFormatted = h > 0 ? `${h}h ${m % 60}m` : (m > 0 ? `${m} min` : `${s}s`);
        if (this.elapsedSeconds < 10) durationFormatted = '30 min';

        let restFormatted = `${Math.floor(this.totalRestSeconds / 60)} min`;
        if (this.totalRestSeconds === 0) restFormatted = '8 min';

        const workoutData = {
          title: titleInput ? titleInput.value.trim() : this.selectedRoutine,
          routine: this.selectedRoutine,
          date: dateInput ? dateInput.value : new Date().toISOString(),
          duration: durationFormatted,
          durationSeconds: this.elapsedSeconds,
          restDuration: restFormatted,
          restDurationSeconds: this.totalRestSeconds,
          notes: notesInput ? notesInput.value.trim() : '',
          exercises: JSON.parse(JSON.stringify(this.exercises)),
          timestamp: Date.now()
        };

        storage.addWorkout(workoutData);
        await native.hapticSuccess();
        router.showToast('Workout saved successfully! 🎉');
        this.elapsedSeconds = 0;
        this.totalRestSeconds = 0;
        router.navigate('saved');
      };
    }

    // Modal setups
    this.setupExerciseModals(router);
    this.setupRoutineModals(router);
    this.setupCopyModals(router);
  }

  renderRoutinePills() {
    const container = document.getElementById('routinePillsContainer');
    if (!container) return;
    const routines = storage.getRoutines();

    container.innerHTML = routines.map(r => {
      const isActive = r === this.selectedRoutine;
      return `
        <button type="button" class="routine-pill px-3.5 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${isActive ? 'bg-white text-black shadow-md' : 'bg-card text-textSecondary hover:text-white border border-gray-800'}" data-routine="${r}">
          ${r}
        </button>
      `;
    }).join('');

    container.onclick = (e) => {
      const btn = e.target.closest('.routine-pill');
      if (btn) {
        native.hapticLight();
        this.selectedRoutine = btn.dataset.routine;
        const titleInput = document.getElementById('workoutTitleInput');
        if (titleInput) titleInput.value = `${this.selectedRoutine} Session`;
        this.renderRoutinePills();
      }
    };
  }

  renderExercises() {
    const container = document.getElementById('exerciseListContainer');
    if (!container) return;

    let filtered = this.exercises.map((ex, idx) => ({ ...ex, originalIndex: idx }));
    if (this.currentCategoryFilter !== 'all') {
      filtered = filtered.filter(ex => ex.category === this.currentCategoryFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-card/40 rounded-3xl p-7 text-center text-textSecondary space-y-2 border border-dashed border-gray-800">
          <i class="ph ph-barbell text-2xl text-gray-500 mx-auto block"></i>
          <p class="text-xs font-semibold text-white">No ${this.currentCategoryFilter === 'all' ? '' : this.currentCategoryFilter + ' '}exercises added</p>
          <button id="btnQuickAddExEmpty" class="text-xs font-bold text-black bg-white hover:bg-gray-200 px-3.5 py-1.5 rounded-xl transition-all shadow-sm">
            + Add Exercise
          </button>
        </div>
      `;
      const quickAdd = document.getElementById('btnQuickAddExEmpty');
      if (quickAdd) quickAdd.onclick = () => this.openExerciseTypeModal();
      return;
    }

    container.innerHTML = filtered.map(ex => {
      const idx = ex.originalIndex;
      const isWeighted = ex.category === 'weighted';
      const isBW = ex.category === 'bodyweight';
      const isMix = ex.category === 'mix';

      const badgeColor = isWeighted ? 'bg-blue-500/20 text-blue-300' : (isBW ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300');
      const badgeText = isWeighted ? 'Weighted' : (isBW ? 'Bodyweight' : 'Mix (+kg)');

      return `
        <div class="bg-card rounded-2xl p-4 space-y-3 border border-gray-800/70 shadow-md">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center space-x-2 flex-1 min-w-0">
              <input type="text" value="${ex.name}" class="ex-name-input bg-transparent font-bold text-sm text-white focus:outline-none w-full" data-index="${idx}">
              <span class="text-[9px] ${badgeColor} px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0">${badgeText}</span>
            </div>
            <button class="btn-remove-exercise text-gray-500 hover:text-red-400 p-1" data-index="${idx}" title="Delete Exercise">
              <i class="ph ph-trash text-base"></i>
            </button>
          </div>

          <!-- Sets table -->
          <div class="space-y-1.5">
            ${ex.sets.length === 0 ? `
              <div class="py-2.5 text-center text-[11px] text-textSecondary bg-[#15161a] rounded-xl border border-dashed border-gray-800/80">
                No sets logged yet. Tap "+ Add Set" below.
              </div>
            ` : `
              <div class="grid grid-cols-12 text-[10px] text-textSecondary px-2 font-bold uppercase tracking-wider">
                <span class="col-span-3">SET</span>
                <span class="col-span-6">${isBW ? 'REPS (BW)' : (isMix ? 'EXTRA WEIGHT & REPS' : 'WEIGHT & REPS')}</span>
                <span class="col-span-3 text-right">ACTION</span>
              </div>
              ${ex.sets.map((set, sIdx) => {
                let displayVal = '';
                if (isBW) displayVal = `<span class="font-extrabold text-white text-sm">${set.reps}</span> <span class="text-xs text-textSecondary">reps</span>`;
                else if (isMix) displayVal = `<span class="text-xs text-textSecondary font-bold">+</span><span class="font-extrabold text-white text-sm">${(set.weight || '').replace('+','')}</span><span class="text-xs text-textSecondary mr-1.5">kg</span> × <span class="font-extrabold text-white text-sm">${set.reps}</span><span class="text-xs text-textSecondary">r</span>`;
                else displayVal = `<span class="font-extrabold text-white text-sm">${set.weight}</span><span class="text-xs text-textSecondary mr-1.5">kg</span> × <span class="font-extrabold text-white text-sm">${set.reps}</span><span class="text-xs text-textSecondary">r</span>`;

                return `
                  <div class="grid grid-cols-12 items-center bg-[#15161a] rounded-xl px-3 py-2 text-xs text-white">
                    <span class="col-span-3 font-bold text-textSecondary text-[11px]">Set ${sIdx + 1}</span>
                    <div class="col-span-6 flex items-center space-x-1">${displayVal}</div>
                    <div class="col-span-3 flex justify-end items-center space-x-1.5">
                      <button class="btn-edit-set text-gray-400 hover:text-white p-1" data-ex="${idx}" data-set="${sIdx}" title="Edit">
                        <i class="ph ph-pencil-simple text-xs"></i>
                      </button>
                      <button class="btn-remove-set text-gray-500 hover:text-red-400 p-1" data-ex="${idx}" data-set="${sIdx}" title="Delete">
                        <i class="ph ph-x text-xs"></i>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            `}
          </div>

          <button type="button" class="btn-add-set-trigger w-full py-2 bg-[#15161a] hover:bg-gray-800 text-xs font-bold text-gray-300 hover:text-white rounded-xl transition-colors flex justify-center items-center space-x-1 border border-gray-800/60 active:scale-95" data-index="${idx}">
            <i class="ph ph-plus text-xs"></i>
            <span>Add Set</span>
          </button>
        </div>
      `;
    }).join('');

    // Event delegation on exercise list
    container.onclick = (e) => {
      const addSetBtn = e.target.closest('.btn-add-set-trigger');
      if (addSetBtn) {
        native.hapticLight();
        const exIdx = parseInt(addSetBtn.dataset.index, 10);
        this.openAddSetModal(exIdx, -1);
        return;
      }

      const editSetBtn = e.target.closest('.btn-edit-set');
      if (editSetBtn) {
        native.hapticLight();
        const exIdx = parseInt(editSetBtn.dataset.ex, 10);
        const setIdx = parseInt(editSetBtn.dataset.set, 10);
        this.openAddSetModal(exIdx, setIdx);
        return;
      }

      const removeSetBtn = e.target.closest('.btn-remove-set');
      if (removeSetBtn) {
        native.hapticLight();
        const exIdx = parseInt(removeSetBtn.dataset.ex, 10);
        const setIdx = parseInt(removeSetBtn.dataset.set, 10);
        this.exercises[exIdx].sets.splice(setIdx, 1);
        this.renderExercises();
        return;
      }

      const removeExBtn = e.target.closest('.btn-remove-exercise');
      if (removeExBtn) {
        native.hapticLight();
        const exIdx = parseInt(removeExBtn.dataset.index, 10);
        this.exercises.splice(exIdx, 1);
        this.renderExercises();
        return;
      }
    };

    container.onchange = (e) => {
      const nameInput = e.target.closest('.ex-name-input');
      if (nameInput) {
        const exIdx = parseInt(nameInput.dataset.index, 10);
        this.exercises[exIdx].name = nameInput.value.trim();
      }
    };
  }

  openAddSetModal(exIdx, setIdx = -1) {
    this.currentTargetExerciseIndex = exIdx;
    this.currentEditingSetIndex = setIdx;
    const ex = this.exercises[exIdx];
    if (!ex) return;

    const modal = document.getElementById('addSetModal');
    const title = document.getElementById('addSetModalTitle');
    const subtitle = document.getElementById('addSetModalSubtitle');
    const submitText = document.getElementById('btnSetSubmitText');
    const weightGroup = document.getElementById('groupSetWeight');
    const weightPrefix = document.getElementById('prefixSetWeight');
    const weightInput = document.getElementById('inputSetWeight');
    const repsInput = document.getElementById('inputSetReps');

    const setNum = setIdx >= 0 ? setIdx + 1 : ex.sets.length + 1;
    title.textContent = setIdx >= 0 ? `Edit Set ${setNum}` : `Add Set ${setNum}`;
    subtitle.textContent = `${ex.name} (${ex.category})`;
    submitText.textContent = setIdx >= 0 ? 'Save Changes' : 'Log Set';

    const isBW = ex.category === 'bodyweight';
    const isMix = ex.category === 'mix';

    if (isBW) {
      weightGroup.style.display = 'none';
      weightPrefix.classList.add('hidden');
      repsInput.value = setIdx >= 0 ? ex.sets[setIdx].reps : (ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].reps : '12');
      setTimeout(() => repsInput.focus(), 60);
    } else if (isMix) {
      weightGroup.style.display = 'block';
      weightPrefix.classList.remove('hidden');
      weightInput.value = setIdx >= 0 ? (ex.sets[setIdx].weight || '').replace('+', '') : (ex.sets.length > 0 ? (ex.sets[ex.sets.length - 1].weight || '').replace('+', '') : '10');
      repsInput.value = setIdx >= 0 ? ex.sets[setIdx].reps : (ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].reps : '8');
      setTimeout(() => weightInput.focus(), 60);
    } else {
      weightGroup.style.display = 'block';
      weightPrefix.classList.add('hidden');
      weightInput.value = setIdx >= 0 ? ex.sets[setIdx].weight : (ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].weight : '60');
      repsInput.value = setIdx >= 0 ? ex.sets[setIdx].reps : (ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].reps : '10');
      setTimeout(() => weightInput.focus(), 60);
    }

    modal.style.display = 'flex';
  }

  setupExerciseModals(router) {
    // Add set form
    const formSet = document.getElementById('formAddSet');
    const modalSet = document.getElementById('addSetModal');
    const backdropSet = document.getElementById('backdropAddSet');
    const closeSet = document.getElementById('btnCloseAddSetModal');
    const closeSetModal = () => { if (modalSet) modalSet.style.display = 'none'; };
    if (backdropSet) backdropSet.onclick = closeSetModal;
    if (closeSet) closeSet.onclick = closeSetModal;

    if (formSet) {
      formSet.onsubmit = (e) => {
        e.preventDefault();
        const ex = this.exercises[this.currentTargetExerciseIndex];
        if (!ex) return;

        const weightInput = document.getElementById('inputSetWeight');
        const repsInput = document.getElementById('inputSetReps');
        const repsVal = repsInput.value.trim() || '10';
        let weightVal = '0';

        if (ex.category === 'bodyweight') weightVal = 'BW';
        else if (ex.category === 'mix') weightVal = '+' + (weightInput.value.trim() || '10');
        else weightVal = weightInput.value.trim() || '60';

        const setObj = { weight: weightVal, reps: repsVal };

        if (this.currentEditingSetIndex >= 0) {
          ex.sets[this.currentEditingSetIndex] = setObj;
        } else {
          ex.sets.push(setObj);
        }

        native.hapticMedium();
        closeSetModal();
        this.renderExercises();
      };
    }

    // Exercise Type Modal
    const btnOpenEx = document.getElementById('btnOpenAddExerciseModal');
    if (btnOpenEx) btnOpenEx.onclick = () => this.openExerciseTypeModal();

    const modalEx = document.getElementById('exerciseTypeModal');
    const backdropEx = document.getElementById('backdropExerciseType');
    const closeEx1 = document.getElementById('btnCloseExerciseModal1');
    const closeEx2 = document.getElementById('btnCloseExerciseModal2');
    const closeExModal = () => { if (modalEx) modalEx.style.display = 'none'; };
    if (backdropEx) backdropEx.onclick = closeExModal;
    if (closeEx1) closeEx1.onclick = closeExModal;
    if (closeEx2) closeEx2.onclick = closeExModal;

    document.querySelectorAll('.btn-select-ex-type').forEach(btn => {
      btn.onclick = () => {
        native.hapticLight();
        this.pendingExerciseCategory = btn.dataset.type;
        this.showExerciseStep2();
      };
    });

    const btnBackStep1 = document.getElementById('btnBackToExStep1');
    if (btnBackStep1) {
      btnBackStep1.onclick = () => {
        native.hapticLight();
        document.getElementById('exerciseTypeStep2').style.display = 'none';
        document.getElementById('exerciseTypeStep1').style.display = 'block';
      };
    }

    const formExName = document.getElementById('formAddExName');
    if (formExName) {
      formExName.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('inputExNameModal');
        let name = nameInput.value.trim();
        if (!name) {
          name = this.pendingExerciseCategory === 'bodyweight' ? 'Push-ups' : (this.pendingExerciseCategory === 'mix' ? 'Weighted Pull-ups' : 'Bench Press');
        }

        this.exercises.push({
          name: name,
          category: this.pendingExerciseCategory,
          sets: []
        });

        native.hapticMedium();
        closeExModal();
        this.currentCategoryFilter = 'all';
        this.renderExercises();

        // Prompt set 1 immediately
        setTimeout(() => {
          this.openAddSetModal(this.exercises.length - 1, -1);
        }, 100);
      };
    }
  }

  openExerciseTypeModal() {
    native.hapticLight();
    const modal = document.getElementById('exerciseTypeModal');
    document.getElementById('exerciseTypeStep1').style.display = 'block';
    document.getElementById('exerciseTypeStep2').style.display = 'none';
    modal.style.display = 'flex';
  }

  showExerciseStep2() {
    const badge = document.getElementById('badgeSelectedExCat');
    const input = document.getElementById('inputExNameModal');
    const suggestionsCont = document.getElementById('exSuggestionsContainer');

    const catNames = { weighted: 'Weighted', bodyweight: 'Bodyweight', mix: 'Mix' };
    badge.textContent = catNames[this.pendingExerciseCategory];

    const presets = {
      weighted: ['Bench Press', 'Incline Dumbbell Press', 'Barbell Squat', 'Romanian Deadlift', 'Overhead Press', 'Barbell Row', 'Lateral Raise', 'Bicep Curl'],
      bodyweight: ['Push-ups', 'Pull-ups', 'Dips', 'Hanging Leg Raises', 'Plank', 'Pistol Squat', 'Diamond Push-ups'],
      mix: ['Weighted Pull-ups', 'Weighted Dips', 'Weighted Push-ups', 'Weighted Muscle-ups']
    };

    suggestionsCont.innerHTML = (presets[this.pendingExerciseCategory] || []).map(p => `
      <button type="button" class="btn-ex-preset px-2.5 py-1 bg-[#15161a] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors" data-val="${p}">
        ${p}
      </button>
    `).join('');

    suggestionsCont.onclick = (e) => {
      const pBtn = e.target.closest('.btn-ex-preset');
      if (pBtn) {
        input.value = pBtn.dataset.val;
        native.hapticLight();
      }
    };

    input.value = '';
    document.getElementById('exerciseTypeStep1').style.display = 'none';
    document.getElementById('exerciseTypeStep2').style.display = 'block';
    setTimeout(() => input.focus(), 60);
  }

  setupRoutineModals(router) {
    const trigger = document.getElementById('btnEditRoutinesTrigger');
    const modal = document.getElementById('routineEditorModal');
    const backdrop = document.getElementById('backdropRoutineEditor');
    const closeBtn = document.getElementById('btnCloseRoutineModal');
    const doneBtn = document.getElementById('btnDoneRoutineModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };

    if (trigger) {
      trigger.onclick = () => {
        native.hapticLight();
        this.renderRoutineEditList();
        modal.style.display = 'flex';
      };
    }
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;

    const addBtn = document.getElementById('btnAddRoutineBtn');
    const addInput = document.getElementById('inputNewRoutineName');
    if (addBtn && addInput) {
      addBtn.onclick = () => {
        const val = addInput.value.trim();
        if (!val) return;
        const routines = storage.getRoutines();
        if (!routines.includes(val)) {
          routines.push(val);
          storage.saveRoutines(routines);
          this.selectedRoutine = val;
          const titleInput = document.getElementById('workoutTitleInput');
          if (titleInput) titleInput.value = `${val} Session`;
          this.renderRoutinePills();
          this.renderRoutineEditList();
          native.hapticLight();
        }
        addInput.value = '';
      };
    }
  }

  renderRoutineEditList() {
    const list = document.getElementById('routineEditList');
    if (!list) return;
    const routines = storage.getRoutines();

    list.innerHTML = routines.map((r, idx) => `
      <div class="flex items-center justify-between bg-[#15161a] rounded-xl px-3 py-2 border border-gray-800">
        <span class="font-semibold text-xs text-white">${r}</span>
        <button class="btn-del-routine text-gray-500 hover:text-red-400 p-1" data-index="${idx}" title="Delete">
          <i class="ph ph-trash text-sm"></i>
        </button>
      </div>
    `).join('');

    list.onclick = (e) => {
      const del = e.target.closest('.btn-del-routine');
      if (del) {
        const idx = parseInt(del.dataset.index, 10);
        const listRoutines = storage.getRoutines();
        if (listRoutines.length <= 1) return;
        listRoutines.splice(idx, 1);
        storage.saveRoutines(listRoutines);
        if (this.selectedRoutine === routines[idx]) {
          this.selectedRoutine = listRoutines[0];
        }
        this.renderRoutinePills();
        this.renderRoutineEditList();
        native.hapticLight();
      }
    };
  }

  setupCopyModals(router) {
    const trigger = document.getElementById('btnCopyWorkoutModalTrigger');
    const modal = document.getElementById('copyWorkoutModal');
    const backdrop = document.getElementById('backdropCopyWorkout');
    const closeBtn = document.getElementById('btnCloseCopyModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };

    if (trigger) {
      trigger.onclick = () => {
        native.hapticLight();
        this.renderSavedTemplates(router);
        modal.style.display = 'flex';
      };
    }
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    const btnSaveTpl = document.getElementById('btnSaveAsTemplate');
    if (btnSaveTpl) {
      btnSaveTpl.onclick = () => {
        const tpl = {
          id: Date.now(),
          title: document.getElementById('workoutTitleInput')?.value || this.selectedRoutine,
          routine: this.selectedRoutine,
          exercises: JSON.parse(JSON.stringify(this.exercises)),
          notes: document.getElementById('workoutNotesTextarea')?.value || ''
        };
        storage.addTemplate(tpl);
        native.hapticSuccess();
        this.renderSavedTemplates(router);
        router.showToast('Saved as reusable template!');
      };
    }

    const btnCopySummary = document.getElementById('btnCopyTextSummary');
    if (btnCopySummary) {
      btnCopySummary.onclick = () => {
        let text = `🏋️ ${this.selectedRoutine} Workout\n`;
        this.exercises.forEach((ex, i) => {
          text += `\n${i + 1}. ${ex.name} (${ex.category}):\n`;
          ex.sets.forEach((s, sIdx) => {
            text += `   Set ${sIdx + 1}: ${s.weight}kg × ${s.reps}\n`;
          });
        });
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          native.hapticSuccess();
          router.showToast('Workout text copied to clipboard!');
        }
      };
    }
  }

  renderSavedTemplates(router) {
    const list = document.getElementById('savedTemplatesListContainer');
    if (!list) return;
    const templates = storage.getTemplates();

    if (templates.length === 0) {
      list.innerHTML = `<div class="text-xs text-textSecondary text-center py-3">No templates saved yet. Tap "Save Current as Template" above.</div>`;
      return;
    }

    list.innerHTML = templates.map((tpl, idx) => `
      <div class="flex items-center justify-between bg-[#15161a] rounded-xl px-3 py-2 border border-gray-800">
        <div>
          <div class="font-bold text-xs text-white">${tpl.title}</div>
          <div class="text-[10px] text-textSecondary">${(tpl.exercises || []).length} exercises</div>
        </div>
        <div class="flex items-center space-x-1.5">
          <button class="btn-use-tpl px-2.5 py-1 bg-white text-black font-bold text-[11px] rounded-lg active:scale-95" data-index="${idx}">
            Use
          </button>
          <button class="btn-del-tpl p-1 text-gray-500 hover:text-red-400" data-index="${idx}">
            <i class="ph ph-trash text-sm"></i>
          </button>
        </div>
      </div>
    `).join('');

    list.onclick = (e) => {
      const useBtn = e.target.closest('.btn-use-tpl');
      if (useBtn) {
        const idx = parseInt(useBtn.dataset.index, 10);
        const tpl = templates[idx];
        if (tpl) {
          this.selectedRoutine = tpl.routine || this.selectedRoutine;
          const titleInput = document.getElementById('workoutTitleInput');
          if (titleInput) titleInput.value = tpl.title;
          this.exercises = JSON.parse(JSON.stringify(tpl.exercises || []));
          this.renderExercises();
          this.renderRoutinePills();
          native.hapticSuccess();
          document.getElementById('copyWorkoutModal').style.display = 'none';
          router.showToast(`Loaded "${tpl.title}" template!`);
        }
        return;
      }

      const delBtn = e.target.closest('.btn-del-tpl');
      if (delBtn) {
        const idx = parseInt(delBtn.dataset.index, 10);
        storage.deleteTemplate(idx);
        native.hapticLight();
        this.renderSavedTemplates(router);
      }
    };
  }

  loadTemplate(tpl, router) {
    this.selectedRoutine = tpl.routine || this.selectedRoutine;
    const titleInput = document.getElementById('workoutTitleInput');
    if (titleInput) titleInput.value = tpl.title;
    this.exercises = JSON.parse(JSON.stringify(tpl.exercises || []));
    this.renderExercises();
    this.renderRoutinePills();
    native.hapticSuccess();
    router.showToast(`Loaded "${tpl.title}" to log!`);
  }
}

export const logWorkoutView = new LogWorkoutController();
