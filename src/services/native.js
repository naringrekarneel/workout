import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App } from '@capacitor/app';

class NativeService {
  constructor() {
    this.isNative = false;
    this.backButtonHandlers = [];
  }

  async init() {
    try {
      // Check if running inside Capacitor native container
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        this.isNative = true;

        // Configure dark status bar
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0d0d0f' });
        } catch (e) {
          console.warn('StatusBar not available', e);
        }

        // Hide splash screen after slight smooth delay
        try {
          setTimeout(async () => {
            await SplashScreen.hide({ fadeOutDuration: 400 });
          }, 300);
        } catch (e) {
          console.warn('SplashScreen hide error', e);
        }

        // Hardware back button handler for Android
        App.addListener('backButton', ({ canGoBack }) => {
          // If custom handlers (like closing modals or going back to dashboard)
          for (const handler of this.backButtonHandlers) {
            if (handler()) {
              return; // Handler consumed the event
            }
          }

          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      }
    } catch (err) {
      console.warn('Capacitor initialization warning:', err);
    }
  }

  registerBackHandler(handler) {
    this.backButtonHandlers.unshift(handler);
    return () => {
      this.backButtonHandlers = this.backButtonHandlers.filter(h => h !== handler);
    };
  }

  async hapticLight() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Fallback or ignore in browser
    }
  }

  async hapticMedium() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Fallback
    }
  }

  async hapticSuccess() {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      // Fallback
    }
  }

  async hapticWarning() {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      // Fallback
    }
  }

  // Audio chime for rest countdown completion
  playTimerChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio chime not supported', e);
    }
  }
}

export const native = new NativeService();
