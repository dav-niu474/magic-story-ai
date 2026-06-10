'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Swords, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReviewResult {
  perspective: string;
  emoji: string;
  color: string;
  content: string;
  severity: { level: string; count: number }[];
}

interface AdversarialReviewProps {
  content: string;
  chapterTitle: string;
}

const REVIEW_PERSPECTIVES = [
  { id: 'structure', label: '结构评审', emoji: '🏗️', color: 'text-amber-400', systemPrompt: `你是一位专注于故事结构的评审专家。请从以下维度评审小说章节：

1. 情节推进（事件是否有因果关系）
2. 节奏把控（张弛有度还是一路紧绷/松散）
3. 场景切换（是否自然流畅）
4. 信息释放（悬念和揭秘的节奏）

请用S1-S4严重度标注问题：
- S1(致命): 根本性错误，需要重写
- S2(严重): 明显问题，需要修改
- S3(一般): 可以改进
- S4(建议): 锦上添花的建议

输出格式：
## 结构评审
### 整体评价
[100字内总体评价]

### 具体问题
- [S级别] 问题描述

### 改进建议
1. 具体建议` },
  { id: 'character', label: '角色评审', emoji: '👤', color: 'text-rose-400', systemPrompt: `你是一位专注于角色塑造的评审专家。请从以下维度评审：

1. 角色行为一致性（是否OOC）
2. 对话质量（是否有个人特色）
3. 动机合理性（行为是否有内在逻辑）
4. 情感表达（是否真实自然）

请用S1-S4严重度标注问题。输出格式同上。` },
  { id: 'narrative', label: '叙事评审', emoji: '✍️', color: 'text-blue-400', systemPrompt: `你是一位专注于叙事技巧的评审专家。请从以下维度评审：

1. 叙事视角（是否统一，有无越界）
2. 展示vs叙述（是否用场景展示而非平铺直叙）
3. 文笔质量（修辞、节奏、韵律）
4. 沉浸感（读者是否能代入场景）

请用S1-S4严重度标注问题。输出格式同上。` },
  { id: 'consistency', label: '一致性检查', emoji: '🔍', color: 'text-emerald-400', systemPrompt: `你是一位专注于事实一致性的评审专家。请从以下维度评审：

1. 事实冲突（前后矛盾之处）
2. 伏笔一致性（已埋伏笔是否被尊重）
3. 世界规则（是否违反已设定规则）
4. 时间线（事件顺序是否合理）

请用S1-S4严重度标注问题。输出格式同上。` },
];

export function AdversarialReviewPanel({ content, chapterTitle }: AdversarialReviewProps) {
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeReview, setActiveReview] = useState('structure');
  const abortRef = useRef<AbortController | null>(null);

  const handleReview = async () => {
    if (!content.trim()) return;
    setIsReviewing(true);
    setResults([]);

    const reviewPromises = REVIEW_PERSPECTIVES.map(async (perspective) => {
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentType: 'reviewer',
            messages: [{
              role: 'user',
              content: `${perspective.systemPrompt}\n\n请评审以下章节：\n\n## ${chapterTitle}\n\n${content}`,
            }],
          }),
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
                if (parsed.content) accumulated += parsed.content;
              } catch {
                // skip
              }
            }
          }
        }

        // Parse severity counts
        const severityCounts = [
          { level: 'S1', count: (accumulated.match(/S1/g) || []).length },
          { level: 'S2', count: (accumulated.match(/S2/g) || []).length },
          { level: 'S3', count: (accumulated.match(/S3/g) || []).length },
          { level: 'S4', count: (accumulated.match(/S4/g) || []).length },
        ];

        return {
          perspective: perspective.id,
          emoji: perspective.emoji,
          color: perspective.color,
          content: accumulated,
          severity: severityCounts,
        } as ReviewResult;
      } catch {
        return {
          perspective: perspective.id,
          emoji: perspective.emoji,
          color: perspective.color,
          content: '⚠️ 评审失败，请重试',
          severity: [],
        } as ReviewResult;
      }
    });

    const reviewResults = await Promise.all(reviewPromises);
    setResults(reviewResults);
    setIsReviewing(false);
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsReviewing(false);
  };

  // Find conflicts between reviewers
  const conflicts: string[] = [];
  if (results.length === 4) {
    const hasS1 = results.some(r => r.severity.some(s => s.level === 'S1' && s.count > 0));
    const allS1Free = results.every(r => !r.severity.some(s => s.level === 'S1' && s.count > 0));
    if (hasS1 && allS1Free === false) {
      const s1Reviewers = results.filter(r => r.severity.some(s => s.level === 'S1' && s.count > 0)).map(r => r.perspective);
      const noS1Reviewers = results.filter(r => !r.severity.some(s => s.level === 'S1' && s.count > 0)).map(r => r.perspective);
      if (s1Reviewers.length > 0 && noS1Reviewers.length > 0) {
        conflicts.push(`${s1Reviewers.map(p => REVIEW_PERSPECTIVES.find(rp => rp.id === p)?.emoji).join('')} 发现致命问题，但 ${noS1Reviewers.map(p => REVIEW_PERSPECTIVES.find(rp => rp.id === p)?.emoji).join('')} 未发现`);
      }
    }
  }

  const currentResult = results.find(r => r.perspective === activeReview);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-foreground">对抗评审</h3>
        </div>
        <div className="flex items-center gap-2">
          {isReviewing ? (
            <Button variant="destructive" size="sm" onClick={handleStop}>
              <Loader2 size={14} className="mr-1 animate-spin" />停止
            </Button>
          ) : (
            <Button size="sm" onClick={handleReview} disabled={!content.trim()}>
              <Swords size={14} className="mr-1" />开始评审
            </Button>
          )}
        </div>
      </div>

      {isReviewing && (
        <Card className="bg-card/50 border-primary/30">
          <CardContent className="p-4 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-primary mb-2" />
            <p className="text-sm text-foreground">4位评审专家正在并行审稿...</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              {REVIEW_PERSPECTIVES.map(p => (
                <div key={p.id} className="text-center">
                  <span className="text-lg">{p.emoji}</span>
                  <div className="flex items-center justify-center gap-1">
                    <Loader2 size={10} className="animate-spin text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !isReviewing && (
        <>
          {/* Conflicts */}
          {conflicts.length > 0 && (
            <Card className="bg-amber-400/5 border-amber-400/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">评审冲突</span>
                </div>
                {conflicts.map((conflict, i) => (
                  <p key={i} className="text-xs text-foreground/80">{conflict}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Severity Summary */}
          <div className="grid grid-cols-4 gap-2">
            {results.map(r => {
              const perspective = REVIEW_PERSPECTIVES.find(p => p.id === r.perspective);
              const s1Count = r.severity.find(s => s.level === 'S1')?.count || 0;
              const s2Count = r.severity.find(s => s.level === 'S2')?.count || 0;
              return (
                <Card key={r.perspective} className="bg-card/50 border-border/50">
                  <CardContent className="p-2 text-center">
                    <span className="text-lg">{perspective?.emoji}</span>
                    <p className="text-[10px] text-muted-foreground">{perspective?.label}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {s1Count > 0 && <Badge className="text-[9px] bg-red-400/20 text-red-400">S1:{s1Count}</Badge>}
                      {s2Count > 0 && <Badge className="text-[9px] bg-amber-400/20 text-amber-400">S2:{s2Count}</Badge>}
                      {s1Count === 0 && s2Count === 0 && <CheckCircle2 size={12} className="text-emerald-400" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Review Content */}
          <Tabs value={activeReview} onValueChange={setActiveReview}>
            <TabsList className="bg-secondary/50 w-full">
              {REVIEW_PERSPECTIVES.map(p => (
                <TabsTrigger key={p.id} value={p.id} className="text-xs flex-1">
                  {p.emoji} {p.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {REVIEW_PERSPECTIVES.map(p => (
              <TabsContent key={p.id} value={p.id} className="mt-3">
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <ScrollArea className="max-h-[50vh]">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed">
                          {results.find(r => r.perspective === p.id)?.content || '暂无评审结果'}
                        </pre>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {results.length === 0 && !isReviewing && (
        <div className="text-center py-8 text-muted-foreground">
          <Swords size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">4位评审专家将从不同角度审稿</p>
          <p className="text-xs mt-1">结构 · 角色 · 叙事 · 一致性</p>
        </div>
      )}
    </div>
  );
}
