#!/bin/sh
# Installs the app's dependencies at versions that match the current Expo SDK.
set -e
npm install expo@latest
npx expo install expo-router expo-font expo-splash-screen expo-status-bar expo-web-browser expo-audio \
  expo-linear-gradient expo-linking expo-constants react-native-svg react-native-safe-area-context \
  react-native-screens @react-native-async-storage/async-storage react-dom react-native-web @expo/metro-runtime
npm install @supabase/supabase-js @expo-google-fonts/young-serif @expo-google-fonts/literata \
  @expo-google-fonts/ibm-plex-sans-condensed
npx expo install --dev typescript @types/react
npx expo install --fix
echo "Done. Run: npx expo start"
