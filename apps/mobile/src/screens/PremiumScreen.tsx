import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Premium'>;


const FEATURES = [
  { icon: '🗺️', text: 'Расширенные острова по всем предметам' },
  { icon: '📊', text: 'Сложные задания для высокого балла на ОРТ' },
  { icon: '⚡', text: 'Приоритетный доступ к новым темам' },
  { icon: '📝', text: 'Реальные вопросы ОРТ' },
];

const GEM_COST = 200;
const TELEGRAM_URL = 'https://t.me/hukeirzz';
const MBANK_PHONE = '+996 505 880 444';

const PRICE_TIERS = [
  { id: '1m', label: '1 месяц', price: '299 сом', popular: false },
  { id: '6m', label: '6 месяцев', price: '1490 сом', popular: true },
  { id: '12m', label: '12 месяцев', price: '2490 сом', popular: false },
] as const;

export function PremiumScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const premiumUnlocked = useAppStore((s) => s.premiumUnlocked);
  const gems = useAppStore((s) => s.gems);
  const unlockPremiumWithGems = useAppStore((s) => s.unlockPremiumWithGems);
  const canUnlockWithGems = gems >= GEM_COST;
  const [tierId, setTierId] = useState<(typeof PRICE_TIERS)[number]['id']>('6m');
  const tier = PRICE_TIERS.find((t) => t.id === tierId)!;

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

  const copyPhone = async () => {
    vibrate();
    await Clipboard.setStringAsync(MBANK_PHONE.replace(/\s/g, ''));
    Alert.alert('Скопировано', `Номер ${MBANK_PHONE} скопирован`);
  };

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => { vibrate(); navigation.goBack(); }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Продвинутый уровень</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroIcon}>💎</Text>
            <Text style={styles.heroTitle}>Продвинутый уровень</Text>
            <Text style={styles.heroSub}>
              Более сложные задания для тех, кто готов к вызову
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresCard}>
            {FEATURES.map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {premiumUnlocked ? (
            <View style={styles.unlockedBadge}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.unlockedText}>Premium активирован!</Text>
            </View>
          ) : (
            <>
              {/* ── Способ 1: оплата ── */}
              <Text style={styles.sectionLabel}>Способ 1 — Оплата M-Bank</Text>
              <View style={styles.card}>
                <View style={styles.tierRow}>
                  {PRICE_TIERS.map((t) => (
                    <Pressable
                      key={t.id}
                      style={[styles.tierTile, tierId === t.id && styles.tierTileActive]}
                      onPress={() => { vibrate(); setTierId(t.id); }}
                    >
                      {t.popular ? (
                        <View style={styles.tierBadge}>
                          <Text style={styles.tierBadgeText}>Популярно</Text>
                        </View>
                      ) : null}
                      <Text style={styles.tierLabel}>{t.label}</Text>
                      <Text style={styles.tierPrice}>{t.price}</Text>
                    </Pressable>
                  ))}
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
                  <Text style={styles.copyPhone}>{MBANK_PHONE}</Text>
                  <Ionicons name="copy-outline" size={18} color={colors.purpleGlow} />
                </Pressable>

                <Text style={styles.instructions}>
                  {`4. Переведите ${tier.price} (тариф «${tier.label}»).\n\n`}
                  {'✉️ После оплаты отправьте чек, выбранный тариф и свой email в Telegram — доступ откроется в течение 24ч'}
                </Text>

                <Pressable style={styles.telegramBtn} onPress={openTelegram}>
                  <LinearGradient
                    colors={['#229ED9', '#1A7EC0']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.telegramGradient}
                  >
                    <Ionicons name="paper-plane" size={18} color={colors.text} />
                    <Text style={styles.telegramText}>Написать в Telegram</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* ── Способ 2: кристаллы ── */}
              <Text style={styles.sectionLabel}>Способ 2 — Кристаллы 💎</Text>
              <View style={styles.card}>
                {/* Gem progress */}
                <View style={styles.gemHeader}>
                  <View style={styles.gemCountWrap}>
                    <Ionicons name="diamond" size={22} color="#5B9DFF" />
                    <Text style={styles.gemCount}>{gems}</Text>
                    <Text style={styles.gemTotal}>/ {GEM_COST} 💎</Text>
                  </View>
                  <Text style={styles.gemPct}>
                    {Math.min(100, Math.round((gems / GEM_COST) * 100))}%
                  </Text>
                </View>
                <View style={styles.gemTrack}>
                  <View
                    style={[
                      styles.gemFill,
                      { width: `${Math.min(100, (gems / GEM_COST) * 100)}%` },
                    ]}
                  />
                </View>

                {canUnlockWithGems ? (
                  <>
                    <Text style={styles.gemReadyText}>
                      У тебя достаточно кристаллов! Обменяй на Premium.
                    </Text>
                    <Pressable onPress={handleGemUnlock}>
                      <LinearGradient
                        colors={['#5B9DFF', '#3B6FCC']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.gemUnlockBtn}
                      >
                        <Ionicons name="diamond" size={18} color="#fff" />
                        <Text style={styles.gemUnlockText}>
                          Открыть за {GEM_COST} 💎
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </>
                ) : (
                  <Text style={styles.gemNeedText}>
                    Нужно ещё <Text style={styles.gemNeedBold}>{GEM_COST - gems} 💎</Text> — зарабатывай через рефералов (см. ниже)
                  </Text>
                )}
              </View>

              {/* ── Как зарабатывать кристаллы ── */}
              <Text style={styles.sectionLabel}>Как зарабатывать кристаллы</Text>
              <View style={styles.card}>
                <View style={styles.referralHero}>
                  <Text style={styles.referralIcon}>🤝</Text>
                  <View style={styles.referralHeroText}>
                    <Text style={styles.referralTitle}>Реферальная программа</Text>
                    <Text style={styles.referralSub}>
                      Получай 50 💎 за каждого друга, который купит Premium
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <Text style={styles.referralHowLabel}>Как это работает:</Text>
                {[
                  { step: '1', text: 'Пригласи друга в Qadam.' },
                  { step: '2', text: 'Друг покупает Premium за 1000 сом.' },
                  { step: '3', text: 'Напиши в Telegram свой аккаунт и email друга, который оплатил Premium.' },
                  { step: '4', text: 'В течение 24 часов тебе начислят 50 💎.' },
                  { step: '5', text: 'Накопи 200 💎 и получи Premium бесплатно.' },
                ].map((s) => (
                  <View key={s.step} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNum}>{s.step}</Text>
                    </View>
                    <Text style={styles.stepText}>{s.text}</Text>
                  </View>
                ))}
                <View style={styles.divider} />
                {[
                  { label: '1 друг', value: '50 💎' },
                  { label: '2 друга', value: '100 💎' },
                  { label: '3 друга', value: '150 💎' },
                  { label: '4 друга', value: '200 💎 = Premium 🎉', highlight: true },
                ].map((row) => (
                  <View key={row.label} style={styles.gemTierRow}>
                    <Text style={styles.gemTierLabel}>💎 {row.label}</Text>
                    <Text style={[styles.gemTierValue, row.highlight && styles.gemTierValueHi]}>
                      = {row.value}
                    </Text>
                  </View>
                ))}

                <Pressable style={styles.telegramBtn} onPress={openTelegram}>
                  <LinearGradient
                    colors={['#229ED9', '#1A7EC0']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.telegramGradient}
                  >
                    <Ionicons name="paper-plane" size={18} color={colors.text} />
                    <Text style={styles.telegramText}>Написать в Telegram</Text>
                  </LinearGradient>
                </Pressable>
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
  scroll: { paddingHorizontal: 16 },

  hero: { alignItems: 'center', paddingVertical: 20 },
  heroIcon: { fontSize: 52 },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  heroSub: { color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20, fontSize: 14, paddingHorizontal: 16 },

  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 8 },

  islandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  islandCard: { width: '47%', backgroundColor: colors.surfaceGlass, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.borderMuted },
  islandImgWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  islandImg: { width: 200, height: 200 },
  islandImgLocked: { opacity: 0.35 },
  islandOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  islandTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  islandSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  featuresCard: { backgroundColor: colors.surfaceGlass, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderMuted, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20 },
  featureText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '500', lineHeight: 18 },

  card: { backgroundColor: colors.surfaceGlass, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderMuted, gap: 12 },

  priceRow: { alignItems: 'center', gap: 4 },
  price: { color: colors.text, fontSize: 32, fontWeight: '800' },
  priceNote: { color: colors.textDim, fontSize: 12 },

  tierRow: { flexDirection: 'row', gap: 8 },
  tierTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tierTileActive: { borderColor: colors.purple, backgroundColor: 'rgba(144,71,255,0.15)' },
  tierBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.purple,
  },
  tierBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  tierLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 4 },
  tierPrice: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 4 },

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
  telegramText: { color: colors.text, fontSize: 15, fontWeight: '700' },

  gemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gemCountWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gemCount: { color: colors.text, fontSize: 22, fontWeight: '800' },
  gemTotal: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  gemPct: { color: '#5B9DFF', fontSize: 14, fontWeight: '700' },
  gemTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  gemFill: { height: '100%', backgroundColor: '#5B9DFF', borderRadius: 4 },
  gemReadyText: { color: '#4ADE80', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  gemUnlockBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  gemUnlockText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  gemNeedText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  gemNeedBold: { color: '#5B9DFF', fontWeight: '700' },

  referralHero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  referralIcon: { fontSize: 36 },
  referralHeroText: { flex: 1 },
  referralTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  referralSub: { color: '#5B9DFF', fontSize: 13, fontWeight: '600', marginTop: 2 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(144,71,255,0.25)', borderWidth: 1, borderColor: colors.purple, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNum: { color: colors.purpleGlow, fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 20 },

  calcRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  calcText: { color: colors.textMuted, fontSize: 14 },
  calcBold: { color: '#4ADE80', fontSize: 14, fontWeight: '800' },

  referralHowLabel: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  gemTierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gemTierLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  gemTierValue: { color: '#5B9DFF', fontSize: 14, fontWeight: '800' },
  gemTierValueHi: { color: '#4ADE80' },

  divider: { height: 1, backgroundColor: colors.borderMuted },

  unlockedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(46,229,157,0.12)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(46,229,157,0.3)', marginBottom: 14 },
  unlockedText: { color: colors.success, fontSize: 16, fontWeight: '700' },
});
