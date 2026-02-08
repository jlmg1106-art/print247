import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Search, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '@/contexts/OrderContext';

type LocationItem = {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  is247: boolean;
  etaMin: number;
  tags?: string[];
};

const SAMPLE_LOCATIONS: LocationItem[] = [
  {
    id: 'denver-001',
    name: 'Printing24/7 — Denver Downtown',
    city: 'Denver, CO',
    country: 'USA',
    rating: 4.8,
    is247: true,
    etaMin: 12,
    tags: ['Documents', 'Photos'],
  },
  {
    id: 'aurora-002',
    name: 'Printing24/7 — Aurora Central',
    city: 'Aurora, CO',
    country: 'USA',
    rating: 4.7,
    is247: false,
    etaMin: 18,
    tags: ['Documents', 'Large Format'],
  },
  {
    id: 'sj-cr-003',
    name: 'Printing24/7 — San José Centro',
    city: 'San José',
    country: 'Costa Rica',
    rating: 4.9,
    is247: true,
    etaMin: 25,
    tags: ['Documents', 'Photos', 'Large Format'],
  },
];

export default function SelectLocation() {
  const router = useRouter();
  const { t } = useTranslation();
  const order = useOrder();

  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return SAMPLE_LOCATIONS;
    return SAMPLE_LOCATIONS.filter((l) => {
      const hay = `${l.name} ${l.city} ${l.country}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q]);

  const selected = useMemo(
    () => SAMPLE_LOCATIONS.find((x) => x.id === selectedId) ?? null,
    [selectedId]
  );

  const onContinue = () => {
    if (!selected) return;

    // Guardar en contexto si existe (no rompe si el setter no existe)
    try {
      const payload = {
        id: selected.id,
        name: selected.name,
        address: selected.city,
        country: selected.country,
        whatsapp: '',
      };

      order.setSelectedLocation(payload);
    } catch (e) {}

    // Próximo paso (después de sede)
    const type = (order as any)?.orderType;

    const next =
      type === 'photo' ? '/photo-config'
      : type === 'poster' ? '/poster-config'
      : '/print-config';
    router.push({ pathname: next, params: { flow: type } });
  };

  const canContinue = !!selectedId;

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{t('location.title', 'Select a location')}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.h1}>{t('location.title', 'Select a location')}</Text>
        <Text style={styles.sub}>{t('location.subtitle', 'Choose the receptor / branch where you will print')}</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchIcon}>
            <Search color="#9AA3AF" size={18} />
          </View>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('location.searchPlaceholder', 'Search city, address, or country')}
            placeholderTextColor="#A0A7B3"
            style={styles.searchInput}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.nearBtn} activeOpacity={0.85}>
            <MapPin color="#0B5FFF" size={18} />
            <Text style={styles.nearTxt}>{t('location.nearMe', 'Near me')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {results.length === 0 ? (
          <Text style={styles.noResults}>{t('location.noResults', 'No locations found')}</Text>
        ) : (
          results.map((l) => {
            const isSelected = l.id === selectedId;
            return (
              <TouchableOpacity
                key={l.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                activeOpacity={0.9}
                onPress={() => setSelectedId(l.id)}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{l.name}</Text>
                  <View style={styles.rating}>
                    <Star color="#F59E0B" size={16} />
                    <Text style={styles.ratingTxt}>{l.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>{l.city} • {l.country}</Text>

                <View style={styles.pills}>
                  <View style={[styles.pill, l.is247 ? styles.pillGood : styles.pillNeutral]}>
                    <Text style={[styles.pillTxt, l.is247 ? styles.pillTxtGood : styles.pillTxtNeutral]}>
                      {l.is247 ? t('location.open247', 'Open 24/7') : t('location.openNow', 'Open now')}
                    </Text>
                  </View>

                  <View style={styles.pill}>
                    <Text style={styles.pillTxtNeutral}>
                      {t('location.eta', 'ETA')} {l.etaMin} {t('location.minutes', 'min')}
                    </Text>
                  </View>

                  {(l.tags ?? []).slice(0, 3).map((tag) => (
                    <View style={styles.pill} key={`${l.id}-${tag}`}>
                      <Text style={styles.pillTxtNeutral}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.selectRow}>
                  <Text style={styles.selectHint}>
                    {isSelected ? '✓ ' : ''}{t('location.select', 'Select')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={onContinue}
          activeOpacity={0.85}
          disabled={!canContinue}
        >
          <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
            {t('location.continue', 'Continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FB' },

  topBar: {
    paddingTop: Platform.OS === 'ios' ? 56 : 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0B5FFF',
  },
  back: {
    position: 'absolute',
    left: 14,
    top: Platform.OS === 'ios' ? 54 : 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { textAlign: 'center', color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10 },
  h1: { fontSize: 26, fontWeight: '900', color: '#111827' },
  sub: { marginTop: 6, fontSize: 14, color: '#6B7280' },

  searchRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 54,
  },
  searchIcon: { width: 28, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  nearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 2 },
  nearTxt: { color: '#0B5FFF', fontWeight: '800' },

  list: { paddingHorizontal: 18, paddingTop: 6 },
  noResults: { color: '#6B7280', marginTop: 18, textAlign: 'center' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginTop: 12,
  },
  cardSelected: { borderColor: '#0B5FFF', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },

  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#111827', flex: 1, paddingRight: 10 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingTxt: { fontWeight: '900', color: '#111827' },

  cardMeta: { marginTop: 6, color: '#6B7280', fontSize: 13 },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3F4F6' },
  pillGood: { backgroundColor: '#E7F7ED' },
  pillNeutral: { backgroundColor: '#F3F4F6' },
  pillTxt: { fontSize: 12, fontWeight: '800' },
  pillTxtGood: { color: '#0B7A2B' },
  pillTxtNeutral: { color: '#374151', fontSize: 12, fontWeight: '700' },

  selectRow: { marginTop: 10, alignItems: 'flex-end' },
  selectHint: { color: '#0B5FFF', fontWeight: '900' },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'rgba(245,247,251,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cta: { height: 54, borderRadius: 16, backgroundColor: '#0B5FFF', alignItems: 'center', justifyContent: 'center' },
  ctaDisabled: { backgroundColor: '#C7D2FE' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.92)' },
});
