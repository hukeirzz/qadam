import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initSounds } from './src/services/soundService';

export default function App() {
  useEffect(() => {
    initSounds();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
