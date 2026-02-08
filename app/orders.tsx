import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { ShoppingBag, Clock, MapPin, Home } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { getOrders, Order } from '@/lib/orders';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#16A34A';
      case 'cancelled': return '#DC2626';
      default: return '#F59E0B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t('orders.completed');
      case 'cancelled': return t('orders.cancelled');
      default: return t('orders.pending');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Home size={20} color="#0B5FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {!loading && orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <ShoppingBag size={48} color="#0B5FFF" opacity={0.5} />
          </View>
          <Text style={styles.emptyTitle}>{t('orders.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('orders.emptySubtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>#{item.id}</Text>
                  <View style={styles.dateRow}>
                    <Clock size={12} color="#687076" />
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.orderInfo}>
                <View style={styles.infoRow}>
                  <MapPin size={14} color="#687076" />
                  <Text style={styles.infoValue} numberOfLines={1}>{item.locationName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.flowBadge}>
                    <Text style={styles.flowText}>{item.flow.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.totalText}>${item.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#11181C',
    flex: 1,
    textAlign: 'center',
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#11181C',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#687076',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  orderInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  flowBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0EEFF',
  },
  flowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B5FFF',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#11181C',
  },
});
