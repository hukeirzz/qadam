import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { cardTheme, colors, glow } from '../../theme/colors';
import { vibrate } from '../../services/soundService';

interface Props {
  onCompetitionsPress: () => void;
  onRatingPress: () => void;
}

function BannerCard({
  icon,
  iconColor,
  iconBg,
  glowColor,
  title,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  glowColor: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.shadowWrap, { shadowColor: glowColor }]} onPress={onPress}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

export function CompetitionsBanner({ onCompetitionsPress, onRatingPress }: Props) {
  return (
    <View style={styles.row}>
      <BannerCard
        icon="trophy"
        iconColor={colors.gold}
        iconBg="rgba(255,209,102,0.16)"
        glowColor={glow.gold}
        title="Соревнования"
        onPress={() => { vibrate(); onCompetitionsPress(); }}
      />
      <BannerCard
        icon="podium"
        iconColor={colors.purpleGlow}
        iconBg="rgba(144,71,255,0.18)"
        glowColor={glow.purple}
        title="Рейтинг"
        onPress={() => { vibrate(); onRatingPress(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  shadowWrap: {
    flex: 1,
    borderRadius: 16,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: cardTheme.borderSoft,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
});
