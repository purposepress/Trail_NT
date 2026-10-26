import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Label, makeText, Section } from "../../components/ui";
import { LINKS } from "../../lib/config";
import { useTrail } from "../../lib/store";
import { usePalette } from "../../lib/theme";

// ---------- About page text (Frank's wording) ----------

const WELCOME =
  "The Trail: New Testament Edition walks you through the New Testament one day at a time. A new day opens each time you return, so there’s no calendar to keep up with. If you miss a week, The Trail waits for you.";

const FEATURES = [
  { label: "Centering prayer", text: "A short prayer to quiet distractions and turn your attention to God." },
  {
    label: "Reading",
    text: "The New Testament in an arrangement that begins with the story of Jesus and the experience of the earliest believers, guiding you along the path of discipleship. Read it in the translation you prefer.",
  },
  { label: "Commentary", text: "Reflections on the passage that you can read or listen to, recorded by Frank and Stacy." },
  { label: "Small group questions", text: "Prompts for discussion, whether you’re with a group or reading on your own." },
  { label: "My notes", text: "A private place to write down your thoughts. Your notes stay on your phone." },
  {
    label: "Ask the author",
    text: "Questions will come up along the way. Send them from the app and we’ll get back to you. We want to walk this trail with you.",
  },
];

const KEEP_GOING =
  "When you finish the New Testament, continue through the whole Bible and the Apocrypha with the Trail Journal and our podcast.";

const PEOPLE = [
  {
    name: "Frank Shirvinski",
    photo: require("../../assets/images/frank.jpg"),
    bio:
      "Frank is an aerospace engineer, author, and minister who works to bridge the perceived gaps between science and theology. He studied aerospace engineering at Purdue University, then earned a Master of Divinity in Old Testament/Hebrew Bible from Emmanuel School of Religion and a Master of Theology from Emory University, followed by doctoral studies in Historical Linguistics at the University of Georgia. He has served churches in Tennessee, Georgia, and Arizona, including fifteen years as Senior Minister at Chaparral Christian Church in Scottsdale, and has taught Hebrew at Fuller Theological Seminary and biblical studies at Atlanta Christian College. Today he is a Senior Principal Engineer for spacecraft systems at Optimum Technologies.",
  },
  {
    name: "Stacy Shirvinski",
    photo: require("../../assets/images/stacy.jpg"),
    bio:
      "Stacy studied psychology at Purdue, where she met Frank. She has spent years in church ministry, first with youth and then in children’s ministry, creating events that help kids grow in their faith. She also founded Andie’s Coffee in Scottsdale, a gathering place where people come together and feel at home. Her work has been recognized with nominations for MASK magazine’s Moms Making a Difference Award and the Greater Phoenix Chamber of Commerce Impact Award.",
  },
];

const WHY =
  "Frank and Stacy created The Trail: New Testament Edition to help those seeking to engage with the Bible for the first time, as well as those who are looking to dig a bit deeper into these sacred writings.";

const MISSION =
  "Purpose Press creates tools to help you understand the Bible more deeply and grow closer to Christ, whether you’re exploring Scripture on your own, leading a small group, or sharing stories of faith with your children or grandchildren.";

const MOTTO = "Our desire is not to see a different world, but to see the same world differently.";

// ---------- page ----------

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
          <Text style={t.h2} accessibilityRole="header">
            Welcome to The Trail: New Testament
          </Text>
        </View>

        <Section>
          <Text style={t.body}>{WELCOME}</Text>
          <Text style={[t.h3, { marginTop: 4 }]}>Each day includes</Text>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.feature}>
              <View style={[styles.marker, { backgroundColor: c.blaze }]} />
              <Text style={[t.body, { flex: 1 }]}>
                <Text style={{ fontWeight: "600" }}>{f.label}. </Text>
                {f.text}
              </Text>
            </View>
          ))}
        </Section>

        <Section>
          <Text style={t.h3}>Keep going</Text>
          <Text style={t.body}>{KEEP_GOING}</Text>
          <Button primary title="Visit Purpose Press ↗" onPress={() => WebBrowser.openBrowserAsync(LINKS.purposePress)} />
        </Section>

        <Section>
          <Text style={t.h3}>Meet Frank and Stacy Shirvinski</Text>
          {PEOPLE.map((p) => (
            <View key={p.name} style={{ gap: 10, marginTop: 4 }}>
              <View style={styles.person}>
                <Image source={p.photo} style={[styles.portrait, { borderColor: c.line }]} accessibilityLabel={`Photo of ${p.name}`} />
                <Text style={[t.h3, { flex: 1 }]}>{p.name}</Text>
              </View>
              <Text style={t.body}>{p.bio}</Text>
            </View>
          ))}
          <Text style={[t.body, { marginTop: 4 }]}>{WHY}</Text>
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
          <Text style={t.h3}>The Mission of Purpose Press</Text>
          <Text style={t.body}>{MISSION}</Text>
          <Text style={[t.body, { fontStyle: "italic", color: c.pine }]}>{MOTTO}</Text>
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
  feature: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  marker: { width: 7, height: 7, borderRadius: 4, marginTop: 11 },
  person: { flexDirection: "row", gap: 14, alignItems: "center" },
  portrait: { width: 72, height: 72, borderRadius: 36, borderWidth: 1 },
  logo: { width: 120, height: 120 },
});
