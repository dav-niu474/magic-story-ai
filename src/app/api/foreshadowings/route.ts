import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const chapterId = searchParams.get('chapterId');
    const id = searchParams.get('id');

    if (id) {
      const foreshadow = await db.foreshadowing.findUnique({ where: { id } });
      return NextResponse.json(foreshadow);
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { projectId };
    if (chapterId) where.chapterId = chapterId;

    const foreshadowings = await db.foreshadowing.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(foreshadowings);
  } catch (error) {
    console.error('Failed to fetch foreshadowings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, chapterId, content, expectedResolveChapter, status, importance } = body;

    if (!projectId || !chapterId) {
      return NextResponse.json({ error: 'projectId and chapterId are required' }, { status: 400 });
    }

    const foreshadow = await db.foreshadowing.create({
      data: {
        projectId,
        chapterId,
        content: content || '',
        expectedResolveChapter: expectedResolveChapter || 0,
        status: status || 'planted',
        importance: importance || 'medium',
      },
    });

    return NextResponse.json(foreshadow);
  } catch (error) {
    console.error('Failed to create foreshadowing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, expectedResolveChapter, status, importance } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (expectedResolveChapter !== undefined) updateData.expectedResolveChapter = expectedResolveChapter;
    if (status) updateData.status = status;
    if (importance) updateData.importance = importance;

    const foreshadow = await db.foreshadowing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(foreshadow);
  } catch (error) {
    console.error('Failed to update foreshadowing:', error);
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

    await db.foreshadowing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete foreshadowing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
