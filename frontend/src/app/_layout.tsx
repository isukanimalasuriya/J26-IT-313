import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useColorScheme, View, StyleSheet } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import BottomNav from "@/components/BottomNav";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      <View style={styles.container}>
        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>

        <BottomNav />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});
