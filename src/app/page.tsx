'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/sidebar';
import { Dashboard } from '@/components/dashboard';
import { WorldSetup } from '@/components/world-setup';
import { CharacterManager } from '@/components/character-manager';
import { OutlineEditor } from '@/components/outline-editor';
import { ChapterEditor } from '@/components/chapter-editor';
import { PromptLab } from '@/components/prompt-lab';
import { SettingsPanel } from '@/components/settings-panel';
import { AgentChat } from '@/components/agent-chat';
import { TrackingPanel } from '@/components/tracking-panel';
import { ProjectWizard } from '@/components/project-wizard';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  genre: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chapters: number;
    characters: number;
    worldSettings: number;
  };
}

export default function NovelPlatform() {
  const { currentView, currentProjectId, setCurrentProjectId, activeAgent } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !currentProjectId) {
          setCurrentProjectId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  }, [currentProjectId, setCurrentProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (title: string, genre: string, description: string) => {
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, description }),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects(prev => [project, ...prev]);
        setCurrentProjectId(project.id);
        setShowNewProject(false);
      }
    } catch (e) {
      console.error('Failed to create project:', e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (currentProjectId === id) {
          const remaining = projects.filter(p => p.id !== id);
          setCurrentProjectId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  };

  const handleWizardComplete = (project: { id: string; title: string; genre: string; description: string }) => {
    setProjects(prev => [project as Project, ...prev]);
    setCurrentProjectId(project.id);
    setShowWizard(false);
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  const renderView = () => {
    if (!currentProjectId) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">欢迎使用小说创作Agent平台</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            创建你的第一个项目，开始AI驱动的多Agent协作创作之旅
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            + 创建新项目
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard project={currentProject} onDeleteProject={handleDeleteProject} />;
      case 'world':
        return <WorldSetup projectId={currentProjectId} />;
      case 'characters':
        return <CharacterManager projectId={currentProjectId} />;
      case 'outline':
        return <OutlineEditor projectId={currentProjectId} />;
      case 'chapters':
        return <ChapterEditor projectId={currentProjectId} />;
      case 'tracking':
        return <TrackingPanel projectId={currentProjectId} />;
      case 'prompts':
        return <PromptLab projectId={currentProjectId} />;
      case 'settings':
        return <SettingsPanel project={currentProject} onUpdate={fetchProjects} />;
      default:
        return <Dashboard project={currentProject} onDeleteProject={handleDeleteProject} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={setCurrentProjectId}
        onCreateProject={() => setShowWizard(true)}
        onDeleteProject={handleDeleteProject}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {currentProject && (
              <>
                <span className="text-sm font-medium text-foreground">{currentProject.title}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{currentProject.genre}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentProjectId && (
              <a
                href={`/api/export?projectId=${currentProjectId}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-secondary"
              >
                📥 导出TXT
              </a>
            )}
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 md:p-6">
              {renderView()}
            </div>
          </div>

          {/* Agent Chat Panel */}
          {activeAgent && currentProjectId && (
            <AgentChat projectId={currentProjectId} agentType={activeAgent} />
          )}
        </div>
      </main>

      {/* Simple Create Project Dialog (fallback) */}
      {showNewProject && (
        <SimpleCreateDialog
          onConfirm={(title, genre, desc) => handleCreateProject(title, genre, desc)}
          onCancel={() => setShowNewProject(false)}
        />
      )}

      {/* Project Wizard */}
      {showWizard && (
        <ProjectWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

// Simple create dialog as fallback
function SimpleCreateDialog({ onConfirm, onCancel }: { onConfirm: (title: string, genre: string, desc: string) => void; onCancel: () => void }) {
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('玄幻系统修仙');
  const [newDesc, setNewDesc] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-foreground mb-4">快速创建项目</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">小说标题</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="输入你的小说标题..."
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">类型</label>
            <select
              value={newGenre}
              onChange={e => setNewGenre(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="玄幻系统修仙">⚔️ 玄幻系统修仙</option>
              <option value="都市重生">🔄 都市重生</option>
              <option value="脑洞网文">💡 脑洞网文</option>
              <option value="都市修仙">🏙️ 都市修仙</option>
              <option value="都市高武">👊 都市高武</option>
              <option value="末日系统">🧟 末日系统</option>
              <option value="霸总">👑 霸总</option>
              <option value="后悔流">😢 后悔流</option>
              <option value="无敌文">💪 无敌文</option>
              <option value="历史架空">📜 历史架空</option>
              <option value="东方玄幻">🐉 东方玄幻</option>
              <option value="策略经营">🏰 策略经营</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">简介</label>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="简要描述你的故事..."
              rows={3}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(newTitle, newGenre, newDesc)}
            disabled={!newTitle.trim()}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建项目
          </button>
        </div>
      </motion.div>
    </div>
  );
}
