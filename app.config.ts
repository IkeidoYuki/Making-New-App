import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const ENV =
    process.env.EXPO_PUBLIC_ENV ??
    (process.env.NODE_ENV === 'production' ? 'production' : 'development');

  return {
    ...config,
    name: 'AI Role Prompt App',
    slug: 'ai-role-prompt-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#85C9CD',
    },
    assetBundlePatterns: ['**/*'],
    plugins: ['sentry-expo'],
    ios: {
      icon: './assets/icon.png',
      supportsTablet: false,
      bundleIdentifier: 'com.github.ikeidoyuki.airoleprompt',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        LSApplicationQueriesSchemes: ['chatgpt', 'openai', 'com.openai.chat'],
      },
    },
    android: {
      package: 'com.github.ikeidoyuki.airoleprompt',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#3CB8B1',
      },
      permissions: [],
    },
    web: {
      bundler: 'metro',
    },
    extra: {
      eas: {
        projectId: '48020c66-08e7-4018-a1a0-aa4e5bbdc548',
      },
      // Inject DSN/environment via EXPO_PUBLIC_* env vars
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      environment: ENV,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/48020c66-08e7-4018-a1a0-aa4e5bbdc548',
    },
  };
};
