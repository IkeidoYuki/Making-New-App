import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  const [expandedEntryId, setExpandedEntryId] = React.useState<string | null>(
    null,
  );
  const [favoriteDialog, setFavoriteDialog] = React.useState<
    { id: string; summary: string } | null
  >(null);
  const [favoriteName, setFavoriteName] = React.useState('');

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

  const handleOpenChatGPT = React.useCallback(async (prompt: string) => {
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
  }, []);

  const toggleExpanded = React.useCallback((entryId: string) => {
    setExpandedEntryId((prev) => (prev === entryId ? null : entryId));
  }, []);

  const openFavoriteDialog = React.useCallback(
    (entryId: string, summary: string) => {
      setFavoriteDialog({ id: entryId, summary });
      setFavoriteName(summary);
    },
    [],
  );

  const closeFavoriteDialog = React.useCallback(() => {
    setFavoriteDialog(null);
    setFavoriteName('');
  }, []);

  const handleAddFavorite = React.useCallback(() => {
    if (!favoriteDialog) {
      return;
    }
    const entry = history.find((item) => item.id === favoriteDialog.id);
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
    closeFavoriteDialog();
  }, [addFavorite, closeFavoriteDialog, favoriteDialog, favoriteName, history]);

  return (
    <>
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
                  <Pressable
                    style={[styles.actionButton, styles.favoriteActionButton]}
                    onPress={() => openFavoriteDialog(entry.id, entry.result.summary)}
                  >
                    <Text style={styles.favoriteActionText}>お気に入り</Text>
                  </Pressable>
                </View>
                {isExpanded ? (
                  <View style={styles.promptPreviewContainer}>
                    <Text style={styles.promptPreview}>{prompt}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <FavoriteNameModal
        visible={!!favoriteDialog}
        value={favoriteName}
        onChange={setFavoriteName}
        onCancel={closeFavoriteDialog}
        onSubmit={handleAddFavorite}
      />
    </>
  );
};

const FavoriteNameModal: React.FC<{
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}> = ({ visible, value, onChange, onCancel, onSubmit }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
    <KeyboardAvoidingView
      style={styles.modalOverlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
    >
      <Pressable style={styles.modalBackdrop} onPress={onCancel} />
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>お気に入り名を入力</Text>
        <TextInput
          style={styles.modalInput}
          value={value}
          onChangeText={onChange}
          placeholder="例: 画像編集サポート"
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
        <View style={styles.modalButtonRow}>
          <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={onCancel}>
            <Text style={styles.modalCancelText}>キャンセル</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.modalPrimaryButton]} onPress={onSubmit}>
            <Text style={styles.modalPrimaryText}>登録する</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

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
    color: '#ecfdf5',
    fontWeight: '600',
  },
  ghostActionButton: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#ffffff',
  },
  ghostActionText: {
    color: '#475569',
    fontWeight: '600',
  },
  favoriteActionButton: {
    backgroundColor: '#f59e0b',
  },
  favoriteActionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  promptPreviewContainer: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  promptPreview: {
    fontSize: 13,
    lineHeight: 20,
    color: '#1f2937',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalInput: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
    width: '100%',
  },
  modalButtonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalCancelButton: {
    backgroundColor: '#e2e8f0',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalPrimaryButton: {
    backgroundColor: '#2563eb',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default HistoryScreen;
