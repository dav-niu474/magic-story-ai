'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NODE_TYPE_CONFIG, type StoryNodeType } from '@/lib/store';
import { Users, MapPin, Sparkles } from 'lucide-react';

interface StoryNodeData {
  nodeType: StoryNodeType;
  title: string;
  description: string;
  metadata: string;
  [key: string]: unknown;
}

function StoryNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as StoryNodeData;
  const nodeType = (nodeData.nodeType || 'main') as StoryNodeType;
  const config = NODE_TYPE_CONFIG[nodeType] || NODE_TYPE_CONFIG.main;

  // Parse metadata for indicator icons
  let metadataObj: Record<string, unknown> = {};
  try {
    metadataObj = JSON.parse(nodeData.metadata || '{}');
  } catch {
    // ignore parse errors
  }

  const hasCharacters = Array.isArray(metadataObj.characters) && metadataObj.characters.length > 0;
  const hasScenes = Array.isArray(metadataObj.scenes) && metadataObj.scenes.length > 0;
  const hasForeshadowing = Array.isArray(metadataObj.foreshadowing) && metadataObj.foreshadowing.length > 0;

  return (
    <div
      className={`
        relative w-[200px] rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${config.bgColor} ${config.borderColor}
        ${selected ? 'ring-2 ring-white/30 shadow-lg' : ''}
        hover:shadow-md hover:brightness-110
        group
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-white/40 !border-0 hover:!bg-white/70 !transition-colors"
      />

      {/* Node Type Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
        >
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 pt-2.5">
        {/* Title */}
        <h3 className={`text-sm font-semibold ${config.color} truncate mb-1`}>
          {nodeData.title || '未命名节点'}
        </h3>

        {/* Description (2 lines max) */}
        {nodeData.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {nodeData.description}
          </p>
        )}

        {/* Metadata Indicators */}
        {(hasCharacters || hasScenes || hasForeshadowing) && (
          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5">
            {hasCharacters && (
              <div className="flex items-center gap-0.5 text-muted-foreground" title="关联角色">
                <Users size={10} />
                <span className="text-[9px]">
                  {(metadataObj.characters as unknown[]).length}
                </span>
              </div>
            )}
            {hasScenes && (
              <div className="flex items-center gap-0.5 text-muted-foreground" title="关联场景">
                <MapPin size={10} />
                <span className="text-[9px]">
                  {(metadataObj.scenes as unknown[]).length}
                </span>
              </div>
            )}
            {hasForeshadowing && (
              <div className="flex items-center gap-0.5 text-amber-400/70" title="伏笔">
                <Sparkles size={10} />
                <span className="text-[9px]">
                  {(metadataObj.foreshadowing as unknown[]).length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-white/40 !border-0 hover:!bg-white/70 !transition-colors"
      />

      {/* Subtle glow effect on hover */}
      <div
        className={`
          absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          ${nodeType === 'main' ? 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}
          ${nodeType === 'sub' ? 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''}
          ${nodeType === 'task' ? 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' : ''}
          ${nodeType === 'dungeon' ? 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' : ''}
          ${nodeType === 'scene' ? 'shadow-[0_0_15px_rgba(249,115,22,0.15)]' : ''}
          ${nodeType === 'event' ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}
        `}
      />
    </div>
  );
}

export const StoryNodeReactFlow = memo(StoryNodeComponent);
