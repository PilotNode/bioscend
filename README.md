<div align="center">
  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 16px; border-radius: 12px; display: inline-block; margin-bottom: 16px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  </div>
  
  # BioScend
  
  **Elevate Your Biology & Mind** 🧬🧠
  
  An intelligent wellness and longevity tracker that utilizes AI insights, holistic routine optimization, and deep personal analytics via beautiful charts. Built entirely with local-first and secure-cloud architecture.

  ![Version](https://img.shields.io/badge/version-15.06.26-blue.svg)
  ![Engine](https://img.shields.io/badge/AI-Configurable-purple.svg)
  ![Platform](https://img.shields.io/badge/Platform-Web_|_Android-green.svg)
</div>

---

## ✨ Key Features

- 🤖 **AI-Powered Insights (Gemini)**: Acts as your personal health data scientist, analyzing correlation data to provide timing, dosing, and stacking recommendations.
- 📊 **Smart Analytics**: Real-time graphing algorithms built on Recharts to show progress timelines and direct habit correlations over time.
- 💊 **Holistic Routine Tracking**: Consolidates supplements, physical well-being activities, mood, and sleep into a single intuitive interface.
- 🔒 **Privacy-First (IndexedDB + Firebase)**: Keeps your primary operational datasets entirely isolated locally while periodically syncing cross-device with secure Firebase authorization.
- 🌙 **Modern UX**: A premium, glassmorphic dark-mode design to reduce eye strain, emphasizing clear data presentation.

## 🛠 Tech Stack

* **Frontend**: React 18, Vite, TailwindCSS (for utility-first styling) + Lucide (icons)
* **Mobile / Packaging**: Capacitor (with native capacitor plugins for Push & Sync)
* **Auth & DB**: Firebase (Authentication & Firestore)
* **Local Caching**: IndexedDB (using `idb` wrapper)
* **Analytics**: Recharts
* **AI Engine**: `@google/generative-ai` SDK (Gemini API)

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- Node.js (v18+)
- Android Studio (for Android build deployment)
- Firebase console account with Google Sign-In & Firestore configured.
- A Gemini API Key from Google AI Studio.

### 2. Environment Variables
Create a `.env` file at the root of the project with your configurations:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the web bundle (outputs to /dist)
npm run build
```

---

## 📱 Compiling for Android (Capacitor)

We utilize the custom packaged script `sync-android.bat` to streamline the web-to-Android pipeline.

1. First, make sure you've built the most recent web asset payload:
   ```bash
   npm run build
   ```
2. Sync the Capacitor configs and web assets to the Android folder setup:
   ```bash
   # Run the script:
   ./sync-android.bat
   # OR run manually: npx cap sync android
   ```
3. Open the IDE:
   ```bash
   npx cap open android
   ```
4. In Android Studio, sync Gradle, construct your debug APK, or generate a signed bundle/release apk.

---

## 🔧 Troubleshooting & Known Issues

### "No Credentials Available" (Google Sign-In on Signed APK)
If Google Sign-In works correctly when debugging over USB, but fails with `"No Credentials Available"` on a fully produced **Signed APK**:
* **Root Cause**: The Google OAuth system evaluates certificate fingerprints rigorously. Your debug keystore SHA-1 is completely different from your Release Keystore SHA-1. 
* **Fix Steps**:
  1. Retrieve your release keystore SHA-1 fingerprint:
     ```bash
     keytool -list -v -keystore "/path/to/keystore.jks" -alias "your_alias"
     ```
  2. Paste the SHA-1 into the Firebase Developer Console `Project Settings > Android Apps`.
  3. Re-download your `google-services.json` file.
  4. Place the newly created JSON file inside `android/app/google-services.json`. Re-build the APK and run it.

*Note: For security reasons, changes to keystores and Google App identifiers (`*.jks`) are intentionally excluded via standard `.gitignore` rules in the `android/` directory.*

---
<div align="center">
  <sub>Developed for the relentless pursuit of bio-harmony and longevity.</sub>
</div>
>>>>>>> Stashed changes
