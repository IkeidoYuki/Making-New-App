import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppStateContext';
import { openInChatGPTWithChoice } from '../features/openInChatGPT';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptResult'>;

const PromptResultScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, questionDraft } = useAppState();
  const [isPromptExpanded, setIsPromptExpanded] = React.useState(false);

  const togglePromptExpanded = React.useCallback(() => {
    setIsPromptExpanded((prev) => !prev);
  }, []);

  const handleCopyPrompt = React.useCallback(async () => {
    if (!promptResult) {
      return;
    }
    try {
      await Clipboard.setStringAsync(promptResult.rolePrompt);
      Alert.alert('コピーしました', 'ロールプロンプトをクリップボードにコピーしました。');
    } catch (error) {
      Alert.alert(
        'クリップボードにコピーできませんでした',
        'お手数ですが手動でコピーして貼り付けてください。',
      );
    }
  }, [promptResult]);

  const handleOpenChatGPT = React.useCallback(async () => {
    if (!promptResult) {
      Alert.alert(
        'ロールプロンプトを作成してください',
        'ヒアリングシートに戻って必要な情報を入力しましょう。',
      );
      return;
    }
    const question = questionDraft.trim();
    const payload =
      question.length > 0
        ? `${promptResult.rolePrompt}\n\n---\n\n# 質問文\n${question}`
        : promptResult.rolePrompt;

    try {
      await Clipboard.setStringAsync(payload);
    } catch (error) {
      Alert.alert(
        'クリップボードにコピーできませんでした',
        'お手数ですが手動でコピーして貼り付けてください。',
      );
      return;
    }

    await openInChatGPTWithChoice({
      query: payload,
      title: 'ChatGPTの開き方を選択',
    });
  }, [promptResult, questionDraft]);

  const handleEditPrompt = React.useCallback(() => {
    navigation.navigate('PromptBuilder');
  }, [navigation]);

  const handleBackToMain = React.useCallback(() => {
    navigation.navigate('Main');
  }, [navigation]);

  if (!promptResult) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.emptyContainer}>
        <Text style={styles.emptyMessage}>
          まだロールプロンプトが作成されていません。ヒアリングシートで情報を入力してロールプロンプトを作成してください。
        </Text>
        <Pressable style={styles.primaryButton} onPress={handleEditPrompt}>
          <Text style={styles.primaryButtonText}>ヒアリングシートへ移動</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>ロールプロンプトが作成されました</Text>
        <Text style={styles.bannerSubtitle}>ChatGPTに送る前に内容を確認しましょう。</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>生成したロールプロンプト</Text>
        <Text style={styles.summary}>{promptResult.summary}</Text>

        <View style={styles.buttonGroup}>
          <Pressable style={[styles.primaryButton, styles.buttonSpacing]} onPress={handleCopyPrompt}>
            <Text style={styles.primaryButtonText}>コピー</Text>
          </Pressable>
          <Pressable style={[styles.primaryButton, styles.buttonSpacing]} onPress={handleOpenChatGPT}>
            <Text style={styles.primaryButtonText}>ChatGPTで開く</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={handleEditPrompt}>
            <Text style={styles.outlineButtonText}>ロールを修正する</Text>
          </Pressable>
        </View>

        <Pressable style={styles.accordionHeader} onPress={togglePromptExpanded}>
          <Text style={styles.accordionTitle}>
            {isPromptExpanded ? 'ロールを隠す' : 'ロールを表示'}
          </Text>
          <Text style={styles.accordionIcon}>{isPromptExpanded ? '−' : '+'}</Text>
        </Pressable>
        {isPromptExpanded ? (
          <View style={styles.accordionBody}>
            <Text style={styles.promptText}>{promptResult.rolePrompt}</Text>
          </View>
        ) : (
          <Text style={styles.accordionHint}>
            ボタンを押すとロールプロンプトの全文を確認できます。
          </Text>
        )}

        {questionDraft.trim().length > 0 ? (
          <View style={styles.questionSection}>
            <Text style={styles.sectionLabel}>質問文の下書き</Text>
            <Text style={styles.questionText}>{questionDraft}</Text>
          </View>
        ) : (
          <Text style={styles.questionPlaceholder}>
            ChatGPTに送る予定の質問文があれば、この画面に戻る前にホーム画面で下書きを追加できます。
          </Text>
        )}
      </View>

      <Pressable style={styles.secondaryButton} onPress={handleBackToMain}>
        <Text style={styles.secondaryButtonText}>メイン画面に戻る</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  emptyContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  banner: {
    backgroundColor: '#1e1b4b',
    borderRadius: 18,
    padding: 20,
  },
  bannerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: '#c7d2fe',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#312e81',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e1b4b',
  },
  summary: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#4338ca',
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonSpacing: {
    marginBottom: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#a855f7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#faf5ff',
  },
  outlineButtonText: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 15,
  },
  accordionHeader: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#312e81',
  },
  accordionIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#312e81',
  },
  accordionBody: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    padding: 16,
  },
  promptText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#111827',
  },
  accordionHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#6b7280',
  },
  questionSection: {
    marginTop: 28,
    padding: 16,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#312e81',
  },
  questionText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#1f2937',
  },
  questionPlaceholder: {
    marginTop: 28,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4338ca',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a855f7',
    backgroundColor: '#ede9fe',
  },
  secondaryButtonText: {
    color: '#4c1d95',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default PromptResultScreen;
