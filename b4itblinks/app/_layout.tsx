import { Stack } from "expo-router";

import "../global.css";

import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined" && "localStorage" in window) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
};

function RootContent() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      const theme =
        Platform.OS === "web"
          ? localStorage.getItem("theme")
          : await storage.getItem("theme");

      if (theme === "dark" || theme === "light") {
        setColorScheme(theme);

        if (Platform.OS === "web") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      }
    };

    loadTheme();
  }, [setColorScheme]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <RootContent />;
}
