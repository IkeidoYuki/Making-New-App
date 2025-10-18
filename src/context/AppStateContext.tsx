import React from 'react';
import {
  promptStore,
  createPersistentId,
  type FavoriteEntry,
  type PromptHistoryEntry,
} from '../lib/storage/promptStore';
import { buildPrompt, PromptResult } from '../utils/prompt';

export interface AppStateContextValue {
  promptResult: PromptResult | null;
  questionDraft: string;
  setPromptResult: (result: PromptResult | null) => void;
  updateQuestionDraft: (value: string) => void;
  hasNewPrompt: boolean;
  acknowledgePrompt: () => void;
  history: PromptHistoryEntry[];
  favorites: FavoriteEntry[];
  addFavorite: (name: string, result: PromptResult) => void;
  updateFavoritePrompt: (id: string, rolePrompt: string) => void;
  renameFavorite: (id: string, name: string) => void;
  removeFavorite: (id: string) => void;
}

const MAX_HISTORY = 5;

const AppStateContext = React.createContext<AppStateContextValue | undefined>(
  undefined,
);

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [promptResult, setPromptResultState] = React.useState<PromptResult | null>(
    null,
  );
  const [questionDraft, setQuestionDraft] = React.useState('');
  const [history, setHistory] = React.useState<PromptHistoryEntry[]>([]);
  const [favorites, setFavorites] = React.useState<FavoriteEntry[]>([]);
  const [hasNewPrompt, setHasNewPrompt] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const stored = await promptStore.getAll();
      setHistory(stored.history);
      setFavorites(stored.favorites);
    })();
  }, []);

  const persistHistory = React.useCallback((entries: PromptHistoryEntry[]) => {
    promptStore.setHistory(entries).catch((error) => {
      console.error('Failed to persist history', error);
    });
  }, []);

  const persistFavorites = React.useCallback((entries: FavoriteEntry[]) => {
    promptStore.setFavorites(entries).catch((error) => {
      console.error('Failed to persist favorites', error);
    });
  }, []);

  const storePromptResult = React.useCallback(
    (result: PromptResult | null) => {
      setPromptResultState(result);
      setHasNewPrompt(!!result);
      if (result) {
        setHistory((prev) => {
          const nextEntry: PromptHistoryEntry = {
            id: createPersistentId(),
            createdAt: Date.now(),
            result,
          };
          const filtered = prev.filter(
            (item) => item.result.rolePrompt !== result.rolePrompt,
          );
          const next = [nextEntry, ...filtered].slice(0, MAX_HISTORY);
          persistHistory(next);
          return next;
        });
      }
    },
    [persistHistory],
  );

  const updateQuestionDraft = React.useCallback((value: string) => {
    setQuestionDraft(value);
    setPromptResultState((prev) => {
      if (!prev) {
        return prev;
      }
      setHasNewPrompt(false);
      return buildPrompt(prev.input, value);
    });
  }, []);

  const acknowledgePrompt = React.useCallback(() => {
    setHasNewPrompt(false);
  }, []);

  const addFavorite = React.useCallback((name: string, result: PromptResult) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setFavorites((prev) => {
      const entry: FavoriteEntry = {
        id: createPersistentId(),
        name: trimmed,
        addedAt: Date.now(),
        result,
      };
      const filtered = prev.filter((item) => item.name !== trimmed);
      const next = [entry, ...filtered];
      persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const updateFavoritePrompt = React.useCallback(
    (id: string, rolePrompt: string) => {
      setFavorites((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? { ...item, result: { ...item.result, rolePrompt } }
            : item,
        );
        persistFavorites(next);
        return next;
      });
    },
    [persistFavorites],
  );

  const renameFavorite = React.useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setFavorites((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, name: trimmed } : item,
      );
      persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const removeFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const value = React.useMemo<AppStateContextValue>(
    () => ({
      promptResult,
      questionDraft,
      setPromptResult: storePromptResult,
      updateQuestionDraft,
      hasNewPrompt,
      acknowledgePrompt,
      history,
      favorites,
      addFavorite,
      updateFavoritePrompt,
      renameFavorite,
      removeFavorite,
    }),
    [
      promptResult,
      questionDraft,
      storePromptResult,
      updateQuestionDraft,
      hasNewPrompt,
      acknowledgePrompt,
      history,
      favorites,
      addFavorite,
      updateFavoritePrompt,
      renameFavorite,
      removeFavorite,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
};

export function useAppState(): AppStateContextValue {
  const context = React.useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return context;
}

export type { PromptHistoryEntry, FavoriteEntry } from '../lib/storage/promptStore';
