import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Order {
  id: string;
  createdAt: string;
  flow: 'poster' | 'photo' | 'print';
  locationName: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

const ORDERS_KEY = 'printing247_orders';
const ORDER_COUNTER_KEY = 'printing247_order_counter';

export async function saveOrder(order: Order) {
  try {
    const existingOrders = await getOrders();
    const newOrders = [order, ...existingOrders];
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
  } catch (error) {
    console.error('Error saving order:', error);
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
    return ordersJson ? JSON.parse(ordersJson) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export async function clearOrders() {
  try {
    await AsyncStorage.removeItem(ORDERS_KEY);
    await AsyncStorage.removeItem(ORDER_COUNTER_KEY);
  } catch (error) {
    console.error('Error clearing orders:', error);
  }
}

export async function generateOrderId(): Promise<string> {
  try {
    const counterJson = await AsyncStorage.getItem(ORDER_COUNTER_KEY);
    let counter = counterJson ? parseInt(counterJson, 10) : 0;
    counter += 1;
    await AsyncStorage.setItem(ORDER_COUNTER_KEY, counter.toString());
    
    const year = new Date().getFullYear();
    const paddedCounter = counter.toString().padStart(6, '0');
    return `P247-${year}-${paddedCounter}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    return `P247-${Date.now()}`;
  }
}
