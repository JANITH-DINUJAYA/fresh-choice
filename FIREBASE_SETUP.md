# Firebase Project Setup Guide for Fresh Choice

Follow these steps to set up and connect your Firebase project to the **Fresh Choice** website.

---

## Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `fresh-choice`.
3. (Optional) Choose to enable Google Analytics.

---

## Step 2: Configure Authentication
1. In the left menu, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, enable **Email/Password**.

---

## Step 3: Configure Cloud Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose **Start in production mode**.
4. Select a cloud region close to your target audience (e.g., `asia-south1` for Sri Lanka / Mumbai).
5. Deploy database.

---

## Step 4: Configure Web App & Client Credentials
1. On the project homepage, click the **Web icon (`</>`)** to register a new web application.
2. Name the app `Fresh Choice Web`.
3. Copy the configuration details (`firebaseConfig` object containing `apiKey`, `authDomain`, `projectId`, etc.).
4. Create a `.env.local` file in the root of the project:
   ```bash
   cp .env.example .env.local
   ```
5. Populate the client variables with the credentials you copied:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fresh-choice.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=fresh-choice
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fresh-choice.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=849204...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:849204:web:e2b9...
   ```

---

## Step 5: Configure Admin SDK Private Key
To manage team accounts and roles securely from the admin panel:
1. In Firebase Console, click the **Settings Gear (⚙️) > Project settings**.
2. Navigate to the **Service accounts** tab.
3. Click **Generate new private key** (this downloads a JSON file).
4. Open the downloaded JSON file and map the contents to your `.env.local` file:
   ```env
   FIREBASE_PROJECT_ID=fresh-choice
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fresh-choice.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...[copy the entire string including newlines as \n]...-----END PRIVATE KEY-----\n"
   ```

---

## Step 6: Deploy Database Security Rules
Use the Firebase CLI to deploy rules or copy them directly:
1. Copy the contents of the `firestore.rules` file in this repository.
2. Go to **Firestore Database > Rules** in Firebase Console.
3. Paste the contents, replacing any default rules.
4. Click **Publish**.

---

## Step 7: Bootstrap the Super Admin Account
We've provided a seeding script to easily create the first Super Admin account:
1. Navigate to the project root in your terminal.
2. Make sure you've installed all dependencies:
   ```bash
   npm install
   ```
3. Run the bootstrap seeder:
   ```bash
   node scripts/seed-super-admin.js
   ```
4. This will create:
   - Auth user: `superadmin@freshchoice.lk`
   - Temporary Password: `SuperAdminSecurePassword2026`
   - Firestore doc with the role of `super_admin` in the `users` collection.
5. Log in with this account on the admin panel page (`/admin/login`). Once logged in, you can configure new meals, change the password, and create other team member profiles!
