import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const chapterId = searchParams.get('chapterId');
    const id = searchParams.get('id');

    if (id) {
      const state = await db.storyState.findUnique({ where: { id } });
      return NextResponse.json(state);
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { projectId };
    if (chapterId) where.chapterId = chapterId;

    const states = await db.storyState.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(states);
  } catch (error) {
    console.error('Failed to fetch story states:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, chapterId, type, data } = body;

    if (!projectId || !chapterId) {
      return NextResponse.json({ error: 'projectId and chapterId are required' }, { status: 400 });
    }

    const state = await db.storyState.create({
      data: {
        projectId,
        chapterId,
        type: type || 'character_state',
        data: typeof data === 'string' ? data : JSON.stringify(data),
      },
    });

    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to create story state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (type) updateData.type = type;
    if (data) updateData.data = typeof data === 'string' ? data : JSON.stringify(data);

    const state = await db.storyState.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to update story state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.storyState.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete story state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
