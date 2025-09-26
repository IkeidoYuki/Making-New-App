export interface PromptBuilderInput {
  domainCategory: string;
  domainDetail: string;
  industry: string;
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
  industry: '業界未指定',
};

function sanitiseMultiline(input: string): string[] {
  return input
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function buildPrompt(input: PromptBuilderInput): PromptResult {
  const domain =
    input.domainCategory === 'その他' && input.domainDetail.trim()
      ? input.domainDetail.trim()
      : input.domainCategory.trim() || defaults.domain;

  const rawIndustry = input.industry.trim();
  const hasIndustry = rawIndustry.length > 0;
  const industryDisplay = hasIndustry
    ? rawIndustry.endsWith('業界')
      ? rawIndustry
      : `${rawIndustry}業界`
    : '想定業界';
  const industryLabel = hasIndustry ? industryDisplay : defaults.industry;

  const additionalInfoItems = sanitiseMultiline(input.additionalInfo);
  const additionalInfoSection =
    additionalInfoItems.length > 0
      ? additionalInfoItems.map((item) => `- ${item}`).join('\n')
      : '- 現時点で共有された追加情報はありません。';

  const tasks = [
    'AIは以下を実施します：',
    `・${domain}全般に関する知見に基づき、業界特性を踏まえた技術回答の作成`,
    '・現場で生じるQ&A対応、トラブル調査、運用手順のアドバイス',
    `・${industryDisplay}に求められるセキュリティ基準・コンプライアンス要件の助言`,
    '・最新のアップデートや推奨アーキテクチャの情報提供',
    '・入力された質問内容に応じて、関連資料・サンプル構成',
    '・注意事項も付与',
  ].join('\n');

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

  const roleDefinition = hasIndustry
    ? `あなたは「${domain}の質問に対する専門的回答者」として、${industryDisplay}に特化したスペシャリストです。\n${domain}の幅広いサービス・機能・知見を持って、専門的な視点でわかりやすく正確な回答を生成します。\nユーザーの質問内容を的確に把握し、${industryDisplay}での活用・留意点やベストプラクティス、トラブルシューティングや最適運用案なども含めた提案・解説を行うことで、プロジェクト全体の品質と効率向上に貢献します。`
    : `あなたは「${domain}の質問に対する専門的回答者」として、業界を問わず幅広く対応するスペシャリストです。\n${domain}の幅広いサービス・機能・知見を持って、専門的な視点でわかりやすく正確な回答を生成します。\nユーザーの質問内容を的確に把握し、活用時の留意点やベストプラクティス、トラブルシューティングや最適運用案なども含めた提案・解説を行うことで、プロジェクト全体の品質と効率向上に貢献します。`;

  const rolePrompt = `# ロール定義\n` +
    `${roleDefinition}` +
    '\n---' +
    `\n\n## 主な実施タスク・業務内容\n${tasks}` +
    '\n---' +
    `\n\n## AIに知っておいてほしい情報\n${additionalInfoSection}` +
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
    hasIndustry
      ? `${industryDisplay}で注意すべき制度・慣習・ステークホルダーがあれば共有してください。`
      : '想定している業界や利用シーンに特有の制約があれば共有してください。',
  ];

  return {
    input,
    rolePrompt,
    summary,
    followUpQuestions,
  };
}
