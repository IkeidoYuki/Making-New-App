export interface PromptBuilderInput {
  domainCategory: string;
  domainDetail: string;
  industry: string;
  tasks: string;
  skills: string;
}

export interface PromptResult {
  input: PromptBuilderInput;
  rolePrompt: string;
  summary: string;
  followUpQuestions: string[];
}

const defaults = {
  domain: '未指定の領域',
  industry: '業界未指定',
  tasks: ['課題の背景を把握し、仮説立案を行う。', '具体的な打ち手や改善策を提示する。'],
  skills: [
    'ドメインに関する専門的な知識',
    '構造化されたドキュメンテーション能力',
    '課題に応じたコミュニケーション力',
  ],
};

function sanitiseMultiline(input: string): string[] {
  return input
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function formatNumberedList(items: string[]): string {
  if (items.length === 0) {
    return defaults.tasks.map((task, index) => `${index + 1}. ${task}`).join('\n');
  }
  return items.map((task, index) => `${index + 1}. ${task}`).join('\n');
}

function formatBulletedList(items: string[], fallback: string[]): string {
  const source = items.length > 0 ? items : fallback;
  return source.map((item) => `- ${item}`).join('\n');
}

export function buildPrompt(input: PromptBuilderInput): PromptResult {
  const domain =
    input.domainCategory === 'その他' && input.domainDetail.trim()
      ? input.domainDetail.trim()
      : input.domainCategory.trim() || defaults.domain;

  const industry = input.industry.trim() || '';

  const tasks = formatNumberedList(sanitiseMultiline(input.tasks));
  const skills = formatBulletedList(
    sanitiseMultiline(input.skills),
    defaults.skills,
  );

  const outputConditions = [
    '日本語で入力してください。',
    '回答は体系的に（概要→詳細→関連Tips）を基本フォーマットとしてください。',
    '業界特性・留意点（セキュリティ・可用性・法令順守など）が関係する場合は必ず言及してください。',
    '質問に応じて「ベストプラクティス」「注意点」「構成サンプル」「追加提案」などを1～3ポイントでまとめてください。',
    'じっくり考えた上で、漏れなく簡潔・網羅的に回答してください。',
    '必要に応じて段階的（ステップバイステップ）に解説を行ってください。',
    'ご不明点やカスタマイズ希望は、追加でご相談ください。',
    'レビュー指針に従って、2回レビューしてから回答してください。',
  ].map((item) => `- ${item}`).join('\n');

  const reviewGuidelines = [
    '依頼された内容を網羅的に解決するものとなっているか',
    'ユーザーが迷わない構成・ヒアリングになっているか確認してください。',
    '論理飛躍やヌケモレ、不明瞭な点がないか全面的に見直してください。',
    '回答内容に矛盾がないか確認してください。',
  ]
    .map((item) => `- ${item}`)
    .join('\n');

  const request = 'これから依頼を致しますので、回答をお願いたします';

  const industryLabel = industry || defaults.industry;

  const roleDefinition = industry
    ? `あなたは「${domain}の質問に対する専門的回答者」として、${industry}業界に特化したスペシャリストです。\n${domain}の幅広いサービス・機能・知見を持って、専門的な視点でわかりやすく正確な回答を生成します。\nユーザーの質問内容を的確に把握し、${industry}業界での活用・留意点やベストプラクティス、トラブルシューティングや最適運用案なども含めた提案・解説を行うことで、プロジェクト全体の品質と効率向上に貢献します。`
    : `あなたは「${domain}の質問に対する専門的回答者」として、業界を問わず幅広く対応するスペシャリストです。\n${domain}の幅広いサービス・機能・知見を持って、専門的な視点でわかりやすく正確な回答を生成します。\nユーザーの質問内容を的確に把握し、活用時の留意点やベストプラクティス、トラブルシューティングや最適運用案なども含めた提案・解説を行うことで、プロジェクト全体の品質と効率向上に貢献します。`;

  const rolePrompt = `# ロール定義\n` +
    `${roleDefinition}` +
    '\n---' +
    `\n\n## 主な実施タスク・業務内容\n${tasks}` +
    '\n---' +
    `\n\n## 必須のスキルセット・知識\n${skills}` +
    '\n---' +
    `\n\n# 出力条件\n${outputConditions}` +
    '\n---' +
    `\n\n# レビュー指針\n${reviewGuidelines}` +
    '\n---' +
    `\n\n# 依頼事項\n${request}`;

  const summary = `${domain} / 業界: ${industryLabel}`;

  const followUpQuestions = [
    '依頼事項のゴールや評価基準を具体的に教えてください。',
    `「${domain}」に特有の制約や利用環境があれば教えてください。`,
    industry
      ? `${industry}業界で注意すべき制度・慣習・ステークホルダーがあれば共有してください。`
      : '想定している業界や利用シーンに特有の制約があれば共有してください。',
  ];

  return {
    input,
    rolePrompt,
    summary,
    followUpQuestions,
  };
}
