'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

type EdgeType = 'causal' | 'temporal' | 'character' | 'foreshadow';

const EDGE_TYPE_CONFIG: Record<EdgeType, { color: string; label: string }> = {
  causal: { color: '#3b82f6', label: '因果' },
  temporal: { color: '#10b981', label: '时间' },
  character: { color: '#f43f5e', label: '角色' },
  foreshadow: { color: '#f59e0b', label: '伏笔' },
};

function StoryEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
  selected,
  style = {},
}: EdgeProps) {
  const edgeType = ((data?.edgeType as string) || 'causal') as EdgeType;
  const config = EDGE_TYPE_CONFIG[edgeType] || EDGE_TYPE_CONFIG.causal;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isForeshadow = edgeType === 'foreshadow';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? config.color : `${config.color}99`,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: isForeshadow ? '8 4' : undefined,
          animation: isForeshadow ? 'dashmove 1s linear infinite' : undefined,
          ...style,
        }}
      />

      {/* Edge label */}
      {(label || isForeshadow) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span
              className={`
                text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap
                border backdrop-blur-sm
                ${selected ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
              `}
              style={{
                color: config.color,
                backgroundColor: `${config.color}15`,
                borderColor: `${config.color}40`,
              }}
            >
              {label || config.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const StoryEdgeReactFlow = memo(StoryEdgeComponent);
