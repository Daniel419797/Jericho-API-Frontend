"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@/types/auth';

type UserState = {
  user: User | null;
  setUser: (u: User | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  devtools((set) => ({
    user: null,
    setUser: (u: User | null) => set({ user: u }),
    clearUser: () => set({ user: null }),
  }))
);

export default useUserStore;
