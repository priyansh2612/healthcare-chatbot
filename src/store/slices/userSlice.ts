import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "date-fns";

// Interfaces
interface Message {
  id: number;
  content: string;
  sender: "user" | "bot";
  type: "text" | "image" | "questionnaire" | "multiQuestionnaire";
  timestamp: Date;
  image?: string;
  question?: string;
  options?: string[];
  questionnaireType?: "single" | "multiple";
  submitted?: boolean;
}

interface Session {
  id: number;
  name: string;
  createdAt: string;
}

interface CurrentSession {
  id: number;
  name: string;
  messages: Message[];
  createdAt: string;
}

interface MedicalRecord {
  id: string;
  name: string;
  url: string;
  date: string;
}

interface UserState {
  profileURL: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
  bio: string | null;
  diet: string | null;
  weight: string | null;
  height: string | null;
  birthdate: string | null;
  gender: string | null;
  activityLevel: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyContact: string | null;
  isAuthenticated: boolean;
  medicalRecords: MedicalRecord[];
  sessions: Session[];
  currentSession: CurrentSession;
  token: string | null;
}

// Initial state
const initialState: UserState = {
  profileURL: null,
  username: null,
  email: null,
  password: null,
  bio: null,
  diet: null,
  weight: null,
  height: null,
  birthdate: null,
  gender: null,
  activityLevel: null,
  bloodType: null,
  allergies: null,
  medications: null,
  emergencyContact: null,
  isAuthenticated: false,
  medicalRecords: [],
  sessions: [],
  currentSession: {
    id: -1,
    name: "",
    messages: [],
    createdAt: String(new Date()),
  },
  token: "",
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },

    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload, isAuthenticated: true };
    },

    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },

    clearUser: () => {
      return { ...initialState };
    },

    addMedicalRecord: (state, action: PayloadAction<MedicalRecord>) => {
      if (!state.medicalRecords) state.medicalRecords = [];
      state.medicalRecords.push(action.payload);
    },

    removeMedicalRecord: (state, action: PayloadAction<string>) => {
      state.medicalRecords = state.medicalRecords.filter(
        (record) => record.id !== action.payload
      );
    },

    setSession: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload;
    },

    addSession: (state, action: PayloadAction<Session>) => {
      state.sessions.push(action.payload);
    },

    updateSession: (
      state,
      action: PayloadAction<{ sessionId: number; updates: Partial<Session> }>
    ) => {
      const index = state.sessions.findIndex(
        (session) => session.id === action.payload.sessionId
      );
      if (index !== -1) {
        state.sessions[index] = {
          ...state.sessions[index],
          ...action.payload.updates,
        };
      }
    },

    updateCurrentSession: (state, action: PayloadAction<CurrentSession>) => {
      state.currentSession = action.payload;
    },

    addMessage: (
      state,
      action: PayloadAction<{ sessionId: number; message: Message }>
    ) => {
      const currentSession = state.currentSession;
      if (currentSession.id === action.payload.sessionId) {
        currentSession.messages.push(action.payload.message);
      }
    },
  },
});

// Export actions and reducer
export const {
  setSession,
  setUser,
  updateUser,
  clearUser,
  addMedicalRecord,
  removeMedicalRecord,
  addSession,
  updateSession,
  addMessage,
  updateCurrentSession,
} = userSlice.actions;

export default userSlice.reducer;
