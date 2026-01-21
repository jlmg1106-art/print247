import BottomBackButton from '@/components/BottomBackButton';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../contexts/OrderContext';

type PaperSize = 'letter' | 'legal' | 'a4' | 'a3' | 'tabloid';
type PrintType = 'bw' | 'color' | 'card_matte' | 'card_glossy';
type Binding = 'none' | 'one_side' | 'both_sides' | 'spiral' | 'staples';

const PAPER: { key: PaperSize; labelKey: string; fallback: string }[] = [
  { key: 'letter', labelKey: 'printConfig.paper.letter', fallback: 'Carta (8.5" × 11")' },
  { key: 'legal', labelKey: 'printConfig.paper.legal', fallback: 'Legal (8.5" × 14")' },
  { key: 'a4', labelKey: 'printConfig.paper.a4', fallback: 'A4 (210mm × 297mm)' },
  { key: 'a3', labelKey: 'printConfig.paper.a3', fallback: 'A3 (297mm × 420mm)' },
  { key: 'tabloid', labelKey: 'printConfig.paper.tabloid', fallback: 'Tabloide (11" × 17")' },
];

const PRINT_TYPES: { key: PrintType; titleKey: string; descKey: string; fallbackTitle: string; fallbackDesc: string }[] = [
  {
    key: 'bw',
    titleKey: 'printConfig.type.bw.title',
    descKey: 'printConfig.type.bw.desc',
    fallbackTitle: 'Blanco y Negro',
    fallbackDesc: 'Impresión estándar monocromática',
  },
  {
    key: 'color',
    titleKey: 'printConfig.type.color.title',
    descKey: 'printConfig.type.color.desc',
    fallbackTitle: 'A Todo Color',
    fallbackDesc: 'Impresión a color de alta calidad',
  },
  {
    key: 'card_matte',
    titleKey: 'printConfig.type.cardMatte.title',
    descKey: 'printConfig.type.cardMatte.desc',
    fallbackTitle: 'Cartón Grueso Mate',
    fallbackDesc: 'Papel grueso con acabado mate',
  },
  {
    key: 'card_glossy',
    titleKey: 'printConfig.type.cardGlossy.title',
    descKey: 'printConfig.type.cardGlossy.desc',
    fallbackTitle: 'Cartón Grueso Brillante',
    fallbackDesc: 'Papel grueso con acabado brillante',
  },
];

const BINDINGS: { key: Binding; titleKey: string; descKey: string; fallbackTitle: string; fallbackDesc: string }[] = [
  {
    key: 'none',
    titleKey: 'printConfig.bind.none.title',
    descKey: 'printConfig.bind.none.desc',
    fallbackTitle: 'Sin Encuadernación',
    fallbackDesc: 'Sin opciones de encuadernación',
  },
  {
    key: 'one_side',
    titleKey: 'printConfig.bind.oneSide.title',
    descKey: 'printConfig.bind.oneSide.desc',
    fallbackTitle: 'A Un Lado',
    fallbackDesc: 'Impresión solo en una cara',
  },
  {
    key: 'both_sides',
    titleKey: 'printConfig.bind.bothSides.title',
    descKey: 'printConfig.bind.bothSides.desc',
    fallbackTitle: 'Ambos Lados',
    fallbackDesc: 'Impresión en ambas caras',
  },
  {
    key: 'spiral',
    titleKey: 'printConfig.bind.spiral.title',
    descKey: 'printConfig.bind.spiral.desc',
    fallbackTitle: 'Encuadernación en Espiral',
    fallbackDesc: 'Encuadernado con espiral metálico',
  },
  {
    key: 'staples',
    titleKey: 'printConfig.bind.staples.title',
    descKey: 'printConfig.bind.staples.desc',
    fallbackTitle: 'Solo Grapas',
    fallbackDesc: 'Grapado simple',
  },
];

function SelectCard({
  selected,
  title,
  desc,
  onPress,
}: {
  selected: boolean;
  title: string;
  desc?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, selected && styles.cardSelected]} onPress={onPress} activeOpacity={0.85}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>{title}</Text>
        {!!desc && <Text style={styles.cardDesc}>{desc}</Text>}
      </View>
      <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
        {selected ? <Check size={16} color="#0B5FFF" /> : null}
      </View>
    </TouchableOpacity>
  );
}

function SizePill({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.sizePill, selected && styles.sizePillSelected]}>
      <Text style={[styles.sizePillText, selected && styles.sizePillTextSelected]}>{label}</Text>
      {selected ? (
        <View style={styles.sizeCheck}>
          <Check size={14} color="#0B5FFF" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function PrintConfig() {
  const router = useRouter();
  const { t } = useTranslation();
  const order = useOrder();

  const orderType = (order as any)?.orderType;

  const [paper, setPaper] = useState<PaperSize>('letter');
  const [copies, setCopies] = useState<number>(1);
  const [printType, setPrintType] = useState<PrintType>('bw');
  const [binding, setBinding] = useState<Binding>('none');

  const canContinue = useMemo(() => copies >= 1 && copies <= 999, [copies]);

  const onContinue = () => {
    try {
      const paperLabel = t(PAPER.find(p => p.key === paper)?.labelKey || '', PAPER.find(p => p.key === paper)?.fallback || paper);
      const pt = PRINT_TYPES.find(x => x.key === printType);
      const bd = BINDINGS.find(x => x.key === binding);

      const payload = {
        paper,
        paperLabel,
        copies,
        printType,
        printTypeLabel: t(pt?.titleKey || '', pt?.fallbackTitle || printType),
        binding,
        bindingLabel: t(bd?.titleKey || '', bd?.fallbackTitle || binding),
        orderType,
      };

      if ((order as any)?.setPrintConfig) (order as any).setPrintConfig(payload);
    } catch (e) {}

    router.push({ pathname: '/upload-files', params: { flow: 'print' } });
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>print-config</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <View style={styles.heroCircle}>
            <Settings size={30} color="#0B5FFF" />
          </View>
        </View>

        <Text style={styles.h1}>{t('printConfig.title', 'Configuración de Impresión')}</Text>
        <Text style={styles.sub}>{t('printConfig.subtitle', 'Personaliza las opciones de tu pedido')}</Text>

        <Text style={styles.section}>{t('printConfig.paperTitle', 'Tamaño del Papel')}</Text>
        <View style={styles.sizesGrid}>
          {PAPER.map((p) => (
            <SizePill key={p.key} selected={paper === p.key} label={t(p.labelKey, p.fallback)} onPress={() => setPaper(p.key)} />
          ))}
        </View>

        <Text style={styles.section}>{t('printConfig.copiesTitle', 'Cantidad de Copias')}</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={[styles.counterBtn, copies <= 1 && styles.counterBtnDisabled]}
            onPress={() => setCopies((c) => Math.max(1, c - 1))}
            disabled={copies <= 1}
            activeOpacity={0.85}
          >
            <Text style={styles.counterTxt}>−</Text>
          </TouchableOpacity>

          <View style={styles.counterBox}>
            <Text style={styles.counterVal}>{copies}</Text>
          </View>

          <TouchableOpacity style={[styles.counterBtn, styles.counterBtnPlus]} onPress={() => setCopies((c) => Math.min(999, c + 1))} activeOpacity={0.85}>
            <Text style={styles.counterTxtPlus}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>{t('printConfig.printTypeTitle', 'Tipo de Impresión')}</Text>
        {PRINT_TYPES.map((opt) => (
          <SelectCard
            key={opt.key}
            selected={printType === opt.key}
            title={t(opt.titleKey, opt.fallbackTitle)}
            desc={t(opt.descKey, opt.fallbackDesc)}
            onPress={() => setPrintType(opt.key)}
          />
        ))}

        <Text style={styles.section}>{t('printConfig.bindingTitle', 'Opciones de Encuadernación')}</Text>
        {BINDINGS.map((opt) => (
          <SelectCard
            key={opt.key}
            selected={binding === opt.key}
            title={t(opt.titleKey, opt.fallbackTitle)}
            desc={t(opt.descKey, opt.fallbackDesc)}
            onPress={() => setBinding(opt.key)}
          />
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <View style={{ flex: 1 }}>
          <BottomBackButton label="Atrás" />
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
  heroCircle: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },

  h1: { marginTop: 14, fontSize: 34, fontWeight: '900', color: '#111827', textAlign: 'center' },
  sub: { marginTop: 8, fontSize: 15, color: '#6B7280', textAlign: 'center' },

  section: { marginTop: 18, fontSize: 22, fontWeight: '900', color: '#111827' },

  sizesGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  sizePill: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizePillSelected: { borderColor: '#0B5FFF', backgroundColor: '#EAF1FF' },
  sizePillText: { fontWeight: '900', color: '#111827' },
  sizePillTextSelected: { color: '#0B5FFF' },
  sizeCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },

  counterRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  counterBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center' },
  counterBtnDisabled: { opacity: 0.4 },
  counterBtnPlus: { backgroundColor: '#0B5FFF' },
  counterTxt: { fontSize: 24, fontWeight: '900', color: '#111827' },
  counterTxtPlus: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  counterBox: { width: 76, height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: 20, fontWeight: '900', color: '#111827' },

  card: { marginTop: 12, borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, flexDirection: 'row', gap: 12 },
  cardSelected: { borderColor: '#0B5FFF', backgroundColor: '#F3F7FF' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  cardTitleSelected: { color: '#0B5FFF' },
  cardDesc: { marginTop: 6, color: '#6B7280', fontWeight: '700' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  checkCircleSelected: { borderColor: '#0B5FFF', backgroundColor: '#FFFFFF' },

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
