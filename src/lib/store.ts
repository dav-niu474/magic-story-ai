import { create } from 'zustand';

export type ViewType = 'dashboard' | 'world' | 'characters' | 'outline' | 'chapters' | 'tracking' | 'prompts' | 'settings';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentType: string;
  timestamp: number;
}

export interface AppState {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Project
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // Agent Chat
  agentMessages: Record<string, AgentMessage[]>;
  addAgentMessage: (agentType: string, message: AgentMessage) => void;
  clearAgentMessages: (agentType: string) => void;
  activeAgent: string | null;
  setActiveAgent: (agent: string | null) => void;

  // Chapter editing
  activeChapterId: string | null;
  setActiveChapterId: (id: string | null) => void;

  // Context menu
  selectedText: string;
  setSelectedText: (text: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  agentMessages: {},
  addAgentMessage: (agentType, message) =>
    set((state) => ({
      agentMessages: {
        ...state.agentMessages,
        [agentType]: [...(state.agentMessages[agentType] || []), message],
      },
    })),
  clearAgentMessages: (agentType) =>
    set((state) => ({
      agentMessages: {
        ...state.agentMessages,
        [agentType]: [],
      },
    })),
  activeAgent: null,
  setActiveAgent: (agent) => set({ activeAgent: agent }),

  activeChapterId: null,
  setActiveChapterId: (id) => set({ activeChapterId: id }),

  selectedText: '',
  setSelectedText: (text) => set({ selectedText: text }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
