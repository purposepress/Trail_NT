import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Label, makeText, Section } from "../../components/ui";
import { LINKS } from "../../lib/config";
import { useTrail } from "../../lib/store";
import { usePalette } from "../../lib/theme";

// Draft bios, condensed from Frank's About text. Edit freely.
const PEOPLE = [
  {
    name: "Frank Shirvinski",
    photo: require("../../assets/images/frank.jpg"),
    bio:
      "Frank is an aerospace engineer, author, and minister who works to bridge the perceived gaps between science and theology. He studied aerospace engineering at Purdue University, earned a Master of Divinity in Old Testament/Hebrew Bible from Emmanuel School of Religion and a Master of Theology from Emory University, and pursued doctoral studies in Historical Linguistics at the University of Georgia. He served fifteen years as Senior Minister at Chaparral Christian Church in Scottsdale and has taught Hebrew at Fuller Theological Seminary and biblical studies at Atlanta Christian College. Today he is a Senior Principal Engineer for spacecraft systems at Optimum Technologies.",
  },
  {
    name: "Stacy Shirvinski",
    photo: require("../../assets/images/stacy.jpg"),
    bio:
      "Stacy studied psychology at Purdue, where she met Frank. She has spent years in church ministry, first with youth and then in children’s ministry, creating events that help kids grow in their faith. She also founded Andie’s Coffee in Scottsdale, a gathering place where people come together and feel at home, and was nominated for MASK magazine’s Moms Making a Difference Award and the Greater Phoenix Chamber of Commerce Impact Award.",
  },
];

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
          <Text style={t.h3}>Meet Frank and Stacy Shirvinski</Text>
          {PEOPLE.map((p) => (
            <View key={p.name} style={styles.person}>
              <Image source={p.photo} style={[styles.portrait, { borderColor: c.line }]} accessibilityLabel={`Photo of ${p.name}`} />
              <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
                <Text style={[t.h3, { fontSize: 19 }]}>{p.name}</Text>
                <Text style={[t.body, { fontSize: 16, lineHeight: 25 }]}>{p.bio}</Text>
              </View>
            </View>
          ))}
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
          <Text style={t.h3}>The mission of Purpose Press</Text>
          <Text style={t.body}>
            Purpose Press creates tools to help you understand the Bible more deeply and grow closer to Christ, whether
            you’re exploring Scripture on your own, leading a small group, or sharing stories of faith with your children
            or grandchildren.
          </Text>
          <Text style={[t.body, { fontStyle: "italic" }]}>
            Our desire is not to see a different world, but to see the same world differently.
          </Text>
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
  person: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  portrait: { width: 84, height: 84, borderRadius: 42, borderWidth: 1 },
  logo: { width: 120, height: 120 },
});
