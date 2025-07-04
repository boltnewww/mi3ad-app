import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold
} from '@expo-google-fonts/cairo';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { I18nProvider } from '@/context/I18nContext';
import { EventProvider } from '@/context/EventContext';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import { ThemeProvider } from '@/context/ThemeContext';
import SplashScreenComponent from '@/components/SplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Cairo-Regular': Cairo_400Regular,
    'Cairo-SemiBold': Cairo_600SemiBold,
    'Cairo-Bold': Cairo_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <EventProvider>
            <ChatProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="booking/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="ticket/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen name="school/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              {showSplash && <SplashScreenComponent onAnimationComplete={handleSplashComplete} />}
            </ChatProvider>
          </EventProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}