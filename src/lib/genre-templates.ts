export interface GenreTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  worldHints: string;
  characterArchetypes: string[];
  plotPatterns: string[];
  styleGuide: string;
  defaultPrompts: {
    world: string;
    character: string;
    outline: string;
    chapter: string;
  };
}

export const GENRE_TEMPLATES: GenreTemplate[] = [
  {
    id: 'xuanhuan-xiuxian',
    name: '玄幻系统修仙',
    emoji: '⚔️',
    description: '穿越/重生获得系统，修仙升级打怪，成就至高',
    worldHints: '修仙世界，灵气充沛，宗门林立，有完善的修炼体系和等级划分。存在上古遗迹、秘境、灵脉等资源。种族包括人族、妖族、魔族等。',
    characterArchetypes: ['系统宿主', '天才修士', '宗门长老', '妖族大能', '魔道修士', '灵宠'],
    plotPatterns: ['系统任务', '秘境探索', '宗门大比', '跨界征战', '天劫突破', '道侣情缘'],
    styleGuide: '热血爽文风格，升级节奏明快，打斗场景华丽，金手指合理。每章结尾设悬念钩子。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，包含修炼体系、势力分布、地理环境。要求体系完整、等级清晰、有独特创新点。',
      character: '请设计${genre}类型的主角和核心配角，主角需要有鲜明的性格特点和成长空间，配角要有各自的立场和故事。',
      outline: '请为${genre}类型小说编写大纲，包含主线剧情、关键转折、高潮设计。节奏要紧凑，每卷有明确目标。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'dushi-chongsheng',
    name: '都市重生',
    emoji: '🔄',
    description: '重生回到过去，利用先知优势逆袭人生',
    worldHints: '现代都市背景，时间线回溯至主角年轻时期。保留未来记忆，熟知商业机遇、人际关系走向。社会环境真实可感。',
    characterArchetypes: ['重生者', '商业对手', '红颜知己', '贵人', '背叛者', '家族成员'],
    plotPatterns: ['商业布局', '情感弥补', '危机化解', '先知优势', '蝴蝶效应', '身份逆袭'],
    styleGuide: '写实爽文风格，商业逻辑合理，情感真挚细腻。避免过度装逼，注重智商在线的布局感。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，时代背景需真实可感，商业环境要有时代特征。',
      character: '请设计${genre}类型的主角和核心配角，主角要有前世经验带来的成熟与遗憾，配角要有时代特征。',
      outline: '请为${genre}类型小说编写大纲，利用重生优势设计精彩布局，注意蝴蝶效应的合理展开。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。背景：${background}。角色：${characters}。',
    },
  },
  {
    id: 'naodong-wangwen',
    name: '脑洞网文',
    emoji: '💡',
    description: '天马行空的创意设定，颠覆传统的奇思妙想',
    worldHints: '不设限的创意世界，可以是任何颠覆常规的设定。关键是要有独特的核心概念和内在逻辑。',
    characterArchetypes: ['异类主角', '规则破坏者', '神秘存在', '反套路角色', '异常存在'],
    plotPatterns: ['设定颠覆', '规则打破', '认知反转', '维度跳跃', '概念对抗'],
    styleGuide: '创意优先，设定新颖，逻辑自洽。用荒诞包装真实，在想象中映射现实。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，核心设定要颠覆常规但有内在逻辑，让人眼前一亮。',
      character: '请设计${genre}类型的主角，角色要有反常规的特质和行为方式，但不能失去代入感。',
      outline: '请为${genre}类型小说编写大纲，每个情节点都要有惊喜，但要保证整体逻辑自洽。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'dushi-xiuxian',
    name: '都市修仙',
    emoji: '🏙️',
    description: '都市隐藏修仙界，凡人与仙道的碰撞',
    worldHints: '现代都市表面平凡，暗藏修仙界。存在隐世宗门、修仙家族、灵气复苏等设定。凡人世界与修仙世界交织。',
    characterArchetypes: ['都市修士', '隐世高人', '凡人红颜', '宗门传人', '暗敌', '灵兽伙伴'],
    plotPatterns: ['身份隐藏', '都市冲突', '修仙资源争夺', '两界交织', '传承获得', '劫难渡过'],
    styleGuide: '都市与修仙的反差感，日常与惊险的交织。修仙元素融入现代生活要有创意和趣味。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，现代都市与修仙世界并行，两者如何交织要有创意。',
      character: '请设计${genre}类型的主角，要在凡人身份和修士身份间游走，两个身份各有魅力。',
      outline: '请为${genre}类型小说编写大纲，都市生活与修仙冒险双线交织，节奏张弛有度。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'dushi-gaowu',
    name: '都市高武',
    emoji: '👊',
    description: '武道崛起的都市世界，力量为尊的法则',
    worldHints: '武道兴盛的现代都市，武者地位崇高。存在武道等级、武馆、武考等体系。社会围绕武道运转。',
    characterArchetypes: ['武道天才', '武馆馆主', '武考对手', '家族势力', '异族入侵者', '武道宗师'],
    plotPatterns: ['武考晋级', '武馆争锋', '秘境历练', '异族对抗', '武道突破', '荣誉之战'],
    styleGuide: '热血格斗风格，战斗描写拳拳到肉，升级有快感。武道体系严谨，社会设定合理。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，武道体系与社会结构紧密结合，等级清晰有特色。',
      character: '请设计${genre}类型的主角，从弱到强的成长路线明确，战斗风格独特。',
      outline: '请为${genre}类型小说编写大纲，以武道成长为主线，设置合理的挑战和突破节点。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'mori-xitong',
    name: '末日系统',
    emoji: '🧟',
    description: '末日降临获得系统，在废墟中重建文明',
    worldHints: '末日后的荒芜世界，丧尸/异兽横行，资源极度匮乏。幸存者聚居，系统赋予特殊能力。文明崩塌后的新秩序。',
    characterArchetypes: ['系统觉醒者', '幸存者领袖', '变异者', '军人', '科学家', '敌对势力首领'],
    plotPatterns: ['末日求生', '基地建设', '变异进化', '势力对抗', '系统升级', '真相探索'],
    styleGuide: '紧张刺激的末日氛围，生存压力始终存在。系统是工具不是万能，人与人的博弈是核心。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，末日原因合理，系统来源有解释，生存规则清晰。',
      character: '请设计${genre}类型的主角，在极端环境下展现人性光辉与阴暗，成长弧线有力。',
      outline: '请为${genre}类型小说编写大纲，生存压力贯穿始终，每次升级都来之不易。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'bazong',
    name: '霸总',
    emoji: '👑',
    description: '霸道总裁与灰姑娘的爱情故事',
    worldHints: '现代都市上流社会，商业帝国、家族势力。总裁拥有权势与魅力，女主独立坚韧。',
    characterArchetypes: ['霸道总裁', '独立女主', '白月光', '情敌', '闺蜜', '家族长辈'],
    plotPatterns: ['契约关系', '误会冲突', '身份反转', '家族阻力', '真情告白', '破镜重圆'],
    styleGuide: '甜虐交织，男主霸道但有底线，女主独立不圣母。感情发展有层次，不可一见面就沦陷。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，上流社会环境要有质感，商业背景要真实。',
      character: '请设计${genre}类型的主角，总裁要有魅力但也有弱点，女主要有自己的事业和成长。',
      outline: '请为${genre}类型小说编写大纲，感情线起伏有致，每个误会都有合理原因和解决契机。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。背景：${background}。角色：${characters}。',
    },
  },
  {
    id: 'houhuiliu',
    name: '后悔流',
    emoji: '😢',
    description: '失去后才珍惜，痛彻心扉后的追悔与挽回',
    worldHints: '现实或半架空世界，主角因忽视或伤害失去重要之人，踏上追悔挽回之路。',
    characterArchetypes: ['后悔者', '被伤害者', '竞争对手', '调解者', '过去影子', '新的羁绊'],
    plotPatterns: ['追悔莫及', '弥补之路', '情感觉醒', '阻碍重重', '真心感动', '最终抉择'],
    styleGuide: '虐心但不虐身，情感层次丰富。后悔要有深度，挽回要有诚意。结局可以有遗憾但要有成长。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，环境要衬托情感，让失去与珍惜的感受更加强烈。',
      character: '请设计${genre}类型的主角，要展现从忽视到痛悟的心理变化过程，真实感人。',
      outline: '请为${genre}类型小说编写大纲，情感起伏如潮汐，每个转折都是心灵的触碰。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。背景：${background}。角色：${characters}。',
    },
  },
  {
    id: 'wudiwen',
    name: '无敌文',
    emoji: '💪',
    description: '开局即无敌，碾压一切的爽感体验',
    worldHints: '主角实力碾压全场，但仍需有趣的世界观来衬托无敌的快感。存在不知天高地厚的挑衅者。',
    characterArchetypes: ['无敌主角', '不知死活的对手', '崇拜者', '老朋友', '隐藏大boss', '红颜'],
    plotPatterns: ['碾压装逼', '不知者无畏', '实力碾压', '幕后黑手', '终极一击', '举世皆惊'],
    styleGuide: '爽感至上，碾压要有节奏感。不是简单的一拳打飞，而是层层递进的实力展示。装逼要优雅。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，层次丰富，让主角的无敌有展示空间，但也存在远超常规的终极挑战。',
      character: '请设计${genre}类型的主角，无敌但有趣，有自己的行事风格和原则，不是无情机器。',
      outline: '请为${genre}类型小说编写大纲，以碾压爽感为主线，但要有节奏变化和意外惊喜。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'lishi-jiakong',
    name: '历史架空',
    emoji: '📜',
    description: '架空历史背景，权谋与英雄的史诗',
    worldHints: '架空历史世界，参照真实历史但允许创意发挥。朝堂权谋、军事征战、民生百态。',
    characterArchetypes: ['穿越者/重生者', '帝王将相', '谋士', '武将', '红颜', '敌国君主'],
    plotPatterns: ['朝堂博弈', '军事征伐', '改革图强', '合纵连横', '皇权争夺', '天下大势'],
    styleGuide: '历史厚重感与架空创意的平衡，权谋要有智慧，战争要有气势，人物要有格局。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，历史背景要有厚重感，政治格局清晰合理。',
      character: '请设计${genre}类型的主角，要有历史人物的格局与智慧，同时有现代视角的独到见解。',
      outline: '请为${genre}类型小说编写大纲，权谋与征伐交织，每个决策都影响天下大势。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'dongfang-xuanhuan',
    name: '东方玄幻',
    emoji: '🐉',
    description: '宏大的东方奇幻世界，仙魔争锋',
    worldHints: '东方奇幻大陆，多族共存，仙魔妖并存。修炼体系多元，存在上古传承、天地大劫等设定。',
    characterArchetypes: ['天赋异禀者', '仙门传人', '魔道天骄', '妖族王子', '古族后裔', '天命之人'],
    plotPatterns: ['天赋觉醒', '仙魔对立', '秘境探险', '古族纷争', '天地大劫', '证道成仙'],
    styleGuide: '大气磅礴的东方风格，修炼体系严谨，战斗场面恢弘。要有仙侠的飘逸和玄幻的厚重。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，东方韵味浓厚，修炼体系独特且层次分明。',
      character: '请设计${genre}类型的主角，命运多舛但意志坚定，成长道路上有师友相伴也有敌人阻路。',
      outline: '请为${genre}类型小说编写大纲，格局宏大但不失控，主线清晰，支线丰富。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
  {
    id: 'celue-jingying',
    name: '策略经营',
    emoji: '🏰',
    description: '从零开始的建设之路，智谋与经营的双重考验',
    worldHints: '可以发展经营的架空世界，存在资源、领地、人口等经营要素。主角需要从微小起步逐步壮大。',
    characterArchetypes: ['领主/经营者', '谋士', '工匠', '将领', '商人', '竞争者'],
    plotPatterns: ['资源开发', '领地扩张', '人才招揽', '策略对抗', '危机应对', '势力崛起'],
    styleGuide: '经营逻辑严密，策略有趣。不是简单的数字增长，而是充满选择和取舍的建设之路。',
    defaultPrompts: {
      world: '请设计一个${genre}类型的世界观，经营要素丰富，发展空间广阔，有多种可行的发展路线。',
      character: '请设计${genre}类型的主角，有经营头脑和战略眼光，从一穷二白开始建立势力。',
      outline: '请为${genre}类型小说编写大纲，经营与策略双线并行，每一步发展都充满挑战和选择。',
      chapter: '请根据以下大纲内容创作章节：${chapter_outline}。风格要求：${style}。世界观：${background}。角色：${characters}。',
    },
  },
];

export const GENRE_MAP = Object.fromEntries(GENRE_TEMPLATES.map(g => [g.id, g]));

export function getGenreTemplate(id: string): GenreTemplate | undefined {
  return GENRE_MAP[id];
}
