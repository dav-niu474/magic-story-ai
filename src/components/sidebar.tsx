'use client';

import { useAppStore, CoreModule, CreationSubView } from '@/lib/store';
import { AGENTS, AgentType } from '@/lib/agents';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  ListTree,
  Route,
  MessageSquare,
  Archive,
  Network,
  PenTool,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  projects: { id: string; title: string; genre: string }[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
}

// 3 core modules
const MODULE_ITEMS: { id: CoreModule; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'creation', label: '创作中心', icon: <PenTool size={18} />, color: 'text-amber-400' },
  { id: 'assets', label: '项目管理', icon: <Archive size={18} />, color: 'text-rose-400' },
  { id: 'graph', label: '全景图谱', icon: <Network size={18} />, color: 'text-teal-400' },
];

// Creation center sub-views
const CREATION_ITEMS: { id: CreationSubView; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: '工作台', icon: <LayoutDashboard size={16} /> },
  { id: 'outline', label: '大纲规划', icon: <ListTree size={16} /> },
  { id: 'chapters', label: '章节创作', icon: <BookOpen size={16} /> },
  { id: 'tracking', label: '追踪', icon: <Route size={16} /> },
];

export function Sidebar({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
}: SidebarProps) {
  const { coreModule, setCoreModule, creationSubView, setCreationSubView, sidebarCollapsed, setSidebarCollapsed, activeAgent, setActiveAgent } = useAppStore();

  const handleModuleClick = (mod: CoreModule) => {
    setCoreModule(mod);
  };

  const handleAgentClick = (agentType: AgentType) => {
    if (activeAgent === agentType) {
      setActiveAgent(null);
    } else {
      setActiveAgent(agentType);
    }
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 240 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-12 flex items-center px-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Bot size={18} />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-bold text-sidebar-foreground whitespace-nowrap">
              小说创作Agent
            </span>
          )}
        </div>
      </div>

      {/* Project Selector */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-sidebar-foreground/50 font-medium">当前项目</span>
            <button
              onClick={onCreateProject}
              className="text-sidebar-foreground/50 hover:text-primary transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <select
            value={currentProjectId || ''}
            onChange={e => onSelectProject(e.target.value)}
            className="w-full px-2 py-1.5 bg-sidebar-accent border border-sidebar-border rounded text-sidebar-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
        <div className="px-2 space-y-0.5">
          {/* Core Modules */}
          {MODULE_ITEMS.map(item => {
            const isActive = coreModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleModuleClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`shrink-0 ${isActive ? item.color : ''}`}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap truncate">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Creation sub-views (show when creation module is active) */}
          <AnimatePresence>
            {coreModule === 'creation' && !sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 pl-2 border-l border-sidebar-border/50"
              >
                {CREATION_ITEMS.map(item => {
                  const isActive = creationSubView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCreationSubView(item.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      {item.icon}
                      <span className="whitespace-nowrap truncate">{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings */}
          <div className="pt-2 mt-2 border-t border-sidebar-border/30">
            <button
              onClick={() => { /* Settings as creation sub-view for now */ }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150"
              title={sidebarCollapsed ? '设置' : undefined}
            >
              <Settings size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="whitespace-nowrap truncate">设置</span>}
            </button>
          </div>
        </div>

        {/* Agent Panel */}
        {!sidebarCollapsed && (
          <div className="mt-4 px-2">
            <div className="px-2.5 mb-1.5">
              <span className="text-xs text-sidebar-foreground/40 font-medium">AI Agent</span>
            </div>
            <div className="space-y-0.5">
              {AGENTS.map(agent => {
                const isActive = activeAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                      isActive
                        ? `${agent.bgColor} ${agent.color} font-medium border ${agent.borderColor}`
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <span className="text-base shrink-0">{agent.emoji}</span>
                    <span className="whitespace-nowrap truncate">{agent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsed Agent Icons */}
        {sidebarCollapsed && (
          <div className="mt-4 px-1 space-y-1">
            <div className="text-center mb-1">
              <span className="text-[9px] text-sidebar-foreground/30">AGENT</span>
            </div>
            {AGENTS.map(agent => {
              const isActive = activeAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentClick(agent.id)}
                  className={`w-full aspect-square flex items-center justify-center rounded-lg text-base transition-all duration-150 ${
                    isActive
                      ? `${agent.bgColor} ${agent.borderColor} border`
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent'
                  }`}
                  title={agent.name}
                >
                  {agent.emoji}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="h-10 flex items-center justify-center border-t border-sidebar-border shrink-0">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
