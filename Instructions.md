# Whispered - Setup & Contribution Instructions

## Quick Start (Most Important)

1. Clone the repo
2. Copy `.env.example` to `.env.local` and add your Clerk key
3. Install dependencies with `pnpm install`
4. Run with `pnpm dev` or `npx expo start --clear`

---

## For Mac Users

### 1. Clone the Repository

```bash
git clone https://github.com/jatencio081509-cell/Whispered.git
cd Whispered
```

### 2. Set Up Environment Variables (Required)

```bash
cd artifacts/whispered
cp .env.example .env.local
```

Then edit `.env.local` and replace the placeholder with your real Clerk key:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_real_key_here
```

> **Important:** Never commit `.env.local`. It is already ignored by `.gitignore`.

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the App

```bash
pnpm dev
```

Or:
```bash
npx expo start --clear
```

### 5. Pulling & Pushing Changes

```bash
git pull origin main
git add .
git commit -m "Your message"
git push origin main
```

---

## For Windows Users

### 1. Clone the Repository

```bash
git clone https://github.com/jatencio081509-cell/Whispered.git
cd Whispered
```

### 2. Set Up Environment Variables (Required)

```bash
cd artifacts\whispered
copy .env.example .env.local
```

Edit `.env.local` and add your Clerk key.

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the App

```bash
pnpm dev
```

### 5. Pulling & Pushing Changes

Same as Mac instructions above.

---

## Errors & Troubleshooting

### Missing Clerk Key Error
If you see:
> `Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Fix:** Make sure you created `.env.local` with your key and restarted with `npx expo start --clear`.

### useUser can only be used within ClerkProvider
Usually happens when the Clerk key is missing or there are duplicate Clerk packages.

**Fix:**
```bash
cd artifacts/whispered
rm -rf node_modules pnpm-lock.yaml
pnpm install
npx expo start --clear
```

### Other common errors
See the full list in the sections below.

---

## Full Detailed Sections

(Previous detailed sections for Mac/Windows + all error categories remain below for reference)

### Installation & Dependency Errors

#### `npm install` fails or hangs
**Fix:** Use `pnpm install` instead (this project is designed for pnpm).

#### `EBADPLATFORM` or rollup errors
**Fix:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### `EACCES` permission error (Mac)
**Fix:**
```bash
sudo npm install -g pnpm
# Then use pnpm going forward
```

#### `Unsupported protocol` (`catalog:` or `workspace:`)
This project uses pnpm-specific features. Always use:
```bash
pnpm install
```

#### `ERESOLVE` peer dependency conflict
**Fix:**
```bash
pnpm install
```

#### Installing a specific package version
```bash
pnpm add package-name@version
pnpm install
```

### Expo & Development Server Errors

#### iOS Bundling failed (VirtualView codegen error)
**Fix:**
```bash
rm -rf node_modules pnpm-lock.yaml .expo
pnpm store prune
pnpm install
npx expo start --clear
```

#### "Unable to resolve module"
**Fix:**
```bash
npx expo start --clear
rm -rf node_modules
pnpm install
```

### Git Errors

#### Local changes would be overwritten by merge
**Fix:**
```bash
git checkout artifacts/whispered/app/_layout.tsx
git pull origin main
```

### Authentication Errors

#### Clerk key missing or `useUser` error
See the Quick Start section at the top of this file.

### Expo Doctor Issues

Run:
```bash
npx expo-doctor
```

Common fixes:
- Add missing assets (icon.png, adaptive-icon.png)
- Fix duplicate dependencies with `pnpm install`
- Simplify `metro.config.js`

---

## General Troubleshooting Commands

```bash
# Full clean
rm -rf node_modules pnpm-lock.yaml .expo
pnpm store prune
pnpm install
npx expo start --clear

# Quick restart
npx expo start --clear
```