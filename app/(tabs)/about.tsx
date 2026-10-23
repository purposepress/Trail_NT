import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Label, makeText, Section } from "../../components/ui";
import { LINKS } from "../../lib/config";
import { useTrail } from "../../lib/store";
import { usePalette } from "../../lib/theme";

export default function About() {
  const c = usePalette();
  const t = useMemo(() => makeText(c), [c]);
  const dark = useColorScheme() === "dark";
  const { resetAll } = useTrail();
  const [confirm, setConfirm] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={{ gap: 6, marginBottom: 16 }}>
          <Label>About us</Label>
          <Text style={t.h2}>The Trail: New Testament</Text>
        </View>

        <Section>
          <Text style={t.h3}>Why The Trail</Text>
          <Text style={t.body}>
            The Trail walks through the New Testament one day at a time. Each stop opens with a centering prayer, sends
            you to the passage in the translation you prefer, and offers commentary you can read or hear, space for your
            own notes, and questions for a small group.
          </Text>
          <Text style={t.body}>
            There’s no calendar to keep up with. Day 2 is simply the next day you come back. Miss a week, and the trail
            waits for you.
          </Text>
        </Section>

        <Section>
          <Text style={t.h3}>Your guide</Text>
          {/* TODO: author photo and bio */}
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={[styles.portrait, { backgroundColor: c.pineSoft, borderColor: c.line }]}>
              <Text style={t.note}>Photo</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[t.body, { fontWeight: "600" }]}>Author name</Text>
              <Text style={t.note}>A short bio: who you are, your teaching background, and why you wrote The Trail.</Text>
            </View>
          </View>
        </Section>

        <Section>
          <Image
            source={
              dark
                ? require("../../assets/images/purpose-press-logo-light.png")
                : require("../../assets/images/purpose-press-logo.png")
            }
            style={styles.logo}
            accessibilityLabel="Purpose Press: Plan with purpose. Live with faith."
          />
          <Text style={t.note}>A sentence or two about Purpose Press and its mission.</Text>
          <Button primary title="Visit Purpose Press ↗" onPress={() => WebBrowser.openBrowserAsync(LINKS.purposePress)} />
        </Section>

        <Section>
          <Text style={t.h3}>Keep reading on Substack</Text>
          <Text style={t.note}>Subscribe for essays, updates, and new releases.</Text>
          <Button title="Our Substack ↗" onPress={() => WebBrowser.openBrowserAsync(LINKS.substack)} />
        </Section>

        <Section>
          <Label>Scripture</Label>
          <Text style={t.note}>Readings open on Bible Gateway in the translation you choose. The NRSV is the default.</Text>
          <Button title="Show title screen" onPress={() => router.replace("/")} />
        </Section>

        <Section>
          <Label>Restart</Label>
          {confirm ? (
            <View style={{ gap: 10 }}>
              <Text style={t.note}>This clears your progress and notes on this phone.</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  primary
                  title="Clear and restart"
                  onPress={async () => {
                    await resetAll();
                    setConfirm(false);
                    router.navigate("/today");
                  }}
                />
                <Button title="Cancel" onPress={() => setConfirm(false)} />
              </View>
            </View>
          ) : (
            <Button title="Restart the trail" onPress={() => setConfirm(true)} />
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxWidth: 640, width: "100%", alignSelf: "center" },
  portrait: { width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  logo: { width: 120, height: 120 },
});
