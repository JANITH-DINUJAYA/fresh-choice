import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
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
