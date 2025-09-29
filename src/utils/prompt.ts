export interface PromptBuilderInput {
  domainCategory: string;
  domainDetail: string;
  industry: string;
  focusTopics: string;
  tasks: string;
  additionalInfo: string;
}

export interface PromptResult {
  input: PromptBuilderInput;
  rolePrompt: string;
  summary: string;
  followUpQuestions: string[];
}

const defaults = {
  domain: '未指定の領域',
  industry: '利用シーン未指定',
};

interface TemplateContext {
  domain: string;
  industryDisplay: string;
  hasIndustry: boolean;
  focusLabel: string;
}

interface DomainTemplate {
  focusPlaceholder: string;
  roleDefinition: (context: TemplateContext) => string;
  defaultTasks: (context: TemplateContext) => string[];
}

function sanitiseMultiline(input: string): string[] {
  return input
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function sanitiseFocus(input: string): string[] {
  if (!input.trim()) {
    return [];
  }
  return input
    .replace(/[、，,]/g, '\n')
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function createDefaultTasks(
  context: TemplateContext,
  lines: string[],
): string[] {
  return [
    'AIは以下を行います：',
    ...lines.map((line) =>
      line.replace('{industry}', context.industryDisplay),
    ),
  ];
}

const IT_OUTPUT_CONDITIONS = [
  '回答は日本語で出力してください。',
  '構成は「概要 → 詳細 → 関連Tips」を基本フォーマットとしてください。',
  '利用シーンや業界の特性（セキュリティ、可用性、法令順守など）が関係する場合は必ず言及してください。',
  '質問に応じて「ベストプラクティス」「注意点」「構成サンプル」「追加提案」などを1～3点で簡潔にまとめてください。',
  '漏れなく、簡潔かつ体系的に説明してください。必要に応じて段階的（ステップバイステップ）に解説してください。',
  '不明点やカスタマイズの希望があれば、追って相談できる旨を案内してください。',
  'レビュー指針に従い、自己レビューを2回行ってから回答してください。',
];

const DEFAULT_OUTPUT_CONDITIONS = [
  '日本語で入力してください。',
  '回答は体系的に（概要→詳細→関連Tips）を基本フォーマットとしてください。',
  '利用シーンや業界の特性（セキュリティ・可用性・法令順守など）が関係する場合は必ず言及してください。',
  '質問に応じて「ベストプラクティス」「注意点」「構成サンプル」「追加提案」などを1～3ポイントでまとめてください。',
  'じっくり考えた上で、漏れなく簡潔・網羅的に回答してください。',
  '必要に応じて段階的（ステップバイステップ）に解説を行ってください。',
  'ご不明点やカスタマイズ希望は、追加でご相談ください。',
  'レビュー指針に従って、2回レビューしてから回答してください。',
];

const IT_REVIEW_GUIDELINES = [
  '依頼内容を網羅的に解決しているか。',
  'ユーザーが迷わない構成・ヒアリングになっているか。',
  '論理の飛躍や抜け漏れ、不明瞭な点がないか。',
  '回答内容に矛盾がないか。',
];

const DEFAULT_REVIEW_GUIDELINES = [
  '依頼された内容を網羅的に解決するものとなっているか',
  'ユーザーが迷わない構成・ヒアリングになっているか確認してください。',
  '論理飛躍やヌケモレ、不明瞭な点がないか全面的に見直してください。',
  '回答内容に矛盾がないか確認してください。',
];

function getOutputConditions(domainCategory: string): string[] {
  if (domainCategory === 'IT技術を知りたい') {
    return IT_OUTPUT_CONDITIONS;
  }
  return DEFAULT_OUTPUT_CONDITIONS;
}

function getReviewGuidelines(domainCategory: string): string[] {
  if (domainCategory === 'IT技術を知りたい') {
    return IT_REVIEW_GUIDELINES;
  }
  return DEFAULT_REVIEW_GUIDELINES;
}

const DOMAIN_TEMPLATES: Record<string, DomainTemplate> = {
  'IT技術を知りたい': {
    focusPlaceholder:
      '例: AWSアーキテクチャ設計、Kubernetes運用のベストプラクティス、Terraformによる自動化 など',
    roleDefinition: ({ domain, focusLabel }) => {
      return [
        `あなたは、「${domain}について知りたい」という利用者の要望に対し、わかりやすく解説するテクニカルメンターです。`,
        '利用者のスキルレベルに合わせて、基礎から応用までの道筋を丁寧に示し、前提知識が少なくても理解できるように説明してください。',
        '設定手順や注意点、参考となる追加リソースも提案してください。',
        `特に知りたい内容: ${focusLabel}`,
      ].join('\n');
    },
    defaultTasks: () => [
      'AIは以下を行います：',
      '- （その他・自由記述の内容を含む）現状と課題の整理、目的の明確化',
      '- 実行可能な選択肢と検討ステップの提示',
      '- 想定シーンに関係する制約・ルール・関係者の整理',
      '- リスクと対応策、必要な準備事項の助言',
      '- 追加で確認すべき観点や参考情報の提案',
    ],
  },
  '翻訳や文章校閲がしたい': {
    focusPlaceholder:
      '例: 英文メールの丁寧な言い回し、日本語資料の読みやすさ、語調を整えるコツ など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const toneSentence = hasIndustry
        ? `${industryDisplay}で好まれるトーンや専門用語に注意しつつ、`
        : '伝えたい印象や読み手のレベルに合わせて、';
      return [
        'あなたは文章の翻訳と校閲を行うエディターです。',
        `${toneSentence}原文の意図を正確に保ちながら、自然で読みやすい表現に仕上げてください。`,
        '改善理由や複数案の比較、細かなニュアンスの違いにも触れてください。',
      ].join('\n');
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}で伝えたい目的・相手像の整理`,
        '・原文の課題や改善ポイントの指摘',
        `・{industry}で違和感のない語彙・敬語・トーンの提案`,
        '・複数候補や直し方の解説（可能であれば）',
        '・推敲するときに確認すべきチェックリストの提示',
      ]),
  },
  '花や虫の名前が知りたい': {
    focusPlaceholder:
      '例: 花びらの色と形、咲いていた季節、見つけた地域、体の模様や大きさ など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const habitatSentence = hasIndustry
        ? `${industryDisplay}で見られる生息環境や季節感を踏まえ、`
        : '観察された環境・季節・特徴を基に、';
      return [
        'あなたは身近な自然観察を手伝うフィールドガイドです。',
        `${habitatSentence}候補となる種を複数挙げ、識別のポイントや似ている種との違いを丁寧に説明してください。`,
        '安全面の注意や追加で観察すると良い点があれば教えてください。',
      ].join('\n');
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}に関する観察情報を整理し、重要な特徴を明確化`,
        '・該当しそうな植物/昆虫の候補を複数提示し、見分けるコツを説明',
        `・{industry}（観察場所やシーン）での生息時期・環境の解説`,
        '・注意すべき安全面や扱い方のアドバイス',
        '・さらに調べる際に役立つ図鑑やサイト、観察のヒントを提案',
      ]),
  },
  '美味しいレシピを知りたい': {
    focusPlaceholder:
      '例: 旬の食材で作るメイン料理、15分でできる副菜、子ども向けに甘さ控えめ など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const servingSentence = hasIndustry
        ? `${industryDisplay}に合わせた味付けや提供シーンを意識し、`
        : '料理の経験値に合わせて失敗しにくい手順で、';
      return [
        'あなたは家庭で再現しやすい料理を提案するレシピプランナーです。',
        `${servingSentence}材料の入手性や工程の分かりやすさにも配慮し、味の決め手や盛り付けのコツまで教えてください。`,
        'アレルギーや代替案にも触れてください。',
      ].join('\n');
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}で目指す味や雰囲気の整理`,
        '・必要な材料と分量、下ごしらえのポイントの提示',
        `・{industry}（想定するシーンや人数）に合わせた段取りと時間配分`,
        '・失敗しやすい工程とリカバリー方法、味変アイデア',
        '・盛り付け方や保存方法、アレルギー時の代替食材の提案',
      ]),
  },
  育児: {
    focusPlaceholder:
      '例: 夜泣き対策、イヤイヤ期の接し方、保育園選びのポイント など',
    roleDefinition: ({
      domain,
      industryDisplay,
      hasIndustry,
      focusLabel,
    }) => {
      const lifestyleSentence = hasIndustry
        ? `${industryDisplay}で想定される生活リズムやサポート体制を踏まえ、`
        : '家庭の状況や子どもの月齢に合わせて、';
      return [
        `あなたは${domain}に関する悩みを共に考える育児コンシェルジュです。`,
        `${lifestyleSentence}保護者の不安を和らげながら、${focusLabel}に寄り添って日常で実践しやすいアドバイスを提案してください。`,
        '専門家の見解や信頼できる情報源も紹介してください。',
      ].join('\n');
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}に関する状況整理（子どもの年齢や家庭環境など）`,
        '・保護者の気持ちに寄り添った声かけやコミュニケーションの提案',
        `・{industry}で利用できる行政・民間の支援制度や相談先の紹介`,
        '・生活リズムやケアのコツ、安全面での注意事項',
        '・信頼できる育児情報源や追加で確認したいポイントの提案',
      ]),
  },
};

const DEFAULT_TEMPLATE: DomainTemplate = {
  focusPlaceholder: '例: 詳しく知りたいキーワードや課題を入力してください',
  roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
    const scope = hasIndustry
      ? `${industryDisplay}の事情を理解し、`
      : '対象領域の一般的な事情を理解し、';
    return [
      `あなたは「${domain}」に関する課題解決を支援する専門家です。`,
      `${scope}${domain}に関する多角的な知見をもとに、現状整理から改善策の提示まで総合的に助言してください。`,
      '背景・制約・利害関係者を踏まえた現実的な提案を行います。',
    ].join('\n');
  },
  defaultTasks: (context) =>
    createDefaultTasks(context, [
      `・${context.domain}の現状と課題の整理、目的の明確化`,
      '・実行可能な選択肢や検討ステップの提示',
      `・{industry}に関係する制約・ルール・関係者の整理`,
      '・リスクと対応策、必要な準備事項の助言',
      '・追加で確認すべき観点や参考情報の提案',
    ]),
};

export function getDomainTemplate(domainCategory: string): DomainTemplate {
  return DOMAIN_TEMPLATES[domainCategory] ?? DEFAULT_TEMPLATE;
}

export function resolveDomainLabel(
  domainCategory: string,
  domainDetail: string,
): string {
  const trimmedCategory = domainCategory.trim();
  const trimmedDetail = domainDetail.trim();
  const formatDetailItem = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) {
      return '';
    }
    const otherMatch = trimmed.match(/^その他[：:](.*)$/);
    if (otherMatch) {
      const detail = otherMatch[1].trim();
      return detail.length > 0 ? `その他（${detail}）` : 'その他';
    }
    return trimmed;
  };
  if (trimmedCategory === 'IT技術を知りたい') {
    if (trimmedDetail.length === 0) {
      return 'IT技術';
    }
    const detailLabel = trimmedDetail
      .split(/[、,]/)
      .map(formatDetailItem)
      .filter((item) => item.length > 0)
      .join('、');
    return detailLabel.length > 0 ? `IT技術（${detailLabel}）` : 'IT技術';
  }
  if (trimmedCategory.startsWith('その他')) {
    return trimmedDetail || trimmedCategory || defaults.domain;
  }
  return trimmedCategory || defaults.domain;
}

export function resolveIndustryDisplay(industry: string): {
  hasIndustry: boolean;
  display: string;
  label: string;
} {
  const raw = industry.trim();
  if (!raw) {
    return { hasIndustry: false, display: '想定シーン', label: defaults.industry };
  }
  const otherMatch = raw.match(/^その他[：:](.*)$/);
  if (otherMatch) {
    const detail = otherMatch[1].trim();
    const label = detail.length > 0 ? `その他（${detail}）` : 'その他';
    return { hasIndustry: true, display: label, label };
  }
  return { hasIndustry: true, display: raw, label: raw };
}

export function generateDefaultTasksText(
  domainCategory: string,
  domainDetail: string,
  industry: string,
): string {
  const domain = resolveDomainLabel(domainCategory, domainDetail);
  const { hasIndustry, display } = resolveIndustryDisplay(industry);
  const template = getDomainTemplate(domainCategory);
  const context: TemplateContext = {
    domain,
    industryDisplay: display,
    hasIndustry,
    focusLabel: '特定の重点領域は未指定',
  };
  return template.defaultTasks(context).join('\n');
}

export function buildPrompt(
  input: PromptBuilderInput,
  questionDraft: string = '',
): PromptResult {
  const trimmedFocus = input.focusTopics.trim();
  const domain = resolveDomainLabel(input.domainCategory, input.domainDetail);

  const { hasIndustry, display: industryDisplay, label: industryLabel } =
    resolveIndustryDisplay(input.industry);

  const template = getDomainTemplate(input.domainCategory);
  const focusItems = sanitiseFocus(input.focusTopics);
  const focusLabel =
    focusItems.length > 0
      ? focusItems.join('、')
      : trimmedFocus.length > 0
        ? trimmedFocus
        : '特定の重点領域は未指定';

  const context: TemplateContext = {
    domain,
    industryDisplay,
    hasIndustry,
    focusLabel,
  };

  const additionalInfoItems = sanitiseMultiline(input.additionalInfo);
  const additionalInfoSection =
    additionalInfoItems.length > 0
      ? additionalInfoItems.map((item) => `- ${item}`).join('\n')
      : '- 現時点で共有された追加情報はありません。';

  const taskItems = sanitiseMultiline(input.tasks);
  const tasks = (taskItems.length > 0
    ? taskItems
    : template.defaultTasks(context)
  ).join('\n');

  const focusSection =
    focusItems.length > 0
      ? focusItems.map((item) => `- ${item}`).join('\n')
      : trimmedFocus.length > 0
        ? `- ${trimmedFocus}`
        : '- 現時点で特に深掘りしたい項目は指定されていません。';

  const outputConditions = getOutputConditions(input.domainCategory)
    .map((item) => `- ${item}`)
    .join('\n');

  const reviewGuidelines = getReviewGuidelines(input.domainCategory)
    .map((item) => `- ${item}`)
    .join('\n');

  const question = questionDraft.trim();
  const requestLines =
    question.length > 0
      ? sanitiseMultiline(question).map((item) => `- ${item}`)
      : ['- これから質問をお送りしますので、回答をお願いいたします。'];
  const request = requestLines.join('\n');

  const rolePrompt = `# ロール定義\n` +
    `${template.roleDefinition(context)}` +
    '\n---' +
    `\n\n## 主な実施タスク・業務内容\n${tasks}` +
    '\n---' +
    `\n\n## 特に知りたい内容\n${focusSection}` +
    '\n---' +
    `\n\n## AIに知っておいてほしい情報\n${additionalInfoSection}` +
    '\n---' +
    `\n\n# 出力条件\n${outputConditions}` +
    '\n---' +
    `\n\n# レビュー指針\n${reviewGuidelines}` +
    '\n---' +
    `\n\n# 依頼事項\n${request}`;

  const summary = `${domain} / 想定シーン: ${industryLabel}`;

  const focusFollowUp =
    focusItems.length > 0
      ? '挙げていただいた関心領域の優先順位や背景があれば教えてください。'
      : '深掘りしたいトピックがあれば、具体的なキーワードを教えてください。';

  const followUpQuestions = [
    '依頼事項のゴールや評価基準を具体的に教えてください。',
    `「${domain}」に特有の制約や利用環境があれば教えてください。`,
    hasIndustry
      ? `${industryDisplay}で注意すべき制度・慣習・ステークホルダーがあれば共有してください。`
      : '想定している利用シーンに特有の制約や前提条件があれば共有してください。',
    focusFollowUp,
  ];

  const normalizedInput: PromptBuilderInput = {
    ...input,
    focusTopics:
      focusItems.length > 0 ? focusItems.join('\n') : trimmedFocus,
  };

  return {
    input: normalizedInput,
    rolePrompt,
    summary,
    followUpQuestions,
  };
}
