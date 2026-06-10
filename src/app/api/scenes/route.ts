import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const scenes = await db.scene.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(scenes);
  } catch (error) {
    console.error('Get scenes error:', error);
    return NextResponse.json({ error: 'Failed to fetch scenes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, description, location, atmosphere, timeOfDay, tags, order, version } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'projectId and name are required' }, { status: 400 });
    }

    const scene = await db.scene.create({
      data: {
        projectId,
        name,
        description: description || '',
        location: location || '',
        atmosphere: atmosphere || '',
        timeOfDay: timeOfDay || '',
        tags: tags || '[]',
        order: order ?? 0,
        version: version ?? 1,
      },
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error('Create scene error:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, location, atmosphere, timeOfDay, tags, order, version } = body;

    if (!id) {
      return NextResponse.json({ error: 'Scene ID is required' }, { status: 400 });
    }

    const scene = await db.scene.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(atmosphere !== undefined && { atmosphere }),
        ...(timeOfDay !== undefined && { timeOfDay }),
        ...(tags !== undefined && { tags }),
        ...(order !== undefined && { order }),
        ...(version !== undefined && { version }),
      },
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Update scene error:', error);
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Scene ID is required' }, { status: 400 });
    }

    await db.scene.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete scene error:', error);
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}
