import '../i18n';
import { Stack } from 'expo-router';
import { OrderProvider } from '../contexts/OrderContext';

export default function RootLayout() {
  return (
    <OrderProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OrderProvider>
  );
}
