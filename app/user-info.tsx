import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Phone, Mail } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useOrder } from '@/contexts/OrderContext';

export default function UserInfo() {
  const router = useRouter();
  const { t } = useTranslation();

  // Intentamos usar tu OrderContext (si tiene setters distintos, lo ajustamos luego)
  const order = useOrder?.();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const canContinue = useMemo(() => {
    const nameOk = fullName.trim().length >= 3;
    const phoneOk = phone.trim().length >= 7;
    const emailOk = email.includes('@') && email.includes('.');
    return nameOk && phoneOk && emailOk;
  }, [fullName, phone, email]);

  const onContinue = () => {
    // Guardar en contexto si existe
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      if (order?.setUserInfo) order.setUserInfo(payload);
      else if (order?.setCustomerInfo) order.setCustomerInfo(payload);
      else if (order?.setUser) order.setUser(payload);
    } catch (e) {
      // si el contexto no tiene setter todavía, no bloqueamos el flujo
    }

    // Siguiente pantalla (si tu ruta es otra, la cambiamos)
    router.push('/select-location');
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{t('userInfo.title', 'User Information')}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <User color="#0B5FFF" size={34} strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.h1}>{t('userInfo.title', 'User Information')}</Text>
          <Text style={styles.sub}>
            {t('userInfo.subtitle', 'We need your details to process your order')}
          </Text>

          {/* Nombre */}
          <Text style={styles.label}>{t('userInfo.fullName', 'Full Name')}</Text>
          <View style={styles.inputRow}>
            <View style={styles.leftIcon}>
              <User color="#9AA3AF" size={18} />
            </View>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('userInfo.fullNamePlaceholder', 'Enter your full name')}
              placeholderTextColor="#A0A7B3"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Teléfono */}
          <Text style={styles.label}>{t('userInfo.phone', 'Phone')}</Text>
          <View style={styles.inputRow}>
            <View style={styles.leftIcon}>
              <Phone color="#9AA3AF" size={18} />
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder={t('userInfo.phonePlaceholder', '+1 (555) 123-4567')}
              placeholderTextColor="#A0A7B3"
              style={styles.input}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>{t('userInfo.email', 'Email')}</Text>
          <View style={styles.inputRow}>
            <View style={styles.leftIcon}>
              <Mail color="#9AA3AF" size={18} />
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('userInfo.emailPlaceholder', 'example@email.com')}
              placeholderTextColor="#A0A7B3"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>

          <View style={{ height: 22 }} />
        </ScrollView>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            onPress={onContinue}
            activeOpacity={0.85}
            disabled={!canContinue}
          >
            <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
              {t('userInfo.continue', 'Continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
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
  topTitle: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 120,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  sub: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 52,
  },
  leftIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
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
  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#0B5FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    backgroundColor: '#C7D2FE',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  ctaTextDisabled: {
    color: 'rgba(255,255,255,0.9)',
  },
});
