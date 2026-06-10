'use client';

import { useAppStore, type CreationSubView } from '@/lib/store';
import { CreationChat } from '@/components/creation-chat';
import { ChapterEditor } from '@/components/chapter-editor';
import { OutlineEditor } from '@/components/outline-editor';
import { TrackingPanel } from '@/components/tracking-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, ListTree, Route } from 'lucide-react';

const SUB_VIEWS: { id: CreationSubView; label: string; icon: typeof Sparkles; color: string }[] = [
  { id: 'chat', label: '对话', icon: Sparkles, color: 'text-primary' },
  { id: 'chapters', label: '章节', icon: BookOpen, color: 'text-emerald-400' },
  { id: 'outline', label: '大纲', icon: ListTree, color: 'text-amber-400' },
  { id: 'tracking', label: '追踪', icon: Route, color: 'text-cyan-400' },
];

export function CreationCenter({ projectId }: { projectId: string }) {
  const { creationSubView, setCreationSubView } = useAppStore();

  const currentView = SUB_VIEWS.find(v => v.id === creationSubView) || SUB_VIEWS[0];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="h-11 flex items-center gap-1 px-4 border-b border-border bg-card/30 shrink-0">
        <div className="flex items-center gap-1">
          {SUB_VIEWS.map(view => {
            const Icon = view.icon;
            const isActive = creationSubView === view.id;
            return (
              <Button
                key={view.id}
                variant="ghost"
                size="sm"
                onClick={() => setCreationSubView(view.id)}
                className={`h-8 px-3 text-xs gap-1.5 transition-all ${
                  isActive
                    ? `${view.color} bg-secondary/50 hover:bg-secondary/70`
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={13} />
                {view.label}
              </Button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Context indicator */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px]">
            创作中心
          </Badge>
          <div className="flex items-center gap-1">
            <currentView.icon size={12} className={currentView.color} />
            <span className="text-[10px] text-muted-foreground">{currentView.label}模式</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {creationSubView === 'chat' && (
          <CreationChat projectId={projectId} />
        )}
        {creationSubView === 'chapters' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
            <ChapterEditor projectId={projectId} />
          </div>
        )}
        {creationSubView === 'outline' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
            <OutlineEditor projectId={projectId} />
          </div>
        )}
        {creationSubView === 'tracking' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
            <TrackingPanel projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  );
}
