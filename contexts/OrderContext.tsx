import React, { createContext, useContext, useMemo, useState } from 'react';

export type OrderType = 'document' | 'photo' | 'poster';

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
  copies?: number;
  printType?: string;
  binding?: string;
  // opcional: si luego quieres guardar totalPages aquí también
  totalPages?: number;
};

export type PickedFile = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  pages?: number; // ✅ aquí guardamos páginas por archivo
};

export type DeliveryInfo = {
  enabled: boolean;
  address: string;
  miles: number;
  fee: number;
};

export type PhotoConfig = {
  sizeCode: string;        // ej: "2R", "4R", "2x2", "10R"
  label: string;           // texto para mostrar
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  price: number;           // precio unitario
  quantity: number;        // cantidad de copias
  isCustom?: boolean;      // si es tamaño personalizado
};

export type PosterConfig = {
  // modo tamaño
  sizeMode: 'preset' | 'custom';

  // size preset o custom
  id?: string;
  label?: string;
  name?: string;

  // medidas
  wCm?: number;
  hCm?: number;
  wIn?: number;
  hIn?: number;

  // material / laminado
  materialId?: string;
  laminationId?: string;
  materialLabel?: string;
  laminateLabel?: string;

  // guardamos custom inputs
  customWcm?: string;
  customHcm?: string;
};

type OrderContextValue = {
  orderType: OrderType | null;
  setOrderType: (type: OrderType) => void;

  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;

  selectedLocation: LocationInfo | null;
  setSelectedLocation: (loc: LocationInfo) => void;

  printConfig: PrintConfig | null;
  setPrintConfig: (cfg: PrintConfig) => void;

  // ✅ NUEVO (foto)
  photoConfig: PhotoConfig | null;
  setPhotoConfig: (cfg: PhotoConfig) => void;

  // ✅ NUEVO (poster)
  posterConfig: PosterConfig | null;
  setPosterConfig: (cfg: PosterConfig) => void;

  files: PickedFile[];
  setFiles: (files: PickedFile[]) => void;

  notes: string;
  setNotes: (notes: string) => void;

  delivery: DeliveryInfo;
  setDelivery: (d: DeliveryInfo) => void;

  status: 'received' | 'pending' | 'completed' | 'cancelled' | null;
  setStatus: (s: OrderContextValue['status']) => void;

  resetOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [printConfig, setPrintConfig] = useState<PrintConfig | null>(null);

  // ✅ foto
  const [photoConfig, setPhotoConfig] = useState<PhotoConfig | null>(null);
  // ✅ poster
  const [posterConfig, setPosterConfig] = useState<PosterConfig | null>(null);

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    enabled: false,
    address: '',
    miles: 0,
    fee: 0,
  });

  const [status, setStatus] = useState<OrderContextValue['status']>(null);

  const resetOrder = () => {
    setOrderType(null);
    setUserInfo(null);
    setSelectedLocation(null);
    setPrintConfig(null);
    setPhotoConfig(null);
    setPosterConfig(null);
    setFiles([]);
    setNotes('');
    setDelivery({ enabled: false, address: '', miles: 0, fee: 0 });
    setStatus(null);
  };

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

      resetOrder,
    }),
    [orderType, userInfo, selectedLocation, printConfig, photoConfig, posterConfig, files, notes, delivery, status]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within an OrderProvider');
  return ctx;
}
