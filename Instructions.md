# Whispered - Setup & Contribution Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/jatencio081509-cell/Whispered.git
cd Whispered
```

## 2. Install Dependencies

```bash
cd artifacts/whispered
npm install
# or if you prefer pnpm:
# pnpm install
```

## 3. Run the App with Expo Go

```bash
npx expo start --clear
```

- Scan the QR code with the **Expo Go** app on your phone.
- Make sure your phone and computer are on the same Wi-Fi network.

## 4. Pulling New Commits (Getting Latest Changes)

```bash
git pull origin main
```

After pulling, you may need to reinstall dependencies if new packages were added:

```bash
npm install
```

## 5. Pushing Your Changes

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

### Notes:
- Always pull before you start working to avoid conflicts.
- Use clear commit messages.
- If you run into issues after pulling, try `npx expo start --clear`.