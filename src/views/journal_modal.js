import { storage } from '../services/storage.js';
import { native } from '../services/native.js';

export const journalModal = {
  currentRating: {
    energy: 4,
    soreness: 2
  },

  render() {
    return `
      <div id="journalModalRoot" style="display: none;" class="fixed inset-0 z-[1000] justify-center items-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="backdropJournal"></div>
        <div class="bg-card w-full max-w-sm max-h-[88vh] flex flex-col rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 no-scrollbar overflow-hidden">
          
          <!-- Header -->
          <div class="flex justify-between items-center pb-3 border-b border-gray-800/80 mb-3">
            <div class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <i class="ph ph-chat-centered text-xl"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-white leading-tight">Fitness Journal & Recovery</h3>
                <p class="text-[11px] text-textSecondary">Daily readiness, soreness & sleep</p>
              </div>
            </div>
            <button id="btnCloseJournalModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- Readiness Score Card -->
          <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3 flex items-center justify-between mb-3">
            <div class="space-y-0.5">
              <span class="text-[10px] uppercase font-bold text-textSecondary tracking-wider block">Today's Readiness Score</span>
              <div class="flex items-baseline space-x-1.5">
                <span id="journalReadinessScoreVal" class="text-xl font-bold text-white">88%</span>
                <span id="journalReadinessStatusVal" class="text-xs font-semibold text-emerald-400">Optimal Recovery</span>
              </div>
            </div>
            <div class="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i id="journalReadinessIconEl" class="ph ph-battery-charging text-xl"></i>
            </div>
          </div>

          <!-- Toast Notification -->
          <div id="journalModalToast" class="hidden mb-3 p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center space-x-2">
            <i id="journalToastIcon" class="ph text-base"></i>
            <span id="journalToastMsg"></span>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            
            <!-- Log Form -->
            <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3.5 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-white">Log Today's Recovery</span>
                <span class="text-[10px] text-textSecondary">Daily Entry</span>
              </div>

              <!-- Date & Sleep -->
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label class="block text-textSecondary text-[11px] font-medium mb-1">Date</label>
                  <input id="inputJournalDate" type="date" class="w-full bg-card border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-gray-500">
                </div>
                <div>
                  <label class="block text-textSecondary text-[11px] font-medium mb-1">Sleep Duration</label>
                  <div class="flex items-center space-x-1">
                    <input id="inputJournalSleep" type="number" step="0.5" min="0" max="24" value="7.5" class="w-full bg-card border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-gray-500">
                    <span class="text-textSecondary text-[11px]">hrs</span>
                  </div>
                </div>
              </div>

              <!-- Energy Rating -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[11px]">
                  <label class="text-textSecondary font-medium">Energy Level</label>
                  <span id="labelJournalEnergy" class="text-white font-bold">High (4/5)</span>
                </div>
                <div class="grid grid-cols-5 gap-1 text-center" id="journalEnergyBtnGroup">
                  <button type="button" class="btn-energy py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="1">1</button>
                  <button type="button" class="btn-energy py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="2">2</button>
                  <button type="button" class="btn-energy py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="3">3</button>
                  <button type="button" class="btn-energy py-1.5 border border-white bg-white text-black rounded-xl text-xs font-bold" data-val="4">4</button>
                  <button type="button" class="btn-energy py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="5">5</button>
                </div>
              </div>

              <!-- Soreness Rating -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[11px]">
                  <label class="text-textSecondary font-medium">Muscle Soreness (DOMS)</label>
                  <span id="labelJournalSoreness" class="text-white font-bold">Mild (2/5)</span>
                </div>
                <div class="grid grid-cols-5 gap-1 text-center" id="journalSorenessBtnGroup">
                  <button type="button" class="btn-soreness py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="1">None</button>
                  <button type="button" class="btn-soreness py-1.5 border border-white bg-white text-black rounded-xl text-xs font-bold" data-val="2">Mild</button>
                  <button type="button" class="btn-soreness py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="3">Mod</button>
                  <button type="button" class="btn-soreness py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="4">High</button>
                  <button type="button" class="btn-soreness py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary" data-val="5">Severe</button>
                </div>
              </div>

              <!-- Water -->
              <div>
                <label class="block text-textSecondary text-[11px] font-medium mb-1">Water Hydration</label>
                <div class="flex items-center space-x-2">
                  <input id="inputJournalWater" type="number" step="0.25" min="0" value="2.5" class="flex-1 bg-card border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gray-500 text-xs">
                  <span class="text-textSecondary text-xs">Liters</span>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-textSecondary text-[11px] font-medium mb-1">Recovery & Journal Reflection</label>
                <textarea id="inputJournalNotes" rows="2" placeholder="Muscle tightness, nutrition, mobility stretching, stress..." class="w-full bg-card border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 text-xs"></textarea>
              </div>

              <!-- Save button -->
              <button id="btnSaveJournalEntry" class="w-full bg-white text-black font-bold rounded-2xl py-2.5 text-xs hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1.5 shadow active:scale-[0.98]">
                <i class="ph ph-check font-bold"></i>
                <span>Save Daily Entry</span>
              </button>
            </div>

            <!-- Past Logs List -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-white uppercase tracking-wider">Past Journal Entries</span>
                <span id="journalCountBadge" class="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-medium">0 logs</span>
              </div>
              <div id="journalEntriesListContainer" class="space-y-2">
                <!-- Dynamically populated -->
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
  },

  mount() {
    const modal = document.getElementById('journalModalRoot');
    const backdrop = document.getElementById('backdropJournal');
    const closeBtn = document.getElementById('btnCloseJournalModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    // Energy buttons
    document.querySelectorAll('.btn-energy').forEach(btn => {
      btn.onclick = () => {
        native.hapticLight();
        this.selectRating('energy', parseInt(btn.dataset.val, 10));
      };
    });

    // Soreness buttons
    document.querySelectorAll('.btn-soreness').forEach(btn => {
      btn.onclick = () => {
        native.hapticLight();
        this.selectRating('soreness', parseInt(btn.dataset.val, 10));
      };
    });

    // Sleep input
    const sleepInput = document.getElementById('inputJournalSleep');
    if (sleepInput) {
      sleepInput.oninput = () => this.calculateScore();
    }

    // Save
    const saveBtn = document.getElementById('btnSaveJournalEntry');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const date = document.getElementById('inputJournalDate')?.value || new Date().toISOString().slice(0, 10);
        const sleep = parseFloat(document.getElementById('inputJournalSleep')?.value || 7.5);
        const water = parseFloat(document.getElementById('inputJournalWater')?.value || 2.5);
        const notes = (document.getElementById('inputJournalNotes')?.value || '').trim();
        const score = this.calculateScore();

        const entry = {
          id: Date.now(),
          date,
          sleep,
          energy: this.currentRating.energy,
          soreness: this.currentRating.soreness,
          water,
          notes,
          score,
          createdAt: new Date().toISOString()
        };

        storage.saveJournalEntry(entry);
        await native.hapticSuccess();
        this.renderEntries();
        this.showToast('Journal entry saved successfully!');
        const notesInput = document.getElementById('inputJournalNotes');
        if (notesInput) notesInput.value = '';
      };
    }
  },

  open() {
    const today = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('inputJournalDate');
    if (dateInput && !dateInput.value) dateInput.value = today;

    this.selectRating('energy', this.currentRating.energy);
    this.selectRating('soreness', this.currentRating.soreness);
    this.calculateScore();
    this.renderEntries();
    document.getElementById('journalModalRoot').style.display = 'flex';
  },

  selectRating(type, val) {
    this.currentRating[type] = val;

    if (type === 'energy') {
      const energyDescs = ['Exhausted', 'Low', 'Moderate', 'High', 'Peak'];
      document.getElementById('labelJournalEnergy').textContent = `${energyDescs[val - 1]} (${val}/5)`;
      document.querySelectorAll('.btn-energy').forEach(b => {
        if (parseInt(b.dataset.val, 10) === val) {
          b.className = 'btn-energy py-1.5 border border-white bg-white text-black rounded-xl text-xs font-bold';
        } else {
          b.className = 'btn-energy py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary';
        }
      });
    } else {
      const sorenessDescs = ['None', 'Mild', 'Moderate', 'High', 'Severe'];
      document.getElementById('labelJournalSoreness').textContent = `${sorenessDescs[val - 1]} (${val}/5)`;
      document.querySelectorAll('.btn-soreness').forEach(b => {
        if (parseInt(b.dataset.val, 10) === val) {
          b.className = 'btn-soreness py-1.5 border border-white bg-white text-black rounded-xl text-xs font-bold';
        } else {
          b.className = 'btn-soreness py-1.5 border border-gray-800 rounded-xl text-xs font-medium text-textSecondary';
        }
      });
    }

    this.calculateScore();
  },

  calculateScore() {
    const sleep = parseFloat(document.getElementById('inputJournalSleep')?.value || 7.5);
    const energy = this.currentRating.energy;
    const soreness = this.currentRating.soreness;

    let score = Math.round(35 + (Math.min(sleep, 9) / 8) * 35 + (energy / 5) * 30 - ((soreness - 1) / 4) * 20);
    score = Math.max(30, Math.min(99, score));

    const scoreEl = document.getElementById('journalReadinessScoreVal');
    const statusEl = document.getElementById('journalReadinessStatusVal');
    const iconEl = document.getElementById('journalReadinessIconEl');

    if (scoreEl) scoreEl.textContent = `${score}%`;
    if (statusEl) {
      if (score >= 80) {
        statusEl.textContent = 'Optimal Recovery';
        statusEl.className = 'text-xs font-semibold text-emerald-400';
        if (iconEl) iconEl.className = 'ph ph-battery-charging text-xl text-emerald-400';
      } else if (score >= 60) {
        statusEl.textContent = 'Moderate Readiness';
        statusEl.className = 'text-xs font-semibold text-amber-400';
        if (iconEl) iconEl.className = 'ph ph-battery-medium text-xl text-amber-400';
      } else {
        statusEl.textContent = 'Rest Recommended';
        statusEl.className = 'text-xs font-semibold text-red-400';
        if (iconEl) iconEl.className = 'ph ph-battery-warning text-xl text-red-400';
      }
    }

    return score;
  },

  renderEntries() {
    const entries = storage.getJournalLogs();
    const countBadge = document.getElementById('journalCountBadge');
    if (countBadge) countBadge.textContent = `${entries.length} log${entries.length === 1 ? '' : 's'}`;

    const list = document.getElementById('journalEntriesListContainer');
    if (!list) return;

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="bg-card/40 border border-dashed border-gray-800 rounded-2xl p-4 text-center text-textSecondary text-xs">
          <i class="ph ph-notepad text-2xl text-gray-500 mb-1 block"></i>
          <p class="font-medium text-white">No journal entries yet</p>
          <p class="text-[10px] mt-0.5">Log today's sleep, energy, and notes above.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = entries.map((entry, idx) => {
      const dateObj = new Date(entry.date + 'T00:00:00');
      const formattedDate = isNaN(dateObj.getTime()) ? entry.date : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      return `
        <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3 space-y-2">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-xs text-white">${formattedDate}</span>
              <span class="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-bold">Readiness: ${entry.score}%</span>
            </div>
            <button class="btn-del-journal text-gray-500 hover:text-red-400 p-1 rounded transition-colors" data-index="${idx}" title="Delete">
              <i class="ph ph-trash text-sm"></i>
            </button>
          </div>
          
          <div class="grid grid-cols-3 gap-1 text-[11px] text-textSecondary">
            <span class="bg-card px-2 py-1 rounded text-white flex items-center space-x-1">
              <i class="ph ph-moon text-xs"></i>
              <span>${entry.sleep}h sleep</span>
            </span>
            <span class="bg-card px-2 py-1 rounded text-white flex items-center space-x-1">
              <i class="ph ph-lightning text-xs"></i>
              <span>Energy: ${entry.energy}/5</span>
            </span>
            <span class="bg-card px-2 py-1 rounded text-white flex items-center space-x-1">
              <i class="ph ph-drop text-xs"></i>
              <span>${entry.water || 2}L water</span>
            </span>
          </div>

          ${entry.notes ? `<p class="text-xs text-gray-300 bg-card/60 p-2 rounded-xl border border-gray-800/60 whitespace-pre-wrap">${entry.notes}</p>` : ''}
        </div>
      `;
    }).join('');

    list.onclick = (e) => {
      const delBtn = e.target.closest('.btn-del-journal');
      if (delBtn) {
        const idx = parseInt(delBtn.dataset.index, 10);
        storage.deleteJournalEntry(idx);
        native.hapticLight();
        this.renderEntries();
        this.showToast('Journal entry deleted');
      }
    };
  },

  showToast(msg) {
    const toast = document.getElementById('journalModalToast');
    const msgEl = document.getElementById('journalToastMsg');
    const iconEl = document.getElementById('journalToastIcon');
    if (!toast || !msgEl || !iconEl) return;

    msgEl.textContent = msg;
    toast.className = "mb-3 p-2.5 rounded-xl text-xs font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 flex items-center space-x-2";
    iconEl.className = "ph ph-check-circle text-base text-emerald-400";
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 2500);
  }
};
