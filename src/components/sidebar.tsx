'use client';

import { useAppStore, ViewType } from '@/lib/store';
import { AGENTS, AgentType } from '@/lib/agents';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  Users,
  ListTree,
  BookOpen,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bot,
  Route,
} from 'lucide-react';

interface SidebarProps {
  projects: { id: string; title: string; genre: string }[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
}

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '工作台', icon: <LayoutDashboard size={18} /> },
  { id: 'world', label: '世界观设定', icon: <Globe size={18} /> },
  { id: 'characters', label: '角色管理', icon: <Users size={18} /> },
  { id: 'outline', label: '大纲规划', icon: <ListTree size={18} /> },
  { id: 'chapters', label: '章节创作', icon: <BookOpen size={18} /> },
  { id: 'tracking', label: '追踪', icon: <Route size={18} /> },
  { id: 'prompts', label: '提示词工坊', icon: <FlaskConical size={18} /> },
  { id: 'settings', label: '设置', icon: <Settings size={18} /> },
];

export function Sidebar({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
}: SidebarProps) {
  const { currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed, activeAgent, setActiveAgent } = useAppStore();

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
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
          {NAV_ITEMS.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`shrink-0 ${isActive ? 'text-primary' : ''}`}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
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
