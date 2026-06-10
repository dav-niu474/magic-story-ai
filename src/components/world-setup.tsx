'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { Globe, Plus, Trash2, Edit3, Save, X, Sparkles } from 'lucide-react';

interface WorldSetting {
  id: string;
  name: string;
  description: string;
  rules: string;
  type: string;
  order: number;
}

interface WorldSetupProps {
  projectId: string;
}

const SETTING_TYPES = [
  { value: 'background', label: '背景设定', emoji: '🗺️' },
  { value: 'power', label: '力量体系', emoji: '⚡' },
  { value: 'location', label: '地理环境', emoji: '🏔️' },
  { value: 'society', label: '社会结构', emoji: '🏛️' },
  { value: 'history', label: '历史文化', emoji: '📜' },
  { value: 'rules', label: '世界规则', emoji: '📋' },
  { value: 'other', label: '其他', emoji: '✨' },
];

export function WorldSetup({ projectId }: WorldSetupProps) {
  const [settings, setSettings] = useState<WorldSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', rules: '', type: 'background' });
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', rules: '', type: 'background' });
  const { setActiveAgent } = useAppStore();

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/world-settings?projectId=${projectId}`);
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch world settings:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    try {
      const res = await fetch('/api/world-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...createForm, order: settings.length }),
      });
      if (res.ok) {
        await fetchSettings();
        setIsCreating(false);
        setCreateForm({ name: '', description: '', rules: '', type: 'background' });
      }
    } catch (e) {
      console.error('Failed to create world setting:', e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch('/api/world-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        await fetchSettings();
        setEditingId(null);
      }
    } catch (e) {
      console.error('Failed to update world setting:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/world-settings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSettings();
      }
    } catch (e) {
      console.error('Failed to delete world setting:', e);
    }
  };

  const startEdit = (setting: WorldSetting) => {
    setEditingId(setting.id);
    setEditForm({
      name: setting.name,
      description: setting.description,
      rules: setting.rules,
      type: setting.type,
    });
  };

  const getTypeLabel = (type: string) => {
    return SETTING_TYPES.find(t => t.value === type) || SETTING_TYPES[SETTING_TYPES.length - 1];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-teal-400" />
          <h2 className="text-lg font-bold text-foreground">世界观设定</h2>
          <Badge variant="secondary" className="text-xs">{settings.length} 项设定</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAgent('worldbuilder')}
            className="text-teal-400 border-teal-400/30 hover:bg-teal-400/10"
          >
            <Sparkles size={14} className="mr-1" />
            AI构建
          </Button>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={14} className="mr-1" />
            添加设定
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-card/50 border-primary/30 glow-amber">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">新建世界设定</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X size={14} />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">名称</label>
                <Input
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="设定名称..."
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">类型</label>
                <select
                  value={createForm.type}
                  onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SETTING_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">描述</label>
              <Textarea
                value={createForm.description}
                onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="详细描述这个世界设定..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">规则与限制</label>
              <Textarea
                value={createForm.rules}
                onChange={e => setCreateForm(prev => ({ ...prev, rules: e.target.value }))}
                placeholder="这个设定的规则、限制和运作机制..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim()}>
              <Save size={14} className="mr-1" />
              保存设定
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings List */}
      <div className="space-y-3">
        {settings.map(setting => {
          const typeInfo = getTypeLabel(setting.type);
          const isEditing = editingId === setting.id;

          return (
            <Card key={setting.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={editForm.name}
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-sm"
                      />
                      <select
                        value={editForm.type}
                        onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                        className="h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
                      >
                        {SETTING_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    <Textarea
                      value={editForm.description}
                      onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="text-sm resize-none"
                    />
                    <Textarea
                      value={editForm.rules}
                      onChange={e => setEditForm(prev => ({ ...prev, rules: e.target.value }))}
                      rows={2}
                      className="text-sm resize-none"
                      placeholder="规则与限制"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(setting.id)}>
                        <Save size={14} className="mr-1" />
                        保存
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{typeInfo.emoji}</span>
                        <h3 className="font-medium text-foreground">{setting.name}</h3>
                        <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(setting)}>
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(setting.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">{setting.description}</p>
                    )}
                    {setting.rules && (
                      <div className="mt-2 p-2 bg-secondary/50 rounded-md">
                        <p className="text-xs text-muted-foreground font-medium mb-1">📋 规则</p>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{setting.rules}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {settings.length === 0 && !isCreating && (
          <div className="text-center py-12 text-muted-foreground">
            <Globe size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">还没有世界设定</p>
            <p className="text-xs mt-1">点击"添加设定"或让AI帮你构建世界观</p>
          </div>
        )}
      </div>
    </div>
  );
}
