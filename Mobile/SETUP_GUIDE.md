# Hisab Kitab Mobile - Complete Setup Guide

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 18 or higher)
   ```bash
   node --version
   ```

2. **React Native Development Environment**
   - Follow the official guide: https://reactnative.dev/docs/environment-setup
   - Select "React Native CLI Quickstart" (NOT Expo Go)
   - Choose your OS and target platform (Android/iOS)

3. **For Android Development:**
   - Android Studio installed
   - Android SDK installed (API level 31 or higher)
   - ANDROID_HOME environment variable set
   - Java Development Kit (JDK 17)

4. **For iOS Development (macOS only):**
   - Xcode installed (version 12 or higher)
   - CocoaPods installed
   ```bash
   sudo gem install cocoapods
   ```

## 🚀 Step-by-Step Installation

### Step 1: Navigate to Mobile folder
```bash
cd "e:\Hisab Kitab - App\Mobile"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Backend URL

Edit `src/config.ts` and set your backend URL:

**For Android Emulator:**
```typescript
export const API_BASE_URL = 'http://10.0.2.2:5000';
```

**For iOS Simulator:**
```typescript
export const API_BASE_URL = 'http://localhost:5000';
```

**For Physical Device (on same WiFi network):**
```typescript
export const API_BASE_URL = 'http://192.168.1.XXX:5000';
// Replace XXX with your computer's IP address
```

To find your IP address:
- Windows: `ipconfig` (look for IPv4 Address)
- macOS/Linux: `ifconfig` or `ip addr`

### Step 4: Start Your Backend Server

Make sure your Node.js backend is running:
```bash
cd "../Backend"
npm start
```

The backend should be running on port 5000.

### Step 5: Run the Mobile App

#### For Android:

1. Start an Android emulator from Android Studio, OR connect a physical device via USB with USB debugging enabled

2. Run the app:
```bash
npm run android
```

Or use:
```bash
npx react-native run-android
```

#### For iOS (macOS only):

1. Install pods:
```bash
cd ios
pod install
cd ..
```

2. Run the app:
```bash
npm run ios
```

Or use:
```bash
npx react-native run-ios
```

## 🏗️ Building APK for Android

### Debug APK (for testing)

```bash
cd android
.\gradlew assembleDebug
```

The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution)

1. **Generate a signing key:**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Remember the password you enter!

2. **Configure Gradle:**

Edit `android/gradle.properties` and add:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

Edit `android/app/build.gradle` and add signing config:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Build the release APK:**
```bash
cd android
.\gradlew assembleRelease
```

The release APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📱 Installing APK on Physical Device

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in your device settings
3. Open the APK file and install

## 🔧 Troubleshooting

### Metro Bundler Issues
If you see "Unable to resolve module":
```bash
npm start -- --reset-cache
```

### Android Build Failures
Clear build cache:
```bash
cd android
.\gradlew clean
cd ..
npm run android
```

### Connection Issues
Make sure:
- Your backend is running
- Your device/emulator can reach the backend URL
- Firewall isn't blocking the connection
- For physical devices: Both device and computer are on same WiFi network

### Port Already in Use
Kill the process using port 8081:
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8081 | xargs kill
```

## 📦 Project Structure

```
Mobile/
├── src/
│   ├── api/
│   │   └── index.ts          # API service with AsyncStorage
│   ├── screens/
│   │   ├── AuthScreen.tsx    # Login/Signup
│   │   ├── HomeScreen.tsx    # People list
│   │   ├── PersonDetailScreen.tsx
│   │   ├── AddPersonScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Navigation setup
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── config.ts             # API configuration
├── android/                   # Android native code
├── ios/                      # iOS native code
├── App.tsx                   # Root component
├── index.js                  # App entry point
└── package.json
```

## 🎨 Features Implemented

- ✅ User authentication (AsyncStorage)
- ✅ People management
- ✅ Transaction tracking
- ✅ Balance calculations
- ✅ Beautiful native UI
- ✅ Pull to refresh
- ✅ Tab navigation
- ✅ Stack navigation

## 🚀 Next Steps

1. Test the app thoroughly
2. Add more features from the web version:
   - Friend requests
   - Personal expenses
   - Notifications
   - Image uploads
3. Optimize performance
4. Add offline support
5. Publish to Play Store/App Store

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## ⚠️ Important Notes

- Keep your backend API_BASE_URL updated in `src/config.ts`
- The app uses AsyncStorage instead of localStorage
- All HTTP requests use the same backend APIs as the web version
- Make sure your backend allows CORS from mobile origins

## 🎉 Success!

If everything is set up correctly, you should now have:
- A running React Native app on your device/emulator
- Connectivity to your backend API
- Ability to login, add people, and manage transactions

Happy coding! 🚀
