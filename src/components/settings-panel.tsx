'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Download, Info } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  genre: string;
  description: string;
}

interface SettingsPanelProps {
  project?: Project;
  onUpdate: () => void;
}

export function SettingsPanel({ project, onUpdate }: SettingsPanelProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [genre, setGenre] = useState(project?.genre || '');
  const [description, setDescription] = useState(project?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!project?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, title, genre, description }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (e) {
      console.error('Failed to update project:', e);
    }
    setIsSaving(false);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        请先选择项目
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">项目设置</h2>
      </div>

      {/* Project Info */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">项目名称</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">小说类型</label>
            <select
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            <label className="block text-xs text-muted-foreground mb-1">简介</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="text-sm resize-none"
              placeholder="简要描述你的小说..."
            />
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save size={14} className="mr-1" />
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">导出</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            将小说导出为TXT文件，包含所有已完成章节。
          </p>
          <a
            href={`/api/export?projectId=${project.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Download size={14} />
            导出TXT
          </a>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">关于</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info size={12} />
              <span>小说创作Agent平台 v1.0</span>
            </div>
            <p>基于多Agent协作的智能小说创作平台。六个专业AI Agent协同工作：策划、写手、编辑、评审、角色、世界观。</p>
            <p>技术栈：Next.js 16 + TypeScript + Prisma + Tailwind CSS + shadcn/ui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
