/**
 * AI Client — 统一模型服务客户端
 *
 * 基于 OpenAI 兼容协议，支持自定义 Base URL 和 API Key。
 * 提供 Chat Completions（SSE 流式）和 Image Generation 能力。
 */

import OpenAI from 'openai';

// ─── 配置 ───────────────────────────────────────────────
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://token-plan-sgp.xiaomimimo.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'mimo-v2.5-pro';
const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || 'mimo-v2.5-pro';

// ─── 单例客户端 ─────────────────────────────────────────
let _client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!_client) {
    if (!AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured. Please set it in .env');
    }
    _client = new OpenAI({
      apiKey: AI_API_KEY,
      baseURL: AI_BASE_URL,
    });
  }
  return _client;
}

// ─── Chat Completions（流式） ───────────────────────────
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

/**
 * 创建流式 Chat Completion
 * 返回 AsyncIterable<OpenAI.ChatCompletionChunk>
 */
export async function createChatCompletionStream(options: ChatCompletionOptions) {
  const client = getAIClient();
  const { messages, model, ...rest } = options;

  return client.chat.completions.create({
    model: model || AI_MODEL,
    messages,
    stream: true,
    ...rest,
  });
}

/**
 * 创建非流式 Chat Completion
 * 返回完整回复文本
 */
export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  const client = getAIClient();
  const { messages, model, ...rest } = options;

  const response = await client.chat.completions.create({
    model: model || AI_MODEL,
    messages,
    stream: false,
    ...rest,
  });

  return response.choices[0]?.message?.content || '';
}

// ─── Image Generation ──────────────────────────────────
export interface ImageGenerationOptions {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  model?: string;
  n?: number;
  response_format?: 'url' | 'b64_json';
}

export interface ImageGenerationResult {
  b64_json?: string | null;
  url?: string | null;
  revised_prompt?: string;
}

/**
 * 生成 AI 图像
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const client = getAIClient();
  const { prompt, model, ...rest } = options;

  const response = await client.images.generate({
    model: model || AI_IMAGE_MODEL,
    prompt,
    ...rest,
  });

  const imageData = response.data?.[0];
  if (!imageData) {
    throw new Error('No image generated');
  }

  return {
    b64_json: imageData.b64_json || null,
    url: imageData.url || null,
    revised_prompt: imageData.revised_prompt || prompt,
  };
}

// ─── 导出配置供前端显示 ─────────────────────────────────
export function getAIConfig() {
  return {
    model: AI_MODEL,
    baseUrl: AI_BASE_URL,
    hasApiKey: !!AI_API_KEY,
  };
}
