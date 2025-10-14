export function buildChatGPTWebUrl(query: string) {
  const encoded = encodeURIComponent(query.trim());
  return `https://chat.openai.com/?q=${encoded}`;
}

export function buildChatGPTAppUrlCandidates(query?: string) {
  const suffix = query ? `?q=${encodeURIComponent(query.trim())}` : '';
  return [
    `chatgpt://${suffix}`,
    `openai://${suffix}`,
    `com.openai.chat://${suffix}`,
  ];
}

export const STORE_URL = {
  ios: 'https://apps.apple.com/app/chatgpt/id6448311069',
  android: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
};
