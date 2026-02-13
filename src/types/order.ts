import { Timestamp, FieldValue } from 'firebase/firestore';

export type OrderFlow = 'print' | 'photo' | 'poster';

export type FirestoreOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderUserInfo {
  fullName: string;
  phone: string;
  email: string;
}

export interface OrderDelivery {
  enabled: boolean;
  address: string;
  miles: number;
  fee: number;
}

export interface OrderFileMetadata {
  name: string;
  size?: number;
  mimeType?: string;
  pages?: number;
}

export interface UploadedFileRecord {
  name: string;
  mimeType: string | null;
  size: number | null;
  pages: number | null;
  storagePath: string;
  downloadURL: string;
}

export interface OrderPrintConfig {
  paper?: string;
  paperLabel?: string;
  copies?: number;
  printType?: string;
  printTypeLabel?: string;
  binding?: string;
  bindingLabel?: string;
  totalPages?: number;
}

export interface OrderPhotoConfig {
  sizeCode: string;
  label: string;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  price: number;
  quantity: number;
  isCustom?: boolean;
}

export interface OrderPosterConfig {
  sizeMode: 'preset' | 'custom';
  id?: string;
  label?: string;
  name?: string;
  wCm?: number;
  hCm?: number;
  wIn?: number;
  hIn?: number;
  materialId?: string;
  laminationId?: string;
  materialLabel?: string;
  laminateLabel?: string;
  customWcm?: string;
  customHcm?: string;
}

export interface FirestoreOrderDoc {
  status: FirestoreOrderStatus;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  branchId: string;
  orderType: OrderFlow;
  userInfo: OrderUserInfo;
  delivery: OrderDelivery;
  notes: string;
  config: OrderPrintConfig | OrderPhotoConfig | OrderPosterConfig;
  filesMetadata: OrderFileMetadata[];
  files?: UploadedFileRecord[];
  estimatedTotal: number;
}

export interface SubmitOrderInput {
  orderType: OrderFlow;
  branchId: string;
  userInfo: OrderUserInfo;
  delivery: OrderDelivery;
  notes: string;
  config: OrderPrintConfig | OrderPhotoConfig | OrderPosterConfig;
  filesMetadata: OrderFileMetadata[];
  estimatedTotal: number;
  pickedFiles: { name: string; uri: string; size?: number; mimeType?: string; pages?: number }[];
}

export interface OrderDraft {
  orderType: OrderFlow;
  branchId: string;
  userInfo: OrderUserInfo;
  delivery: OrderDelivery;
  notes: string;
  config: OrderPrintConfig | OrderPhotoConfig | OrderPosterConfig;
  filesMetadata: OrderFileMetadata[];
  estimatedTotal: number;
}
