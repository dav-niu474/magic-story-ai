import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const worldSettings = await db.worldSetting.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(worldSettings);
  } catch (error) {
    console.error('Get world settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch world settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, description, rules, type, order, tags } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'projectId and name are required' }, { status: 400 });
    }

    const worldSetting = await db.worldSetting.create({
      data: {
        projectId,
        name,
        description: description || '',
        rules: rules || '',
        type: type || 'background',
        order: order ?? 0,
        tags: tags ? JSON.stringify(tags) : '[]',
        version: 1,
      },
    });

    return NextResponse.json(worldSetting, { status: 201 });
  } catch (error) {
    console.error('Create world setting error:', error);
    return NextResponse.json({ error: 'Failed to create world setting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, rules, type, order, tags, version } = body;

    if (!id) {
      return NextResponse.json({ error: 'World setting ID is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (rules !== undefined) data.rules = rules;
    if (type !== undefined) data.type = type;
    if (order !== undefined) data.order = order;
    if (tags !== undefined) data.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);
    if (version !== undefined) data.version = version;

    const worldSetting = await db.worldSetting.update({
      where: { id },
      data,
    });

    return NextResponse.json(worldSetting);
  } catch (error) {
    console.error('Update world setting error:', error);
    return NextResponse.json({ error: 'Failed to update world setting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'World setting ID is required' }, { status: 400 });
    }

    await db.worldSetting.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete world setting error:', error);
    return NextResponse.json({ error: 'Failed to delete world setting' }, { status: 500 });
  }
}
