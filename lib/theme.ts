import { useColorScheme } from "react-native";

export const palettes = {
  light: {
    bg: "#f3f1ec",
    surface: "#fbfaf7",
    ink: "#1f2a24",
    muted: "#5d6a62",
    line: "#d9d6cc",
    pine: "#2f5a45",
    pineSoft: "#dfe9e2",
    blaze: "#c98a1b",
    onPine: "#f3f1ec",
  },
  dark: {
    bg: "#141a17",
    surface: "#1b2420",
    ink: "#e6ebe7",
    muted: "#9aa89f",
    line: "#2e3a34",
    pine: "#7fb79a",
    pineSoft: "#22322a",
    blaze: "#e3a63f",
    onPine: "#141a17",
  },
};

export type Palette = typeof palettes.light;

// The title screen keeps the same deep green in both themes.
export const splash = {
  bg: "#2f5a45",
  bgDark: "#1d3a2c",
  ink: "#f3f1ec",
  soft: "#dfe9e2",
  sub: "#b9cfc1",
  gold: "#e3a63f",
};

export const fonts = {
  display: "YoungSerif_400Regular",
  body: "Literata_400Regular",
  bodyItalic: "Literata_400Regular_Italic",
  bodyBold: "Literata_600SemiBold",
  ui: "IBMPlexSansCondensed_500Medium",
  uiBold: "IBMPlexSansCondensed_600SemiBold",
};

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? palettes.dark : palettes.light;
}
