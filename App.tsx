import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './src/screens/MainScreen';
import PromptBuilderScreen from './src/screens/PromptBuilderScreen';
import AccountScreen from './src/screens/AccountScreen';
import HelpScreen from './src/screens/HelpScreen';
import { AppStateProvider } from './src/context/AppStateContext';
import { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
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
            name="Account"
            component={AccountScreen}
            options={{ title: 'ChatGPTアカウント設定' }}
          />
          <Stack.Screen
            name="Help"
            component={HelpScreen}
            options={{ title: 'ヘルプ' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppStateProvider>
  );
}
