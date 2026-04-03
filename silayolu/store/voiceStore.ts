import { create } from 'zustand';

export interface VoiceParticipant {
  uid: string;        // Firebase/auth UID
  agoraUid: number;  // Agora numeric UID
  name: string;
  countryIndex: number; // index into ROUTE_COUNTRIES
}

interface VoiceState {
  /** Current channel we're in (null = not in any channel) */
  channelId: string | null;
  /** Agora UID assigned on join */
  localAgoraUid: number | null;
  /** Everyone in the current room (including self) */
  participants: VoiceParticipant[];
  /** Agora UID of the person currently speaking (null = silence) */
  activeSpeakerUid: number | null;
  /** True while the PTT button is held down */
  isSpeaking: boolean;
  /** Whether the Agora engine has successfully joined */
  isJoined: boolean;

  // ─ Actions ────────────────────────────────────────────────────────────────
  setChannelId: (id: string | null) => void;
  setLocalAgoraUid: (uid: number) => void;
  addParticipant: (p: VoiceParticipant) => void;
  removeParticipantByAgoraUid: (agoraUid: number) => void;
  setActiveSpeakerUid: (uid: number | null) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setIsJoined: (joined: boolean) => void;
  reset: () => void;
}

const INITIAL: Pick<
  VoiceState,
  'channelId' | 'localAgoraUid' | 'participants' | 'activeSpeakerUid' | 'isSpeaking' | 'isJoined'
> = {
  channelId: null,
  localAgoraUid: null,
  participants: [],
  activeSpeakerUid: null,
  isSpeaking: false,
  isJoined: false,
};

export const useVoiceStore = create<VoiceState>((set) => ({
  ...INITIAL,

  setChannelId: (channelId) => set({ channelId }),
  setLocalAgoraUid: (localAgoraUid) => set({ localAgoraUid }),

  addParticipant: (p) =>
    set((s) => ({
      participants: s.participants.some((x) => x.agoraUid === p.agoraUid)
        ? s.participants
        : [...s.participants, p],
    })),

  removeParticipantByAgoraUid: (agoraUid) =>
    set((s) => ({
      participants: s.participants.filter((x) => x.agoraUid !== agoraUid),
    })),

  setActiveSpeakerUid: (activeSpeakerUid) => set({ activeSpeakerUid }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsJoined: (isJoined) => set({ isJoined }),
  reset: () => set(INITIAL),
}));
