export interface PromptBuilderInput {
  topic: string;
  background: string;
  desiredOutcome: string;
  answerStyle: string;
  constraints: string;
  followUpPreference: string;
}

export interface PromptResult {
  input: PromptBuilderInput;
  rolePrompt: string;
  summary: string;
  followUpQuestions: string[];
}

const fallback = {
  topic: '課題',
  desiredOutcome: '期待する成果',
  answerStyle: '専門的かつ親切なトーン',
};

export function buildPrompt(input: PromptBuilderInput): PromptResult {
  const rolePrompt = `あなたは${input.topic || fallback.topic}の専門家です。` +
    `以下の状況を理解し、${input.desiredOutcome || fallback.desiredOutcome}を達成するための助言を行ってください。` +
    `\n\n背景情報:\n${input.background || '特になし'}` +
    `\n\n回答のゴール:\n${input.desiredOutcome || fallback.desiredOutcome}` +
    `\n\n回答トーン:\n${input.answerStyle || fallback.answerStyle}` +
    (input.constraints
      ? `\n\n遵守すべき条件:\n${input.constraints}`
      : '') +
    (input.followUpPreference
      ? `\n\n回答後は次のような観点で追加のヒアリングを提案してください:\n${input.followUpPreference}`
      : '') +
    '\n\n回答は箇条書きで分かりやすくまとめ、必要であればステップバイステップで説明してください。';

  const summary = `${input.topic || fallback.topic} / ゴール: ${
    input.desiredOutcome || fallback.desiredOutcome
  }`;

  const followUpQuestions = [
    '成功条件や評価指標はどのように定義されますか?',
    '想定している制約やリソースの限界はありますか?',
    input.followUpPreference
      ? input.followUpPreference
      : 'その他に伝えておくべき背景情報はありますか?',
  ];

  return {
    input,
    rolePrompt,
    summary,
    followUpQuestions,
  };
}
