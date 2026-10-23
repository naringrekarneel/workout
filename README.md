# Workouts Mobile App (Capacitor & Web)

[![Deploy to GitHub Pages](https://github.com/naringrekarneel/workout/actions/workflows/deploy.yml/badge.svg)](https://github.com/naringrekarneel/workout/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://naringrekarneel.github.io/workout/)

> 🌐 **Live Web App**: [https://naringrekarneel.github.io/workout/](https://naringrekarneel.github.io/workout/)

A cross-platform mobile fitness and workout tracker converted from multi-page web prototypes into a single-page application (SPA) powered by **Capacitor 8**, **Vite**, **Tailwind CSS**, and **Chart.js**.

---

## 🚀 Features

- **Native Mobile Experience**:
  - Full-screen edge-to-edge layout with notch and navigation bar safe area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
  - Dark native status bar configured with `@capacitor/status-bar`.
  - Native splash screen handling with `@capacitor/splash-screen`.
  - Native haptic feedback on button presses, timers, set completion, and deletions using `@capacitor/haptics`.
  - Android hardware back button integration using `@capacitor/app`.
- **100% Offline Capability**:
  - Phosphor icon fonts, Chart.js, and Tailwind CSS styles are locally bundled in Vite — no external CDN dependencies.
- **Gym-Ready Workout Tracking**:
  - Live elapsed workout stopwatch that **keeps running in the background** while switching views.
  - Rest stopwatch & countdown timer (30s, 60s, 90s, 2m presets) with synthesized audio chime and native haptic alert.
  - Multi-category exercise management: **Weighted**, **Bodyweight**, and **Mix** (weighted calisthenics).
  - Routine splits manager and reusable template copying.
- **Dashboard & Analytics**:
  - Real-time streak tracking and GitHub-style activity calendar heatmap.
  - Weight progress tracking with interactive Chart.js line graph and unit switcher (kg / lbs).
  - Volume & Muscle Group Distribution (doughnut and weekly volume charts).
- **Daily Recovery Journal & Readiness Score**:
  - Readiness score algorithm based on sleep hours, energy levels, soreness (DOMS), and water hydration.
- **Profile & Offline JSON Backup**:
  - Complete personal data management and JSON export/import for cross-device migration.

---

## 🛠️ CLI Commands & Workflow

### 1. Web Preview / Development
Run the app in your browser with hot module replacement:
```bash
npm run dev
```

### 2. Build Web Bundle
Compile and bundle all assets to `dist/`:
```bash
npm run build
```

### 3. Sync with Native Android
Build web assets and synchronize with the native Android project:
```bash
npm run cap:build
```

### 4. Open in Android Studio
Launch Android Studio with the Android project:
```bash
npm run cap:open
# or
npx cap open android
```

### 5. Run Directly on Connected Device / Emulator
Build and install the app directly onto an attached Android phone or emulator:
```bash
npm run cap:run
# or
npx cap run android
```

---

## 📦 Built APK Location

The debug APK has already been compiled and is ready to install or test:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

To install on a connected Android device via ADB:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📁 Project Structure

```
├── android/                   # Native Android project (Capacitor)
│   └── app/build/outputs/apk/ # Generated APKs
├── dist/                      # Production bundled web assets (offline)
├── legacy_backup/             # Backup of the original HTML prototypes
├── src/
│   ├── main.js                # App bootstrap & view router
│   ├── services/
│   │   ├── native.js          # Capacitor plugins (StatusBar, Haptics, BackButton, Audio)
│   │   └── storage.js         # Offline LocalStorage & backup layer
│   ├── styles/
│   │   └── app.css            # Tailwind & Phosphor icon fonts & mobile utilities
│   └── views/
│       ├── dashboard.js       # Dashboard view & heatmap
│       ├── log_workout.js     # Live workout session logger & timers
│       ├── saved_workouts.js  # Saved workouts history & summary
│       ├── upload_weight.js   # Body weight logger
│       ├── profile_modal.js   # User profile & JSON backup/restore
│       ├── analytics_modal.js # Volume & muscle split analytics
│       └── journal_modal.js   # Daily recovery & readiness journal
├── capacitor.config.json      # Capacitor project configuration
├── index.html                 # Main mobile app entry point
├── package.json               # Dependencies & scripts
└── vite.config.js             # Vite build configuration
```
