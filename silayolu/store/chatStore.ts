import { create } from 'zustand';

interface ChatState {
  /**
   * Client-side last-read timestamp per groupId.
   * A message is "unread" if its createdAt > lastReadAt[groupId].
   */
  lastReadAt: Record<string, Date>;
  markRead: (groupId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  lastReadAt: {},
  markRead: (groupId) =>
    set((state) => ({
      lastReadAt: { ...state.lastReadAt, [groupId]: new Date() },
    })),
}));
