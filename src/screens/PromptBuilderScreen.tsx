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
  'IT',
  '製造',
  '金融',
  '小売',
  '医療',
  '教育',
  '建設',
  '物流',
  '公共',
  'エネルギー',
  '飲食',
  '旅行',
  'メディア',
  'プロサービス',
  'その他',
];

const PromptBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, setPromptResult } = useAppState();

  const [domainCategory, setDomainCategory] = React.useState('');
  const [domainDetail, setDomainDetail] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [focusTopics, setFocusTopics] = React.useState('');
  const [tasks, setTasks] = React.useState('');
  const [didEditTasks, setDidEditTasks] = React.useState(false);
  const [additionalInfo, setAdditionalInfo] = React.useState('');

  React.useEffect(() => {
    if (promptResult) {
      setDomainCategory(promptResult.input.domainCategory);
      setDomainDetail(promptResult.input.domainDetail);
      setIndustry(promptResult.input.industry);
      setFocusTopics(promptResult.input.focusTopics ?? '');
      const savedTasks = promptResult.input.tasks ?? '';
      setTasks(savedTasks);
      setDidEditTasks(savedTasks.trim().length > 0);
      setAdditionalInfo(promptResult.input.additionalInfo);
    }
  }, [promptResult]);

  const handleSelectDomain = React.useCallback((option: string) => {
    setDomainCategory(option);
    if (option !== 'その他') {
      setDomainDetail('');
    }
    setFocusTopics('');
    setDidEditTasks(false);
  }, []);

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
        domainDetail,
        industry,
      );
      setTasks(autoTasks);
    }
  }, [domainCategory, domainDetail, industry, didEditTasks]);

  const handleGenerate = React.useCallback(() => {
    if (!domainCategory) {
      Alert.alert('テーマ・領域を選択してください');
      return;
    }

    if (domainCategory === 'その他' && !domainDetail.trim()) {
      Alert.alert('その他を選択した場合、具体的な領域を記入してください');
      return;
    }

    const input: PromptBuilderInput = {
      domainCategory,
      domainDetail,
      industry,
      focusTopics,
      tasks,
      additionalInfo,
    };

    const result = buildPrompt(input);
    setPromptResult(result);
    navigation.navigate('Main');
  }, [
    domainCategory,
    domainDetail,
    industry,
    additionalInfo,
    setPromptResult,
    navigation,
  ]);

  const domainTemplate = getDomainTemplate(domainCategory);
  const focusPlaceholder = domainCategory
    ? domainTemplate.focusPlaceholder
    : 'テーマを選択すると入力例が表示されます';

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        {domainCategory === 'その他' && (
          <TextInput
            style={[styles.input, styles.marginTopSmall]}
            placeholder="想定している領域を詳しく記入してください"
            value={domainDetail}
            onChangeText={setDomainDetail}
          />
        )}
      </View>

      {domainCategory ? (
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

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>想定している業界（任意）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="業界が決まっていれば入力してください"
          value={industry}
          onChangeText={setIndustry}
          multiline
        />
      </View>

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

      {promptResult && (
        <View style={[styles.previewCard, styles.marginTopLarge]}>
          <Text style={styles.previewTitle}>生成済みのロールプロンプト</Text>
          <Text style={styles.previewSummary}>{promptResult.summary}</Text>
          <Text style={styles.previewBody}>{promptResult.rolePrompt}</Text>
          <Pressable
            style={[styles.secondaryButton, styles.marginTopSmall]}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.secondaryButtonText}>メイン画面で確認する</Text>
          </Pressable>
        </View>
      )}
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
  marginTopLarge: {
    marginTop: 24,
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
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  previewSummary: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#2563eb11',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PromptBuilderScreen;
