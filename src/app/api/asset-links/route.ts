import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assetType = searchParams.get('assetType');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const links = await db.projectAssetLink.findMany({
      where: {
        projectId,
        ...(assetType && { assetType }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Get asset links error:', error);
    return NextResponse.json({ error: 'Failed to fetch asset links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, assetType, sourceAssetId, sourceProjectId } = body;

    if (!projectId || !assetType || !sourceAssetId || !sourceProjectId) {
      return NextResponse.json({ error: 'projectId, assetType, sourceAssetId, and sourceProjectId are required' }, { status: 400 });
    }

    // Check for duplicate
    const existing = await db.projectAssetLink.findFirst({
      where: {
        projectId,
        assetType,
        sourceAssetId,
        sourceProjectId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Asset link already exists', link: existing }, { status: 409 });
    }

    const link = await db.projectAssetLink.create({
      data: {
        projectId,
        assetType,
        sourceAssetId,
        sourceProjectId,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Create asset link error:', error);
    return NextResponse.json({ error: 'Failed to create asset link' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset link ID is required' }, { status: 400 });
    }

    await db.projectAssetLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete asset link error:', error);
    return NextResponse.json({ error: 'Failed to delete asset link' }, { status: 500 });
  }
}
