import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

let _inited = false;

export function initSentry() {
  if (_inited) return;
  _inited = true;

  const dsn =
    (Constants?.expoConfig?.extra as any)?.sentryDsn ||
    (Constants as any)?.manifest2?.extra?.sentryDsn;

  if (!dsn) return;

  Sentry.init({
    dsn,
    enableInExpoDevelopment: true,
    debug: __DEV__,
    tracesSampleRate: 0.2,
  });
}

export function logBreadcrumb(category: string, data?: Record<string, any>) {
  Sentry.Native.addBreadcrumb({ category, data });
}

export function logMessage(
  msg: string,
  level: Sentry.Native.SeverityLevel = 'info',
) {
  Sentry.Native.captureMessage(msg, level);
}

export function logError(err: unknown) {
  Sentry.Native.captureException(
    err instanceof Error ? err : new Error(String(err)),
  );
}
