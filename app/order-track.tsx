import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Hash, Home } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function OrderTrackScreen() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (orderId.trim()) {
      router.push({ pathname: '/order-status', params: { orderId: orderId.trim() } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Home size={20} color="#0B5FFF" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Rastrear Pedido</Text>
            <Text style={styles.subtitle}>Introduce el ID de tu pedido para ver el estado actual.</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Hash size={20} color="#0B5FFF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: PRT-123456"
              placeholderTextColor="#9BA1A6"
              value={orderId}
              onChangeText={setOrderId}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.searchButton, !orderId.trim() && styles.disabledButton]}
            onPress={handleSearch}
            disabled={!orderId.trim()}
          >
            <Search size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.searchButtonText}>Buscar pedido</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Encontrarás el ID del pedido en tu correo de confirmación o en el historial de pedidos.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#11181C',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#687076',
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: 24,
    paddingHorizontal: 16,
    height: 64,
  },
  iconWrapper: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    height: '100%',
  },
  searchButton: {
    backgroundColor: '#0B5FFF',
    flexDirection: 'row',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#A0C4FF',
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 10,
  },
  infoCard: {
    marginTop: 40,
    backgroundColor: '#F0F7FF',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0B5FFF',
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
});
