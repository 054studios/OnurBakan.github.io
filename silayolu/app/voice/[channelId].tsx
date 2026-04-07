import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  Platform,
  Animated,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAgoraEngine } from '../../hooks/useAgoraEngine';
import { useVoiceParticipants } from '../../hooks/useVoiceParticipants';
import { useVoiceStore, type VoiceParticipant } from '../../store/voiceStore';
import { useAuthStore } from '../../store/authStore';
import { Waveform } from '../../components/voice/Waveform';
import { ListenerRow } from '../../components/voice/ListenerRow';
import { VOICE_CHANNELS } from '../../constants/voice';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import * as Haptics from 'expo-haptics';

// ─── PTT Button ───────────────────────────────────────────────────────────────

interface PTTButtonProps {
  isSpeaking: boolean;
  isJoined: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  holdLabel: string;
  speakingLabel: string;
}

function PTTButton({ isSpeaking, isJoined, onPressIn, onPressOut, holdLabel, speakingLabel }: PTTButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isSpeaking ? 0.92 : 1,
        useNativeDriver: true,
        tension: 180,
        friction: 8,
      }),
      Animated.timing(glow, {
        toValue: isSpeaking ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isSpeaking]);

  const shadowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.accent],
  });

  return (
    <View style={ptt.wrap}>
      <Animated.View
        style={[
          ptt.outerRing,
          { borderColor: shadowColor, transform: [{ scale }] },
        ]}
      >
        <Pressable
          style={[ptt.btn, isSpeaking && ptt.btnActive]}
          onPressIn={isJoined ? onPressIn : undefined}
          onPressOut={isJoined ? onPressOut : undefined}
          disabled={!isJoined}
        >
          <Text style={ptt.micIcon}>{isSpeaking ? '🎙' : '🎤'}</Text>
          <Text style={[ptt.label, isSpeaking && ptt.labelActive]}>
            {isSpeaking ? speakingLabel : holdLabel}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const ptt = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  outerRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  micIcon: { fontSize: 32 },
  label: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  labelActive: { color: Colors.surface },
});

// ─── Speaking banner ──────────────────────────────────────────────────────────

function SpeakingBanner({
  speakerName,
  label,
}: {
  speakerName: string | null;
  label: string;
}) {
  if (!speakerName) return null;
  return (
    <View style={banner.wrap}>
      <Text style={banner.dot}>●</Text>
      <Text style={banner.text}>{label} </Text>
      <Text style={banner.name}>{speakerName}</Text>
    </View>
  );
}

const banner = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(196,57,10,0.10)',
    borderRadius: 20,
    alignSelf: 'center',
    gap: 4,
  },
  dot: { color: Colors.accent, fontSize: 8 },
  text: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  name: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VoiceRoomScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const { t } = useTranslation('voice');
  const router = useRouter();
  const { user } = useAuthStore();

  const engineRef = useAgoraEngine(channelId ?? '');
  const participants = useVoiceParticipants(channelId ?? '');

  const {
    isJoined,
    isSpeaking,
    activeSpeakerUid,
    localAgoraUid,
    setIsSpeaking,
  } = useVoiceStore();

  const channel = VOICE_CHANNELS.find((c) => c.id === channelId);

  // ─ Derive active speaker name ────────────────────────────────────────────
  const activeSpeaker = participants.find((p) => p.agoraUid === activeSpeakerUid);
  // Also check if local user is speaking (uid === 0 from Agora or matches local)
  const isSomeoneOtherSpeaking = !!activeSpeaker && activeSpeaker.uid !== user?.uid;
  const isSomeoneSpeaking = isSpeaking || isSomeoneOtherSpeaking;

  const speakerName = isSpeaking
    ? t('you')
    : activeSpeaker?.name ?? null;

  // ─ PTT handlers ─────────────────────────────────────────────────────────
  const handlePressIn = () => {
    engineRef.current?.muteLocalAudioStream(false);
    setIsSpeaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    engineRef.current?.muteLocalAudioStream(true);
    setIsSpeaking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderParticipant: ListRenderItem<VoiceParticipant> = ({ item }) => (
    <ListenerRow
      participant={item}
      isSpeaking={item.agoraUid === activeSpeakerUid || (isSpeaking && item.uid === user?.uid)}
      isLocal={item.uid === user?.uid}
      localLabel={t('you')}
    />
  );

  return (
    <View style={styles.screen}>
      {/* ── Custom header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{channel?.emoji ?? '🎙'}</Text>
          <Text style={styles.headerName} numberOfLines={1}>
            {channel?.name ?? channelId}
          </Text>
        </View>

        <View style={styles.backBtn} />
      </View>

      {/* ── Stage ──────────────────────────────────────────────────────── */}
      <View style={styles.stage}>
        {/* Connection status */}
        {!isJoined && (
          <View style={styles.connectingRow}>
            <ActivityIndicator color={Colors.accent} size="small" />
            <Text style={styles.connectingText}>{t('joining')}</Text>
          </View>
        )}

        {/* Waveform */}
        <Waveform
          active={isSomeoneSpeaking}
          color={isSpeaking ? Colors.accent2 : Colors.accent}
        />

        {/* Speaking banner */}
        <SpeakingBanner speakerName={speakerName} label={t('speakingNow')} />

        {/* PTT button */}
        <PTTButton
          isSpeaking={isSpeaking}
          isJoined={isJoined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          holdLabel={t('holdToSpeak')}
          speakingLabel={t('speaking')}
        />

        <Text style={styles.routeHint}>{channel?.route}</Text>
      </View>

      {/* ── Listener list ──────────────────────────────────────────────── */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>
          {t('participants')} ({participants.length})
        </Text>
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.uid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('empty')}</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backIcon: {
    fontSize: 22,
    color: Colors.ink,
    fontFamily: FontFamily.bodyBold,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerEmoji: { fontSize: 22 },
  headerName: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Stage (PTT area)
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    gap: 18,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectingText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  routeHint: {
    fontFamily: FontFamily.displayMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
    letterSpacing: 1.5,
  },

  // Listener list
  listSection: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emptyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
    paddingTop: 32,
  },
});
