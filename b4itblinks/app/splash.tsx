import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(root)/(tabs)/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-900 px-8">
      <Image
        source={require("../assets/images/splash-icon.png")}
        className="w-32 h-32"
        style={styles.logoImage}
        resizeMode="contain"
      />

      <Text className="mt-6 text-4xl font-black text-white">B4itBlinks</Text>
      <Text className="mt-2 text-slate-300 text-center">
        Preparing your pantry
      </Text>

      <ActivityIndicator size="large" color="#f59e0b" className="mt-6" />
    </View>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: 128, // Tailwind w-32 fallback translation
    height: 128, // Tailwind h-32 fallback translation
  },
});
