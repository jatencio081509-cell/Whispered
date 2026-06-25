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

**Recommended:** Use `pnpm` (this project uses pnpm workspaces and catalogs):

```bash
cd artifacts/whispered
pnpm install
```

Alternative (if you prefer npm):
```bash
npm install --legacy-peer-deps
```

### 3. Run the App with Expo Go

**Using pnpm (Recommended):**
```bash
pnpm dev
```

Or simply:
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
pnpm install
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

**Recommended:** Use `pnpm`:

```bash
cd artifacts\whispered
pnpm install
```

Alternative:
```bash
npm install --legacy-peer-deps
```

### 3. Run the App with Expo Go

**Using pnpm (Recommended):**
```bash
pnpm dev
```

Or:
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
pnpm install
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

#### `EACCES: permission denied` when installing global packages (e.g. pnpm)
This is very common on Mac.

**Quick Fix:**
```bash
sudo npm install -g pnpm
```

**Better Long-Term Fix:**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
source ~/.zshrc
npm install -g pnpm
```

#### `Unsupported protocol` or `Unsupported URL Type` (`workspace:*` or `catalog:`)
This project uses **pnpm Catalogs** and **Workspaces**.

`npm` does **not** support these. Use `pnpm` instead.

**Fix:**
```bash
npm install -g pnpm
cd artifacts/whispered
pnpm install
```

#### `ERESOLVE unable to resolve dependency tree` (peer dependency conflict)
This happens because of version mismatches between `expo` and `@clerk/expo`.

**Fix:**
```bash
cd artifacts/whispered
pnpm install
```

If you must use npm:
```bash
npm install --legacy-peer-deps
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
This is caused by Clerk + Supabase both managing auth.

### 5. Push Notification Errors

#### "No projectId found"
Make sure your `app.json` contains the `projectId` under `extra.eas`.

#### Push token registration fails or times out
Handled gracefully in the background.

### 6. Location Errors

#### Location permission denied
Check phone settings → Expo Go → Location access.

#### Location not updating / "Distance unavailable"
Ensure both users have recently opened the app.

### 7. Rare / Miscellaneous Errors

#### TypeScript errors after pulling code
```bash
npx tsc --noEmit
```

#### Supabase connection errors
Check Supabase credentials and client usage.

#### App works on one device but not another
```bash
npx expo start --clear
```

### General Troubleshooting Commands

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo install --fix
npx expo start --clear
```