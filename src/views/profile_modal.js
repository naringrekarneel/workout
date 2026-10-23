import { storage } from '../services/storage.js';
import { native } from '../services/native.js';

export const profileModal = {
  activeTab: 'personal',

  render() {
    return `
      <div id="userProfileModal" style="display: none;" class="fixed inset-0 z-[1000] justify-center items-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="backdropUserProfile"></div>
        <div class="bg-card w-full max-w-sm max-h-[88vh] flex flex-col rounded-3xl p-5 relative z-10 shadow-2xl border border-gray-800 no-scrollbar overflow-hidden">
          
          <!-- Header -->
          <div class="flex justify-between items-center pb-3 border-b border-gray-800/80 mb-3">
            <div class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <i class="ph ph-user text-xl"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-white leading-tight">Profile & Data</h3>
                <p class="text-[11px] text-textSecondary">Personal info & JSON backup</p>
              </div>
            </div>
            <button id="btnCloseProfileModal" class="w-8 h-8 bg-gray-800 rounded-full flex justify-center items-center text-white hover:bg-gray-700">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- Segmented Tab Switcher -->
          <div class="flex bg-[#15161a] p-1 rounded-xl border border-gray-800/80 mb-3">
            <button id="btnProfileTabPersonal" class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white text-black transition-all shadow-sm">
              Personal Data
            </button>
            <button id="btnProfileTabJson" class="flex-1 py-1.5 text-xs font-bold rounded-lg text-textSecondary hover:text-white transition-all">
              JSON Backup & Sync
            </button>
          </div>

          <!-- Toast Banner -->
          <div id="profileModalToast" class="hidden mb-3 p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center space-x-2">
            <i id="profileToastIcon" class="ph text-base"></i>
            <span id="profileToastMsg"></span>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto no-scrollbar space-y-3">
            
            <!-- TAB 1: Personal Data -->
            <div id="tabContentPersonal" class="space-y-3">
              <!-- Avatar Card -->
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3 flex items-center space-x-3">
                <div id="profileModalAvatarBox" class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-white text-base flex-shrink-0">
                  <i class="ph ph-user text-2xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 id="profileDisplayHeaderName" class="text-sm font-bold text-white truncate">Fitness Athlete</h4>
                  <p id="profileDisplayHeaderGoal" class="text-[11px] text-textSecondary truncate">Personal Fitness Tracker</p>
                </div>
                <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">Local Data</span>
              </div>

              <!-- Form Inputs -->
              <div class="space-y-2.5 text-xs">
                <div>
                  <label class="block text-textSecondary text-[11px] font-medium mb-1">Full Name</label>
                  <input id="inputProfileName" type="text" placeholder="e.g. Alex Morgan" class="w-full bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500">
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-textSecondary text-[11px] font-medium mb-1">Age</label>
                    <input id="inputProfileAge" type="number" min="10" max="120" placeholder="26" class="w-full bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500">
                  </div>
                  <div>
                    <label class="block text-textSecondary text-[11px] font-medium mb-1">Gender</label>
                    <select id="inputProfileGender" class="w-full bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gray-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-textSecondary text-[11px] font-medium mb-1">Height (cm)</label>
                    <input id="inputProfileHeight" type="number" step="0.5" placeholder="178" class="w-full bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500">
                  </div>
                  <div>
                    <label class="block text-textSecondary text-[11px] font-medium mb-1">Target Weight</label>
                    <div class="flex items-center space-x-1">
                      <input id="inputProfileTargetWeight" type="number" step="0.1" placeholder="80.0" class="flex-1 bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500">
                      <select id="inputProfileUnit" class="bg-[#15161a] border border-gray-800 rounded-xl px-2 py-2 text-white text-xs focus:outline-none">
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-textSecondary text-[11px] font-medium mb-1">Fitness Goal</label>
                  <select id="inputProfileGoal" class="w-full bg-[#15161a] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gray-500">
                    <option value="Muscle Gain / Hypertrophy">Muscle Gain / Hypertrophy</option>
                    <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                    <option value="Strength & Power">Strength & Power</option>
                    <option value="Endurance & Stamina">Endurance & Stamina</option>
                    <option value="Maintenance & Health">Maintenance & Health</option>
                  </select>
                </div>

                <div>
                  <label class="block text-textSecondary text-[11px] font-medium mb-1">Bio / Training Notes</label>
                  <textarea id="inputProfileNotes" rows="2" placeholder="Injury precautions, target focus, program notes..." class="w-full bg-[#15161a] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 text-xs"></textarea>
                </div>
              </div>

              <div class="pt-1">
                <button id="btnSaveProfileData" class="w-full bg-white text-black font-bold rounded-2xl py-3 text-xs hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1.5 shadow active:scale-[0.98]">
                  <i class="ph ph-floppy-disk font-bold text-sm"></i>
                  <span>Save Profile</span>
                </button>
              </div>
            </div>

            <!-- TAB 2: JSON Backup & Sync -->
            <div id="tabContentJson" class="space-y-3 hidden">
              <!-- Stats summary -->
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3 space-y-2">
                <div class="flex justify-between items-center text-[10px] text-textSecondary font-bold uppercase tracking-wider">
                  <span>App Offline Storage</span>
                  <span class="text-white text-[10px] bg-white/10 px-2 py-0.5 rounded-full">JSON Safe</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                  <div class="bg-card p-2 rounded-xl border border-gray-800/60">
                    <div id="jsonStatWorkouts" class="font-extrabold text-white text-sm">0</div>
                    <div class="text-[10px] text-textSecondary mt-0.5">Workouts</div>
                  </div>
                  <div class="bg-card p-2 rounded-xl border border-gray-800/60">
                    <div id="jsonStatWeights" class="font-extrabold text-white text-sm">0</div>
                    <div class="text-[10px] text-textSecondary mt-0.5">Weight Logs</div>
                  </div>
                  <div class="bg-card p-2 rounded-xl border border-gray-800/60">
                    <div id="jsonStatRoutines" class="font-extrabold text-white text-sm">0</div>
                    <div class="text-[10px] text-textSecondary mt-0.5">Routines</div>
                  </div>
                </div>
              </div>

              <!-- Export -->
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3.5 space-y-2.5">
                <div class="flex items-center space-x-2">
                  <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <i class="ph ph-download-simple text-sm"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-white">Export Data (JSON)</h4>
                    <p class="text-[10px] text-textSecondary">Download offline file or copy string</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button id="btnExportJsonFile" class="bg-white text-black font-bold rounded-xl py-2 px-3 text-xs hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 active:scale-95">
                    <i class="ph ph-file-arrow-down font-bold text-sm"></i>
                    <span>Download JSON</span>
                  </button>
                  <button id="btnCopyJsonStr" class="bg-card border border-gray-700 text-white font-bold rounded-xl py-2 px-3 text-xs hover:bg-gray-800 transition-colors flex items-center justify-center space-x-1 active:scale-95">
                    <i class="ph ph-copy text-sm"></i>
                    <span id="labelCopyJsonBtn">Copy JSON</span>
                  </button>
                </div>
              </div>

              <!-- Import -->
              <div class="bg-[#15161a] border border-gray-800/80 rounded-2xl p-3.5 space-y-2.5">
                <div class="flex items-center space-x-2">
                  <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <i class="ph ph-upload-simple text-sm"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-white">Import Data (JSON)</h4>
                    <p class="text-[10px] text-textSecondary">Restore previous workouts and logs</p>
                  </div>
                </div>

                <input type="file" id="jsonFileInput" accept=".json,application/json" class="hidden">
                <button id="btnChooseJsonFile" class="w-full border border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-3 text-center transition-all bg-card/60 hover:bg-card">
                  <i class="ph ph-folder-open text-xl text-gray-400 mb-0.5 block mx-auto"></i>
                  <span class="text-xs font-bold text-white block">Choose JSON File to Upload</span>
                  <span class="text-[10px] text-textSecondary block mt-0.5">Click to browse .json file</span>
                </button>

                <!-- Paste raw JSON -->
                <div class="pt-1">
                  <button id="btnTogglePasteJson" class="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1">
                    <i class="ph ph-code"></i>
                    <span id="labelTogglePaste">Or paste raw JSON text</span>
                  </button>
                  <div id="pasteJsonSection" class="hidden mt-2 space-y-2">
                    <textarea id="textareaPasteJson" rows="3" placeholder='{"workouts": [...], "weightHistory": [...]}' class="w-full bg-card border border-gray-800 rounded-xl p-2.5 text-[11px] font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"></textarea>
                    <button id="btnApplyPastedJson" class="w-full bg-card border border-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl py-2 text-xs transition-colors flex items-center justify-center space-x-1">
                      <i class="ph ph-check"></i>
                      <span>Apply Pasted JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Reset Data -->
              <div class="pt-1 text-center">
                <button id="btnClearAllData" class="text-[11px] text-gray-500 hover:text-red-400 transition-colors inline-flex items-center space-x-1">
                  <i class="ph ph-trash"></i>
                  <span>Reset / Clear all workout data</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    `;
  },

  mount(router) {
    const modal = document.getElementById('userProfileModal');
    const backdrop = document.getElementById('backdropUserProfile');
    const closeBtn = document.getElementById('btnCloseProfileModal');
    const closeModal = () => { if (modal) modal.style.display = 'none'; };
    if (backdrop) backdrop.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    // Tabs
    const tabPersonal = document.getElementById('btnProfileTabPersonal');
    const tabJson = document.getElementById('btnProfileTabJson');
    const contentPersonal = document.getElementById('tabContentPersonal');
    const contentJson = document.getElementById('tabContentJson');

    if (tabPersonal && tabJson) {
      tabPersonal.onclick = () => {
        native.hapticLight();
        tabPersonal.className = "flex-1 py-1.5 text-xs font-bold rounded-lg bg-white text-black transition-all shadow-sm";
        tabJson.className = "flex-1 py-1.5 text-xs font-bold rounded-lg text-textSecondary hover:text-white transition-all";
        contentPersonal.classList.remove('hidden');
        contentJson.classList.add('hidden');
      };
      tabJson.onclick = () => {
        native.hapticLight();
        tabJson.className = "flex-1 py-1.5 text-xs font-bold rounded-lg bg-white text-black transition-all shadow-sm";
        tabPersonal.className = "flex-1 py-1.5 text-xs font-bold rounded-lg text-textSecondary hover:text-white transition-all";
        contentPersonal.classList.add('hidden');
        contentJson.classList.remove('hidden');
        this.updateJsonStats();
      };
    }

    // Save profile
    const btnSave = document.getElementById('btnSaveProfileData');
    if (btnSave) {
      btnSave.onclick = async () => {
        const name = (document.getElementById('inputProfileName')?.value || '').trim();
        const profile = {
          name,
          age: document.getElementById('inputProfileAge')?.value || '',
          gender: document.getElementById('inputProfileGender')?.value || 'Male',
          height: document.getElementById('inputProfileHeight')?.value || '',
          targetWeight: document.getElementById('inputProfileTargetWeight')?.value || '',
          unit: document.getElementById('inputProfileUnit')?.value || 'kg',
          goal: document.getElementById('inputProfileGoal')?.value || 'Muscle Gain / Hypertrophy',
          notes: (document.getElementById('inputProfileNotes')?.value || '').trim(),
          updatedAt: new Date().toISOString()
        };

        storage.saveProfile(profile);
        this.updateProfileBadges(profile);
        await native.hapticSuccess();
        this.showToast('Profile saved successfully!');
        if (router.currentTab === 'dashboard') router.renderTab();
      };
    }

    // Export JSON file
    const btnExport = document.getElementById('btnExportJsonFile');
    if (btnExport) {
      btnExport.onclick = () => {
        const payload = storage.getBackupPayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workouts_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        native.hapticSuccess();
        this.showToast('Backup exported to JSON file!');
      };
    }

    // Copy JSON string
    const btnCopy = document.getElementById('btnCopyJsonStr');
    if (btnCopy) {
      btnCopy.onclick = () => {
        const payload = storage.getBackupPayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(jsonStr).then(() => {
            native.hapticSuccess();
            const label = document.getElementById('labelCopyJsonBtn');
            if (label) label.textContent = 'Copied!';
            setTimeout(() => { if (label) label.textContent = 'Copy JSON'; }, 2000);
            this.showToast('JSON copied to clipboard!');
          });
        }
      };
    }

    // Import file
    const fileInput = document.getElementById('jsonFileInput');
    const chooseBtn = document.getElementById('btnChooseJsonFile');
    if (chooseBtn && fileInput) {
      chooseBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          this.handleImportJson(event.target.result, router);
          fileInput.value = '';
        };
        reader.readAsText(file);
      };
    }

    // Paste toggle
    const btnTogglePaste = document.getElementById('btnTogglePasteJson');
    const pasteSec = document.getElementById('pasteJsonSection');
    if (btnTogglePaste && pasteSec) {
      btnTogglePaste.onclick = () => {
        pasteSec.classList.toggle('hidden');
      };
    }

    const btnApplyPaste = document.getElementById('btnApplyPastedJson');
    if (btnApplyPaste) {
      btnApplyPaste.onclick = () => {
        const txt = document.getElementById('textareaPasteJson')?.value || '';
        this.handleImportJson(txt, router);
      };
    }

    // Clear all
    const btnClear = document.getElementById('btnClearAllData');
    if (btnClear) {
      btnClear.onclick = () => {
        if (confirm('Are you sure you want to clear all workouts, weight logs, and profile data? This cannot be undone.')) {
          storage.clearAll();
          native.hapticWarning();
          this.loadData();
          this.updateJsonStats();
          this.showToast('All data has been cleared.');
          router.renderTab();
        }
      };
    }
  },

  open() {
    this.loadData();
    this.updateJsonStats();
    document.getElementById('userProfileModal').style.display = 'flex';
  },

  loadData() {
    const profile = storage.getProfile();
    const nameInput = document.getElementById('inputProfileName');
    const ageInput = document.getElementById('inputProfileAge');
    const genderInput = document.getElementById('inputProfileGender');
    const heightInput = document.getElementById('inputProfileHeight');
    const weightInput = document.getElementById('inputProfileTargetWeight');
    const unitInput = document.getElementById('inputProfileUnit');
    const goalInput = document.getElementById('inputProfileGoal');
    const notesInput = document.getElementById('inputProfileNotes');

    if (profile) {
      if (nameInput) nameInput.value = profile.name || '';
      if (ageInput) ageInput.value = profile.age || '';
      if (genderInput) genderInput.value = profile.gender || 'Male';
      if (heightInput) heightInput.value = profile.height || '';
      if (weightInput) weightInput.value = profile.targetWeight || '';
      if (unitInput) unitInput.value = profile.unit || 'kg';
      if (goalInput) goalInput.value = profile.goal || 'Muscle Gain / Hypertrophy';
      if (notesInput) notesInput.value = profile.notes || '';
      this.updateProfileBadges(profile);
    } else {
      this.updateProfileBadges(null);
    }
  },

  updateProfileBadges(profile) {
    const hName = document.getElementById('profileDisplayHeaderName');
    const hGoal = document.getElementById('profileDisplayHeaderGoal');
    const avatar = document.getElementById('profileModalAvatarBox');

    if (profile && profile.name && profile.name.trim().length > 0) {
      const trimmed = profile.name.trim();
      const parts = trimmed.split(/\s+/);
      let initials = parts[0][0];
      if (parts.length > 1) initials += parts[parts.length - 1][0];
      initials = initials.toUpperCase();

      if (hName) hName.textContent = trimmed;
      if (hGoal) hGoal.textContent = profile.goal || 'Personal Fitness Tracker';
      if (avatar) avatar.innerHTML = `<span class="font-extrabold text-base text-white">${initials}</span>`;
    } else {
      if (hName) hName.textContent = 'Fitness Athlete';
      if (hGoal) hGoal.textContent = 'Personal Fitness Tracker';
      if (avatar) avatar.innerHTML = `<i class="ph ph-user text-2xl text-white"></i>`;
    }
  },

  updateJsonStats() {
    const workouts = storage.getWorkouts();
    const weights = storage.getWeightHistory();
    const routines = storage.getRoutines();

    const wEl = document.getElementById('jsonStatWorkouts');
    const wtEl = document.getElementById('jsonStatWeights');
    const rEl = document.getElementById('jsonStatRoutines');

    if (wEl) wEl.textContent = workouts.length;
    if (wtEl) wtEl.textContent = weights.length;
    if (rEl) rEl.textContent = routines.length;
  },

  handleImportJson(str, router) {
    try {
      const parsed = JSON.parse(str);
      const res = storage.restoreBackup(parsed);
      native.hapticSuccess();
      this.loadData();
      this.updateJsonStats();
      this.showToast(`Imported ${res.workouts} workouts and ${res.weights} weight logs!`);
      router.renderTab();
    } catch (e) {
      native.hapticWarning();
      this.showToast('Invalid JSON file format', true);
    }
  },

  showToast(msg, isError = false) {
    const banner = document.getElementById('profileModalToast');
    const msgEl = document.getElementById('profileToastMsg');
    const iconEl = document.getElementById('profileToastIcon');
    if (!banner || !msgEl || !iconEl) return;

    msgEl.textContent = msg;
    if (isError) {
      banner.className = "mb-3 p-2.5 rounded-xl text-xs font-medium border bg-red-500/10 border-red-500/30 text-red-300 flex items-center space-x-2";
      iconEl.className = "ph ph-warning-circle text-base text-red-400";
    } else {
      banner.className = "mb-3 p-2.5 rounded-xl text-xs font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 flex items-center space-x-2";
      iconEl.className = "ph ph-check-circle text-base text-emerald-400";
    }
    banner.classList.remove('hidden');
    setTimeout(() => { banner.classList.add('hidden'); }, 3000);
  }
};
