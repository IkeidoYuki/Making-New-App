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
import { buildPrompt, PromptBuilderInput } from '../utils/prompt';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptBuilder'>;

const DOMAIN_OPTIONS = ['料理', 'クラウド', '建築', 'マーケティング', '教育', '医療', 'その他'];

const PromptBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, setPromptResult } = useAppState();

  const [domainCategory, setDomainCategory] = React.useState('');
  const [domainDetail, setDomainDetail] = React.useState('');
  const [roleTitle, setRoleTitle] = React.useState('');
  const [roleDescription, setRoleDescription] = React.useState('');
  const [background, setBackground] = React.useState('');
  const [tasks, setTasks] = React.useState('');
  const [skills, setSkills] = React.useState('');
  const [outputRequirements, setOutputRequirements] = React.useState('');
  const [reviewGuidelines, setReviewGuidelines] = React.useState('');
  const [request, setRequest] = React.useState('');

  React.useEffect(() => {
    if (promptResult) {
      setDomainCategory(promptResult.input.domainCategory);
      setDomainDetail(promptResult.input.domainDetail);
      setRoleTitle(promptResult.input.roleTitle);
      setRoleDescription(promptResult.input.roleDescription);
      setBackground(promptResult.input.background);
      setTasks(promptResult.input.tasks);
      setSkills(promptResult.input.skills);
      setOutputRequirements(promptResult.input.outputRequirements);
      setReviewGuidelines(promptResult.input.reviewGuidelines);
      setRequest(promptResult.input.request);
    }
  }, [promptResult]);

  const handleSelectDomain = React.useCallback((option: string) => {
    setDomainCategory(option);
    if (option !== 'その他') {
      setDomainDetail('');
    }
  }, []);

  const handleGenerate = React.useCallback(() => {
    if (!domainCategory) {
      Alert.alert('テーマ・領域を選択してください');
      return;
    }

    if (domainCategory === 'その他' && !domainDetail.trim()) {
      Alert.alert('その他を選択した場合、具体的な領域を記入してください');
      return;
    }

    if (!roleTitle.trim()) {
      Alert.alert('ロールの肩書きを入力してください');
      return;
    }

    if (!request.trim()) {
      Alert.alert('依頼事項を入力してください');
      return;
    }

    const input: PromptBuilderInput = {
      domainCategory,
      domainDetail,
      roleTitle,
      roleDescription,
      background,
      tasks,
      skills,
      outputRequirements,
      reviewGuidelines,
      request,
    };

    const result = buildPrompt(input);
    setPromptResult(result);
    navigation.navigate('Main');
  }, [
    domainCategory,
    domainDetail,
    roleTitle,
    roleDescription,
    background,
    tasks,
    skills,
    outputRequirements,
    reviewGuidelines,
    request,
    setPromptResult,
    navigation,
  ]);

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

      <View style={styles.formGroup}>
        <Text style={styles.label}>ロールの肩書き</Text>
        <TextInput
          style={styles.input}
          placeholder="例：Pythonによる業務自動化をリードするスペシャリスト"
          value={roleTitle}
          onChangeText={setRoleTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>ロールの説明</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="ロールが果たす役割やスタンスを記載してください"
          value={roleDescription}
          onChangeText={setRoleDescription}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>プロジェクト背景・前提</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="現状や前提条件を書いてください"
          value={background}
          onChangeText={setBackground}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>主な実施タスク（1行につき1項目）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="例：現状把握と課題整理を行う\n例：改善施策を複数案提示する"
          value={tasks}
          onChangeText={setTasks}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>必須スキルセット（1行につき1項目）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="例：Pythonの専門知識\n例：リーダブルコードのベストプラクティス"
          value={skills}
          onChangeText={setSkills}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>出力条件（1行につき1項目）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="例：日本語で丁寧に説明する\n例：不足情報があればヒアリングする"
          value={outputRequirements}
          onChangeText={setOutputRequirements}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>レビュー指針（1行につき1項目）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="例：エラーハンドリングを確認する\n例：論理の抜け漏れをチェックする"
          value={reviewGuidelines}
          onChangeText={setReviewGuidelines}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>依頼事項</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="AIに依頼したい内容や要望を記載してください"
          value={request}
          onChangeText={setRequest}
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
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#ffffff',
  },
  optionChipSelected: {
    backgroundColor: '#2563eb11',
    borderColor: '#2563eb',
  },
  optionChipText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
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
