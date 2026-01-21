import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomBackButton({ label = 'Atrás' }: { label?: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity
     onPress={() => {
       try {
         if (typeof window !== 'undefined' && window.history.length > 1) {
           router.back();
           return;
         }
       } catch {}
       router.replace('/select-order-type');
     }}
     activeOpacity={0.85}
     style={styles.btn}
    >
      <Text style={styles.icon}>←</Text>
      <Text style={styles.txt} numberOfLines={1} ellipsizeMode="tail">
       {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    btn: {
      width: '100%',
      height: 56,
      borderRadius: 16,
      backgroundColor: '#FF3D00',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
    },


    icon: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: '900',
    },
    txt: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '900',
    },

});


