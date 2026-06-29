import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/AppContext';
import { RootLayoutNav } from './RootLayoutNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.\n' +
    'Please create a .env or .env.local file in the artifacts/whispered folder and add:\n' +
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key'
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.log('SplashScreen.hideAsync error:', e);
      }
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
