import "../global.css";

import { AuthProvider } from "@/components/AuthContext";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) return null;
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="flex-1">
        <AuthProvider>
          <Stack>
            <Stack.Screen name="login/index" options={{ headerShown: false }} />
            <Stack.Screen
              name="(authenticated)"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="forgot-password/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="onboarding/index"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaView>
    </QueryClientProvider>
  );
}
