import React from 'react';
import { PromptResult } from '../utils/prompt';

export interface AccountInfo {
  nickname: string;
  email: string;
  apiKey: string;
  note: string;
}

export interface AppStateContextValue {
  promptResult: PromptResult | null;
  questionDraft: string;
  account: AccountInfo;
  setPromptResult: (result: PromptResult | null) => void;
  updateQuestionDraft: (value: string) => void;
  updateAccount: (info: Partial<AccountInfo>) => void;
  reset: () => void;
}

const defaultAccount: AccountInfo = {
  nickname: '',
  email: '',
  apiKey: '',
  note: '',
};

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
  const [account, setAccount] = React.useState<AccountInfo>(defaultAccount);

  const storePromptResult = React.useCallback(
    (result: PromptResult | null) => {
      setPromptResult(result);
    },
    [],
  );

  const updateQuestionDraft = React.useCallback((value: string) => {
    setQuestionDraft(value);
  }, []);

  const updateAccount = React.useCallback((info: Partial<AccountInfo>) => {
    setAccount((prev) => ({ ...prev, ...info }));
  }, []);

  const reset = React.useCallback(() => {
    setPromptResult(null);
    setQuestionDraft('');
  }, []);

  const value = React.useMemo<AppStateContextValue>(
    () => ({
      promptResult,
      questionDraft,
      account,
      setPromptResult: storePromptResult,
      updateQuestionDraft,
      updateAccount,
      reset,
    }),
    [promptResult, questionDraft, account, storePromptResult, updateQuestionDraft, updateAccount, reset],
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
