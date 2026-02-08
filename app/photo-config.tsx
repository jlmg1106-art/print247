import BottomBackButton from '@/components/BottomBackButton';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Image as ImageIcon, Ruler } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../contexts/OrderContext';

type PhotoSize = {
  code: string;
  name: string;
  wIn?: number;
  hIn?: number;
  wCm?: number;
  hCm?: number;
  price: number;
  group: 'common' | 'large' | 'custom';
};

const PHOTO_SIZES: PhotoSize[] = []; // Se mueve dentro del componente para usar t()

function formatSize(s: PhotoSize) {
  if (!s.wIn || !s.hIn || !s.wCm || !s.hCm) return '';
  return `(${s.wIn}x${s.hIn} in / ${s.wCm}x${s.hCm} cm)`;
}

export default function PhotoConfig() {
  const router = useRouter();
  const { t } = useTranslation();
  const order = useOrder() as any;

  const [selectedCode, setSelectedCode] = useState<string>('1.4x2.2');
  const [qty, setQty] = useState<number>(1);

  const [customWIn, setCustomWIn] = useState<string>('');
  const [customHIn, setCustomHIn] = useState<string>('');

  const PHOTO_SIZES: PhotoSize[] = [
    // Comunes
    { code: '1.4x2.2', name: t('photoSizes.credencial', 'Tamaño credencial'), wIn: 1.4, hIn: 2.2, wCm: 3.5, hCm: 5.5, price: 20.0, group: 'common' },
    { code: '2x2', name: t('photoSizes.passport', 'Foto carnet / pasaporte'), wIn: 2, hIn: 2, wCm: 5.08, hCm: 5.08, price: 20.0, group: 'common' },
    { code: '2R', name: '2R', wIn: 2.5, hIn: 3.5, wCm: 6.35, hCm: 8.89, price: 2.5, group: 'common' },
    { code: '3R', name: '3R', wIn: 3.5, hIn: 5, wCm: 8.9, hCm: 12.7, price: 5.0, group: 'common' },
    { code: '4R', name: '4R', wIn: 4, hIn: 6, wCm: 10.2, hCm: 15.2, price: 5.0, group: 'common' },
    { code: '5R', name: '5R', wIn: 5, hIn: 7, wCm: 12.7, hCm: 17.8, price: 7.5, group: 'common' },
    { code: '6R', name: '6R', wIn: 6, hIn: 8, wCm: 15.2, hCm: 20.3, price: 20.0, group: 'common' },
    { code: '8R', name: '8R', wIn: 8, hIn: 10, wCm: 20.3, hCm: 25.4, price: 20.0, group: 'common' },
    { code: 'S8R', name: 'S8R Super 8R', wIn: 8, hIn: 12, wCm: 20.3, hCm: 30.5, price: 23.0, group: 'common' },

    // Gran formato
    { code: '10R', name: '10R', wIn: 10, hIn: 12, wCm: 25.4, hCm: 30.5, price: 25.0, group: 'large' },
    { code: '11R', name: '11R', wIn: 11, hIn: 14, wCm: 27.9, hCm: 35.6, price: 26.0, group: 'large' },
    { code: '12R', name: '12R', wIn: 12, hIn: 15, wCm: 30.5, hCm: 38.1, price: 27.0, group: 'large' },
    { code: '14R', name: '14R', wIn: 14, hIn: 17, wCm: 35.6, hCm: 43.2, price: 35.0, group: 'large' },
    { code: '16R', name: '16R', wIn: 16, hIn: 20, wCm: 40.6, hCm: 50.8, price: 50.0, group: 'large' },
    { code: '20R', name: '20R', wIn: 20, hIn: 24, wCm: 50.8, hCm: 61.0, price: 66.0, group: 'large' },
    { code: '24R', name: '24R', wIn: 20, hIn: 30, wCm: 50.8, hCm: 76.2, price: 83.0, group: 'large' },
    { code: '30R', name: '30R', wIn: 30, hIn: 40, wCm: 76.2, hCm: 101.6, price: 166.0, group: 'large' },
    { code: 'S12R', name: 'S12R Super 12R', wIn: 12, hIn: 18, wCm: 30.5, hCm: 45.7, price: 30.0, group: 'large' },

    // Personalizado
    { code: 'CUSTOM', name: t('photoConfig.custom', 'Tamaño Personalizado'), price: 0, group: 'custom' },
  ];

  const selected = useMemo(() => PHOTO_SIZES.find(x => x.code === selectedCode) ?? PHOTO_SIZES[0], [selectedCode, t]);

  const customCm = useMemo(() => {
    const w = Number(customWIn);
    const h = Number(customHIn);
    const ok = Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
    if (!ok) return { wCm: '', hCm: '' };
    const wCm = (w * 2.54).toFixed(2);
    const hCm = (h * 2.54).toFixed(2);
    return { wCm, hCm };
  }, [customWIn, customHIn]);

  const unitPrice = selected.code === 'CUSTOM' ? 0 : selected.price;
  const total = useMemo(() => Math.max(0, qty) * unitPrice, [qty, unitPrice]);

  const canContinue = useMemo(() => {
    if (qty < 1 || qty > 999) return false;
    if (selected.code !== 'CUSTOM') return true;
    const w = Number(customWIn);
    const h = Number(customHIn);
    return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
  }, [qty, selected, customWIn, customHIn]);

  const onContinue = () => {
    try {
      const payload =
        selected.code === 'CUSTOM'
          ? {
              code: 'CUSTOM',
              name: 'Tamaño Personalizado',
              qty,
              wIn: Number(customWIn),
              hIn: Number(customHIn),
              wCm: Number(customCm.wCm),
              hCm: Number(customCm.hCm),
              price: 0,
              total: 0,
            }
          : {
              code: selected.code,
              name: selected.name,
              qty,
              wIn: selected.wIn,
              hIn: selected.hIn,
              wCm: selected.wCm,
              hCm: selected.hCm,
              price: selected.price,
              total,
            };

      if (order?.setPhotoConfig) order.setPhotoConfig(payload);
    } catch (e) {}

    router.push({ pathname: '/upload-files', params: { flow: 'photo' } });
  };

  const common = PHOTO_SIZES.filter(x => x.group === 'common');
  const large = PHOTO_SIZES.filter(x => x.group === 'large');
  const custom = PHOTO_SIZES.filter(x => x.group === 'custom')[0];

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>photo-config</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <View style={styles.heroCircle}>
            <ImageIcon size={30} color="#0B5FFF" />
          </View>
        </View>

        <Text style={styles.h1}>{t('photoConfig.title', 'Configuración de Foto')}</Text>
        <Text style={styles.sub}>{t('photoConfig.subtitle', 'Elige el tamaño y la cantidad')}</Text>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}><Ruler size={18} color="#0B5FFF" /></View>
          <Text style={styles.sectionTitle}>{t('photoConfig.common', 'Tamaños Comunes')}</Text>
        </View>

        <View style={styles.card}>
          {common.map((s) => {
            const isOn = s.code === selectedCode;
            return (
              <TouchableOpacity key={s.code} style={styles.rowItem} onPress={() => setSelectedCode(s.code)} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {isOn ? '✓ ' : ''}{s.name} {formatSize(s)}
                  </Text>
                  <Text style={styles.itemPrice}>${s.price.toFixed(2)} USD</Text>
                </View>
                <View style={[styles.checkCircle, isOn && styles.checkCircleOn]}>
                  {isOn ? <Check size={14} color="#0B5FFF" /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}><Ruler size={18} color="#0B5FFF" /></View>
          <Text style={styles.sectionTitle}>{t('photoConfig.large', 'Gran Formato')}</Text>
        </View>

        <View style={styles.card}>
          {large.map((s) => {
            const isOn = s.code === selectedCode;
            return (
              <TouchableOpacity key={s.code} style={styles.rowItem} onPress={() => setSelectedCode(s.code)} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {isOn ? '✓ ' : ''}{s.name} {formatSize(s)}
                  </Text>
                  <Text style={styles.itemPrice}>${s.price.toFixed(2)} USD</Text>
                </View>
                <View style={[styles.checkCircle, isOn && styles.checkCircleOn]}>
                  {isOn ? <Check size={14} color="#0B5FFF" /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}><Ruler size={18} color="#0B5FFF" /></View>
          <Text style={styles.sectionTitle}>{t('photoConfig.custom', 'Tamaño Personalizado')}</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setSelectedCode(custom.code)}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{selectedCode === custom.code ? '✓ ' : ''}{custom.name}</Text>
              <Text style={styles.itemPrice}>{t('photoConfig.customNote', 'Precio: se calculará en el backend')}</Text>
            </View>
            <View style={[styles.checkCircle, selectedCode === custom.code && styles.checkCircleOn]}>
              {selectedCode === custom.code ? <Check size={14} color="#0B5FFF" /> : null}
            </View>
          </TouchableOpacity>

          {selectedCode === 'CUSTOM' ? (
            <View style={{ marginTop: 12, gap: 10 }}>
              <Text style={styles.smallLabel}>{t('photoConfig.customHint', 'Ingresa ancho y alto en pulgadas')}</Text>
              <View style={styles.customRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{t('photoConfig.width', 'Ancho (in)')}</Text>
                  <TextInput
                    value={customWIn}
                    onChangeText={setCustomWIn}
                    placeholder="Ej: 12"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{t('photoConfig.height', 'Alto (in)')}</Text>
                  <TextInput
                    value={customHIn}
                    onChangeText={setCustomHIn}
                    placeholder="Ej: 18"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
              </View>
              <Text style={styles.smallMuted}>
                cm aprox: {customCm.wCm || '—'} x {customCm.hCm || '—'}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}><Check size={18} color="#0B5FFF" /></View>
          <Text style={styles.sectionTitle}>{t('photoConfig.qty', 'Cantidad')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, qty <= 1 && styles.counterBtnDisabled]}
              onPress={() => setQty((c) => Math.max(1, c - 1))}
              disabled={qty <= 1}
              activeOpacity={0.85}
            >
              <Text style={styles.counterTxt}>−</Text>
            </TouchableOpacity>

            <View style={styles.counterBox}>
              <Text style={styles.counterVal}>{qty}</Text>
            </View>

            <TouchableOpacity
              style={[styles.counterBtn, styles.counterBtnPlus]}
              onPress={() => setQty((c) => Math.min(999, c + 1))}
              activeOpacity={0.85}
            >
              <Text style={styles.counterTxtPlus}>+</Text>
            </TouchableOpacity>
          </View>

          {selected.code !== 'CUSTOM' ? (
            <Text style={styles.totalText}>{t('photoConfig.total', 'Total estimado')}: ${total.toFixed(2)} USD</Text>
          ) : (
            <Text style={styles.totalText}>{t('photoConfig.total', 'Total')}: (backend)</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

    <View style={styles.bottom}>
     <View style={{ flex: 1 }}>
      <BottomBackButton label={t('common.atras', 'Atrás')} />
     </View>

     <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={[styles.cta, !canContinue && styles.ctaDisabled]}
        onPress={onContinue}
        disabled={!canContinue}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaText} numberOfLines={1} ellipsizeMode="tail">
          {t('common.continue', 'Continuar')}
        </Text>

      </TouchableOpacity>
     </View>
    </View>
   </View>
  );
 }


const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },

  topBar: {
    paddingTop: Platform.OS === 'ios' ? 54 : 18,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 6 },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827', flex: 1, textAlign: 'center', marginRight: 34 },

  content: { paddingHorizontal: 18, paddingTop: 16 },

  heroIcon: { alignItems: 'center', marginTop: 10 },
  heroCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  h1: { marginTop: 14, fontSize: 34, fontWeight: '900', color: '#111827', textAlign: 'center' },
  sub: { marginTop: 8, fontSize: 15, color: '#6B7280', textAlign: 'center' },

  sectionHeader: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },

  card: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },

  rowItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  itemTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  itemPrice: { marginTop: 6, fontSize: 13, fontWeight: '800', color: '#6B7280' },

  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkCircleOn: { borderColor: '#0B5FFF', backgroundColor: '#EAF1FF' },

  smallLabel: { fontSize: 13, fontWeight: '800', color: '#111827' },
  smallMuted: { fontSize: 13, fontWeight: '800', color: '#6B7280' },

  customRow: { flexDirection: 'row', gap: 10 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },

  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterBtnDisabled: { opacity: 0.4 },
  counterBtnPlus: { backgroundColor: '#EAF1FF', borderColor: '#C7DBFF' },
  counterTxt: { fontSize: 26, fontWeight: '900', color: '#111827' },
  counterTxtPlus: { fontSize: 26, fontWeight: '900', color: '#0B5FFF' },
  counterBox: {
    width: 86,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterVal: { fontSize: 18, fontWeight: '900', color: '#111827' },

  totalText: { marginTop: 14, textAlign: 'center', fontSize: 14, fontWeight: '900', color: '#111827' },

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
    flexDirection: 'row',
    gap: 12,
  },
  cta: { height: 56, borderRadius: 16, backgroundColor: '#0B5FFF', alignItems: 'center', justifyContent: 'center' },
  ctaDisabled: { backgroundColor: '#CBD5E1' },
  ctaText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
});
