import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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

const formatTimestamp = (value: number) => {
  const date = new Date(value);
  const pad = (input: number) => input.toString().padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const FavoritesScreen: React.FC = () => {
  const {
    favorites,
    history,
    addFavorite,
    updateFavoritePrompt,
    removeFavorite,
  } = useAppState();
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string | null>(
    null,
  );
  const [favoriteName, setFavoriteName] = React.useState('');
  const [optionsFavoriteId, setOptionsFavoriteId] = React.useState<string | null>(
    null,
  );
  const [editingFavoriteId, setEditingFavoriteId] = React.useState<string | null>(
    null,
  );
  const [editedPrompt, setEditedPrompt] = React.useState('');

  const handleSelectHistory = React.useCallback(
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
    setSelectedHistoryId(null);
    setFavoriteName('');
    Alert.alert('お気に入りに登録しました');
  }, [addFavorite, favoriteName, history, selectedHistoryId]);

  const closeOptions = React.useCallback(() => {
    setOptionsFavoriteId(null);
  }, []);

  const openOptions = React.useCallback((favoriteId: string) => {
    setOptionsFavoriteId(favoriteId);
  }, []);

  const activeFavorite = React.useMemo(
    () => favorites.find((item) => item.id === optionsFavoriteId) || null,
    [favorites, optionsFavoriteId],
  );

  const editingFavorite = React.useMemo(
    () => favorites.find((item) => item.id === editingFavoriteId) || null,
    [favorites, editingFavoriteId],
  );

  const handleUseInChatGPT = React.useCallback(async () => {
    if (!activeFavorite) {
      return;
    }
    const prompt = activeFavorite.result.rolePrompt;
    try {
      await Clipboard.setStringAsync(prompt);
    } catch (error) {
      Alert.alert(
        'クリップボードにコピーできませんでした',
        'お手数ですが手動でコピーして貼り付けてください。',
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
    closeOptions();
  }, [activeFavorite, closeOptions]);

  const handleShowTemplate = React.useCallback(() => {
    if (!activeFavorite) {
      return;
    }
    setEditedPrompt(activeFavorite.result.rolePrompt);
    setEditingFavoriteId(activeFavorite.id);
    closeOptions();
  }, [activeFavorite, closeOptions]);

  const handleDeleteFavorite = React.useCallback(() => {
    if (!activeFavorite) {
      return;
    }
    Alert.alert('お気に入りを削除しますか？', 'この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          removeFavorite(activeFavorite.id);
          closeOptions();
        },
      },
    ]);
  }, [activeFavorite, closeOptions, removeFavorite]);

  const closeTemplateModal = React.useCallback(() => {
    setEditingFavoriteId(null);
    setEditedPrompt('');
  }, []);

  const handleSaveTemplate = React.useCallback(() => {
    if (!editingFavoriteId) {
      return;
    }
    const trimmed = editedPrompt.trim();
    if (!trimmed) {
      Alert.alert('ロールテンプレートを入力してください');
      return;
    }
    updateFavoritePrompt(editingFavoriteId, trimmed);
    Alert.alert('保存しました');
    closeTemplateModal();
  }, [closeTemplateModal, editedPrompt, editingFavoriteId, updateFavoritePrompt]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>お気に入りのロールテンプレート</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>登録済みのお気に入り</Text>
          {favorites.length === 0 ? (
            <Text style={styles.placeholder}>
              まだお気に入りが登録されていません。ヒアリングシートで生成したロールプロンプトを履歴から選んで登録できます。
            </Text>
          ) : (
            favorites.map((favorite) => (
              <Pressable
                key={favorite.id}
                style={styles.favoriteCard}
                onPress={() => openOptions(favorite.id)}
              >
                <Text style={styles.favoriteName}>{favorite.name}</Text>
                <Text style={styles.favoriteSummary}>{favorite.result.summary}</Text>
                <Text style={styles.favoriteTimestamp}>
                  登録日: {formatTimestamp(favorite.addedAt)}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>過去5回分の生成履歴</Text>
          <Text style={styles.historyListDescription}>
            お気に入りに登録したい履歴を選び、名前を入力して「お気に入りに登録する」を押してください。
          </Text>
          {history.length === 0 ? (
            <Text style={styles.placeholder}>
              まだロールプロンプトの生成履歴がありません。ヒアリングシートからロールプロンプトを作成すると表示されます。
            </Text>
          ) : (
            history.map((entry) => {
              const isSelected = entry.id === selectedHistoryId;
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.historyCard,
                    isSelected && styles.historyCardSelected,
                  ]}
                >
                  <Pressable
                    onPress={() => handleSelectHistory(entry.id, entry.result.summary)}
                  >
                    <Text style={styles.historySummary}>{entry.result.summary}</Text>
                    <Text style={styles.historyTimestamp}>
                      生成日時: {formatTimestamp(entry.createdAt)}
                    </Text>
                  </Pressable>
                  {isSelected ? (
                    <View style={styles.favoriteForm}>
                      <Text style={styles.inputLabel}>お気に入り名</Text>
                      <TextInput
                        style={styles.input}
                        value={favoriteName}
                        onChangeText={setFavoriteName}
                        placeholder="登録したい名前を入力してください"
                      />
                      <Pressable
                        style={styles.addButton}
                        onPress={handleAddFavorite}
                      >
                        <Text style={styles.addButtonText}>お気に入りに登録する</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={!!activeFavorite}
        onRequestClose={closeOptions}
      >
        <View style={styles.modalOverlay}>
          <ModalBackdrop onPress={closeOptions} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {activeFavorite ? `${activeFavorite.name}の操作` : ''}
            </Text>
            <Pressable
              style={[styles.modalActionButton, styles.modalPrimaryButton]}
              onPress={handleUseInChatGPT}
            >
              <Text style={styles.modalPrimaryText}>ChatGPTで使う</Text>
            </Pressable>
            <Pressable
              style={[styles.modalActionButton, styles.modalSecondaryButton]}
              onPress={handleShowTemplate}
            >
              <Text style={styles.modalSecondaryText}>ロールテンプレートを表示</Text>
            </Pressable>
            <Pressable
              style={[styles.modalActionButton, styles.modalDestructiveButton]}
              onPress={handleDeleteFavorite}
            >
              <Text style={styles.modalDestructiveText}>削除</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={!!editingFavorite}
        onRequestClose={closeTemplateModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <ModalBackdrop onPress={closeTemplateModal} />
          <View style={styles.templateModalCard}>
            <View style={styles.templateModalBody}>
              <ScrollView
                style={styles.templateModalScrollArea}
                contentContainerStyle={styles.templateModalContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.templateModalTitle}>
                  {editingFavorite
                    ? `${editingFavorite.name}のロールテンプレート`
                    : 'ロールテンプレート'}
                </Text>
                <TextInput
                  style={styles.templateInput}
                  multiline
                  textAlignVertical="top"
                  value={editedPrompt}
                  onChangeText={setEditedPrompt}
                />
              </ScrollView>
            </View>
            <Pressable
              style={styles.templateSaveButton}
              onPress={handleSaveTemplate}
            >
              <Text style={styles.templateSaveButtonText}>保存</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const ModalBackdrop: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Pressable style={styles.modalBackdrop} onPress={onPress} />
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  section: {
    marginTop: 24,
  },
  sectionSpacing: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  placeholder: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },
  favoriteCard: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  favoriteName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  favoriteSummary: {
    marginTop: 8,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  favoriteTimestamp: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
  historyListDescription: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  historyCard: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  historyCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  historySummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyTimestamp: {
    marginTop: 4,
    fontSize: 12,
    color: '#94a3b8',
  },
  favoriteForm: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#bfdbfe',
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
  },
  addButton: {
    marginTop: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  modalActionButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalPrimaryButton: {
    backgroundColor: '#2563eb',
  },
  modalSecondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  modalDestructiveButton: {
    backgroundColor: '#ef4444',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  modalSecondaryText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 15,
  },
  modalDestructiveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  templateModalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  templateModalBody: {
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    maxHeight: '100%',
  },
  templateModalScrollArea: {
    width: '100%',
  },
  templateModalContent: {
    paddingBottom: 12,
  },
  templateModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  templateInput: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 14,
    minHeight: 220,
    backgroundColor: '#f8fafc',
    fontSize: 13,
    lineHeight: 20,
    color: '#0f172a',
  },
  templateSaveButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  templateSaveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default FavoritesScreen;
