import BottomBackButton from '@/components/BottomBackButton';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, Info, Truck } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { useOrder, PickedFile } from '../contexts/OrderContext';

const MAX_FILES = 5;

function isAllowed(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'tiff', 'psd'].includes(ext);
}

// $10 primeras 20 millas, luego $0.60 por milla adicional
function calcDeliveryFee(miles: number) {
  if (!Number.isFinite(miles) || miles <= 0) return 0;
  if (miles <= 20) return 10;
  return 10 + (miles - 20) * 0.6;
}

async function getPdfPages(uri: string): Promise<number | undefined> {
  if (Platform.OS === 'web') {
    return 1;
  }
  try {
    const { PDFDocument } = require('pdf-lib');
    const res = await fetch(uri);
    const buf = await res.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    return pdf.getPageCount();
  } catch (e) {
    return 1;
  }
}

export default function UploadFiles() {
  const router = useRouter();
  const { t } = useTranslation();
  const order = useOrder();

  const type = order?.orderType;
  const isPosterFlow = type === 'poster';
  const isPhotoFlow = type === 'photo';

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMilesText, setDeliveryMilesText] = useState('0');
  const [notes, setNotes] = useState('');

  const countLabel = `${files.length} / ${MAX_FILES}`;
  const miles = Number(deliveryMilesText || 0);
  const deliveryFee = deliveryEnabled ? calcDeliveryFee(miles) : 0;

  const canContinue = useMemo(() => files.length > 0 && files.length <= MAX_FILES, [files.length]);

  const pickFiles = async () => {
    try {
      if (files.length >= MAX_FILES) return;

      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '*/*'],
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const incomingBase: PickedFile[] = (res.assets || [])
        .map((a) => ({
          name: a.name ?? 'file',
          uri: a.uri,
          size: a.size,
          mimeType: a.mimeType,
          pages: undefined,
        }))
        .filter((f) => isAllowed(f.name));

      // calcular páginas SOLO si es PDF (para imagenes ponemos 1)
      const incomingWithPages: PickedFile[] = [];
      for (const f of incomingBase) {
        const ext = f.name.split('.').pop()?.toLowerCase() || '';
        if (ext === 'pdf') {
          const pages = await getPdfPages(f.uri);
          incomingWithPages.push({ ...f, pages });
        } else if (['jpg', 'jpeg', 'png', 'tiff', 'psd'].includes(ext)) {
          incomingWithPages.push({ ...f, pages: undefined });
        } else {
          incomingWithPages.push({ ...f, pages: undefined });
        }
      }

      const merged = [...files, ...incomingWithPages].slice(0, MAX_FILES);
      setFiles(merged);
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo abrir el selector de archivos. Revisa que estás usando Expo Go y vuelve a intentar.');
    }
  };

  const onContinue = () => {
    try {
      order.setFiles(files);

      order.setNotes(notes);

      order.setDelivery({
        enabled: deliveryEnabled,
        address: deliveryEnabled ? deliveryAddress.trim() : '',
        miles: deliveryEnabled ? Number(deliveryMilesText || 0) : 0,
        fee: deliveryEnabled ? deliveryFee : 0,
      });

      // si tu printConfig existe, actualizamos totalPages sumando PDFs
      if (order.printConfig) {
        const totalPages = files.reduce((acc, f) => acc + (Number(f.pages) || 0), 0);
        order.setPrintConfig({
          ...order.printConfig,
          totalPages: totalPages > 0 ? totalPages : order.printConfig.totalPages,
        });
      }
    } catch (e) {}

    router.push({
      pathname: '/order-summary',
      params: { flow: isPosterFlow ? 'poster' : isPhotoFlow ? 'photo' : 'print' },
    });

  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>
          {isPosterFlow
            ? t('posterConfig.title', 'Gran Formato')
            : isPhotoFlow
              ? t('upload.photoTitle', 'Subir fotos')
              : t('upload.title', 'Subir documentos')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <View style={styles.heroCircle}>
            <Upload size={34} color="#0B5FFF" />
          </View>
        </View>

        <Text style={styles.h1}>
         {isPosterFlow
           ? t('upload.posterTitle', 'Subir archivo de gran formato')
           : isPhotoFlow
             ? t('upload.photoTitle', 'Subir fotos')
             : t('upload.title', 'Subir documentos')}
      </Text>

        <Text style={styles.sub}>
         {isPosterFlow
           ? t('upload.posterSubtitle', 'Selecciona la imagen o PDF para tu impresión de gran formato')
           : isPhotoFlow
             ? t('upload.photoSubtitle', 'Elige tus fotos y la cantidad')
             : t('upload.subtitle', 'Selecciona tus archivos para imprimir')}
      </Text>

        <View style={styles.infoBox}>
          <Info size={18} color="#0B5FFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoText}>
              {t('upload.formats', 'Formatos aceptados: PDF, DOC, DOCX, JPG, PNG, TIFF, PSD')}
            </Text>
            <Text style={styles.infoSub}>{t('upload.max', 'Máximo 5 archivos por pedido')}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.dropzone} activeOpacity={0.9} onPress={pickFiles}>
          <Upload size={26} color="#0B5FFF" />
          <Text style={styles.dropTitle}>{t('upload.select', 'Seleccionar Archivo')}</Text>
          <Text style={styles.dropCount}>{countLabel}</Text>
        </TouchableOpacity>

        {/* Lista simple de archivos seleccionados */}
        {files.length > 0 ? (
          <View style={styles.filesCard}>
            {files.map((f, i) => (
              <View key={`${f.uri}-${i}`} style={styles.fileRow}>
                <Text style={styles.fileName}>{i + 1}. {f.name}</Text>
                <Text style={styles.fileMeta}>{f.pages ? `${f.pages} págs.` : ''}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Truck size={20} color="#0B5FFF" />
            <Text style={styles.cardTitle}>{t('upload.deliveryTitle', 'Servicio de Delivery')}</Text>
          </View>
          <Text style={styles.cardDesc}>
            {t('upload.deliveryDesc', '¿Necesitas que entreguemos tu pedido en una ubicación específica?')}
          </Text>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setDeliveryEnabled((v) => !v)}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, deliveryEnabled && styles.checkboxOn]} />
            <Text style={styles.checkText}>{t('upload.deliveryYes', 'Sí, necesito servicio de delivery')}</Text>
          </TouchableOpacity>

          {deliveryEnabled ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.inputLabel}>{t('upload.deliveryAddress', 'Dirección de Entrega')} *</Text>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder={t('upload.deliveryAddressPlaceholder', 'Ingresa la dirección completa de entrega...')}
                placeholderTextColor="#9AA3AF"
                style={styles.input}
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>{t('upload.deliveryMiles', 'Distancia Estimada (millas)')} *</Text>
              <TextInput
                value={deliveryMilesText}
                onChangeText={(v) => setDeliveryMilesText(v.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9AA3AF"
                style={styles.input}
              />

              <Text style={styles.feeText}>
                {t('upload.deliveryFeeNote', 'Tarifa: $10.00 USD (primeras 20 millas) + $0.60 USD por milla después de 20')}
              </Text>
              <Text style={styles.feeTextBold}>
                {t('upload.deliveryCost', 'Costo estimado delivery')}: ${deliveryFee.toFixed(2)} USD
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.section}>{t('upload.notesTitle', 'Comentarios Adicionales')}</Text>
        <Text style={styles.notesHint}>{t('upload.notesHint', 'Instrucciones especiales o notas (opcional)')}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={t('upload.notesPlaceholder', 'Ej: Por favor imprimir las primeras 10 páginas a color y el resto en blanco y negro...')}
          placeholderTextColor="#9AA3AF"
          style={styles.notes}
          multiline
        />

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

  infoBox: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#EAF1FF',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: { fontSize: 14, fontWeight: '800', color: '#0B5FFF' },
  infoSub: { marginTop: 6, fontSize: 13, fontWeight: '700', color: '#2563EB' },

  dropzone: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0B5FFF',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  dropTitle: { fontSize: 20, fontWeight: '900', color: '#0B5FFF' },
  dropCount: { fontSize: 14, fontWeight: '800', color: '#6B7280' },

  filesCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  fileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  fileName: { fontWeight: '800', color: '#111827', flex: 1, paddingRight: 10 },
  fileMeta: { fontWeight: '800', color: '#6B7280' },

  card: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  cardDesc: { marginTop: 8, color: '#6B7280', fontSize: 14, fontWeight: '700' },

  checkRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  checkboxOn: { borderColor: '#0B5FFF', backgroundColor: '#0B5FFF' },
  checkText: { fontSize: 15, fontWeight: '800', color: '#111827' },

  inputLabel: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 8 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  feeText: { marginTop: 10, fontSize: 13, fontWeight: '800', color: '#2563EB' },
  feeTextBold: { marginTop: 6, fontSize: 14, fontWeight: '900', color: '#0B5FFF' },

  section: { marginTop: 18, fontSize: 22, fontWeight: '900', color: '#111827' },
  notesHint: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#6B7280' },
  notes: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    minHeight: 110,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
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

