import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        chapters: { orderBy: { order: 'asc' } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let txt = `${project.title}\n`;
    txt += `${'='.repeat(40)}\n\n`;

    if (project.description) {
      txt += `【简介】\n${project.description}\n\n`;
    }

    for (const chapter of project.chapters) {
      if (chapter.title) {
        txt += `${'─'.repeat(40)}\n`;
        txt += `第${chapter.order + 1}章 ${chapter.title}\n`;
        txt += `${'─'.repeat(40)}\n\n`;
      }
      if (chapter.content) {
        txt += `${chapter.content}\n\n`;
      }
    }

    return new NextResponse(txt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(project.title)}.txt"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
