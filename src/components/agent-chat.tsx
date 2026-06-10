'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { AGENTS, AgentType, getAgent } from '@/lib/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AgentChatProps {
  projectId: string;
  agentType: string;
}

export function AgentChat({ projectId, agentType }: AgentChatProps) {
  const { setActiveAgent } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const agent = getAgent(agentType as AgentType);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }]);

    try {
      abortRef.current = new AbortController();

      const chatMessages = [...messages, userMsg]
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          messages: chatMessages,
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
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
                );
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      // Log agent interaction
      try {
        await fetch('/api/agent-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            agentType,
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
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: '⚠️ 请求失败，请重试' }
              : m
          )
        );
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
    setMessages([]);
  };

  if (!agent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 380, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="h-full border-l border-border bg-card/30 flex flex-col overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className={`h-12 flex items-center justify-between px-4 border-b border-border ${agent.bgColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{agent.emoji}</span>
            <span className={`text-sm font-medium ${agent.color}`}>{agent.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleClear} title="清空对话">
              <Trash2 size={14} className="text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveAgent(null)} title="关闭">
              <X size={14} className="text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <span className="text-3xl block mb-3">{agent.emoji}</span>
              <p className={`text-sm font-medium ${agent.color} mb-1`}>{agent.name}</p>
              <p className="text-xs text-muted-foreground px-4">{agent.description}</p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-foreground'
                    : `${agent.bgColor} text-foreground/90`
                }`}
              >
                {msg.role === 'assistant' && msg.content === '' && isStreaming ? (
                  <span className="streaming-cursor" />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`向${agent.name}提问...`}
              rows={2}
              className="text-sm resize-none flex-1 min-h-[60px]"
              disabled={isStreaming}
            />
            <div className="flex flex-col gap-1">
              {isStreaming ? (
                <Button size="sm" variant="destructive" onClick={handleStop} className="h-full">
                  <Loader2 size={14} className="animate-spin" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="h-full">
                  <Send size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
