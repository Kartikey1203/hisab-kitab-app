# ⚡ EXPO QUICK START - 5 Steps to Run

## 🎯 What You Need
- Android phone with Expo Go app
- Computer and phone on same WiFi

## 🚀 5 Simple Steps

### 1️⃣ Install Expo Go on Your Phone
- Open Play Store
- Search "Expo Go"
- Install it

### 2️⃣ Install Dependencies
```powershell
cd "e:\Hisab Kitab - App\Mobile"
npm install
```

### 3️⃣ Set Your IP Address
Find your IP:
```powershell
ipconfig
```
Look for IPv4 Address (e.g., `192.168.1.100`)

Edit `src/config.ts`:
```typescript
export const API_BASE_URL = 'http://192.168.1.100:5000'; // YOUR IP HERE
```

### 4️⃣ Start Backend
```powershell
# New PowerShell window
cd "e:\Hisab Kitab - App\Backend"
npm start
```

### 5️⃣ Start Expo & Scan QR
```powershell
# New PowerShell window
cd "e:\Hisab Kitab - App\Mobile"
npx expo start
```

**Open Expo Go → Scan QR code → Done! 🎉**

---

## ⚠️ Important
- **DO NOT** use `localhost` - use your actual IP
- **Both devices** must be on same WiFi
- **QR code** must be scanned with Expo Go app

---

## 🐛 Not Working?

### Can't connect to backend?
1. Check backend is running
2. Verify IP in `src/config.ts` matches `ipconfig`
3. Disable firewall temporarily

### QR code not working?
1. Press `s` in PowerShell to switch connection type
2. Or type URL manually in Expo Go: `exp://YOUR_IP:8081`

---

## 🎉 Success!
When it works:
- App opens on your phone
- Login/signup screen appears
- You can add people and transactions
- Changes auto-reload when you edit code

---

**Total time: ~5 minutes**  
**Android Studio needed: ❌ ZERO**  
**Emulator needed: ❌ ZERO**  
**Just your phone: ✅ YES**
