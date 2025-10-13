import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  findNodeHandle,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppStateContext';
import {
  buildPrompt,
  generateDefaultTasksText,
  generateDefaultSkillsText,
  getDomainTemplate,
  PromptBuilderInput,
} from '../utils/prompt';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptBuilder'>;

const DOMAIN_OPTIONS = [
  'IT技術を知りたい',
  '翻訳や文章校閲がしたい',
  '画像の修正・作成がしたい',
  '花や虫の名前が知りたい',
  '美味しいレシピを知りたい',
  '育児相談がしたい',
  'その他（自由記述）',
];

const PLACEHOLDER_COLOR = '#334155';

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
  'その他（自由記述）',
];

const CHILDCARE_TOPIC_OPTIONS = [
  '授乳',
  '食事',
  '睡眠',
  '体調',
  '服装',
  '発達',
  '遊び/おもちゃ',
  '予防接種/受診目安',
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
  const [requiredSkills, setRequiredSkills] = React.useState('');
  const [didEditSkills, setDidEditSkills] = React.useState(false);
  const [additionalInfo, setAdditionalInfo] = React.useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  const [selectedChildcareTopics, setSelectedChildcareTopics] =
    React.useState<string[]>([]);

  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const domainDetailRef = React.useRef<TextInput | null>(null);
  const focusInputRef = React.useRef<TextInput | null>(null);
  const tasksInputRef = React.useRef<TextInput | null>(null);
  const skillsInputRef = React.useRef<TextInput | null>(null);
  const industryFreeInputRef = React.useRef<TextInput | null>(null);
  const industryOtherInputRef = React.useRef<TextInput | null>(null);
  const itOtherDetailRef = React.useRef<TextInput | null>(null);
  const additionalInfoRef = React.useRef<TextInput | null>(null);

  const scrollToInput = React.useCallback(
    (inputRef: React.RefObject<TextInput | null>) => {
      const scrollView = scrollViewRef.current;
      const input = inputRef.current as TextInput & {
        measureLayout?: (
          relativeToNativeNode: number,
          onSuccess: (x: number, y: number) => void,
          onFail: () => void,
        ) => void;
      };
      if (!scrollView || !input || typeof input.measureLayout !== 'function') {
        return;
      }
      const scrollViewHandle = findNodeHandle(scrollView);
      if (!scrollViewHandle) {
        return;
      }
      input.measureLayout(
        scrollViewHandle,
        (_x, y) => {
          scrollView.scrollTo({ y: Math.max(y - 20, 0), animated: true });
        },
        () => {},
      );
    },
    [],
  );

  const toggleAdvanced = React.useCallback(() => {
    setIsAdvancedOpen((prev) => !prev);
  }, []);

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

      const focusValue = promptResult.input.focusTopics ?? '';
      setFocusTopics(focusValue);
      const savedTasks = promptResult.input.tasks ?? '';
      setTasks(savedTasks);
      setDidEditTasks(savedTasks.trim().length > 0);
      const savedSkills = promptResult.input.requiredSkills ?? '';
      setRequiredSkills(savedSkills);
      setDidEditSkills(savedSkills.trim().length > 0);
      setAdditionalInfo(promptResult.input.additionalInfo);

      if (promptResult.input.domainCategory === 'IT技術を知りたい') {
        const detail = promptResult.input.domainDetail;
        if (detail) {
          const tokens = detail.split(/[、,]/).map((item) => item.trim());
          const selected: string[] = [];
          let otherText = '';
          let shouldSelectOther = false;
          tokens.forEach((token) => {
            if (!token) {
              return;
            }
            if (token.startsWith('その他')) {
              shouldSelectOther = true;
              otherText = token
                .replace(/^その他[：:（(]/, '')
                .replace(/[）)]$/u, '')
                .trim();
              return;
            }
            selected.push(token);
          });
          if (shouldSelectOther) {
            selected.push('その他（自由記述）');
          }
          setSelectedItCategories(selected);
          setItOtherDetail(otherText);
        } else {
          setSelectedItCategories([]);
          setItOtherDetail('');
        }
      } else {
        setSelectedItCategories([]);
        setItOtherDetail('');
      }

      if (promptResult.input.domainCategory === '育児相談がしたい') {
        const tokens = focusValue
          .split(/\n|、|,|，/)
          .map((item) => item.trim())
          .filter((item) => CHILDCARE_TOPIC_OPTIONS.includes(item));
        setSelectedChildcareTopics(tokens);
      } else {
        setSelectedChildcareTopics([]);
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
    setRequiredSkills('');
    setDidEditSkills(false);
    setIndustry('');
    setIndustryOption('');
    setIndustryOtherDetail('');
    setIndustryFreeDetail('');
    setSelectedChildcareTopics([]);
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
      const items = categories.filter((item) => item !== 'その他（自由記述）');
      const otherSelected = categories.includes('その他（自由記述）');
      const otherTrimmed = other.trim();
      if (otherSelected) {
        items.push(
          otherTrimmed.length > 0 ? `その他：${otherTrimmed}` : 'その他',
        );
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
        if (!next.includes('その他（自由記述）')) {
          setItOtherDetail('');
        }
        return next;
      });
    },
    [],
  );

  const handleToggleChildcareTopic = React.useCallback((topic: string) => {
    setSelectedChildcareTopics((prev) => {
      const exists = prev.includes(topic);
      return exists ? prev.filter((item) => item !== topic) : [...prev, topic];
    });
  }, []);

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

  const handleSkillsChange = React.useCallback((value: string) => {
    setRequiredSkills(value);
    setDidEditSkills(true);
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

  React.useEffect(() => {
    if (!domainCategory) {
      setRequiredSkills('');
      setDidEditSkills(false);
      return;
    }
    if (!didEditSkills) {
      const autoSkills = generateDefaultSkillsText(
        domainCategory,
        effectiveDomainDetail,
        effectiveIndustry,
      );
      setRequiredSkills(autoSkills);
    }
  }, [
    domainCategory,
    effectiveDomainDetail,
    effectiveIndustry,
    didEditSkills,
  ]);

  React.useEffect(() => {
    if (domainCategory !== '育児相談がしたい') {
      return;
    }
    const joined = selectedChildcareTopics.join('\n');
    if (joined !== focusTopics) {
      setFocusTopics(joined);
    }
  }, [domainCategory, focusTopics, selectedChildcareTopics]);

  React.useEffect(() => {
    if (!isImageDomain) {
      return;
    }
    if (focusTopics.length > 0) {
      setFocusTopics('');
    }
  }, [focusTopics, isImageDomain]);

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
      requiredSkills,
      additionalInfo,
    };

    const result = buildPrompt(input, questionDraft);
    setPromptResult(result);
    navigation.navigate('PromptResult');
  }, [
    domainCategory,
    domainDetail,
    effectiveDomainDetail,
    effectiveIndustry,
    focusTopics,
    tasks,
    requiredSkills,
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

  const isTranslationDomain = domainCategory === '翻訳や文章校閲がしたい';
  const isChildcareDomain = domainCategory === '育児相談がしたい';
  const isImageDomain = domainCategory === '画像の修正・作成がしたい';
  const shouldHideIndustry = [
    '花や虫の名前が知りたい',
    '美味しいレシピを知りたい',
    '育児相談がしたい',
    '画像の修正・作成がしたい',
  ].includes(domainCategory);
  const isFreeIndustryDomain =
    isTranslationDomain ||
    domainCategory === 'IT技術を知りたい' ||
    isCustomDomainSelected;

  const shouldShowIndustrySection =
    !shouldHideIndustry && domainCategory.length > 0;

  const shouldShowFocusInput =
    domainCategory.length > 0 &&
    !isTranslationDomain &&
    !isChildcareDomain &&
    !isImageDomain;
  const shouldRenderFocusInAccordion =
    domainCategory === '花や虫の名前が知りたい' ||
    domainCategory === '美味しいレシピを知りたい';
  const isIndustryInAccordion = domainCategory === 'IT技術を知りたい';

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

  const renderFocusInputSection = (withinAccordion: boolean) => (
    <View
      style={withinAccordion ? styles.accordionSection : styles.formGroup}
    >
      <Text style={styles.sectionLabel}>特に知りたい内容（任意）</Text>
      <TextInput
        ref={focusInputRef}
        style={[styles.input, styles.multiline]}
        placeholder={focusPlaceholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={focusTopics}
        onChangeText={setFocusTopics}
        onFocus={() => scrollToInput(focusInputRef)}
        multiline
      />
      <Text style={styles.helperText}>
        複数ある場合は改行またはカンマで区切って入力してください。
      </Text>
    </View>
  );

  const renderIndustrySection = (withinAccordion: boolean) => {
    if (!shouldShowIndustrySection) {
      return null;
    }
    return (
      <View
        style={withinAccordion ? styles.accordionSection : styles.formGroup}
      >
        <Text style={styles.sectionLabel}>想定している業界（任意）</Text>
        {isFreeIndustryDomain ? (
          <>
            <TextInput
              ref={industryFreeInputRef}
              style={[styles.input, styles.multiline]}
              placeholder={industryPlaceholder}
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={industryFreeDetail}
              onChangeText={setIndustryFreeDetail}
              onFocus={() => scrollToInput(industryFreeInputRef)}
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
                ref={industryOtherInputRef}
                style={[styles.input, styles.multiline, styles.marginTopSmall]}
                placeholder="詳細があれば入力してください"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={industryOtherDetail}
                onChangeText={setIndustryOtherDetail}
                onFocus={() => scrollToInput(industryOtherInputRef)}
                multiline
              />
            ) : null}
          </>
        )}
      </View>
    );
  };

  const renderTasksSection = () => (
    <>
      <View style={styles.accordionSection}>
        <Text style={styles.sectionLabel}>主な実施タスク</Text>
        <TextInput
          ref={tasksInputRef}
          style={[styles.input, styles.multiline]}
          placeholder="この領域でAIに実施してほしいタスクを入力してください"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={tasks}
          onChangeText={handleTasksChange}
          onFocus={() => scrollToInput(tasksInputRef)}
          multiline
        />
        <Text style={styles.helperText}>
          選択したテーマに合わせて自動入力されています。必要に応じて追記・編集してください。
        </Text>
      </View>
      <View style={[styles.accordionSection, styles.marginTopSmall]}>
        <Text style={styles.sectionLabel}>必須のスキルセット</Text>
        <TextInput
          ref={skillsInputRef}
          style={[styles.input, styles.multiline]}
          placeholder="この領域でAIに求められるスキルや知識を入力してください"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={requiredSkills}
          onChangeText={handleSkillsChange}
          onFocus={() => scrollToInput(skillsInputRef)}
          multiline
        />
        <Text style={styles.helperText}>
          選択したテーマに合わせて自動入力されています。AIに期待する専門スキルがあれば追記・編集してください。
        </Text>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentInset={{ bottom: 32 }}
        contentInsetAdjustmentBehavior="automatic"
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
              ref={domainDetailRef}
              style={[styles.input, styles.multiline]}
              placeholder="どのようなテーマを扱いたいか具体的に入力してください"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={domainDetail}
              onChangeText={setDomainDetail}
              onFocus={() => scrollToInput(domainDetailRef)}
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
              興味のある分野は複数選択できます。詳しく指定したい内容があれば「その他（自由記述）」を選択して記入してください。
            </Text>
            {selectedItCategories.includes('その他（自由記述）') ? (
              <View style={styles.marginTopSmall}>
                <Text style={styles.stackGroupTitle}>その他（自由記述）</Text>
                <TextInput
                  ref={itOtherDetailRef}
                  style={[styles.input, styles.multiline]}
                  placeholder="特定のサービス名や環境など、追加で指定したい内容があれば入力してください"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={itOtherDetail}
                  onChangeText={setItOtherDetail}
                  onFocus={() => scrollToInput(itOtherDetailRef)}
                  multiline
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {isChildcareDomain ? (
          <View style={styles.formGroup}>
            <Text style={styles.sectionLabel}>特に知りたい内容</Text>
            <View style={styles.optionList}>
              {CHILDCARE_TOPIC_OPTIONS.map((topic) => {
                const isSelected = selectedChildcareTopics.includes(topic);
                return (
                  <Pressable
                    key={topic}
                    style={[
                      styles.optionChip,
                      styles.childcareChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    onPress={() => handleToggleChildcareTopic(topic)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        isSelected && styles.optionChipTextSelected,
                      ]}
                    >
                      {topic}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.helperText}>
              気になる項目を選択してください。複数選択できます。
            </Text>
          </View>
        ) : null}

        {shouldShowFocusInput && !shouldRenderFocusInAccordion
          ? renderFocusInputSection(false)
          : null}

        {!isIndustryInAccordion ? renderIndustrySection(false) : null}

        <View style={[styles.formGroup, styles.accordionContainer]}>
          <Pressable style={styles.accordionHeader} onPress={toggleAdvanced}>
            <Text style={styles.accordionTitle}>詳細設定（任意）</Text>
            <Text style={styles.accordionIcon}>{isAdvancedOpen ? '−' : '+'}</Text>
          </Pressable>
          {isAdvancedOpen ? (
            <View style={styles.accordionBody}>
              {shouldShowFocusInput && shouldRenderFocusInAccordion
                ? renderFocusInputSection(true)
                : null}
              {renderTasksSection()}
              {isIndustryInAccordion ? renderIndustrySection(true) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionLabel}>AIへの補足情報（任意・URLも可）</Text>
          <TextInput
            ref={additionalInfoRef}
            style={[styles.input, styles.multiline]}
            placeholder="参考URLや補足情報があれば入力してください。URLは複数貼ってOK。個人情報は書かないでください。"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            onFocus={() => scrollToInput(additionalInfoRef)}
            multiline
          />
        </View>

        <Pressable style={[styles.primaryButton, styles.marginTopSmall]} onPress={handleGenerate}>
          <Text style={styles.primaryButtonText}>ロールプロンプトを生成する</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
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
  childcareChip: {
    flexBasis: '45%',
  },
  accordionContainer: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#eff6ff',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  accordionIcon: {
    fontSize: 18,
    color: '#1d4ed8',
    fontWeight: '700',
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  accordionSection: {
    marginTop: 0,
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
