import * as Clipboard from 'expo-clipboard';
import { Alert, Linking, Platform, Share, ToastAndroid } from 'react-native';
// Dev Clientにネイティブが入っていない場合の保険として遅延require
let WebBrowser: typeof import('expo-web-browser') | null = null;
try { WebBrowser = require('expo-web-browser'); } catch {}
import {
  buildChatGPTAppUrlCandidates,
  buildChatGPTWebUrl,
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

const GUIDANCE_MESSAGE =
  'ロールプロンプトをコピーしました。ChatGPTを開いたら貼り付け（ペースト）して送信してください。';

async function openOrShare(prompt: string): Promise<boolean> {
  const opened = await tryOpenChatGPTApp(prompt);
  if (opened) return true;

  try {
    await Share.share({ message: prompt });
    return true;
  } catch (e) {
    if (__DEV__) console.warn('openInChatGPT.share', e);
    Alert.alert('エラー', '共有シートを開けませんでした。もう一度お試しください。');
    return false;
  }
}

async function openChatGPTAppWithClipboard(prompt: string) {
  try {
    await Clipboard.setStringAsync(prompt);
  } catch (e) {
    if (__DEV__) console.warn('openInChatGPT.clipboard', e);
  }

  if (Platform.OS === 'android') {
    ToastAndroid.show(GUIDANCE_MESSAGE, ToastAndroid.LONG);
    await new Promise(r => setTimeout(r, 300));
    return await openOrShare(prompt);
  }

  return await new Promise<boolean>((resolve) => {
    Alert.alert(
      'コピーしました',
      GUIDANCE_MESSAGE,
      [
        { text: 'キャンセル', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'ChatGPTを開く',
          onPress: async () => {
            const ok = await openOrShare(prompt);
            resolve(ok);
          },
        },
      ],
      { cancelable: true },
    );
  });
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
            try {
              const handled = await openChatGPTAppWithClipboard(trimmed);
              resolve(handled);
            } catch (e) {
              if (__DEV__) console.warn('openInChatGPT.openApp', e);
              Alert.alert('エラー', 'ChatGPTを開けませんでした。もう一度お試しください。');
              resolve(false);
            }
          },
        },
        {
          text: 'ブラウザ',
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
