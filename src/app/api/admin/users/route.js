import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const hasAdminKeys = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

const serviceAccount = hasAdminKeys ? {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
} : null;

if (!getApps().length && serviceAccount) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

export async function POST(req) {
  if (!serviceAccount) {
    return NextResponse.json({ error: 'Firebase Admin credentials not configured' }, { status: 500 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const auth = getAuth();
    const db = getFirestore();

    // 1. Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    // 2. Set Custom User Claims for role-based security
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // 3. Write profile record to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ uid: userRecord.uid, message: 'User created successfully' });
  } catch (err) {
    console.error('Error creating staff:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
