import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Platform } from 'react-native';
import { db, storage } from '@/lib/firebase';
import type {
  OrderDraft,
  SubmitOrderInput,
  UploadedFileRecord,
  FirestoreOrderStatus,
} from '@/src/types/order';

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uriToBlob(uri: string): Promise<Blob> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    return res.blob();
  }

  try {
    const res = await fetch(uri);
    return await res.blob();
  } catch {
    const FileSystem = require('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const { Buffer } = require('buffer');
    const bytes = Buffer.from(base64, 'base64');
    return new Blob([bytes]);
  }
}

export async function uploadOrderFiles(
  orderId: string,
  files: { name: string; uri: string; size?: number; mimeType?: string; pages?: number }[],
  onProgress?: (uploaded: number, total: number) => void,
): Promise<UploadedFileRecord[]> {
  const results: UploadedFileRecord[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safeName = sanitizeFileName(file.name);
    const storagePath = `orders/${orderId}/${safeName}`;
    const storageRef = ref(storage, storagePath);

    const blob = await uriToBlob(file.uri);

    const metadata: { contentType?: string } = {};
    if (file.mimeType) metadata.contentType = file.mimeType;

    await uploadBytes(storageRef, blob, metadata);
    const downloadURL = await getDownloadURL(storageRef);

    results.push({
      name: file.name,
      mimeType: file.mimeType ?? null,
      size: file.size ?? null,
      pages: file.pages ?? null,
      storagePath,
      downloadURL,
    });

    if (onProgress) onProgress(i + 1, files.length);
  }

  return results;
}

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

export async function submitOrder(
  input: SubmitOrderInput,
  onProgress?: (uploaded: number, total: number) => void,
): Promise<{ orderId: string }> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error('Firebase not configured');
  }

  const draft: OrderDraft = {
    orderType: input.orderType,
    branchId: input.branchId,
    userInfo: input.userInfo,
    delivery: input.delivery,
    notes: input.notes,
    config: input.config,
    filesMetadata: input.filesMetadata,
    estimatedTotal: input.estimatedTotal,
  };

  const { orderId } = await createOrderDoc(draft);

  try {
    const fileRecords = await uploadOrderFiles(orderId, input.pickedFiles, onProgress);

    await updateDoc(doc(db, 'orders', orderId), {
      files: fileRecords,
      status: 'pending' as FirestoreOrderStatus,
      updatedAt: serverTimestamp(),
    });

    return { orderId };
  } catch (uploadErr) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'upload_failed' as string,
        updatedAt: serverTimestamp(),
      });
    } catch {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch {}
    }
    throw uploadErr;
  }
}
