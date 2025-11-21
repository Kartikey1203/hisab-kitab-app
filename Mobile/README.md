# Hisab Kitab Mobile App 📱

React Native mobile app using **Expo** - run on your phone instantly with NO Android Studio!

## ✨ Why Expo?

✅ **NO Android Studio** required  
✅ **NO Emulator** needed  
✅ **Scan QR code** and run on your phone instantly  
✅ **Fast Refresh** - changes reload automatically  
✅ **Super easy** setup in 5 minutes  

## 🚀 Super Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Edit src/config.ts with your IP address

# 3. Start backend (new terminal)
cd ../Backend && npm start

# 4. Start Expo
npx expo start

# 5. Scan QR with Expo Go app on your phone
```

## 📚 Documentation

- **[EXPO_QUICKSTART.md](EXPO_QUICKSTART.md)** - ⚡ 5-minute setup
- **[EXPO_SETUP.md](EXPO_SETUP.md)** - Complete Expo guide with troubleshooting
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture

## 📱 What You Need

1. **Android phone** with Expo Go app (from Play Store)
2. **Computer** with Node.js installed
3. Both on the **same WiFi network**
4. Backend server running

## 🎯 Installation Steps

### 1. Install Expo Go on Phone
- Open Play Store
- Search "Expo Go"
- Download and install

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Backend URL
Find your computer's IP address:
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

Edit `src/config.ts`:
```typescript
export const API_BASE_URL = 'http://192.168.1.100:5000'; // Use YOUR IP
```

⚠️ **Important**: Don't use `localhost` - use your actual IP address

### 4. Start Backend Server
```bash
cd ../Backend
npm start
```

### 5. Start Expo
```bash
npx expo start
```

A QR code will appear in your terminal.

### 6. Open on Your Phone
1. Open Expo Go app
2. Tap "Scan QR code"
3. Point camera at the QR code
4. App loads on your phone! 🎉

## Building APK for Android

### Debug APK
```bash
cd android
./gradlew assembleDebug
```
The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK
1. Generate a signing key (if you don't have one):
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`

3. Build the release APK:
```bash
cd android
./gradlew assembleRelease
```
The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
Mobile/
├── src/
│   ├── api/           # API service with AsyncStorage
│   ├── components/    # Reusable components
│   ├── screens/       # App screens
│   ├── navigation/    # Navigation configuration
│   ├── types/         # TypeScript types
│   └── config.ts      # App configuration
├── android/           # Android native code
├── ios/              # iOS native code
└── App.tsx           # Root component
```

## Features

- ✅ User authentication (login/signup)
- ✅ Manage people and transactions
- ✅ Personal expense tracking
- ✅ Friend requests
- ✅ Offline data persistence with AsyncStorage
- ✅ Beautiful UI with native components

## Backend Integration

This app connects to the same Node.js + Express + MongoDB backend as the web version. Make sure your backend is running and accessible from your device/emulator.
