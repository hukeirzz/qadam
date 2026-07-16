import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors } from '../theme/colors';

export function PracticeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScreenBackground>
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emoji}>💬</Text>
        <Text style={styles.title}>Общение</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Скоро</Text>
        </View>
        <Text style={styles.desc}>
          Здесь появятся чат с учителями,{'\n'}
          обсуждения тем и помощь сообщества
        </Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(144,71,255,0.18)',
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.35)',
  },
  badgeText: {
    color: colors.purpleGlow, fontSize: 14, fontWeight: '700',
  },
  desc: {
    color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22,
  },
});
