import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const prompts = await db.promptTemplate.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Get prompts error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, type, content, isDefault } = body;

    if (!projectId || !name || !content) {
      return NextResponse.json({ error: 'projectId, name, and content are required' }, { status: 400 });
    }

    const prompt = await db.promptTemplate.create({
      data: {
        projectId,
        name,
        type: type || 'general',
        content,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Create prompt error:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, content, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const prompt = await db.promptTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Update prompt error:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    await db.promptTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete prompt error:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
