import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
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
    const orderData = await req.json();
    const db = getFirestore();

    // Deduct stock if necessary or run transaction
    const batch = db.batch();
    for (const item of orderData.items || []) {
      const mealRef = db.collection('meals').doc(item.id);
      batch.update(mealRef, {
        stock: FieldValue.increment(-item.qty),
      });
    }
    
    // Save order
    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, {
      ...orderData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (err) {
    console.error('Order creation API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
