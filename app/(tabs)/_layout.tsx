import { Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { fonts, usePalette } from "../../lib/theme";

const icon = (glyph: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 18 }}>{glyph}</Text>
);

export default function TabsLayout() {
  const c = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.pine,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: fonts.uiBold, fontSize: 12 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="today" options={{ title: "Today", tabBarIcon: icon("◉") }} />
      <Tabs.Screen name="trail" options={{ title: "The Trail", tabBarIcon: icon("⋯") }} />
      <Tabs.Screen name="support" options={{ title: "Support", tabBarIcon: icon("♡") }} />
      <Tabs.Screen name="about" options={{ title: "About", tabBarIcon: icon("ⓘ") }} />
    </Tabs>
  );
}
