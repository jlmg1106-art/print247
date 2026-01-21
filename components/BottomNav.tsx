import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
  backLabel?: string;
  nextLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
};

export default function BottomNav({
  backLabel = 'Regresar',
  nextLabel = 'Continuar',
  onNext,
  nextDisabled = false,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.btn, styles.back]}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Text style={styles.backText}>← {backLabel}</Text>
      </TouchableOpacity>

      {!!onNext && (
        <TouchableOpacity
          style={[styles.btn, styles.next, nextDisabled && styles.nextDisabled]}
          onPress={onNext}
          disabled={nextDisabled}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>{nextLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    backgroundColor: '#F2F6FF',
    borderWidth: 1,
    borderColor: '#A9C5FF',
  },
  next: {
    backgroundColor: '#0B5FFF',
  },
  nextDisabled: {
    opacity: 0.45,
  },
  backText: {
    color: '#0B5FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});
