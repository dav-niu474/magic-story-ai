'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { Users, Plus, Trash2, Edit3, Save, X, Sparkles, Link2 } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  age: string;
  role: string;
  personality: string;
  appearance: string;
  background: string;
  arc: string;
  fromRelations?: { id: string; type: string; toCharacter: { name: string } }[];
  toRelations?: { id: string; type: string; fromCharacter: { name: string } }[];
}

interface Relationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: string;
  description: string;
  fromCharacter: { name: string };
  toCharacter: { name: string };
}

interface CharacterManagerProps {
  projectId: string;
}

const ROLE_OPTIONS = [
  { value: '主角', label: '主角', color: 'text-amber-400' },
  { value: '女主', label: '女主', color: 'text-rose-400' },
  { value: '反派', label: '反派', color: 'text-red-400' },
  { value: '配角', label: '配角', color: 'text-blue-400' },
  { value: '导师', label: '导师', color: 'text-teal-400' },
  { value: '路人', label: '路人', color: 'text-muted-foreground' },
];

const RELATION_TYPES = ['盟友', '恋人', '师徒', '父子', '母女', '兄弟', '姐妹', '仇敌', '对手', '暗恋', '上下级', '同门', '契约'];

export function CharacterManager({ projectId }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', age: '', role: '主角', personality: '', appearance: '', background: '', arc: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', age: '', role: '', personality: '', appearance: '', background: '', arc: '' });
  const [showRelForm, setShowRelForm] = useState(false);
  const [relForm, setRelForm] = useState({ fromId: '', toId: '', type: '盟友', description: '' });
  const { setActiveAgent } = useAppStore();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/characters?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
        setRelationships(data.relationships || []);
      }
    } catch (e) {
      console.error('Failed to fetch characters:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, ...createForm }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreating(false);
        setCreateForm({ name: '', age: '', role: '主角', personality: '', appearance: '', background: '', arc: '' });
      }
    } catch (e) {
      console.error('Failed to create character:', e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch('/api/characters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        await fetchData();
        setEditingId(null);
      }
    } catch (e) {
      console.error('Failed to update character:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        if (selectedChar === id) setSelectedChar(null);
      }
    } catch (e) {
      console.error('Failed to delete character:', e);
    }
  };

  const handleCreateRel = async () => {
    if (!relForm.fromId || !relForm.toId) return;
    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, fromCharacterId: relForm.fromId, toCharacterId: relForm.toId, type: relForm.type, description: relForm.description }),
      });
      if (res.ok) {
        await fetchData();
        setShowRelForm(false);
        setRelForm({ fromId: '', toId: '', type: '盟友', description: '' });
      }
    } catch (e) {
      console.error('Failed to create relationship:', e);
    }
  };

  const handleDeleteRel = async (id: string) => {
    try {
      const res = await fetch(`/api/relationships?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to delete relationship:', e);
    }
  };

  const startEdit = (char: Character) => {
    setEditingId(char.id);
    setEditForm({ name: char.name, age: char.age, role: char.role, personality: char.personality, appearance: char.appearance, background: char.background, arc: char.arc });
  };

  const getRoleInfo = (role: string) => ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[3];

  const selectedCharacter = characters.find(c => c.id === selectedChar);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-rose-400" />
          <h2 className="text-lg font-bold text-foreground">角色管理</h2>
          <Badge variant="secondary" className="text-xs">{characters.length} 个角色</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAgent('character')}
            className="text-rose-400 border-rose-400/30 hover:bg-rose-400/10"
          >
            <Sparkles size={14} className="mr-1" />
            AI设计
          </Button>
          <Button size="sm" onClick={() => setShowRelForm(true)} variant="outline">
            <Link2 size={14} className="mr-1" />
            添加关系
          </Button>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={14} className="mr-1" />
            添加角色
          </Button>
        </div>
      </div>

      {/* Relationship Form */}
      {showRelForm && (
        <Card className="bg-card/50 border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">添加角色关系</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowRelForm(false)}><X size={14} /></Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={relForm.fromId} onChange={e => setRelForm(prev => ({ ...prev, fromId: e.target.value }))} className="h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                <option value="">选择角色A</option>
                {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={relForm.type} onChange={e => setRelForm(prev => ({ ...prev, type: e.target.value }))} className="h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                {RELATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={relForm.toId} onChange={e => setRelForm(prev => ({ ...prev, toId: e.target.value }))} className="h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                <option value="">选择角色B</option>
                {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input value={relForm.description} onChange={e => setRelForm(prev => ({ ...prev, description: e.target.value }))} placeholder="关系描述..." className="text-sm" />
            <Button size="sm" onClick={handleCreateRel} disabled={!relForm.fromId || !relForm.toId}>
              <Save size={14} className="mr-1" />保存关系
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-card/50 border-primary/30 glow-amber">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">新建角色</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}><X size={14} /></Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">姓名</label>
                <Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="角色名" className="text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">年龄</label>
                <Input value={createForm.age} onChange={e => setCreateForm(prev => ({ ...prev, age: e.target.value }))} placeholder="年龄" className="text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">角色定位</label>
                <select value={createForm.role} onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">性格特征</label>
              <Input value={createForm.personality} onChange={e => setCreateForm(prev => ({ ...prev, personality: e.target.value }))} placeholder="性格描述..." className="text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">外貌描写</label>
              <Input value={createForm.appearance} onChange={e => setCreateForm(prev => ({ ...prev, appearance: e.target.value }))} placeholder="外貌描述..." className="text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">背景故事</label>
              <Textarea value={createForm.background} onChange={e => setCreateForm(prev => ({ ...prev, background: e.target.value }))} placeholder="角色背景..." rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">成长弧线</label>
              <Textarea value={createForm.arc} onChange={e => setCreateForm(prev => ({ ...prev, arc: e.target.value }))} placeholder="角色成长轨迹..." rows={2} className="text-sm resize-none" />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim()}>
              <Save size={14} className="mr-1" />创建角色
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Character List */}
        <div className="md:col-span-1 space-y-2">
          <ScrollArea className="max-h-[60vh]">
            {characters.map(char => {
              const roleInfo = getRoleInfo(char.role);
              const isSelected = selectedChar === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(isSelected ? null : char.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
                    isSelected ? 'bg-primary/15 border border-primary/30' : 'bg-card/50 border border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{char.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${roleInfo.color}`}>{char.role}</Badge>
                  </div>
                  {char.personality && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{char.personality}</p>
                  )}
                </button>
              );
            })}
            {characters.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">暂无角色</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Character Detail */}
        <div className="md:col-span-2">
          {selectedCharacter ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{editingId === selectedCharacter.id ? editForm.name : selectedCharacter.name}</CardTitle>
                    <Badge variant="outline" className={`text-xs ${getRoleInfo(selectedCharacter.role).color}`}>
                      {selectedCharacter.role}
                    </Badge>
                    {selectedCharacter.age && (
                      <span className="text-xs text-muted-foreground">{selectedCharacter.age}岁</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editingId === selectedCharacter.id ? (
                      <>
                        <Button size="sm" onClick={() => handleUpdate(selectedCharacter.id)}>
                          <Save size={14} className="mr-1" />保存
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(selectedCharacter)}>
                          <Edit3 size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedCharacter.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === selectedCharacter.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs text-muted-foreground mb-1">姓名</label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="text-sm" /></div>
                      <div><label className="block text-xs text-muted-foreground mb-1">年龄</label><Input value={editForm.age} onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))} className="text-sm" /></div>
                    </div>
                    <div><label className="block text-xs text-muted-foreground mb-1">性格</label><Input value={editForm.personality} onChange={e => setEditForm(p => ({ ...p, personality: e.target.value }))} className="text-sm" /></div>
                    <div><label className="block text-xs text-muted-foreground mb-1">外貌</label><Input value={editForm.appearance} onChange={e => setEditForm(p => ({ ...p, appearance: e.target.value }))} className="text-sm" /></div>
                    <div><label className="block text-xs text-muted-foreground mb-1">背景</label><Textarea value={editForm.background} onChange={e => setEditForm(p => ({ ...p, background: e.target.value }))} rows={3} className="text-sm resize-none" /></div>
                    <div><label className="block text-xs text-muted-foreground mb-1">成长弧线</label><Textarea value={editForm.arc} onChange={e => setEditForm(p => ({ ...p, arc: e.target.value }))} rows={2} className="text-sm resize-none" /></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCharacter.personality && (
                      <div><p className="text-xs text-muted-foreground font-medium mb-1">🧠 性格</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedCharacter.personality}</p></div>
                    )}
                    {selectedCharacter.appearance && (
                      <div><p className="text-xs text-muted-foreground font-medium mb-1">👤 外貌</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedCharacter.appearance}</p></div>
                    )}
                    {selectedCharacter.background && (
                      <div><p className="text-xs text-muted-foreground font-medium mb-1">📖 背景</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedCharacter.background}</p></div>
                    )}
                    {selectedCharacter.arc && (
                      <div><p className="text-xs text-muted-foreground font-medium mb-1">📈 成长弧线</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedCharacter.arc}</p></div>
                    )}
                    {/* Relationships */}
                    {relationships.filter(r => r.fromCharacterId === selectedCharacter.id || r.toCharacterId === selectedCharacter.id).length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-2">🔗 人物关系</p>
                        <div className="space-y-1">
                          {relationships.filter(r => r.fromCharacterId === selectedCharacter.id || r.toCharacterId === selectedCharacter.id).map(rel => (
                            <div key={rel.id} className="flex items-center gap-2 text-xs bg-secondary/50 px-2 py-1.5 rounded">
                              <span className="text-foreground">{rel.fromCharacter.name}</span>
                              <span className="text-muted-foreground">→</span>
                              <Badge variant="outline" className="text-[10px]">{rel.type}</Badge>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-foreground">{rel.toCharacter.name}</span>
                              {rel.description && <span className="text-muted-foreground ml-1">({rel.description})</span>}
                              <button onClick={() => handleDeleteRel(rel.id)} className="ml-auto text-muted-foreground hover:text-destructive"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              选择左侧角色查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
