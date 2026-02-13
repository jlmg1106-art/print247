import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type OrderType = 'document' | 'photo' | 'poster';

export type OrderStatus = 'draft' | 'submitted' | 'pending' | 'completed' | 'cancelled';

export type UserInfo = {
  fullName: string;
  phone: string;
  email: string;
};

export type LocationInfo = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  whatsapp?: string;
  rating?: number;
  is247?: boolean;
  etaMin?: number;
};

export type PrintConfig = {
  orderType?: OrderType | null;
  paper?: string;
  paperLabel?: string;
  copies?: number;
  printType?: string;
  printTypeLabel?: string;
  binding?: string;
  bindingLabel?: string;
  totalPages?: number;
};

export type PickedFile = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  pages?: number;
};

export type DeliveryInfo = {
  enabled: boolean;
  address: string;
  miles: number;
  fee: number;
};

export type PhotoConfig = {
  sizeCode: string;
  label: string;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  price: number;
  quantity: number;
  isCustom?: boolean;
};

export type PosterConfig = {
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
};

export type OrderContextValue = {
  orderType: OrderType | null;
  setOrderType: (type: OrderType) => void;

  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;

  selectedLocation: LocationInfo | null;
  setSelectedLocation: (loc: LocationInfo) => void;

  printConfig: PrintConfig | null;
  setPrintConfig: (cfg: PrintConfig) => void;

  photoConfig: PhotoConfig | null;
  setPhotoConfig: (cfg: PhotoConfig) => void;

  posterConfig: PosterConfig | null;
  setPosterConfig: (cfg: PosterConfig) => void;

  files: PickedFile[];
  setFiles: (files: PickedFile[]) => void;

  notes: string;
  setNotes: (notes: string) => void;

  delivery: DeliveryInfo;
  setDelivery: (d: DeliveryInfo) => void;

  status: OrderStatus;
  setStatus: (s: OrderStatus) => void;

  orderId: string | null;
  setOrderId: (id: string | null) => void;

  isReadyForSummary: () => boolean;
  getMissingForSummary: () => string[];
  isReadyToSubmit: () => boolean;

  resetOrder: () => void;
};

const DEFAULT_DELIVERY: DeliveryInfo = {
  enabled: false,
  address: '',
  miles: 0,
  fee: 0,
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [printConfig, setPrintConfig] = useState<PrintConfig | null>(null);
  const [photoConfig, setPhotoConfig] = useState<PhotoConfig | null>(null);
  const [posterConfig, setPosterConfig] = useState<PosterConfig | null>(null);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [delivery, setDelivery] = useState<DeliveryInfo>(DEFAULT_DELIVERY);
  const [status, setStatus] = useState<OrderStatus>('draft');
  const [orderId, setOrderId] = useState<string | null>(null);

  const resetOrder = useCallback(() => {
    setOrderType(null);
    setUserInfo(null);
    setSelectedLocation(null);
    setPrintConfig(null);
    setPhotoConfig(null);
    setPosterConfig(null);
    setFiles([]);
    setNotes('');
    setDelivery(DEFAULT_DELIVERY);
    setStatus('draft');
    setOrderId(null);
  }, []);

  const hasConfig = useCallback(() => {
    if (orderType === 'document') return printConfig !== null;
    if (orderType === 'photo') return photoConfig !== null;
    if (orderType === 'poster') return posterConfig !== null;
    return false;
  }, [orderType, printConfig, photoConfig, posterConfig]);

  const isReadyForSummary = useCallback(() => {
    return (
      orderType !== null &&
      userInfo !== null &&
      selectedLocation !== null &&
      hasConfig() &&
      files.length > 0
    );
  }, [orderType, userInfo, selectedLocation, hasConfig, files]);

  const getMissingForSummary = useCallback((): string[] => {
    const missing: string[] = [];
    if (!orderType) missing.push('orderType');
    if (!userInfo) missing.push('userInfo');
    if (!selectedLocation) missing.push('location');
    if (!hasConfig()) missing.push('configuration');
    if (files.length === 0) missing.push('files');
    if (delivery.enabled && !delivery.address.trim()) missing.push('deliveryAddress');
    if (delivery.enabled && delivery.miles <= 0) missing.push('deliveryMiles');
    return missing;
  }, [orderType, userInfo, selectedLocation, hasConfig, files, delivery]);

  const isReadyToSubmit = useCallback(() => {
    return isReadyForSummary() && status === 'draft';
  }, [isReadyForSummary, status]);

  const value = useMemo(
    () => ({
      orderType,
      setOrderType,
      userInfo,
      setUserInfo,
      selectedLocation,
      setSelectedLocation,
      printConfig,
      setPrintConfig,
      photoConfig,
      setPhotoConfig,
      posterConfig,
      setPosterConfig,
      files,
      setFiles,
      notes,
      setNotes,
      delivery,
      setDelivery,
      status,
      setStatus,
      orderId,
      setOrderId,
      isReadyForSummary,
      getMissingForSummary,
      isReadyToSubmit,
      resetOrder,
    }),
    [orderType, userInfo, selectedLocation, printConfig, photoConfig, posterConfig, files, notes, delivery, status, orderId, isReadyForSummary, getMissingForSummary, isReadyToSubmit, resetOrder]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within an OrderProvider');
  return ctx;
}
