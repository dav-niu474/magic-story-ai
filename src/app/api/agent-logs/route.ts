import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const logs = await db.agentLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Get agent logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch agent logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, agentType, action, input, output, toolCalls } = body;

    if (!projectId || !agentType) {
      return NextResponse.json({ error: 'projectId and agentType are required' }, { status: 400 });
    }

    const log = await db.agentLog.create({
      data: {
        projectId,
        agentType,
        action: action || '',
        input: input || '',
        output: output || '',
        toolCalls: toolCalls || '[]',
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Create agent log error:', error);
    return NextResponse.json({ error: 'Failed to create agent log' }, { status: 500 });
  }
}
