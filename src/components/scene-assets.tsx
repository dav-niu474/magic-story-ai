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
  Film, Plus, Trash2, Edit3, Save, X, Search, Tag,
  MapPin, CloudSun, Clock,
} from 'lucide-react';

interface Scene {
  id: string;
  projectId: string;
  name: string;
  description: string;
  location: string;
  atmosphere: string;
  timeOfDay: string;
  tags: string;
  order: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface SceneAssetsProps {
  projectId: string;
}

const TIME_OF_DAY_OPTIONS = [
  { value: '清晨', label: '清晨', color: 'text-sky-300', bg: 'bg-sky-500/10' },
  { value: '上午', label: '上午', color: 'text-amber-300', bg: 'bg-amber-500/10' },
  { value: '正午', label: '正午', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: '下午', label: '下午', color: 'text-orange-300', bg: 'bg-orange-500/10' },
  { value: '傍晚', label: '傍晚', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { value: '夜晚', label: '夜晚', color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
  { value: '深夜', label: '深夜', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: '黎明', label: '黎明', color: 'text-pink-300', bg: 'bg-pink-500/10' },
];

const ATMOSPHERE_OPTIONS = ['紧张', '温馨', '恐怖', '浪漫', '庄严', '悲凉', '欢快', '神秘', '宁静', '激烈'];

const EMPTY_FORM = {
  name: '', description: '', location: '', atmosphere: '', timeOfDay: '', tags: [] as string[],
};

export function SceneAssets({ projectId }: SceneAssetsProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/scenes?projectId=${projectId}`);
      if (res.ok) {
        setScenes(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch scenes:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    try {
      const res = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...createForm, tags: createForm.tags, order: scenes.length }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreating(false);
        setCreateForm(EMPTY_FORM);
      }
    } catch (e) {
      console.error('Failed to create scene:', e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch('/api/scenes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm, tags: editForm.tags }),
      });
      if (res.ok) {
        await fetchData();
        setEditingId(null);
      }
    } catch (e) {
      console.error('Failed to update scene:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scenes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        if (selectedScene === id) setSelectedScene(null);
      }
    } catch (e) {
      console.error('Failed to delete scene:', e);
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

  const startEdit = (scene: Scene) => {
    setEditingId(scene.id);
    const parsedTags = (() => { try { return JSON.parse(scene.tags || '[]'); } catch { return []; } })();
    setEditForm({
      name: scene.name, description: scene.description, location: scene.location,
      atmosphere: scene.atmosphere, timeOfDay: scene.timeOfDay, tags: parsedTags,
    });
  };

  const getTimeInfo = (time: string) => TIME_OF_DAY_OPTIONS.find(t => t.value === time);
  const parsedTags = (tagsStr: string) => { try { return JSON.parse(tagsStr || '[]'); } catch { return []; } };

  const filteredScenes = scenes.filter(s => {
    return !searchQuery || s.name.includes(searchQuery) || s.description?.includes(searchQuery) || s.location?.includes(searchQuery);
  });

  const selectedSceneData = scenes.find(s => s.id === selectedScene);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={20} className="text-orange-400" />
          <h2 className="text-lg font-bold text-foreground">场景资产</h2>
          <Badge variant="secondary" className="text-xs">{scenes.length} 个场景</Badge>
        </div>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus size={14} className="mr-1" />添加场景
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索场景..." className="pl-8 text-sm h-8" />
        </div>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="bg-card/50 border-orange-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">新建场景</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setCreateForm(EMPTY_FORM); }}><X size={14} /></Button>
                </div>
                <div><label className="block text-xs text-muted-foreground mb-1">名称</label><Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="场景名称..." className="text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-muted-foreground mb-1">地点</label><Input value={createForm.location} onChange={e => setCreateForm(prev => ({ ...prev, location: e.target.value }))} placeholder="场景地点..." className="text-sm" /></div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">时间段</label>
                    <select value={createForm.timeOfDay} onChange={e => setCreateForm(prev => ({ ...prev, timeOfDay: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                      <option value="">选择时间段</option>
                      {TIME_OF_DAY_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">氛围</label>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {ATMOSPHERE_OPTIONS.map(a => (
                      <button
                        key={a}
                        onClick={() => setCreateForm(prev => ({ ...prev, atmosphere: prev.atmosphere === a ? '' : a }))}
                        className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                          createForm.atmosphere === a ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' : 'border-border/50 text-muted-foreground hover:border-border'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <Input value={createForm.atmosphere} onChange={e => setCreateForm(prev => ({ ...prev, atmosphere: e.target.value }))} placeholder="自定义氛围..." className="text-xs h-7" />
                </div>
                <div><label className="block text-xs text-muted-foreground mb-1">描述</label><Textarea value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="场景描述..." rows={3} className="text-sm resize-none" /></div>
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
                <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim()}><Save size={14} className="mr-1" />创建场景</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Scene List */}
        <div className="md:col-span-1 space-y-1">
          <ScrollArea className="max-h-[70vh]">
            {filteredScenes.map(scene => {
              const timeInfo = getTimeInfo(scene.timeOfDay);
              const isSelected = selectedScene === scene.id;
              return (
                <div
                  key={scene.id}
                  onClick={() => setSelectedScene(isSelected ? null : scene.id)}
                  className={`p-2.5 rounded-lg transition-colors cursor-pointer mb-1 ${
                    isSelected ? 'bg-orange-500/10 border border-orange-500/25' : 'bg-card/50 border border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground text-sm truncate">{scene.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {scene.location && (
                      <Badge variant="outline" className="text-[9px] py-0 gap-0.5">
                        <MapPin size={8} />{scene.location}
                      </Badge>
                    )}
                    {scene.atmosphere && (
                      <Badge className="text-[9px] py-0 bg-orange-500/10 text-orange-400 border-0">
                        <CloudSun size={8} className="mr-0.5" />{scene.atmosphere}
                      </Badge>
                    )}
                    {timeInfo && (
                      <Badge className={`text-[9px] py-0 ${timeInfo.bg} ${timeInfo.color} border-0`}>
                        <Clock size={8} className="mr-0.5" />{timeInfo.label}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredScenes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Film size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">暂无场景</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Scene Detail */}
        <div className="md:col-span-2">
          {selectedSceneData ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                {editingId === selectedSceneData.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">编辑场景</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X size={14} /></Button>
                    </div>
                    <div><label className="block text-xs text-muted-foreground mb-1">名称</label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="text-sm" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs text-muted-foreground mb-1">地点</label><Input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} className="text-sm" /></div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">时间段</label>
                        <select value={editForm.timeOfDay} onChange={e => setEditForm(p => ({ ...p, timeOfDay: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                          <option value="">选择时间段</option>
                          {TIME_OF_DAY_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">氛围</label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {ATMOSPHERE_OPTIONS.map(a => (
                          <button key={a} onClick={() => setEditForm(prev => ({ ...prev, atmosphere: prev.atmosphere === a ? '' : a }))}
                            className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                              editForm.atmosphere === a ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' : 'border-border/50 text-muted-foreground hover:border-border'
                            }`}
                          >{a}</button>
                        ))}
                      </div>
                      <Input value={editForm.atmosphere} onChange={e => setEditForm(p => ({ ...p, atmosphere: e.target.value }))} placeholder="自定义氛围..." className="text-xs h-7" />
                    </div>
                    <div><label className="block text-xs text-muted-foreground mb-1">描述</label><Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="text-sm resize-none" /></div>
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
                    <Button size="sm" onClick={() => handleUpdate(selectedSceneData.id)}><Save size={14} className="mr-1" />保存</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{selectedSceneData.name}</h3>
                        <span className="text-[10px] text-muted-foreground">v{selectedSceneData.version}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(selectedSceneData)}><Edit3 size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedSceneData.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    {/* Location & Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedSceneData.location && (
                        <Badge variant="outline" className="text-xs gap-1"><MapPin size={12} />{selectedSceneData.location}</Badge>
                      )}
                      {selectedSceneData.atmosphere && (
                        <Badge className="text-xs bg-orange-500/10 text-orange-400 border-0 gap-1"><CloudSun size={12} />{selectedSceneData.atmosphere}</Badge>
                      )}
                      {selectedSceneData.timeOfDay && (() => {
                        const ti = getTimeInfo(selectedSceneData.timeOfDay);
                        return ti ? (
                          <Badge className={`text-xs ${ti.bg} ${ti.color} border-0 gap-1`}><Clock size={12} />{ti.label}</Badge>
                        ) : null;
                      })()}
                    </div>
                    {selectedSceneData.description && (
                      <div><p className="text-xs text-muted-foreground font-medium mb-1">📝 描述</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedSceneData.description}</p></div>
                    )}
                    {/* Tags */}
                    {parsedTags(selectedSceneData.tags).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {parsedTags(selectedSceneData.tags).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              选择左侧场景查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
