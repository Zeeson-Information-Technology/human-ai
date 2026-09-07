"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ChatFlowStatus = "idle" | "sending" | "error";

type InterviewStore = {
  sessionId?: string;
  token?: string;
  isConnected: boolean;
  isSharing: boolean;
  shareSurface: string;
  chatStatus: ChatFlowStatus;
  chatError: string | null;
  pendingAnswer: string | null;
  lastAssistant: string | null;
  lastUser: string | null;
  timerStartedAt: number | null;
  setSessionContext: (sessionId: string, token: string) => void;
  setConnected: (connected: boolean) => void;
  setSharing: (sharing: boolean) => void;
  setShareSurface: (surface: string) => void;
  setChatStatus: (status: ChatFlowStatus) => void;
  setChatError: (err: string | null) => void;
  setPendingAnswer: (answer: string | null) => void;
  setLastAssistant: (text: string | null) => void;
  setLastUser: (text: string | null) => void;
  setTimerStartedAt: (ms: number | null) => void;
  resetTransient: () => void;
};

const initialState = {
  sessionId: undefined as string | undefined,
  token: undefined as string | undefined,
  isConnected: false,
  isSharing: false,
  shareSurface: "unknown",
  chatStatus: "idle" as ChatFlowStatus,
  chatError: null,
  pendingAnswer: null,
  lastAssistant: null,
  lastUser: null,
  timerStartedAt: null,
};

const useInterviewStore = create<InterviewStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSessionContext: (sessionId, token) => set(() => ({ sessionId, token })),
      setConnected: (connected) => set(() => ({ isConnected: connected })),
      setSharing: (sharing) => set(() => ({ isSharing: sharing })),
      setShareSurface: (surface) => set(() => ({ shareSurface: surface })),
      setChatStatus: (status) => set(() => ({ chatStatus: status })),
      setChatError: (err) => set(() => ({ chatError: err })),
      setPendingAnswer: (answer) => set(() => ({ pendingAnswer: answer })),
      setLastAssistant: (text) => set(() => ({ lastAssistant: text })),
      setLastUser: (text) => set(() => ({ lastUser: text })),
      setTimerStartedAt: (ms) => set(() => ({ timerStartedAt: ms })),
      resetTransient: () =>
        set((state) => ({
          ...state,
          sessionId: undefined,
          token: undefined,
          isConnected: false,
          isSharing: false,
          shareSurface: "unknown",
          chatStatus: "idle",
          chatError: null,
          pendingAnswer: null,
        })),
    }),
    {
      name: "zuri_interview_store",
      // Provide a no-op storage on the server to avoid crashes during SSR/HMR.
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      // Persist only the bits that help resume gracefully; keep tokens transient.
      partialize: (state) => ({
        lastAssistant: state.lastAssistant,
        lastUser: state.lastUser,
        timerStartedAt: state.timerStartedAt,
      }),
    }
  )
);

export default useInterviewStore;
