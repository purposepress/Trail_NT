import React from "react";
import { Pressable, StyleSheet, Text, TextProps, View, ViewProps } from "react-native";
import { fonts, Palette, usePalette } from "../lib/theme";

export function Label({ children, style, ...rest }: TextProps) {
  const c = usePalette();
  return (
    <Text {...rest} style={[styles.label, { color: c.muted }, style]}>
      {children}
    </Text>
  );
}

export function Section({ children, style, ...rest }: ViewProps) {
  const c = usePalette();
  return (
    <View {...rest} style={[styles.section, { borderTopColor: c.line }, style]}>
      {children}
    </View>
  );
}

type BtnProps = {
  title: string;
  onPress?: () => void;
  primary?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  small?: boolean;
};

export function Button({ title, onPress, primary, disabled, accessibilityLabel, small }: BtnProps) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        {
          backgroundColor: primary ? c.pine : c.surface,
          borderColor: primary ? c.pine : c.line,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.btnText, small && { fontSize: 13 }, { color: primary ? c.onPine : c.ink }]}>{title}</Text>
    </Pressable>
  );
}

export const makeText = (c: Palette) =>
  StyleSheet.create({
    body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 27, color: c.ink },
    note: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 20, color: c.muted },
    h2: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: c.ink },
    h3: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: c.ink },
  });

const styles = StyleSheet.create({
  label: { fontFamily: fonts.uiBold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" },
  section: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 22, gap: 12 },
  btn: { borderWidth: 1, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, alignSelf: "flex-start" },
  btnSmall: { paddingVertical: 7, paddingHorizontal: 12 },
  btnText: { fontFamily: fonts.uiBold, fontSize: 15, letterSpacing: 0.3 },
});
