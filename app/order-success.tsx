import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Home, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={100} color="#0B5FFF" />
        </View>

        <Text style={styles.title}>{t('success.title')}</Text>
        <Text style={styles.subtitle}>
          {t('success.subtitle', { orderId: `#${orderId}` }).replace('#{{orderId}}', `#${orderId}`)}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push({ pathname: '/order-status', params: { orderId } })}
          >
            <Search size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>{t('success.status')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/')}
          >
            <Home size={20} color="#0B5FFF" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>{t('success.home')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>{t('success.redirect')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: '#F0F7FF',
    padding: 30,
    borderRadius: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#11181C',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  orderId: {
    color: '#0B5FFF',
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#0B5FFF',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  secondaryButtonText: {
    color: '#0B5FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#9BA1A6',
  },
});
