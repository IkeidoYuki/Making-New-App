declare module 'react-native-gesture-handler' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface GestureHandlerRootViewProps extends ViewProps {}

  export const GestureHandlerRootView: React.ComponentType<GestureHandlerRootViewProps>;
}
