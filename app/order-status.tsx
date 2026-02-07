import BottomBackButton from '@/components/BottomBackButton';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock3, XCircle, CheckCircle2, PackageCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../contexts/OrderContext';
import { getOrders, updateOrderStatus } from '@/lib/orders';

type Status = 'pending' | 'cancelled' | 'completed';

export default function OrderStatus() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [status, setStatus] = useState<Status>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const tmr = setTimeout(() => {
      router.replace('/');
    }, 10000);

    return () => clearTimeout(tmr);
  }, [orderId]);

  const loadStatus = async () => {
    if (orderId) {
      const orders = await getOrders();
      const currentOrder = orders.find(o => o.id === orderId);
      if (currentOrder) {
        setStatus(currentOrder.status);
      }
    }
    setLoading(false);
  };

  const { t } = useTranslation();
  const order = useOrder() as any;

  const meta = useMemo(() => {
  if (status === 'completed')
    return {
      icon: CheckCircle2,
      title: t('status.completed', 'Completado'),
      desc: t('status.completedDesc', 'Tu pedido fue completado y está listo.'),
    };

  if (status === 'cancelled')
    return {
      icon: XCircle,
      title: t('status.cancelled', 'Cancelado'),
      desc: t('status.cancelledDesc', 'Tu pedido fue cancelado.'),
    };

  return {
    icon: Clock3,
    title: t('status.pending', 'Pendiente'),
    desc: t('status.pendingDesc', 'Estamos procesando tu pedido.'),
  };
}, [status, t]);

  const Icon = meta.icon;

  const save = async (s: Status) => {
    setStatus(s);
    if (orderId) {
      await updateOrderStatus(orderId, s);
    }
    try {
      if (order?.setOrderStatus) order.setOrderStatus({ status: s });
      else if (order?.setStatus) order.setStatus(s);
    } catch (e) {}
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>
          {orderId ? `Pedido: ${orderId}` : 'order-status'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.circle}>
            <PackageCheck size={34} color="#0B5FFF" />
          </View>
        </View>

        <Text style={styles.h1}>{t('status.receivedTitle', 'Pedido Recibido')}</Text>
        <Text style={styles.sub}>{t('status.receivedSub', 'Puedes ver el estado de tu pedido aquí')}</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <Icon size={22} color={status === 'completed' ? '#16A34A' : status === 'cancelled' ? '#DC2626' : '#F59E0B'} />
            <Text style={styles.statusTitle}>{meta.title}</Text>
          </View>
          <Text style={styles.statusDesc}>{meta.desc}</Text>
        </View>

        <Text style={styles.smallTitle}>{t('status.change', 'Cambiar estado (demo)')}</Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.pill, status === 'pending' && styles.pillOn]} onPress={() => save('pending')} activeOpacity={0.9}>
            <Text style={styles.pillText}>{t('status.pending', 'Pendiente')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pill, status === 'cancelled' && styles.pillOnRed]} onPress={() => save('cancelled')} activeOpacity={0.9}>
            <Text style={styles.pillText}>{t('status.cancelled', 'Cancelado')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pill, status === 'completed' && styles.pillOnGreen]} onPress={() => save('completed')} activeOpacity={0.9}>
            <Text style={styles.pillText}>{t('status.completed', 'Completado')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={{ flex: 1 }}>
          <BottomBackButton label="Atrás" />
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

  content: { paddingHorizontal: 18, paddingTop: 18 },

  hero: { alignItems: 'center', marginTop: 10 },
  circle: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },

  h1: { marginTop: 14, fontSize: 34, fontWeight: '900', color: '#111827', textAlign: 'center' },
  sub: { marginTop: 8, fontSize: 15, color: '#6B7280', textAlign: 'center' },

  statusCard: { marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  statusDesc: { marginTop: 10, color: '#6B7280', fontWeight: '700' },

  smallTitle: { marginTop: 18, fontWeight: '900', color: '#111827' },

  btnRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { borderRadius: 999, borderWidth: 2, borderColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FFFFFF' },
  pillOn: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  pillOnRed: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  pillOnGreen: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  pillText: { fontWeight: '900', color: '#111827' },

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
});
