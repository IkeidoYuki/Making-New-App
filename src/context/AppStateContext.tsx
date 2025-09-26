import React from 'react';
import { buildPrompt, PromptResult } from '../utils/prompt';

export interface AppStateContextValue {
  promptResult: PromptResult | null;
  questionDraft: string;
  setPromptResult: (result: PromptResult | null) => void;
  updateQuestionDraft: (value: string) => void;
  reset: () => void;
}

const AppStateContext = React.createContext<AppStateContextValue | undefined>(
  undefined,
);

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [promptResult, setPromptResult] = React.useState<PromptResult | null>(
    null,
  );
  const [questionDraft, setQuestionDraft] = React.useState('');

  const storePromptResult = React.useCallback(
    (result: PromptResult | null) => {
      setPromptResult(result);
    },
    [],
  );

  const updateQuestionDraft = React.useCallback((value: string) => {
    setQuestionDraft(value);
    setPromptResult((prev) => {
      if (!prev) {
        return prev;
      }
      return buildPrompt(prev.input, value);
    });
  }, []);

  const reset = React.useCallback(() => {
    setPromptResult(null);
    setQuestionDraft('');
  }, []);

  const value = React.useMemo<AppStateContextValue>(
    () => ({
      promptResult,
      questionDraft,
      setPromptResult: storePromptResult,
      updateQuestionDraft,
      reset,
    }),
    [promptResult, questionDraft, storePromptResult, updateQuestionDraft, reset],
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
