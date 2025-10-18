import { Alert, Linking, Platform } from 'react-native';
// Dev Clientにネイティブが入っていない場合の保険として遅延require
let WebBrowser: typeof import('expo-web-browser') | null = null;
try { WebBrowser = require('expo-web-browser'); } catch {}
import {
  buildChatGPTAppUrlCandidates,
  buildChatGPTWebUrl,
  STORE_URL,
} from '../utils/chatgptLinks';

type Options = { query: string; title?: string };

async function tryOpenChatGPTApp(query?: string) {
  const candidates = buildChatGPTAppUrlCandidates(query);
  for (const url of candidates) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // try next candidate
    }
  }
  return false;
}

export async function openInChatGPTWithChoice({
  query,
  title = '開き方を選択',
}: Options): Promise<boolean> {
  const trimmed = query.trim();
  const webUrl = buildChatGPTWebUrl(trimmed);

  return new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      'ChatGPTアプリで開くか、ブラウザで開くかを選択してください。',
      [
        { text: 'キャンセル', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'ChatGPTアプリ',
          onPress: async () => {
            const opened = await tryOpenChatGPTApp(trimmed);
            if (!opened) {
              const storeUrl = Platform.OS === 'ios' ? STORE_URL.ios : STORE_URL.android;
              Alert.alert(
                'ChatGPTアプリが見つかりません',
                'ストアを開きます。インストール後、再度お試しください。',
                [
                  { text: '閉じる', style: 'cancel', onPress: () => resolve(false) },
                  {
                    text: 'ストアを開く',
                    onPress: async () => {
                      await Linking.openURL(storeUrl);
                      resolve(true);
                    },
                  },
                ],
                { cancelable: true },
              );
            } else {
              resolve(true);
            }
          },
        },
        {
          text: 'ブラウザ（推奨）',
          onPress: async () => {
            const canInApp = !!WebBrowser?.openBrowserAsync;
            if (__DEV__) console.log('openInChatGPT.canInApp', canInApp);

            try {
              if (canInApp) {
                await WebBrowser!.openBrowserAsync(webUrl);
                if (__DEV__) console.log('openInChatGPT.result', 'in_app');
                // logOpenChatGPT({ method: 'in_app', queryLength: query.length });
              } else {
                // ネイティブ無しでも落ちないよう外部ブラウザへフォールバック
                await Linking.openURL(webUrl);
                if (__DEV__) console.log('openInChatGPT.result', 'external');
                // logOpenChatGPT({ method: 'external', queryLength: query.length });
              }
            } catch (e) {
              if (__DEV__) console.warn('openInChatGPT.error', e);
              await Linking.openURL(webUrl);
              // logOpenChatGPT({ method: 'fallback', queryLength: query.length });
            }
            resolve(true);
          },
        },
      ],
      { cancelable: true },
    );
  });
}
