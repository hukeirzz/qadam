import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { HeaderBar } from '../components/home/HeaderBar';
import { ProgressSummary } from '../components/home/ProgressSummary';
import { RankIslandMap } from '../components/home/RankIslandMap';
import { HomeStackParamList } from '../types/navigation';
import { SubjectId } from '../types/subject';
import { playSound } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const openIsland = (subjectId: SubjectId) => {
    playSound('tap');
    navigation.navigate('IslandPath', { subjectId });
  };

  const openPremium = () => {
    playSound('tap');
    // Open Premium inside the Home stack so it doesn't hijack the Profile tab
    // (navigating cross-tab replaced the Profile screen with Premium).
    navigation.navigate('Premium');
  };

  return (
    <ScreenBackground>
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <HeaderBar />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 96 },
          ]}
        >
          <ProgressSummary />
          <RankIslandMap onIslandPress={openIsland} onPremiumPress={openPremium} />
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
});
