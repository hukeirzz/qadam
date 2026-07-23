import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { vibrate } from '../../services/soundService';

interface Props {
  onCompetitionsPress: () => void;
  onRatingPress: () => void;
}

export function CompetitionsBanner({ onCompetitionsPress, onRatingPress }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.card, { borderColor: 'rgba(255,209,102,0.4)' }]}
        onPress={() => { vibrate(); onCompetitionsPress(); }}
      >
        <Ionicons name="trophy" size={22} color={colors.gold} />
        <Text style={styles.title}>Соревнования</Text>
      </Pressable>
      <Pressable
        style={[styles.card, { borderColor: 'rgba(144,71,255,0.4)' }]}
        onPress={() => { vibrate(); onRatingPress(); }}
      >
        <Ionicons name="podium" size={22} color={colors.purpleGlow} />
        <Text style={styles.title}>Рейтинг</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
