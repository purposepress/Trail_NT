import { useColorScheme } from "react-native";

// Purpose Press palette: olive #4c4c34 (dominant), cream #ebded0, dark brown #423934,
// tan #c6ac90, brown #7b4c2b. Token names are kept from the first design:
// "pine" is the primary (olive) color and "blaze" is the accent (brown/tan).
export const palettes = {
  light: {
    bg: "#ebded0", // cream
    surface: "#f6efe7", // lighter cream for cards and inputs
    ink: "#423934", // dark brown
    muted: "#6b5d52",
    line: "#d6c6b2",
    pine: "#4c4c34", // olive, the dominant color
    pineSoft: "#dcd8c4", // olive tint on cream
    blaze: "#7b4c2b", // brown accent
    onPine: "#f6efe7",
    tabBar: "#4c4c34",
    tabActive: "#ebded0",
    tabInactive: "#c6ac90",
  },
  dark: {
    bg: "#26211e",
    surface: "#332c28",
    ink: "#ebded0",
    muted: "#c6ac90",
    line: "#4a403a",
    pine: "#b4b08a", // olive, lightened to read on dark
    pineSoft: "#3a3a2c",
    blaze: "#c6ac90", // tan accent
    onPine: "#26211e",
    tabBar: "#3a3a28",
    tabActive: "#ebded0",
    tabInactive: "#a8957e",
  },
};

export type Palette = typeof palettes.light;

// The title screen keeps the olive in both themes.
export const splash = {
  bg: "#4c4c34",
  bgDark: "#3a3a28",
  ink: "#ebded0",
  inkDark: "#423934", // text on cream buttons
  soft: "#e2d5c6",
  sub: "#d8c6b0",
  gold: "#c6ac90", // summit marker (tan)
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
