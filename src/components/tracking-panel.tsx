'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route, Plus, Trash2, Edit3, Save, X, AlertTriangle, Sparkles } from 'lucide-react';

interface StoryStateEntry {
  id: string;
  chapterId: string;
  type: string;
  data: string;
  createdAt: string;
  chapter?: { id: string; order: number; title: string };
}

interface ForeshadowingEntry {
  id: string;
  chapterId: string;
  content: string;
  expectedResolveChapter: number;
  status: string;
  importance: string;
  chapter?: { id: string; order: number; title: string };
}

interface ChapterInfo {
  id: string;
  order: number;
  title: string;
}

interface TrackingPanelProps {
  projectId: string;
}

const STATE_TYPES = [
  { value: 'character_state', label: '角色状态', emoji: '👤' },
  { value: 'relationship_delta', label: '关系变化', emoji: '🔗' },
  { value: 'foreshadowing', label: '伏笔', emoji: '🧵' },
  { value: 'timeline', label: '时间线', emoji: '⏱️' },
];

const FORESHADOW_STATUSES = [
  { value: 'planted', label: '已埋下', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { value: 'advanced', label: '推进中', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { value: 'resolved', label: '已收束', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { value: 'abandoned', label: '已放弃', color: 'text-muted-foreground', bg: 'bg-secondary' },
];

const IMPORTANCE_LEVELS = [
  { value: 'high', label: '高', color: 'text-red-400' },
  { value: 'medium', label: '中', color: 'text-amber-400' },
  { value: 'low', label: '低', color: 'text-muted-foreground' },
];

export function TrackingPanel({ projectId }: TrackingPanelProps) {
  const [storyStates, setStoryStates] = useState<StoryStateEntry[]>([]);
  const [foreshadowings, setForeshadowings] = useState<ForeshadowingEntry[]>([]);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [activeTab, setActiveTab] = useState('character_state');

  // Create forms
  const [isCreatingState, setIsCreatingState] = useState(false);
  const [stateForm, setStateForm] = useState({ chapterId: '', type: 'character_state', data: '' });
  const [isCreatingForeshadow, setIsCreatingForeshadow] = useState(false);
  const [foreshadowForm, setForeshadowForm] = useState({ chapterId: '', content: '', expectedResolveChapter: 0, importance: 'medium' });
  const [editingForeshadowId, setEditingForeshadowId] = useState<string | null>(null);
  const [editForeshadowForm, setEditForeshadowForm] = useState({ content: '', expectedResolveChapter: 0, status: 'planted', importance: 'medium' });

  const fetchData = useCallback(async () => {
    try {
      const [statesRes, foreshadowRes, chaptersRes] = await Promise.all([
        fetch(`/api/story-states?projectId=${projectId}`),
        fetch(`/api/foreshadowings?projectId=${projectId}`),
        fetch(`/api/chapters?projectId=${projectId}`),
      ]);

      if (statesRes.ok) {
        const data = await statesRes.json();
        setStoryStates(data);
      }
      if (foreshadowRes.ok) {
        const data = await foreshadowRes.json();
        setForeshadowings(data);
      }
      if (chaptersRes.ok) {
        const data = await chaptersRes.json();
        setChapters(data.map((c: { id: string; order: number; title: string }) => ({ id: c.id, order: c.order, title: c.title })));
      }
    } catch (e) {
      console.error('Failed to fetch tracking data:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Story State CRUD
  const handleCreateState = async () => {
    if (!stateForm.chapterId || !stateForm.data.trim()) return;
    try {
      const res = await fetch('/api/story-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...stateForm }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreatingState(false);
        setStateForm({ chapterId: '', type: 'character_state', data: '' });
      }
    } catch (e) {
      console.error('Failed to create story state:', e);
    }
  };

  const handleDeleteState = async (id: string) => {
    try {
      const res = await fetch(`/api/story-states?id=${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error('Failed to delete story state:', e);
    }
  };

  // Foreshadowing CRUD
  const handleCreateForeshadow = async () => {
    if (!foreshadowForm.chapterId || !foreshadowForm.content.trim()) return;
    try {
      const res = await fetch('/api/foreshadowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...foreshadowForm, status: 'planted' }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreatingForeshadow(false);
        setForeshadowForm({ chapterId: '', content: '', expectedResolveChapter: 0, importance: 'medium' });
      }
    } catch (e) {
      console.error('Failed to create foreshadowing:', e);
    }
  };

  const handleUpdateForeshadow = async (id: string) => {
    try {
      const res = await fetch('/api/foreshadowings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForeshadowForm }),
      });
      if (res.ok) {
        await fetchData();
        setEditingForeshadowId(null);
      }
    } catch (e) {
      console.error('Failed to update foreshadowing:', e);
    }
  };

  const handleDeleteForeshadow = async (id: string) => {
    try {
      const res = await fetch(`/api/foreshadowings?id=${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error('Failed to delete foreshadowing:', e);
    }
  };

  const getStatusInfo = (status: string) => FORESHADOW_STATUSES.find(s => s.value === status) || FORESHADOW_STATUSES[0];
  const getImportanceInfo = (importance: string) => IMPORTANCE_LEVELS.find(i => i.value === importance) || IMPORTANCE_LEVELS[1];
  const getTypeInfo = (type: string) => STATE_TYPES.find(t => t.value === type) || STATE_TYPES[0];
  const getChapterTitle = (chapterId: string) => chapters.find(c => c.id === chapterId)?.title || '未知章节';

  // Filter states by active tab
  const filteredStates = storyStates.filter(s => s.type === activeTab);

  // Check overdue foreshadowings
  const overdueForeshadowings = foreshadowings.filter(f => {
    if (f.status === 'resolved' || f.status === 'abandoned') return false;
    const plantChapter = chapters.find(c => c.id === f.chapterId)?.order ?? 0;
    const currentMax = chapters.length > 0 ? Math.max(...chapters.map(c => c.order)) : 0;
    return currentMax - plantChapter > 10;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route size={20} className="text-amber-400" />
          <h2 className="text-lg font-bold text-foreground">故事追踪</h2>
          <Badge variant="secondary" className="text-xs">{storyStates.length} 条记录</Badge>
          <Badge variant="outline" className="text-xs">{foreshadowings.length} 条伏笔</Badge>
        </div>
        <div className="flex items-center gap-2">
          {activeTab !== 'foreshadowing' && (
            <Button size="sm" onClick={() => setIsCreatingState(true)}>
              <Plus size={14} className="mr-1" />
              添加状态
            </Button>
          )}
          {activeTab === 'foreshadowing' && (
            <Button size="sm" onClick={() => setIsCreatingForeshadow(true)}>
              <Plus size={14} className="mr-1" />
              添加伏笔
            </Button>
          )}
        </div>
      </div>

      {/* Overdue Alerts */}
      {overdueForeshadowings.length > 0 && (
        <Card className="bg-amber-400/5 border-amber-400/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">伏笔逾期警告</span>
            </div>
            {overdueForeshadowings.map(f => (
              <div key={f.id} className="text-xs text-foreground/80 mb-1">
                🧵 &quot;{f.content.slice(0, 30)}...&quot; 已超过10章未推进
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="character_state" className="text-xs">👤 角色状态</TabsTrigger>
          <TabsTrigger value="foreshadowing" className="text-xs">🧵 伏笔追踪</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">⏱️ 时间线</TabsTrigger>
          <TabsTrigger value="relationship_delta" className="text-xs">🔗 关系变化</TabsTrigger>
        </TabsList>

        {/* Tab: Character State */}
        <TabsContent value="character_state" className="mt-4">
          {isCreatingState && (
            <Card className="bg-card/50 border-primary/30 mb-3">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">添加角色状态</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingState(false)}><X size={14} /></Button>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">所属章节</label>
                  <select
                    value={stateForm.chapterId}
                    onChange={e => setStateForm(p => ({ ...p, chapterId: e.target.value }))}
                    className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
                  >
                    <option value="">选择章节</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>第{c.order + 1}章: {c.title || '无标题'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">状态数据 (JSON)</label>
                  <Textarea
                    value={stateForm.data}
                    onChange={e => setStateForm(p => ({ ...p, data: e.target.value }))}
                    placeholder='{"character":"主角名","location":"某地","mentalState":"焦虑","arcStage":"转折点","powerLevel":"练气三层"}'
                    rows={5}
                    className="text-sm font-mono resize-none"
                  />
                </div>
                <Button size="sm" onClick={handleCreateState} disabled={!stateForm.chapterId || !stateForm.data.trim()}>
                  <Save size={14} className="mr-1" />保存
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {filteredStates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Route size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无角色状态记录</p>
                <p className="text-xs mt-1">AI生成章节时会自动追踪角色状态变化</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                {filteredStates.map(state => {
                  let parsedData: Record<string, string> = {};
                  try { parsedData = JSON.parse(state.data); } catch { parsedData = { raw: state.data }; }
                  const chapter = chapters.find(c => c.id === state.chapterId);

                  return (
                    <Card key={state.id} className="bg-card/50 border-border/50 mb-2">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              第{chapter ? chapter.order + 1 : '?'}章
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {chapter?.title || '未知'}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteState(state.id)} className="text-muted-foreground hover:text-destructive h-6 w-6 p-0">
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(parsedData).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-muted-foreground">{key}: </span>
                              <span className="text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Tab: Foreshadowing */}
        <TabsContent value="foreshadowing" className="mt-4">
          {isCreatingForeshadow && (
            <Card className="bg-card/50 border-primary/30 mb-3">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">添加伏笔</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingForeshadow(false)}><X size={14} /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">埋设章节</label>
                    <select
                      value={foreshadowForm.chapterId}
                      onChange={e => setForeshadowForm(p => ({ ...p, chapterId: e.target.value }))}
                      className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
                    >
                      <option value="">选择章节</option>
                      {chapters.map(c => <option key={c.id} value={c.id}>第{c.order + 1}章: {c.title || '无标题'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">重要度</label>
                    <select
                      value={foreshadowForm.importance}
                      onChange={e => setForeshadowForm(p => ({ ...p, importance: e.target.value }))}
                      className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
                    >
                      {IMPORTANCE_LEVELS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">伏笔内容</label>
                  <Textarea
                    value={foreshadowForm.content}
                    onChange={e => setForeshadowForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="描述伏笔内容..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">预计收束章节号</label>
                  <Input
                    type="number"
                    value={foreshadowForm.expectedResolveChapter}
                    onChange={e => setForeshadowForm(p => ({ ...p, expectedResolveChapter: parseInt(e.target.value) || 0 }))}
                    className="text-sm"
                    min={1}
                  />
                </div>
                <Button size="sm" onClick={handleCreateForeshadow} disabled={!foreshadowForm.chapterId || !foreshadowForm.content.trim()}>
                  <Save size={14} className="mr-1" />保存伏笔
                </Button>
              </CardContent>
            </Card>
          )}

          {foreshadowings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Route size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无伏笔记录</p>
              <p className="text-xs mt-1">添加伏笔追踪故事的悬念与照应</p>
            </div>
          ) : (
            <div className="space-y-2">
              {foreshadowings.map(f => {
                const statusInfo = getStatusInfo(f.status);
                const importanceInfo = getImportanceInfo(f.importance);
                const chapter = chapters.find(c => c.id === f.chapterId);
                const isOverdue = (() => {
                  if (f.status === 'resolved' || f.status === 'abandoned') return false;
                  const plantOrder = chapter?.order ?? 0;
                  const currentMax = chapters.length > 0 ? Math.max(...chapters.map(c => c.order)) : 0;
                  return currentMax - plantOrder > 10;
                })();

                return (
                  <Card key={f.id} className={`bg-card/50 border-border/50 ${isOverdue ? 'border-amber-400/50' : ''}`}>
                    <CardContent className="p-3">
                      {editingForeshadowId === f.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editForeshadowForm.content}
                            onChange={e => setEditForeshadowForm(p => ({ ...p, content: e.target.value }))}
                            rows={3}
                            className="text-sm resize-none"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">状态</label>
                              <select
                                value={editForeshadowForm.status}
                                onChange={e => setEditForeshadowForm(p => ({ ...p, status: e.target.value }))}
                                className="w-full h-8 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                              >
                                {FORESHADOW_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">重要度</label>
                              <select
                                value={editForeshadowForm.importance}
                                onChange={e => setEditForeshadowForm(p => ({ ...p, importance: e.target.value }))}
                                className="w-full h-8 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                              >
                                {IMPORTANCE_LEVELS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">预计收束</label>
                              <Input
                                type="number"
                                value={editForeshadowForm.expectedResolveChapter}
                                onChange={e => setEditForeshadowForm(p => ({ ...p, expectedResolveChapter: parseInt(e.target.value) || 0 }))}
                                className="text-xs h-8"
                                min={1}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateForeshadow(f.id)}>
                              <Save size={14} className="mr-1" />保存
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingForeshadowId(null)}>取消</Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isOverdue && <AlertTriangle size={14} className="text-amber-400" />}
                              <Badge variant="outline" className="text-xs">第{chapter ? chapter.order + 1 : '?'}章</Badge>
                              <Badge className={`text-xs ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.label}</Badge>
                              <Badge variant="outline" className={`text-xs ${importanceInfo.color}`}>
                                {importanceInfo.label}优先
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingForeshadowId(f.id);
                                setEditForeshadowForm({ content: f.content, expectedResolveChapter: f.expectedResolveChapter, status: f.status, importance: f.importance });
                              }} className="h-6 w-6 p-0">
                                <Edit3 size={12} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteForeshadow(f.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{f.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>埋设: 第{chapter ? chapter.order + 1 : '?'}章</span>
                            <span>预计收束: 第{f.expectedResolveChapter}章</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab: Timeline */}
        <TabsContent value="timeline" className="mt-4">
          {isCreatingState && activeTab === 'timeline' && (
            <Card className="bg-card/50 border-primary/30 mb-3">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">添加时间线事件</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingState(false)}><X size={14} /></Button>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">所属章节</label>
                  <select
                    value={stateForm.chapterId}
                    onChange={e => setStateForm(p => ({ ...p, chapterId: e.target.value }))}
                    className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
                  >
                    <option value="">选择章节</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>第{c.order + 1}章: {c.title || '无标题'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">事件描述</label>
                  <Textarea
                    value={stateForm.data}
                    onChange={e => setStateForm(p => ({ ...p, data: e.target.value }))}
                    placeholder="描述时间线事件..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <Button size="sm" onClick={handleCreateState} disabled={!stateForm.chapterId || !stateForm.data.trim()}>
                  <Save size={14} className="mr-1" />保存
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredStates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Route size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无时间线事件</p>
              <p className="text-xs mt-1">添加时间线事件追踪故事的发展脉络</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4 pl-10">
                {filteredStates.sort((a, b) => {
                  const orderA = chapters.find(c => c.id === a.chapterId)?.order ?? 0;
                  const orderB = chapters.find(c => c.id === b.chapterId)?.order ?? 0;
                  return orderA - orderB;
                }).map(state => {
                  const chapter = chapters.find(c => c.id === state.chapterId);
                  return (
                    <div key={state.id} className="relative">
                      <div className="absolute -left-10 top-1 w-3 h-3 rounded-full bg-primary/50 border-2 border-primary" />
                      <Card className="bg-card/50 border-border/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">第{chapter ? chapter.order + 1 : '?'}章 {chapter?.title || ''}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteState(state.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{state.data}</p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: Relationship Delta */}
        <TabsContent value="relationship_delta" className="mt-4">
          {isCreatingState && activeTab === 'relationship_delta' && (
            <Card className="bg-card/50 border-primary/30 mb-3">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">添加关系变化</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingState(false)}><X size={14} /></Button>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">所属章节</label>
                  <select
                    value={stateForm.chapterId}
                    onChange={e => setStateForm(p => ({ ...p, chapterId: e.target.value }))}
                    className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
                  >
                    <option value="">选择章节</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>第{c.order + 1}章: {c.title || '无标题'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">关系变化描述</label>
                  <Textarea
                    value={stateForm.data}
                    onChange={e => setStateForm(p => ({ ...p, data: e.target.value }))}
                    placeholder='{"from":"角色A","to":"角色B","oldStatus":"盟友","newStatus":"对手","reason":"背叛事件"}'
                    rows={4}
                    className="text-sm font-mono resize-none"
                  />
                </div>
                <Button size="sm" onClick={handleCreateState} disabled={!stateForm.chapterId || !stateForm.data.trim()}>
                  <Save size={14} className="mr-1" />保存
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredStates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Route size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无关系变化记录</p>
              <p className="text-xs mt-1">追踪角色之间关系的发展与转变</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-2">
                {filteredStates.map(state => {
                  let parsedData: Record<string, string> = {};
                  try { parsedData = JSON.parse(state.data); } catch { parsedData = { raw: state.data }; }
                  const chapter = chapters.find(c => c.id === state.chapterId);

                  return (
                    <Card key={state.id} className="bg-card/50 border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">第{chapter ? chapter.order + 1 : '?'}章</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteState(state.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {parsedData.from && parsedData.to && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-foreground font-medium">{parsedData.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-foreground font-medium">{parsedData.to}</span>
                            </div>
                          )}
                          {parsedData.oldStatus && parsedData.newStatus && (
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-muted-foreground">{parsedData.oldStatus}</Badge>
                              <span className="text-muted-foreground">→</span>
                              <Badge className="bg-primary/20 text-primary">{parsedData.newStatus}</Badge>
                            </div>
                          )}
                          {parsedData.reason && (
                            <p className="text-xs text-muted-foreground">原因: {parsedData.reason}</p>
                          )}
                          {parsedData.raw && (
                            <p className="text-sm text-foreground/90">{parsedData.raw}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
