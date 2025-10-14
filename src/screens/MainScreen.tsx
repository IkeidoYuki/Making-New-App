import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppStateContext';
import { openInChatGPTWithChoice } from '../features/openInChatGPT';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, questionDraft, hasNewPrompt, acknowledgePrompt } =
    useAppState();

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

    const question = questionDraft.trim();
    const clipboardPayload =
      question.length > 0
        ? `${promptResult.rolePrompt}\n\n---\n\n# 質問文\n${question}`
        : promptResult.rolePrompt;

    try {
      await Clipboard.setStringAsync(clipboardPayload);
    } catch (error) {
      Alert.alert(
        'クリップボードにコピーできませんでした',
        'お手数ですが手動でコピーして貼り付けてください。',
      );
      return;
    }

    const launched = await openInChatGPTWithChoice({
      query: clipboardPayload,
      title: 'ChatGPTの開き方を選択',
    });
    if (launched) {
      acknowledgePrompt();
    }
  }, [acknowledgePrompt, promptResult, questionDraft]);

  const handleCopyLatestPrompt = React.useCallback(async () => {
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

  const dismissBanner = React.useCallback(() => {
    acknowledgePrompt();
  }, [acknowledgePrompt]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>AIプロンプト生成サポート</Text>
      {hasNewPrompt && promptResult ? (
        <View style={[styles.successBanner, styles.sectionSpacing]}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerTextGroup}>
              <Text style={styles.bannerTitle}>ロールプロンプトを作成しました</Text>
              <Text style={styles.bannerSubtitle}>
                コピーしてChatGPTに貼り付けてください
              </Text>
            </View>
            <Pressable style={styles.bannerCopyButton} onPress={handleCopyLatestPrompt}>
              <Text style={styles.bannerCopyText}>コピー</Text>
            </Pressable>
          </View>
          <Pressable style={styles.bannerOpenButton} onPress={openChatGPT}>
            <Text style={styles.bannerOpenText}>ChatGPTで開く</Text>
          </Pressable>
          <Pressable style={styles.bannerCloseButton} onPress={dismissBanner}>
            <Text style={styles.bannerCloseText}>閉じる</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={[styles.description, styles.sectionSpacing]}>
        用途に合わせてロールプロンプトを自動生成します。ヒアリングシートに入力して、すぐに使える指示文を作成しましょう。
      </Text>

      <View style={[styles.buttonGroup, styles.sectionSpacing]}>
        <Pressable style={styles.primaryButton} onPress={openPromptBuilder}>
          <Text style={styles.primaryButtonText}>ヒアリングシートを記入する</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.secondaryButtonText}>使い方ヘルプ</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.secondaryButtonText}>履歴</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.secondaryButtonText}>お気に入り</Text>
        </Pressable>
      </View>

      {promptResult ? (
        <View style={[styles.card, styles.sectionSpacingLarge]}>
          <Text style={styles.cardTitle}>最新のロールプロンプト</Text>
          <Text style={styles.cardSummary}>{promptResult.summary}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardLabel}>ロール指示</Text>
            <Text style={styles.promptText}>{promptResult.rolePrompt}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.placeholderCard, styles.sectionSpacingLarge]}>
          <Text style={styles.placeholderText}>
            まだロールプロンプトが作成されていません。ヒアリングシートで質問の背景をまとめましょう。
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, styles.sectionSpacingLarge]}
        onPress={openChatGPT}
      >
        <Text style={styles.primaryButtonText}>ChatGPTを開く</Text>
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
  buttonGroup: {},
  successBanner: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#0f766e',
    marginTop: 4,
  },
  bannerCopyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#059669',
  },
  bannerCopyText: {
    color: '#ecfdf5',
    fontWeight: '600',
  },
  bannerOpenButton: {
    marginTop: 16,
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bannerOpenText: {
    color: '#f0fdfa',
    fontWeight: '600',
    fontSize: 15,
  },
  bannerCloseButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bannerCloseText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '600',
  },
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
    marginTop: 8,
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
});

export default MainScreen;
