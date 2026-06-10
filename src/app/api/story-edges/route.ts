import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const edges = await db.storyEdge.findMany({
      where: { projectId },
      include: {
        sourceNode: true,
        targetNode: true,
      },
    });

    return NextResponse.json(edges);
  } catch (error) {
    console.error('Get story edges error:', error);
    return NextResponse.json({ error: 'Failed to fetch story edges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, sourceId, targetId, label, edgeType, metadata } = body;

    if (!projectId || !sourceId || !targetId) {
      return NextResponse.json({ error: 'projectId, sourceId, and targetId are required' }, { status: 400 });
    }

    const edge = await db.storyEdge.create({
      data: {
        projectId,
        sourceId,
        targetId,
        label: label || '',
        edgeType: edgeType || 'causal',
        metadata: metadata || '{}',
      },
    });

    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error('Create story edge error:', error);
    return NextResponse.json({ error: 'Failed to create story edge' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, sourceId, targetId, label, edgeType, metadata } = body;

    if (!id) {
      return NextResponse.json({ error: 'Story edge ID is required' }, { status: 400 });
    }

    const edge = await db.storyEdge.update({
      where: { id },
      data: {
        ...(sourceId !== undefined && { sourceId }),
        ...(targetId !== undefined && { targetId }),
        ...(label !== undefined && { label }),
        ...(edgeType !== undefined && { edgeType }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return NextResponse.json(edge);
  } catch (error) {
    console.error('Update story edge error:', error);
    return NextResponse.json({ error: 'Failed to update story edge' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Story edge ID is required' }, { status: 400 });
    }

    await db.storyEdge.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete story edge error:', error);
    return NextResponse.json({ error: 'Failed to delete story edge' }, { status: 500 });
  }
}
