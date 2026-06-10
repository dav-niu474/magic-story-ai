// Anti-AI writing detection utility
// 去AI味分析工具

export const BANNED_WORDS = [
  // 过渡词
  '然而', '不过', '此外', '与此同时', '另一方面', '总的来说', '总而言之',
  '综上所述', '毋庸置疑', '不可否认', '显而易见', '众所周知', '毋庸置疑',
  '值得注意的是', '需要指出的是', '事实上', '实际上', '换言之', '简而言之',
  // 升华词
  '这一刻', '在那一刻', '心中涌起', '不禁感慨', '恍然大悟', '如梦初醒',
  '豁然开朗', '恍若隔世', '沧海桑田', '物是人非', '岁月如梭', '时光荏苒',
  '恍如昨日', '此情此景', '情不自禁', '不由自主', '自然而然',
  // 描写词
  '宛如', '仿佛', '似乎', '宛如', '犹如', '恰似', '犹如画中',
  '如同', '好像', '似的', '一般', '一样',
  // 心理直白词
  '感到', '觉得', '意识到', '明白', '知道', '想到',
  '内心深处', '心底', '心中暗想', '暗自', '默默', '不由得',
  // 对话标签
  '微笑着说', '严肃地说', '轻声说', '低声说', '淡淡地说', '平静地说',
  '缓缓开口', '沉声道', '冷冷地说', '淡淡道',
  // 修饰堆砌
  '无比', '极为', '异常', '格外', '分外', '尤为',
  '深远', '深刻', '深邃', '深沉', '深厚',
];

export const PARALLEL_PATTERNS = [
  /(?:。[^。]*){2,}然而[^。]*。/,  // 连续句式后接然而
  /不仅[^，]*，[^。]*也[^。]*。/g,   // 不仅...也...
  /既[^，]*，[^。]*又[^。]*。/g,     // 既...又...
  /一方面[^，]*，[^。]*另一方面/g,  // 一方面...另一方面
];

export interface AntiAIResult {
  overallScore: number; // 0-100, 100=most AI-like
  dimensions: {
    bannedWordDensity: number;     // 禁用词密度
    parallelPattern: number;       // 并列句式
    psychologicalTelling: number;  // 心理描写直白度
    rhythmUniformity: number;      // 节奏均匀度
    dialogueSameness: number;      // 对话同质化
    endingGrandiosity: number;     // 结尾升华化
  };
  bannedWordsFound: string[];
  suggestions: string[];
}

export function analyzeAntiAI(text: string): AntiAIResult {
  if (!text || text.length < 50) {
    return {
      overallScore: 0,
      dimensions: {
        bannedWordDensity: 0,
        parallelPattern: 0,
        psychologicalTelling: 0,
        rhythmUniformity: 0,
        dialogueSameness: 0,
        endingGrandiosity: 0,
      },
      bannedWordsFound: [],
      suggestions: ['文本太短，无法进行有效分析'],
    };
  }

  // 1. 禁用词密度
  const bannedWordsFound: string[] = [];
  let bannedCount = 0;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) {
      bannedCount += matches.length;
      if (!bannedWordsFound.includes(word)) {
        bannedWordsFound.push(word);
      }
    }
  }
  const bannedWordDensity = Math.min(100, Math.round((bannedCount / (text.length / 100)) * 20));

  // 2. 并列句式检测
  let parallelCount = 0;
  for (const pattern of PARALLEL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) parallelCount += matches.length;
  }
  const parallelPattern = Math.min(100, parallelCount * 15);

  // 3. 心理描写直白度
  const psychWords = ['感到', '觉得', '意识到', '明白', '心中涌起', '内心深处', '心底', '心中暗想', '暗自', '默默', '恍然大悟', '如梦初醒', '豁然开朗', '情不自禁', '不由自主', '自然而然'];
  let psychCount = 0;
  for (const word of psychWords) {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) psychCount += matches.length;
  }
  const psychologicalTelling = Math.min(100, psychCount * 12);

  // 4. 节奏均匀度 - 检查段落长度变化
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) {
    const lengths = paragraphs.map(p => p.length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    const cv = Math.sqrt(variance) / avg; // coefficient of variation
    // Lower CV = more uniform = more AI-like
    const rhythmUniformity = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  }
  const cv = (() => {
    if (paragraphs.length <= 1) return 0.5;
    const lengths = paragraphs.map(p => p.length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    return Math.sqrt(variance) / Math.max(avg, 1);
  })();
  const rhythmUniformity = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));

  // 5. 对话同质化
  const dialogues = text.match(/[""「」『』""][^""「」『』""]*[""「」『』""]/g) || [];
  let dialogueSameness = 0;
  if (dialogues.length >= 3) {
    const dialogueLens = dialogues.map(d => d.length);
    const avgLen = dialogueLens.reduce((a, b) => a + b, 0) / dialogueLens.length;
    const lenVariance = dialogueLens.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / dialogueLens.length;
    const lenCv = Math.sqrt(lenVariance) / Math.max(avgLen, 1);
    dialogueSameness = Math.max(0, Math.min(100, Math.round((1 - lenCv) * 80)));
  }

  // 6. 结尾升华化
  const lastParagraph = paragraphs[paragraphs.length - 1] || '';
  const endingWords = ['这一刻', '心中涌起', '恍然', '感慨', '沧海桑田', '物是人非', '岁月', '时光', '如梭', '荏苒', '恍如昨日', '此情此景', '不禁', '情不自禁'];
  let endingCount = 0;
  for (const word of endingWords) {
    if (lastParagraph.includes(word)) endingCount++;
  }
  const endingGrandiosity = Math.min(100, endingCount * 25);

  // Overall score
  const overallScore = Math.round(
    (bannedWordDensity * 0.2 +
    parallelPattern * 0.15 +
    psychologicalTelling * 0.2 +
    rhythmUniformity * 0.15 +
    dialogueSameness * 0.15 +
    endingGrandiosity * 0.15)
  );

  // Suggestions
  const suggestions: string[] = [];
  if (bannedWordDensity > 40) suggestions.push(`禁用词密度过高，发现 ${bannedWordsFound.length} 种AI常用词（${bannedWordsFound.slice(0, 5).join('、')}等），建议替换为更自然的表达`);
  if (parallelPattern > 30) suggestions.push('并列句式过多，建议变换句式结构，避免"不仅…也…""既…又…"等模板化表达');
  if (psychologicalTelling > 30) suggestions.push('心理描写过于直白，建议用行动和细节暗示内心，而非直接告诉读者角色"感到""意识到"');
  if (rhythmUniformity > 60) suggestions.push('段落节奏过于均匀，建议长短段落交替，制造呼吸感和节奏变化');
  if (dialogueSameness > 50) suggestions.push('对话长度和风格过于同质化，建议为不同角色设计差异化的说话方式');
  if (endingGrandiosity > 40) suggestions.push('结尾过于升华化，建议避免在段落末尾进行总结或感慨，让故事本身说话');

  if (suggestions.length === 0) {
    suggestions.push('文本AI痕迹较少，写作风格较为自然');
  }

  return {
    overallScore,
    dimensions: {
      bannedWordDensity,
      parallelPattern,
      psychologicalTelling,
      rhythmUniformity,
      dialogueSameness,
      endingGrandiosity,
    },
    bannedWordsFound,
    suggestions,
  };
}
