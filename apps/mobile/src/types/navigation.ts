import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { Rank } from '@qadam/business-logic';
import type { SubjectId } from './subject';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  PetName: undefined;
  EntranceTest: undefined;
  EntranceTestResult: { score: number; total: number; rank: Rank };
  Main: undefined;
  ResetPassword: { email?: string } | undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Premium: undefined;
  IslandPath: { subjectId: SubjectId };
  Theory: { subjectId: SubjectId; topicId: string };
  Quiz: { subjectId: SubjectId; topicId: string };
  CorrectAnswer: {
    subjectId: SubjectId;
    topicId: string;
    correctCount: number;
    total: number;
    earnedXp: number;
    livesRemaining: number;
  };
};

export type ExerciseStackParamList = {
  ExerciseHome: undefined;
  ExerciseSubject: { subjectId: string };
  PracticeQuiz: { topicId: string; topicTitle: string; subjectId: string };
  Premium: undefined;
};

export type MainTabParamList = {
  ChatTab: undefined;
  StatsTab: undefined;
  PathTab: undefined;
  ExerciseTab: undefined;
  ProfileTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;
