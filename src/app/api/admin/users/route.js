import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return null;

  // Clean private key of surrounding double quotes
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  // Clean single quotes
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }

  // Replace escaped newlines with literal newlines
  privateKey = privateKey.replace(/\\n/g, '\n');

  return { projectId, clientEmail, privateKey };
}

export async function POST(req) {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    return NextResponse.json({ error: 'Firebase Admin credentials are not configured on the server' }, { status: 500 });
  }

  // Safely initialize Firebase Admin inside the request handler
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (err) {
      console.error('Firebase Admin init inside route error:', err);
      return NextResponse.json({ error: 'Failed to initialize Firebase Admin SDK: ' + err.message }, { status: 500 });
    }
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
