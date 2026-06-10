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
  GitBranch, Plus, Trash2, Edit3, Save, X, Search, Tag,
  ArrowUp, ArrowDown, Filter,
} from 'lucide-react';

interface Plot {
  id: string;
  projectId: string;
  name: string;
  description: string;
  plotType: string;
  priority: number;
  status: string;
  tags: string;
  order: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface PlotAssetsProps {
  projectId: string;
}

const PLOT_TYPES = [
  { value: 'main', label: '主线', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { value: 'sub', label: '支线', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { value: 'task', label: '任务线', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { value: 'dungeon', label: '副本线', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { value: 'scene', label: '场景剧情', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { value: 'event', label: '事件线', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  planned: { label: '计划中', color: 'text-muted-foreground', bg: 'bg-secondary' },
  active: { label: '进行中', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  completed: { label: '已完成', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  abandoned: { label: '已废弃', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const EMPTY_FORM = {
  name: '', description: '', plotType: 'main', priority: 0, status: 'planned', tags: [] as string[],
};

export function PlotAssets({ projectId }: PlotAssetsProps) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [tagInput, setTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/plots?projectId=${projectId}`);
      if (res.ok) {
        setPlots(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch plots:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    try {
      const res = await fetch('/api/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...createForm, tags: createForm.tags, order: plots.length }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreating(false);
        setCreateForm(EMPTY_FORM);
      }
    } catch (e) {
      console.error('Failed to create plot:', e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch('/api/plots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm, tags: editForm.tags }),
      });
      if (res.ok) {
        await fetchData();
        setEditingId(null);
      }
    } catch (e) {
      console.error('Failed to update plot:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/plots?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        if (selectedPlot === id) setSelectedPlot(null);
      }
    } catch (e) {
      console.error('Failed to delete plot:', e);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/plots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to update plot status:', e);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = plots.findIndex(p => p.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === plots.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updatedPlots = [...plots];
    [updatedPlots[idx], updatedPlots[swapIdx]] = [updatedPlots[swapIdx], updatedPlots[idx]];
    try {
      await Promise.all(updatedPlots.map((p, i) =>
        fetch('/api/plots', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, order: i }),
        })
      ));
      await fetchData();
    } catch (e) {
      console.error('Failed to reorder plots:', e);
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

  const startEdit = (plot: Plot) => {
    setEditingId(plot.id);
    const parsedTags = (() => { try { return JSON.parse(plot.tags || '[]'); } catch { return []; } })();
    setEditForm({
      name: plot.name, description: plot.description, plotType: plot.plotType,
      priority: plot.priority, status: plot.status, tags: parsedTags,
    });
  };

  const getTypeInfo = (type: string) => PLOT_TYPES.find(t => t.value === type) || PLOT_TYPES[0];
  const getStatusInfo = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.planned;
  const parsedTags = (tagsStr: string) => { try { return JSON.parse(tagsStr || '[]'); } catch { return []; } };

  const filteredPlots = plots.filter(p => {
    const matchesSearch = !searchQuery || p.name.includes(searchQuery) || p.description?.includes(searchQuery);
    const matchesType = filterType === 'all' || p.plotType === filterType;
    return matchesSearch && matchesType;
  });

  // Group by type
  const groupedPlots = PLOT_TYPES.map(type => ({
    ...type,
    plots: filteredPlots.filter(p => p.plotType === type.value),
  })).filter(g => g.plots.length > 0);

  const selectedPlotData = plots.find(p => p.id === selectedPlot);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={20} className="text-amber-400" />
          <h2 className="text-lg font-bold text-foreground">剧情资产</h2>
          <Badge variant="secondary" className="text-xs">{plots.length} 条剧情</Badge>
        </div>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus size={14} className="mr-1" />添加剧情
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索剧情..." className="pl-8 text-sm h-8" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-8 px-2 bg-secondary border border-input rounded-md text-xs text-foreground focus:outline-none">
          <option value="all">全部类型</option>
          {PLOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="bg-card/50 border-amber-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">新建剧情</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setCreateForm(EMPTY_FORM); }}><X size={14} /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-muted-foreground mb-1">名称</label><Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="剧情名称..." className="text-sm" /></div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">类型</label>
                    <select value={createForm.plotType} onChange={e => setCreateForm(prev => ({ ...prev, plotType: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                      {PLOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-xs text-muted-foreground mb-1">描述</label><Textarea value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="剧情描述..." rows={3} className="text-sm resize-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-muted-foreground mb-1">优先级</label><Input type="number" value={createForm.priority} onChange={e => setCreateForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))} className="text-sm" /></div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">状态</label>
                    <select value={createForm.status} onChange={e => setCreateForm(prev => ({ ...prev, status: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
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
                <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim()}><Save size={14} className="mr-1" />创建剧情</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Plot List - Grouped */}
        <div className="md:col-span-1 space-y-3">
          <ScrollArea className="max-h-[70vh]">
            {groupedPlots.map(group => (
              <div key={group.value} className="mb-3">
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  <span className={`text-[11px] font-medium ${group.color}`}>{group.label}</span>
                  <Badge variant="secondary" className="text-[10px] py-0">{group.plots.length}</Badge>
                </div>
                {group.plots.map(plot => {
                  const typeInfo = getTypeInfo(plot.plotType);
                  const statusInfo = getStatusInfo(plot.status);
                  const isSelected = selectedPlot === plot.id;
                  return (
                    <div
                      key={plot.id}
                      onClick={() => setSelectedPlot(isSelected ? null : plot.id)}
                      className={`flex items-start gap-2 p-2.5 rounded-lg transition-colors cursor-pointer mb-1 ${
                        isSelected ? 'bg-amber-500/10 border border-amber-500/25' : 'bg-card/50 border border-border/50 hover:border-border'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground text-sm truncate">{plot.name}</span>
                          <Badge className={`text-[9px] py-0 ${statusInfo.bg} ${statusInfo.color} border-0`}>{statusInfo.label}</Badge>
                        </div>
                        {plot.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{plot.description}</p>}
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleReorder(plot.id, 'up'); }} className="p-0.5 hover:bg-secondary/50 rounded"><ArrowUp size={10} className="text-muted-foreground" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleReorder(plot.id, 'down'); }} className="p-0.5 hover:bg-secondary/50 rounded"><ArrowDown size={10} className="text-muted-foreground" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {filteredPlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">暂无剧情</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Plot Detail */}
        <div className="md:col-span-2">
          {selectedPlotData ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                {editingId === selectedPlotData.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">编辑剧情</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X size={14} /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs text-muted-foreground mb-1">名称</label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="text-sm" /></div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">类型</label>
                        <select value={editForm.plotType} onChange={e => setEditForm(p => ({ ...p, plotType: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                          {PLOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><label className="block text-xs text-muted-foreground mb-1">描述</label><Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="text-sm resize-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs text-muted-foreground mb-1">优先级</label><Input type="number" value={editForm.priority} onChange={e => setEditForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))} className="text-sm" /></div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">状态</label>
                        <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </div>
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
                    <Button size="sm" onClick={() => handleUpdate(selectedPlotData.id)}><Save size={14} className="mr-1" />保存</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{selectedPlotData.name}</h3>
                        <Badge className={`text-[10px] ${getTypeInfo(selectedPlotData.plotType).bg} ${getTypeInfo(selectedPlotData.plotType).color} border-0`}>
                          {getTypeInfo(selectedPlotData.plotType).label}
                        </Badge>
                        <Badge className={`text-[10px] ${getStatusInfo(selectedPlotData.status).bg} ${getStatusInfo(selectedPlotData.status).color} border-0`}>
                          {getStatusInfo(selectedPlotData.status).label}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(selectedPlotData)}><Edit3 size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedPlotData.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    {selectedPlotData.description && (
                      <div><p className="text-xs text-muted-foreground font-medium mb-1">📝 描述</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedPlotData.description}</p></div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>优先级: {selectedPlotData.priority}</span>
                      <span>v{selectedPlotData.version}</span>
                    </div>
                    {/* Status workflow */}
                    <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                      <p className="text-xs font-medium text-amber-400 mb-2">状态流转</p>
                      <div className="flex gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <Button
                            key={key}
                            size="sm"
                            variant={selectedPlotData.status === key ? 'default' : 'outline'}
                            className={`text-xs h-7 ${selectedPlotData.status === key ? cfg.bg + ' ' + cfg.color + ' border-0' : ''}`}
                            onClick={() => handleStatusChange(selectedPlotData.id, key)}
                          >
                            {cfg.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* Tags */}
                    {parsedTags(selectedPlotData.tags).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {parsedTags(selectedPlotData.tags).map((tag: string) => (
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
              选择左侧剧情查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
