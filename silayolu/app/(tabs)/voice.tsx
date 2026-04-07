import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { VOICE_CHANNELS, type VoiceChannel } from '../../constants/voice';
import { useVoiceChannels, type ChannelPresence } from '../../hooks/useVoiceChannels';
import { ChannelCard } from '../../components/voice/ChannelCard';
import { SkeletonChannelList } from '../../components/voice/SkeletonChannelCard';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

function ScreenHeader() {
  const { t } = useTranslation('voice');
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('title')}</Text>
      <Text style={styles.headerSub}>🎙 Push-to-talk</Text>
    </View>
  );
}

type ListItem = { channel: VoiceChannel; presence: ChannelPresence };

export default function VoiceScreen() {
  const router = useRouter();
  const { presence, loading } = useVoiceChannels();

  const data: ListItem[] = VOICE_CHANNELS.map((channel) => ({
    channel,
    presence: presence.find((p) => p.channelId === channel.id) ?? {
      channelId: channel.id,
      listenerCount: 0,
      activeNames: [],
    },
  }));

  const renderItem: ListRenderItem<ListItem> = ({ item }) => (
    <ChannelCard
      channel={item.channel}
      presence={item.presence}
      onPress={() => router.push(`/voice/${item.channel.id}`)}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScreenHeader />
      {loading ? (
        <SkeletonChannelList count={VOICE_CHANNELS.length} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.channel.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerSub: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  list: { paddingTop: 14, paddingBottom: 24 },
});
