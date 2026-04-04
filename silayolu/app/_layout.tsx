import '../store/i18n';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';
import auth from '@react-native-firebase/auth';
import { Colors } from '../constants/colors';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { useBorderAlertNotifications } from '../hooks/usePushNotifications';

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isGuest, setUser } = useAuthStore();
  const loadProgress = useProgressStore((s) => s.loadProgress);

  useBorderAlertNotifications(user?.uid ?? null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        loadProgress(
          firebaseUser.uid,
          firebaseUser.displayName ?? firebaseUser.email ?? 'Kullanıcı',
        );
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const isAuthed = user !== null || isGuest;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthed && !inAuth) {
      router.replace('/(auth)/splash');
    } else if (isAuthed && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, isGuest, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BarlowCondensed_400Regular,
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[groupId]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="voice/[channelId]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="challenges/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="challenges/badges"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="challenges/leaderboard"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}
