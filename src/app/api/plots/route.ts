import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const plots = await db.plot.findMany({
      where: { projectId },
      orderBy: [{ order: 'asc' }, { priority: 'desc' }],
    });

    return NextResponse.json(plots);
  } catch (error) {
    console.error('Get plots error:', error);
    return NextResponse.json({ error: 'Failed to fetch plots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, description, plotType, priority, status, tags, order, version } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'projectId and name are required' }, { status: 400 });
    }

    const plot = await db.plot.create({
      data: {
        projectId,
        name,
        description: description || '',
        plotType: plotType || 'main',
        priority: priority ?? 0,
        status: status || 'planned',
        tags: tags || '[]',
        order: order ?? 0,
        version: version ?? 1,
      },
    });

    return NextResponse.json(plot, { status: 201 });
  } catch (error) {
    console.error('Create plot error:', error);
    return NextResponse.json({ error: 'Failed to create plot' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, plotType, priority, status, tags, order, version } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plot ID is required' }, { status: 400 });
    }

    const plot = await db.plot.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(plotType !== undefined && { plotType }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(tags !== undefined && { tags }),
        ...(order !== undefined && { order }),
        ...(version !== undefined && { version }),
      },
    });

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Update plot error:', error);
    return NextResponse.json({ error: 'Failed to update plot' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Plot ID is required' }, { status: 400 });
    }

    await db.plot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plot error:', error);
    return NextResponse.json({ error: 'Failed to delete plot' }, { status: 500 });
  }
}
