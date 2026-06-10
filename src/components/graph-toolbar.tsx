'use client';

import { NODE_TYPE_CONFIG, type StoryNodeType, useAppStore } from '@/lib/store';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  LayoutGrid,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  onAddNode: () => void;
  onSearch: (query: string) => void;
}

const NODE_TYPES: StoryNodeType[] = ['main', 'sub', 'task', 'dungeon', 'scene', 'event'];

export function GraphToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onAddNode,
  onSearch,
}: GraphToolbarProps) {
  const { graphFilter, toggleGraphFilter } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm border-b border-border">
      {/* Node Type Filters */}
      <div className="flex items-center gap-1 mr-2">
        {NODE_TYPES.map((type) => {
          const config = NODE_TYPE_CONFIG[type];
          const isActive = graphFilter.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleGraphFilter(type)}
              className={`
                text-[11px] px-2 py-1 rounded-md border transition-all duration-150
                ${
                  isActive
                    ? `${config.bgColor} ${config.color} ${config.borderColor} border`
                    : 'text-muted-foreground/50 border-transparent hover:text-muted-foreground hover:border-border'
                }
              `}
              title={config.label}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onZoomIn}
          title="放大"
        >
          <ZoomIn size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onZoomOut}
          title="缩小"
        >
          <ZoomOut size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onFitView}
          title="适应视图"
        >
          <Maximize size={14} />
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* Layout & Add */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={onAutoLayout}
        title="自动布局"
      >
        <LayoutGrid size={13} />
        <span className="hidden sm:inline">自动布局</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1 text-primary"
        onClick={onAddNode}
        title="添加节点"
      >
        <Plus size={13} />
        <span className="hidden sm:inline">添加节点</span>
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center gap-1">
        {showSearch ? (
          <div className="flex items-center gap-1">
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索节点..."
              className="h-7 w-40 text-xs bg-secondary border-border"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSearch(false);
                  handleSearch('');
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setShowSearch(false);
                handleSearch('');
              }}
            >
              ✕
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowSearch(true)}
            title="搜索节点"
          >
            <Search size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
