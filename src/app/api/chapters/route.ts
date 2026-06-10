import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const chapters = await db.chapter.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, order, title, outlineContent, content, status } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const wordCount = content ? content.length : 0;

    const chapter = await db.chapter.create({
      data: {
        projectId,
        order: order ?? 0,
        title: title || '',
        outlineContent: outlineContent || '',
        content: content || '',
        summary: body.summary || '',
        wordCount,
        status: status || 'draft',
        emotionTarget: body.emotionTarget || '',
        emotionArc: body.emotionArc || '',
        hookStart: body.hookStart || '',
        hookEnd: body.hookEnd || '',
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Create chapter error:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, order, outlineContent, content, summary, status, emotionTarget, emotionArc, hookStart, hookEnd } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    const wordCount = content !== undefined ? content.length : undefined;

    const chapter = await db.chapter.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order }),
        ...(outlineContent !== undefined && { outlineContent }),
        ...(content !== undefined && { content, wordCount: content.length }),
        ...(summary !== undefined && { summary }),
        ...(status !== undefined && { status }),
        ...(emotionTarget !== undefined && { emotionTarget }),
        ...(emotionArc !== undefined && { emotionArc }),
        ...(hookStart !== undefined && { hookStart }),
        ...(hookEnd !== undefined && { hookEnd }),
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Update chapter error:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    await db.chapter.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chapter error:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
