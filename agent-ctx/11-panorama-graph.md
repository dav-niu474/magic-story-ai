# Task 11 - Panorama Graph (全景图谱) Module

## Agent: Full-stack Developer Subagent

## Task
Build the Panorama Graph (全景图谱) module - a visual narrative map using React Flow

## Files Created

### Backend
- `/src/app/api/story-nodes/route.ts` - Full CRUD API for StoryNode model
- `/src/app/api/story-edges/route.ts` - Full CRUD API for StoryEdge model

### Library
- `/src/lib/graph-layout.ts` - Layout algorithms (topological sort + force-directed)

### Components
- `/src/components/story-node.tsx` - Custom React Flow node component (6 color-coded types)
- `/src/components/story-edge.tsx` - Custom React Flow edge component (4 edge types)
- `/src/components/graph-toolbar.tsx` - Toolbar with filters, zoom, layout, search
- `/src/components/node-detail-panel.tsx` - Slide-in detail panel with Framer Motion
- `/src/components/panorama-graph.tsx` - Main container with React Flow canvas

### Modified Files
- `/src/app/page.tsx` - Replaced graph placeholder with PanoramaGraph component
- `/src/app/globals.css` - Added React Flow CSS overrides and animations

## Key Decisions
1. Used `@xyflow/react` v12 import path (not `reactflow`)
2. Custom nodeTypes and edgeTypes defined OUTSIDE component for React Flow v12 stability
3. Separate `allNodes`/`allEdges` state from filtered `nodes`/`edges` state for React Flow
4. Position auto-save on drag stop via PUT /api/story-nodes
5. NODE_TYPE_CONFIG from store reused for consistent styling across all components
6. Foreshadow edges use animated CSS dashes via @keyframes dashmove

## Dependencies
- `@xyflow/react` v12.11.0 (already installed)
- `framer-motion` (already installed)
- `sonner` for toast notifications (already installed)

## Sample Data
Created 5 test nodes + 4 edges for project "cmq6ex16r0000ktxfw83xdovu" (测试小说):
- Nodes: 开局觉醒(main), 入学测试(main), 灵兽森林(dungeon), 神秘老者(event), 学院大比(task), 身世之谜(sub)
- Edges: 开局觉醒→入学测试(temporal), 入学测试→神秘老者(causal), 开局觉醒→身世之谜(foreshadow), 灵兽森林→学院大比(character)

## Status
✅ Complete - All lint checks pass, API endpoints verified, module integrated into page.tsx
