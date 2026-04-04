import { useEffect, useRef } from 'react';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  AudioProfileType,
  AudioScenarioType,
  type IRtcEngine,
} from 'react-native-agora';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useVoiceStore } from '../store/voiceStore';
import { useTripStore } from '../store/tripStore';
import { AGORA_APP_ID } from '../constants/voice';

const SPEAKING_VOLUME_THRESHOLD = 40;

/**
 * Initialises an Agora RTC engine, joins `channelId`, wires all event
 * handlers into voiceStore, and tears everything down on unmount.
 *
 * The local mic starts muted. Call engine.muteLocalAudioStream(false)
 * externally (via the ref) only while the PTT button is held.
 */
export function useAgoraEngine(channelId: string) {
  const engineRef = useRef<IRtcEngine | null>(null);
  const { user } = useAuthStore();
  const { currentIndex } = useTripStore();
  const {
    setLocalAgoraUid,
    addParticipant,
    removeParticipantByAgoraUid,
    setActiveSpeakerUid,
    setIsJoined,
    reset,
  } = useVoiceStore();

  useEffect(() => {
    if (!AGORA_APP_ID) {
      console.warn('[Agora] EXPO_PUBLIC_AGORA_APP_ID is not set.');
    }

    // ─ Create engine ────────────────────────────────────────────────────────
    const engine = createAgoraRtcEngine();
    engineRef.current = engine;

    engine.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });

    engine.enableAudio();
    engine.setAudioProfile(
      AudioProfileType.AudioProfileDefault,
      AudioScenarioType.AudioScenarioChatroom,
    );

    // Enable volume indication every 200 ms so we can detect active speaker
    engine.enableAudioVolumeIndication(200, 3, true);

    // ─ Event listeners ──────────────────────────────────────────────────────

    engine.addListener('onJoinChannelSuccess', (_conn, elapsed) => {
      console.log('[Agora] joined', channelId, 'elapsed:', elapsed);
      setIsJoined(true);

      // Record ourselves in Firestore presence
      if (user) {
        firestore()
          .collection('voiceRooms')
          .doc(channelId)
          .collection('participants')
          .doc(user.uid)
          .set({
            name: user.displayName ?? user.email ?? 'Kullanıcı',
            countryIndex: currentIndex,
            joinedAt: firestore.Timestamp.now(),
          });
      }
    });

    engine.addListener('onLocalUserRegistered', (uid, _userAccount) => {
      setLocalAgoraUid(uid);
    });

    engine.addListener('onUserJoined', (_conn, remoteUid) => {
      // Remote participant joined — we add a placeholder; Firestore presence
      // provides the rich profile data (name, location).
      addParticipant({
        uid: String(remoteUid),
        agoraUid: remoteUid,
        name: `Kullanıcı #${remoteUid}`,
        countryIndex: 0,
      });
    });

    engine.addListener('onUserOffline', (_conn, remoteUid) => {
      removeParticipantByAgoraUid(remoteUid);
    });

    engine.addListener('onAudioVolumeIndication', (_conn, speakers, _speakerNumber) => {
      const loudest = speakers
        .filter((s) => (s.volume ?? 0) > SPEAKING_VOLUME_THRESHOLD)
        .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))[0];
      setActiveSpeakerUid(loudest?.uid ?? null);
    });

    engine.addListener('onError', (err) => {
      console.warn('[Agora] error:', err);
    });

    // ─ Join channel ─────────────────────────────────────────────────────────
    // Join as Broadcaster so we can transmit audio on PTT; mic is muted
    // immediately after joining until the user holds the PTT button.
    engine.joinChannel(
      '', // token — empty string for apps in testing mode
      channelId,
      0,  // uid 0 = Agora auto-assigns
      {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: false, // start silent
        autoSubscribeAudio: true,
      },
    );

    // Mute local mic immediately (belt-and-suspenders)
    engine.muteLocalAudioStream(true);

    // ─ Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      engine.muteLocalAudioStream(true);
      engine.leaveChannel();
      engine.removeAllListeners();
      engine.release();
      engineRef.current = null;
      reset();

      // Remove Firestore presence
      if (user) {
        firestore()
          .collection('voiceRooms')
          .doc(channelId)
          .collection('participants')
          .doc(user.uid)
          .delete()
          .catch(() => {});
      }
    };
  }, [channelId]);

  return engineRef;
}
