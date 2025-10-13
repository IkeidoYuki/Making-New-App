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

const formatTimestamp = (value: number) => {
  const date = new Date(value);
  const pad = (input: number) => input.toString().padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const FavoritesScreen: React.FC = () => {
  const { favorites, updateFavoritePrompt, renameFavorite, removeFavorite } =
    useAppState();
  const [optionsFavoriteId, setOptionsFavoriteId] = React.useState<string | null>(
    null,
  );
  const [editingFavoriteId, setEditingFavoriteId] = React.useState<string | null>(
    null,
  );
  const [editedPrompt, setEditedPrompt] = React.useState('');
  const [expandedFavoriteId, setExpandedFavoriteId] = React.useState<string | null>(
    null,
  );
  const [renamingFavoriteId, setRenamingFavoriteId] = React.useState<string | null>(
    null,
  );
  const [renamedFavoriteName, setRenamedFavoriteName] = React.useState('');

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

  const renamingFavorite = React.useMemo(
    () => favorites.find((item) => item.id === renamingFavoriteId) || null,
    [favorites, renamingFavoriteId],
  );

  const toggleExpandedFavorite = React.useCallback((favoriteId: string) => {
    setExpandedFavoriteId((prev) => (prev === favoriteId ? null : favoriteId));
  }, []);

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
    const launched = await launchChatGPTWithPrompt(prompt);
    if (launched) {
      closeOptions();
    }
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

  const handleRenameFavorite = React.useCallback(() => {
    if (!activeFavorite) {
      return;
    }
    setRenamingFavoriteId(activeFavorite.id);
    setRenamedFavoriteName(activeFavorite.name);
    closeOptions();
  }, [activeFavorite, closeOptions]);

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

  const closeRenameModal = React.useCallback(() => {
    setRenamingFavoriteId(null);
    setRenamedFavoriteName('');
  }, []);

  const handleSaveFavoriteName = React.useCallback(() => {
    if (!renamingFavoriteId) {
      return;
    }
    const trimmed = renamedFavoriteName.trim();
    if (!trimmed) {
      Alert.alert('お気に入り名を入力してください');
      return;
    }
    renameFavorite(renamingFavoriteId, trimmed);
    Alert.alert('お気に入り名を更新しました');
    closeRenameModal();
  }, [closeRenameModal, renameFavorite, renamingFavoriteId, renamedFavoriteName]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>お気に入りのロールテンプレート</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>登録済みのお気に入り</Text>
          {favorites.length === 0 ? (
            <Text style={styles.placeholder}>
              まだお気に入りが登録されていません。ヒアリングシートで生成したロールプロンプトを履歴から登録できます。
            </Text>
          ) : (
            favorites.map((favorite) => {
              const isExpanded = expandedFavoriteId === favorite.id;
              return (
                <View key={favorite.id} style={styles.favoriteCard}>
                  <View style={styles.favoriteHeader}>
                    <Text style={styles.favoriteName}>{favorite.name}</Text>
                    <Pressable
                      style={[styles.favoriteActionPill, styles.favoritePrimaryPill]}
                      onPress={() => openOptions(favorite.id)}
                    >
                      <Text style={styles.favoritePrimaryPillText}>操作</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.favoriteSummary}>{favorite.result.summary}</Text>
                  <Text style={styles.favoriteTimestamp}>
                    登録日: {formatTimestamp(favorite.addedAt)}
                  </Text>
                  <Pressable
                    style={styles.favoriteAccordionHeader}
                    onPress={() => toggleExpandedFavorite(favorite.id)}
                  >
                    <Text style={styles.favoriteAccordionTitle}>
                      {isExpanded ? 'ロールを隠す' : 'ロールを表示'}
                    </Text>
                    <Text style={styles.favoriteAccordionIcon}>
                      {isExpanded ? '−' : '+'}
                    </Text>
                  </Pressable>
                  {isExpanded ? (
                    <View style={styles.favoritePromptContainer}>
                      <Text style={styles.favoritePromptText}>
                        {favorite.result.rolePrompt}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.favoriteAccordionHint}>
                      ボタンを押すとロールプロンプトの全文を確認できます。
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>お気に入りの使い方</Text>
          <Text style={styles.helperText}>
            ヒアリングシートで作成したロールプロンプトは、ホーム画面の「履歴」からお気に入り登録できます。
          </Text>
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
              style={[styles.modalActionButton, styles.modalSecondaryButton]}
              onPress={handleRenameFavorite}
            >
              <Text style={styles.modalSecondaryText}>お気に入り名を編集</Text>
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

      <Modal
        transparent
        animationType="fade"
        visible={!!renamingFavorite}
        onRequestClose={closeRenameModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <ModalBackdrop onPress={closeRenameModal} />
          <View style={styles.renameModalCard}>
            <Text style={styles.renameModalTitle}>お気に入り名を編集</Text>
            <TextInput
              style={styles.renameModalInput}
              value={renamedFavoriteName}
              onChangeText={setRenamedFavoriteName}
              placeholder="例: 画像編集アシスタント"
              placeholderTextColor="#64748b"
            />
            <View style={styles.renameModalActions}>
              <Pressable
                style={[styles.renameModalButton, styles.renameModalCancelButton]}
                onPress={closeRenameModal}
              >
                <Text style={styles.renameModalCancelText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={[styles.renameModalButton, styles.renameModalSaveButton]}
                onPress={handleSaveFavoriteName}
              >
                <Text style={styles.renameModalSaveText}>保存する</Text>
              </Pressable>
            </View>
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  section: {
    marginTop: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  sectionSpacing: {
    marginTop: 32,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  favoriteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 18,
    gap: 12,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  favoriteActionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  favoritePrimaryPill: {
    backgroundColor: '#2563eb',
  },
  favoritePrimaryPillText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  favoriteSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  favoriteTimestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  favoriteAccordionHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
  },
  favoriteAccordionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  favoriteAccordionIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  favoriteAccordionHint: {
    fontSize: 12,
    color: '#64748b',
  },
  favoritePromptContainer: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  favoritePromptText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#1f2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalActionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPrimaryButton: {
    backgroundColor: '#2563eb',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  modalSecondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  modalSecondaryText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 15,
  },
  modalDestructiveButton: {
    backgroundColor: '#fee2e2',
  },
  modalDestructiveText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 15,
  },
  templateModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  templateModalBody: {
    maxHeight: 420,
  },
  templateModalScrollArea: {
    maxHeight: 360,
  },
  templateModalContent: {
    padding: 20,
    gap: 16,
  },
  templateModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  templateInput: {
    minHeight: 240,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 20,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  templateSaveButton: {
    padding: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  templateSaveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  renameModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    gap: 16,
  },
  renameModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  renameModalInput: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  renameModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  renameModalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  renameModalCancelButton: {
    backgroundColor: '#e2e8f0',
  },
  renameModalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  renameModalSaveButton: {
    backgroundColor: '#2563eb',
  },
  renameModalSaveText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default FavoritesScreen;
