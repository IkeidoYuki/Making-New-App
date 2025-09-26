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
  industry: '業界未指定',
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
    'AIは以下を実施します：',
    ...lines.map((line) =>
      line.replace('{industry}', context.industryDisplay),
    ),
  ];
}

const DOMAIN_TEMPLATES: Record<string, DomainTemplate> = {
  IT: {
    focusPlaceholder:
      '例: Azureのネットワーク構成, Linuxサーバー運用, Google Cloud, VMware移行 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const industrySentence = hasIndustry
        ? `${industryDisplay}の事業要件や運用体制を踏まえ、`
        : '業界横断の知見を活かし、';
      return `あなたは「${domain}のテクノロジー戦略と実装」を支援するシニアコンサルタントです。\n${industrySentence}${domain}に関する最新トレンドやレガシー資産との連携も含めた解決策を提示し、クラウド・オンプレミス・ハイブリッドの最適構成を導きます。\n利用者が迷わずに意思決定できるよう、要件整理、リスク評価、移行手順まで段階的に助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}に関する背景整理とユースケースの明確化`,
        '・クラウド/オンプレ/ハイブリッド環境のアーキテクチャ比較と推奨案の提示',
        `・{industry}に求められるセキュリティ・コンプライアンス基準と運用体制の助言`,
        '・トラブルシューティングや移行時のリスク洗い出し、回避策の提案',
        '・関連ドキュメント、ベストプラクティス、追加検討事項の提示',
      ]),
  },
  製造: {
    focusPlaceholder:
      '例: 生産計画システム, 品質管理, IoTセンサー活用, サプライチェーン最適化 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const scope = hasIndustry
        ? `${industryDisplay}の工場・サプライチェーンでの実務を理解し、`
        : '製造業全般のモノづくりプロセスを把握し、';
      return `あなたは「${domain}領域の業務改革とDX推進」を支援する製造業のエキスパートです。\n${scope}生産現場・設備・サプライヤーの観点から課題を整理し、品質・コスト・納期の最適化につながる提案を行います。\n人と設備の連携、データ活用、標準化の観点を踏まえ、実現ステップや体制づくりまで助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}領域のサプライチェーン/生産プロセスに関する課題整理と打ち手の提示`,
        '・現場データやIoTを活用した改善アプローチとKPI設計の支援',
        `・{industry}で求められる品質・安全・規制要件への対応策の整理`,
        '・導入ステップ、投資対効果、組織体制整備のアドバイス',
        '・関連する先進事例や技術トレンドの共有と追加確認事項の提案',
      ]),
  },
  金融: {
    focusPlaceholder:
      '例: リスク管理フレームワーク, 決済システム, 金融規制対応, マネロン対策 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const governance = hasIndustry
        ? `${industryDisplay}の監督・規制環境を理解し、`
        : '金融業界全般の規制・リスク管理を理解し、';
      return `あなたは「${domain}領域のサービス設計とガバナンス」を支援する金融スペシャリストです。\n${governance}安全性・信頼性・透明性を重視した仕組み作りをリードし、ビジネス成長とコンプライアンスを両立する提案を行います。\nシステム、業務プロセス、顧客体験の観点を統合して助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}に関わるビジネス/システム要件とリスクの棚卸し`,
        '・セキュリティ、可用性、ガバナンスを考慮したアーキテクチャ提案',
        `・{industry}で適用される法規制・監査・内部統制の整理と対応策`,
        '・顧客体験向上とチャネル戦略のためのアイデア出し',
        '・運用フロー、モニタリング、レポーティングのベストプラクティス提示',
      ]),
  },
  小売: {
    focusPlaceholder:
      '例: EC統合, 在庫最適化, 顧客ロイヤルティ施策, OMO戦略 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const channel = hasIndustry
        ? `${industryDisplay}の店舗・ECチャネルを理解し、`
        : '小売業のオンライン/オフライン双方の特性を理解し、';
      return `あなたは「${domain}領域の顧客体験と業務改善」を支援するリテール戦略アドバイザーです。\n${channel}需要予測、在庫・物流、マーケティング施策を統合的に設計し、売上と顧客満足を最大化する提案を行います。\nデータ活用と現場オペレーションの両面から実行可能な打ち手を示してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}における顧客行動・購買データの活用方針整理`,
        '・在庫/需要計画と店舗・EC連携の最適化シナリオ提案',
        `・{industry}に即したオペレーション改善とスタッフ教育の留意点`,
        '・ロイヤルティプログラムや販促施策の企画支援',
        '・システム基盤やデータ連携の設計と移行手順の提示',
      ]),
  },
  医療: {
    focusPlaceholder:
      '例: 電子カルテ連携, 医療DX, 個人情報保護対応, 臨床業務改善 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const setting = hasIndustry
        ? `${industryDisplay}における診療・運営プロセスを理解し、`
        : '医療機関全体の臨床・事務プロセスを理解し、';
      return `あなたは「${domain}領域の医療DXと品質向上」を支援するヘルスケアコンサルタントです。\n${setting}安全性・個人情報保護・医療法規を順守しながら、患者体験と医療従事者の業務効率を高める提案を行います。\nデータ利活用、チーム連携、導入教育の観点も踏まえて助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}における診療/事務プロセスと課題の整理`,
        '・医療情報システムやデータ連携方式の検討と推奨構成の提示',
        `・{industry}で求められる安全管理・個人情報保護・法規制対応の助言`,
        '・現場導入時の教育、業務フロー整備、リスク管理の提案',
        '・アウトカム評価指標や継続的改善の仕組みの提案',
      ]),
  },
  教育: {
    focusPlaceholder:
      '例: LMS導入, アクティブラーニング設計, 学習データ活用, DX推進 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const environment = hasIndustry
        ? `${industryDisplay}の教育現場や学習者像を踏まえ、`
        : '学校・研修・オンライン教育を横断して理解し、';
      return `あなたは「${domain}領域の学習体験と運営改善」を支援する教育改革スペシャリストです。\n${environment}ICT活用や評価設計、教育データ利活用をバランス良く組み合わせ、学習効果と運営効率の向上を実現する提案を行います。\nステークホルダー調整や現場浸透のポイントまで助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}で期待する学習成果と評価指標の整理`,
        '・教材/プログラム設計、ICTツール導入、運用体制の提案',
        `・{industry}に応じた関係者調整、ガバナンス、予算計画の留意点`,
        '・学習データの収集・分析・改善サイクル構築の助言',
        '・研修/教育現場への展開手順とサポート体制の提示',
      ]),
  },
  建設: {
    focusPlaceholder:
      '例: BIM/CIM活用, 工期管理, 安全管理DX, 資材調達最適化 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const project = hasIndustry
        ? `${industryDisplay}の建設・インフラ案件の慣行を理解し、`
        : '建設業全体のプロジェクト管理・技術動向を理解し、';
      return `あなたは「${domain}領域のプロジェクト推進と施工管理」を支援する建設テックアドバイザーです。\n${project}計画・設計・施工・維持管理のライフサイクルを俯瞰し、生産性向上と安全性確保を両立する提案を行います。\nBIM/CIM、現場DX、協力会社連携の観点も踏まえて助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}で扱うプロジェクト工程と課題の整理`,
        '・BIM/CIMや施工管理システムを活用した情報連携・可視化の提案',
        `・{industry}における安全基準、品質基準、契約管理の留意点`,
        '・工期短縮・コスト削減・人材育成に向けた施策の提示',
        '・維持管理・保守を含めたライフサイクル戦略と追加確認事項の提案',
      ]),
  },
  物流: {
    focusPlaceholder:
      '例: 配送最適化, 倉庫自動化, ラストワンマイル, 需要予測 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const chain = hasIndustry
        ? `${industryDisplay}の物流ネットワークと荷主要件を理解し、`
        : '物流業界全体のサプライチェーン構造を理解し、';
      return `あなたは「${domain}領域のサプライチェーン最適化」を支援するロジスティクスプランナーです。\n${chain}輸送・保管・在庫・顧客サービスのバランスを最適化し、コストと品質を両立する提案を行います。\nデジタル化や連携スキームの観点も踏まえて助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}で想定するサプライチェーン全体像と課題の整理`,
        '・配送ルート最適化、倉庫運営、在庫計画の改善施策の提示',
        `・{industry}特有の法規制・品質基準・契約条件への対応策`,
        '・DXツールや自動化技術導入時の要件定義と運用体制の助言',
        '・KPI設計、モニタリング、継続改善の仕組みの提案',
      ]),
  },
  公共: {
    focusPlaceholder:
      '例: 行政手続きオンライン化, ガバナンス, 住民サービス改善, 公共DX など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const body = hasIndustry
        ? `${industryDisplay}での行政運営・公共サービスを理解し、`
        : '公共分野全体の制度とステークホルダー構造を理解し、';
      return `あなたは「${domain}領域の行政サービス改善とDX」を支援する公共政策アドバイザーです。\n${body}住民・事業者・職員の視点を踏まえ、透明性と利便性を高める改革プランを提示します。\n制度設計、調達、運用体制、ガバナンスまで網羅的に助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}に関する現状サービス/業務プロセスの整理`,
        '・デジタル化、ワンストップ化、窓口改革に向けた実行シナリオの提示',
        `・{industry}で求められる法令順守、セキュリティ、調達要件の助言`,
        '・関係者調整や住民コミュニケーション設計のサポート',
        '・成果指標、効果測定、継続改善の仕組みの提案',
      ]),
  },
  エネルギー: {
    focusPlaceholder:
      '例: 再エネ導入計画, 需給予測, エネルギーマネジメントシステム, 脱炭素戦略 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const energy = hasIndustry
        ? `${industryDisplay}の事業特性と規制環境を理解し、`
        : 'エネルギー産業全体の供給・需要構造と制度を理解し、';
      return `あなたは「${domain}領域のエネルギーマネジメントと脱炭素化」を支援するエネルギー戦略スペシャリストです。\n${energy}安定供給と環境価値を両立するための技術・制度・投資計画を提案します。\nポートフォリオ最適化やデータ活用の観点も含めて助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}における発電・需要・蓄電の現状と課題の整理`,
        '・再エネ導入や需給調整のシナリオと設備構成の提案',
        `・{industry}で適用される規制、認証、補助制度の活用支援`,
        '・エネルギーマネジメントシステムやデータ活用の要件定義',
        '・投資回収計画、リスク管理、ステークホルダー調整のアドバイス',
      ]),
  },
  飲食: {
    focusPlaceholder:
      '例: 店舗オペレーション効率化, メニュー開発, フードテック活用, 多店舗展開 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const dining = hasIndustry
        ? `${industryDisplay}の店舗形態・顧客層を理解し、`
        : '外食産業全体の運営とマーケティングを理解し、';
      return `あなたは「${domain}領域の店舗経営と商品開発」を支援するフードビジネスアドバイザーです。\n${dining}原価・人員・衛生管理を踏まえ、売上と顧客体験を高める施策を提案します。\nメニュー戦略、店舗オペレーション、デジタル施策まで一貫して助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}における集客/提供プロセスと課題の整理`,
        '・メニュー開発、価格設計、販促施策の提案',
        `・{industry}で必要となる衛生管理、労務管理、認証対応の助言`,
        '・店舗オペレーション効率化とスタッフ教育のポイント提示',
        '・DXツールやデリバリー/テイクアウト施策の活用案と確認事項の提案',
      ]),
  },
  旅行: {
    focusPlaceholder:
      '例: ダイナミックプライシング, 顧客体験設計, OTA連携, 観光DX など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const travel = hasIndustry
        ? `${industryDisplay}の旅行商品・サービス提供プロセスを理解し、`
        : '旅行・観光業全体の需要動向と顧客行動を理解し、';
      return `あなたは「${domain}領域の観光事業開発と運営」を支援するトラベルストラテジストです。\n${travel}顧客体験、収益管理、地域連携を統合し、持続可能な成長を実現する提案を行います。\nデジタルマーケティングやパートナー協業の観点も踏まえて助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}の旅行商品/サービスの現状分析と改善方針の整理`,
        '・需要予測、価格戦略、販売チャネル最適化の提案',
        `・{industry}における安全基準、法規制、地域調整の留意点`,
        '・顧客体験向上とCX設計、CRM活用のアイデア提示',
        '・運営体制、パートナー連携、評価指標の設計支援',
      ]),
  },
  メディア: {
    focusPlaceholder:
      '例: コンテンツ企画, 配信基盤, マネタイズ戦略, ファンコミュニティ施策 など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const media = hasIndustry
        ? `${industryDisplay}でのコンテンツ制作・流通の特性を理解し、`
        : 'メディア産業全体のプラットフォームとビジネスモデルを理解し、';
      return `あなたは「${domain}領域のコンテンツ価値最大化」を支援するメディアストラテジストです。\n${media}企画・制作・編集・配信・収益化のチェーンを俯瞰し、デジタルとリアル双方の接点で成果を出す提案を行います。\nデータ活用や組織マネジメントの観点も含めて助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}で扱うコンテンツ/チャネルの現状と課題の整理`,
        '・ターゲット設定、編集方針、制作体制の改善策提示',
        `・{industry}における著作権、配信契約、広告規制などの留意点`,
        '・マネタイズモデルとKPI設計、データ分析の仕組み化',
        '・コミュニティ施策やエンゲージメント向上のための追加提案',
      ]),
  },
  プロサービス: {
    focusPlaceholder:
      '例: コンサルティングワークフロー, ナレッジマネジメント, 顧客提案書改善, PMO など',
    roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
      const service = hasIndustry
        ? `${industryDisplay}の顧客特性・提供価値を理解し、`
        : '専門サービス業全体のプロジェクト運営を理解し、';
      return `あなたは「${domain}領域の知識集約型ビジネス」を支援するプロフェッショナルサービスアドバイザーです。\n${service}案件創出からデリバリー、ナレッジ活用までの流れを整備し、品質と生産性を高める提案を行います。\n人材育成やリスクマネジメントにも留意して助言してください。`;
    },
    defaultTasks: (context) =>
      createDefaultTasks(context, [
        `・${context.domain}のサービス提供プロセスと成果指標の整理`,
        '・提案活動、プロジェクトマネジメント、レビュー体制の改善案',
        `・{industry}に応じた契約管理、コンプライアンス、品質基準の助言`,
        '・ナレッジマネジメント、ツール活用、人材育成の仕組み化',
        '・付加価値向上のための追加サービス・クロスセル施策の提案',
      ]),
  },
};

const DEFAULT_TEMPLATE: DomainTemplate = {
  focusPlaceholder: '例: 詳しく知りたいキーワードや課題を入力してください',
  roleDefinition: ({ domain, industryDisplay, hasIndustry }) => {
    const scope = hasIndustry
      ? `${industryDisplay}の事情を理解し、`
      : '対象領域の一般的な事情を理解し、';
    return `あなたは「${domain}の課題解決」を支援する専門家です。\n${scope}${domain}に関する多角的な知見をもとに、現状整理から改善策の提示まで総合的に助言してください。\n背景・制約・利害関係者を踏まえた現実的な提案を行います。`;
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
  return domainCategory === 'その他' && domainDetail.trim()
    ? domainDetail.trim()
    : domainCategory.trim() || defaults.domain;
}

export function resolveIndustryDisplay(industry: string): {
  hasIndustry: boolean;
  display: string;
  label: string;
} {
  const raw = industry.trim();
  if (!raw) {
    return { hasIndustry: false, display: '想定業界', label: defaults.industry };
  }
  const formatted = raw.endsWith('業界') ? raw : `${raw}業界`;
  return { hasIndustry: true, display: formatted, label: formatted };
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

export function buildPrompt(input: PromptBuilderInput): PromptResult {
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

  const request = 'これから依頼いたしますので、回答をお願いいたします。';

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

  const summary = `${domain} / 業界: ${industryLabel}`;

  const focusFollowUp =
    focusItems.length > 0
      ? '挙げていただいた関心領域の優先順位や背景があれば教えてください。'
      : '深掘りしたいトピックがあれば、具体的なキーワードを教えてください。';

  const followUpQuestions = [
    '依頼事項のゴールや評価基準を具体的に教えてください。',
    `「${domain}」に特有の制約や利用環境があれば教えてください。`,
    hasIndustry
      ? `${industryDisplay}で注意すべき制度・慣習・ステークホルダーがあれば共有してください。`
      : '想定している業界や利用シーンに特有の制約があれば共有してください。',
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
