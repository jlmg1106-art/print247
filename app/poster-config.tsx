import BottomBackButton from '@/components/BottomBackButton';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../contexts/OrderContext';

type PosterSize = {
  id: string;
  label: string;      // "A4"
  name: string;       // "21 x 29.7 cm"
  wCm: number;
  hCm: number;
  wIn?: number;
  hIn?: number;
  note?: string;      // "Tamaño carta / Ideal general"
};

const POSTER_SIZES: PosterSize[] = [
  { id: 'A4', label: 'A4', name: '21 x 29.7 cm', wCm: 21, hCm: 29.7, wIn: 8.27, hIn: 11.69, note: 'Tamaño estándar pequeño' },
  { id: 'A3', label: 'A3', name: '29.7 x 42 cm', wCm: 29.7, hCm: 42, wIn: 11.69, hIn: 16.54, note: 'Popular para pósters' },
  { id: 'A2', label: 'A2', name: '42 x 59.4 cm', wCm: 42, hCm: 59.4, wIn: 16.54, hIn: 23.39, note: 'Impacto medio' },
  { id: 'A1', label: 'A1', name: '59.4 x 84.1 cm', wCm: 59.4, hCm: 84.1, wIn: 23.39, hIn: 33.11, note: 'Gran formato' },
  { id: 'A0', label: 'A0', name: '84.1 x 118.9 cm', wCm: 84.1, hCm: 118.9, wIn: 33.11, hIn: 46.81, note: 'Extra grande' },

  // Tamaños comunes en cm
  { id: '30x40', label: '30x40', name: '30 x 40 cm', wCm: 30, hCm: 40, wIn: 11.81, hIn: 15.75, note: 'Decorativo / juvenil' },
  { id: '40x60', label: '40x60', name: '40 x 60 cm', wCm: 40, hCm: 60, wIn: 15.75, hIn: 23.62, note: 'Póster mediano' },
  { id: '50x70', label: '50x70', name: '50 x 70 cm', wCm: 50, hCm: 70, wIn: 19.69, hIn: 27.56, note: 'Clásico y versátil' },
  { id: '60x90', label: '60x90', name: '60 x 90 cm', wCm: 60, hCm: 90, wIn: 23.62, hIn: 35.43, note: 'Gran impacto visual' },
  { id: '70x100', label: '70x100', name: '70 x 100 cm', wCm: 70, hCm: 100, wIn: 27.56, hIn: 39.37, note: 'Extra grande' },
];

const MATERIALS = [
  { id: 'poster200', labelKey: 'posterConfig.materials.poster200', fallback: 'Papel Poster 200g' },
  { id: 'photo260', labelKey: 'posterConfig.materials.photo260', fallback: 'Photo Satin 260g' },
  { id: 'vinyl', labelKey: 'posterConfig.materials.vinyl', fallback: 'Vinyl Adhesivo' },
  { id: 'canvas', labelKey: 'posterConfig.materials.canvas', fallback: 'Canvas' },
];

const LAMINATIONS = [
  { id: 'none', labelKey: 'posterConfig.laminations.none', fallback: 'Sin laminado' },
  { id: 'matte', labelKey: 'posterConfig.laminations.matte', fallback: 'Mate' },
  { id: 'gloss', labelKey: 'posterConfig.laminations.gloss', fallback: 'Brillante' },
];

export default function PosterConfig() {
  const router = useRouter();
  const { t } = useTranslation();
  const order = useOrder() as any;
  const [sizeMode, setSizeMode] = useState<'preset' | 'custom'>(
    order?.posterConfig?.sizeMode ?? 'preset'
  );

  const [customWcm, setCustomWcm] = useState<string>(
    String(order?.posterConfig?.customWcm ?? '')
  );
  const [customHcm, setCustomHcm] = useState<string>(
    String(order?.posterConfig?.customHcm ?? '')
  );

  const [materialId, setMaterialId] = useState<string>(
    order?.posterConfig?.materialId ?? MATERIALS[0].id
  );
  const [laminationId, setLaminationId] = useState<string>(
    order?.posterConfig?.laminationId ?? LAMINATIONS[0].id
  );

  const [selectedId, setSelectedId] = useState<string>(order?.posterConfig?.id ?? POSTER_SIZES[0].id);

  const selected = useMemo(
    () => POSTER_SIZES.find(s => s.id === selectedId) ?? POSTER_SIZES[0],
    [selectedId]
  );

  const canContinue =
    sizeMode === 'preset'
      ? !!selectedId
      : !!Number(customWcm) && !!Number(customHcm);

  const handleContinue = () => {
    try {
      const w = Number(customWcm);
      const h = Number(customHcm);

      const isCustom = sizeMode === 'custom' && Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;

      const selectedMaterial = MATERIALS.find(m => m.id === materialId);
      const selectedLamination = LAMINATIONS.find(l => l.id === laminationId);


      const payload = {
        // modo tamaño
        sizeMode,

        // size preset
        id: isCustom ? 'custom' : selected.id,
        label: isCustom ? t('posterConfig.custom', 'Personalizado') : selected.label,
        name: isCustom ? `${w} x ${h} cm` : selected.name,

        // medidas
        wCm: isCustom ? w : selected.wCm,
        hCm: isCustom ? h : selected.hCm,
        wIn: isCustom ? Number((w / 2.54).toFixed(2)) : selected.wIn,
        hIn: isCustom ? Number((h / 2.54).toFixed(2)) : selected.hIn,

        // material / laminado
        materialId,
        laminationId,
        materialLabel: selectedMaterial ? t(selectedMaterial.labelKey, selectedMaterial.fallback) : '',
        laminateLabel: selectedLamination ? t(selectedLamination.labelKey, selectedLamination.fallback) : '',

        // guardamos también los campos custom por si luego vuelves atrás
        customWcm,
        customHcm,
      };

     if (order?.setPosterConfig) order.setPosterConfig(payload);
     else order.posterConfig = payload;
   } catch (e) {}

   router.push({ pathname: '/upload-files', params: { flow: 'poster' } });
 };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
       <Text style={styles.topTitle}>{t('posterConfig.title', 'Pósters')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Megaphone color="#FF6B35" size={24} />
          </View>
          <Text style={styles.h1}>{t('posterConfig.title', 'Pósters')}</Text>
          <Text style={styles.sub}>{t('posterConfig.subtitle', 'Elige el tamaño del póster')}</Text>
        </View>

 {/* Modo de tamaño */}
 <View style={styles.card}>
   <Text style={styles.cardTitle}>{t('posterConfig.size', 'Tamaño')}</Text>

   <View style={styles.segmentRow}>
     <TouchableOpacity
       style={[styles.segmentBtn, sizeMode === 'preset' && styles.segmentBtnActive]}
      onPress={() => setSizeMode('preset')}
     >
      <Text style={[styles.segmentText, sizeMode === 'preset' && styles.segmentTextActive]}>
        {t('posterConfig.standard', 'Estándar')}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.segmentBtn, sizeMode === 'custom' && styles.segmentBtnActive]}
      onPress={() => setSizeMode('custom')}
    >
      <Text style={[styles.segmentText, sizeMode === 'custom' && styles.segmentTextActive]}>
        {t('posterConfig.custom', 'Personalizado')}
      </Text>
    </TouchableOpacity>
  </View>
</View>

{/* Tamaños estándar */}
{sizeMode === 'preset' && (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{t('posterConfig.chooseSize', 'Elige un tamaño')}</Text>

    {POSTER_SIZES.map((s) => {
      const active = s.id === selectedId;
      return (
        <TouchableOpacity
          key={s.id}
          style={[styles.optionRow, active && styles.optionRowActive]}
          onPress={() => setSelectedId(s.id)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
              {s.label} • {s.name}
            </Text>
            <Text style={styles.optionSub}>
              {s.wIn && s.hIn ? `${s.wIn} x ${s.hIn} in` : ''}
              {s.note ? ` · ${t(`posterConfig.notes.${s.id.toLowerCase()}`, s.note)}` : ''}
            </Text>
          </View>

          <View style={[styles.checkCircle, active && styles.checkCircleSelected]}>
            {active ? <Check size={16} color="#FFFFFF" /> : null}
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
)}

{/* Tamaño personalizado */}
{sizeMode === 'custom' && (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{t('posterConfig.customSize', 'Tamaño personalizado (cm)')}</Text>

    <View style={styles.inputRow}>
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>{t('posterConfig.width', 'Ancho')}</Text>
        <TextInput
          value={customWcm}
          onChangeText={setCustomWcm}
          keyboardType="numeric"
          placeholder="ej: 60"
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>{t('posterConfig.height', 'Alto')}</Text>
        <TextInput
          value={customHcm}
          onChangeText={setCustomHcm}
          keyboardType="numeric"
          placeholder="ej: 90"
          style={styles.input}
        />
      </View>
    </View>
  </View>
)}

{/* Material */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>{t('posterConfig.material', 'Material')}</Text>

  {MATERIALS.map((m) => {
  const active = m.id === materialId;
  return (
    <TouchableOpacity
      key={m.id}
      style={[styles.optionRow, active && styles.optionRowActive]}
      onPress={() => setMaterialId(m.id)}
      activeOpacity={0.85}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{t(m.labelKey, m.fallback)}</Text>
      </View>

      <View style={[styles.checkCircle, active && styles.checkCircleSelected]}>
        {active ? <Check size={16} color="#FFFFFF" /> : null}
      </View>
    </TouchableOpacity>
  );
})}

</View>

{/* Laminado */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>{t('posterConfig.laminate', 'Laminado')}</Text>

  {LAMINATIONS.map((l) => {
  const active = l.id === laminationId;
  return (
    <TouchableOpacity
      key={l.id}
      style={[styles.optionRow, active && styles.optionRowActive]}
      onPress={() => setLaminationId(l.id)}
      activeOpacity={0.85}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{t(l.labelKey, l.fallback)}</Text>
      </View>

      <View style={[styles.checkCircle, active && styles.checkCircleSelected]}>
        {active ? <Check size={16} color="#FFFFFF" /> : null}
      </View>
    </TouchableOpacity>
  );
})}

</View>

      </ScrollView>

        <View style={styles.bottom}>
          <View style={{ flex: 1 }}>
           <BottomBackButton label={t('common.atras', 'Atrás')} />
          </View>

          <View style={{ flex: 1 }}>
           <TouchableOpacity
             style={[styles.cta, !canContinue && styles.ctaDisabled]}
             disabled={!canContinue}
             onPress={handleContinue}
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
topTitle: {
  fontSize: 16,
  fontWeight: '800',
  color: '#111827',
  flex: 1,
  textAlign: 'center',
  marginRight: 34,
},

  back: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 180,
    flexGrow: 1,
  },

  header: { marginBottom: 12 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: '#FFF1EB',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  h1: { fontSize: 22, fontWeight: '900', color: '#111827' },
  sub: { marginTop: 4, fontSize: 13, color: '#6B7280' },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 16,
    marginTop: 10,
    padding: 14,
  },

    cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },

  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontWeight: '900',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#111827',
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkCircleSelected: {
    borderColor: '#0B5FFF',
    backgroundColor: '#0B5FFF',
  },
  optionRowActive: {
    borderColor: '#0B5FFF',
    backgroundColor: '#F5F9FF',
  },
  optionTitle: {
    fontWeight: '900',
    color: '#111827',
    fontSize: 16,
  },
  optionTitleActive: {
    color: '#0B5FFF',
  },
  optionSub: {
    marginTop: 4,
    color: '#6B7280',
    fontWeight: '700',
  },

  check: {
    width: 26, height: 26, borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  checkActive: { backgroundColor: '#0B5FFF', borderColor: '#0B5FFF' },

  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrap: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  inputBox: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    paddingVertical: 0,
  },
  unitTxt: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '900',
    color: '#6B7280',
  },
  inputHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

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
