export interface PromptBuilderInput {
  domainCategory: string;
  domainDetail: string;
  roleTitle: string;
  roleDescription: string;
  background: string;
  tasks: string;
  skills: string;
  outputRequirements: string;
  reviewGuidelines: string;
  request: string;
}

export interface PromptResult {
  input: PromptBuilderInput;
  rolePrompt: string;
  summary: string;
  followUpQuestions: string[];
}

const defaults = {
  domain: '未指定の領域',
  roleTitle: '課題解決のスペシャリスト',
  roleDescription:
    '依頼内容を深く理解し、専門的かつ俯瞰的な視点で提案・改善を行ってください。',
  background: '特になし',
  tasks: ['課題の背景を把握し、仮説立案を行う。', '具体的な打ち手や改善策を提示する。'],
  skills: [
    'ドメインに関する専門的な知識',
    '構造化されたドキュメンテーション能力',
    '課題に応じたコミュニケーション力',
  ],
  outputRequirements: [
    '依頼事項に記載されたゴールを満たす提案や成果物を作成してください。',
    '不足情報がある場合は明確に質問し、ヒアリングを行ってください。',
    '日本語で丁寧かつ網羅的に解説してください。',
  ],
  reviewGuidelines: [
    '処理や提案が失敗した場合のリカバリー案を提示してください。',
    'アウトプットが実行可能であるかを必ず確認してください。',
    '論理の飛躍や抜け漏れがないかを見直してください。',
  ],
  request: 'これから依頼事項を記載しますので、準備を整えてください。',
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

  const roleTitle = input.roleTitle.trim() || defaults.roleTitle;
  const roleDescription = input.roleDescription.trim() || defaults.roleDescription;
  const background = input.background.trim() || defaults.background;

  const tasks = formatNumberedList(sanitiseMultiline(input.tasks));
  const skills = formatBulletedList(
    sanitiseMultiline(input.skills),
    defaults.skills,
  );
  const outputRequirements = formatBulletedList(
    sanitiseMultiline(input.outputRequirements),
    defaults.outputRequirements,
  );
  const reviewGuidelines = formatBulletedList(
    sanitiseMultiline(input.reviewGuidelines),
    defaults.reviewGuidelines,
  );
  const request = input.request.trim() || defaults.request;

  const rolePrompt = `# ロール定義\n` +
    `あなたは「${roleTitle}」です。 ${roleDescription} 活動領域は「${domain}」です。` +
    '\n---' +
    `\n\n## プロジェクト背景\n${background}` +
    '\n---' +
    `\n\n## 主な実施タスク・業務内容\n${tasks}` +
    '\n---' +
    `\n\n## 必須のスキルセット・知識\n${skills}` +
    '\n---' +
    `\n\n# 出力条件\n${outputRequirements}` +
    '\n---' +
    `\n\n# レビュー指針\n${reviewGuidelines}` +
    '\n---' +
    `\n\n# 依頼事項\n${request}`;

  const summary = `${roleTitle} / 領域: ${domain}`;

  const followUpQuestions = [
    '依頼事項のゴールや評価基準を具体的に教えてください。',
    `「${domain}」に特有の制約や利用環境があれば教えてください。`,
    'アウトプットで特に重視したい観点や注意点はありますか?',
  ];

  return {
    input,
    rolePrompt,
    summary,
    followUpQuestions,
  };
}
