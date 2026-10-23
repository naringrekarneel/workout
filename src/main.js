import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import '@phosphor-icons/web/bold';
import './styles/app.css';
import { native } from './services/native.js';
import { storage } from './services/storage.js';

import { dashboardView } from './views/dashboard.js';
import { uploadWeightView } from './views/upload_weight.js';
import { logWorkoutView } from './views/log_workout.js';
import { savedWorkoutsView } from './views/saved_workouts.js';

import { profileModal } from './views/profile_modal.js';
import { analyticsModal } from './views/analytics_modal.js';
import { journalModal } from './views/journal_modal.js';

class AppRouter {
  constructor() {
    this.currentTab = 'dashboard';
    this.views = {
      dashboard: dashboardView,
      weight: uploadWeightView,
      log: logWorkoutView,
      saved: savedWorkoutsView
    };
    this.modals = {
      profile: profileModal,
      analytics: analyticsModal,
      journal: journalModal
    };
  }

  async init() {
    // Initialize Capacitor native plugins (StatusBar, SplashScreen, BackButton)
    await native.init();

    // Register hardware back button handler
    native.registerBackHandler(() => {
      // 1. Check if any modal is open
      const openModals = document.querySelectorAll('[id$="Modal"], [id$="ModalRoot"]');
      for (const m of openModals) {
        if (m.style.display === 'flex' || m.style.display === 'block') {
          m.style.display = 'none';
          return true; // handled
        }
      }

      // 2. If on subtab, return to dashboard
      if (this.currentTab !== 'dashboard') {
        this.navigate('dashboard');
        return true;
      }

      // 3. Otherwise allow native exit
      return false;
    });

    // Render modal containers into DOM
    const modalsRoot = document.getElementById('modalsContainer');
    if (modalsRoot) {
      modalsRoot.innerHTML = `
        ${profileModal.render()}
        ${analyticsModal.render()}
        ${journalModal.render()}
      `;
      profileModal.mount(this);
      analyticsModal.mount(this);
      journalModal.mount(this);
    }

    // Bottom Navigation Bar click handlers
    this.setupNavHandlers();

    // Render initial tab
    this.navigate('dashboard');
  }

  navigate(tabName) {
    if (!this.views[tabName]) return;
    this.currentTab = tabName;
    native.hapticLight();
    this.renderTab();
    this.updateNavUi();
  }

  renderTab() {
    const viewContainer = document.getElementById('appViewContainer');
    if (!viewContainer) return;

    const view = this.views[this.currentTab];
    viewContainer.innerHTML = view.render();
    view.mount(this);

    // Scroll to top of view smoothly
    viewContainer.scrollTop = 0;
  }

  updateNavUi() {
    const navDashboard = document.getElementById('navItemDashboard');
    const navSaved = document.getElementById('navItemSaved');
    const navLog = document.getElementById('navItemLog');
    const navAnalytics = document.getElementById('navItemAnalytics');
    const navJournal = document.getElementById('navItemJournal');

    // Reset base colors
    const inactives = [navDashboard, navSaved, navAnalytics, navJournal];
    inactives.forEach(btn => {
      if (btn) btn.className = 'text-gray-500 hover:text-white transition-colors active:scale-90 p-2';
    });

    if (this.currentTab === 'dashboard' && navDashboard) {
      navDashboard.className = 'text-white transition-colors active:scale-90 p-2';
    } else if (this.currentTab === 'saved' && navSaved) {
      navSaved.className = 'text-white transition-colors active:scale-90 p-2';
    } else if (this.currentTab === 'log' && navLog) {
      // Plus button stays prominent
    }
  }

  setupNavHandlers() {
    const navDashboard = document.getElementById('navItemDashboard');
    const navSaved = document.getElementById('navItemSaved');
    const navLog = document.getElementById('navItemLog');
    const navAnalytics = document.getElementById('navItemAnalytics');
    const navJournal = document.getElementById('navItemJournal');

    if (navDashboard) {
      navDashboard.onclick = () => this.navigate('dashboard');
    }
    if (navSaved) {
      navSaved.onclick = () => this.navigate('saved');
    }
    if (navLog) {
      navLog.onclick = () => this.navigate('log');
    }
    if (navAnalytics) {
      navAnalytics.onclick = () => {
        native.hapticLight();
        this.openModal('analytics');
      };
    }
    if (navJournal) {
      navJournal.onclick = () => {
        native.hapticLight();
        this.openModal('journal');
      };
    }
  }

  openModal(modalKey) {
    if (this.modals[modalKey]) {
      this.modals[modalKey].open(this);
    }
  }

  loadWorkoutTemplate(tpl) {
    logWorkoutView.loadTemplate(tpl, this);
  }

  showToast(message) {
    let toast = document.getElementById('globalAppToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalAppToast';
      toast.className = 'fixed top-12 left-1/2 transform -translate-x-1/2 z-[9999999] bg-white text-black px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl flex items-center space-x-2 transition-all duration-300 opacity-0 pointer-events-none max-w-[90%] text-center';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ph-fill ph-check-circle text-base text-emerald-600"></i><span>${message}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -8px)';
    }, 2800);
  }
}

export const router = new AppRouter();

document.addEventListener('DOMContentLoaded', () => {
  router.init();
});
