# Whispered - Setup & Contribution Instructions

This guide is separated into **Mac** and **Windows** sections for clarity.

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

## Common Errors & Fixes

### Error: `npm install` fails or gets stuck

**Possible causes:** Corrupted cache, network issues, or platform-specific packages.

**Fix:**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: `EBADPLATFORM` or rollup-related errors

This usually happens because some packages try to install macOS binaries on Windows (or vice versa).

**Fix:**

```bash
rm -rf node_modules package-lock.json
npm install --no-optional --ignore-scripts --legacy-peer-deps
```

### Error: `expo` command not found

**Fix:**

```bash
npx expo --version
```

Or reinstall the CLI:

```bash
npm install -g expo-cli
```

### Error after pulling new code: App won't start or modules are missing

**Fix:**

```bash
npx expo start --clear
```

If that doesn't work:

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Error: "No projectId found" (Push Notifications)

Make sure your `app.json` has the correct `projectId` under `extra.eas`.

### Still having issues?

Try these commands in order:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo install --fix
npx expo start --clear
```