import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const nodes = await db.storyNode.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Get story nodes error:', error);
    return NextResponse.json({ error: 'Failed to fetch story nodes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, nodeType, title, description, positionX, positionY, metadata, color, order } = body;

    if (!projectId || !title) {
      return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 });
    }

    const node = await db.storyNode.create({
      data: {
        projectId,
        nodeType: nodeType || 'main',
        title,
        description: description || '',
        positionX: positionX ?? 0,
        positionY: positionY ?? 0,
        metadata: metadata || '{}',
        color: color || '',
        order: order ?? 0,
      },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('Create story node error:', error);
    return NextResponse.json({ error: 'Failed to create story node' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nodeType, title, description, positionX, positionY, metadata, color, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Story node ID is required' }, { status: 400 });
    }

    const node = await db.storyNode.update({
      where: { id },
      data: {
        ...(nodeType !== undefined && { nodeType }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(positionX !== undefined && { positionX }),
        ...(positionY !== undefined && { positionY }),
        ...(metadata !== undefined && { metadata }),
        ...(color !== undefined && { color }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error('Update story node error:', error);
    return NextResponse.json({ error: 'Failed to update story node' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Story node ID is required' }, { status: 400 });
    }

    await db.storyNode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete story node error:', error);
    return NextResponse.json({ error: 'Failed to delete story node' }, { status: 500 });
  }
}
