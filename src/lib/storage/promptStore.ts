import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromptResult } from '../../utils/prompt';

const KEY = 'promptStore/v1';

export type PromptHistoryEntry = {
  id: string;
  createdAt: number;
  result: PromptResult;
};

export type FavoriteEntry = {
  id: string;
  name: string;
  addedAt: number;
  result: PromptResult;
};

export type StoreShape = {
  version: 1;
  history: PromptHistoryEntry[];
  favorites: FavoriteEntry[];
};

const initialStore: StoreShape = { version: 1, history: [], favorites: [] };

async function load(): Promise<StoreShape> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return initialStore;
  }
  try {
    const data = JSON.parse(raw);
    if (data?.version === 1) {
      return {
        version: 1 as const,
        history: Array.isArray(data.history) ? data.history : [],
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
      };
    }
    return initialStore;
  } catch {
    return initialStore;
  }
}

async function save(store: StoreShape) {
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

async function mutate(
  updater: (store: StoreShape) => void | StoreShape,
): Promise<StoreShape> {
  const current = await load();
  const next = updater(current) ?? current;
  await save(next);
  return next;
}

export const promptStore = {
  async getAll(): Promise<StoreShape> {
    return await load();
  },

  async setHistory(history: PromptHistoryEntry[]): Promise<void> {
    await mutate((store) => {
      store.history = history;
    });
  },

  async setFavorites(favorites: FavoriteEntry[]): Promise<void> {
    await mutate((store) => {
      store.favorites = favorites;
    });
  },

  async clear(): Promise<void> {
    await save(initialStore);
  },
};

export function createPersistentId() {
  if (typeof crypto?.getRandomValues === 'function') {
    const buffer = new Uint32Array(4);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
      .map((value) => value.toString(16).padStart(8, '0'))
      .join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
