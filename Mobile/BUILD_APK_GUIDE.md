# 📱 Build APK Guide - Hisab Kitab App

## ✅ **Option 1: EAS Build (RECOMMENDED - No Android Studio Needed)**

This builds your APK on Expo's cloud servers. **FREE for personal use!**

### **Prerequisites:**
✅ EAS CLI installed (already done!)
✅ Expo account (you'll create one if you don't have it)

---

## 🚀 **Step-by-Step Instructions:**

### **Step 1: Login to Expo**
```powershell
cd "e:\Hisab Kitab - App\Mobile"
eas login
```

**If you don't have an account:**
- It will prompt you to create one
- Use your email and create a password
- Free tier is enough!

---

### **Step 2: Configure the Project**
```powershell
eas build:configure
```

This will:
- Create `eas.json` (already created!)
- Link your project to Expo

---

### **Step 3: Build APK**
```powershell
eas build -p android --profile preview
```

**What happens:**
1. 📦 Uploads your code to Expo servers
2. ☁️ Builds APK in the cloud (takes 10-15 minutes)
3. 📥 Gives you download link when done
4. ✅ APK is ready to install!

**Why `--profile preview`?**
- Creates an APK file (not AAB)
- APK can be directly installed on Android
- No Google Play Store needed

---

### **Step 4: Download APK**
Once build completes:
1. You'll get a link in terminal
2. Click it or copy to browser
3. Download the `.apk` file
4. Transfer to your phone (USB, email, etc.)

---

### **Step 5: Install APK on Phone**

**Method A: Direct Download (Easiest)**
1. Open the download link on your phone's browser
2. Download the APK
3. Tap to install
4. Allow "Install from unknown sources" if prompted

**Method B: USB Transfer**
1. Download APK on computer
2. Connect phone via USB
3. Copy APK to phone's Downloads folder
4. On phone, use File Manager → Downloads
5. Tap the APK file
6. Install

---

## 📋 **Full Commands Summary:**

```powershell
# Navigate to project
cd "e:\Hisab Kitab - App\Mobile"

# Login (one time only)
eas login

# Configure (one time only)
eas build:configure

# Build APK
eas build -p android --profile preview

# Wait 10-15 minutes, then download from the link provided
```

---

## ⚡ **Option 2: Local Build (Requires Android Studio)**

**Only use this if you want to build locally without cloud.**

### **Prerequisites:**
- Android Studio installed
- Android SDK installed
- JDK 17 installed
- More complex setup

### **Commands:**
```powershell
# Generate native Android folder
npx expo prebuild

# Build APK locally
npx expo run:android --variant release
```

**APK Location:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎯 **Recommended: Use Option 1 (EAS Build)**

**Why?**
- ✅ No Android Studio needed
- ✅ Builds in cloud
- ✅ Free for personal use
- ✅ Easy to share APK link
- ✅ Works on any computer
- ✅ Consistent builds

---

## 🔧 **Troubleshooting:**

### **"eas: command not found"**
```powershell
npm install -g eas-cli
```

### **"Not logged in"**
```powershell
eas login
```

### **"Build failed"**
Check the build logs link provided. Common issues:
- Missing dependencies (run `npm install`)
- Invalid `app.json` config

### **"Can't install APK"**
Enable "Install from unknown sources":
- Settings → Security → Unknown Sources → Enable
- Or Settings → Apps → Special Access → Install Unknown Apps

---

## 📊 **Build Profiles Explained:**

| Profile | Use Case | Output |
|---------|----------|--------|
| `preview` | Testing APK | `.apk` file ✅ **USE THIS** |
| `production` | Google Play Store | `.aab` file |
| `development` | Development build | Development client |

---

## 💡 **Pro Tips:**

1. **First build takes longer** (15-20 min)
   - Subsequent builds are faster (5-10 min)

2. **Check build status:**
   ```powershell
   eas build:list
   ```

3. **Cancel a build:**
   ```powershell
   eas build:cancel
   ```

4. **Share APK link:**
   - The download link works for anyone
   - Share it via WhatsApp, email, etc.

5. **Update backend URL:**
   - Before building, update `src/config.ts`
   - Use your production server URL (not localhost!)
   - Or use `192.168.x.x` if testing on local network

---

## 🎉 **After Installing APK:**

1. Open the app
2. Login/Signup
3. **Important:** Make sure backend is running!
4. Update `src/config.ts` if backend URL changes

---

## 🔄 **Updating the App:**

When you make changes:

1. Update version in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Build new APK:
   ```powershell
   eas build -p android --profile preview
   ```

3. Download and install new APK
   - Old version will be replaced

---

## 🆓 **Cost:**

- **EAS Build:** FREE (up to 30 builds/month for personal use)
- **Local Build:** FREE (but requires setup)

---

## ⏱️ **Time Estimates:**

- **Setup (first time):** 5 minutes
- **Build time:** 10-15 minutes
- **Download & install:** 2 minutes
- **Total:** ~20 minutes for first APK

---

## 📞 **Need Help?**

1. Check build logs in the link provided
2. Visit: https://docs.expo.dev/build/introduction/
3. Expo Discord: https://chat.expo.dev/

---

## ✅ **Quick Start (Copy & Paste):**

```powershell
cd "e:\Hisab Kitab - App\Mobile"
eas login
eas build -p android --profile preview
```

Then wait for the download link! 🎉

---

**Ready to build? Run the commands above! 🚀**
