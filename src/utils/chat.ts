import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';

const CHATGPT_WEB_URL = 'https://chat.openai.com/';

interface LaunchTarget {
  key: string;
  label: string;
  buildUrl: (payload: string) => string;
  testUrl?: string;
  alwaysAvailable?: boolean;
}

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

export async function launchChatGPTWithPrompt(payload: string): Promise<boolean> {
  const trimmed = payload.trim();
  if (!trimmed) {
    return false;
  }
  const availableTargets = await filterAvailableTargets(trimmed);

  if (availableTargets.length === 1) {
    try {
      await openTarget(availableTargets[0], trimmed);
      return true;
    } catch (error) {
      Alert.alert(
        'ChatGPTを開けません',
        'お手数ですがブラウザから https://chat.openai.com/ にアクセスしてください。',
      );
      return false;
    }
  }

  return new Promise<boolean>((resolve) => {
    const handleSelect = async (target: LaunchTarget | null) => {
      if (!target) {
        resolve(false);
        return;
      }
      try {
        await openTarget(target, trimmed);
        resolve(true);
      } catch (error) {
        Alert.alert(
          'ChatGPTを開けません',
          'お手数ですがブラウザから https://chat.openai.com/ にアクセスしてください。',
        );
        resolve(false);
      }
    };

    const optionLabels = availableTargets.map((item) => item.label);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...optionLabels, 'キャンセル'],
          cancelButtonIndex: optionLabels.length,
          title: 'ChatGPTを開くアプリを選択',
        },
        (selected) => {
          if (selected === optionLabels.length) {
            handleSelect(null);
            return;
          }
          handleSelect(availableTargets[selected]);
        },
      );
      return;
    }

    Alert.alert(
      'ChatGPTを開く',
      '利用するアプリを選択してください',
      [
        ...availableTargets.map((target) => ({
          text: target.label,
          onPress: () => handleSelect(target),
        })),
        { text: 'キャンセル', style: 'cancel', onPress: () => handleSelect(null) },
      ],
    );
  });
}
