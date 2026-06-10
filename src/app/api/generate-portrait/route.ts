import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const zai = new ZAI();
    const response = await zai.images.generations.create({
      prompt,
      size: size || '512x512',
    });

    // Extract base64 image data from the response
    const imageData = response.data?.[0];
    if (!imageData) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    // Return the base64 image data
    return NextResponse.json({
      b64_json: imageData.b64_json || null,
      url: imageData.url || null,
      revised_prompt: imageData.revised_prompt || prompt,
    }, { status: 201 });
  } catch (error) {
    console.error('Generate portrait error:', error);
    return NextResponse.json({ error: 'Failed to generate portrait' }, { status: 500 });
  }
}
