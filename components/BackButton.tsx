import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      style={{ padding: 12 }}
    >
      <ArrowLeft size={22} color="#000" />
    </TouchableOpacity>
  );
}
