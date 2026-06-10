import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, fromCharacterId, toCharacterId, type, description } = body;

    if (!projectId || !fromCharacterId || !toCharacterId) {
      return NextResponse.json({ error: 'projectId, fromCharacterId, toCharacterId are required' }, { status: 400 });
    }

    const relationship = await db.characterRelationship.create({
      data: {
        projectId,
        fromCharacterId,
        toCharacterId,
        type: type || '盟友',
        description: description || '',
      },
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    console.error('Create relationship error:', error);
    return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Relationship ID is required' }, { status: 400 });
    }

    const relationship = await db.characterRelationship.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(relationship);
  } catch (error) {
    console.error('Update relationship error:', error);
    return NextResponse.json({ error: 'Failed to update relationship' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Relationship ID is required' }, { status: 400 });
    }

    await db.characterRelationship.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete relationship error:', error);
    return NextResponse.json({ error: 'Failed to delete relationship' }, { status: 500 });
  }
}
