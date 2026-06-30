const dotenv = require("dotenv");
const path = require("path");

// Load env FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Firebase Admin (MODULAR SDK - stable)
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// --------------------
// ENV VALIDATION
// --------------------
const requiredEnv = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// --------------------
// INIT FIREBASE ADMIN (SAFE)
// --------------------
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

// --------------------
// CONFIG
// --------------------
const SUPER_ADMIN = {
  email: "superadmin@freshchoice.lk",
  password: "SuperAdminSecurePassword2026",
  name: "Fresh Choice Super Admin",
  role: "super_admin",
};

// --------------------
// MAIN FUNCTION
// --------------------
async function seedSuperAdmin() {
  try {
    console.log("🔍 Checking existing super admin...");

    let user;

    // --------------------
    // 1. Check if user exists
    // --------------------
    try {
      user = await auth.getUserByEmail(SUPER_ADMIN.email);
      console.log(`✅ User exists: ${user.uid}`);
    } catch (err) {
      console.log("🆕 Creating auth user...");

      user = await auth.createUser({
        email: SUPER_ADMIN.email,
        password: SUPER_ADMIN.password,
        displayName: SUPER_ADMIN.name,
        emailVerified: true,
      });

      console.log(`✅ Created user: ${user.uid}`);
    }

    // --------------------
    // 2. Set custom claims (idempotent)
    // --------------------
    const currentClaims = user.customClaims || {};

    if (currentClaims.role !== SUPER_ADMIN.role) {
      console.log("🔐 Setting custom claims...");
      await auth.setCustomUserClaims(user.uid, {
        ...currentClaims,
        role: SUPER_ADMIN.role,
      });
      console.log("✅ Custom claims set");
    } else {
      console.log("ℹ️ Custom claims already set");
    }

    // --------------------
    // 3. Write Firestore profile (idempotent)
    // --------------------
    const userRef = db.collection("users").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log("📝 Creating Firestore profile...");

      await userRef.set({
        name: SUPER_ADMIN.name,
        email: SUPER_ADMIN.email,
        role: SUPER_ADMIN.role,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log("✅ Firestore profile created");
    } else {
      console.log("ℹ️ Firestore profile already exists");
    }

    // --------------------
    // DONE
    // --------------------
    console.log("\n====================================");
    console.log("🚀 SUPER ADMIN READY");
    console.log(`📧 Email: ${SUPER_ADMIN.email}`);
    console.log(`🔑 Password: ${SUPER_ADMIN.password}`);
    console.log("====================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// RUN
seedSuperAdmin();