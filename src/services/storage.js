// LocalStorage & Offline Data Layer for Workouts App

export const storage = {
  // Workouts
  getWorkouts() {
    return JSON.parse(localStorage.getItem('workout_logs_history') || '[]');
  },
  saveWorkouts(workouts) {
    localStorage.setItem('workout_logs_history', JSON.stringify(workouts));
  },
  addWorkout(workout) {
    const history = this.getWorkouts();
    history.unshift(workout);
    this.saveWorkouts(history);
    return history;
  },
  deleteWorkout(index) {
    const history = this.getWorkouts();
    history.splice(index, 1);
    this.saveWorkouts(history);
    return history;
  },

  // Weight logs
  getWeightHistory() {
    return JSON.parse(localStorage.getItem('workout_weight_history') || '[]');
  },
  saveWeightHistory(history) {
    localStorage.setItem('workout_weight_history', JSON.stringify(history));
  },
  getLastWeight() {
    return JSON.parse(localStorage.getItem('workout_last_weight') || 'null');
  },
  saveLastWeight(data) {
    localStorage.setItem('workout_last_weight', JSON.stringify(data));
  },
  addWeightLog(data) {
    this.saveLastWeight(data);
    const history = this.getWeightHistory();
    history.unshift(data);
    this.saveWeightHistory(history);
    return history;
  },
  deleteWeightLog(index) {
    const history = this.getWeightHistory();
    history.splice(index, 1);
    this.saveWeightHistory(history);
    if (history.length > 0) {
      this.saveLastWeight(history[0]);
    } else {
      localStorage.removeItem('workout_last_weight');
    }
    return history;
  },

  // Profile
  getProfile() {
    return JSON.parse(localStorage.getItem('workout_user_profile') || 'null');
  },
  saveProfile(profile) {
    localStorage.setItem('workout_user_profile', JSON.stringify(profile));
  },

  // Routines
  getRoutines() {
    return JSON.parse(localStorage.getItem('workout_saved_routines') || 'null') || [
      'Chest + Tricep',
      'Back + Bicep',
      'Legs + Core',
      'Full Body',
      'Shoulders + Arms'
    ];
  },
  saveRoutines(routines) {
    localStorage.setItem('workout_saved_routines', JSON.stringify(routines));
  },

  // Templates
  getTemplates() {
    return JSON.parse(localStorage.getItem('workout_saved_templates') || '[]');
  },
  saveTemplates(templates) {
    localStorage.setItem('workout_saved_templates', JSON.stringify(templates));
  },
  addTemplate(tpl) {
    const list = this.getTemplates();
    list.unshift(tpl);
    this.saveTemplates(list);
    return list;
  },
  deleteTemplate(idx) {
    const list = this.getTemplates();
    list.splice(idx, 1);
    this.saveTemplates(list);
    return list;
  },

  // Journal
  getJournalLogs() {
    return JSON.parse(localStorage.getItem('workout_journal_logs') || '[]');
  },
  saveJournalLogs(logs) {
    localStorage.setItem('workout_journal_logs', JSON.stringify(logs));
  },
  saveJournalEntry(entry) {
    let logs = this.getJournalLogs();
    const idx = logs.findIndex(l => l.date === entry.date);
    if (idx >= 0) {
      logs[idx] = entry;
    } else {
      logs.unshift(entry);
    }
    this.saveJournalLogs(logs);
    return logs;
  },
  deleteJournalEntry(idx) {
    let logs = this.getJournalLogs();
    logs.splice(idx, 1);
    this.saveJournalLogs(logs);
    return logs;
  },

  // Active Session Persistence (in case user switches apps or device suspends)
  getActiveSession() {
    return JSON.parse(localStorage.getItem('workout_active_session') || 'null');
  },
  saveActiveSession(session) {
    localStorage.setItem('workout_active_session', JSON.stringify(session));
  },
  clearActiveSession() {
    localStorage.removeItem('workout_active_session');
  },

  // Full Backup Export / Import
  getBackupPayload() {
    return {
      version: '2.0-capacitor',
      app: 'WorkoutsApp',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      workouts: this.getWorkouts(),
      weightHistory: this.getWeightHistory(),
      lastWeight: this.getLastWeight(),
      routines: this.getRoutines(),
      templates: this.getTemplates(),
      journal: this.getJournalLogs()
    };
  },
  restoreBackup(parsed) {
    if (Array.isArray(parsed)) {
      this.saveWorkouts(parsed);
      return { workouts: parsed.length };
    }
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.profile) this.saveProfile(parsed.profile);
      if (Array.isArray(parsed.workouts)) this.saveWorkouts(parsed.workouts);
      if (Array.isArray(parsed.weightHistory)) this.saveWeightHistory(parsed.weightHistory);
      if (parsed.lastWeight) this.saveLastWeight(parsed.lastWeight);
      if (Array.isArray(parsed.routines)) this.saveRoutines(parsed.routines);
      if (Array.isArray(parsed.templates)) this.saveTemplates(parsed.templates);
      if (Array.isArray(parsed.journal)) this.saveJournalLogs(parsed.journal);
      return {
        workouts: parsed.workouts ? parsed.workouts.length : 0,
        weights: parsed.weightHistory ? parsed.weightHistory.length : 0,
        profile: !!parsed.profile
      };
    }
    throw new Error('Invalid JSON backup structure');
  },
  clearAll() {
    localStorage.removeItem('workout_user_profile');
    localStorage.removeItem('workout_logs_history');
    localStorage.removeItem('workout_weight_history');
    localStorage.removeItem('workout_last_weight');
    localStorage.removeItem('workout_saved_templates');
    localStorage.removeItem('workout_journal_logs');
    localStorage.removeItem('workout_active_session');
  }
};
