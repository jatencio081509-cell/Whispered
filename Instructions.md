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

### General Notes

- Always pull the latest changes before starting work:
  ```bash
  git pull origin main
  ```
- Use clear and descriptive commit messages.
- If you run into issues after pulling, try `npx expo start --clear`.