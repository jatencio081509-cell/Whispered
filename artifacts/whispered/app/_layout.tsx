import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

// Configure push notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(userId: string | null) {
  if (!userId) return;

  try {
    // Add timeout so it doesn't hang forever
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 8000)
    );

    const tokenPromise = Notifications.getExpoPushTokenAsync();

    const tokenResult = await Promise.race([tokenPromise, timeoutPromise]);

    if (!tokenResult) {
      console.log("[Push] Push token registration timed out");
      return;
    }

    const token = tokenResult.data;
    console.log("[Push] Expo Push Token:", token);

    // Save to Supabase (non-blocking)
    savePushTokenToSupabase(token, userId);
  } catch (error) {
    console.log("[Push] Error getting push token (non-critical):", error);
  }
}

async function savePushTokenToSupabase(token: string, userId: string) {
  try {
    const { error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          push_token: token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.log("[Push] Error saving push token:", error.message);
    } else {
      console.log("[Push] Push token saved successfully");
    }
  } catch (err) {
    console.log("[Push] Failed to save push token:", err);
  }
}

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) setBaseUrl(`https://${domain}`);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const segments = useSegments();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  // Register for push notifications only after sign in (non-blocking)
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // Request notification permissions first
      (async () => {
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            console.log('[Push] Failed to get push token for push notification!');
            return;
          }
          // Fire and forget so it doesn't block the app
          registerForPushNotificationsAsync(user.id);
        } catch (error) {
          console.log('[Push] Error requesting permissions:', error);
        }
      })();
    }
  }, [isSignedIn, user?.id]);

  if (!isLoaded) return null;

  const inAuth = segments[0] === "(auth)";

  if (!isSignedIn && !inAuth) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen
          name="goals/index"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="prompts/index"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="whispers/index"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="timeline/index"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="settings/index"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack>
    </AuthGate>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={publishableKey}
          tokenCache={tokenCache}
        >
          <ClerkLoaded>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AppProvider>
                  <RootLayoutNav />
                </AppProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
