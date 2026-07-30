import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Rank } from '@qadam/business-logic';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RankBadge } from '../components/ui/RankBadge';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Premium'>;

const FEATURES = [
  'Расширенные острова по всем предметам',
  'Сложные задания для высокого балла на ОРТ',
  'Приоритетный доступ к новым темам',
  'Реальные вопросы ОРТ',
];

const PREMIUM_RANKS: Rank[] = ['C', 'B', 'A', 'S'];
const premiumPetImage = require('../../assets/premiumpet.png');

const REFERRAL_GOAL = 4;
const GEM_COST = 200;
const GEMS_PER_FRIEND = GEM_COST / REFERRAL_GOAL;
const TELEGRAM_URL = 'https://t.me/hukeirzz';
const MBANK_URL = 'https://app.mbank.kg/qr/#00020101021132440012c2c.mbank.kg01020210129965058804441302125204999953034175909DASTAN%20T.63040666';
const MBANK_PHONE = '+996 505 880 444';
const PREMIUM_PRICE = '5000 сом';

export function PremiumScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const premiumUnlocked = useAppStore((s) => s.premiumUnlocked);
  const gems = useAppStore((s) => s.gems);
  const unlockPremiumWithGems = useAppStore((s) => s.unlockPremiumWithGems);
  const canUnlockWithGems = gems >= GEM_COST;
  const friendsCount = Math.min(REFERRAL_GOAL, Math.floor(gems / GEMS_PER_FRIEND));
  const [phoneCopied, setPhoneCopied] = useState(false);

  const handleGemUnlock = () => {
    vibrate();
    Alert.alert(
      'Обменять кристаллы?',
      `Будет списано ${GEM_COST} 💎 в обмен на Premium доступ. Это действие необратимо.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Обменять',
          onPress: () => {
            const ok = unlockPremiumWithGems();
            if (ok) {
              Alert.alert('🎉 Premium активирован!', 'Поздравляем! Все острова теперь доступны.');
            }
          },
        },
      ],
    );
  };

  const openTelegram = () => {
    vibrate();
    Linking.openURL(TELEGRAM_URL).catch(() =>
      Alert.alert('Ошибка', 'Не удалось открыть Telegram'),
    );
  };

  const openMbank = () => {
    vibrate();
    Linking.openURL(MBANK_URL).catch(() =>
      Alert.alert('Ошибка', 'Не удалось открыть M-Bank'),
    );
  };

  const copyPhone = async () => {
    vibrate();
    await Clipboard.setStringAsync(MBANK_PHONE.replace(/\s/g, ''));
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 1500);
  };

  const REFERRAL_STEPS = [
    'Пригласи друга в Qadam.',
    'Друг покупает Premium.',
    'Напиши в Telegram свой аккаунт и email друга, который оплатил Premium.',
    'В течение 24 часов тебе начислят 50 💎.',
    `Накопи ${GEM_COST} 💎 (${REFERRAL_GOAL} друга) и получи Premium бесплатно.`,
  ];

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => { vibrate(); navigation.goBack(); }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Премиум-подписка</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.crownAvatar}>
                <Image source={premiumPetImage} style={styles.crownPetImg} resizeMode="cover" />
              </View>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroTitle}>Премиум доступ</Text>
                <Text style={styles.heroDuration}>Действует 1 год</Text>
              </View>
            </View>

            <Text style={styles.heroDesc}>
              Полный доступ ко всем функциям и рангам
            </Text>

            <View style={styles.divider} />

            <Text style={styles.checklistTitle}>Что входит в подписку</Text>
            {FEATURES.map((f) => (
              <View key={f} style={styles.checkRow}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={13} color="#fff" />
                </View>
                <Text style={styles.checkText}>{f}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.rankRow}>
              {PREMIUM_RANKS.map((r) => (
                <View key={r} style={styles.rankItem}>
                  <RankBadge rank={r} size="md" />
                  <Text style={styles.rankItemLabel}>Ранг {r}</Text>
                </View>
              ))}
            </View>
          </View>

          {premiumUnlocked ? (
            <View style={styles.unlockedBadge}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.unlockedText}>Premium активирован!</Text>
            </View>
          ) : (
            <>
              {/* ── Способ оплаты ── */}
              <Text style={styles.sectionLabel}>Способ оплаты — M-Bank</Text>
              <View style={styles.card}>
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Подписка на 1 год</Text>
                    <Text style={styles.priceSub}>Доступ ко всем 4 рангам</Text>
                  </View>
                  <Text style={styles.price}>{PREMIUM_PRICE}</Text>
                </View>
                <View style={styles.divider} />

                <Text style={styles.instructions}>
                  {'📞 Оплата по номеру телефона\n'}
                  {'1. Откройте любой банковский сервис (M-Bank, Optima24, Bakai24, DemirBank и др.).\n'}
                  {'2. В разделе переводов выберите банк M-Bank.\n'}
                  {'3. Введите номер:'}
                </Text>

                {/* Копируемый номер телефона */}
                <Pressable style={styles.copyRow} onPress={copyPhone}>
                  <Text style={styles.copyPhone}>{phoneCopied ? 'Скопировано' : MBANK_PHONE}</Text>
                  <Ionicons
                    name={phoneCopied ? 'checkmark' : 'copy-outline'}
                    size={18}
                    color={colors.purpleGlow}
                  />
                </Pressable>

                <Text style={styles.instructions}>
                  {`4. Переведите ${PREMIUM_PRICE}.\n\n`}
                  {'✉️ После оплаты отправьте чек и свой email в Telegram — доступ откроется в течение 24ч'}
                </Text>

                {/* Кнопка оплаты через M-Bank */}
                <Pressable style={styles.telegramBtn} onPress={openMbank}>
                  <LinearGradient
                    colors={['#34C759', '#1FA347']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.telegramGradient}
                  >
                    <Ionicons name="card" size={18} color="#FFFFFF" />
                    <Text style={styles.telegramText}>Оплатить через M-Bank</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable style={styles.telegramBtn} onPress={openTelegram}>
                  <LinearGradient
                    colors={['#229ED9', '#1A7EC0']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.telegramGradient}
                  >
                    <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                    <Text style={styles.telegramText}>Написать в Telegram</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* ── Реферальная программа ── */}
              <View style={styles.referralCard}>
                <Text style={styles.sectionLabel}>Реферальная программа</Text>
                <View style={styles.referralCompactRow}>
                  <View style={styles.referralIconBox}>
                    <Ionicons name="people" size={22} color={colors.purpleGlow} />
                  </View>
                  <Text style={styles.referralCompactText}>
                    Пригласите <Text style={styles.referralHighlight}>{REFERRAL_GOAL} друзей</Text> и получите Premium{' '}
                    <Text style={styles.referralGold}>бесплатно!</Text>
                  </Text>
                  <View style={styles.referralCountWrap}>
                    <Text style={styles.referralCount}>{friendsCount} / {REFERRAL_GOAL}</Text>
                    <Text style={styles.referralCountLabel}>друзей купили</Text>
                  </View>
                </View>

                {canUnlockWithGems && (
                  <Pressable onPress={handleGemUnlock}>
                    <LinearGradient
                      colors={['#5B9DFF', '#3B6FCC']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.claimBtn}
                    >
                      <Ionicons name="gift" size={18} color="#fff" />
                      <Text style={styles.claimBtnText}>Получить Premium бесплатно</Text>
                    </LinearGradient>
                  </Pressable>
                )}

                <View style={styles.divider} />

                <Text style={styles.checklistTitle}>Как это работает</Text>
                {REFERRAL_STEPS.map((step, i) => (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 8 },

  heroCard: { backgroundColor: colors.surfaceGlass, borderRadius: 22, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.borderMuted, gap: 14 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crownAvatar: {
    width: 68, height: 68, borderRadius: 26,
    backgroundColor: 'rgba(255,194,75,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,194,75,0.4)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  crownPetImg: { width: '100%', height: '100%' },
  heroTitleWrap: { flex: 1 },
  heroTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  heroDuration: { color: colors.purpleGlow, fontSize: 13, fontWeight: '700', marginTop: 2 },
  heroDesc: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },

  checklistTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  checkIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { flex: 1, color: colors.textMuted, fontSize: 13.5, lineHeight: 18 },

  rankRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rankItem: { alignItems: 'center', gap: 6 },
  rankItemLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },

  card: { backgroundColor: colors.surfaceGlass, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderMuted, gap: 12 },

  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  priceSub: { color: colors.textMuted, fontSize: 12.5, marginTop: 2 },
  price: { color: colors.text, fontSize: 22, fontWeight: '800' },

  instructions: { color: colors.textMuted, fontSize: 13, lineHeight: 22 },

  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(144,71,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.4)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  copyPhone: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  telegramBtn: { borderRadius: 14, overflow: 'hidden' },
  telegramGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  telegramText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  referralCard: { backgroundColor: colors.surfaceGlass, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderMuted, gap: 12 },
  referralCompactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  referralIconBox: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(144,71,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  referralCompactText: { flex: 1, color: colors.textMuted, fontSize: 13.5, lineHeight: 19 },
  referralHighlight: { color: colors.purpleGlow, fontWeight: '800' },
  referralGold: { color: '#FFC24B', fontWeight: '800' },
  referralCountWrap: { alignItems: 'flex-end' },
  referralCount: { color: colors.text, fontSize: 15, fontWeight: '800' },
  referralCountLabel: { color: colors.textDim, fontSize: 11, fontWeight: '600' },

  claimBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  claimBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  stepBadge: {
    width: 22, height: 22, borderRadius: 11, marginTop: 1, flexShrink: 0,
    backgroundColor: 'rgba(144,71,255,0.2)',
    borderWidth: 1, borderColor: colors.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { color: colors.purpleGlow, fontSize: 11, fontWeight: '800' },
  stepText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 },

  divider: { height: 1, backgroundColor: colors.borderMuted },

  unlockedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(46,229,157,0.12)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(46,229,157,0.3)', marginBottom: 14 },
  unlockedText: { color: colors.success, fontSize: 16, fontWeight: '700' },
});
