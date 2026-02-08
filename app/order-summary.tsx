import BottomBackButton from '@/components/BottomBackButton';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FileText, MapPin, Printer, Camera, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../contexts/OrderContext';
import { saveOrder, generateOrderId } from '@/lib/orders';

function pickFirst(...vals: any[]) {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return undefined;
}

function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(v: any) {
  const n = safeNumber(v, 0);
  return `$${n.toFixed(2)} USD`;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const show = value === 0 ? '0' : value ? String(value) : '—'; 

  return (
<View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{show}</Text>
    </View>
  );
}

export default function OrderSummary() {
  const router = useRouter();
  const { t } = useTranslation();
  const order = useOrder() as any;
  const params = useLocalSearchParams() as any;

  const normalizedFlow = String( 
    params?.flow ?? order?.flow ?? order?.type ?? order?.category ?? '' 
  ).toLowerCase();

  const posterConfig =
    order?.posterConfig ??
    order?.poster ??
    order?.posterSettings ??
    null;

  const photoConfig = order?.photoConfig ?? null;
  const printConfig = order?.printConfig ?? null;

  // 🔒 Flujo único y definitivo para Order Summary
  const isPosterFlow = normalizedFlow === 'poster';
  const isPhotoFlow  = normalizedFlow === 'photo';
  const isPrintFlow  = !isPosterFlow && !isPhotoFlow;

  const confirmOrder = async () => {
    try {
      const orderId = await generateOrderId();
      
      const newOrder = {
        id: orderId,
        createdAt: new Date().toISOString(),
        flow: normalizedFlow as any,
        locationName: pickFirst(loc?.name, loc?.locationName, loc?.title, '—'),
        total: estimatedTotal,
        status: 'pending' as const,
      };

      await saveOrder(newOrder);
      
      try {
        order?.setStatus?.('submitted');
      } catch (e) {}
      
      router.push({ pathname: '/order-success', params: { orderId } });
    } catch (error) {
      console.error('Error confirming order:', error);
      // Fallback a la navegación anterior si algo falla
      router.push('/order-status');
    }
  };

  const user = order?.userInfo;
  const loc = order?.selectedLocation;
  const files = Array.isArray(order?.files) ? order.files : [];
  const delivery = order?.delivery;

  const whatsappLink = useMemo(() => {
    const raw =
      pickFirst(loc?.whatsappLink, loc?.whatsapp, loc?.whatsapp_url, loc?.whatsappUrl) ?? '';
    const s = String(raw).trim();
    if (!s) return null;
    return s;
  }, [loc]);

  // --- Estimado (evita NaN sí o sí) ---
  const estimatedTotal = useMemo(() => {
    if (isPhotoFlow) {
      const qty = safeNumber(photoConfig?.quantity ?? photoConfig?.qty ?? 1, 1);
      const price = safeNumber(photoConfig?.price ?? photoConfig?.unitPrice ?? 0, 0);
      return qty * price;
    }

    // Print flow (por ahora: si no hay pricing definido, retorna 0)
    // Si más adelante conectas backend, esto se reemplaza por el cálculo real.
    const pages = safeNumber(printConfig?.totalPages ?? 1, 1);
    const copies = safeNumber(printConfig?.copies ?? 1, 1);

    // Si existe un precio unitario en tu config (aunque sea provisional), úsalo:
    const unit = safeNumber(printConfig?.unitPrice ?? printConfig?.pricePerPage ?? 0, 0);

    const total = pages * copies * unit;
    return Number.isFinite(total) ? total : 0;
  }, [isPhotoFlow, photoConfig, printConfig]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{t('summary.title', 'Resumen del Pedido')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <CheckCircle2 size={34} color="#16A34A" />
          </View>
          <Text style={styles.h1}>{t('summary.title', 'Resumen del Pedido')}</Text>
          <Text style={styles.sub}>{t('summary.subtitle', 'Verifica los detalles antes de confirmar')}</Text>

          <View style={styles.alert}>
            <Sparkles size={18} color="#F97316" />
            <Text style={styles.alertText}>
              {t('summary.express', 'Servicio Express - Entregas inmediatas para volúmenes pequeños')}
            </Text>
          </View>
        </View>

        {/* 1) Información del usuario */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <FileText size={18} color="#0B5FFF" />
          </View>
          <Text style={styles.sectionTitle}>
            {t('summary.userInfo', 'Información de Usuario')}
          </Text>
        </View>

        <View style={styles.card}>
          <Row
            label={t('summary.name', 'Nombre')}
            value={pickFirst(user?.fullName, user?.name, user?.nombre, '—')}
          />
          <Row
            label={t('summary.phone', 'Teléfono')}
            value={pickFirst(user?.phone, user?.telefono, user?.tel, '—')}
          />
          <Row
            label={t('summary.email', 'Email')}
            value={pickFirst(user?.email, user?.correo, '—')}
          />
        </View>

        {/* 2) Sede */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <MapPin size={18} color="#0B5FFF" />
          </View>
          <Text style={styles.sectionTitle}>{t('summary.location', 'Sede')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.locationName}>
            {pickFirst(loc?.name, loc?.locationName, loc?.title, '—')}
          </Text>
          <Text style={styles.locationAddress}>
            {pickFirst(loc?.city, loc?.address, loc?.direccion, '—')}
          </Text>
          <Text style={styles.locationCountry}>
            {pickFirst(loc?.country, loc?.pais, '—')}
          </Text>

          <TouchableOpacity
            style={[styles.whatsBtn, !whatsappLink && styles.whatsBtnDisabled]}
            activeOpacity={0.9}
            onPress={() => whatsappLink && Linking.openURL(whatsappLink)}
            disabled={!whatsappLink}
          >
            <Text style={styles.whatsText}>{t('summary.whatsapp', 'Contactar vía WhatsApp')}</Text>
          </TouchableOpacity>
        </View>

        {/* 3) Configuración (Foto o Impresión) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            {isPosterFlow ? <Sparkles size={18} color="#0B5FFF" /> : isPhotoFlow ? <Camera size={18} color="#0B5FFF" /> : <Printer size={18} color="#0B5FFF" />}
           </View>
          <Text style={styles.sectionTitle}>
            {isPosterFlow
              ? t('summary.posterConfig', 'Configuración de Gran Formato')
              : isPhotoFlow
                ? t('summary.photoConfig', 'Configuración de Fotografía')
                : t('summary.printConfig', 'Configuración de Impresión')}
          </Text>
        </View>

        <View style={styles.card}>
          {isPosterFlow ? (
            <>
             <Row
               label={t('posterConfig.size', 'Tamaño')}
               value={
                posterConfig?.sizeMode === 'custom'
                  ? pickFirst(
                      posterConfig?.name,
                      posterConfig?.wCm && posterConfig?.hCm ? `${posterConfig.wCm} x ${posterConfig.hCm} cm` : '',
                      posterConfig?.customWcm && posterConfig?.customHcm ? `${posterConfig.customWcm} x ${posterConfig.customHcm} cm` : '',
                      posterConfig?.label,
                      '—'
                    )
                   : pickFirst(posterConfig?.label, posterConfig?.name, posterConfig?.sizeLabel, '—')
                 }
             />
             <Row
               label={t('posterConfig.material', 'Material')}
               value={pickFirst(posterConfig?.materialLabel, posterConfig?.material, '—')}
             />
             <Row
               label={t('posterConfig.laminate', 'Laminado')}
               value={pickFirst(posterConfig?.laminateLabel, posterConfig?.laminate, '—')}
             />
           </>
         ) : isPhotoFlow ? (

            <>
              <Row
                label={t('photoConfig.size', 'Tamaño')}
                value={pickFirst(photoConfig?.name, photoConfig?.label, photoConfig?.sizeLabel, '—')}
              />
              <Row
                label="Medidas"
                value={(() => {
                  const wIn = photoConfig?.wIn;
                  const hIn = photoConfig?.hIn;
                  const wCm = photoConfig?.wCm;
                  const hCm = photoConfig?.hCm;

                  const inPart = (wIn && hIn) ? `${wIn}x${hIn} in` : '';
                  const cmPart = (wCm && hCm) ? `${wCm}x${hCm} cm` : '';

                  if (inPart && cmPart) return `${inPart} / ${cmPart}`;
                  if (inPart) return inPart;
                  if (cmPart) return cmPart;
                  return '—';
                })()}
              />
              <Row
                label={t('photoConfig.quantity', 'Cantidad')}
                value={safeNumber(photoConfig?.quantity ?? photoConfig?.qty ?? 1, 1)}
              />
              <Row
                label={t('photoConfig.price', 'Precio')}
                value={formatMoney(safeNumber(photoConfig?.price ?? photoConfig?.unitPrice ?? 0, 0))}
              />
            </>
          ) : (
            <>
              <Row
                label={t('summary.paper', 'Tamaño de Papel')}
                value={pickFirst(printConfig?.paper, printConfig?.paperSize, '—')}
              />
              <Row
                label={t('summary.pages', 'Páginas Totales')}
                value={pickFirst(printConfig?.totalPages, '—')}
              />
              <Row
                label={t('summary.copies', 'Copias')}
                value={pickFirst(printConfig?.copies, '—')}
              />
              <Row
                label={t('summary.printType', 'Tipo de Impresión')}
                value={pickFirst(printConfig?.printType, printConfig?.type, '—')}
              />
              <Row
                label={t('summary.binding', 'Encuadernación')}
                value={pickFirst(printConfig?.binding, '—')}
              />
            </>
          )}
        </View>

        {/* 4) Archivos (solo para impresión normalmente) */}
        {!isPhotoFlow && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FileText size={18} color="#0B5FFF" />
              </View>
              <Text style={styles.sectionTitle}>{t('summary.files', 'Archivos')}</Text>
            </View>

            <View style={styles.card}>
              {files.length === 0 ? (
                <Text style={styles.muted}>{t('summary.noFiles', '—')}</Text>
              ) : (
                files.map((f: any, idx: number) => (
                  <Row
                    key={String(f?.uri ?? f?.name ?? idx)}
                    label={`${idx + 1}. ${String(f?.name ?? 'archivo')}`}
                    value={`${String(f?.pages ?? f?.pageCount ?? '—')} ${t('summary.pagesShort', 'págs.')}`}
                  />
                ))
              )}
            </View>
          </>
        )}

        {/* 5) Delivery */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <MapPin size={18} color="#0B5FFF" />
          </View>
          <Text style={styles.sectionTitle}>{t('summary.delivery', 'Delivery')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.muted}>
            {delivery?.enabled ? t('summary.deliveryOn', 'Con delivery') : t('summary.deliveryOff', 'Sin delivery')}
          </Text>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>{t('summary.total', 'Total Estimado')}</Text>
          <Text style={styles.totalValue}>{formatMoney(estimatedTotal)}</Text>
          <Text style={styles.totalNote}>
            {t('summary.totalNote', 'El precio final puede variar según las condiciones reales de los archivos')}
          </Text>
        </View>

        <View style={{ height: 24 }} />

       </ScrollView>

      {/* Botones abajo */}
      <View style={styles.bottom}>
        <View style={styles.bottomInner}>
          <View style={{ flex: 1 }}>
            <BottomBackButton label={t('common.atras', 'Atrás')} />
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[styles.cta, styles.ctaGreen]}
              activeOpacity={0.9}
              onPress={confirmOrder}
            >
              <Text style={styles.ctaText} numberOfLines={1} ellipsizeMode="tail">
                {t('summary.confirm', 'Confirmar Pedido')}
              </Text>
             </TouchableOpacity>
            </View>
           </View>
          </View>
         </View>
       );
      }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  topBar: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  content: { padding: 16, paddingBottom: 150 },

  hero: { alignItems: 'center', marginBottom: 12 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  h1: { fontSize: 34, fontWeight: '900', color: '#111827', textAlign: 'center', marginTop: 2 },
  sub: { fontSize: 14, color: '#6B7280', marginTop: 6, textAlign: 'center' },

  alert: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
    width: '100%',
  },
  alertText: { flex: 1, fontSize: 14, fontWeight: '800', color: '#9A3412' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 8 },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EEF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 16,
    padding: 14,
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: '#6B7280', fontWeight: '700', fontSize: 14 },
  rowValue: { color: '#111827', fontWeight: '900', fontSize: 14 },

  locationName: { fontSize: 16, fontWeight: '900', color: '#111827' },
  locationAddress: { marginTop: 4, fontSize: 13, color: '#6B7280', fontWeight: '700' },
  locationCountry: { marginTop: 2, fontSize: 13, color: '#0B5FFF', fontWeight: '900' },

  whatsBtn: {
    marginTop: 12,
    backgroundColor: '#ECFDF3',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  whatsBtnDisabled: { opacity: 0.5 },
  whatsText: { color: '#16A34A', fontWeight: '900', fontSize: 14 },

  fileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  fileName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  fileMeta: { fontWeight: '800', color: '#6B7280' },

  muted: { color: '#6B7280', fontWeight: '700' },

  totalCard: {
    marginTop: 14,
    backgroundColor: '#F3F8FF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
  },
  totalTitle: { fontWeight: '900', color: '#1D4ED8', fontSize: 14 },
  totalValue: { fontWeight: '900', color: '#2563EB', fontSize: 48, marginTop: 6 },
  totalNote: { textAlign: 'center', color: '#6B7280', fontWeight: '700', marginTop: 8 },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    backgroundColor: '#FFFFFF',
  },

  bottomInner: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
  },

  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0B5FFF',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  ctaGreen: {
    backgroundColor: '#16A34A',
  },

  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

});
