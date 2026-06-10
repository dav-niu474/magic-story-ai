'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore, type AgentMessage, type ToolCallResult } from '@/lib/store';
import { UNIVERSAL_AGENT_PROMPT, parseToolCalls, type ParsedToolCall } from '@/lib/universal-agent';
import { ToolPanel } from '@/components/tool-panel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AntiAIPanel } from '@/components/anti-ai-panel';
import { AdversarialReviewPanel } from '@/components/adversarial-review';
import { ChapterPreview } from '@/components/chapter-preview';
import {
  Send, Loader2, Trash2, StopCircle, Sparkles,
  ChevronDown, ChevronRight, Wrench, Eye, Shield, Swords,
  Bot, User, Zap, CheckCircle2, XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tool Call Result Card ────────────────────────────
function ToolCallCard({ toolCall, onExecute }: {
  toolCall: ParsedToolCall;
  onExecute: (tc: ParsedToolCall) => void;
  executed?: boolean;
  result?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const toolDef = useAppStore(s => s.agentTools.find(t => t.id === toolCall.toolId));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
    >
      <div className="rounded-lg border border-primary/30 bg-primary/5 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/10 transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span className="text-sm">{toolDef?.icon || '🔧'}</span>
          <span className="text-xs font-medium text-primary">{toolDef?.name || toolCall.toolId}</span>
          {executed ? (
            <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-400/30 ml-auto">
              <CheckCircle2 size={10} className="mr-0.5" /> 已执行
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-400/30 ml-auto">
              <Zap size={10} className="mr-0.5" /> 待执行
            </Badge>
          )}
        </button>

        {/* Content */}
        {expanded && (
          <div className="px-3 pb-3 space-y-2">
            <pre className="text-[11px] text-foreground/80 bg-secondary/50 rounded p-2 overflow-x-auto max-h-40 overflow-y-auto custom-scrollbar font-mono">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
            {!executed && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => onExecute(toolCall)}
              >
                <Zap size={12} className="mr-1" />
                执行此工具
              </Button>
            )}
            {result && (
              <div className="text-[11px] text-foreground/70 bg-secondary/30 rounded p-2 max-h-32 overflow-y-auto custom-scrollbar">
                {result}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────
function MessageBubble({ message, onExecuteTool, toolResults }: {
  message: AgentMessage;
  onExecuteTool: (tc: ParsedToolCall) => void;
  toolResults: Record<string, string>;
}) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Parse tool calls from assistant messages
  const { text, toolCalls } = isAssistant ? parseToolCalls(message.content) : { text: message.content, toolCalls: [] };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {/* Avatar + Name */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot size={12} className="text-primary" />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">
            {isUser ? '你' : '墨灵'}
          </span>
          <span className="text-[9px] text-muted-foreground/50">
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Content */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary/20 text-foreground rounded-tr-md'
              : 'bg-card border border-border/50 text-foreground/90 rounded-tl-md'
          }`}
        >
          {/* Streaming cursor */}
          {isAssistant && text === '' && message.isStreaming ? (
            <span className="streaming-cursor" />
          ) : (
            <span className="whitespace-pre-wrap">{text || message.content}</span>
          )}

          {/* Tool Call Cards */}
          {toolCalls.length > 0 && (
            <div className="mt-2 space-y-1">
              {toolCalls.map((tc, idx) => (
                <ToolCallCard
                  key={`${tc.toolId}-${idx}`}
                  toolCall={tc}
                  onExecute={onExecuteTool}
                  executed={!!toolResults[`${tc.toolId}-${idx}`]}
                  result={toolResults[`${tc.toolId}-${idx}`]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Side Panel ───────────────────────────────────────
function SidePanel({ type, onClose }: {
  type: 'preview' | 'antiAi' | 'adversarial';
  onClose: () => void;
}) {
  const { activeChapterId } = useAppStore();
  const [chapter, setChapter] = useState<{ title: string; content: string; summary: string; emotionTarget: string; emotionArc: string } | null>(null);

  useEffect(() => {
    if (activeChapterId && type !== 'none') {
      fetch(`/api/chapters?id=${activeChapterId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setChapter(d))
        .catch(() => {});
    }
  }, [activeChapterId, type]);

  const panelConfig = {
    preview: { icon: Eye, label: '实时预览', color: 'text-cyan-400' },
    antiAi: { icon: Shield, label: '去AI味', color: 'text-rose-400' },
    adversarial: { icon: Swords, label: '对抗评审', color: 'text-purple-400' },
  }[type];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 360, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full border-l border-border bg-card/30 flex flex-col overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <panelConfig.icon size={14} className={panelConfig.color} />
          <span className="text-xs font-medium text-foreground">{panelConfig.label}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <XCircle size={14} className="text-muted-foreground" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {type === 'preview' && (
          <ChapterPreview
            title={chapter?.title || ''}
            content={chapter?.content || ''}
            summary={chapter?.summary || ''}
            emotionTarget={chapter?.emotionTarget || ''}
            emotionArc={chapter?.emotionArc || ''}
            wordCount={chapter?.content?.length || 0}
            hasChapter={!!chapter}
          />
        )}
        {type === 'antiAi' && chapter && (
          <div className="p-4">
            <AntiAIPanel
              content={chapter.content}
              onApplyFix={() => {}}
            />
          </div>
        )}
        {type === 'antiAi' && !chapter && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6">
            <Shield size={28} className="mb-3 opacity-30" />
            <p className="text-sm">选择章节后可进行去AI味分析</p>
          </div>
        )}
        {type === 'adversarial' && chapter && (
          <div className="p-4">
            <AdversarialReviewPanel
              content={chapter.content}
              chapterTitle={chapter.title}
            />
          </div>
        )}
        {type === 'adversarial' && !chapter && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6">
            <Swords size={28} className="mb-3 opacity-30" />
            <p className="text-sm">选择章节后可进行对抗评审</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main CreationChat Component ──────────────────────
export function CreationChat({ projectId }: { projectId: string }) {
  const {
    agentMessages, addAgentMessage, clearAgentMessages,
    agentTools, sidePanel, setSidePanel,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolPanelCollapsed, setToolPanelCollapsed] = useState(false);
  const [toolResults, setToolResults] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const messages = agentMessages[projectId] || [];

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addAgentMessage(projectId, {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是墨灵，你的全能创作代理 ✨\n\n我可以帮你规划大纲、创建角色、构建世界观、撰写章节、润色文字——所有创作环节一气呵成。\n\n试试跟我说：\n• "帮我构思一个玄幻故事"\n• "设计一个有魅力的反派"\n• "帮我把第三章写出来"\n• "审查一下这段文字的AI味"\n\n左侧的工具面板可以开关我使用的工具，按需配置即可。',
        agentType: 'universal',
        timestamp: Date.now(),
      });
    }
  }, [projectId]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      agentType: 'universal',
      timestamp: Date.now(),
    };

    addAgentMessage(projectId, userMsg);
    setInput('');
    setIsStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    addAgentMessage(projectId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      agentType: 'universal',
      timestamp: Date.now(),
      isStreaming: true,
    });

    try {
      abortRef.current = new AbortController();

      // Build enabled tools context
      const enabledTools = agentTools.filter(t => t.enabled);
      const toolsContext = enabledTools.length > 0
        ? `\n\n当前已启用工具：${enabledTools.map(t => `${t.name}(${t.id})`).join('、')}`
        : '\n\n当前未启用任何工具。';

      // Build conversation history
      const chatMessages = [...messages, userMsg]
        .filter(m => m.role !== 'system' && m.id !== 'welcome')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'planner', // Fallback, will be overridden by systemPrompt
          messages: chatMessages,
          systemPrompt: UNIVERSAL_AGENT_PROMPT + toolsContext,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to get AI response');
      }

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
                // Update the streaming message
                addAgentMessage(projectId, {
                  id: assistantId,
                  role: 'assistant',
                  content: accumulated,
                  agentType: 'universal',
                  timestamp: Date.now(),
                  isStreaming: true,
                });
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      // Final update - mark streaming as complete
      addAgentMessage(projectId, {
        id: assistantId,
        role: 'assistant',
        content: accumulated,
        agentType: 'universal',
        timestamp: Date.now(),
        isStreaming: false,
      });

      // Log agent interaction
      try {
        await fetch('/api/agent-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            agentType: 'universal',
            action: 'chat',
            input: userMsg.content,
            output: accumulated,
          }),
        });
      } catch {
        // non-critical
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        addAgentMessage(projectId, {
          id: assistantId,
          role: 'assistant',
          content: '⚠️ 请求失败，请重试。可能是网络问题或API服务暂时不可用。',
          agentType: 'universal',
          timestamp: Date.now(),
          isStreaming: false,
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleClear = () => {
    clearAgentMessages(projectId);
    setToolResults({});
  };

  // Execute a parsed tool call by making the appropriate API request
  const handleExecuteTool = async (tc: ParsedToolCall) => {
    const key = `${tc.toolId}-${Date.now()}`;
    setToolResults(prev => ({ ...prev, [key]: '⏳ 执行中...' }));

    try {
      let result = '';

      switch (tc.toolId) {
        case 'write_outline': {
          const res = await fetch('/api/outlines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, content: tc.input.content || JSON.stringify(tc.input) }),
          });
          result = res.ok ? '✅ 大纲已创建/更新' : '❌ 创建大纲失败';
          break;
        }
        case 'create_character': {
          const res = await fetch('/api/characters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, ...tc.input }),
          });
          result = res.ok ? '✅ 角色已创建' : '❌ 创建角色失败';
          break;
        }
        case 'create_world_entry': {
          const res = await fetch('/api/world-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, ...tc.input }),
          });
          result = res.ok ? '✅ 世界设定已创建' : '❌ 创建世界设定失败';
          break;
        }
        case 'read_outline': {
          const res = await fetch(`/api/outlines?projectId=${projectId}`);
          if (res.ok) {
            const data = await res.json();
            result = data.length > 0 ? `📋 当前大纲 (v${data[0].version}):\n${data[0].content.slice(0, 500)}...` : '📋 暂无大纲';
          } else {
            result = '❌ 读取大纲失败';
          }
          break;
        }
        case 'search_asset': {
          const query = (tc.input.query as string) || (tc.input.name as string) || '';
          const [charRes, worldRes] = await Promise.all([
            fetch(`/api/characters?projectId=${projectId}`),
            fetch(`/api/world-settings?projectId=${projectId}`),
          ]);
          let found = '';
          if (charRes.ok) {
            const chars = await charRes.json();
            const match = chars.find((c: { name: string }) => c.name.includes(query));
            if (match) found += `👤 角色: ${match.name} - ${match.personality || ''}\n`;
          }
          if (worldRes.ok) {
            const worlds = await worldRes.json();
            const match = worlds.find((w: { title: string }) => w.title.includes(query));
            if (match) found += `🌍 世界设定: ${match.title}\n`;
          }
          result = found || `🔍 未找到与"${query}"相关的资产`;
          break;
        }
        default:
          result = `🔧 工具 ${tc.toolId} 已记录（API对接中）`;
      }

      setToolResults(prev => ({ ...prev, [key]: result }));
    } catch {
      setToolResults(prev => ({ ...prev, [key]: '❌ 执行出错' }));
    }
  };

  return (
    <div className="h-full flex">
      {/* Left: Tool Panel */}
      <ToolPanel
        collapsed={toolPanelCollapsed}
        onToggleCollapse={() => setToolPanelCollapsed(!toolPanelCollapsed)}
      />

      {/* Center: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0 bg-card/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles size={12} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">墨灵</span>
            <Badge variant="outline" className="text-[9px]">Universal Agent</Badge>
            {isStreaming && (
              <Badge className="text-[9px] bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
                <Loader2 size={8} className="mr-0.5 animate-spin" /> 思考中
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Side panel toggles */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidePanel(sidePanel === 'preview' ? 'none' : 'preview')}
              className={`h-7 px-2 text-xs ${sidePanel === 'preview' ? 'text-cyan-400 bg-cyan-400/10' : 'text-muted-foreground'}`}
              title="实时预览"
            >
              <Eye size={12} className="mr-1" />预览
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidePanel(sidePanel === 'antiAi' ? 'none' : 'antiAi')}
              className={`h-7 px-2 text-xs ${sidePanel === 'antiAi' ? 'text-rose-400 bg-rose-400/10' : 'text-muted-foreground'}`}
              title="去AI味分析"
            >
              <Shield size={12} className="mr-1" />去AI味
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidePanel(sidePanel === 'adversarial' ? 'none' : 'adversarial')}
              className={`h-7 px-2 text-xs ${sidePanel === 'adversarial' ? 'text-purple-400 bg-purple-400/10' : 'text-muted-foreground'}`}
              title="对抗评审"
            >
              <Swords size={12} className="mr-1" />评审
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="清空对话"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onExecuteTool={handleExecuteTool}
                toolResults={toolResults}
              />
            ))}

            {/* Empty state hint */}
            {messages.length <= 1 && (
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { emoji: '🎯', text: '帮我构思一个修仙故事的大纲', label: '规划大纲' },
                  { emoji: '👤', text: '设计一个复杂的反派角色', label: '创建角色' },
                  { emoji: '🌍', text: '构建一个蒸汽朋克世界观', label: '世界设定' },
                  { emoji: '✍️', text: '根据大纲写出第一章', label: '撰写章节' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setInput(item.text)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-left group"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 p-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="和墨灵聊聊你的创作想法... (Enter发送, Shift+Enter换行)"
                  rows={2}
                  className="text-sm resize-none min-h-[52px] max-h-[120px] pr-10 bg-secondary/30 border-border/50 focus:border-primary/30"
                  disabled={isStreaming}
                />
                <div className="absolute right-2 bottom-2 text-[9px] text-muted-foreground/40">
                  {input.length > 0 && `${input.length}`}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {isStreaming ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleStop}
                    className="h-[52px] px-4"
                  >
                    <StopCircle size={16} className="mr-1" />
                    停止
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-[52px] px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send size={16} className="mr-1" />
                    发送
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-muted-foreground/50">
                模型驱动 · 工具热插拔 · 情感优先
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Side Panel */}
      <AnimatePresence>
        {sidePanel !== 'none' && (
          <SidePanel
            type={sidePanel as 'preview' | 'antiAi' | 'adversarial'}
            onClose={() => setSidePanel('none')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
