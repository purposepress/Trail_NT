import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { slideUrl } from "../lib/config";
import { allowRotation, lockPortraitOnPhones } from "../lib/orientation";
import { fonts, usePalette } from "../lib/theme";

const RATIO = 9 / 16;

// A swipeable strip of the day's slides. Tap one to open it full screen.
export default function Slides({ paths, contentWidth }: { paths: string[]; contentWidth: number }) {
  const c = usePalette();
  const [open, setOpen] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const urls = paths.map(slideUrl);

  // Save the day's slides to the phone so they're there offline.
  useEffect(() => {
    if (urls.length) Image.prefetch(urls).catch(() => {});
    setPage(0);
  }, [paths.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const single = urls.length === 1;
  const cardW = single ? contentWidth : Math.round(contentWidth * 0.86);
  const gap = 10;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + gap)));

  return (
    <View style={{ gap: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + gap}
        decelerationRate="fast"
        scrollEnabled={!single}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ gap }}
      >
        {urls.map((u, i) => (
          <Pressable
            key={u}
            onPress={() => setOpen(i)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Slide ${i + 1} of ${urls.length}. Opens full screen.`}
            style={[styles.card, { width: cardW, height: cardW * RATIO, borderColor: c.line }]}
          >
            <Image source={{ uri: u }} style={StyleSheet.absoluteFill} contentFit="contain" transition={150} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.meta}>
        {!single && (
          <View style={styles.dots}>
            {urls.map((u, i) => (
              <View key={u} style={[styles.dot, { backgroundColor: i === page ? c.pine : c.line }]} />
            ))}
          </View>
        )}
        <Text style={[styles.hint, { color: c.muted }]}>Tap a slide for full screen</Text>
      </View>
      <SlideViewer urls={urls} start={open} onClose={() => setOpen(null)} />
    </View>
  );
}

// Full-screen viewer: swipe between slides, turn the phone sideways for a bigger view,
// pinch to zoom (iPhone). Works well with screen mirroring to a TV for small groups.
function SlideViewer({ urls, start, onClose }: { urls: string[]; start: number | null; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<string>>(null);
  const [index, setIndex] = useState(0);
  const visible = start !== null;

  useEffect(() => {
    if (start !== null) {
      setIndex(start);
      allowRotation();
    } else {
      lockPortraitOnPhones();
    }
  }, [visible, start]);

  // Keep the same slide in view when the phone rotates.
  useEffect(() => {
    if (visible) requestAnimationFrame(() => list.current?.scrollToIndex({ index, animated: false }));
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    lockPortraitOnPhones();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={close}
      supportedOrientations={["portrait", "landscape-left", "landscape-right"]}
      statusBarTranslucent
    >
      <StatusBar style="light" hidden={width > height} />
      <View style={styles.viewer}>
        {visible && (
          <FlatList
            ref={list}
            data={urls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={start ?? 0}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            keyExtractor={(u) => u}
            extraData={width}
            renderItem={({ item, index: i }) => (
              <ScrollView
                style={{ width, height }}
                contentContainerStyle={{ width, height, alignItems: "center", justifyContent: "center" }}
                maximumZoomScale={4}
                minimumZoomScale={1}
                bouncesZoom
                centerContent
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{ uri: item }}
                  style={{ width, height: height - insets.top - insets.bottom }}
                  contentFit="contain"
                  accessibilityLabel={`Slide ${i + 1} of ${urls.length}`}
                />
              </ScrollView>
            )}
          />
        )}
        <View style={[styles.bar, { top: insets.top + 8, left: insets.left + 12, right: insets.right + 12 }]} pointerEvents="box-none">
          <Text style={styles.count}>
            {index + 1} / {urls.length}
          </Text>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close slides" hitSlop={12} style={styles.close}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>
        {width < height && (
          <Text style={[styles.tip, { bottom: insets.bottom + 18 }]}>
            Turn your phone sideways for a larger view{Platform.OS === "ios" ? " · pinch to zoom" : ""}
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden", backgroundColor: "#000" },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  hint: { fontFamily: fonts.ui, fontSize: 13 },
  viewer: { flex: 1, backgroundColor: "#000" },
  bar: { position: "absolute", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  count: { fontFamily: fonts.uiBold, fontSize: 14, color: "#f3f1ec", fontVariant: ["tabular-nums"] },
  close: { backgroundColor: "rgba(243,241,236,0.16)", borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 },
  closeText: { fontFamily: fonts.uiBold, fontSize: 15, color: "#f3f1ec" },
  tip: { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: fonts.ui, fontSize: 13, color: "rgba(243,241,236,0.7)" },
});
