import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Label, makeText } from "../../components/ui";
import { TOTAL_DAYS } from "../../lib/config";
import { useTrail } from "../../lib/store";
import { fonts, usePalette } from "../../lib/theme";

const ALL = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

export default function Trail() {
  const c = usePalette();
  const t = useMemo(() => makeText(c), [c]);
  const { days, progress } = useTrail();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <FlatList
        data={ALL}
        keyExtractor={(n) => String(n)}
        initialNumToRender={30}
        contentContainerStyle={styles.page}
        ListHeaderComponent={
          <View style={{ gap: 6, marginBottom: 14 }}>
            <Label>The whole trail</Label>
            <Text style={t.h2}>315 days through the New Testament</Text>
            <Text style={t.note}>A new day opens each day you return. You can revisit any day you’ve reached.</Text>
          </View>
        }
        renderItem={({ item: n }) => {
          const open = n <= progress.reached;
          const done = progress.completed.includes(n);
          const d = days[n];
          return (
            <Pressable
              disabled={!open}
              onPress={() => router.navigate({ pathname: "/today", params: { day: String(n) } })}
              accessibilityRole="button"
              accessibilityState={{ disabled: !open }}
              style={[
                styles.row,
                { borderBottomColor: c.line },
                n === progress.reached && { backgroundColor: c.pineSoft },
              ]}
            >
              <Text style={[styles.d, { color: done ? c.pine : c.muted }]}>
                {done ? "✓ " : ""}Day {n}
              </Text>
              <Text style={[t.body, { flex: 1, fontSize: 16, color: open ? c.ink : c.muted }]} numberOfLines={1}>
                {open ? d?.reference || "Coming soon" : "Ahead on the trail"}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxWidth: 640, width: "100%", alignSelf: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  d: { fontFamily: fonts.uiBold, fontSize: 14, minWidth: 74, fontVariant: ["tabular-nums"] },
});
