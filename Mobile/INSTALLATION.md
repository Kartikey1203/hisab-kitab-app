# Installation & Setup Instructions

## 🚀 Quick Installation

Open PowerShell in the Mobile folder and run:

```powershell
npm install
```

This will install all required dependencies:
- React & React Native
- React Navigation (Stack & Tabs)
- AsyncStorage
- All development tools

## ⏱️ Installation Time

- **First time:** ~5-10 minutes (downloading packages)
- **After first time:** ~1-2 minutes

## 📦 What Gets Installed

### Production Dependencies
- `react` & `react-native` - Core framework
- `@react-navigation/*` - Navigation libraries
- `@react-native-async-storage/async-storage` - Data persistence
- `react-native-gesture-handler` - Touch gestures
- `react-native-reanimated` - Animations
- `react-native-safe-area-context` - Safe area support
- `react-native-screens` - Native screen components
- `axios` - HTTP client (optional, using fetch)

### Development Dependencies
- TypeScript
- Babel
- ESLint
- Jest
- Prettier

## 🔍 Verify Installation

After `npm install`, verify everything is installed:

```powershell
# Check if node_modules exists
dir node_modules

# Check React Native CLI
npx react-native --version

# Check if all peer dependencies are satisfied
npm ls
```

## ⚙️ Post-Installation Setup

### 1. Update Backend URL
Edit `src/config.ts`:
```typescript
export const API_BASE_URL = 'http://10.0.2.2:5000';
```

### 2. Start Metro Bundler
```powershell
npm start
```

### 3. Run on Android (in a new terminal)
```powershell
npm run android
```

## 🐛 Troubleshooting Installation

### Issue: "npm install" fails

**Solution 1:** Clear npm cache
```powershell
npm cache clean --force
npm install
```

**Solution 2:** Delete node_modules and reinstall
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Peer dependency warnings

These are usually safe to ignore. If you want to fix them:
```powershell
npm install --legacy-peer-deps
```

### Issue: "Cannot find module"

Run:
```powershell
npm install
npx react-native start --reset-cache
```

## 📱 React Native Environment Setup

Before running the app, you need:

### For Windows (Android Development)

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - During installation, make sure to install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device

2. **Install JDK 17**
   - Download from: https://adoptium.net/
   - Or use: `choco install microsoft-openjdk17`

3. **Set Environment Variables**
   ```powershell
   # Add to System Environment Variables
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.x
   
   # Add to PATH
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. **Verify Setup**
   ```powershell
   # Check Java
   java -version
   
   # Check Android SDK
   adb version
   
   # Check React Native doctor
   npx react-native doctor
   ```

## 🎯 Complete Setup Checklist

- [ ] Node.js installed (v18+)
- [ ] npm install completed
- [ ] Android Studio installed
- [ ] JDK 17 installed
- [ ] Environment variables set (ANDROID_HOME, JAVA_HOME)
- [ ] Android emulator created OR physical device connected
- [ ] Backend running on port 5000
- [ ] `src/config.ts` updated with correct API URL

## 🚀 First Run

Once everything is installed:

1. **Start Backend:**
   ```powershell
   cd ..\Backend
   npm start
   ```

2. **Start Metro (in new terminal):**
   ```powershell
   cd ..\Mobile
   npm start
   ```

3. **Run App (in another new terminal):**
   ```powershell
   cd ..\Mobile
   npm run android
   ```

## 📚 Additional Resources

- **React Native Setup:** https://reactnative.dev/docs/environment-setup
- **Android Studio:** https://developer.android.com/studio/intro
- **Troubleshooting:** https://reactnative.dev/docs/troubleshooting

## 💡 Pro Tips

1. **Use Windows Terminal** for better experience
2. **Keep Metro running** in a separate terminal
3. **Enable auto-reload** in dev menu (shake device / Ctrl+M)
4. **Use Android Studio AVD Manager** to create fast emulators
5. **Enable Hyper-V** for faster Android emulator

## ⚡ Speed Up Development

### Enable Fast Refresh
Automatically enabled - your changes reload instantly!

### Use Android 11+ Emulator
Faster than older versions.

### Increase Memory for Gradle
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

---

**Ready? Run `npm install` and let's go! 🚀**
