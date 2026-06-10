import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const outlines = await db.outline.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
    });

    return NextResponse.json(outlines);
  } catch (error) {
    console.error('Get outlines error:', error);
    return NextResponse.json({ error: 'Failed to fetch outlines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, content } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const existingOutlines = await db.outline.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
      take: 1,
    });

    const nextVersion = existingOutlines.length > 0 ? existingOutlines[0].version + 1 : 1;

    const outline = await db.outline.create({
      data: {
        projectId,
        content: content || '',
        version: nextVersion,
      },
    });

    return NextResponse.json(outline, { status: 201 });
  } catch (error) {
    console.error('Create outline error:', error);
    return NextResponse.json({ error: 'Failed to create outline' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'Outline ID is required' }, { status: 400 });
    }

    const outline = await db.outline.update({
      where: { id },
      data: { content: content ?? undefined },
    });

    return NextResponse.json(outline);
  } catch (error) {
    console.error('Update outline error:', error);
    return NextResponse.json({ error: 'Failed to update outline' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Outline ID is required' }, { status: 400 });
    }

    await db.outline.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete outline error:', error);
    return NextResponse.json({ error: 'Failed to delete outline' }, { status: 500 });
  }
}
