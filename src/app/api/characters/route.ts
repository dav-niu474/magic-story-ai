import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const characters = await db.character.findMany({
      where: { projectId },
      include: {
        fromRelations: { include: { toCharacter: true } },
        toRelations: { include: { fromCharacter: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const relationships = await db.characterRelationship.findMany({
      where: { projectId },
      include: { fromCharacter: true, toCharacter: true },
    });

    return NextResponse.json({ characters, relationships });
  } catch (error) {
    console.error('Get characters error:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, age, role, personality, appearance, background, arc, portraitPrompt, tags } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'projectId and name are required' }, { status: 400 });
    }

    const character = await db.character.create({
      data: {
        projectId,
        name,
        age: age || '',
        role: role || '配角',
        personality: personality || '',
        appearance: appearance || '',
        background: background || '',
        arc: arc || '',
        portraitPrompt: portraitPrompt || '',
        tags: tags ? JSON.stringify(tags) : '[]',
        isFavorite: false,
        version: 1,
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('Create character error:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, age, role, personality, appearance, background, arc, portraitUrl, portraitPrompt, tags, isFavorite, version } = body;

    if (!id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (age !== undefined) data.age = age;
    if (role !== undefined) data.role = role;
    if (personality !== undefined) data.personality = personality;
    if (appearance !== undefined) data.appearance = appearance;
    if (background !== undefined) data.background = background;
    if (arc !== undefined) data.arc = arc;
    if (portraitUrl !== undefined) data.portraitUrl = portraitUrl;
    if (portraitPrompt !== undefined) data.portraitPrompt = portraitPrompt;
    if (isFavorite !== undefined) data.isFavorite = isFavorite;
    if (tags !== undefined) data.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);
    if (version !== undefined) data.version = version;

    const character = await db.character.update({
      where: { id },
      data,
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error('Update character error:', error);
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    await db.character.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete character error:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
