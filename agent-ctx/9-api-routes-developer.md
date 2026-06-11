# Task 9 - API Routes Developer

## Task
Create/update API routes for new Prisma models and update existing routes.

## Work Completed

### Updated Routes (2)
1. **`/src/app/api/characters/route.ts`** - Added `portraitUrl`, `portraitPrompt`, `tags`, `isFavorite`, `version` fields to POST and PUT handlers
2. **`/src/app/api/agent-logs/route.ts`** - Added `toolCalls` field (default `"[]"`) to POST handler

### Created Routes (6)
1. **`/src/app/api/plots/route.ts`** - Full CRUD for Plot model (GET filtered by projectId, ordered by order+priority; POST with all fields; PUT with partial updates; DELETE by id)
2. **`/src/app/api/scenes/route.ts`** - Full CRUD for Scene model (GET filtered by projectId, ordered by order; POST/PUT/DELETE)
3. **`/src/app/api/story-nodes/route.ts`** - Full CRUD for StoryNode model (GET includes sourceEdges/targetEdges relations; POST with positionX/Y, metadata JSON; PUT with partial updates; DELETE)
4. **`/src/app/api/story-edges/route.ts`** - Full CRUD for StoryEdge model (GET includes sourceNode/targetNode; POST requires sourceId+targetId; PUT/DELETE)
5. **`/src/app/api/asset-links/route.ts`** - CRUD for ProjectAssetLink (GET with optional assetType filter; POST with duplicate detection returning 409; DELETE by id)
6. **`/src/app/api/generate-portrait/route.ts`** - POST-only endpoint using z-ai-web-dev-sdk for AI image generation, returns b64_json/url/revised_prompt

## Patterns Followed
- All routes use `import { db } from '@/lib/db'`
- All routes use `NextRequest`/`NextResponse` from 'next/server'
- GET: query params for filtering, orderBy for sorting
- POST: `request.json()` body, returns 201 on success
- PUT: spread operator for partial field updates (`...(field !== undefined && { field })`)
- DELETE: query param `id`, returns `{ success: true }`
- Error handling: try/catch with console.error and 500 status

## Verification
- `bun run lint` passed with zero errors
- `bun run db:push` confirmed database in sync
