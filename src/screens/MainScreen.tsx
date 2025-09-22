import React from 'react';
import {
  Alert,
  Linking,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, questionDraft, updateQuestionDraft } = useAppState();

  const openPromptBuilder = React.useCallback(() => {
    navigation.navigate('PromptBuilder');
  }, [navigation]);

  const openChatGPT = React.useCallback(async () => {
    if (!promptResult) {
      Alert.alert(
        'ロールプロンプトを作成してください',
        '「ヒアリングシート」に進んで質問内容を整理しましょう。',
      );
      return;
    }

    const url = 'https://chat.openai.com/';
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        'ChatGPTを開けません',
        'ブラウザで https://chat.openai.com/ にアクセスしてください。',
      );
      return;
    }
    await Linking.openURL(url);
  }, [promptResult]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AIロールプロンプト生成アシスタント</Text>
      <Text style={[styles.description, styles.sectionSpacing]}>
        ききたい内容を整理し、AIに渡すロールプロンプトを自動生成します。
        ChatGPTに投げる前に質問の背景・ゴールを明確にしましょう。
      </Text>

      <View style={[styles.buttonGroup, styles.sectionSpacing]}>
        <Pressable style={styles.primaryButton} onPress={openPromptBuilder}>
          <Text style={styles.primaryButtonText}>ヒアリングシートを記入する</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Account')}
        >
          <Text style={styles.secondaryButtonText}>ChatGPTアカウント情報</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.secondaryButtonText}>使い方ヘルプ</Text>
        </Pressable>
      </View>

      {promptResult ? (
        <View style={[styles.card, styles.sectionSpacingLarge]}>
          <Text style={styles.cardTitle}>最新のロールプロンプト</Text>
          <Text style={styles.cardSummary}>{promptResult.summary}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardLabel}>ロール指示</Text>
            <Text style={styles.promptText}>{promptResult.rolePrompt}</Text>
            <Text style={[styles.cardLabel, styles.marginTop]}>確認したい観点</Text>
            {promptResult.followUpQuestions.map((question, index) => (
              <Text key={index} style={styles.followUpText}>
                ・{question}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.placeholderCard, styles.sectionSpacingLarge]}>
          <Text style={styles.placeholderText}>
            まだロールプロンプトが作成されていません。ヒアリングシートで質問の背景をまとめましょう。
          </Text>
        </View>
      )}

      <View style={[styles.questionSection, styles.sectionSpacingLarge]}>
        <Text style={styles.sectionTitle}>ChatGPTに送信する質問内容</Text>
        <TextInput
          style={[styles.input, styles.sectionSpacingSmall]}
          placeholder="最終的にChatGPTへ入力したい質問を記載してください"
          multiline
          value={questionDraft}
          onChangeText={updateQuestionDraft}
        />
        <Text style={styles.helperText}>
          上記のロールプロンプトと質問文をコピーし、ChatGPTに貼り付けて利用します。
        </Text>
        <Pressable
          style={[styles.primaryButton, styles.sectionSpacingSmall]}
          onPress={openChatGPT}
        >
          <Text style={styles.primaryButtonText}>ChatGPTを開く</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  sectionSpacing: {
    marginTop: 16,
  },
  sectionSpacingLarge: {
    marginTop: 24,
  },
  sectionSpacingSmall: {
    marginTop: 12,
  },
  buttonGroup: {},
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSummary: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
  },
  cardBody: {
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  promptText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  marginTop: {
    marginTop: 14,
  },
  followUpText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
  },
  placeholderCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 18,
  },
  placeholderText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  questionSection: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    color: '#0f172a',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default MainScreen;
