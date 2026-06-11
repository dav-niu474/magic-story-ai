import type { Node, Edge } from '@xyflow/react';

/**
 * Layout algorithm for auto-arranging story graph nodes.
 * Uses a topological sort based on edge connections,
 * then assigns positions in a left-to-right flow with
 * main nodes centered and sub/task nodes above/below.
 */

interface LayoutNode extends Node {
  data: {
    nodeType?: string;
    title?: string;
    [key: string]: unknown;
  };
}

const HORIZONTAL_SPACING = 280;
const VERTICAL_SPACING = 120;
const MAIN_VERTICAL_CENTER = 400;
const NODE_WIDTH = 200;

type NodeType = 'main' | 'sub' | 'task' | 'dungeon' | 'scene' | 'event';

function getNodeLayer(nodeType?: string): number {
  const t = (nodeType || 'main') as NodeType;
  switch (t) {
    case 'main': return 0;
    case 'sub': return -1;
    case 'task': return 1;
    case 'dungeon': return -2;
    case 'scene': return 2;
    case 'event': return -1;
    default: return 0;
  }
}

/**
 * Build adjacency list and compute in-degree for topological sort
 */
function topologicalSort(nodes: LayoutNode[], edges: Edge[]): string[] {
  const nodeIds = new Set(nodes.map(n => n.id));
  const adjacency: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  // Initialize
  for (const node of nodes) {
    adjacency[node.id] = [];
    inDegree[node.id] = 0;
  }

  // Build edges (only between existing nodes)
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacency[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const id of nodeIds) {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Add any remaining nodes (cycles or disconnected)
  for (const id of nodeIds) {
    if (!sorted.includes(id)) {
      sorted.push(id);
    }
  }

  return sorted;
}

/**
 * Layout nodes using topological sort with grid arrangement.
 * Main nodes flow horizontally in the center.
 * Other node types are placed above/below based on their layer.
 */
export function layoutNodes(nodes: LayoutNode[], edges: Edge[]): LayoutNode[] {
  if (nodes.length === 0) return nodes;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const sorted = topologicalSort(nodes, edges);

  // Group nodes by their column (position in topological sort)
  // Also track which nodes share the same column level
  const visited = new Set<string>();
  const columns: string[][] = [];
  const nodeColumn: Record<string, number> = {};

  // Assign columns based on topological order
  // Nodes with no incoming edges start at column 0
  // Each edge pushes the target one column further than its source
  const inEdges: Record<string, string[]> = {};
  for (const node of nodes) {
    inEdges[node.id] = [];
  }
  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      inEdges[edge.target].push(edge.source);
    }
  }

  // BFS to assign column levels
  const columnQueue: string[] = [];
  for (const id of sorted) {
    const sources = inEdges[id];
    if (sources.length === 0) {
      nodeColumn[id] = 0;
      columnQueue.push(id);
    } else {
      nodeColumn[id] = Math.max(...sources.map(s => (nodeColumn[s] ?? 0) + 1));
    }
  }

  // Group by column
  const maxColumn = Math.max(0, ...Object.values(nodeColumn));
  for (let c = 0; c <= maxColumn; c++) {
    columns.push([]);
  }
  for (const id of sorted) {
    const col = nodeColumn[id] ?? 0;
    columns[col].push(id);
  }

  // Assign positions
  const result: LayoutNode[] = nodes.map(node => {
    const col = nodeColumn[node.id] ?? 0;
    const colNodes = columns[col];
    const rowInCol = colNodes.indexOf(node.id);

    const layer = getNodeLayer(node.data?.nodeType as string);

    // Calculate vertical position
    // Main nodes are centered, others offset by layer
    const colCenterOffset = (colNodes.length - 1) / 2;
    const baseY = MAIN_VERTICAL_CENTER + (rowInCol - colCenterOffset) * VERTICAL_SPACING;

    // Apply layer offset for non-main types
    const yOffset = layer * VERTICAL_SPACING * 1.5;

    return {
      ...node,
      position: {
        x: col * HORIZONTAL_SPACING + 50,
        y: baseY + yOffset,
      },
    };
  });

  return result;
}

/**
 * Simple force-directed layout as an alternative.
 * Useful for graphs without clear directionality.
 */
export function forceDirectedLayout(
  nodes: LayoutNode[],
  edges: Edge[],
  iterations: number = 50
): LayoutNode[] {
  if (nodes.length === 0) return nodes;

  const positions = new Map<string, { x: number; y: number }>();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Initialize positions (use existing or random)
  for (const node of nodes) {
    positions.set(node.id, {
      x: node.position?.x ?? Math.random() * 600,
      y: node.position?.y ?? Math.random() * 600,
    });
  }

  const REPULSION = 5000;
  const ATTRACTION = 0.01;
  const DAMPING = 0.9;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
      forces.set(node.id, { x: 0, y: 0 });
    }

    // Repulsion between all pairs
    const nodeIds = nodes.map(n => n.id);
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = positions.get(nodeIds[i])!;
        const b = positions.get(nodeIds[j])!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        forces.get(nodeIds[i])!.x += fx;
        forces.get(nodeIds[i])!.y += fy;
        forces.get(nodeIds[j])!.x -= fx;
        forces.get(nodeIds[j])!.y -= fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      if (!positions.has(edge.source) || !positions.has(edge.target)) continue;
      const a = positions.get(edge.source)!;
      const b = positions.get(edge.target)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const idealDist = HORIZONTAL_SPACING;
      const force = (dist - idealDist) * ATTRACTION;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      forces.get(edge.source)!.x += fx;
      forces.get(edge.source)!.y += fy;
      forces.get(edge.target)!.x -= fx;
      forces.get(edge.target)!.y -= fy;
    }

    // Apply forces
    for (const node of nodes) {
      const pos = positions.get(node.id)!;
      const f = forces.get(node.id)!;
      pos.x += f.x * DAMPING;
      pos.y += f.y * DAMPING;
      // Keep within bounds
      pos.x = Math.max(-500, Math.min(3000, pos.x));
      pos.y = Math.max(-500, Math.min(3000, pos.y));
    }
  }

  return nodes.map(node => {
    const pos = positions.get(node.id)!;
    return {
      ...node,
      position: { x: pos.x, y: pos.y },
    };
  });
}
