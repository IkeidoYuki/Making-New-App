import React from 'react';
import { buildPrompt, PromptResult } from '../utils/prompt';

export interface AppStateContextValue {
  promptResult: PromptResult | null;
  questionDraft: string;
  setPromptResult: (result: PromptResult | null) => void;
  updateQuestionDraft: (value: string) => void;
  history: PromptHistoryEntry[];
  favorites: FavoriteEntry[];
  addFavorite: (name: string, result: PromptResult) => void;
  updateFavoritePrompt: (id: string, rolePrompt: string) => void;
  removeFavorite: (id: string) => void;
}

export interface PromptHistoryEntry {
  id: string;
  createdAt: number;
  result: PromptResult;
}

export interface FavoriteEntry {
  id: string;
  name: string;
  addedAt: number;
  result: PromptResult;
}

const MAX_HISTORY = 5;

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

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

  const storePromptResult = React.useCallback(
    (result: PromptResult | null) => {
      setPromptResultState(result);
      if (result) {
        setHistory((prev) => {
          const nextEntry: PromptHistoryEntry = {
            id: createId(),
            createdAt: Date.now(),
            result,
          };
          const filtered = prev.filter(
            (item) => item.result.rolePrompt !== result.rolePrompt,
          );
          return [nextEntry, ...filtered].slice(0, MAX_HISTORY);
        });
      }
    },
    [],
  );

  const updateQuestionDraft = React.useCallback((value: string) => {
    setQuestionDraft(value);
    setPromptResultState((prev) => {
      if (!prev) {
        return prev;
      }
      return buildPrompt(prev.input, value);
    });
  }, []);

  const addFavorite = React.useCallback((name: string, result: PromptResult) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setFavorites((prev) => {
      const entry: FavoriteEntry = {
        id: createId(),
        name: trimmed,
        addedAt: Date.now(),
        result,
      };
      const filtered = prev.filter((item) => item.name !== trimmed);
      return [entry, ...filtered];
    });
  }, []);

  const updateFavoritePrompt = React.useCallback(
    (id: string, rolePrompt: string) => {
      setFavorites((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, result: { ...item.result, rolePrompt } }
            : item,
        ),
      );
    },
    [],
  );

  const removeFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = React.useMemo<AppStateContextValue>(
    () => ({
      promptResult,
      questionDraft,
      setPromptResult: storePromptResult,
      updateQuestionDraft,
      history,
      favorites,
      addFavorite,
      updateFavoritePrompt,
      removeFavorite,
    }),
    [
      promptResult,
      questionDraft,
      storePromptResult,
      updateQuestionDraft,
      history,
      favorites,
      addFavorite,
      updateFavoritePrompt,
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
