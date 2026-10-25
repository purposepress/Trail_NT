import { IBMPlexSansCondensed_500Medium, IBMPlexSansCondensed_600SemiBold } from "@expo-google-fonts/ibm-plex-sans-condensed";
import { Literata_400Regular, Literata_400Regular_Italic, Literata_600SemiBold } from "@expo-google-fonts/literata";
import { YoungSerif_400Regular } from "@expo-google-fonts/young-serif";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { lockPortraitOnPhones } from "../lib/orientation";
import { TrailProvider, useTrail } from "../lib/store";
import { usePalette } from "../lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});
lockPortraitOnPhones();

function Root() {
  const { ready } = useTrail();
  const c = usePalette();
  const [fontsLoaded] = useFonts({
    YoungSerif_400Regular,
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_600SemiBold,
    IBMPlexSansCondensed_500Medium,
    IBMPlexSansCondensed_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded && ready) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, ready]);

  if (!fontsLoaded || !ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name="index" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TrailProvider>
        <StatusBar style="auto" />
        <Root />
      </TrailProvider>
    </SafeAreaProvider>
  );
}
