import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { audioUrl } from "../lib/config";
import { fonts, usePalette } from "../lib/theme";

const SPEEDS = [1, 1.25, 1.5, 0.75];
const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  s = Math.floor(s);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// Plays the author's recording of the day's commentary.
export default function AudioPlayer({ path, seconds }: { path: string | null; seconds: number | null }) {
  const c = usePalette();
  const player = useAudioPlayer(path ? { uri: audioUrl(path) } : null);
  const status = useAudioPlayerStatus(player);
  const [speedI, setSpeedI] = useState(0);
  const [barW, setBarW] = useState(1);

  useEffect(() => {
    // Play even when the iPhone's silent switch is on.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    setSpeedI(0);
  }, [path]);

  const duration = status.duration || seconds || 0;
  const pct = duration ? Math.min(1, status.currentTime / duration) : 0;

  if (!path) {
    return (
      <View style={[styles.box, { borderColor: c.line, backgroundColor: c.surface, opacity: 0.8 }]}>
        <View style={[styles.play, { backgroundColor: c.line }]}>
          <Text style={[styles.playIcon, { color: c.muted }]}>▶</Text>
        </View>
        <Text style={[styles.who, { color: c.muted, flex: 1 }]}>The author’s recording for this day is coming soon</Text>
      </View>
    );
  }

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (duration && status.currentTime >= duration - 0.5) player.seekTo(0);
      player.play();
    }
  };
  const seek = (x: number) => duration && player.seekTo(Math.max(0, Math.min(1, x / barW)) * duration);
  const cycleSpeed = () => {
    const next = (speedI + 1) % SPEEDS.length;
    setSpeedI(next);
    player.setPlaybackRate(SPEEDS[next]);
  };

  return (
    <View style={[styles.box, { borderColor: c.line, backgroundColor: c.surface }]}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? "Pause commentary" : "Play commentary"}
        style={[styles.play, { backgroundColor: c.pine }]}
      >
        <Text style={[styles.playIcon, { color: c.onPine }]}>{status.playing ? "❚❚" : "▶"}</Text>
      </Pressable>
      <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
        <Text style={[styles.who, { color: c.muted }]} numberOfLines={1}>
          Listen to the author read today’s commentary
        </Text>
        <Pressable
          onLayout={(e: LayoutChangeEvent) => setBarW(e.nativeEvent.layout.width)}
          onPress={(e) => seek(e.nativeEvent.locationX)}
          accessibilityRole="adjustable"
          accessibilityLabel="Playback position"
          accessibilityValue={{ text: `${fmt(status.currentTime)} of ${fmt(duration)}` }}
          hitSlop={10}
          style={[styles.track, { backgroundColor: c.line }]}
        >
          <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: c.pine }]} />
        </Pressable>
        <View style={styles.times}>
          <Text style={[styles.time, { color: c.muted }]}>{fmt(status.currentTime)}</Text>
          <Pressable onPress={() => player.seekTo(Math.max(0, status.currentTime - 15))} accessibilityLabel="Back 15 seconds">
            <Text style={[styles.time, { color: c.pine }]}>↺ 15s</Text>
          </Pressable>
          <Text style={[styles.time, { color: c.muted }]}>{fmt(duration)}</Text>
        </View>
      </View>
      <Pressable
        onPress={cycleSpeed}
        accessibilityLabel={`Playback speed ${SPEEDS[speedI]}x`}
        style={[styles.speed, { borderColor: c.line }]}
      >
        <Text style={[styles.time, { color: c.ink }]}>{SPEEDS[speedI]}×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  play: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  playIcon: { fontSize: 16 },
  who: { fontFamily: fonts.ui, fontSize: 13 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6 },
  times: { flexDirection: "row", justifyContent: "space-between" },
  time: { fontFamily: fonts.uiBold, fontSize: 12, fontVariant: ["tabular-nums"] },
  speed: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
});
