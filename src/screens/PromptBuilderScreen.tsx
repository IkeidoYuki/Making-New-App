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

const PromptBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, setPromptResult } = useAppState();

  const [topic, setTopic] = React.useState('');
  const [background, setBackground] = React.useState('');
  const [desiredOutcome, setDesiredOutcome] = React.useState('');
  const [answerStyle, setAnswerStyle] = React.useState('');
  const [constraints, setConstraints] = React.useState('');
  const [followUpPreference, setFollowUpPreference] = React.useState('');

  React.useEffect(() => {
    if (promptResult) {
      setTopic(promptResult.input.topic);
      setBackground(promptResult.input.background);
      setDesiredOutcome(promptResult.input.desiredOutcome);
      setAnswerStyle(promptResult.input.answerStyle);
      setConstraints(promptResult.input.constraints);
      setFollowUpPreference(promptResult.input.followUpPreference);
    }
  }, [promptResult]);

  const handleGenerate = React.useCallback(() => {
    if (!topic || !desiredOutcome) {
      Alert.alert('テーマと期待する成果を入力してください');
      return;
    }

    const input: PromptBuilderInput = {
      topic,
      background,
      desiredOutcome,
      answerStyle,
      constraints,
      followUpPreference,
    };

    const result = buildPrompt(input);
    setPromptResult(result);
    Alert.alert('ロールプロンプトを作成しました', 'メイン画面で内容を確認できます。');
  }, [
    topic,
    desiredOutcome,
    background,
    answerStyle,
    constraints,
    followUpPreference,
    setPromptResult,
  ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>質問内容のヒアリング</Text>
      <Text style={[styles.description, styles.marginTopSmall]}>
        以下の項目を入力すると、AIに与えるロール指示と質問テンプレートを生成します。
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>テーマ・領域</Text>
        <TextInput
          style={styles.input}
          placeholder="例：プロダクトマーケティング、バックエンド開発など"
          value={topic}
          onChangeText={setTopic}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>背景情報</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="現状や前提条件を書いてください"
          value={background}
          onChangeText={setBackground}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>期待する成果・ゴール</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="得たいアウトプットや判断基準を記載"
          value={desiredOutcome}
          onChangeText={setDesiredOutcome}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>回答のトーン・形式</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="例：箇条書きで、専門用語は説明しながら、など"
          value={answerStyle}
          onChangeText={setAnswerStyle}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>制約条件</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="避けたい内容や守るべきルールがあれば記載"
          value={constraints}
          onChangeText={setConstraints}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>深掘りしてほしい観点</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="質問後に追加で確認したいポイント"
          value={followUpPreference}
          onChangeText={setFollowUpPreference}
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
