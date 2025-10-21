import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

let _inited = false;

export function initSentry() {
  if (_inited) return;
  _inited = true;

  const extra =
    ((Constants as any)?.expoConfig?.extra ??
      (Constants as any)?.manifest2?.extra ??
      {}) as Record<string, any>;

  const dsn = extra?.sentryDsn;
  const environment =
    extra?.environment ?? (__DEV__ ? 'development' : 'production');

  if (!dsn || typeof dsn !== 'string' || dsn === 'YOUR_SENTRY_DSN') {
    // Skip initialization when DSN is missing to avoid warnings
    return;
  }

  Sentry.init({
    dsn,
    enableInExpoDevelopment: true,
    debug: __DEV__,
    tracesSampleRate: 0.2,
    enableNativeNagger: false,
    // Keep native nags quiet until the native SDK lands
    enableNative: false,
    environment,
  });
}

export function logBreadcrumb(category: string, data?: Record<string, any>) {
  Sentry.Native.addBreadcrumb({ category, data });
}

export function logMessage(
  msg: string,
  level: Sentry.Native.SeverityLevel | 'info' | 'warning' | 'error' = 'info',
) {
  Sentry.Native.captureMessage(msg, level as any);
}

export function logError(err: unknown) {
  Sentry.Native.captureException(
    err instanceof Error ? err : new Error(String(err)),
  );
}
