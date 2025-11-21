# 🚀 Hisab Kitab Mobile - EXPO Setup (NO Android Studio Needed!)

## ✨ Why Expo?

✅ **NO Android Studio** required  
✅ **NO Android SDK** installation  
✅ **NO Emulator** needed  
✅ **Run on your phone instantly** with QR code  
✅ **Super easy** setup in 5 minutes  

## 📋 What You Need

1. ✅ Your **Android phone**
2. ✅ **Expo Go app** (from Play Store)
3. ✅ Your computer with Node.js
4. ✅ Both on the **same WiFi network**

## 🎯 Quick Setup (5 Minutes)

### Step 1: Download Expo Go on Your Phone (1 min)

On your Android phone:
1. Open **Google Play Store**
2. Search for **"Expo Go"**
3. Download and install it
4. Open the app (you'll use it later)

### Step 2: Install Dependencies (2 min)

On your computer, in PowerShell:

```powershell
cd "e:\Hisab Kitab - App\Mobile"
npm install
```

This installs Expo SDK and all dependencies.

### Step 3: Update Backend URL (1 min)

Edit `src/config.ts` and set your **computer's IP address**:

```typescript
// Find your IP: Open PowerShell and type: ipconfig
// Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.1.100)

export const API_BASE_URL = 'http://192.168.1.100:5000'; // Replace with YOUR IP
```

⚠️ **Important**: 
- Do NOT use `localhost` - it won't work on your phone
- Do NOT use `10.0.2.2` - that's for emulators only
- Use your actual WiFi IP address (like `192.168.1.100`)

**To find your IP:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

### Step 4: Start Backend Server (1 min)

In a **new PowerShell window**:

```powershell
cd "e:\Hisab Kitab - App\Backend"
npm start
```

Your backend should now be running on port 5000.

### Step 5: Start Expo (1 min)

In **another new PowerShell window**:

```powershell
cd "e:\Hisab Kitab - App\Mobile"
npx expo start
```

You'll see:
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

### Step 6: Scan QR Code with Expo Go (10 seconds)

1. Open **Expo Go app** on your Android phone
2. Tap **"Scan QR code"**
3. Point your camera at the QR code in PowerShell
4. Wait 5-10 seconds
5. **App opens on your phone!** 🎉

## 🎉 You're Done!

The app should now be running on your phone! You can:
- Login/Signup
- Add people
- Add transactions
- See balances

## 🔄 Making Changes

When you edit code:
1. Save the file
2. **App auto-reloads on your phone** instantly!
3. No need to rebuild or restart

## 📱 Alternative Ways to Open

Instead of QR code, you can also:

1. **Type 'a' in PowerShell** (if you had Expo Go open before)
2. **Open Expo Go** → See your recent projects → Tap to open

## 🐛 Troubleshooting

### Problem: QR code doesn't work

**Solution 1:** Make sure phone and computer are on **same WiFi**

**Solution 2:** In PowerShell, press `s` to switch connection type

**Solution 3:** Open Expo Go → Type the URL manually:
```
exp://192.168.1.100:8081
```

### Problem: "Unable to connect to backend"

**Solution:**
1. Check if backend is running (`cd Backend && npm start`)
2. Verify your IP address in `src/config.ts`
3. Make sure firewall isn't blocking port 5000
4. Try: `http://YOUR_IP:5000` instead of `localhost`

### Problem: "Network request failed"

**Solution:**
1. Both phone and PC must be on **same WiFi**
2. Update `src/config.ts` with correct IP
3. Restart backend server
4. Restart Expo (`Ctrl+C` then `npx expo start`)

### Problem: App shows blank screen

**Solution:**
1. Shake your phone (opens dev menu)
2. Tap "Reload"
3. Or press `r` in PowerShell to reload

### Problem: Changes not reflecting

**Solution:**
1. Make sure you saved the file
2. Press `r` in PowerShell to reload
3. Or shake phone → "Reload"

## 🎯 PowerShell Commands

While Expo is running, press:
- `r` - Reload app
- `m` - Toggle menu
- `s` - Switch connection type
- `c` - Clear cache and reload
- `d` - Open developer menu on phone
- `Ctrl+C` - Stop Expo

## 📦 Building APK (Optional)

When you're ready to create a standalone APK:

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

The APK will be available to download from Expo servers.

**Or build locally (requires Android Studio):**
```powershell
npx expo prebuild
npx expo run:android
```

## 🔧 Project Structure

```
Mobile/
├── App.tsx                 # Main entry point
├── app.json                # Expo configuration
├── src/
│   ├── screens/           # All screens
│   ├── navigation/        # Navigation setup
│   ├── api/              # API + AsyncStorage
│   ├── types/            # TypeScript types
│   └── config.ts         # Backend URL (EDIT THIS!)
└── assets/               # Images (optional)
```

## 💡 Pro Tips

1. **Keep terminals organized:**
   - Terminal 1: Backend (`npm start`)
   - Terminal 2: Expo (`npx expo start`)

2. **Shake phone** to open developer menu

3. **Enable Fast Refresh** (usually on by default)

4. **Use Expo Go** for development, build APK for production

5. **Check Expo Go logs** for errors

## 🌐 Network Setup

Your setup should look like:

```
[Computer (192.168.1.100)]  ←→  [WiFi Router]  ←→  [Phone (192.168.1.X)]
     ↓                                                     ↓
Backend (port 5000)                              Expo Go App
Expo Metro (port 8081)
```

Both devices **must be on same WiFi** for this to work.

## 📚 Learn More

- **Expo Docs**: https://docs.expo.dev/
- **Expo Go**: https://expo.dev/client
- **EAS Build**: https://docs.expo.dev/build/introduction/

## ❓ Common Questions

**Q: Do I need Android Studio?**  
A: No! That's the beauty of Expo Go.

**Q: Can I test on iOS?**  
A: Yes! Download Expo Go from App Store and scan the same QR code.

**Q: Does this work offline?**  
A: Expo Go needs internet for first load. After that, app data works offline with AsyncStorage.

**Q: Can I publish to Play Store?**  
A: Yes! Use `eas build` to create production APK, then upload to Play Store.

**Q: Is Expo slower than React Native CLI?**  
A: For development: No difference. For production: Use EAS Build for optimized APK.

---

## 🚀 Complete Checklist

- [ ] Expo Go installed on phone
- [ ] Both phone & computer on same WiFi
- [ ] `npm install` completed
- [ ] Backend URL in `src/config.ts` updated with your IP
- [ ] Backend running (`cd Backend && npm start`)
- [ ] Expo running (`npx expo start`)
- [ ] QR code scanned with Expo Go
- [ ] App running on phone!

---

**That's it! You're now developing with Expo - the easiest way to build React Native apps! 🎉**

**No Android Studio. No Emulator. Just scan and go! 🚀**
