export type OpenMethod = 'in_app' | 'external' | 'fallback';

export function logOpenChatGPT(payload: { method: OpenMethod; queryLength?: number }) {
  if (__DEV__) console.log('[analytics] open_chatgpt', payload);
  // Placeholder for future analytics providers
}
