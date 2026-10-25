import * as ScreenOrientation from "expo-screen-orientation";
import { Dimensions } from "react-native";

// Phones stay upright; tablets can rotate freely.
// The full-screen slide viewer unlocks rotation so a slide can fill a sideways phone or a TV.
const isPhone = () => {
  const { width, height } = Dimensions.get("screen");
  return Math.min(width, height) < 600;
};

export function lockPortraitOnPhones() {
  if (isPhone()) ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
}

export function allowRotation() {
  ScreenOrientation.unlockAsync().catch(() => {});
}
