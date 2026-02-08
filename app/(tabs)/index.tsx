import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Printer, UserPlus, Clock, MapPin, Shield, Zap, Sparkles, Settings, Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

export default function Index() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0066FF', '#0052CC', '#003D99']} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <LanguageSelector variant="dark" />
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin/login' as any)}
              activeOpacity={0.7}
            >
              <Settings color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Zap color="#0066FF" size={40} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.title}>{t('landing.title')}</Text>
            <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Clock color="#0066FF" size={16} />
                <Text style={styles.badgeText}>{t('landing.available247')}</Text>
              </View>
              <View style={[styles.badge, styles.emergencyBadge]}>
                <Sparkles color="#FF3D00" size={16} />
                <Text style={styles.emergencyBadgeText}>{t('landing.expressService')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureCard
              icon={<MapPin color="#0066FF" size={24} />}
              title={t('landing.globalLocations')}
              description={t('landing.globalLocationsDesc')}
            />
            <FeatureCard
              icon={<Shield color="#0066FF" size={24} />}
              title={t('landing.qualityGuaranteed')}
              description={t('landing.qualityGuaranteedDesc')}
            />
            <FeatureCard
              icon={<Sparkles color="#FF3D00" size={24} />}
              title={t('landing.immediateDelivery')}
              description={t('landing.immediateDeliveryDesc')}
            />
          </View>

          <View style={styles.ctaContainer}>
            <Text style={styles.ctaTitle}>{t('landing.getStarted')}</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/select-order-type' as any)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Printer color="#0066FF" size={32} strokeWidth={2} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>{t('landing.startPrinting')}</Text>
                  <Text style={styles.buttonSubtitle}>{t('landing.startPrintingDesc')}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/user-info' as any)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainerSecondary}>
                  <UserPlus color="#fff" size={32} strokeWidth={2} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitleSecondary}>{t('landing.becomeReceptor')}</Text>
                  <Text style={styles.buttonSubtitleSecondary}>{t('landing.becomeReceptorDesc')}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: '#fff' }]}
                onPress={() => router.push('/orders')}
                activeOpacity={0.8}
              >
                <View style={styles.smallButtonContent}>
                  <View style={[styles.iconContainerSmall, { backgroundColor: 'rgba(0, 102, 255, 0.1)' }]}>
                    <Clock color="#0066FF" size={24} />
                  </View>
                  <View style={styles.smallButtonTextContainer}>
                    <Text style={[styles.smallButtonTitle, { color: '#0066FF' }]}>{t('landing.myOrders')}</Text>
                    <Text style={styles.smallButtonSubtitle}>{t('landing.myOrdersDesc')}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 2, borderColor: '#fff' }]}
                onPress={() => router.push('/order-track')}
                activeOpacity={0.8}
              >
                <View style={styles.smallButtonContent}>
                  <View style={[styles.iconContainerSmall, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Search color="#fff" size={24} />
                  </View>
                  <View style={styles.smallButtonTextContainer}>
                    <Text style={[styles.smallButtonTitle, { color: '#fff' }]}>{t('landing.trackOrder')}</Text>
                    <Text style={[styles.smallButtonSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>{t('landing.trackOrderDesc')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>{t('landing.acceptedFormats')}</Text>
            <Text style={styles.infoText}>{t('landing.formats')}</Text>
            <Text style={styles.infoSubtext}>{t('landing.maxFiles')}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>{icon}</View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0066FF' },
  gradient: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  adminButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: { marginBottom: 16 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 18, fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)', marginBottom: 16 },

  badgeContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: { fontSize: 14, fontWeight: '600', color: '#0066FF' },
  emergencyBadge: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FF3D00' },
  emergencyBadgeText: { fontSize: 14, fontWeight: '600', color: '#FF3D00' },

  featuresContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginTop: 24 },
  featureCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 16, padding: 16, alignItems: 'center' },
  featureIconContainer: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 4 },
  featureDescription: { fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', lineHeight: 14 },

  ctaContainer: { paddingHorizontal: 24, marginTop: 32 },
  ctaTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 20, textAlign: 'center' },

  primaryButton: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  secondaryButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: '#fff' },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(0, 102, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconContainerSecondary: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  buttonTextContainer: { flex: 1 },
  buttonTitle: { fontSize: 20, fontWeight: '700', color: '#0066FF', marginBottom: 4 },
  buttonSubtitle: { fontSize: 14, fontWeight: '400', color: '#666' },
  buttonTitleSecondary: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  buttonSubtitleSecondary: { fontSize: 14, fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)' },

  rowButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  smallButton: { flex: 1, borderRadius: 20, padding: 12, height: 80, justifyContent: 'center' },
  smallButtonContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainerSmall: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  smallButtonTextContainer: { flex: 1 },
  smallButtonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  smallButtonSubtitle: { fontSize: 11, fontWeight: '400', color: '#666' },

  infoSection: { marginTop: 40, paddingHorizontal: 24, alignItems: 'center' },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  infoText: { fontSize: 14, fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: 4 },
  infoSubtext: { fontSize: 12, fontWeight: '400', color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' },
});
