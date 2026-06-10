import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { AGENT_MAP, AgentType } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, messages, systemPrompt: customSystemPrompt } = body;

    if (!agentType || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing required fields: agentType, messages' },
        { status: 400 }
      );
    }

    const agent = AGENT_MAP[agentType as AgentType];
    const systemPrompt = customSystemPrompt || (agent?.systemPrompt || '你是一个有帮助的AI助手。');

    const zai = await ZAI.create();

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: allMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
