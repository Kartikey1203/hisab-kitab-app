# Quick Start - Hisab Kitab Mobile

## ⚡ Super Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd "e:\Hisab Kitab - App\Mobile"
npm install
```

### 2. Update Backend URL
Edit `src/config.ts`:
```typescript
// For Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:5000';

// For Physical Device (replace with your IP)
export const API_BASE_URL = 'http://192.168.1.XXX:5000';
```

### 3. Start Backend
```bash
cd "../Backend"
npm start
```

### 4. Run Mobile App
```bash
cd "../Mobile"

# For Android
npm run android

# For iOS (macOS only)
npm run ios
```

## 🎯 What Changed from Web to Mobile?

| Web Version | Mobile Version | Change |
|------------|----------------|--------|
| `localStorage` | `AsyncStorage` | Native storage |
| React Router | React Navigation | Native navigation |
| CSS/Tailwind | StyleSheet | React Native styles |
| `<div>`, `<button>` | `<View>`, `<TouchableOpacity>` | Native components |
| `fetch` API | Same `fetch` API | ✅ No change |
| Backend API | Same Backend API | ✅ No change |

## 📱 Key Features

✅ **Same backend** - No changes needed!  
✅ **Async Storage** - Persistent login  
✅ **Native Navigation** - Smooth transitions  
✅ **Touch Optimized** - Mobile-first UI  
✅ **Pull to Refresh** - Native gestures  

## 🛠️ Common Commands

```bash
# Start development
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Clear cache
npm start -- --reset-cache

# Build debug APK
cd android && .\gradlew assembleDebug

# Build release APK
cd android && .\gradlew assembleRelease
```

## 📦 What's Included

```
Mobile/
├── src/
│   ├── api/          ← AsyncStorage + fetch
│   ├── screens/      ← 5 main screens
│   ├── navigation/   ← Tab + Stack navigation
│   └── config.ts     ← API endpoint config
├── App.tsx           ← Root component
└── package.json      ← Dependencies
```

## 🎨 Screens

1. **AuthScreen** - Login & Signup
2. **HomeScreen** - People list with balances
3. **PersonDetailScreen** - Transaction history
4. **AddPersonScreen** - Add new person
5. **ProfileScreen** - User profile & logout

## 🚀 Next Steps

1. **Test it:** Run the app and login
2. **Customize:** Update colors, branding
3. **Build APK:** Follow SETUP_GUIDE.md
4. **Deploy:** Share APK or publish to Play Store

## ❓ Need Help?

- Full setup guide: `SETUP_GUIDE.md`
- React Native docs: https://reactnative.dev
- Backend is in `../Backend` folder

---

**Ready to go! Just run `npm install` then `npm run android` 🎉**
