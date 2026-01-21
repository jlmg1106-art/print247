
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Camera, Megaphone } from 'lucide-react-native';
import { useOrder } from '../contexts/OrderContext';
import { useTranslation } from 'react-i18next';

export default function SelectOrderType() {
  const router = useRouter();
  const { setOrderType } = useOrder();
  const { t } = useTranslation();

  const handleOrderType = (type: 'document' | 'photo' | 'poster') => {
    setOrderType(type);
    router.push('/user-info');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0066FF', '#0052CC', '#003D99']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('landing.whatToPrint')}</Text>
            <Text style={styles.subtitle}>{t('landing.selectServiceType')}</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleOrderType('document')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <FileText color="#0066FF" size={32} strokeWidth={2} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>{t('landing.documents')}</Text>
                  <Text style={styles.buttonSubtitle}>
                    {t('landing.documentsDesc')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleOrderType('photo')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainerSecondary}>
                  <Camera color="#fff" size={32} strokeWidth={2} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitleSecondary}>{t('landing.photos')}</Text>
                  <Text style={styles.buttonSubtitleSecondary}>
                    {t('landing.photosDesc')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={() => handleOrderType('poster')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainerTertiary}>
                  <Megaphone color="#FF6B35" size={32} strokeWidth={2} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitleTertiary}>{t('landing.posters')}</Text>
                  <Text style={styles.buttonSubtitleTertiary}>
                    {t('landing.postersDesc')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>{t('landing.acceptedFormats')}</Text>
            <Text style={styles.infoText}>
              {t('landing.formats')}
            </Text>
            <Text style={styles.infoSubtext}>{t('landing.maxFiles')}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066FF',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tertiaryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSecondary: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerTertiary: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0066FF',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#666',
  },
  buttonTitleSecondary: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtitleSecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  buttonTitleTertiary: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FF6B35',
    marginBottom: 4,
  },
  buttonSubtitleTertiary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#666',
  },
  infoSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

