import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petMoodFromStreak, type PetMood } from '@qadam/business-logic';
import type { PetType } from '@qadam/types';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';

const MOOD_LABEL: Record<PetMood, string> = {
  excited: 'В восторге!',
  happy: 'Рад тебя видеть',
  neutral: 'Ждёт тебя',
  sad: 'Скучает по тебе',
};

const MOOD_EMOJI: Record<PetMood, string> = {
  excited: '🤩',
  happy: '😊',
  neutral: '😐',
  sad: '😢',
};

const PET_IMAGES: Record<PetType, any> = {
  bars: require('../../../assets/bars.png'),
  cat: require('../../../assets/cat.png'),
  dog: require('../../../assets/dog.png'),
  eagle: require('../../../assets/eagle.png'),
  penguin: require('../../../assets/penguin.png'),
};

export function PetCard() {
  const petName = useAppStore((s) => s.petName);
  const petType = useAppStore((s) => s.petType);
  const streak = useAppStore((s) => s.streak);
  const lastActivity = useAppStore((s) => s.lastActivity);

  if (!petName) return null;

  const mood = petMoodFromStreak(streak, lastActivity);
  const image = petType ? PET_IMAGES[petType] : null;

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={image} style={styles.avatar} resizeMode="cover" />
      ) : (
        <Text style={styles.emoji}>🐆</Text>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{petName}</Text>
        <Text style={styles.mood}>{MOOD_EMOJI[mood]} {MOOD_LABEL[mood]}</Text>
      </View>
      <View style={styles.streak}>
        <MaterialCommunityIcons name="fire" size={16} color="#FF8C3B" />
        <Text style={styles.streakText}>{streak} дней</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: 12,
  },
  emoji: { fontSize: 36 },
  avatar: { width: 44, height: 44, borderRadius: 12 },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '800' },
  mood: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
