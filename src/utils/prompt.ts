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
    ...lines.map((line) => {
      const replaced = line.replace('{industry}', context.industryDisplay).trim();
      const withoutBullets = replaced
        .replace(/^[\-・•]\s*/u, '')
        .replace(/^[0-9]+[\.)]\s*/u, '');
      return `- ${withoutBullets}`;
    }),
  ];
}

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

const TRANSLATION_OUTPUT_CONDITIONS = [
  '回答は日本語で出力してください。',
  '校閲では原文の意図・敬語・専門用語の適合性を確認し、必要に応じて背景説明も添えてください。',
  '構成は「概要 → 詳細 → 関連Tips」を基本フォーマットとしてください。',
  '用途や受信者に応じたトーンや言語表現の違いがあれば明示してください。',
  '校閲結果では、下記順で出力',
  'a) 原文へのフィードバック',
  'b) 修正案または提案文（複数パターン・用途別）',
  '不明点や追加で確認すべき点があれば質問を添えてください。',
  'レビュー指針に従い、自己レビューを2回行ってから回答してください。',
];

const CHILDCARE_OUTPUT_CONDITIONS = [
  '回答は日本語で行ってください。',
  '常に穏やかであたたかい語りかけを意識し、相談者の気持ちを受け止めてください。',
  '保護者の不安やストレスを軽減できるように、安心感を与える言葉を先に添えてください。',
  '提案は無理のないステップで具体的に示し、安全面の注意事項を忘れずに触れてください。',
  '必要に応じて専門家・行政・民間の支援先や相談窓口を紹介してください。',
  '回答の最後に相談者の頑張りをねぎらう一言を必ず添えてください。',
  'レビュー指針に従い、自己レビューを2回行ってから回答してください。',
];

const DEFAULT_REVIEW_GUIDELINES = [
  '依頼された内容を網羅的に解決するものとなっているか',
  'ユーザーが迷わない構成・ヒアリングになっているか確認してください。',
  '論理飛躍やヌケモレ、不明瞭な点がないか全面的に見直してください。',
  '回答内容に矛盾がないか確認してください。',
];

const TRANSLATION_REVIEW_GUIDELINES = [
  '汎用性：{industryScope}および他業種でも応用可能なヒアリング・出力設計となっているか',
  'ヌケモレ：受信者・目的・文調・セキュリティ・法令・言語・テンプレ等全て網羅しているか',
  '利用者の文書レベル・状況変動にも柔軟対応可能な設計',
  '必要に応じ、用途別カスタマイズ例やTipsも入れられる構造',
];

const CHILDCARE_REVIEW_GUIDELINES = [
  '相談者の感情に寄り添った言葉になっているか。',
  '提案が安全面や現実的な負担を十分に考慮しているか。',
  '必要に応じて信頼できる支援先や専門家を案内しているか。',
  '最後にねぎらいのメッセージが含まれているか。',
];

function getOutputConditions(domainCategory: string): string[] {
  if (domainCategory === '育児相談がしたい') {
    return CHILDCARE_OUTPUT_CONDITIONS;
  }
  if (domainCategory === '翻訳や文章校閲がしたい') {
    return TRANSLATION_OUTPUT_CONDITIONS;
  }
  return DEFAULT_OUTPUT_CONDITIONS;
}

function getReviewGuidelines(domainCategory: string): string[] {
  if (domainCategory === '育児相談がしたい') {
    return CHILDCARE_REVIEW_GUIDELINES;
  }
  if (domainCategory === '翻訳や文章校閲がしたい') {
    return TRANSLATION_REVIEW_GUIDELINES;
  }
  return DEFAULT_REVIEW_GUIDELINES;
}

const DOMAIN_TEMPLATES: Record<string, DomainTemplate> = {
  'IT技術を知りたい': {
    focusPlaceholder:
      '例: AWSアーキテクチャ設計、Kubernetes運用のベストプラクティス、Terraformによる自動化 など',
    roleDefinition: ({ domain }) => {
      return [
        `あなたは、「${domain}について知りたい」という利用者の要望に対し、わかりやすく解説するテクニカルメンターです。`,
        '利用者のスキルレベルに合わせて、基礎から応用までの道筋を丁寧に示し、前提知識が少なくても理解できるように説明してください。',
        '設定手順や注意点、参考となる追加リソースも提案してください。',
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
    roleDefinition: ({ industryDisplay, hasIndustry }) => {
      const industryLabel = hasIndustry
        ? industryDisplay.match(/業(界|種)$/u)
          ? industryDisplay
          : `${industryDisplay}業界`
        : '多様な業界シーン';
      return [
        `あなたは「${industryLabel}におけるメッセージ校閲・提案スペシャリストAI」です。`,
        '本AIは、プロフェッショナルな視点からユーザーから連携された文章の校閲・改善・適切なコミュニケーション提案まで行います。関係者に信用され信頼を損なうことなく、かつ明確・簡潔・正確で適法かつセキュアな表現になるように伴走します。',
        '入力された原文メッセージの校閲だけでなく、伝えたい内容やトーンの希望に基づいたゼロベース作成も可能です。日本語・英語両対応を基本とし、重要性・顧客層・業務背景の観点も加味して提案します。',
      ].join('\n');
    },
    defaultTasks: () => [
      'AIは以下を行います：',
      '- 入力されたメッセージの校閲',
      '- 改善案および目的・受信者別のバリエーション提案 (例：カジュアル/フォーマル/上長用など)',
      '- 伝えたい内容・背景からの新規文面ドラフト生成',
      '- 英語でのネイティブチェックおよびプロフェッショナル翻訳と、そのバリエーション提案',
      '- 報告/依頼/連絡/質問など用途や業務シチュエーション翻訳と、そのバリエーション提案',
      '- 情報セキュリティ・法令遵守観点のチェック',
      '- 記録 (Chatログなど)に準拠したやり取りフォーマットへの再整形',
    ],
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
        `${context.domain}に関する観察情報を整理し、重要な特徴を明確化`,
        '該当しそうな植物/昆虫の候補を複数提示し、見分けるコツを説明',
        `{industry}（観察場所やシーン）での生息時期・環境の解説`,
        '注意すべき安全面や扱い方のアドバイス',
        'さらに調べる際に役立つ図鑑やサイト、観察のヒントを提案',
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
        `${context.domain}で目指す味や雰囲気の整理`,
        '必要な材料と分量、下ごしらえのポイントの提示',
        `{industry}（想定するシーンや人数）に合わせた段取りと時間配分`,
        '失敗しやすい工程とリカバリー方法、味変アイデア',
        '盛り付け方や保存方法、アレルギー時の代替食材の提案',
      ]),
  },
  '育児相談がしたい': {
    focusPlaceholder:
      '例: 夜泣き対策、イヤイヤ期の接し方、保育園選びのポイント など',
    roleDefinition: ({ focusLabel }) => {
      return [
        'あなたは育児に関する悩みを丁寧に受け止める育児コンシェルジュです。',
        '常に穏やかで優しい語りかけを心がけ、まず相談者の気持ちを言葉にして安心感を届けてください。',
        `${focusLabel}に沿って、無理のない選択肢をステップごとに示し、必要に応じて専門家や支援窓口の活用も促してください。`,
        '相談者自身の頑張りを認め、心のケアにも寄り添ったアドバイスを行ってください。',
      ].join('\n');
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        '育児に関する状況整理（子どもの年齢や家庭環境など）',
        '保護者の気持ちに寄り添い安心につながる声かけや考え方の提案',
        '日常に取り入れやすいケアや生活リズムの工夫、安全面での注意事項',
        '必要に応じて利用できる行政・民間の支援制度や専門家・相談窓口の紹介',
        '心身を休めるセルフケアや周囲に頼るヒント、信頼できる情報源の提示',
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
      `${context.domain}の現状と課題の整理、目的の明確化`,
      '実行可能な選択肢や検討ステップの提示',
      `{industry}に関係する制約・ルール・関係者の整理`,
      'リスクと対応策、必要な準備事項の助言',
      '追加で確認すべき観点や参考情報の提案',
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
  if (trimmedCategory === '翻訳や文章校閲がしたい') {
    return '翻訳や文章校閲';
  }
  if (trimmedCategory === '育児相談がしたい') {
    return '育児相談';
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
  const shouldIncludeFocusSection =
    input.domainCategory !== '翻訳や文章校閲がしたい';
  const focusItems = shouldIncludeFocusSection
    ? sanitiseFocus(input.focusTopics)
    : [];
  const focusLabel = shouldIncludeFocusSection
    ? focusItems.length > 0
      ? focusItems.join('、')
      : trimmedFocus.length > 0
        ? trimmedFocus
        : '特定の重点領域は未指定'
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

  const focusSection = shouldIncludeFocusSection
    ? focusItems.length > 0
      ? focusItems.map((item) => `- ${item}`).join('\n')
      : trimmedFocus.length > 0
        ? `- ${trimmedFocus}`
        : '- 現時点で特に深掘りしたい項目は指定されていません。'
    : '';

  const outputConditions = getOutputConditions(input.domainCategory)
    .map((item) => `- ${item}`)
    .join('\n');

  const rawReviewGuidelines = getReviewGuidelines(input.domainCategory);
  const reviewGuidelines = rawReviewGuidelines
    .map((item) => {
      if (input.domainCategory === '翻訳や文章校閲がしたい') {
        const industryScope = hasIndustry
          ? `${industryDisplay}業界全般`
          : '想定される業界・利用シーン全般';
        return `- ${item.replace('{industryScope}', industryScope)}`;
      }
      return `- ${item}`;
    })
    .join('\n');

  const question = questionDraft.trim();
  const requestLines =
    question.length > 0
      ? sanitiseMultiline(question).map((item) => `- ${item}`)
      : ['- これから質問をお送りしますので、回答をお願いいたします。'];
  const request = requestLines.join('\n');

  const focusBlock = shouldIncludeFocusSection
    ? `\n---\n\n## 特に知りたい内容\n${focusSection}`
    : '';

  const rolePrompt = `# ロール定義\n` +
    `${template.roleDefinition(context)}` +
    '\n---' +
    `\n\n## 主な実施タスク・業務内容\n${tasks}` +
    `${focusBlock}` +
    '\n---' +
    `\n\n## AIへの補足情報\n${additionalInfoSection}` +
    '\n---' +
    `\n\n# 出力条件\n${outputConditions}` +
    '\n---' +
    `\n\n# レビュー指針\n${reviewGuidelines}` +
    '\n---' +
    `\n\n# 依頼事項\n${request}`;

  const summary = `${domain} / 想定シーン: ${industryLabel}`;

  const focusFollowUp = shouldIncludeFocusSection
    ? focusItems.length > 0
      ? '挙げていただいた関心領域の優先順位や背景があれば教えてください。'
      : '深掘りしたいトピックがあれば、具体的なキーワードを教えてください。'
    : '文章の用途や想定している読み手、希望するトーンがあれば教えてください。';

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
    focusTopics: shouldIncludeFocusSection
      ? focusItems.length > 0
        ? focusItems.join('\n')
        : trimmedFocus
      : '',
  };

  return {
    input: normalizedInput,
    rolePrompt,
    summary,
    followUpQuestions,
  };
}
