'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzeAntiAI, type AntiAIResult } from '@/lib/anti-ai-words';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Shield, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

interface AntiAIPanelProps {
  content: string;
  onApplyFix: (fixedContent: string) => void;
}

const DIMENSION_LABELS: Record<string, string> = {
  bannedWordDensity: '禁用词密度',
  parallelPattern: '并列句式',
  psychologicalTelling: '心理直白',
  rhythmUniformity: '节奏均匀',
  dialogueSameness: '对话同质',
  endingGrandiosity: '结尾升华',
};

export function AntiAIPanel({ content, onApplyFix }: AntiAIPanelProps) {
  const [result, setResult] = useState<AntiAIResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleAnalyze = () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    // Run analysis (synchronous, but add delay for UX)
    setTimeout(() => {
      const analysis = analyzeAntiAI(content);
      setResult(analysis);
      setIsAnalyzing(false);
    }, 300);
  };

  const handleAIFix = async () => {
    if (!content.trim()) return;
    setIsFixing(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'editor',
          messages: [{
            role: 'user',
            content: `请对以下文本进行"去AI味"处理，使其更像人类作者写的小说。具体要求：

1. 替换AI常用词（如"然而""此外""心中涌起"等）为更自然的表达
2. 打破并列句式的节奏，变换句式结构
3. 心理描写改为间接暗示（用行动和细节传达内心）
4. 段落长短交替，制造节奏变化
5. 对话差异化，让不同角色有不同说话方式
6. 结尾避免升华总结

原文：
${content}

请直接输出修改后的文本，保持原意和情节不变。`,
          }],
        }),
      });

      if (res.ok && res.body) {
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

        if (accumulated) {
          onApplyFix(accumulated);
        }
      }
    } catch (e) {
      console.error('Failed to fix AI writing:', e);
    }
    setIsFixing(false);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return '自然';
    if (score < 60) return '偏AI';
    return 'AI味重';
  };

  const radarData = result ? Object.entries(result.dimensions).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key] || key,
    score: value,
    fullMark: 100,
  })) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-rose-400" />
          <h3 className="text-sm font-bold text-foreground">去AI味分析</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isAnalyzing || !content.trim()}>
            {isAnalyzing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Shield size={14} className="mr-1" />}
            分析
          </Button>
          <Button size="sm" onClick={handleAIFix} disabled={isFixing || !content.trim()}>
            {isFixing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Sparkles size={14} className="mr-1" />}
            AI去AI味
          </Button>
        </div>
      </div>

      {!result && !isAnalyzing && (
        <div className="text-center py-8 text-muted-foreground">
          <Shield size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">点击"分析"检测文本中的AI写作痕迹</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </div>
              <Badge variant="outline" className={`text-xs mt-1 ${getScoreColor(result.overallScore)}`}>
                {getScoreLabel(result.overallScore)}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                AI痕迹指数 (0=最自然, 100=最AI)
              </p>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }} />
                  <Radar
                    name="AI痕迹"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Banned Words Found */}
          {result.bannedWordsFound.length > 0 && (
            <Card className="bg-amber-400/5 border-amber-400/30">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-amber-400 mb-2">🚫 发现AI常用词</p>
                <div className="flex flex-wrap gap-1">
                  {result.bannedWordsFound.map(word => (
                    <code key={word} className="text-[10px] px-1.5 py-0.5 bg-amber-400/10 text-amber-400 rounded">{word}</code>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-foreground">改进建议</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Dimension Details */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(result.dimensions).map(([key, value]) => (
              <div key={key} className="p-2 bg-secondary/30 rounded-lg">
                <div className={`text-lg font-bold ${getScoreColor(value)}`}>{value}</div>
                <p className="text-[10px] text-muted-foreground">{DIMENSION_LABELS[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
