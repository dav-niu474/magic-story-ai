'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { BookOpen, Plus, Trash2, Save, Sparkles, ChevronRight, ChevronDown, Shield, Swords, Loader2, FileText, Zap, Eye, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { AntiAIPanel } from '@/components/anti-ai-panel';
import { AdversarialReviewPanel } from '@/components/adversarial-review';
import { ChapterPreview } from '@/components/chapter-preview';

interface Chapter {
  id: string;
  order: number;
  title: string;
  outlineContent: string;
  content: string;
  summary: string;
  wordCount: number;
  status: string;
  emotionTarget: string;
  emotionArc: string;
  hookStart: string;
  hookEnd: string;
}

interface ChapterEditorProps {
  projectId: string;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: 'text-muted-foreground' },
  { value: 'writing', label: '写作中', color: 'text-amber-400' },
  { value: 'review', label: '审稿中', color: 'text-blue-400' },
  { value: 'completed', label: '已完成', color: 'text-emerald-400' },
];

const EMOTION_TARGETS = [
  { value: '', label: '未设定' },
  { value: '爽快', label: '🔥 爽快' },
  { value: '感动', label: '💧 感动' },
  { value: '紧张', label: '😰 紧张' },
  { value: '期待', label: '✨ 期待' },
  { value: '愤怒', label: '😡 愤怒' },
  { value: '悲伤', label: '😢 悲伤' },
  { value: '惊喜', label: '😮 惊喜' },
  { value: '恐惧', label: '👻 恐惧' },
  { value: '温暖', label: '☀️ 温暖' },
  { value: '震撼', label: '💥 震撼' },
];

const EMOTION_ARCS = [
  { value: '', label: '未设定' },
  { value: 'V型', label: '📉 V型 (低→高)' },
  { value: '倒V型', label: '📈 倒V型 (高→低)' },
  { value: 'W型', label: '📊 W型 (起伏)' },
  { value: '递进', label: '📈 递进 (持续升高)' },
  { value: '延迟满足', label: '⏳ 延迟满足' },
  { value: '突变', label: '⚡ 突变' },
];

const HOOK_TYPES = [
  { value: '', label: '未设定' },
  { value: '悬念', label: '❓ 悬念' },
  { value: '反转', label: '🔄 反转' },
  { value: '冲突', label: '⚔️ 冲突' },
  { value: '揭秘', label: '💡 揭秘' },
  { value: '危机', label: '🚨 危机' },
  { value: '承诺', label: '🤝 承诺' },
  { value: '回忆', label: '💭 回忆' },
  { value: '对比', label: '⚖️ 对比' },
];

export function ChapterEditor({ projectId }: ChapterEditorProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editOutline, setEditOutline] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('draft');
  const [editSummary, setEditSummary] = useState('');
  const [editEmotionTarget, setEditEmotionTarget] = useState('');
  const [editEmotionArc, setEditEmotionArc] = useState('');
  const [editHookStart, setEditHookStart] = useState('');
  const [editHookEnd, setEditHookEnd] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showEmotion, setShowEmotion] = useState(false);
  const [sidePanel, setSidePanel] = useState<'none' | 'preview' | 'antiAi' | 'adversarial'>('preview');
  const [generatingPhase, setGeneratingPhase] = useState<'none' | 'summary' | 'full'>('none');
  const { setActiveAgent, setActiveChapterId } = useAppStore();
  const abortRef = useRef<AbortController | null>(null);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`/api/chapters?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
      }
    } catch (e) {
      console.error('Failed to fetch chapters:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const selectChapter = (chapter: Chapter) => {
    setSelectedId(chapter.id);
    setActiveChapterId(chapter.id);
    setEditContent(chapter.content);
    setEditOutline(chapter.outlineContent);
    setEditTitle(chapter.title);
    setEditStatus(chapter.status);
    setEditSummary(chapter.summary);
    setEditEmotionTarget(chapter.emotionTarget || '');
    setEditEmotionArc(chapter.emotionArc || '');
    setEditHookStart(chapter.hookStart || '');
    setEditHookEnd(chapter.hookEnd || '');
    // 打开章节时自动显示预览面板
    if (sidePanel === 'none') {
      setSidePanel('preview');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, order: chapters.length, title: newTitle || `第${chapters.length + 1}章`, status: 'draft' }),
      });
      if (res.ok) {
        await fetchChapters();
        setIsCreating(false);
        setNewTitle('');
      }
    } catch (e) {
      console.error('Failed to create chapter:', e);
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedId,
          title: editTitle,
          outlineContent: editOutline,
          content: editContent,
          summary: editSummary,
          status: editStatus,
          emotionTarget: editEmotionTarget,
          emotionArc: editEmotionArc,
          hookStart: editHookStart,
          hookEnd: editHookEnd,
        }),
      });
      if (res.ok) {
        await fetchChapters();
      }
    } catch (e) {
      console.error('Failed to save chapter:', e);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/chapters?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchChapters();
        if (selectedId === id) {
          setSelectedId(null);
          setActiveChapterId(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete chapter:', e);
    }
  };

  // Two-phase generation: Phase 1 - Generate Summary
  const handleGenerateSummary = async () => {
    if (!selectedId || !editOutline.trim()) return;
    setGeneratingPhase('summary');
    abortRef.current = new AbortController();

    const emotionPrompt = editEmotionTarget ? `\n情感目标：${editEmotionTarget}` : '';
    const arcPrompt = editEmotionArc ? `\n情感弧线：${editEmotionArc}` : '';
    const hookStartPrompt = editHookStart ? `\n章节开头钩子类型：${editHookStart}` : '';
    const hookEndPrompt = editHookEnd ? `\n章节结尾钩子类型：${editHookEnd}` : '';

    const prompt = `请根据以下章节细纲生成章节摘要（200-300字的情节概要）：

章节标题：${editTitle}
章节细纲：${editOutline}${emotionPrompt}${arcPrompt}${hookStartPrompt}${hookEndPrompt}

要求：
1. 摘要应包含本章核心事件、角色行动、关键对话要点
2. 标注情感高潮点
3. 明确开头和结尾的钩子设计
4. 200-300字

请直接输出摘要内容。`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'writer',
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('Failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setEditSummary(accumulated);
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Failed to generate summary:', e);
      }
    } finally {
      setGeneratingPhase('none');
      abortRef.current = null;
    }
  };

  // Two-phase generation: Phase 2 - Expand to Full Content
  const handleExpandFull = async () => {
    if (!selectedId || !editSummary.trim()) return;
    setGeneratingPhase('full');
    abortRef.current = new AbortController();

    const emotionPrompt = editEmotionTarget ? `\n情感目标：${editEmotionTarget}` : '';
    const arcPrompt = editEmotionArc ? `\n情感弧线：${editEmotionArc}` : '';
    const hookStartPrompt = editHookStart ? `\n章节开头钩子类型：${editHookStart}` : '';
    const hookEndPrompt = editHookEnd ? `\n章节结尾钩子类型：${editHookEnd}` : '';

    const prompt = `请根据以下章节摘要扩展为完整的章节正文：

章节标题：${editTitle}
章节细纲：${editOutline}
章节摘要：${editSummary}${emotionPrompt}${arcPrompt}${hookStartPrompt}${hookEndPrompt}

要求：
1. 严格遵循摘要中的情节发展
2. 场景描写生动，五感交融
3. 对话推动情节，体现角色个性
4. 章末设钩子，保持阅读欲望
5. 2000-4000字
6. ${editEmotionTarget ? `确保整体情感基调为"${editEmotionTarget}"` : ''}
7. ${editHookStart ? `章节开头使用"${editHookStart}"类型钩子` : ''}
8. ${editHookEnd ? `章节结尾使用"${editHookEnd}"类型钩子` : ''}

请直接输出小说正文内容。`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'writer',
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('Failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setEditContent(accumulated);
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Failed to expand content:', e);
      }
    } finally {
      setGeneratingPhase('none');
      abortRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setGeneratingPhase('none');
  };

  const getStatusInfo = (status: string) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const selectedChapter = chapters.find(c => c.id === selectedId);

  const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const completedCount = chapters.filter(c => c.status === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-400" />
          <h2 className="text-lg font-bold text-foreground">章节创作</h2>
          <Badge variant="secondary" className="text-xs">{chapters.length} 章</Badge>
          <Badge variant="outline" className="text-xs">{totalWords.toLocaleString()} 字</Badge>
          <Badge variant="outline" className="text-xs text-emerald-400">{completedCount}/{chapters.length} 完成</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={sidePanel === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSidePanel(sidePanel === 'preview' ? 'none' : 'preview')}
            className={sidePanel === 'preview' ? 'text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 border-cyan-400/30' : 'text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10'}
            title="实时预览"
          >
            <Eye size={14} className="mr-1" />
            预览
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAgent('writer')}
            className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
          >
            <Sparkles size={14} className="mr-1" />
            AI写作
          </Button>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={14} className="mr-1" />
            新增章节
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-card/50 border-primary/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="章节标题..."
              className="text-sm flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleCreate}>
              <Plus size={14} className="mr-1" />创建
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
              ✕
            </Button>
          </CardContent>
        </Card>
      )}

      <div className={`grid gap-4 ${sidePanel !== 'none' ? 'md:grid-cols-6' : 'md:grid-cols-4'}`} style={{ minHeight: '65vh' }}>
        {/* Chapter List */}
        <div className="md:col-span-1">
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-1">
              {chapters.map(chapter => {
                const statusInfo = getStatusInfo(chapter.status);
                const isSelected = selectedId === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => selectChapter(chapter)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-primary/15 border border-primary/30'
                        : 'bg-card/50 border border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">第{chapter.order + 1}章</span>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${chapter.status === 'completed' ? 'bg-emerald-400' : chapter.status === 'writing' ? 'bg-amber-400' : 'bg-muted-foreground/30'}`} />
                        <button onClick={e => { e.stopPropagation(); handleDelete(chapter.id); }} className="text-muted-foreground/30 hover:text-destructive ml-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate mt-0.5">{chapter.title || `第${chapter.order + 1}章`}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted-foreground">{chapter.wordCount} 字</span>
                      {chapter.emotionTarget && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{chapter.emotionTarget}</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
              {chapters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">暂无章节</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chapter Editor */}
        <div className={sidePanel !== 'none' ? 'md:col-span-3' : 'md:col-span-3'}>
          {selectedChapter ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="text-sm font-medium border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      placeholder="章节标题"
                    />
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className="h-7 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <Badge variant="outline" className="text-xs shrink-0">{editContent.length} 字</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidePanel(sidePanel === 'preview' ? 'none' : 'preview')}
                      className={`text-cyan-400 hover:bg-cyan-400/10 ${sidePanel === 'preview' ? 'bg-cyan-400/10' : ''}`}
                      title="实时预览"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidePanel(sidePanel === 'antiAi' ? 'none' : 'antiAi')}
                      className={`text-rose-400 hover:bg-rose-400/10 ${sidePanel === 'antiAi' ? 'bg-rose-400/10' : ''}`}
                      title="去AI味分析"
                    >
                      <Shield size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidePanel(sidePanel === 'adversarial' ? 'none' : 'adversarial')}
                      className={`text-purple-400 hover:bg-purple-400/10 ${sidePanel === 'adversarial' ? 'bg-purple-400/10' : ''}`}
                      title="对抗评审"
                    >
                      <Swords size={14} />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      <Save size={14} className="mr-1" />
                      {isSaving ? '...' : '保存'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Emotion Settings */}
                <div>
                  <button
                    onClick={() => setShowEmotion(!showEmotion)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
                  >
                    {showEmotion ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    情感设定
                    {editEmotionTarget && <Badge variant="outline" className="text-[9px] ml-1">{editEmotionTarget}</Badge>}
                    {editEmotionArc && <Badge variant="outline" className="text-[9px] ml-1">{editEmotionArc}</Badge>}
                  </button>
                  {showEmotion && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-secondary/30 rounded-lg">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">情感目标</label>
                        <select
                          value={editEmotionTarget}
                          onChange={e => setEditEmotionTarget(e.target.value)}
                          className="w-full h-7 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                        >
                          {EMOTION_TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">情感弧线</label>
                        <select
                          value={editEmotionArc}
                          onChange={e => setEditEmotionArc(e.target.value)}
                          className="w-full h-7 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                        >
                          {EMOTION_ARCS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">开头钩子</label>
                        <select
                          value={editHookStart}
                          onChange={e => setEditHookStart(e.target.value)}
                          className="w-full h-7 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                        >
                          {HOOK_TYPES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">结尾钩子</label>
                        <select
                          value={editHookEnd}
                          onChange={e => setEditHookEnd(e.target.value)}
                          className="w-full h-7 px-2 bg-secondary border border-input rounded text-xs text-foreground focus:outline-none"
                        >
                          {HOOK_TYPES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chapter Outline */}
                <div>
                  <button
                    onClick={() => setShowOutline(!showOutline)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
                  >
                    {showOutline ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    章节细纲
                  </button>
                  {showOutline && (
                    <Textarea
                      value={editOutline}
                      onChange={e => setEditOutline(e.target.value)}
                      placeholder="本章细纲/情节要点..."
                      rows={3}
                      className="text-sm resize-none bg-secondary/30"
                    />
                  )}
                </div>

                {/* Two-Phase Generation Controls */}
                <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    {/* Phase 1: Generate Summary */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generatingPhase === 'none' ? handleGenerateSummary : handleStopGeneration}
                      disabled={generatingPhase === 'full'}
                      className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10 text-xs"
                    >
                      {generatingPhase === 'summary' ? (
                        <><Loader2 size={12} className="mr-1 animate-spin" />生成中...</>
                      ) : (
                        <><FileText size={12} className="mr-1" />AI生成摘要</>
                      )}
                    </Button>

                    <div className="flex items-center">
                      <div className={`w-6 h-0.5 ${editSummary ? 'bg-emerald-400' : 'bg-border'}`} />
                      <ChevronRight size={12} className={editSummary ? 'text-emerald-400' : 'text-border'} />
                    </div>

                    {/* Phase 2: Expand to Full */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generatingPhase === 'none' ? handleExpandFull : handleStopGeneration}
                      disabled={generatingPhase === 'summary' || !editSummary.trim()}
                      className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10 text-xs"
                    >
                      {generatingPhase === 'full' ? (
                        <><Loader2 size={12} className="mr-1 animate-spin" />展开中...</>
                      ) : (
                        <><Zap size={12} className="mr-1" />展开全文</>
                      )}
                    </Button>
                  </div>

                  {/* Progress indicator */}
                  {generatingPhase !== 'none' && (
                    <Badge variant="outline" className="text-xs text-primary">
                      {generatingPhase === 'summary' ? 'Phase 1/2: 生成摘要' : 'Phase 2/2: 展开全文'}
                    </Badge>
                  )}
                </div>

                {/* Summary Preview */}
                {editSummary && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">📝 章节摘要</span>
                      <Badge variant="outline" className="text-[9px]">{editSummary.length}字</Badge>
                    </div>
                    <Textarea
                      value={editSummary}
                      onChange={e => setEditSummary(e.target.value)}
                      placeholder="章节摘要..."
                      rows={3}
                      className="text-sm resize-none bg-amber-400/5 border-amber-400/20"
                    />
                  </div>
                )}

                {/* Chapter Content */}
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="开始写作本章内容..."
                  rows={18}
                  className="text-sm leading-relaxed resize-none min-h-[350px]"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <BookOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm">选择左侧章节开始编辑</p>
              <p className="text-xs mt-1">或创建新章节开始创作</p>
            </div>
          )}
        </div>

        {/* Side Panel (Preview / Anti-AI / Adversarial Review) */}
        {sidePanel !== 'none' && selectedChapter && (
          <div className="md:col-span-2 min-h-0">
            <Card className="bg-card/50 border-border/50 h-full flex flex-col overflow-hidden">
              {sidePanel === 'preview' && (
                <ChapterPreview
                  title={editTitle}
                  content={editContent}
                  summary={editSummary}
                  emotionTarget={editEmotionTarget}
                  emotionArc={editEmotionArc}
                  wordCount={editContent.length}
                />
              )}
              {sidePanel === 'antiAi' && (
                <AntiAIPanel
                  content={editContent}
                  onApplyFix={(fixedContent) => {
                    setEditContent(fixedContent);
                  }}
                />
              )}
              {sidePanel === 'adversarial' && (
                <AdversarialReviewPanel
                  content={editContent}
                  chapterTitle={editTitle}
                />
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
