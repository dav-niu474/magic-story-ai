import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const result = await generateImage({
      prompt,
      size: size || '1024x1024',
      response_format: 'b64_json',
    });

    return NextResponse.json({
      b64_json: result.b64_json || null,
      url: result.url || null,
      revised_prompt: result.revised_prompt || prompt,
    }, { status: 201 });
  } catch (error) {
    console.error('Generate portrait error:', error);
    return NextResponse.json({ error: 'Failed to generate portrait' }, { status: 500 });
  }
}
