import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OrderDraft, FirestoreOrderStatus } from '@/src/types/order';

export async function createOrderDoc(draft: OrderDraft): Promise<{ orderId: string }> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error('Firebase not configured: EXPO_PUBLIC_FIREBASE_PROJECT_ID is missing');
  }
  if (!draft.orderType) throw new Error('orderType is required');
  if (!draft.userInfo?.fullName || !draft.userInfo?.phone || !draft.userInfo?.email) {
    throw new Error('userInfo (fullName, phone, email) is required');
  }
  if (!draft.branchId) throw new Error('branchId (location) is required');
  if (!draft.config) throw new Error('config is required');
  if (!draft.filesMetadata || draft.filesMetadata.length === 0) {
    throw new Error('At least one file is required');
  }

  const docData = {
    status: 'pending' as FirestoreOrderStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    branchId: draft.branchId,
    orderType: draft.orderType,
    userInfo: {
      fullName: draft.userInfo.fullName,
      phone: draft.userInfo.phone,
      email: draft.userInfo.email,
    },
    delivery: {
      enabled: draft.delivery.enabled,
      address: draft.delivery.address,
      miles: draft.delivery.miles,
      fee: draft.delivery.fee,
    },
    notes: draft.notes || '',
    config: draft.config,
    filesMetadata: draft.filesMetadata.map((f) => ({
      name: f.name,
      size: f.size ?? null,
      mimeType: f.mimeType ?? null,
      pages: f.pages ?? null,
    })),
    estimatedTotal: draft.estimatedTotal ?? 0,
  };

  const docRef = await addDoc(collection(db, 'orders'), docData);
  return { orderId: docRef.id };
}
