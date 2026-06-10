'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2, Edit3, Save, X, Star, Sparkles,
  Search, Tag, Image as ImageIcon, Loader2, Link2, Heart,
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  age: string;
  role: string;
  personality: string;
  appearance: string;
  background: string;
  arc: string;
  portraitUrl: string;
  portraitPrompt: string;
  tags: string;
  isFavorite: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  fromRelations?: { id: string; type: string; toCharacter: { name: string } }[];
  toRelations?: { id: string; type: string; fromCharacter: { name: string } }[];
}

interface CharacterAssetsProps {
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

const EMPTY_FORM = {
  name: '', age: '', role: '主角', personality: '', appearance: '',
  background: '', arc: '', portraitPrompt: '', tags: [] as string[],
};

export function CharacterAssets({ projectId }: CharacterAssetsProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [tagInput, setTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [generatingPortrait, setGeneratingPortrait] = useState(false);
  const [portraitGenCharId, setPortraitGenCharId] = useState<string | null>(null);
  const [portraitStylePrompt, setPortraitStylePrompt] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/characters?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
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
        body: JSON.stringify({ projectId, ...createForm, tags: createForm.tags }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreating(false);
        setCreateForm(EMPTY_FORM);
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
        body: JSON.stringify({ id, ...editForm, tags: editForm.tags }),
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

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      await fetch('/api/characters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFavorite: !current }),
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  const handleGeneratePortrait = async (charId: string, charName: string, appearance: string, stylePrompt: string) => {
    setGeneratingPortrait(true);
    setPortraitGenCharId(charId);
    try {
      const prompt = `Character portrait of ${charName}: ${appearance}`;
      const res = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: stylePrompt || 'fantasy art' }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetch('/api/characters', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: charId, portraitUrl: data.image, portraitPrompt: stylePrompt }),
        });
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to generate portrait:', e);
    } finally {
      setGeneratingPortrait(false);
      setPortraitGenCharId(null);
    }
  };

  const addTag = (tag: string, isEdit: boolean) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (isEdit) {
      if (!editForm.tags.includes(trimmed)) {
        setEditForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      }
      setEditTagInput('');
    } else {
      if (!createForm.tags.includes(trimmed)) {
        setCreateForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      }
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

  const startEdit = (char: Character) => {
    setEditingId(char.id);
    const parsedTags = (() => { try { return JSON.parse(char.tags || '[]'); } catch { return []; } })();
    setEditForm({
      name: char.name, age: char.age, role: char.role, personality: char.personality,
      appearance: char.appearance, background: char.background, arc: char.arc,
      portraitPrompt: char.portraitPrompt || '', tags: parsedTags,
    });
  };

  const getRoleInfo = (role: string) => ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[3];

  const filteredCharacters = characters.filter(c => {
    const matchesSearch = !searchQuery || c.name.includes(searchQuery) || c.personality?.includes(searchQuery);
    const matchesRole = filterRole === 'all' || c.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const selectedCharacter = characters.find(c => c.id === selectedChar);
  const parsedTags = (tagsStr: string) => { try { return JSON.parse(tagsStr || '[]'); } catch { return []; } };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-rose-400" />
          <h2 className="text-lg font-bold text-foreground">角色资产</h2>
          <Badge variant="secondary" className="text-xs">{characters.length} 个角色</Badge>
        </div>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus size={14} className="mr-1" />
          添加角色
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索角色..."
            className="pl-8 text-sm h-8"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="h-8 px-2 bg-secondary border border-input rounded-md text-xs text-foreground focus:outline-none"
        >
          <option value="all">全部角色</option>
          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="bg-card/50 border-rose-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">新建角色</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setCreateForm(EMPTY_FORM); }}><X size={14} /></Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-muted-foreground mb-1">姓名</label><Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="角色名" className="text-sm" /></div>
                  <div><label className="block text-xs text-muted-foreground mb-1">年龄</label><Input value={createForm.age} onChange={e => setCreateForm(prev => ({ ...prev, age: e.target.value }))} placeholder="年龄" className="text-sm" /></div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">角色定位</label>
                    <select value={createForm.role} onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value }))} className="w-full h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none">
                      {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-xs text-muted-foreground mb-1">性格特征</label><Input value={createForm.personality} onChange={e => setCreateForm(prev => ({ ...prev, personality: e.target.value }))} placeholder="性格描述..." className="text-sm" /></div>
                <div><label className="block text-xs text-muted-foreground mb-1">外貌描写</label><Input value={createForm.appearance} onChange={e => setCreateForm(prev => ({ ...prev, appearance: e.target.value }))} placeholder="外貌描述..." className="text-sm" /></div>
                <div><label className="block text-xs text-muted-foreground mb-1">背景故事</label><Textarea value={createForm.background} onChange={e => setCreateForm(prev => ({ ...prev, background: e.target.value }))} placeholder="角色背景..." rows={2} className="text-sm resize-none" /></div>
                <div><label className="block text-xs text-muted-foreground mb-1">成长弧线</label><Textarea value={createForm.arc} onChange={e => setCreateForm(prev => ({ ...prev, arc: e.target.value }))} placeholder="角色成长轨迹..." rows={2} className="text-sm resize-none" /></div>
                {/* Tags */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">标签</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {createForm.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] gap-1 pr-1">
                        {tag}
                        <button onClick={() => removeTag(tag, false)} className="hover:text-destructive"><X size={10} /></button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="添加标签..." className="text-xs h-7" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput, false))} />
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => addTag(tagInput, false)}><Tag size={12} /></Button>
                  </div>
                </div>
                <Button size="sm" onClick={handleCreate} disabled={!createForm.name.trim()}>
                  <Save size={14} className="mr-1" />创建角色
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Character List */}
        <div className="md:col-span-1 space-y-1">
          <ScrollArea className="max-h-[70vh]">
            {/* Favorites first */}
            {filteredCharacters.filter(c => c.isFavorite).map(char => (
              <CharacterListItem
                key={char.id}
                char={char}
                isSelected={selectedChar === char.id}
                onSelect={() => setSelectedChar(selectedChar === char.id ? null : char.id)}
                onToggleFavorite={() => toggleFavorite(char.id, char.isFavorite)}
                getRoleInfo={getRoleInfo}
                parsedTags={parsedTags}
              />
            ))}
            {filteredCharacters.filter(c => !c.isFavorite).map(char => (
              <CharacterListItem
                key={char.id}
                char={char}
                isSelected={selectedChar === char.id}
                onSelect={() => setSelectedChar(selectedChar === char.id ? null : char.id)}
                onToggleFavorite={() => toggleFavorite(char.id, char.isFavorite)}
                getRoleInfo={getRoleInfo}
                parsedTags={parsedTags}
              />
            ))}
            {filteredCharacters.length === 0 && (
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
                    {/* Portrait */}
                    {selectedCharacter.portraitUrl ? (
                      <img src={selectedCharacter.portraitUrl} alt={selectedCharacter.name} className="w-10 h-10 rounded-full object-cover border border-rose-500/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-sm font-bold">
                        {selectedCharacter.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {editingId === selectedCharacter.id ? editForm.name : selectedCharacter.name}
                        </CardTitle>
                        <Badge variant="outline" className={`text-[10px] ${getRoleInfo(selectedCharacter.role).color}`}>
                          {selectedCharacter.role}
                        </Badge>
                        {selectedCharacter.isFavorite && <Heart size={12} className="text-rose-400 fill-rose-400" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {selectedCharacter.age && <span className="text-xs text-muted-foreground">{selectedCharacter.age}岁</span>}
                        <span className="text-[10px] text-muted-foreground">v{selectedCharacter.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {editingId === selectedCharacter.id ? (
                      <>
                        <Button size="sm" onClick={() => handleUpdate(selectedCharacter.id)}><Save size={14} className="mr-1" />保存</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => toggleFavorite(selectedCharacter.id, selectedCharacter.isFavorite)}>
                          <Heart size={14} className={selectedCharacter.isFavorite ? 'text-rose-400 fill-rose-400' : ''} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(selectedCharacter)}><Edit3 size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedCharacter.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></Button>
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
                    {/* Edit Tags */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">标签</label>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {editForm.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[10px] gap-1 pr-1">
                            {tag}
                            <button onClick={() => removeTag(tag, true)} className="hover:text-destructive"><X size={10} /></button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input value={editTagInput} onChange={e => setEditTagInput(e.target.value)} placeholder="添加标签..." className="text-xs h-7" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(editTagInput, true))} />
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => addTag(editTagInput, true)}><Tag size={12} /></Button>
                      </div>
                    </div>
                    {/* Portrait style prompt */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">风格提示词</label>
                      <Input value={editForm.portraitPrompt} onChange={e => setEditForm(p => ({ ...p, portraitPrompt: e.target.value }))} placeholder="如: 水墨风, 赛博朋克..." className="text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Portrait */}
                    {selectedCharacter.portraitUrl && (
                      <div className="flex justify-center mb-2">
                        <img src={selectedCharacter.portraitUrl} alt={selectedCharacter.name} className="w-32 h-32 rounded-xl object-cover border-2 border-rose-500/30 shadow-lg" />
                      </div>
                    )}
                    {/* AI Portrait Generation */}
                    <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-rose-400" />
                        <span className="text-xs font-medium text-rose-400">AI 肖像生成</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={portraitStylePrompt || selectedCharacter.portraitPrompt}
                          onChange={e => setPortraitStylePrompt(e.target.value)}
                          placeholder="风格提示词 (如: 水墨风, 二次元...)"
                          className="text-xs h-8 flex-1"
                        />
                        <Button
                          size="sm"
                          className="h-8 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-0"
                          disabled={generatingPortrait && portraitGenCharId === selectedCharacter.id}
                          onClick={() => handleGeneratePortrait(selectedCharacter.id, selectedCharacter.name, selectedCharacter.appearance, portraitStylePrompt || selectedCharacter.portraitPrompt)}
                        >
                          {generatingPortrait && portraitGenCharId === selectedCharacter.id ? (
                            <><Loader2 size={12} className="mr-1 animate-spin" />生成中</>
                          ) : (
                            <><ImageIcon size={12} className="mr-1" />生成</>
                          )}
                        </Button>
                      </div>
                    </div>

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
                    {/* Tags */}
                    {parsedTags(selectedCharacter.tags).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {parsedTags(selectedCharacter.tags).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    {/* Relationships */}
                    {selectedCharacter.fromRelations && selectedCharacter.toRelations && 
                      [...selectedCharacter.fromRelations, ...selectedCharacter.toRelations].length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-2">🔗 人物关系</p>
                        <div className="space-y-1">
                          {selectedCharacter.fromRelations.map(rel => (
                            <div key={rel.id} className="flex items-center gap-2 text-xs bg-secondary/50 px-2 py-1.5 rounded">
                              <span className="text-foreground">{selectedCharacter.name}</span>
                              <span className="text-muted-foreground">→</span>
                              <Badge variant="outline" className="text-[10px]">{rel.type}</Badge>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-foreground">{rel.toCharacter.name}</span>
                            </div>
                          ))}
                          {selectedCharacter.toRelations.map(rel => (
                            <div key={rel.id} className="flex items-center gap-2 text-xs bg-secondary/50 px-2 py-1.5 rounded">
                              <span className="text-foreground">{rel.fromCharacter.name}</span>
                              <span className="text-muted-foreground">→</span>
                              <Badge variant="outline" className="text-[10px]">{rel.type}</Badge>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-foreground">{selectedCharacter.name}</span>
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

function CharacterListItem({
  char, isSelected, onSelect, onToggleFavorite, getRoleInfo, parsedTags,
}: {
  char: Character;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  getRoleInfo: (role: string) => { color: string };
  parsedTags: (tags: string) => string[];
}) {
  const roleInfo = getRoleInfo(char.role);
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors cursor-pointer ${
        isSelected ? 'bg-rose-500/10 border border-rose-500/25' : 'bg-card/50 border border-border/50 hover:border-border'
      }`}
    >
      {char.portraitUrl ? (
        <img src={char.portraitUrl} alt={char.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 text-xs font-bold shrink-0">
          {char.name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground text-sm truncate">{char.name}</span>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${roleInfo.color}`}>{char.role}</Badge>
        </div>
        {char.personality && <p className="text-xs text-muted-foreground mt-0.5 truncate">{char.personality}</p>}
        {parsedTags(char.tags).length > 0 && (
          <div className="flex gap-1 mt-1 overflow-hidden">
            {parsedTags(char.tags).slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[9px] py-0">{tag}</Badge>
            ))}
            {parsedTags(char.tags).length > 2 && <span className="text-[9px] text-muted-foreground">+{parsedTags(char.tags).length - 2}</span>}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="shrink-0 p-1 hover:bg-secondary/50 rounded"
      >
        <Star size={12} className={char.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
      </button>
    </div>
  );
}
