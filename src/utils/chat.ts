import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';

const CHATGPT_WEB_URL = 'https://chat.openai.com/';

interface LaunchTarget {
  key: string;
  label: string;
  buildUrl: (payload: string) => string;
  testUrl?: string;
  alwaysAvailable?: boolean;
}

const buildEdgeUrl = (payload: string) => {
  const chatUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(payload)}`;
  if (Platform.OS === 'ios') {
    return `microsoft-edge-https://${chatUrl.replace(/^https?:\/\//, '')}`;
  }
  return `microsoft-edge:${chatUrl}`;
};

const EDGE_TEST_URL =
  Platform.OS === 'ios'
    ? 'microsoft-edge-https://chat.openai.com/'
    : 'microsoft-edge:https://chat.openai.com/';

const TARGETS: LaunchTarget[] = [
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    buildUrl: (payload) => `com.openai.chatgpt://chat?text=${encodeURIComponent(payload)}`,
    testUrl: 'com.openai.chatgpt://chat',
  },
  {
    key: 'chrome',
    label: 'Chrome',
    buildUrl: (payload) =>
      `googlechrome://chat.openai.com/?prompt=${encodeURIComponent(payload)}`,
    testUrl: 'googlechrome://chat.openai.com/',
  },
  {
    key: 'edge',
    label: 'Edge',
    buildUrl: buildEdgeUrl,
    testUrl: EDGE_TEST_URL,
  },
  {
    key: 'safari',
    label: Platform.select({ ios: 'Safari', default: '既定のブラウザ' }) ?? '既定のブラウザ',
    buildUrl: (payload) => `${CHATGPT_WEB_URL}?prompt=${encodeURIComponent(payload)}`,
    alwaysAvailable: true,
  },
];

const openTarget = async (target: LaunchTarget, payload: string) => {
  const url = target.buildUrl(payload);
  await Linking.openURL(url);
};

const openTargetSafely = async (
  target: LaunchTarget,
  payload: string,
): Promise<boolean> => {
  try {
    await openTarget(target, payload);
    return true;
  } catch (error) {
    Alert.alert(
      'ChatGPTを開けません',
      'お手数ですがブラウザから https://chat.openai.com/ にアクセスしてください。',
    );
    return false;
  }
};

const filterAvailableTargets = async (
  payload: string,
): Promise<LaunchTarget[]> => {
  const results: LaunchTarget[] = [];
  for (const target of TARGETS) {
    if (target.alwaysAvailable) {
      results.push(target);
      continue;
    }
    const urlToTest = target.testUrl ?? target.buildUrl(payload);
    try {
      const supported = await Linking.canOpenURL(urlToTest);
      if (supported) {
        results.push(target);
      }
    } catch (error) {
      // ignore and fall back to default browser
    }
  }
  if (results.length === 0) {
    results.push(TARGETS[TARGETS.length - 1]);
  }
  return results;
};

const showBrowserSelection = (
  targets: LaunchTarget[],
  payload: string,
): Promise<boolean> => {
  if (targets.length === 0) {
    return Promise.resolve(false);
  }

  const labels = targets.map((item) => item.label);

  return new Promise<boolean>((resolve) => {
    const handleSelection = async (index: number | null) => {
      if (index === null || index < 0 || index >= targets.length) {
        resolve(false);
        return;
      }
      const target = targets[index];
      const success = await openTargetSafely(target, payload);
      resolve(success);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...labels, 'キャンセル'],
          cancelButtonIndex: labels.length,
          title: 'ブラウザを選択',
        },
        (selected) => {
          if (selected === labels.length) {
            handleSelection(null);
            return;
          }
          handleSelection(selected);
        },
      );
      return;
    }

    Alert.alert(
      'ブラウザを選択',
      '利用するブラウザを選択してください。',
      [
        ...targets.map((target, index) => ({
          text: target.label,
          onPress: () => handleSelection(index),
        })),
        { text: 'キャンセル', style: 'cancel', onPress: () => handleSelection(null) },
      ],
    );
  });
};

const confirmChatGPTLaunch = (hasBrowserOptions: boolean): Promise<'app' | 'browser' | null> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      const options = hasBrowserOptions
        ? ['ChatGPTアプリで開く', 'ブラウザを選ぶ', 'キャンセル']
        : ['ChatGPTアプリで開く', 'キャンセル'];
      const cancelButtonIndex = hasBrowserOptions ? 2 : 1;
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'ChatGPTアプリで開きますか？',
        },
        (selected) => {
          if (selected === cancelButtonIndex) {
            resolve(null);
            return;
          }
          if (selected === 0) {
            resolve('app');
            return;
          }
          resolve('browser');
        },
      );
      return;
    }

    const buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'cancel' | 'default' | 'destructive';
    }> = [
      { text: 'アプリで開く', onPress: () => resolve('app') },
    ];

    if (hasBrowserOptions) {
      buttons.push({ text: 'ブラウザを選ぶ', onPress: () => resolve('browser') });
    }

    buttons.push({ text: 'キャンセル', style: 'cancel', onPress: () => resolve(null) });

    Alert.alert(
      'ChatGPTアプリで開きますか？',
      hasBrowserOptions
        ? 'ChatGPTアプリを使用するか、ブラウザを選択してください。'
        : 'ChatGPTアプリを使用して開きますか？',
      buttons,
    );
  });
};

export async function launchChatGPTWithPrompt(payload: string): Promise<boolean> {
  const trimmed = payload.trim();
  if (!trimmed) {
    return false;
  }

  const availableTargets = await filterAvailableTargets(trimmed);
  const chatGPTTarget = availableTargets.find((target) => target.key === 'chatgpt') || null;
  const browserTargets = availableTargets.filter((target) => target.key !== 'chatgpt');

  if (chatGPTTarget) {
    const choice = await confirmChatGPTLaunch(browserTargets.length > 0);
    if (choice === 'app') {
      return openTargetSafely(chatGPTTarget, trimmed);
    }
    if (choice === 'browser') {
      if (browserTargets.length === 1) {
        return openTargetSafely(browserTargets[0], trimmed);
      }
      return showBrowserSelection(browserTargets, trimmed);
    }
    return false;
  }

  if (availableTargets.length === 1) {
    return openTargetSafely(availableTargets[0], trimmed);
  }

  return showBrowserSelection(availableTargets, trimmed);
}
