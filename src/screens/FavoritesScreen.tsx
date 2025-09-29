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
import { useAppState } from '../context/AppStateContext';

const formatTimestamp = (value: number) => {
  const date = new Date(value);
  const pad = (input: number) => input.toString().padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const FavoritesScreen: React.FC = () => {
  const { favorites, history, addFavorite } = useAppState();
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string | null>(
    null,
  );
  const [favoriteName, setFavoriteName] = React.useState('');

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

  return (
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
            <View key={favorite.id} style={styles.favoriteCard}>
              <Text style={styles.favoriteName}>{favorite.name}</Text>
              <Text style={styles.favoriteSummary}>{favorite.result.summary}</Text>
              <Text style={styles.favoriteTimestamp}>
                登録日: {formatTimestamp(favorite.addedAt)}
              </Text>
            </View>
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
  );
};

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
});

export default FavoritesScreen;
