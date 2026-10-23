import { storage } from '../services/storage.js';
import { native } from '../services/native.js';

export const uploadWeightView = {
  currentUnit: 'kg',

  render() {
    const saved = storage.getLastWeight();
    const defaultWeight = saved ? saved.weight : '86.2';
    this.currentUnit = saved ? saved.unit : 'kg';

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const initialIsoDate = now.toISOString().slice(0, 16);

    return `
      <div class="px-5 pt-safe pb-32 space-y-6 w-full max-w-lg mx-auto">
        <!-- Header -->
        <header class="flex justify-between items-center pt-2 pb-4">
          <button id="btnWeightBack" class="w-10 h-10 bg-card rounded-full flex justify-center items-center hover:bg-cardHover transition-colors border border-gray-800/80 active:scale-95" title="Back">
            <i class="ph ph-caret-left text-xl text-white"></i>
          </button>
          <h1 class="text-xl font-bold tracking-tight text-white">Log Weight</h1>
          <button id="btnSaveWeightHeader" class="text-sm font-bold text-white px-3 py-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all">Save</button>
        </header>

        <!-- Giant Weight Input -->
        <div class="flex flex-col items-center justify-center space-y-4 py-2">
          <div class="flex items-baseline justify-center w-full">
            <input id="inputWeightVal" type="number" step="0.1" value="${defaultWeight}" class="bg-transparent text-center text-7xl font-extrabold text-white w-full max-w-[280px] focus:outline-none placeholder-gray-700" placeholder="0.0">
          </div>
          <div class="bg-card p-1 rounded-full flex space-x-1 border border-gray-800/80 shadow-md">
            <button id="btnUnitKg" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all ${this.currentUnit === 'kg' ? 'bg-[#2a2b30] text-white shadow-sm' : 'text-textSecondary hover:text-white'}">kg</button>
            <button id="btnUnitLbs" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all ${this.currentUnit === 'lbs' ? 'bg-[#2a2b30] text-white shadow-sm' : 'text-textSecondary hover:text-white'}">lbs</button>
          </div>
        </div>

        <!-- Meta fields: Date and Notes -->
        <div class="space-y-3.5">
          <div class="bg-card rounded-2xl p-4 flex justify-between items-center hover:bg-cardHover cursor-pointer transition-colors relative overflow-hidden border border-gray-800/60 shadow-md">
            <input id="inputWeightDate" type="datetime-local" value="${initialIsoDate}" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10">
            <div class="flex items-center space-x-3 pointer-events-none">
              <div class="w-10 h-10 rounded-full bg-gray-800/80 flex justify-center items-center text-white">
                <i class="ph ph-calendar-blank text-lg"></i>
              </div>
              <span class="font-medium text-sm text-white">Date & Time</span>
            </div>
            <div class="flex items-center space-x-2 text-textSecondary pointer-events-none">
              <span id="displayWeightDate" class="text-xs font-semibold text-gray-300">Today</span>
              <i class="ph ph-caret-right text-xs"></i>
            </div>
          </div>

          <div class="bg-card rounded-2xl p-4 flex flex-col space-y-2 border border-gray-800/60 shadow-md">
            <label class="font-medium text-sm text-white flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-gray-800/80 flex justify-center items-center text-white">
                <i class="ph ph-text-align-left text-lg"></i>
              </div>
              <span>Notes</span>
            </label>
            <textarea id="inputWeightNotes" class="bg-transparent w-full resize-none focus:outline-none text-xs text-textSecondary pl-13 placeholder-gray-600" rows="2" placeholder="Diet, hydration, morning weigh-in, etc..."></textarea>
          </div>
        </div>

        <!-- History Section -->
        <div class="pt-3 pb-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-sm text-white uppercase tracking-wider">Weight History</h3>
            <span id="weightLogsBadge" class="text-[11px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-medium">0 records</span>
          </div>
          <div id="weightHistoryContainer" class="space-y-2.5">
            <!-- Dynamic history cards -->
          </div>
        </div>

        <!-- Fixed bottom Save button -->
        <div class="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/95 to-transparent z-40 max-w-lg mx-auto">
          <button id="btnSaveWeightBottom" class="w-full bg-white text-black font-bold rounded-2xl py-3.5 text-sm hover:bg-gray-200 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2">
            <i class="ph ph-check font-bold text-base"></i>
            <span>Save Weight Log</span>
          </button>
        </div>

        <!-- Weight Note Modal -->
        <div id="weightNoteModal" style="display: none;" class="fixed inset-0 z-[999] justify-center items-center p-6">
          <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" id="weightNoteBackdrop"></div>
          <div class="bg-card w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl border border-gray-800">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-base font-bold text-white">Weight Record Details</h3>
                <p id="modalWeightDateText" class="text-xs text-textSecondary mt-0.5"></p>
              </div>
              <button id="btnCloseWeightNoteModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
                <i class="ph ph-x"></i>
              </button>
            </div>
            <div class="mb-3">
              <span id="modalWeightValText" class="text-3xl font-extrabold tracking-tight text-white"></span>
            </div>
            <div class="bg-[#15161a] rounded-2xl p-4 border border-gray-800/80">
              <p id="modalWeightNoteBody" class="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed"></p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  mount(router) {
    const inputWeight = document.getElementById('inputWeightVal');
    const btnKg = document.getElementById('btnUnitKg');
    const btnLbs = document.getElementById('btnUnitLbs');
    const dateInput = document.getElementById('inputWeightDate');
    const dateDisplay = document.getElementById('displayWeightDate');
    const notesInput = document.getElementById('inputWeightNotes');

    const updateDateDisplay = () => {
      if (!dateInput || !dateDisplay) return;
      const d = new Date(dateInput.value);
      dateDisplay.textContent = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    };
    updateDateDisplay();
    if (dateInput) dateInput.addEventListener('change', updateDateDisplay);

    const switchUnit = (newUnit) => {
      if (this.currentUnit === newUnit) return;
      let val = parseFloat(inputWeight.value) || 0;
      if (newUnit === 'kg') {
        val = val / 2.20462;
        btnKg.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-[#2a2b30] text-white shadow-sm';
        btnLbs.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all text-textSecondary hover:text-white';
      } else {
        val = val * 2.20462;
        btnLbs.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-[#2a2b30] text-white shadow-sm';
        btnKg.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all text-textSecondary hover:text-white';
      }
      inputWeight.value = val.toFixed(1);
      this.currentUnit = newUnit;
      native.hapticLight();
    };

    if (btnKg) btnKg.onclick = () => switchUnit('kg');
    if (btnLbs) btnLbs.onclick = () => switchUnit('lbs');

    const handleSave = async () => {
      const val = parseFloat(inputWeight.value);
      if (isNaN(val) || val <= 0) {
        router.showToast('Please enter a valid weight');
        return;
      }

      const log = {
        weight: inputWeight.value,
        unit: this.currentUnit,
        date: dateInput.value,
        notes: notesInput.value.trim(),
        timestamp: Date.now()
      };

      storage.addWeightLog(log);
      await native.hapticSuccess();
      router.showToast('Weight log saved successfully!');
      router.navigate('dashboard');
    };

    const btnSaveH = document.getElementById('btnSaveWeightHeader');
    const btnSaveB = document.getElementById('btnSaveWeightBottom');
    if (btnSaveH) btnSaveH.onclick = handleSave;
    if (btnSaveB) btnSaveB.onclick = handleSave;

    const btnBack = document.getElementById('btnWeightBack');
    if (btnBack) {
      btnBack.onclick = () => {
        native.hapticLight();
        router.navigate('dashboard');
      };
    }

    this.renderHistory(router);

    // Modal listeners
    const modal = document.getElementById('weightNoteModal');
    const backdrop = document.getElementById('weightNoteBackdrop');
    const closeBtn = document.getElementById('btnCloseWeightNoteModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
  },

  renderHistory(router) {
    const history = storage.getWeightHistory();
    const container = document.getElementById('weightHistoryContainer');
    const badge = document.getElementById('weightLogsBadge');
    if (badge) badge.textContent = `${history.length} record${history.length === 1 ? '' : 's'}`;
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 bg-card/60 rounded-2xl border border-dashed border-gray-800 text-xs text-textSecondary">
          <i class="ph ph-scales text-2xl text-gray-500 mb-1 block"></i>
          <span>No weight records yet. Enter your current weight above.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map((item, idx) => {
      const dateObj = new Date(item.date || item.timestamp);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      return `
        <div class="weight-item bg-card border border-gray-800/70 hover:border-gray-600 rounded-2xl p-3.5 flex justify-between items-center cursor-pointer transition-all active:scale-[0.99]" data-index="${idx}">
          <div>
            <div class="font-extrabold text-base text-white">
              ${parseFloat(item.weight).toFixed(1)} <span class="text-xs font-semibold text-textSecondary">${item.unit}</span>
            </div>
            <div class="text-[11px] text-textSecondary mt-0.5">
              ${dateStr} at ${timeStr}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            ${item.notes ? `<span class="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-lg max-w-[110px] truncate">${item.notes}</span>` : ''}
            <button class="btn-delete-weight p-1.5 text-gray-500 hover:text-red-400 rounded-lg" data-index="${idx}" title="Delete">
              <i class="ph ph-trash text-base"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.onclick = (e) => {
      const deleteBtn = e.target.closest('.btn-delete-weight');
      if (deleteBtn) {
        e.stopPropagation();
        const idx = parseInt(deleteBtn.dataset.index, 10);
        storage.deleteWeightLog(idx);
        native.hapticLight();
        this.renderHistory(router);
        router.showToast('Weight log deleted');
        return;
      }

      const itemCard = e.target.closest('.weight-item');
      if (itemCard) {
        const idx = parseInt(itemCard.dataset.index, 10);
        const log = history[idx];
        if (log) {
          const dateObj = new Date(log.date || log.timestamp);
          document.getElementById('modalWeightDateText').textContent = dateObj.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
          });
          document.getElementById('modalWeightValText').textContent = `${parseFloat(log.weight).toFixed(1)} ${log.unit}`;
          document.getElementById('modalWeightNoteBody').textContent = log.notes || 'No extra notes recorded for this weigh-in.';
          document.getElementById('weightNoteModal').style.display = 'flex';
          native.hapticLight();
        }
      }
    };
  }
};
