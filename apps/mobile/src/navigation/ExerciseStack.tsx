import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { ExerciseSubjectScreen } from '../screens/ExerciseSubjectScreen';
import { PracticeQuizScreen } from '../screens/PracticeQuizScreen';
import { SchoolTestsScreen } from '../screens/SchoolTestsScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { ExerciseStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<ExerciseStackParamList>();

export function ExerciseStack() {
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
      <Stack.Screen name="SchoolTests" component={SchoolTestsScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
    </Stack.Navigator>
  );
}
