import * as WebBrowser from "expo-web-browser";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Label, makeText, Section } from "../../components/ui";
import { LINKS } from "../../lib/config";
import { usePalette } from "../../lib/theme";

// TODO: replace these with what paid Substack subscribers actually receive.
const PERKS = [
  "Supporter-only essays and reflections on Substack",
  "Extra material that goes deeper into each stretch of the trail",
  "Early word on new Purpose Press releases",
];

export default function Support() {
  const c = usePalette();
  const t = useMemo(() => makeText(c), [c]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={{ gap: 6, marginBottom: 16 }}>
          <Label>Trail Supporters</Label>
          <Text style={t.h2}>Help keep The Trail free</Text>
        </View>
        <Section>
          <Text style={t.body}>
            The Trail is free for every reader and every small group, with no paywall at any point on the trail. Trail
            Supporters make that possible.
          </Text>
          <Text style={t.body}>
            You become a supporter through a paid subscription to our Substack. As our thank-you, you get access to
            supporter-only content there.
          </Text>
        </Section>
        <Section>
          <Text style={t.h3}>What supporters receive</Text>
          {PERKS.map((p) => (
            <View key={p} style={{ flexDirection: "row", gap: 10 }}>
              <Text style={[t.body, { color: c.blaze }]}>•</Text>
              <Text style={[t.body, { flex: 1 }]}>{p}</Text>
            </View>
          ))}
        </Section>
        <Section>
          <Button primary title="Become a Trail Supporter ↗" onPress={() => WebBrowser.openBrowserAsync(LINKS.substackSubscribe)} />
          <Text style={t.note}>
            Opens our Substack, where you can choose a monthly or yearly plan. Already a supporter? Thank you for walking
            with us.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxWidth: 640, width: "100%", alignSelf: "center" },
});
