import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { HomeStackParamList } from '../types/navigation';
import { subjectColors, colors } from '../theme/colors';
import { fetchTopicTheory, TopicTheory } from '../services/theoryService';
import { mathBasicImages } from '../assets/mathBasicImages';
import { playSound, vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Theory'>;

export function TheoryScreen({ navigation, route }: Props) {
  const { subjectId, topicId } = route.params;
  const palette = subjectColors[subjectId];
  const insets = useSafeAreaInsets();

  const [theory, setTheory] = useState<TopicTheory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopicTheory(topicId).then((t) => {
      if (!t) {
        // No theory for this topic — go straight to quiz
        navigation.replace('Quiz', { subjectId, topicId });
        return;
      }
      setTheory(t);
      setLoading(false);
    });
  }, []);

  const startQuiz = () => {
    playSound('tap');
    // replace Theory with Quiz so back stack stays clean (CorrectAnswer pop(2) still works)
    navigation.replace('Quiz', { subjectId, topicId });
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </ScreenBackground>
    );
  }

  if (!theory) return null;

  const paragraphs = theory.content.split('\n\n').filter(Boolean);

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{theory.title}</Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
        >
          <View style={[styles.badge, { backgroundColor: `${palette.primary}22`, borderColor: `${palette.primary}55` }]}>
            <Ionicons name="book-outline" size={13} color={palette.primary} />
            <Text style={[styles.badgeText, { color: palette.primary }]}>Теория</Text>
          </View>

          <Text style={styles.title}>{theory.title}</Text>

          {paragraphs.map((para, i) => {
            if (para.startsWith('[asset:') && para.endsWith(']')) {
              const key = para.slice(7, -1);
              const src = mathBasicImages[key];
              if (src) {
                return (
                  <View key={i} style={styles.diagramWrap}>
                    <Image source={src} style={styles.diagram} resizeMode="contain" />
                  </View>
                );
              }
            }
            if (para.startsWith('[img:') && para.endsWith(']')) {
              const url = para.slice(5, -1);
              return (
                <View key={i} style={styles.diagramWrap}>
                  <Image source={{ uri: url }} style={styles.diagram} resizeMode="contain" />
                </View>
              );
            }
            return <Text key={i} style={styles.paragraph}>{para}</Text>;
          })}
        </ScrollView>

        {/* Start quiz button */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 124 }]}>
          <Pressable onPress={startQuiz} style={styles.btnWrap}>
            <LinearGradient
              colors={[palette.primary, palette.secondary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Начать квиз</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.text} style={styles.btnIcon} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 20,
  },
  paragraph: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
  },
  diagramWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  diagram: {
    width: '100%',
    height: 220,
  },
  bottom: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  btnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  btn: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  btnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
});
