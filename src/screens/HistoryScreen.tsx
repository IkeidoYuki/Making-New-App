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
import * as Clipboard from 'expo-clipboard';
import { useAppState } from '../context/AppStateContext';
import { launchChatGPTWithPrompt } from '../utils/chat';

const PLACEHOLDER_COLOR = '#334155';

const formatTimestamp = (value: number) => {
  const date = new Date(value);
  const pad = (input: number) => input.toString().padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const HistoryScreen: React.FC = () => {
  const { history, addFavorite } = useAppState();
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string | null>(
    null,
  );
  const [favoriteName, setFavoriteName] = React.useState('');
  const [expandedEntryId, setExpandedEntryId] = React.useState<string | null>(
    null,
  );

  const handleToggleFavoriteForm = React.useCallback(
    (entryId: string, defaultName: string) => {
      if (selectedHistoryId === entryId) {
        setSelectedHistoryId(null);
        setFavoriteName('');
      } else {
        setSelectedHistoryId(entryId);
        setFavoriteName(defaultName);
      }
    },
    [selectedHistoryId],
  );

  const handleAddFavorite = React.useCallback(() => {
    if (!selectedHistoryId) {
      return;
    }
    const entry = history.find((item) => item.id === selectedHistoryId);
    if (!entry) {
      return;
    }
    const trimmed = favoriteName.trim();
    if (!trimmed) {
      Alert.alert('お気に入り名を入力してください');
      return;
    }
    addFavorite(trimmed, entry.result);
    Alert.alert('お気に入りに登録しました');
    setSelectedHistoryId(null);
    setFavoriteName('');
  }, [addFavorite, favoriteName, history, selectedHistoryId]);

  const handleCopyPrompt = React.useCallback(async (prompt: string) => {
    try {
      await Clipboard.setStringAsync(prompt);
      Alert.alert('コピーしました', 'ロールプロンプトをクリップボードにコピーしました。');
    } catch (error) {
      Alert.alert(
        'クリップボードにコピーできませんでした',
        'お手数ですが手動でコピーして貼り付けてください。',
      );
    }
  }, []);

  const handleOpenChatGPT = React.useCallback(
    async (prompt: string) => {
      try {
        await Clipboard.setStringAsync(prompt);
      } catch (error) {
        Alert.alert(
          'クリップボードにコピーできませんでした',
          'お手数ですが手動でコピーして貼り付けてください。',
        );
        return;
      }
      await launchChatGPTWithPrompt(prompt);
    },
    [],
  );

  const toggleExpanded = React.useCallback((entryId: string) => {
    setExpandedEntryId((prev) => (prev === entryId ? null : entryId));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>生成履歴</Text>
      <Text style={styles.description}>
        最新の生成結果から自動的に保存された履歴です。お気に入り登録やコピー、ChatGPTの起動が行えます。
      </Text>

      {history.length === 0 ? (
        <Text style={[styles.placeholder, styles.sectionSpacing]}>
          まだロールプロンプトの履歴がありません。ヒアリングシートでロールプロンプトを作成するとここに表示されます。
        </Text>
      ) : (
        history.map((entry) => {
          const isSelected = selectedHistoryId === entry.id;
          const isExpanded = expandedEntryId === entry.id;
          const prompt = entry.result.rolePrompt;
          return (
            <View key={entry.id} style={[styles.historyCard, styles.sectionSpacing]}>
              <View style={styles.historyHeader}>
                <Text style={styles.historySummary}>{entry.result.summary}</Text>
                <Text style={styles.historyTimestamp}>
                  生成日時: {formatTimestamp(entry.createdAt)}
                </Text>
              </View>
              <View style={styles.historyActions}>
                <Pressable
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={() => handleCopyPrompt(prompt)}
                >
                  <Text style={styles.primaryActionText}>コピー</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.secondaryActionButton]}
                  onPress={() => handleOpenChatGPT(prompt)}
                >
                  <Text style={styles.secondaryActionText}>ChatGPTで開く</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.ghostActionButton]}
                  onPress={() => toggleExpanded(entry.id)}
                >
                  <Text style={styles.ghostActionText}>
                    {isExpanded ? 'ロールを隠す' : 'ロールを表示'}
                  </Text>
                </Pressable>
              </View>
              {isExpanded ? (
                <View style={styles.promptPreviewContainer}>
                  <Text style={styles.promptPreview}>{prompt}</Text>
                </View>
              ) : null}
              <View style={styles.favoriteBlock}>
                <Pressable
                  onPress={() => handleToggleFavoriteForm(entry.id, entry.result.summary)}
                >
                  <Text style={styles.favoriteToggleText}>
                    {isSelected ? 'お気に入り登録フォームを閉じる' : 'お気に入り登録フォームを開く'}
                  </Text>
                </Pressable>
                {isSelected ? (
                  <View style={styles.favoriteForm}>
                    <Text style={styles.inputLabel}>お気に入り名</Text>
                    <TextInput
                      style={styles.input}
                      value={favoriteName}
                      onChangeText={setFavoriteName}
                      placeholder="例: 花の観察ヒアリング"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                    />
                    <Pressable style={styles.addButton} onPress={handleAddFavorite}>
                      <Text style={styles.addButtonText}>お気に入りに登録する</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })
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
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  sectionSpacing: {
    marginTop: 20,
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  historyHeader: {
    gap: 8,
  },
  historySummary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  historyActions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  primaryActionButton: {
    backgroundColor: '#2563eb',
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryActionButton: {
    backgroundColor: '#0f766e',
  },
  secondaryActionText: {
    color: '#f0fdfa',
    fontWeight: '600',
  },
  ghostActionButton: {
    backgroundColor: '#f1f5f9',
  },
  ghostActionText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  promptPreviewContainer: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  promptPreview: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
  },
  favoriteBlock: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  favoriteToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  favoriteForm: {
    marginTop: 16,
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HistoryScreen;
