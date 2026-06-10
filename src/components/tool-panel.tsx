'use client';

import { useAppStore, DEFAULT_TOOLS, type AgentTool } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  outline:   { label: '大纲', color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  character: { label: '角色', color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
  world:     { label: '世界', color: 'text-teal-400', bgColor: 'bg-teal-400/10' },
  scene:     { label: '场景', color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
  graph:     { label: '图谱', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
};

interface ToolPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ToolPanel({ collapsed, onToggleCollapse }: ToolPanelProps) {
  const { agentTools, toggleTool } = useAppStore();

  const enabledCount = agentTools.filter(t => t.enabled).length;
  const totalCount = agentTools.length;

  // Group tools by category
  const grouped = agentTools.reduce<Record<string, AgentTool[]>>((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  // Preserve default category order
  const categoryOrder = [...new Set(DEFAULT_TOOLS.map(t => t.category))];

  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 48 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-full border-r border-border bg-card/30 flex flex-col overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-border shrink-0">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Wrench size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">工具面板</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {enabledCount}/{totalCount}
              </Badge>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 shrink-0"
            title={collapsed ? '展开工具面板' : '收起工具面板'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </Button>
        </div>

        {/* Tool List */}
        {!collapsed && (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {categoryOrder.map(category => {
                const config = CATEGORY_CONFIG[category];
                const tools = grouped[category] || [];
                if (tools.length === 0) return null;

                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                        {config.label}
                      </span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    {/* Tools in Category */}
                    <div className="space-y-1.5">
                      {tools.map(tool => (
                        <div
                          key={tool.id}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            tool.enabled
                              ? `${config.bgColor} border border-border/50`
                              : 'bg-transparent border border-transparent hover:bg-secondary/30'
                          }`}
                        >
                          <span className="text-sm shrink-0">{tool.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-medium truncate ${tool.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {tool.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                          <Switch
                            checked={tool.enabled}
                            onCheckedChange={() => toggleTool(tool.id)}
                            className="scale-75 origin-right shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Collapsed: Just icons */}
        {collapsed && (
          <div className="flex-1 flex flex-col items-center pt-3 gap-2 overflow-y-auto custom-scrollbar">
            {categoryOrder.map(category => {
              const config = CATEGORY_CONFIG[category];
              const tools = grouped[category] || [];
              return tools.map(tool => (
                <div
                  key={tool.id}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    tool.enabled ? config.bgColor : 'opacity-40 hover:opacity-60'
                  }`}
                  title={`${tool.name}${tool.enabled ? '' : ' (已禁用)'}`}
                  onClick={() => toggleTool(tool.id)}
                >
                  <span className="text-xs">{tool.icon}</span>
                </div>
              ));
            })}
          </div>
        )}

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                已启用 {enabledCount} 个工具
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-5 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const allEnabled = agentTools.every(t => t.enabled);
                  agentTools.forEach(t => {
                    if (t.enabled === allEnabled) toggleTool(t.id);
                  });
                }}
              >
                {enabledCount === totalCount ? '全部禁用' : '全部启用'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
