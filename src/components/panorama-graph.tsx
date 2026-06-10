'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore, type StoryNodeType, NODE_TYPE_CONFIG } from '@/lib/store';
import { StoryNodeReactFlow } from '@/components/story-node';
import { StoryEdgeReactFlow } from '@/components/story-edge';
import { GraphToolbar } from '@/components/graph-toolbar';
import { NodeDetailPanel } from '@/components/node-detail-panel';
import { layoutNodes } from '@/lib/graph-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Network } from 'lucide-react';

// ==========================================
// Custom node/edge types - MUST be defined outside component
// ==========================================
const nodeTypes: NodeTypes = {
  storyNode: StoryNodeReactFlow,
};

const edgeTypes: EdgeTypes = {
  storyEdge: StoryEdgeReactFlow,
};

// ==========================================
// DB data types
// ==========================================
interface DbStoryNode {
  id: string;
  projectId: string;
  nodeType: string;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
  metadata: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface DbStoryEdge {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  label: string;
  edgeType: string;
  metadata: string;
  createdAt: string;
}

// ==========================================
// Conversion helpers
// ==========================================
function dbNodeToFlowNode(dbNode: DbStoryNode): Node {
  return {
    id: dbNode.id,
    type: 'storyNode',
    position: { x: dbNode.positionX, y: dbNode.positionY },
    data: {
      nodeType: dbNode.nodeType,
      title: dbNode.title,
      description: dbNode.description,
      metadata: dbNode.metadata,
      color: dbNode.color,
      order: dbNode.order,
    },
  };
}

function dbEdgeToFlowEdge(dbEdge: DbStoryEdge): Edge {
  return {
    id: dbEdge.id,
    source: dbEdge.sourceId,
    target: dbEdge.targetId,
    type: 'storyEdge',
    label: dbEdge.label || undefined,
    data: {
      edgeType: dbEdge.edgeType,
      metadata: dbEdge.metadata,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: getEdgeColor(dbEdge.edgeType),
    },
  };
}

function getEdgeColor(edgeType: string): string {
  switch (edgeType) {
    case 'causal': return '#3b82f6';
    case 'temporal': return '#10b981';
    case 'character': return '#f43f5e';
    case 'foreshadow': return '#f59e0b';
    default: return '#3b82f6';
  }
}

// ==========================================
// Main Component
// ==========================================
interface PanoramaGraphProps {
  projectId: string;
}

export function PanoramaGraph({ projectId }: PanoramaGraphProps) {
  const {
    graphFilter,
    selectedNodeId,
    setSelectedNodeId,
    setSidePanel,
    setCoreModule,
    setCreationSubView,
  } = useAppStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const [allEdges, setAllEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Form state for add/edit
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNodeType, setFormNodeType] = useState<StoryNodeType>('main');
  const [formEdgeType, setFormEdgeType] = useState<string>('causal');

  const reactFlowInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [nodesRes, edgesRes] = await Promise.all([
        fetch(`/api/story-nodes?projectId=${projectId}`),
        fetch(`/api/story-edges?projectId=${projectId}`),
      ]);

      if (nodesRes.ok && edgesRes.ok) {
        const dbNodes: DbStoryNode[] = await nodesRes.json();
        const dbEdges: DbStoryEdge[] = await edgesRes.json();

        const flowNodes = dbNodes.map(dbNodeToFlowNode);
        const flowEdges = dbEdges.map(dbEdgeToFlowEdge);

        setAllNodes(flowNodes);
        setAllEdges(flowEdges);
      }
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
      toast.error('加载图谱数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setAllNodes, setAllEdges]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filter
  useEffect(() => {
    const filtered = allNodes.filter((n) => {
      const data = n.data as { nodeType?: string };
      return graphFilter.includes((data?.nodeType || 'main') as StoryNodeType);
    });
    setNodes(filtered);

    // Filter edges to only include those between visible nodes
    const visibleNodeIds = new Set(filtered.map((n) => n.id));
    const filteredEdges = allEdges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
    setEdges(filteredEdges);
  }, [allNodes, allEdges, graphFilter, setNodes, setEdges]);

  // Save node position on drag stop
  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      try {
        await fetch('/api/story-nodes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: node.id,
            positionX: node.position.x,
            positionY: node.position.y,
          }),
        });
      } catch (error) {
        console.error('Failed to save node position:', error);
      }
    },
    []
  );

  // Handle new connection
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      try {
        const res = await fetch('/api/story-edges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            sourceId: connection.source,
            targetId: connection.target,
            edgeType: 'causal',
            label: '',
          }),
        });

        if (res.ok) {
          const newEdge = await res.json();
          const flowEdge = dbEdgeToFlowEdge(newEdge);
          setAllEdges((prev) => [...prev, flowEdge]);
          toast.success('连线创建成功');
        }
      } catch (error) {
        console.error('Failed to create edge:', error);
        toast.error('创建连线失败');
      }
    },
    [projectId, setAllEdges]
  );

  // Handle node click (select)
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setSidePanel('nodeDetail');
    },
    [setSelectedNodeId, setSidePanel]
  );

  // Handle background click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSidePanel('none');
  }, [setSelectedNodeId, setSidePanel]);

  // Toolbar actions
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.current?.zoomOut();
  }, []);

  const handleFitView = useCallback(() => {
    reactFlowInstance.current?.fitView({ padding: 0.2 });
  }, []);

  const handleAutoLayout = useCallback(() => {
    const laidOut = layoutNodes(allNodes as Node[], allEdges);
    setAllNodes(laidOut);
    // Save all positions
    laidOut.forEach(async (node) => {
      try {
        await fetch('/api/story-nodes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: node.id,
            positionX: node.position.x,
            positionY: node.position.y,
          }),
        });
      } catch {
        // silent fail for batch updates
      }
    });
    toast.success('自动布局完成');
  }, [allNodes, allEdges, setAllNodes]);

  // Add node
  const handleAddNode = useCallback(() => {
    setFormTitle('');
    setFormDescription('');
    setFormNodeType('main');
    setShowAddDialog(true);
  }, []);

  const submitAddNode = useCallback(async () => {
    if (!formTitle.trim()) {
      toast.error('请输入节点标题');
      return;
    }

    try {
      // Place new node near center of current view
      const viewport = reactFlowInstance.current?.getViewport();
      const x = viewport ? -viewport.x / (viewport.zoom || 1) + 300 : 300;
      const y = viewport ? -viewport.y / (viewport.zoom || 1) + 200 : 200;

      const res = await fetch('/api/story-nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          nodeType: formNodeType,
          positionX: x + Math.random() * 50,
          positionY: y + Math.random() * 50,
        }),
      });

      if (res.ok) {
        const newNode = await res.json();
        setAllNodes((prev) => [...prev, dbNodeToFlowNode(newNode)]);
        setShowAddDialog(false);
        toast.success('节点创建成功');
      }
    } catch (error) {
      console.error('Failed to add node:', error);
      toast.error('创建节点失败');
    }
  }, [projectId, formTitle, formDescription, formNodeType, setAllNodes]);

  // Edit node
  const handleEditNode = useCallback(
    (nodeId: string) => {
      const node = allNodes.find((n) => n.id === nodeId);
      if (!node) return;
      const data = node.data as { title?: string; description?: string; nodeType?: string };
      setFormTitle(data.title || '');
      setFormDescription(data.description || '');
      setFormNodeType((data.nodeType || 'main') as StoryNodeType);
      setEditingNodeId(nodeId);
      setShowEditDialog(true);
    },
    [allNodes]
  );

  const submitEditNode = useCallback(async () => {
    if (!editingNodeId || !formTitle.trim()) return;

    try {
      const res = await fetch('/api/story-nodes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNodeId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          nodeType: formNodeType,
        }),
      });

      if (res.ok) {
        const updatedNode = await res.json();
        setAllNodes((prev) =>
          prev.map((n) => (n.id === editingNodeId ? dbNodeToFlowNode(updatedNode) : n))
        );
        setShowEditDialog(false);
        setEditingNodeId(null);
        toast.success('节点更新成功');
      }
    } catch (error) {
      console.error('Failed to update node:', error);
      toast.error('更新节点失败');
    }
  }, [editingNodeId, formTitle, formDescription, formNodeType, setAllNodes]);

  // Delete node
  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      try {
        const res = await fetch(`/api/story-nodes?id=${nodeId}`, { method: 'DELETE' });
        if (res.ok) {
          setAllNodes((prev) => prev.filter((n) => n.id !== nodeId));
          setAllEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
          setSelectedNodeId(null);
          setSidePanel('none');
          toast.success('节点已删除');
        }
      } catch (error) {
        console.error('Failed to delete node:', error);
        toast.error('删除节点失败');
      }
    },
    [setAllNodes, setAllEdges, setSelectedNodeId, setSidePanel]
  );

  // Navigate to another node
  const handleNavigateToNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      reactFlowInstance.current?.setCenter(
        allNodes.find((n) => n.id === nodeId)?.position.x || 0,
        allNodes.find((n) => n.id === nodeId)?.position.y || 0,
        { zoom: 1.2, duration: 300 }
      );
    },
    [allNodes, setSelectedNodeId]
  );

  // Open in creation center
  const handleOpenInCreation = useCallback(() => {
    setCoreModule('creation');
    setCreationSubView('chapters');
  }, [setCoreModule, setCreationSubView]);

  // Search nodes
  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        // Reset filter to show all
        const filtered = allNodes.filter((n) => {
          const data = n.data as { nodeType?: string };
          return graphFilter.includes((data?.nodeType || 'main') as StoryNodeType);
        });
        setNodes(filtered);
        return;
      }

      const q = query.toLowerCase();
      const filtered = allNodes.filter((n) => {
        const data = n.data as { title?: string; description?: string; nodeType?: string };
        const matchesFilter = graphFilter.includes((data?.nodeType || 'main') as StoryNodeType);
        const matchesSearch =
          (data.title || '').toLowerCase().includes(q) ||
          (data.description || '').toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
      });
      setNodes(filtered);

      if (filtered.length > 0) {
        reactFlowInstance.current?.fitView({ nodes: filtered, padding: 0.3, duration: 300 });
      }
    },
    [allNodes, graphFilter, setNodes]
  );

  // Selected node data for detail panel
  const selectedNode = useMemo(
    () => allNodes.find((n) => n.id === selectedNodeId) || null,
    [allNodes, selectedNodeId]
  );

  // Edge deletion handler
  const onEdgesDelete = useCallback(
    async (edgesToDelete: Edge[]) => {
      for (const edge of edgesToDelete) {
        try {
          await fetch(`/api/story-edges?id=${edge.id}`, { method: 'DELETE' });
          setAllEdges((prev) => prev.filter((e) => e.id !== edge.id));
        } catch (error) {
          console.error('Failed to delete edge:', error);
        }
      }
      toast.success('连线已删除');
    },
    [setAllEdges]
  );

  // MiniMap node color
  const miniMapNodeColor = useCallback((node: Node) => {
    const data = node.data as { nodeType?: string };
    switch (data?.nodeType) {
      case 'main': return '#3b82f6';
      case 'sub': return '#10b981';
      case 'task': return '#f59e0b';
      case 'dungeon': return '#a855f7';
      case 'scene': return '#f97316';
      case 'event': return '#ef4444';
      default: return '#3b82f6';
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">加载图谱数据...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar */}
      <GraphToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
        onAddNode={handleAddNode}
        onSearch={handleSearch}
      />

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'storyEdge',
          }}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255, 255, 255, 0.05)"
          />
          <MiniMap
            nodeColor={miniMapNodeColor}
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{
              backgroundColor: 'rgba(15, 15, 25, 0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
            }}
          />
        </ReactFlow>

        {/* Empty State */}
        {allNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Network size={48} className="mx-auto mb-3 text-muted-foreground/30" />
              <h3 className="text-lg font-medium text-muted-foreground/50 mb-1">全景图谱</h3>
              <p className="text-sm text-muted-foreground/30 mb-4">
                可视化你的故事叙事结构
              </p>
              <Button
                variant="outline"
                size="sm"
                className="pointer-events-auto"
                onClick={handleAddNode}
              >
                创建第一个节点
              </Button>
            </div>
          </div>
        )}

        {/* Node Detail Panel */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            edges={allEdges}
            allNodes={allNodes}
            onClose={() => {
              setSelectedNodeId(null);
              setSidePanel('none');
            }}
            onEdit={handleEditNode}
            onDelete={handleDeleteNode}
            onNavigateToNode={handleNavigateToNode}
            onOpenInCreation={handleOpenInCreation}
          />
        )}
      </div>

      {/* Add Node Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加故事节点</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">节点标题</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="输入节点标题..."
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">节点类型</label>
              <Select value={formNodeType} onValueChange={(v) => setFormNodeType(v as StoryNodeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          key === 'main' ? 'bg-blue-400' :
                          key === 'sub' ? 'bg-emerald-400' :
                          key === 'task' ? 'bg-amber-400' :
                          key === 'dungeon' ? 'bg-purple-400' :
                          key === 'scene' ? 'bg-orange-400' : 'bg-red-400'
                        }`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">描述</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="描述这个节点..."
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={submitAddNode} disabled={!formTitle.trim()}>
              创建节点
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑故事节点</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">节点标题</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="输入节点标题..."
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">节点类型</label>
              <Select value={formNodeType} onValueChange={(v) => setFormNodeType(v as StoryNodeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          key === 'main' ? 'bg-blue-400' :
                          key === 'sub' ? 'bg-emerald-400' :
                          key === 'task' ? 'bg-amber-400' :
                          key === 'dungeon' ? 'bg-purple-400' :
                          key === 'scene' ? 'bg-orange-400' : 'bg-red-400'
                        }`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">描述</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="描述这个节点..."
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={submitEditNode} disabled={!formTitle.trim()}>
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
