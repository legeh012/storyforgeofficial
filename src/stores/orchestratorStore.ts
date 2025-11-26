import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  capabilities?: string[];
  files?: Array<{ name: string; type: string; url: string }>;
}

interface OrchestratorState {
  // Session state
  sessionId: string;
  isActive: boolean;
  isLoading: boolean;
  
  // Messages
  messages: Message[];
  
  // File uploads
  uploadedFiles: Array<{ name: string; type: string; url: string }>;
  
  // Actions
  setIsActive: (active: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addMessage: (message: Message) => void;
  addUploadedFile: (file: { name: string; type: string; url: string }) => void;
  removeUploadedFile: (index: number) => void;
  clearUploadedFiles: () => void;
  resetSession: () => void;
}

export const useOrchestratorStore = create<OrchestratorState>()(
  immer((set) => ({
    // Initial state
    sessionId: crypto.randomUUID(),
    isActive: (() => {
      const saved = localStorage.getItem('mayza-active-state');
      return saved !== null ? saved === 'true' : true;
    })(),
    isLoading: false,
    messages: [
      {
        role: 'assistant',
        content: "Hey! I'm Mayza - your singular AI assistant with all capabilities built-in. I'm not a collection of bots, I'm ONE intelligence that handles everything: development, video production, automation, content creation, school work, planning, and anything else you need. I remember our entire conversation and adapt to how you work. What can I help you with?",
        capabilities: ['Unified AI Intelligence']
      }
    ],
    uploadedFiles: [],

    // Actions
    setIsActive: (active) => set((state) => {
      state.isActive = active;
      localStorage.setItem('mayza-active-state', String(active));
    }),

    setIsLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),

    addMessage: (message) => set((state) => {
      state.messages.push(message);
    }),

    addUploadedFile: (file) => set((state) => {
      state.uploadedFiles.push(file);
    }),

    removeUploadedFile: (index) => set((state) => {
      state.uploadedFiles.splice(index, 1);
    }),

    clearUploadedFiles: () => set((state) => {
      state.uploadedFiles = [];
    }),

    resetSession: () => set((state) => {
      const savedActiveState = localStorage.getItem('mayza-active-state');
      const currentActiveState = savedActiveState !== null ? savedActiveState === 'true' : true;
      
      state.sessionId = crypto.randomUUID();
      state.isLoading = false;
      state.messages = [
        {
          role: 'assistant',
          content: "Hey! I'm Mayza - your singular AI assistant with all capabilities built-in. I'm not a collection of bots, I'm ONE intelligence that handles everything: development, video production, automation, content creation, school work, planning, and anything else you need. I remember our entire conversation and adapt to how you work. What can I help you with?",
          capabilities: ['Unified AI Intelligence']
        }
      ];
      state.uploadedFiles = [];
      // Preserve the current active state
      state.isActive = currentActiveState;
    }),
  }))
);
