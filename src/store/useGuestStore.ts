import { create } from 'zustand';
import { getGuestId } from '../api/client';

interface GuestState {
  guestId: string;
  initGuest: () => string;
}

export const useGuestStore = create<GuestState>()((set, get) => ({
  guestId: getGuestId(),

  initGuest: () => {
    const existing = get().guestId;
    if (existing) return existing;
    const newGuestId = getGuestId();
    set({ guestId: newGuestId });
    return newGuestId;
  },
}));
