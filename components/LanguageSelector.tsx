import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || i18n.resolvedLanguage || "es") as string;
  const isEs = lang.startsWith("es");

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <TouchableOpacity
        onPress={() => i18n.changeLanguage("es")}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
          backgroundColor: isEs ? "#ffffff" : "rgba(255,255,255,0.2)",
        }}
      >
        <Text style={{ color: isEs ? "#0066FF" : "#fff", fontWeight: "700" }}>
          ES
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => i18n.changeLanguage("en")}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
          backgroundColor: !isEs ? "#ffffff" : "rgba(255,255,255,0.2)",
        }}
      >
        <Text style={{ color: !isEs ? "#0066FF" : "#fff", fontWeight: "700" }}>
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
}
