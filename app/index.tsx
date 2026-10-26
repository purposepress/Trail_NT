import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopoBackground from "../components/TopoBackground";
import { TOTAL_DAYS } from "../lib/config";
import { useTrail } from "../lib/store";
import { fonts, splash } from "../lib/theme";

// Title screen
export default function Title() {
  const insets = useSafeAreaInsets();
  const { progress } = useTrail();
  const bg = useColorScheme() === "dark" ? splash.bgDark : splash.bg;
  const started = progress.completed.length > 0 || progress.reached > 1;
  // Scale the title to the screen so it stays on one line, with room above the tall capitals.
  const { width } = useWindowDimensions();
  const titleSize = Math.min(72, Math.floor((width - 48) / 5.2));

  return (
    <View style={[styles.wrap, { backgroundColor: bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 36 }]}>
      <StatusBar style="light" />
      <TopoBackground background={bg} />
      <View>
        <Image
          source={require("../assets/images/purpose-press-logo-light.png")}
          style={styles.logo}
          accessibilityLabel="Purpose Press: Plan with purpose. Live with faith."
        />
        <Text
          style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.25) }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityRole="header"
        >
          The Trail
        </Text>
        <Text style={styles.subtitle}>New Testament Edition</Text>
        <Text style={styles.tagline}>315 days through the New Testament, one step at a time.</Text>
      </View>
      <View style={{ gap: 12 }}>
        <Pressable
          onPress={() => router.replace("/today")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{started ? "Continue the trail" : "Begin the trail"}</Text>
        </Pressable>
        <Text style={styles.sub}>
          Day {progress.reached} of {TOTAL_DAYS}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24, overflow: "hidden" },
  logo: { width: 112, height: 112, marginBottom: 28 },
  title: { fontFamily: fonts.display, color: splash.ink, paddingTop: 4 },
  subtitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 34, color: splash.soft, marginTop: 4 },
  tagline: { fontFamily: fonts.body, fontSize: 18, lineHeight: 27, color: splash.soft, marginTop: 16, maxWidth: 300 },
  cta: { backgroundColor: splash.ink, borderRadius: 999, paddingVertical: 15, paddingHorizontal: 28, alignSelf: "flex-start" },
  ctaText: { fontFamily: fonts.uiBold, fontSize: 17, color: "#1f2a24" },
  sub: { fontFamily: fonts.ui, fontSize: 14, color: splash.sub },
});
