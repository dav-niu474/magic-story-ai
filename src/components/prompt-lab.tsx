'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { extractVariables } from '@/lib/variable-resolver';
import { FlaskConical, Plus, Trash2, Edit3, Save, X, Code, Star } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  isDefault: boolean;
}

interface PromptLabProps {
  projectId: string;
}

const PROMPT_TYPES = [
  { value: 'general', label: '通用', emoji: '📝' },
  { value: 'world', label: '世界观', emoji: '🌍' },
  { value: 'character', label: '角色', emoji: '👤' },
  { value: 'outline', label: '大纲', emoji: '📋' },
  { value: 'chapter', label: '章节', emoji: '📖' },
  { value: 'review', label: '评审', emoji: '🔍' },
  { value: 'edit', label: '润色', emoji: '✏️' },
];

const PRESET_TEMPLATES = [
  {
    name: '默认大纲生成',
    type: 'outline',
    content: '请为以下类型小说生成完整大纲：\n\n类型：${genre}\n世界观：${background}\n角色：${characters}\n\n要求：\n1. 包含主线和副线剧情\n2. 标注关键转折点\n3. 设计合理的节奏\n4. 每卷有明确目标',
    isDefault: true,
  },
  {
    name: '默认章节生成',
    type: 'chapter',
    content: '请根据以下信息创作章节：\n\n章节细纲：${chapter_outline}\n风格要求：${style}\n世界观：${background}\n角色设定：${characters}\n人物关系：${relationships}\n整体大纲：${outline}\n\n要求：\n1. 严格遵循细纲\n2. 角色行为符合设定\n3. 场景描写生动\n4. 对话自然有特色\n5. 章末设悬念钩子',
    isDefault: true,
  },
  {
    name: '默认润色',
    type: 'edit',
    content: '请润色以下文本，去除AI痕迹，提升文学性：\n\n${selected_text}\n\n要求：\n1. 消除AI写作特征（过度过渡词、每段总结等）\n2. 增加文字韵律感\n3. 丰富表达手法\n4. 保持原意不变\n5. 对话更口语化',
    isDefault: true,
  },
  {
    name: '默认角色设计',
    type: 'character',
    content: '请为以下类型的小说设计角色：\n\n类型：${genre}\n世界观：${background}\n\n请设计主角和3-5个核心配角，每个角色包含：\n1. 姓名、年龄、角色定位\n2. 性格特征\n3. 外貌描写\n4. 背景故事\n5. 成长弧线\n6. 独特的语言风格',
    isDefault: true,
  },
  {
    name: '默认评审',
    type: 'review',
    content: '请从多个维度评审以下内容：\n\n${selected_text}\n\n评分维度（1-10分）：\n1. 情节逻辑\n2. 人物塑造\n3. 文笔质量\n4. 节奏把控\n5. 创新程度\n6. 情感共鸣\n7. 完读欲望\n8. 商业潜力\n\n请给出每项评分、简要评语和改进建议。',
    isDefault: true,
  },
  {
    name: '默认世界观构建',
    type: 'world',
    content: '请为以下类型小说构建世界观：\n\n类型：${genre}\n\n请包含：\n1. 基础设定（物理法则、自然环境）\n2. 力量体系（等级、来源、限制）\n3. 社会结构（政治、经济、阶级）\n4. 历史文化（重要事件、传统、禁忌）\n5. 自洽性检查\n\n要求有独特创新点和内在逻辑。',
    isDefault: true,
  },
];

export function PromptLab({ projectId }: PromptLabProps) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', type: 'general', content: '', isDefault: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', content: '' });
  const [previewVars, setPreviewVars] = useState<string[]>([]);

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await fetch(`/api/prompts?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
      }
    } catch (e) {
      console.error('Failed to fetch prompts:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.content.trim()) return;
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...createForm }),
      });
      if (res.ok) {
        await fetchPrompts();
        setIsCreating(false);
        setCreateForm({ name: '', type: 'general', content: '', isDefault: false });
      }
    } catch (e) {
      console.error('Failed to create prompt:', e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        await fetchPrompts();
        setEditingId(null);
      }
    } catch (e) {
      console.error('Failed to update prompt:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPrompts();
      }
    } catch (e) {
      console.error('Failed to delete prompt:', e);
    }
  };

  const handleLoadPresets = async () => {
    try {
      for (const preset of PRESET_TEMPLATES) {
        await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, ...preset }),
        });
      }
      await fetchPrompts();
    } catch (e) {
      console.error('Failed to load presets:', e);
    }
  };

  const getTypeLabel = (type: string) => PROMPT_TYPES.find(t => t.value === type) || PROMPT_TYPES[0];

  const updatePreviewVars = (content: string) => {
    setPreviewVars(extractVariables(content));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical size={20} className="text-purple-400" />
          <h2 className="text-lg font-bold text-foreground">提示词工坊</h2>
          <Badge variant="secondary" className="text-xs">{prompts.length} 个模板</Badge>
        </div>
        <div className="flex items-center gap-2">
          {prompts.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleLoadPresets}>
              <Star size={14} className="mr-1" />
              加载预设
            </Button>
          )}
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={14} className="mr-1" />
            新建模板
          </Button>
        </div>
      </div>

      {/* Variable Reference */}
      <Card className="bg-secondary/30 border-border/30">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            <Code size={12} className="inline mr-1" />
            可用变量
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['${background}', '${characters}', '${relationships}', '${plot}', '${style}', '${outline}', '${chapter_outline}', '${selected_text}', '${genre}', '${world_rules}'].map(v => (
              <code key={v} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">
                {v}
              </code>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-card/50 border-primary/30 glow-amber">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">新建提示词模板</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}><X size={14} /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">名称</label>
                <Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="模板名称" className="text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">类型</label>
                <select value={createForm.type} onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                  {PROMPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">提示词内容</label>
              <Textarea
                value={createForm.content}
                onChange={e => { setCreateForm(prev => ({ ...prev, content: e.target.value })); updatePreviewVars(e.target.value); }}
                placeholder="输入提示词，使用 ${variable} 插入变量..."
                rows={8}
                className="text-sm font-mono resize-none"
              />
            </div>
            {previewVars.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">检测到变量：</span>
                {previewVars.map(v => (
                  <code key={v} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">${`{${v}}`}</code>
                ))}
              </div>
            )}
            <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim() || !createForm.content.trim()}>
              <Save size={14} className="mr-1" />保存模板
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Prompt List */}
      <div className="space-y-3">
        {prompts.map(prompt => {
          const typeInfo = getTypeLabel(prompt.type);
          const isEditing = editingId === prompt.id;

          return (
            <Card key={prompt.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="text-sm" />
                      <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className="h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                        {PROMPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                      </select>
                    </div>
                    <Textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} rows={6} className="text-sm font-mono resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(prompt.id)}><Save size={14} className="mr-1" />保存</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{typeInfo.emoji}</span>
                        <h3 className="font-medium text-foreground text-sm">{prompt.name}</h3>
                        <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                        {prompt.isDefault && <Badge className="text-xs bg-primary/20 text-primary">默认</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(prompt.id); setEditForm({ name: prompt.name, type: prompt.type, content: prompt.content }); }}>
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(prompt.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg font-mono max-h-32 overflow-y-auto custom-scrollbar">
                      {prompt.content}
                    </pre>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {extractVariables(prompt.content).map(v => (
                        <code key={v} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">${`{${v}}`}</code>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {prompts.length === 0 && !isCreating && (
          <div className="text-center py-12 text-muted-foreground">
            <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">还没有提示词模板</p>
            <p className="text-xs mt-1">点击"加载预设"添加默认模板，或手动创建</p>
          </div>
        )}
      </div>
    </div>
  );
}
