import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { ExerciseSubjectScreen } from '../screens/ExerciseSubjectScreen';
import { PracticeQuizScreen } from '../screens/PracticeQuizScreen';
import { RankUnlockScreen } from '../screens/RankUnlockScreen';
import { SchoolTestsScreen } from '../screens/SchoolTestsScreen';
import { SchoolTestQuizScreen } from '../screens/SchoolTestQuizScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { ExerciseStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator<ExerciseStackParamList>();

export function ExerciseStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ExerciseHome" component={ExerciseScreen} />
      <Stack.Screen name="ExerciseSubject" component={ExerciseSubjectScreen} />
      <Stack.Screen name="PracticeQuiz" component={PracticeQuizScreen} />
      <Stack.Screen name="RankUnlock" component={RankUnlockScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SchoolTests" component={SchoolTestsScreen} />
      <Stack.Screen name="SchoolTestQuiz" component={SchoolTestQuizScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
    </Stack.Navigator>
  );
}
