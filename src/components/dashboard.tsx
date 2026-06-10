'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { AGENTS } from '@/lib/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Globe, ListTree, PenTool, Trash2 } from 'lucide-react';

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

interface DashboardProps {
  project?: Project;
  onDeleteProject: (id: string) => void;
}

export function Dashboard({ project, onDeleteProject }: DashboardProps) {
  const { setCurrentView, setActiveAgent } = useAppStore();
  const [stats, setStats] = useState({
    totalWords: 0,
    chapterCount: 0,
    characterCount: 0,
    worldSettingCount: 0,
    completedChapters: 0,
    draftChapters: 0,
  });
  const [recentLogs, setRecentLogs] = useState<{ agentType: string; action: string; createdAt: string }[]>([]);

  useEffect(() => {
    if (!project?.id) return;
    const fetchStats = async () => {
      try {
        const [chaptersRes, charsRes, worldRes, logsRes] = await Promise.all([
          fetch(`/api/chapters?projectId=${project.id}`),
          fetch(`/api/characters?projectId=${project.id}`),
          fetch(`/api/world-settings?projectId=${project.id}`),
          fetch(`/api/agent-logs?projectId=${project.id}`),
        ]);

        const chapters = chaptersRes.ok ? await chaptersRes.json() : [];
        const charsData = charsRes.ok ? await charsRes.json() : { characters: [] };
        const worldSettings = worldRes.ok ? await worldRes.json() : [];
        const logs = logsRes.ok ? await logsRes.json() : [];

        const totalWords = chapters.reduce((sum: number, c: { wordCount: number }) => sum + c.wordCount, 0);
        const completed = chapters.filter((c: { status: string }) => c.status === 'completed').length;
        const draft = chapters.filter((c: { status: string }) => c.status === 'draft').length;

        setStats({
          totalWords,
          chapterCount: chapters.length,
          characterCount: charsData.characters?.length || 0,
          worldSettingCount: worldSettings.length,
          completedChapters: completed,
          draftChapters: draft,
        });

        setRecentLogs(logs.slice(0, 5));
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
    };

    fetchStats();
  }, [project?.id]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        请选择或创建一个项目
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            {project.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.description || '暂无简介'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{project.genre}</Badge>
            <span className="text-xs text-muted-foreground">
              创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteProject(project.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <PenTool size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalWords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">总字数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <BookOpen size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.chapterCount}</p>
                <p className="text-xs text-muted-foreground">章节数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-400/10 flex items-center justify-center">
                <Users size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.characterCount}</p>
                <p className="text-xs text-muted-foreground">角色数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-400/10 flex items-center justify-center">
                <Globe size={18} className="text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.worldSettingCount}</p>
                <p className="text-xs text-muted-foreground">世界设定</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Agent Panel */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground">快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => { setCurrentView('world'); setActiveAgent('worldbuilder'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              <span className="text-lg">🌍</span>
              <div>
                <p className="text-sm font-medium text-foreground">构建世界观</p>
                <p className="text-xs text-muted-foreground">让世界观Agent帮你搭建世界</p>
              </div>
            </button>
            <button
              onClick={() => { setCurrentView('characters'); setActiveAgent('character'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              <span className="text-lg">👤</span>
              <div>
                <p className="text-sm font-medium text-foreground">设计角色</p>
                <p className="text-xs text-muted-foreground">让角色Agent帮你塑造人物</p>
              </div>
            </button>
            <button
              onClick={() => { setCurrentView('outline'); setActiveAgent('planner'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-sm font-medium text-foreground">规划大纲</p>
                <p className="text-xs text-muted-foreground">让策划Agent帮你构建故事框架</p>
              </div>
            </button>
            <button
              onClick={() => { setCurrentView('chapters'); setActiveAgent('writer'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              <span className="text-lg">✍️</span>
              <div>
                <p className="text-sm font-medium text-foreground">开始创作</p>
                <p className="text-xs text-muted-foreground">让写手Agent帮你撰写章节</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground">Agent 状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${agent.bgColor} hover:opacity-80`}
              >
                <span className="text-base">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${agent.color}`}>{agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground">最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs.map((log, i) => {
                const agent = AGENTS.find(a => a.id === log.agentType);
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span>{agent?.emoji || '🤖'}</span>
                    <span className="text-foreground">{log.action}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(log.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
