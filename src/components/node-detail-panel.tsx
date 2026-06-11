'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NODE_TYPE_CONFIG, type StoryNodeType } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Edit3,
  Trash2,
  Users,
  MapPin,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';

interface NodeDetailPanelProps {
  node: Node | null;
  edges: Edge[];
  allNodes: Node[];
  onClose: () => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onNavigateToNode: (nodeId: string) => void;
  onOpenInCreation: () => void;
}

interface StoryNodeData {
  nodeType: StoryNodeType;
  title: string;
  description: string;
  metadata: string;
  [key: string]: unknown;
}

export function NodeDetailPanel({
  node,
  edges,
  allNodes,
  onClose,
  onEdit,
  onDelete,
  onNavigateToNode,
  onOpenInCreation,
}: NodeDetailPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!node) return null;

  const data = node.data as unknown as StoryNodeData;
  const nodeType = (data.nodeType || 'main') as StoryNodeType;
  const config = NODE_TYPE_CONFIG[nodeType] || NODE_TYPE_CONFIG.main;

  // Parse metadata
  let metadataObj: Record<string, unknown> = {};
  try {
    metadataObj = JSON.parse(data.metadata || '{}');
  } catch {
    // ignore
  }

  // Find connected nodes
  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  );
  const connectedNodeIds = new Set(
    connectedEdges.flatMap((e) => [e.source, e.target]).filter((id) => id !== node.id)
  );
  const connectedNodes = allNodes.filter((n) => connectedNodeIds.has(n.id));

  const characters = (metadataObj.characters as string[]) || [];
  const scenes = (metadataObj.scenes as string[]) || [];
  const foreshadowing = (metadataObj.foreshadowing as string[]) || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-[360px] bg-card/95 backdrop-blur-md border-l border-border z-20 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
              {config.label}
            </span>
            <h3 className="text-sm font-semibold text-foreground truncate max-w-[200px]">
              {data.title || '未命名节点'}
            </h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Description */}
            {data.description && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">描述</label>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {data.description}
                </p>
              </div>
            )}

            {/* Connected Nodes */}
            {connectedNodes.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 block">
                  关联节点 ({connectedNodes.length})
                </label>
                <div className="space-y-1.5">
                  {connectedNodes.map((cn) => {
                    const cnData = cn.data as unknown as StoryNodeData;
                    const cnType = (cnData?.nodeType || 'main') as StoryNodeType;
                    const edge = connectedEdges.find(
                      (e) =>
                        (e.source === node.id && e.target === cn.id) ||
                        (e.source === cn.id && e.target === node.id)
                    );
                    const isOutgoing = edge?.source === node.id;

                    return (
                      <button
                        key={cn.id}
                        onClick={() => onNavigateToNode(cn.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              cnType === 'main' ? '#3b82f6' :
                              cnType === 'sub' ? '#10b981' :
                              cnType === 'task' ? '#f59e0b' :
                              cnType === 'dungeon' ? '#a855f7' :
                              cnType === 'scene' ? '#f97316' : '#ef4444',
                          }}
                        />
                        <span className="text-xs text-foreground truncate flex-1">
                          {cnData?.title || '未命名'}
                        </span>
                        <span className="text-muted-foreground">
                          {isOutgoing ? <ArrowRight size={10} /> : <ArrowRight size={10} className="rotate-180" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Characters */}
            {characters.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
                  <Users size={11} /> 关联角色 ({characters.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {characters.map((char, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Scenes */}
            {scenes.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
                  <MapPin size={11} /> 关联场景 ({scenes.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {scenes.map((scene, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {scene}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Foreshadowing */}
            {foreshadowing.length > 0 && (
              <div>
                <label className="text-xs text-amber-400/70 font-medium mb-2 flex items-center gap-1">
                  <Sparkles size={11} /> 伏笔 ({foreshadowing.length})
                </label>
                <div className="space-y-1">
                  {foreshadowing.map((fs, idx) => (
                    <div key={idx} className="text-xs text-foreground/70 px-2 py-1.5 rounded bg-amber-500/5 border border-amber-500/10">
                      {fs}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Position info */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">位置</label>
              <p className="text-xs text-muted-foreground/60 font-mono">
                X: {Math.round(node.position.x)}, Y: {Math.round(node.position.y)}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t border-border p-3 space-y-2 shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={() => onEdit(node.id)}
            >
              <Edit3 size={12} /> 编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={onOpenInCreation}
            >
              <ExternalLink size={12} /> 在创作中心打开
            </Button>
          </div>
          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-destructive hover:text-destructive gap-1"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={12} /> 删除节点
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  onDelete(node.id);
                  setShowDeleteConfirm(false);
                }}
              >
                确认删除
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
