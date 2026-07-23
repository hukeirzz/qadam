import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { IslandPathScreen } from '../screens/IslandPathScreen';
import { TheoryScreen } from '../screens/TheoryScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { CorrectAnswerScreen } from '../screens/CorrectAnswerScreen';
import { CompetitionsScreen } from '../screens/CompetitionsScreen';
import { CompetitionDetailScreen } from '../screens/CompetitionDetailScreen';
import { RatingScreen } from '../screens/RatingScreen';
import { HomeStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="IslandPath" component={IslandPathScreen} />
      <Stack.Screen name="Theory" component={TheoryScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen
        name="CorrectAnswer"
        component={CorrectAnswerScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Competitions" component={CompetitionsScreen} />
      <Stack.Screen name="CompetitionDetail" component={CompetitionDetailScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
    </Stack.Navigator>
  );
}
