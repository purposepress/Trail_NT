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
    pine: "#4c4c34", // olive, the dominant color (buttons, fills)
    pineText: "#4c4c34", // olive for headings and accent text
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
    muted: "#a8968a",
    line: "#4a403a",
    pine: "#4c4c34", // olive stays the base color for buttons and fills
    pineText: "#ebded0", // olive is too dark to read as text here, so accent text is cream
    pineSoft: "#3d3d2a", // deep olive tint for the reading box and highlights
    blaze: "#c58b5c", // brown, lightened to read on dark
    onPine: "#ebded0",
    tabBar: "#3a3a28", // olive
    tabActive: "#ebded0",
    tabInactive: "#a8968a",
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
