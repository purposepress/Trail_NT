import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AudioPlayer from "../../components/AudioPlayer";
import Slides from "../../components/Slides";
import { Button, Label, makeText, Section } from "../../components/ui";
import { bibleGatewayUrl, TOTAL_DAYS, TRANSLATIONS } from "../../lib/config";
import { useTrail } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { fonts, usePalette } from "../../lib/theme";

const COLLAPSED_HEIGHT = 270; // about 10 lines of commentary

export default function Today() {
  const c = usePalette();
  const t = useMemo(() => makeText(c), [c]);
  const { days, progress, version, setVersion, markComplete, loadNote, saveNote, offline } = useTrail();
  const params = useLocalSearchParams<{ day?: string }>();
  const [current, setCurrent] = useState(progress.reached);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const { width: screenW } = useWindowDimensions();
  const contentWidth = Math.min(screenW, 640) - 40; // matches the page padding

  // When a new day opens, jump to it
  useEffect(() => setCurrent(progress.reached), [progress.reached]);

  // Opening a day from The Trail tab (runs after the effect above, so it wins)
  useEffect(() => {
    const n = Number(params.day);
    if (n >= 1 && n <= progress.reached) setCurrent(n);
  }, [params.day, progress.reached]);

  const day = days[current];
  const done = progress.completed.includes(current);
  const isFrontier = current === progress.reached;

  // notes
  const [note, setNote] = useState("");
  const [noteMsg, setNoteMsg] = useState("Notes stay on this phone.");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    loadNote(current).then(setNote);
    setNoteMsg("Notes stay on this phone.");
  }, [current, loadNote]);
  const onNote = (text: string) => {
    setNote(text);
    setNoteMsg("Saving…");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(current, text).then(() => setNoteMsg("Saved on this phone.")), 500);
  };

  // commentary collapse
  const [fullHeight, setFullHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [current]);
  const isLong = fullHeight > COLLAPSED_HEIGHT + 20;

  const go = (n: number) => {
    setCurrent(n);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  let nextLabel = "Mark complete ✓";
  let nextDisabled = !day;
  let onNext = () => markComplete(current);
  if (current < progress.reached) {
    nextLabel = "Next day →";
    nextDisabled = false;
    onNext = () => go(current + 1);
  } else if (done) {
    nextLabel = current >= TOTAL_DAYS ? "Trail complete" : "Next day opens tomorrow";
    nextDisabled = true;
  }

  const paragraphs = (day?.commentary ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.replace("/")} accessibilityLabel="Show title screen">
            <Text style={[styles.brand, { color: c.ink }]}>
              The Trail: <Text style={{ color: c.pine }}>New Testament Edition</Text>
            </Text>
          </Pressable>
          <TrailBar completed={progress.completed.length} />

          <View style={{ gap: 6, marginTop: 18 }}>
            <Label>{done ? "Completed" : isFrontier ? "Today on the trail" : "Revisiting"}</Label>
            <Text style={[styles.dayNum, { color: c.pine }]}>
              {current} <Text style={[styles.of, { color: c.muted }]}>of {TOTAL_DAYS}</Text>
            </Text>
            <Text style={t.h2}>{day?.title || "The next stop is coming soon"}</Text>
            <View style={styles.row}>
              <Button title="← Previous" onPress={() => go(current - 1)} disabled={current <= 1} />
              <Button title={nextLabel} onPress={onNext} disabled={nextDisabled} primary />
            </View>
            {offline && <Text style={t.note}>You’re offline. Showing the last days you downloaded.</Text>}
          </View>

          {!day ? (
            <Section style={{ marginTop: 22 }}>
              <Text style={t.body}>
                This part of the trail is still being written. Check back soon, and thank you for walking with us.
              </Text>
            </Section>
          ) : (
            <>
              <Section style={{ marginTop: 22 }}>
                <Label>Centering prayer</Label>
                <Text style={[styles.prayer, { color: c.ink, borderLeftColor: c.blaze }]}>{day.prayer}</Text>
              </Section>

              {!!day.reference && (
              <Section>
                <Label>Today’s reading</Label>
                <View style={[styles.reading, { backgroundColor: c.pineSoft }]}>
                  <Text style={[styles.ref, { color: c.pine }]}>{day.reference}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {TRANSLATIONS.map((tr) => (
                      <Pressable
                        key={tr.code}
                        onPress={() => setVersion(tr.code)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: version === tr.code }}
                        style={[
                          styles.chip,
                          { borderColor: c.line, backgroundColor: version === tr.code ? c.pine : c.surface },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: version === tr.code ? c.onPine : c.ink }]}>{tr.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Button
                    primary
                    title="Read on Bible Gateway ↗"
                    onPress={() => WebBrowser.openBrowserAsync(bibleGatewayUrl(day.bible_search || day.reference, version))}
                  />
                </View>
              </Section>
              )}

              <Section>
                <Label>Commentary</Label>
                <AudioPlayer path={day.audio_path} seconds={day.audio_seconds} />
                <View style={{ maxHeight: expanded || !isLong ? undefined : COLLAPSED_HEIGHT, overflow: "hidden" }}>
                  <View onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)} style={{ gap: 14 }}>
                    {paragraphs.map((p, i) => (
                      <Text key={i} style={t.body}>
                        {p}
                      </Text>
                    ))}
                  </View>
                  {isLong && !expanded && (
                    <LinearGradient colors={[c.bg + "00", c.bg]} style={styles.fade} pointerEvents="none" />
                  )}
                </View>
                {isLong && (
                  <Button
                    title={expanded ? "Show less ↑" : "Continue reading ↓"}
                    onPress={() => setExpanded(!expanded)}
                  />
                )}
              </Section>

              {day.slides?.length > 0 && (
                <Section>
                  <Label>Slides</Label>
                  <Slides paths={day.slides} contentWidth={contentWidth} />
                </Section>
              )}

              <Section>
                <Label>Small group questions</Label>
                {day.questions.map((q, i) => (
                  <View key={i} style={styles.qRow}>
                    <Text style={[styles.qNum, { color: c.blaze }]}>{i + 1}</Text>
                    <Text style={[t.body, { flex: 1 }]}>{q}</Text>
                  </View>
                ))}
              </Section>

              <Section>
                <Label>My notes</Label>
                <TextInput
                  value={note}
                  onChangeText={onNote}
                  multiline
                  placeholder="What stood out to you on the trail today?"
                  placeholderTextColor={c.muted}
                  style={[styles.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]}
                />
                <Text style={t.note}>{noteMsg}</Text>
              </Section>

              <AskTheAuthor day={current} reference={day.reference} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TrailBar({ completed }: { completed: number }) {
  const c = usePalette();
  const pct = Math.max(0.01, completed / TOTAL_DAYS);
  return (
    <View style={{ marginTop: 12, gap: 6 }}>
      <View style={[styles.bar, { backgroundColor: c.line }]}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: c.pine }]} />
      </View>
      <Label>
        {completed} / {TOTAL_DAYS} complete
      </Label>
    </View>
  );
}

function AskTheAuthor({ day, reference }: { day: number; reference: string }) {
  const c = usePalette();
  const t = useMemo(() => makeText(c), [c]);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => setState("idle"), [day]);

  const send = async () => {
    if (!question.trim()) return;
    setState("sending");
    const { error } = await supabase.from("author_questions").insert({
      day_number: day,
      question: question.trim(),
      reader_name: name.trim() || null,
      reader_email: email.trim() || null,
    });
    if (error) setState("error");
    else {
      setState("sent");
      setQuestion("");
    }
  };

  const inputStyle = [styles.field, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }];
  return (
    <Section>
      <Label>Ask the author</Label>
      <Text style={t.note}>Have a question about {reference || "today’s stop"}? Send it to the author.</Text>
      {state === "sent" ? (
        <Text style={[t.body, { color: c.pine }]}>Thank you. Your question was sent.</Text>
      ) : (
        <>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholder="Your question"
            placeholderTextColor={c.muted}
            style={[styles.input, { minHeight: 90, borderColor: c.line, backgroundColor: c.surface, color: c.ink }]}
          />
          <TextInput value={name} onChangeText={setName} placeholder="Your name (optional)" placeholderTextColor={c.muted} style={inputStyle} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email, if you’d like a reply (optional)"
            placeholderTextColor={c.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={inputStyle}
          />
          <Button
            primary
            title={state === "sending" ? "Sending…" : "Send question"}
            onPress={send}
            disabled={!question.trim() || state === "sending"}
          />
          {state === "error" && (
            <Text style={[t.note, { color: c.blaze }]}>The question didn’t send. Check your connection and try again.</Text>
          )}
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, maxWidth: 640, width: "100%", alignSelf: "center" },
  brand: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24 },
  bar: { height: 4, borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4 },
  dayNum: { fontFamily: fonts.display, fontSize: 44, lineHeight: 56 },
  of: { fontSize: 18 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  prayer: { fontFamily: fonts.bodyItalic, fontSize: 19, lineHeight: 29, borderLeftWidth: 3, paddingLeft: 14 },
  reading: { borderRadius: 14, padding: 16, gap: 12 },
  ref: { fontFamily: fonts.display, fontSize: 24 },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontFamily: fonts.uiBold, fontSize: 13 },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 90 },
  qRow: { flexDirection: "row", gap: 12 },
  qNum: { fontFamily: fonts.display, fontSize: 20, width: 18 },
  input: { minHeight: 120, borderWidth: 1, borderRadius: 12, padding: 12, fontFamily: fonts.body, fontSize: 16, textAlignVertical: "top" },
  field: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.ui, fontSize: 15 },
});
