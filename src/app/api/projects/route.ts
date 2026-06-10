import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { chapters: true, characters: true, worldSettings: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        title,
        genre: genre || '玄幻系统修仙',
        description: description || '',
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, genre, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(genre !== undefined && { genre }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
