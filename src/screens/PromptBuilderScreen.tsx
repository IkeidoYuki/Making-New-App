import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppStateContext';
import {
  buildPrompt,
  generateDefaultTasksText,
  getDomainTemplate,
  PromptBuilderInput,
} from '../utils/prompt';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptBuilder'>;

const DOMAIN_OPTIONS = [
  'IT技術を知りたい',
  '翻訳や文章校閲がしたい',
  '花や虫の名前が知りたい',
  '美味しいレシピを知りたい',
  '育児相談がしたい',
  'その他（自由記述）',
];

const IT_CATEGORY_OPTIONS = [
  'クラウド',
  'コンテナ',
  'IaC/自動化',
  '監視/APM',
  'DB',
  'セキュリティ',
  '開発',
  'SaaS',
  'モバイル/端末',
  'ネットワーク',
];

const INDUSTRY_OPTIONS = ['IT', 'その他'];

const isCustomDomain = (option: string) => option.startsWith('その他');

const PromptBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, setPromptResult, questionDraft } = useAppState();

  const [domainCategory, setDomainCategory] = React.useState('');
  const [domainDetail, setDomainDetail] = React.useState('');
  const [selectedItCategories, setSelectedItCategories] = React.useState<string[]>([]);
  const [itOtherDetail, setItOtherDetail] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [industryOption, setIndustryOption] = React.useState('');
  const [industryOtherDetail, setIndustryOtherDetail] = React.useState('');
  const [industryFreeDetail, setIndustryFreeDetail] = React.useState('');
  const [focusTopics, setFocusTopics] = React.useState('');
  const [tasks, setTasks] = React.useState('');
  const [didEditTasks, setDidEditTasks] = React.useState(false);
  const [additionalInfo, setAdditionalInfo] = React.useState('');

  React.useEffect(() => {
    if (promptResult) {
      setDomainCategory(promptResult.input.domainCategory);
      setDomainDetail(promptResult.input.domainDetail);
      const savedIndustry = promptResult.input.industry;
      setIndustry(savedIndustry);

      const isTranslation =
        promptResult.input.domainCategory === '翻訳や文章校閲がしたい';
      const isItDomain =
        promptResult.input.domainCategory === 'IT技術を知りたい';
      const isCustom = isCustomDomain(promptResult.input.domainCategory);

      if (isTranslation || isItDomain || isCustom) {
        setIndustryOption('');
        setIndustryOtherDetail('');
        const cleaned = savedIndustry
          .replace(/^その他[：:（(]?(.*?)[）)]?$/u, '$1')
          .trim();
        const freeDetailValue = cleaned.length > 0 ? cleaned : savedIndustry.trim();
        setIndustryFreeDetail(freeDetailValue);
      } else {
        setIndustryFreeDetail('');
        if (savedIndustry === 'IT') {
          setIndustryOption('IT');
          setIndustryOtherDetail('');
        } else if (savedIndustry.startsWith('その他')) {
          setIndustryOption('その他');
          const detail = savedIndustry.replace(/^その他[：:（(、\s)]*/u, '')
            .replace(/[）)]$/u, '');
          setIndustryOtherDetail(detail === 'その他' ? '' : detail);
        } else if (savedIndustry.trim().length > 0) {
          setIndustryOption('その他');
          setIndustryOtherDetail(savedIndustry);
        } else {
          setIndustryOption('');
          setIndustryOtherDetail('');
        }
      }

      setFocusTopics(promptResult.input.focusTopics ?? '');
      const savedTasks = promptResult.input.tasks ?? '';
      setTasks(savedTasks);
      setDidEditTasks(savedTasks.trim().length > 0);
      setAdditionalInfo(promptResult.input.additionalInfo);

      if (promptResult.input.domainCategory === 'IT技術を知りたい') {
        const detail = promptResult.input.domainDetail;
        if (detail) {
          const tokens = detail.split(/[、,]/).map((item) => item.trim());
          const selected: string[] = [];
          let otherText = '';
          tokens.forEach((token) => {
            if (!token) {
              return;
            }
            if (token.startsWith('その他')) {
              otherText = token
                .replace(/^その他[：:（(]/, '')
                .replace(/[）)]$/u, '')
                .trim();
              return;
            }
            selected.push(token);
          });
          setSelectedItCategories(selected);
          setItOtherDetail(otherText);
        }
      } else {
        setSelectedItCategories([]);
        setItOtherDetail('');
      }

      if (promptResult.input.domainCategory === '花や虫の名前が知りたい') {
        setIndustry('生物観察のシーン');
        setIndustryOption('');
        setIndustryOtherDetail('');
        setIndustryFreeDetail('');
      }

      if (
        promptResult.input.domainCategory === '美味しいレシピを知りたい' ||
        promptResult.input.domainCategory === '育児相談がしたい'
      ) {
        setIndustry('');
        setIndustryOption('');
        setIndustryOtherDetail('');
        setIndustryFreeDetail('');
      }
    }
  }, [promptResult]);

  const handleSelectDomain = React.useCallback((option: string) => {
    setDomainCategory(option);
    setFocusTopics('');
    setDidEditTasks(false);
    setIndustry('');
    setIndustryOption('');
    setIndustryOtherDetail('');
    setIndustryFreeDetail('');
    if (!isCustomDomain(option)) {
      setDomainDetail('');
    }
    if (option !== 'IT技術を知りたい') {
      setSelectedItCategories([]);
      setItOtherDetail('');
    }
    if (option === '花や虫の名前が知りたい') {
      setIndustry('生物観察のシーン');
    }
  }, []);

  const computeItDetail = React.useCallback(
    (categories: string[], other: string) => {
      const items = [...categories];
      const otherTrimmed = other.trim();
      if (otherTrimmed.length > 0) {
        items.push(`その他：${otherTrimmed}`);
      }
      return items.join('、');
    },
    [],
  );

  const effectiveDomainDetail = React.useMemo(() => {
    if (domainCategory === 'IT技術を知りたい') {
      return computeItDetail(selectedItCategories, itOtherDetail);
    }
    return domainDetail;
  }, [computeItDetail, domainCategory, domainDetail, itOtherDetail, selectedItCategories]);

  const handleToggleItCategory = React.useCallback(
    (category: string) => {
      setSelectedItCategories((prev) => {
        const exists = prev.includes(category);
        const next = exists
          ? prev.filter((item) => item !== category)
          : [...prev, category];
        return next;
      });
    },
    [],
  );

  React.useEffect(() => {
    if (domainCategory !== 'IT技術を知りたい') {
      return;
    }
    const detail = computeItDetail(selectedItCategories, itOtherDetail);
    if (detail !== domainDetail) {
      setDomainDetail(detail);
    }
  }, [computeItDetail, domainCategory, domainDetail, itOtherDetail, selectedItCategories]);

  const isCustomDomainSelected = isCustomDomain(domainCategory);

  const effectiveIndustry = React.useMemo(() => {
    if (
      domainCategory === '翻訳や文章校閲がしたい' ||
      domainCategory === 'IT技術を知りたい' ||
      isCustomDomainSelected
    ) {
      return industryFreeDetail.trim();
    }
    if (industryOption === 'IT') {
      return 'IT';
    }
    if (industryOption === 'その他') {
      const trimmed = industryOtherDetail.trim();
      return trimmed.length > 0 ? `その他：${trimmed}` : 'その他';
    }
    return '';
  }, [
    domainCategory,
    industryFreeDetail,
    industryOption,
    industryOtherDetail,
    isCustomDomainSelected,
  ]);

  React.useEffect(() => {
    if (effectiveIndustry !== industry) {
      setIndustry(effectiveIndustry);
    }
  }, [effectiveIndustry, industry]);

  const handleTasksChange = React.useCallback((value: string) => {
    setTasks(value);
    setDidEditTasks(true);
  }, []);

  React.useEffect(() => {
    if (!domainCategory) {
      setTasks('');
      setDidEditTasks(false);
      return;
    }
    if (!didEditTasks) {
      const autoTasks = generateDefaultTasksText(
        domainCategory,
        effectiveDomainDetail,
        effectiveIndustry,
      );
      setTasks(autoTasks);
    }
  }, [
    domainCategory,
    effectiveDomainDetail,
    effectiveIndustry,
    didEditTasks,
  ]);

  const handleGenerate = React.useCallback(() => {
    if (!domainCategory) {
      Alert.alert('テーマ・領域を選択してください');
      return;
    }

    if (isCustomDomainSelected && domainDetail.trim().length === 0) {
      Alert.alert('テーマの詳細を入力してください');
      return;
    }

    const input: PromptBuilderInput = {
      domainCategory,
      domainDetail: effectiveDomainDetail,
      industry: effectiveIndustry,
      focusTopics,
      tasks,
      additionalInfo,
    };

    const result = buildPrompt(input, questionDraft);
    setPromptResult(result);
    navigation.navigate('Main');
  }, [
    domainCategory,
    domainDetail,
    effectiveDomainDetail,
    effectiveIndustry,
    focusTopics,
    tasks,
    additionalInfo,
    setPromptResult,
    navigation,
    isCustomDomainSelected,
    questionDraft,
  ]);

  const domainTemplate = getDomainTemplate(domainCategory);
  const focusPlaceholder = domainCategory
    ? domainTemplate.focusPlaceholder
    : 'テーマを選択すると入力例が表示されます';

  const shouldHideIndustry = [
    '花や虫の名前が知りたい',
    '美味しいレシピを知りたい',
    '育児相談がしたい',
  ].includes(domainCategory);

  const isTranslationDomain = domainCategory === '翻訳や文章校閲がしたい';
  const isFreeIndustryDomain =
    isTranslationDomain ||
    domainCategory === 'IT技術を知りたい' ||
    isCustomDomainSelected;

  const shouldShowIndustrySection =
    !shouldHideIndustry && domainCategory.length > 0;

  const industryPlaceholder = React.useMemo(() => {
    if (isTranslationDomain) {
      return '例: 観光業のパンフレット、IT企業の採用サイト、医療業界向け資料 など';
    }
    if (domainCategory === 'IT技術を知りたい') {
      return '例: 金融業のシステム部門、スタートアップのプロダクト開発、公共機関の情報システム など';
    }
    if (isCustomDomainSelected) {
      return '例: 対象となる業界やシーンを自由に入力してください';
    }
    return '想定している業界や利用シーンがあれば入力してください';
  }, [
    domainCategory,
    isCustomDomainSelected,
    isTranslationDomain,
  ]);

  const industryHelperText = React.useMemo(() => {
    if (isTranslationDomain) {
      return 'どの業界・場面で使われる文章かを自由に記述してください。読み手の立場や雰囲気が分かると翻訳の精度が高まります。';
    }
    if (domainCategory === 'IT技術を知りたい') {
      return '自由記述です。担当部門や利用するチーム、求められる品質レベルなどが分かると具体的な助言がしやすくなります。';
    }
    if (isCustomDomainSelected) {
      return '自由記述です。想定する業界や利用場面が分かると、出力内容をより適切にカスタマイズできます。';
    }
    return '該当する業界や利用シーンがあれば自由に記述してください。';
  }, [domainCategory, isCustomDomainSelected, isTranslationDomain]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>質問内容のヒアリング</Text>
      <Text style={[styles.description, styles.marginTopSmall]}>
        以下の項目を入力すると、AIに与えるロール指示と質問テンプレートを生成します。
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>テーマ・領域</Text>
        <View style={styles.optionList}>
          {DOMAIN_OPTIONS.map((option) => {
            const isSelected = domainCategory === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionChip,
                  isSelected && styles.optionChipSelected,
                ]}
                onPress={() => handleSelectDomain(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    isSelected && styles.optionChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isCustomDomainSelected ? (
        <View style={styles.formGroup}>
          <Text style={styles.sectionLabel}>テーマの詳細</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="どのようなテーマを扱いたいか具体的に入力してください"
            value={domainDetail}
            onChangeText={setDomainDetail}
            multiline
          />
          <Text style={styles.helperText}>
            例: 介護現場での人材育成、地域コミュニティの活性化 など
          </Text>
        </View>
      ) : null}

      {domainCategory === 'IT技術を知りたい' ? (
        <View style={styles.formGroup}>
          <Text style={styles.sectionLabel}>興味のある分野</Text>
          <View style={styles.optionList}>
            {IT_CATEGORY_OPTIONS.map((category) => {
              const isSelected = selectedItCategories.includes(category);
              return (
                <Pressable
                  key={category}
                  style={[
                    styles.optionChip,
                    styles.stackChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() => handleToggleItCategory(category)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.helperText, styles.marginTopSmall]}>
            興味のある分野は複数選択できます。詳しく指定したい内容があれば「その他（自由記述）」に記入してください。
          </Text>
          <View style={styles.marginTopSmall}>
            <Text style={styles.stackGroupTitle}>その他（自由記述）</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="特定のサービス名や環境など、追加で指定したい内容があれば入力してください"
              value={itOtherDetail}
              onChangeText={setItOtherDetail}
              multiline
            />
          </View>
        </View>
      ) : null}

      {domainCategory && !isTranslationDomain ? (
        <View style={styles.formGroup}>
          <Text style={styles.sectionLabel}>特に知りたい内容（任意）</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder={focusPlaceholder}
            value={focusTopics}
            onChangeText={setFocusTopics}
            multiline
          />
          <Text style={styles.helperText}>
            複数ある場合は改行またはカンマで区切って入力してください。
          </Text>
        </View>
      ) : null}

      {shouldShowIndustrySection ? (
        <View style={styles.formGroup}>
          <Text style={styles.sectionLabel}>想定している業界（任意）</Text>
          {isFreeIndustryDomain ? (
            <>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder={industryPlaceholder}
                value={industryFreeDetail}
                onChangeText={setIndustryFreeDetail}
                multiline
              />
              <Text style={styles.helperText}>{industryHelperText}</Text>
            </>
          ) : (
            <>
              <View style={styles.optionList}>
                {INDUSTRY_OPTIONS.map((option) => {
                  const isSelected = industryOption === option;
                  return (
                    <Pressable
                      key={option}
                      style={[
                        styles.optionChip,
                        styles.industryChip,
                        isSelected && styles.optionChipSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setIndustryOption('');
                          setIndustry('');
                          setIndustryOtherDetail('');
                        } else {
                          setIndustryOption(option);
                          if (option === 'IT') {
                            setIndustry('IT');
                            setIndustryOtherDetail('');
                          } else {
                            setIndustry('その他');
                          }
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isSelected && styles.optionChipTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {industryOption === 'その他' ? (
                <TextInput
                  style={[styles.input, styles.multiline, styles.marginTopSmall]}
                  placeholder="詳細があれば入力してください"
                  value={industryOtherDetail}
                  onChangeText={setIndustryOtherDetail}
                  multiline
                />
              ) : null}
            </>
          )}
        </View>
      ) : null}

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>主な実施タスク</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="この領域でAIに実施してほしいタスクを入力してください"
          value={tasks}
          onChangeText={handleTasksChange}
          multiline
        />
        <Text style={styles.helperText}>
          選択したテーマに合わせて自動入力されています。必要に応じて追記・編集してください。
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>AIに知っておいてほしい情報（任意・URLも可）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="共有したい補足情報や参考URLがあれば入力してください"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
        />
      </View>

      <Pressable style={[styles.primaryButton, styles.marginTopSmall]} onPress={handleGenerate}>
        <Text style={styles.primaryButtonText}>ロールプロンプトを生成する</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  marginTopSmall: {
    marginTop: 16,
  },
  formGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#ffffff',
    flexBasis: '48%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipSelected: {
    backgroundColor: '#2563eb11',
    borderColor: '#2563eb',
  },
  optionChipText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionChipTextSelected: {
    color: '#1d4ed8',
  },
  stackGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  stackChip: {
    flexBasis: '30%',
    minWidth: 96,
  },
  industryChip: {
    flexBasis: '45%',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PromptBuilderScreen;
