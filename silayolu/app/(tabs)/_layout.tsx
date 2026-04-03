import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

export default function TabsLayout() {
  const { t } = useTranslation('tabs');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.displayMedium,
          fontSize: FontSize.xs,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="borders"
        options={{
          title: t('borders'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="borders" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: t('challenges'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="challenges" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="chat" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t('news'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="news" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Placeholder icon component — swap in a real icon library (e.g. @expo/vector-icons)
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const { View, Text } = require('react-native');
  const icons: Record<string, string> = {
    home: '⌂',
    borders: '⊞',
    challenges: '★',
    chat: '✉',
    news: '◈',
  };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Text style={{ color, fontSize: size * 0.75 }}>{icons[name] ?? '•'}</Text>
    </View>
  );
}
