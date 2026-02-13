import BottomBackButton from '@/components/BottomBackButton';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, MapPin, Printer, Camera, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../contexts/OrderContext';
import { saveOrder, generateOrderId } from '@/lib/orders';
import { createOrderDoc } from '@/src/services/orders';
import type { OrderDraft, OrderFlow } from '@/src/types/order';

function safeNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(v: unknown) {
  const n = safeNumber(v, 0);
  return `$${n.toFixed(2)} USD`;
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
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
  const order = useOrder();

  const { orderType, userInfo, selectedLocation, printConfig, photoConfig, posterConfig, files, delivery } = order;

  const isPosterFlow = orderType === 'poster';
  const isPhotoFlow = orderType === 'photo';

  const estimatedTotal = useMemo(() => {
    if (isPhotoFlow && photoConfig) {
      const qty = safeNumber(photoConfig.quantity, 1);
      const price = safeNumber(photoConfig.price, 0);
      return qty * price;
    }

    if (printConfig) {
      const pages = safeNumber(printConfig.totalPages ?? 1, 1);
      const copies = safeNumber(printConfig.copies ?? 1, 1);
      const total = pages * copies * 0;
      return Number.isFinite(total) ? total : 0;
    }

    return 0;
  }, [isPhotoFlow, photoConfig, printConfig]);

  const whatsappLink = useMemo(() => {
    const raw = selectedLocation?.whatsapp ?? '';
    const s = String(raw).trim();
    return s || null;
  }, [selectedLocation]);

  const confirmOrder = async () => {
    const missing = order.getMissingForSummary();
    if (missing.length > 0) {
      Alert.alert(
        t('summary.missingTitle', 'Datos incompletos'),
        t('summary.missingDesc', 'Faltan datos requeridos para confirmar el pedido. Revisa los pasos anteriores.'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const flowMap: Record<string, OrderFlow> = { document: 'print', photo: 'photo', poster: 'poster' };
      const flow: OrderFlow = flowMap[orderType ?? ''] ?? 'print';

      const config = isPosterFlow && posterConfig
        ? posterConfig
        : isPhotoFlow && photoConfig
          ? photoConfig
          : printConfig ?? {};

      const draft: OrderDraft = {
        orderType: flow,
        branchId: selectedLocation?.id ?? '',
        userInfo: {
          fullName: userInfo?.fullName ?? '',
          phone: userInfo?.phone ?? '',
          email: userInfo?.email ?? '',
        },
        delivery: {
          enabled: delivery.enabled,
          address: delivery.address,
          miles: delivery.miles,
          fee: delivery.fee,
        },
        notes: order.notes,
        config,
        filesMetadata: files.map((f) => ({
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
          pages: f.pages,
        })),
        estimatedTotal,
      };

      let firestoreOrderId: string | null = null;
      try {
        const result = await createOrderDoc(draft);
        firestoreOrderId = result.orderId;
      } catch (firestoreErr) {
        console.warn('Firestore write failed (offline or not configured), saving locally only:', firestoreErr);
      }

      const localOrderId = firestoreOrderId ?? await generateOrderId();

      const localOrder = {
        id: localOrderId,
        createdAt: new Date().toISOString(),
        flow,
        locationName: selectedLocation?.name ?? '—',
        total: estimatedTotal,
        status: 'pending' as const,
      };

      await saveOrder(localOrder);

      order.setOrderId(localOrderId);
      order.setStatus('submitted');
      router.push({ pathname: '/order-success', params: { orderId: localOrderId } });
    } catch (error) {
      console.error('Error confirming order:', error);
      Alert.alert('Error', t('summary.confirmError', 'No se pudo confirmar el pedido. Intenta de nuevo.'));
    }
  };

  return (
    <View style={styles.container}>
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

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <FileText size={18} color="#0B5FFF" />
          </View>
          <Text style={styles.sectionTitle}>
            {t('summary.userInfo', 'Información de Usuario')}
          </Text>
        </View>

        <View style={styles.card}>
          <Row label={t('summary.name', 'Nombre')} value={userInfo?.fullName ?? '—'} />
          <Row label={t('summary.phone', 'Teléfono')} value={userInfo?.phone ?? '—'} />
          <Row label={t('summary.email', 'Email')} value={userInfo?.email ?? '—'} />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <MapPin size={18} color="#0B5FFF" />
          </View>
          <Text style={styles.sectionTitle}>{t('summary.location', 'Sede')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.locationName}>{selectedLocation?.name ?? '—'}</Text>
          <Text style={styles.locationAddress}>{selectedLocation?.city ?? selectedLocation?.address ?? '—'}</Text>
          <Text style={styles.locationCountry}>{selectedLocation?.country ?? '—'}</Text>

          <TouchableOpacity
            style={[styles.whatsBtn, !whatsappLink && styles.whatsBtnDisabled]}
            activeOpacity={0.9}
            onPress={() => whatsappLink && Linking.openURL(whatsappLink)}
            disabled={!whatsappLink}
          >
            <Text style={styles.whatsText}>{t('summary.whatsapp', 'Contactar vía WhatsApp')}</Text>
          </TouchableOpacity>
        </View>

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
          {isPosterFlow && posterConfig ? (
            <>
             <Row
               label={t('posterConfig.size', 'Tamaño')}
               value={
                posterConfig.sizeMode === 'custom'
                  ? (posterConfig.name ?? (posterConfig.wCm && posterConfig.hCm ? `${posterConfig.wCm} x ${posterConfig.hCm} cm` : '—'))
                  : (posterConfig.label ?? posterConfig.name ?? '—')
               }
             />
             <Row
               label={t('posterConfig.material', 'Material')}
               value={posterConfig.materialLabel ?? '—'}
             />
             <Row
               label={t('posterConfig.laminate', 'Laminado')}
               value={posterConfig.laminateLabel ?? '—'}
             />
           </>
         ) : isPhotoFlow && photoConfig ? (
            <>
              <Row
                label={t('photoConfig.size', 'Tamaño')}
                value={photoConfig.label ?? '—'}
              />
              <Row
                label={t('summary.measures', 'Medidas')}
                value={(() => {
                  const wIn = photoConfig.widthIn;
                  const hIn = photoConfig.heightIn;
                  const wCm = photoConfig.widthCm;
                  const hCm = photoConfig.heightCm;
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
                value={safeNumber(photoConfig.quantity, 1)}
              />
              <Row
                label={t('photoConfig.price', 'Precio')}
                value={formatMoney(safeNumber(photoConfig.price, 0))}
              />
            </>
          ) : printConfig ? (
            <>
              <Row
                label={t('summary.paper', 'Tamaño de Papel')}
                value={printConfig.paperLabel ?? printConfig.paper ?? '—'}
              />
              <Row
                label={t('summary.pages', 'Páginas Totales')}
                value={printConfig.totalPages ?? '—'}
              />
              <Row
                label={t('summary.copies', 'Copias')}
                value={printConfig.copies ?? '—'}
              />
              <Row
                label={t('summary.printType', 'Tipo de Impresión')}
                value={printConfig.printTypeLabel ?? printConfig.printType ?? '—'}
              />
              <Row
                label={t('summary.binding', 'Encuadernación')}
                value={printConfig.bindingLabel ?? printConfig.binding ?? '—'}
              />
            </>
          ) : (
            <Text style={styles.muted}>—</Text>
          )}
        </View>

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
                <Text style={styles.muted}>—</Text>
              ) : (
                files.map((f, idx) => (
                  <Row
                    key={`${f.uri}-${idx}`}
                    label={`${idx + 1}. ${f.name}`}
                    value={f.pages ? `${f.pages} ${t('summary.pagesShort', 'págs.')}` : '—'}
                  />
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <MapPin size={18} color="#0B5FFF" />
          </View>
          <Text style={styles.sectionTitle}>{t('summary.delivery', 'Delivery')}</Text>
        </View>

        <View style={styles.card}>
          {delivery.enabled ? (
            <>
              <Row label={t('summary.deliveryAddress', 'Dirección')} value={delivery.address || '—'} />
              <Row label={t('summary.deliveryMiles', 'Distancia')} value={`${delivery.miles} mi`} />
              <Row label={t('summary.deliveryFee', 'Costo delivery')} value={formatMoney(delivery.fee)} />
            </>
          ) : (
            <Text style={styles.muted}>{t('summary.deliveryOff', 'Sin delivery')}</Text>
          )}
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>{t('summary.total', 'Total Estimado')}</Text>
          <Text style={styles.totalValue}>{formatMoney(estimatedTotal + (delivery.enabled ? delivery.fee : 0))}</Text>
          <Text style={styles.totalNote}>
            {t('summary.totalNote', 'El precio final puede variar según las condiciones reales de los archivos')}
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

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
