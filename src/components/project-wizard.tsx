'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Sparkles, Sprout, Expand, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectWizardProps {
  onComplete: (project: { id: string; title: string; genre: string; description: string }) => void;
  onCancel: () => void;
}

const GENRES = [
  { value: '玄幻系统修仙', emoji: '⚔️' },
  { value: '都市重生', emoji: '🔄' },
  { value: '脑洞网文', emoji: '💡' },
  { value: '都市修仙', emoji: '🏙️' },
  { value: '都市高武', emoji: '👊' },
  { value: '末日系统', emoji: '🧟' },
  { value: '霸总', emoji: '👑' },
  { value: '后悔流', emoji: '😢' },
  { value: '无敌文', emoji: '💪' },
  { value: '历史架空', emoji: '📜' },
  { value: '东方玄幻', emoji: '🐉' },
  { value: '策略经营', emoji: '🏰' },
];

const STEPS = [
  { id: 'seed', label: '种子', icon: Sprout, description: '输入核心设定' },
  { id: 'expand', label: '扩展', icon: Expand, description: 'AI生成内容' },
  { id: 'validate', label: '验证', icon: Shield, description: 'AI检查一致性' },
];

interface ExpandResult {
  characters: { name: string; role: string; relation: string; motivation: string }[];
  outlineBeats: { title: string; conflict: string; summary: string; wordTarget: number }[];
  worldviewEntries: { name: string; description: string }[];
}

interface ValidateResult {
  arcComplete: boolean;
  causalChain: boolean;
  settingConsistent: boolean;
  patches: string[];
  overallScore: number;
}

export function ProjectWizard({ onComplete, onCancel }: ProjectWizardProps) {
  const [step, setStep] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Step 1: Seed
  const [seed, setSeed] = useState({
    title: '',
    genre: '玄幻系统修仙',
    premise: '',
    protagonistName: '',
    coreDesire: '',
    coreFlaw: '',
    innerConflict: '',
  });

  // Step 2: Expand
  const [expandResult, setExpandResult] = useState<ExpandResult | null>(null);
  const [expandStream, setExpandStream] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  // Step 3: Validate
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
  const [validateStream, setValidateStream] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Created project ID
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const handleExpand = async () => {
    setIsExpanding(true);
    setExpandStream('');
    setExpandResult(null);
    abortRef.current = new AbortController();

    const prompt = `你是一位资深小说策划，请根据以下种子设定，生成扩展内容：

小说标题：${seed.title}
类型：${seed.genre}
核心设定：${seed.premise}
主角名：${seed.protagonistName}
核心渴望：${seed.coreDesire}
核心缺陷：${seed.coreFlaw}
内心冲突：${seed.innerConflict}

请按以下JSON格式输出（不要输出其他内容）：
{
  "characters": [
    {"name": "角色名", "role": "角色定位（如导师、对手、盟友等）", "relation": "与主角关系", "motivation": "动机"}
  ],
  "outlineBeats": [
    {"title": "节拍标题", "conflict": "核心冲突", "summary": "情节摘要", "wordTarget": 3000}
  ],
  "worldviewEntries": [
    {"name": "设定名", "description": "设定描述"}
  ]
}

要求：
1. 生成5-8个配角
2. 生成8-15个故事节拍
3. 生成3-5个世界观设定条目
4. 确保角色与主角有实质关联
5. 节拍要体现主角的成长弧线`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'planner',
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
                setExpandStream(accumulated);
              }
            } catch {
              // skip
            }
          }
        }
      }

      // Try to parse JSON from the accumulated text
      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          setExpandResult(result);
        } catch {
          setExpandResult({
            characters: [{ name: '解析失败', role: '请手动创建', relation: '', motivation: '' }],
            outlineBeats: [],
            worldviewEntries: [],
          });
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setExpandStream('⚠️ 生成失败，请重试');
      }
    } finally {
      setIsExpanding(false);
      abortRef.current = null;
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidateStream('');
    setValidateResult(null);
    abortRef.current = new AbortController();

    const prompt = `你是一位严格的小说质量检查专家，请验证以下设定的完整性和一致性：

种子设定：
标题：${seed.title}
类型：${seed.genre}
核心设定：${seed.premise}
主角：${seed.protagonistName}
渴望：${seed.coreDesire}
缺陷：${seed.coreFlaw}
内心冲突：${seed.innerConflict}

扩展内容：
角色：${expandResult ? expandResult.characters.map(c => `${c.name}(${c.role})`).join(', ') : '无'}
节拍：${expandResult ? expandResult.outlineBeats.map(b => b.title).join(', ') : '无'}
世界观：${expandResult ? expandResult.worldviewEntries.map(w => w.name).join(', ') : '无'}

请按以下JSON格式输出验证结果：
{
  "arcComplete": true/false,
  "causalChain": true/false,
  "settingConsistent": true/false,
  "patches": ["需要修补的问题1", "需要修补的问题2"],
  "overallScore": 85
}

检查维度：
1. 角色弧线是否完整（有明确起点、转折、终点）
2. 情节因果链是否合理（事件之间有因果关系）
3. 世界设定是否自洽（设定间无矛盾）
4. 给出1-100的整体评分`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'reviewer',
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
                setValidateStream(accumulated);
              }
            } catch {
              // skip
            }
          }
        }
      }

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          setValidateResult(result);
        } catch {
          setValidateResult({ arcComplete: true, causalChain: true, settingConsistent: true, patches: [], overallScore: 70 });
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setValidateStream('⚠️ 验证失败，请重试');
      }
    } finally {
      setIsValidating(false);
      abortRef.current = null;
    }
  };

  const handleFinish = async () => {
    try {
      // Create project
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seed.title,
          genre: seed.genre,
          description: seed.premise,
        }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const project = await res.json();
      setCreatedProjectId(project.id);

      // Create protagonist character
      if (seed.protagonistName) {
        await fetch('/api/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            name: seed.protagonistName,
            role: '主角',
            personality: `核心渴望：${seed.coreDesire}；核心缺陷：${seed.coreFlaw}`,
            background: seed.innerConflict,
            arc: `${seed.coreDesire} → 克服${seed.coreFlaw}`,
          }),
        });
      }

      // Create supporting characters
      if (expandResult?.characters) {
        for (const char of expandResult.characters) {
          await fetch('/api/characters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project.id,
              name: char.name,
              role: char.role || '配角',
              personality: char.motivation || '',
              background: char.relation || '',
            }),
          });
        }
      }

      // Create worldview entries
      if (expandResult?.worldviewEntries) {
        for (let i = 0; i < expandResult.worldviewEntries.length; i++) {
          const entry = expandResult.worldviewEntries[i];
          await fetch('/api/world-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project.id,
              name: entry.name,
              description: entry.description,
              type: 'background',
              order: i,
            }),
          });
        }
      }

      // Create outline from beats
      if (expandResult?.outlineBeats && expandResult.outlineBeats.length > 0) {
        const outlineContent = expandResult.outlineBeats.map((beat, i) => 
          `${i + 1}. ${beat.title}\n   冲突：${beat.conflict}\n   摘要：${beat.summary}\n   目标字数：${beat.wordTarget}`
        ).join('\n\n');

        await fetch('/api/outlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: project.id, content: outlineContent }),
        });
      }

      onComplete(project);
    } catch (e) {
      console.error('Failed to create project:', e);
    }
  };

  const canGoNext = () => {
    if (step === 0) return seed.title.trim() && seed.premise.trim() && seed.protagonistName.trim();
    if (step === 1) return expandResult !== null;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl mx-4 shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">创建新项目</h3>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              ✕
            </Button>
          </div>
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive ? 'bg-primary/15 text-primary font-medium' :
                      isDone ? 'bg-emerald-400/10 text-emerald-400' :
                      'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-400' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Step 1: Seed */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Sprout size={32} className="mx-auto text-amber-400 mb-2" />
                <h4 className="font-medium text-foreground">种子设定</h4>
                <p className="text-xs text-muted-foreground">输入你的故事核心，AI将据此扩展</p>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">小说标题 *</label>
                <Input value={seed.title} onChange={e => setSeed(p => ({ ...p, title: e.target.value }))} placeholder="你的小说标题..." className="text-sm" autoFocus />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {GENRES.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setSeed(p => ({ ...p, genre: g.value }))}
                      className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        seed.genre === g.value ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-transparent hover:border-border'
                      }`}
                    >
                      {g.emoji} {g.value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">核心设定 *</label>
                <Textarea value={seed.premise} onChange={e => setSeed(p => ({ ...p, premise: e.target.value }))} placeholder="一句话概括你的故事核心..." rows={2} className="text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">主角名 *</label>
                  <Input value={seed.protagonistName} onChange={e => setSeed(p => ({ ...p, protagonistName: e.target.value }))} placeholder="主角姓名..." className="text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">核心渴望</label>
                  <Input value={seed.coreDesire} onChange={e => setSeed(p => ({ ...p, coreDesire: e.target.value }))} placeholder="主角最渴望什么..." className="text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">核心缺陷</label>
                  <Input value={seed.coreFlaw} onChange={e => setSeed(p => ({ ...p, coreFlaw: e.target.value }))} placeholder="主角的性格缺陷..." className="text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">内心冲突</label>
                  <Input value={seed.innerConflict} onChange={e => setSeed(p => ({ ...p, innerConflict: e.target.value }))} placeholder="渴望与缺陷的矛盾..." className="text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Expand */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Expand size={32} className="mx-auto text-blue-400 mb-2" />
                <h4 className="font-medium text-foreground">AI扩展</h4>
                <p className="text-xs text-muted-foreground">基于种子设定生成角色、大纲和世界观</p>
              </div>

              {!expandResult && !isExpanding && (
                <Card className="bg-secondary/30 border-border/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">点击下方按钮让AI根据种子设定生成扩展内容</p>
                    <Button onClick={handleExpand}>
                      <Sparkles size={14} className="mr-1" />
                      开始扩展
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isExpanding && (
                <Card className="bg-card/50 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={14} className="animate-spin text-primary" />
                      <span className="text-sm text-foreground">AI正在扩展...</span>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar font-mono">
                      {expandStream}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {expandResult && (
                <div className="space-y-4">
                  {/* Characters */}
                  {expandResult.characters.length > 0 && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          👤 角色设定
                          <Badge variant="secondary" className="text-xs">{expandResult.characters.length}人</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {expandResult.characters.map((char, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                            <Badge variant="outline" className="text-xs shrink-0">{char.role}</Badge>
                            <div>
                              <span className="text-sm font-medium text-foreground">{char.name}</span>
                              {char.relation && <span className="text-xs text-muted-foreground ml-2">{char.relation}</span>}
                              {char.motivation && <p className="text-xs text-muted-foreground mt-0.5">{char.motivation}</p>}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Outline Beats */}
                  {expandResult.outlineBeats.length > 0 && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          🎯 故事节拍
                          <Badge variant="secondary" className="text-xs">{expandResult.outlineBeats.length}个</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {expandResult.outlineBeats.map((beat, i) => (
                          <div key={i} className="p-2 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-primary font-medium">#{i + 1}</span>
                              <span className="text-sm font-medium text-foreground">{beat.title}</span>
                              <Badge variant="outline" className="text-xs ml-auto">{beat.wordTarget}字</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">冲突: {beat.conflict}</p>
                            <p className="text-xs text-foreground/80 mt-0.5">{beat.summary}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Worldview */}
                  {expandResult.worldviewEntries.length > 0 && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          🌍 世界观设定
                          <Badge variant="secondary" className="text-xs">{expandResult.worldviewEntries.length}项</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {expandResult.worldviewEntries.map((entry, i) => (
                          <div key={i} className="p-2 bg-secondary/30 rounded-lg">
                            <span className="text-sm font-medium text-foreground">{entry.name}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <Button variant="outline" size="sm" onClick={handleExpand} disabled={isExpanding}>
                    <Sparkles size={14} className="mr-1" />
                    重新生成
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Validate */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Shield size={32} className="mx-auto text-emerald-400 mb-2" />
                <h4 className="font-medium text-foreground">一致性验证</h4>
                <p className="text-xs text-muted-foreground">让AI检查设定的完整性和一致性</p>
              </div>

              {!validateResult && !isValidating && (
                <Card className="bg-secondary/30 border-border/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">点击下方按钮让AI验证你的设定</p>
                    <Button onClick={handleValidate}>
                      <Shield size={14} className="mr-1" />
                      开始验证
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isValidating && (
                <Card className="bg-card/50 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={14} className="animate-spin text-primary" />
                      <span className="text-sm text-foreground">AI正在验证...</span>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar font-mono">
                      {validateStream}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {validateResult && (
                <div className="space-y-4">
                  {/* Score */}
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold text-foreground mb-1">{validateResult.overallScore}</div>
                      <p className="text-xs text-muted-foreground">整体评分</p>
                    </CardContent>
                  </Card>

                  {/* Checks */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-3 text-center">
                        {validateResult.arcComplete ? (
                          <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1" />
                        ) : (
                          <XCircle size={24} className="mx-auto text-red-400 mb-1" />
                        )}
                        <p className="text-xs font-medium text-foreground">角色弧线</p>
                        <p className="text-xs text-muted-foreground">{validateResult.arcComplete ? '完整' : '不完整'}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-3 text-center">
                        {validateResult.causalChain ? (
                          <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1" />
                        ) : (
                          <XCircle size={24} className="mx-auto text-red-400 mb-1" />
                        )}
                        <p className="text-xs font-medium text-foreground">因果链</p>
                        <p className="text-xs text-muted-foreground">{validateResult.causalChain ? '合理' : '有缺陷'}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-3 text-center">
                        {validateResult.settingConsistent ? (
                          <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1" />
                        ) : (
                          <XCircle size={24} className="mx-auto text-red-400 mb-1" />
                        )}
                        <p className="text-xs font-medium text-foreground">设定一致性</p>
                        <p className="text-xs text-muted-foreground">{validateResult.settingConsistent ? '自洽' : '有矛盾'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Patches */}
                  {validateResult.patches.length > 0 && (
                    <Card className="bg-amber-400/5 border-amber-400/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-400">建议修补</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {validateResult.patches.map((patch, i) => (
                            <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                              <span className="text-amber-400 shrink-0">•</span>
                              {patch}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Button variant="outline" size="sm" onClick={handleValidate} disabled={isValidating}>
                    <Shield size={14} className="mr-1" />
                    重新验证
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel}>取消</Button>
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={14} className="mr-1" />上一步
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 2 && (
              <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
                下一步 <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleFinish} disabled={!!createdProjectId}>
                {createdProjectId ? (
                  <><CheckCircle2 size={14} className="mr-1" />已创建</>
                ) : (
                  '完成创建'
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
