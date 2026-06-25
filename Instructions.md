# Whispered - Setup & Contribution Instructions

This guide is separated into **Mac** and **Windows** sections for clarity, followed by a comprehensive **Errors & Troubleshooting** section.

---

## For Mac Users

### 1. Clone the Repository

```bash
git clone https://github.com/jatencio081509-cell/Whispered.git
cd Whispered
```

### 2. Install Dependencies

```bash
cd artifacts/whispered
npm install

# Optional: If you prefer pnpm
# pnpm install
```

### 3. Run the App with Expo Go

```bash
npx expo start --clear
```

- Open the **Expo Go** app on your iPhone or Android.
- Scan the QR code shown in the terminal.
- Make sure your phone and Mac are on the same Wi-Fi.

### 4. Pulling New Commits (Getting Latest Changes)

```bash
git pull origin main
```

After pulling, reinstall dependencies if new packages were added:

```bash
npm install
```

### 5. Pushing Your Changes

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

---

## For Windows Users

### 1. Clone the Repository

Open **Command Prompt** or **PowerShell** and run:

```bash
git clone https://github.com/jatencio081509-cell/Whispered.git
cd Whispered
```

### 2. Install Dependencies

```bash
cd artifacts\whispered
npm install

# Optional: If you prefer pnpm
# pnpm install
```

### 3. Run the App with Expo Go

```bash
npx expo start --clear
```

- Open the **Expo Go** app on your Android or iPhone.
- Scan the QR code shown in the terminal.
- Make sure your phone and PC are on the same Wi-Fi network.

### 4. Pulling New Commits (Getting Latest Changes)

```bash
git pull origin main
```

After pulling, reinstall dependencies if needed:

```bash
npm install
```

### 5. Pushing Your Changes

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

---

## Errors & Troubleshooting

This section is organized by category to help you quickly find and fix issues.

### 1. Installation & Dependency Errors

#### `npm install` fails or hangs
**Fix:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### `EBADPLATFORM` or rollup-related platform errors
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install --no-optional --ignore-scripts --legacy-peer-deps
```

#### `Unsupported protocol` or `Unsupported URL Type` errors (e.g. `workspace:*`)
This usually happens when using `npm` instead of `pnpm` on a project that uses workspace protocols.

**Fix:**
```bash
# Option 1: Use pnpm instead
pnpm install

# Option 2: If you must use npm
npm install --legacy-peer-deps
```
If the error persists, delete lockfile and try again:
```bash
rm -rf node_modules pnpm-lock.yaml package-lock.json
pnpm install
```

#### Peer dependency warnings / errors
**Fix:**
```bash
npm install --legacy-peer-deps
```

#### `node_modules` corrupted after pulling code
**Fix:**
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### 2. Expo & Development Server Errors

#### "Unable to resolve module"
**Fix:**
```bash
npx expo start --clear
rm -rf node_modules
npm install
```

#### Metro bundler crashes or shows red screen
**Fix:**
```bash
npx expo start --clear
```

#### "JavaScript heap out of memory"
**Fix:**
```bash
export NODE_OPTIONS=--max-old-space-size=4096
npx expo start --clear
```

#### Expo Go app not connecting to dev server
- Make sure phone and computer are on the **same Wi-Fi**.
- Try `npx expo start --lan` or `--localhost`.
- Restart both your phone and computer.

### 3. Git & Version Control Errors

#### "You have divergent branches" or merge conflicts
**Fix:**
```bash
git pull --rebase origin main
# or
git pull origin main
```

#### Large file warnings when pushing
**Fix:** Add large files to `.gitignore` or use Git LFS.

#### Accidental force push issues
**Fix:** Avoid `--force` unless you're sure. Use `--force-with-lease` instead.

### 4. Authentication (Clerk) Errors

#### Sign in button does nothing
- Check the console for `[SignIn]` logs.
- Make sure you're using the latest version of the code.
- Try signing out from Clerk Dashboard → Users → End all sessions.

#### "Clerk has been loaded with development keys" warning
This is normal in development. Ignore it unless deploying to production.

#### Multiple GoTrueClient instances warning
This is caused by Clerk + Supabase both managing auth. It usually doesn't break anything but can cause weird session behavior.

### 5. Push Notification Errors

#### "No projectId found"
Make sure your `app.json` contains:
```json
"extra": {
  "eas": {
    "projectId": "your-project-id-here"
  }
}
```

#### Push token registration fails or times out
The app now handles this gracefully in the background. If it fails, notifications simply won't work until the next successful registration.

### 6. Location Errors

#### Location permission denied
- Go to your phone settings → Apps → Expo Go → Allow location access.
- On iOS, also check **Precise Location**.

#### Location not updating / "Distance unavailable"
- Make sure both users have opened the app recently (location updates every 30 seconds).
- Check if one person has manually entered an address.

### 7. Rare / Miscellaneous Errors

#### TypeScript errors after pulling code
**Fix:**
```bash
npx tsc --noEmit
```

#### Supabase connection errors
- Check your Supabase URL and keys in environment variables.
- Make sure you're using the correct Supabase client (`supabase` vs `supabaseAdmin`).

#### App works on one device but not another
- Clear cache: `npx expo start --clear`
- Make sure both devices are using the latest version of the code.

### General Troubleshooting Commands

Try these in order when you're stuck:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo install --fix
npx expo start --clear
```