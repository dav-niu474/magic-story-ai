-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "magic_story";

-- CreateTable
CREATE TABLE "magic_story"."Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT NOT NULL DEFAULT '玄幻系统修仙',
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."Outline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."Character" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '主角',
    "personality" TEXT NOT NULL DEFAULT '',
    "appearance" TEXT NOT NULL DEFAULT '',
    "background" TEXT NOT NULL DEFAULT '',
    "arc" TEXT NOT NULL DEFAULT '',
    "portraitUrl" TEXT NOT NULL DEFAULT '',
    "portraitPrompt" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."CharacterRelationship" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromCharacterId" TEXT NOT NULL,
    "toCharacterId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT '盟友',
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CharacterRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."Plot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "plotType" TEXT NOT NULL DEFAULT 'main',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."Scene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "atmosphere" TEXT NOT NULL DEFAULT '',
    "timeOfDay" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."WorldSetting" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "rules" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'background',
    "order" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WorldSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."ProjectAssetLink" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "sourceAssetId" TEXT NOT NULL,
    "sourceProjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAssetLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."Chapter" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "outlineContent" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "emotionTarget" TEXT NOT NULL DEFAULT '',
    "emotionArc" TEXT NOT NULL DEFAULT '',
    "hookStart" TEXT NOT NULL DEFAULT '',
    "hookEnd" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."StoryState" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'character_state',
    "data" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."Foreshadowing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "expectedResolveChapter" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'planted',
    "importance" TEXT NOT NULL DEFAULT 'medium',

    CONSTRAINT "Foreshadowing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."StoryNode" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL DEFAULT 'main',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "color" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."StoryEdge" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "edgeType" TEXT NOT NULL DEFAULT 'causal',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."PromptTemplate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_story"."AgentLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "input" TEXT NOT NULL DEFAULT '',
    "output" TEXT NOT NULL DEFAULT '',
    "toolCalls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "magic_story"."Outline" ADD CONSTRAINT "Outline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."Character" ADD CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."CharacterRelationship" ADD CONSTRAINT "CharacterRelationship_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."CharacterRelationship" ADD CONSTRAINT "CharacterRelationship_fromCharacterId_fkey" FOREIGN KEY ("fromCharacterId") REFERENCES "magic_story"."Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."CharacterRelationship" ADD CONSTRAINT "CharacterRelationship_toCharacterId_fkey" FOREIGN KEY ("toCharacterId") REFERENCES "magic_story"."Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."Plot" ADD CONSTRAINT "Plot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."WorldSetting" ADD CONSTRAINT "WorldSetting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."ProjectAssetLink" ADD CONSTRAINT "ProjectAssetLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."Chapter" ADD CONSTRAINT "Chapter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."StoryState" ADD CONSTRAINT "StoryState_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."StoryState" ADD CONSTRAINT "StoryState_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "magic_story"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."Foreshadowing" ADD CONSTRAINT "Foreshadowing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."Foreshadowing" ADD CONSTRAINT "Foreshadowing_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "magic_story"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."StoryNode" ADD CONSTRAINT "StoryNode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."StoryEdge" ADD CONSTRAINT "StoryEdge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."StoryEdge" ADD CONSTRAINT "StoryEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "magic_story"."StoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."StoryEdge" ADD CONSTRAINT "StoryEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "magic_story"."StoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."PromptTemplate" ADD CONSTRAINT "PromptTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_story"."AgentLog" ADD CONSTRAINT "AgentLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "magic_story"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
