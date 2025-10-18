import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './src/screens/MainScreen';
import PromptBuilderScreen from './src/screens/PromptBuilderScreen';
import PromptResultScreen from './src/screens/PromptResultScreen';
import HelpScreen from './src/screens/HelpScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import { AppStateProvider } from './src/context/AppStateContext';
import { RootStackParamList } from './src/navigation/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox, StyleSheet } from 'react-native';
import HistoryScreen from './src/screens/HistoryScreen';
import { initSentry } from './src/integrations/sentry';

initSentry();

if (__DEV__) {
  LogBox.ignoreLogs([
    'Require cycle:',
    'Non-serializable values were found in the navigation state',
    'Setting a timer for a long period of time',
  ]);
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppStateProvider>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: '#f8fafc',
            },
          }}
        >
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ title: 'AIロールプロンプト作成' }}
            />
            <Stack.Screen
              name="PromptBuilder"
              component={PromptBuilderScreen}
              options={{ title: 'ヒアリングシート' }}
            />
            <Stack.Screen
              name="PromptResult"
              component={PromptResultScreen}
              options={{ title: 'ロールプロンプトの確認' }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{ title: 'ヘルプ' }}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: 'お気に入り' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: '履歴' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
