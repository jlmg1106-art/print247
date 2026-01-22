import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomBackButton({ label = 'Atrás' }: { label?: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        // 1) Si hay historial, retrocede normal
        if (router.canGoBack()) {
          router.back();
          return;
         }

        // 2) Si NO hay historial, vuelve a Order Type
        router.replace('/select-order-type');
      }}
      activeOpacity={0.85}
      style={styles.btn}
     >
      <Text style={styles.icon}>←</Text>
      <Text style={styles.txt}>{label}</Text>
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


