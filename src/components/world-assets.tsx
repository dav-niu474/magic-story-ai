'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, Trash2, Edit3, Save, X, Tag,
} from 'lucide-react';

interface WorldSetting {
  id: string;
  projectId: string;
  name: string;
  description: string;
  rules: string;
  type: string;
  order: number;
  tags: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface WorldAssetsProps {
  projectId: string;
}

const SETTING_TYPES = [
  { value: 'background', label: '背景设定', emoji: '🗺️', color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { value: 'power', label: '力量体系', emoji: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: 'location', label: '地理环境', emoji: '🏔️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'society', label: '社会结构', emoji: '🏛️', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'history', label: '历史文化', emoji: '📜', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'rules', label: '世界规则', emoji: '📋', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { value: 'other', label: '其他', emoji: '✨', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const EMPTY_FORM = {
  name: '', description: '', rules: '', type: 'background', tags: [] as string[],
};

export function WorldAssets({ projectId }: WorldAssetsProps) {
  const [settings, setSettings] = useState<WorldSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');

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
        body: JSON.stringify({ projectId, ...createForm, tags: createForm.tags, order: settings.length }),
      });
      if (res.ok) {
        await fetchSettings();
        setIsCreating(false);
        setCreateForm(EMPTY_FORM);
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
        body: JSON.stringify({ id, ...editForm, tags: editForm.tags }),
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

  const addTag = (tag: string, isEdit: boolean) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (isEdit) {
      if (!editForm.tags.includes(trimmed)) setEditForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setEditTagInput('');
    } else {
      if (!createForm.tags.includes(trimmed)) setCreateForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string, isEdit: boolean) => {
    if (isEdit) {
      setEditForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    } else {
      setCreateForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    }
  };

  const startEdit = (setting: WorldSetting) => {
    setEditingId(setting.id);
    const parsedTags = (() => { try { return JSON.parse(setting.tags || '[]'); } catch { return []; } })();
    setEditForm({
      name: setting.name, description: setting.description, rules: setting.rules,
      type: setting.type, tags: parsedTags,
    });
  };

  const getTypeInfo = (type: string) => SETTING_TYPES.find(t => t.value === type) || SETTING_TYPES[SETTING_TYPES.length - 1];
  const parsedTags = (tagsStr: string) => { try { return JSON.parse(tagsStr || '[]'); } catch { return []; } };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-teal-400" />
          <h2 className="text-lg font-bold text-foreground">世界观资产</h2>
          <Badge variant="secondary" className="text-xs">{settings.length} 项设定</Badge>
        </div>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus size={14} className="mr-1" />添加设定
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="bg-card/50 border-teal-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">新建世界设定</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setCreateForm(EMPTY_FORM); }}><X size={14} /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-muted-foreground mb-1">名称</label><Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="设定名称..." className="text-sm" /></div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">类型</label>
                    <select value={createForm.type} onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                      {SETTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-xs text-muted-foreground mb-1">描述</label><Textarea value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="详细描述..." rows={3} className="text-sm resize-none" /></div>
                <div><label className="block text-xs text-muted-foreground mb-1">规则与限制</label><Textarea value={createForm.rules} onChange={e => setCreateForm(prev => ({ ...prev, rules: e.target.value }))} placeholder="规则、限制和运作机制..." rows={2} className="text-sm resize-none" /></div>
                {/* Tags */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">标签</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {createForm.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] gap-1 pr-1">{tag}<button onClick={() => removeTag(tag, false)} className="hover:text-destructive"><X size={10} /></button></Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="添加标签..." className="text-xs h-7" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput, false))} />
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => addTag(tagInput, false)}><Tag size={12} /></Button>
                  </div>
                </div>
                <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim()}><Save size={14} className="mr-1" />保存设定</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings List */}
      <ScrollArea className="max-h-[70vh]">
        <div className="space-y-3">
          {settings.map(setting => {
            const typeInfo = getTypeInfo(setting.type);
            const isEditing = editingId === setting.id;

            return (
              <Card key={setting.id} className={`bg-card/50 border-border/50 hover:border-border transition-colors ${isEditing ? 'border-teal-500/25' : ''}`}>
                <CardContent className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="text-sm" />
                        <select value={editForm.type} onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))} className="h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                          {SETTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                        </select>
                      </div>
                      <Textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="text-sm resize-none" />
                      <Textarea value={editForm.rules} onChange={e => setEditForm(prev => ({ ...prev, rules: e.target.value }))} rows={2} className="text-sm resize-none" placeholder="规则与限制" />
                      {/* Tags */}
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">标签</label>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {editForm.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] gap-1 pr-1">{tag}<button onClick={() => removeTag(tag, true)} className="hover:text-destructive"><X size={10} /></button></Badge>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Input value={editTagInput} onChange={e => setEditTagInput(e.target.value)} placeholder="添加标签..." className="text-xs h-7" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(editTagInput, true))} />
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => addTag(editTagInput, true)}><Tag size={12} /></Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdate(setting.id)}><Save size={14} className="mr-1" />保存</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{typeInfo.emoji}</span>
                          <h3 className="font-medium text-foreground">{setting.name}</h3>
                          <Badge className={`text-[10px] ${typeInfo.bg} ${typeInfo.color} border-0`}>{typeInfo.label}</Badge>
                          <span className="text-[10px] text-muted-foreground">v{setting.version}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(setting)}><Edit3 size={14} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(setting.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></Button>
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
                      {/* Tags */}
                      {parsedTags(setting.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {parsedTags(setting.tags).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                          ))}
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
              <p className="text-xs mt-1">点击"添加设定"开始构建世界观</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
