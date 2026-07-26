import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { colors } from '../theme/colors';
import { isSoundEnabled, setSoundEnabled, playSound, vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const toggleSound = (v: boolean) => {
    vibrate();
    setSoundOn(v);
    setSoundEnabled(v);
    if (v) playSound('correct'); // короткая демонстрация звука
  };

  return (
    <ScreenBackground>
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Настройки</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>Язык: Русский</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>Тема: Тёмная</Text>
        </View>
        <View style={[styles.row, styles.rowBetween]}>
          <Text style={styles.rowText}>Звуки</Text>
          <Switch
            value={soundOn}
            onValueChange={toggleSound}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.purple }}
            thumbColor={colors.text}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>Напоминания: Вкл</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  back: { marginBottom: 16, alignSelf: 'flex-start' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 24 },
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowText: { color: colors.text, fontSize: 16 },
});
