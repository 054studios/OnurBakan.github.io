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
import { useGroups } from '../../hooks/useGroups';
import { GroupRow } from '../../components/chat/GroupRow';
import { SkeletonGroupList } from '../../components/chat/SkeletonGroupRow';
import type { ChatGroup } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

function ScreenHeader() {
  const { t } = useTranslation('chat');
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('title')}</Text>
    </View>
  );
}

function EmptyState() {
  const { t } = useTranslation('chat');
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyText}>{t('groups.empty')}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { groups, loading } = useGroups();

  const renderItem: ListRenderItem<ChatGroup> = ({ item }) => (
    <GroupRow
      group={item}
      onPress={() => router.push(`/chat/${item.id}`)}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScreenHeader />

      {loading ? (
        <SkeletonGroupList count={4} />
      ) : (
        <FlatList
          data={groups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={groups.length === 0 ? styles.emptyContainer : undefined}
          showsVerticalScrollIndicator={false}
          style={styles.list}
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
  list: {
    backgroundColor: Colors.bg,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
  },
});
