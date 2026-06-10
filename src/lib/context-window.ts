// Context Window Management with Sliding Compression
// 上下文窗口管理 - 滑动压缩策略

export interface ContextChunk {
  chapterId: string;
  chapterOrder: number;
  title: string;
  type: 'full' | 'summary' | 'compressed';
  content: string;
}

const MAX_CONTEXT_CHARS = 16000;
const FULL_DETAIL_CHAPTERS = 2;

/**
 * Build a context window for AI generation
 * Keeps recent N chapters in full detail, compresses older ones
 */
export function buildContextWindow(
  chapters: { id: string; order: number; title: string; content: string; summary: string }[],
  currentChapterId: string
): { chunks: ContextChunk[]; totalChars: number; truncated: boolean } {
  if (chapters.length === 0) {
    return { chunks: [], totalChars: 0, truncated: false };
  }

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const currentIndex = sortedChapters.findIndex(c => c.id === currentChapterId);

  // Determine which chapters get full detail
  const fullDetailStart = Math.max(0, currentIndex - FULL_DETAIL_CHAPTERS + 1);
  const fullDetailEnd = currentIndex;

  const chunks: ContextChunk[] = [];
  let totalChars = 0;
  let truncated = false;

  for (let i = 0; i < sortedChapters.length; i++) {
    const ch = sortedChapters[i];
    if (i === currentIndex) continue; // Skip current chapter

    const isFullDetail = i >= fullDetailStart && i <= fullDetailEnd;
    const content = isFullDetail
      ? ch.content
      : (ch.summary || compressContent(ch.content));

    const chunk: ContextChunk = {
      chapterId: ch.id,
      chapterOrder: ch.order,
      title: ch.title || `第${ch.order + 1}章`,
      type: isFullDetail ? 'full' : (ch.summary ? 'summary' : 'compressed'),
      content,
    };

    // Check if adding this chunk would exceed the limit
    const estimatedSize = chunk.title.length + chunk.content.length + 50; // 50 for metadata
    if (totalChars + estimatedSize > MAX_CONTEXT_CHARS) {
      // Try to add a compressed version instead
      if (!isFullDetail) {
        truncated = true;
        continue; // Skip older chapters that would overflow
      }
      // For full detail chapters, truncate content
      const remaining = MAX_CONTEXT_CHARS - totalChars - chunk.title.length - 50;
      if (remaining > 200) {
        chunk.content = chunk.content.slice(0, remaining) + '...[截断]';
        chunk.type = 'compressed';
        totalChars += estimatedSize;
        chunks.push(chunk);
        truncated = true;
      }
      break;
    }

    totalChars += estimatedSize;
    chunks.push(chunk);
  }

  return { chunks, totalChars, truncated };
}

/**
 * Simple content compression - extract key sentences
 */
function compressContent(content: string, targetRatio: number = 0.3): string {
  if (!content || content.length < 200) return content;

  const sentences = content.split(/[。！？；\n]/).filter(s => s.trim().length > 10);
  if (sentences.length <= 3) return content;

  // Take first, last, and key sentences (longer ones tend to be more important)
  const keySentences: string[] = [];
  const step = Math.max(1, Math.floor(sentences.length * targetRatio));

  for (let i = 0; i < sentences.length; i += step) {
    keySentences.push(sentences[i].trim());
  }
  // Always include last sentence
  const lastSentence = sentences[sentences.length - 1].trim();
  if (keySentences[keySentences.length - 1] !== lastSentence) {
    keySentences.push(lastSentence);
  }

  return keySentences.join('。') + '。';
}

/**
 * Format context chunks into a prompt string
 */
export function formatContextForPrompt(chunks: ContextChunk[]): string {
  if (chunks.length === 0) return '';

  const parts = chunks.map(chunk => {
    const typeLabel = chunk.type === 'full' ? '【原文】' : chunk.type === 'summary' ? '【摘要】' : '【压缩】';
    return `--- 第${chunk.chapterOrder + 1}章: ${chunk.title} ${typeLabel} ---\n${chunk.content}`;
  });

  return parts.join('\n\n');
}
