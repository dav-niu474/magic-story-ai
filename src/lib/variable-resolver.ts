export interface VariableContext {
  background?: string;
  characters?: string;
  relationships?: string;
  plot?: string;
  style?: string;
  outline?: string;
  chapter_outline?: string;
  selected_text?: string;
  genre?: string;
  world_rules?: string;
  [key: string]: string | undefined;
}

export function resolveVariables(template: string, context: VariableContext): string {
  return template.replace(/\$\{(\w+)\}/g, (match, key: string) => {
    const value = context[key];
    if (value !== undefined && value !== '') {
      return value;
    }
    return match;
  });
}

export function extractVariables(template: string): string[] {
  const matches = template.match(/\$\{(\w+)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -1)))];
}

export function buildContextFromProject(data: {
  worldSettings?: { name: string; description: string; rules: string; type: string }[];
  characters?: { name: string; role: string; personality: string; appearance: string; background: string }[];
  relationships?: { from: string; to: string; type: string; description: string }[];
  outline?: string;
  genre?: string;
  selectedText?: string;
  chapterOutline?: string;
}): VariableContext {
  const ctx: VariableContext = {};

  if (data.worldSettings && data.worldSettings.length > 0) {
    ctx.background = data.worldSettings
      .map(ws => `【${ws.name}】(${ws.type})\n${ws.description}`)
      .join('\n\n');
    ctx.world_rules = data.worldSettings
      .filter(ws => ws.rules)
      .map(ws => `【${ws.name}规则】\n${ws.rules}`)
      .join('\n\n');
  }

  if (data.characters && data.characters.length > 0) {
    ctx.characters = data.characters
      .map(c => `【${c.name}】(${c.role})\n性格：${c.personality}\n外貌：${c.appearance}\n背景：${c.background}`)
      .join('\n\n');
  }

  if (data.relationships && data.relationships.length > 0) {
    ctx.relationships = data.relationships
      .map(r => `${r.from} → ${r.to}（${r.type}）：${r.description}`)
      .join('\n');
  }

  if (data.outline) {
    ctx.outline = data.outline;
  }

  if (data.genre) {
    ctx.genre = data.genre;
  }

  if (data.selectedText) {
    ctx.selected_text = data.selectedText;
  }

  if (data.chapterOutline) {
    ctx.chapter_outline = data.chapterOutline;
  }

  return ctx;
}
