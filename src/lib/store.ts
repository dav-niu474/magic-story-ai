import { create } from 'zustand';

// ==========================================
// 三大核心模块导航
// ==========================================

export type CoreModule = 'creation' | 'assets' | 'graph';

// 创作中心子视图
export type CreationSubView = 'chat' | 'chapters' | 'outline' | 'tracking';

// 项目管理子视图
export type AssetSubView = 'overview' | 'characters' | 'plots' | 'scenes' | 'world' | 'library';

// 全景图谱子视图
export type GraphSubView = 'map' | 'editor';

// ==========================================
// Agent 工具定义
// ==========================================

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: 'outline' | 'character' | 'world' | 'graph' | 'scene';
  enabled: boolean;
  icon: string;
}

export const DEFAULT_TOOLS: AgentTool[] = [
  // 大纲类
  { id: 'write_outline', name: '撰写大纲', description: '生成或修改故事大纲', category: 'outline', enabled: true, icon: '📋' },
  { id: 'write_chapter_plan', name: '章节细纲', description: '为章节生成细纲', category: 'outline', enabled: true, icon: '📝' },
  { id: 'read_outline', name: '读取大纲', description: '获取当前项目大纲内容', category: 'outline', enabled: true, icon: '📖' },
  // 角色类
  { id: 'create_character', name: '创建角色', description: '创建新角色并写入项目管理', category: 'character', enabled: true, icon: '👤' },
  { id: 'update_character', name: '更新角色', description: '修改已有角色设定', category: 'character', enabled: true, icon: '✏️' },
  { id: 'generate_portrait', name: '生成角色图', description: '用AI生成角色肖像图', category: 'character', enabled: true, icon: '🎨' },
  { id: 'search_asset', name: '搜索资产', description: '在资产库中搜索角色/场景/世界观', category: 'character', enabled: true, icon: '🔍' },
  // 世界观/场景类
  { id: 'create_world_entry', name: '创建世界设定', description: '新增世界观条目', category: 'world', enabled: true, icon: '🌍' },
  { id: 'create_scene', name: '创建场景', description: '创建新场景资产', category: 'scene', enabled: true, icon: '🎬' },
  { id: 'create_plot', name: '创建剧情', description: '创建新剧情线', category: 'scene', enabled: true, icon: '📌' },
  // 图谱类
  { id: 'create_story_node', name: '创建图谱节点', description: '在全景图谱中创建节点', category: 'graph', enabled: true, icon: '🔵' },
  { id: 'link_nodes', name: '连接节点', description: '在全景图谱中连接两个节点', category: 'graph', enabled: true, icon: '🔗' },
  { id: 'read_graph', name: '读取图谱', description: '获取全景图谱数据', category: 'graph', enabled: true, icon: '🗺️' },
];

// ==========================================
// Agent 消息
// ==========================================

export interface ToolCallResult {
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output: string;
  status: 'success' | 'error';
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  agentType: string;
  timestamp: number;
  toolCalls?: ToolCallResult[];
  isStreaming?: boolean;
}

// ==========================================
// 图谱节点类型
// ==========================================

export type StoryNodeType = 'main' | 'sub' | 'task' | 'dungeon' | 'scene' | 'event';

export const NODE_TYPE_CONFIG: Record<StoryNodeType, { label: string; color: string; bgColor: string; borderColor: string }> = {
  main:    { label: '主线节点', color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/40' },
  sub:     { label: '支线节点', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/40' },
  task:    { label: '任务线', color: 'text-amber-400', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/40' },
  dungeon: { label: '副本节点', color: 'text-purple-400', bgColor: 'bg-purple-500/15', borderColor: 'border-purple-500/40' },
  scene:   { label: '场景剧情', color: 'text-orange-400', bgColor: 'bg-orange-500/15', borderColor: 'border-orange-500/40' },
  event:   { label: '事件节点', color: 'text-red-400', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/40' },
};

// ==========================================
// 全局状态
// ==========================================

export interface AppState {
  // === 三大模块导航 ===
  coreModule: CoreModule;
  setCoreModule: (module: CoreModule) => void;

  creationSubView: CreationSubView;
  setCreationSubView: (view: CreationSubView) => void;

  assetSubView: AssetSubView;
  setAssetSubView: (view: AssetSubView) => void;

  graphSubView: GraphSubView;
  setGraphSubView: (view: GraphSubView) => void;

  // === 向后兼容 (旧组件引用) ===
  currentView: string;
  setCurrentView: (view: string) => void;
  activeAgent: string | null;
  setActiveAgent: (agent: string | null) => void;

  // === 项目 ===
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // === 创作中心 - Agent ===
  agentMessages: Record<string, AgentMessage[]>;
  addAgentMessage: (projectId: string, message: AgentMessage) => void;
  clearAgentMessages: (projectId: string) => void;
  updateLastAssistantMessage: (projectId: string, content: string) => void;

  // === 创作中心 - 工具 ===
  agentTools: AgentTool[];
  toggleTool: (toolId: string) => void;
  setAgentTools: (tools: AgentTool[]) => void;

  // === 章节 ===
  activeChapterId: string | null;
  setActiveChapterId: (id: string | null) => void;

  // === 全景图谱 - 筛选 ===
  graphFilter: StoryNodeType[];
  setGraphFilter: (filter: StoryNodeType[]) => void;
  toggleGraphFilter: (nodeType: StoryNodeType) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // === UI ===
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;

  // === 面板 ===
  sidePanel: 'none' | 'preview' | 'antiAi' | 'adversarial' | 'nodeDetail';
  setSidePanel: (panel: 'none' | 'preview' | 'antiAi' | 'adversarial' | 'nodeDetail') => void;
}

// 向后兼容: 旧视图名 → 新模块映射
const VIEW_MAP: Record<string, { module: CoreModule; sub?: string }> = {
  dashboard:  { module: 'creation', sub: 'chat' },
  world:      { module: 'assets', sub: 'world' },
  characters: { module: 'assets', sub: 'characters' },
  outline:    { module: 'creation', sub: 'outline' },
  chapters:   { module: 'creation', sub: 'chapters' },
  tracking:   { module: 'creation', sub: 'tracking' },
  prompts:    { module: 'creation', sub: 'chat' },
  settings:   { module: 'assets' },
};

export const useAppStore = create<AppState>((set) => ({
  // === 三大模块导航 ===
  coreModule: 'creation',
  setCoreModule: (module) => set({ coreModule: module }),

  creationSubView: 'chat',
  setCreationSubView: (view) => set({ creationSubView: view }),

  assetSubView: 'overview',
  setAssetSubView: (view) => set({ assetSubView: view }),

  graphSubView: 'map',
  setGraphSubView: (view) => set({ graphSubView: view }),

  // === 项目 ===
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  // === 创作中心 - Agent ===
  agentMessages: {},
  addAgentMessage: (projectId, message) =>
    set((state) => ({
      agentMessages: {
        ...state.agentMessages,
        [projectId]: [...(state.agentMessages[projectId] || []), message],
      },
    })),
  clearAgentMessages: (projectId) =>
    set((state) => ({
      agentMessages: {
        ...state.agentMessages,
        [projectId]: [],
      },
    })),
  updateLastAssistantMessage: (projectId, content) =>
    set((state) => {
      const messages = state.agentMessages[projectId] || [];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
        const updated = [...messages];
        updated[lastIdx] = { ...updated[lastIdx], content, isStreaming: false };
        return { agentMessages: { ...state.agentMessages, [projectId]: updated } };
      }
      return state;
    }),

  // === 创作中心 - 工具 ===
  agentTools: DEFAULT_TOOLS,
  toggleTool: (toolId) =>
    set((state) => ({
      agentTools: state.agentTools.map((t) =>
        t.id === toolId ? { ...t, enabled: !t.enabled } : t
      ),
    })),
  setAgentTools: (tools) => set({ agentTools: tools }),

  // === 章节 ===
  activeChapterId: null,
  setActiveChapterId: (id) => set({ activeChapterId: id }),

  // === 全景图谱 - 筛选 ===
  graphFilter: ['main', 'sub', 'task', 'dungeon', 'scene', 'event'],
  setGraphFilter: (filter) => set({ graphFilter: filter }),
  toggleGraphFilter: (nodeType) =>
    set((state) => {
      const has = state.graphFilter.includes(nodeType);
      return {
        graphFilter: has
          ? state.graphFilter.filter((t) => t !== nodeType)
          : [...state.graphFilter, nodeType],
      };
    }),
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // === UI ===
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  selectedText: '',
  setSelectedText: (text) => set({ selectedText: text }),

  // === 面板 ===
  sidePanel: 'none',
  setSidePanel: (panel) => set({ sidePanel: panel }),

  // === 向后兼容 ===
  currentView: 'dashboard',
  setCurrentView: (view) => {
    const mapping = VIEW_MAP[view];
    if (mapping) {
      set({
        currentView: view,
        coreModule: mapping.module,
        ...(mapping.sub === 'chat' ? { creationSubView: 'chat' as CreationSubView } : {}),
        ...(mapping.sub === 'outline' ? { creationSubView: 'outline' as CreationSubView } : {}),
        ...(mapping.sub === 'chapters' ? { creationSubView: 'chapters' as CreationSubView } : {}),
        ...(mapping.sub === 'tracking' ? { creationSubView: 'tracking' as CreationSubView } : {}),
        ...(mapping.sub === 'world' ? { assetSubView: 'world' as AssetSubView } : {}),
        ...(mapping.sub === 'characters' ? { assetSubView: 'characters' as AssetSubView } : {}),
      });
    } else {
      set({ currentView: view });
    }
  },
  activeAgent: null,
  setActiveAgent: (agent) => set({
    activeAgent: agent,
    // When an agent is activated, switch to creation center chat
    ...(agent ? { coreModule: 'creation' as CoreModule, creationSubView: 'chat' as CreationSubView } : {}),
  }),
}));
