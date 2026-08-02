import React, { useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text } from '../components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { Rank } from '@qadam/business-logic';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { RankBadge } from '../components/ui/RankBadge';
import { subjects } from '../data/subjects';
import { RANK_ORDER } from '../data/rankProgress';
import { petImages } from '../assets/petImages';
import { islandImages } from '../assets/islandImages';

const PAW_LOGO = require('../../assets/logo1.png');
const PREMIUM_PET = require('../../assets/premiumpet.png');
const PREMIUM_RANKS: Rank[] = ['B', 'A', 'S'];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function FeatureRow({
  icon,
  color,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIconWrap, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{text}</Text>
      </View>
    </View>
  );
}

function StepRow({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{index}</Text>
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{text}</Text>
      </View>
    </View>
  );
}

function PageHeader({ page }: { page: number }) {
  return (
    <View style={styles.header}>
      <View style={styles.logoBlock}>
        <Image source={PAW_LOGO} style={styles.pawLogo} resizeMode="contain" />
        <Text style={styles.brand}>Qadam</Text>
      </View>
      <View style={styles.counterChip}>
        <Text style={styles.counterText}>{page + 1} / 4</Text>
      </View>
    </View>
  );
}

function PageOne() {
  return (
    <>
      <Text style={styles.title}>Как устроен Qadam</Text>
      <Text style={styles.subtitle}>Твоя карта обучения к высоким баллам ОРТ</Text>

      <View style={styles.islandsCard}>
        <View style={styles.islandsRow}>
          {subjects.map((s) => (
            <Image
              key={s.id}
              source={islandImages[s.id]}
              style={styles.islandThumb}
              resizeMode="contain"
            />
          ))}
        </View>
        <Text style={styles.islandsTitle}>5 разделов</Text>
        <Text style={styles.islandsDesc}>{subjects.map((s) => s.title).join(', ')}</Text>
      </View>

      <View style={styles.card}>
        <FeatureRow
          icon="map-outline"
          color="#3B8BFF"
          title="Острова и темы"
          text="Каждый раздел состоит из островов и небольших тем"
        />
      </View>

      <View style={styles.islandsCard}>
        <View style={styles.premiumRanksRow}>
          {RANK_ORDER.map((r) => (
            <RankBadge key={r} rank={r} size="sm" />
          ))}
        </View>
        <Text style={styles.islandsTitle}>Ранги D → S</Text>
        <Text style={styles.islandsDesc}>
          Чем выше ранг, тем сложнее задания, выше твой уровень и шансы на Золотой Сертификат
        </Text>

        <View style={styles.goldCallout}>
          <Ionicons name="trophy" size={18} color={colors.gold} />
          <Text style={styles.goldCalloutText}>
            Дойди до <Text style={styles.goldCalloutBold}>S ранга</Text> — стань кандидатом на{' '}
            <Text style={styles.goldCalloutBold}>Золотой Сертификат</Text>!
          </Text>
        </View>
      </View>
    </>
  );
}

function PageTwo() {
  return (
    <>
      <Text style={styles.title}>Как проходить тему</Text>
      <Text style={styles.subtitle}>Проходи шаг за шагом и открывай новые островки</Text>

      <View style={styles.heroImageWrap}>
        <Image source={islandImages.geometry} style={styles.heroImage} resizeMode="contain" />
      </View>

      <View style={styles.card}>
        <StepRow index={1} title="Открой тему" text="Начни с первого островка темы" />
        <StepRow index={2} title="Решай задания" text="Выполняй задания шаг за шагом" />
        <StepRow
          index={3}
          title="Получай XP и звёзды"
          text="Собирай награды и открывай следующий островок"
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statCardValue, { color: colors.purple }]}>XP</Text>
          <Text style={styles.statCardLabel}>Опыт за правильные ответы</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={20} color="#FF8C3B" />
          <Text style={styles.statCardLabel}>Серия дней за ежедневные занятия</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="diamond" size={18} color="#63B4FF" />
          <Text style={styles.statCardLabel}>Гемы — внутренняя валюта</Text>
        </View>
      </View>
    </>
  );
}

function PageThree() {
  return (
    <>
      <Text style={styles.title}>Профиль и прогресс</Text>
      <Text style={styles.subtitle}>В профиле собран твой путь и статистика</Text>

      <View style={styles.previewCard}>
        <Image source={petImages.bars} style={styles.previewAvatar} resizeMode="contain" />
        <View style={styles.previewInfo}>
          <View style={styles.previewRankPill}>
            <RankBadge rank="D" size="sm" />
            <Text style={styles.previewRankText}>D ранг</Text>
          </View>
          <View style={styles.previewTrack}>
            <View style={[styles.previewFill, { width: '35%' }]} />
          </View>
          <Text style={styles.previewHint}>XP до следующего ранга</Text>
        </View>
      </View>

      <View style={styles.card}>
        <FeatureRow
          icon="trending-up-outline"
          color={colors.purple}
          title="Опыт и ранг"
          text="Следи за XP и прогрессом до следующего ранга"
        />
        <FeatureRow
          icon="stats-chart-outline"
          color={colors.success}
          title="Статистика"
          text="XP, серия дней и количество пройденных тестов"
        />
        <FeatureRow
          icon="book-outline"
          color="#3B8BFF"
          title="Мои предметы"
          text="Прогресс по каждому разделу отдельно"
        />
        <FeatureRow
          icon="checkmark-done-outline"
          color="#FFB020"
          title="После теста"
          text="Разбор ошибок, повтор темы или переход к следующей"
        />
      </View>
    </>
  );
}

function PageFour() {
  return (
    <>
      <Text style={styles.title}>Premium</Text>
      <Text style={styles.subtitle}>Открой полный доступ ко всем рангам</Text>

      <View style={styles.premiumCard}>
        <Image source={PREMIUM_PET} style={styles.premiumPetImage} resizeMode="contain" />
        <View style={styles.premiumRanksRow}>
          {PREMIUM_RANKS.map((r) => (
            <RankBadge key={r} rank={r} size="sm" />
          ))}
        </View>
        <Text style={styles.premiumRanksText}>Premium открывает ранги B, A и S</Text>
      </View>

      <View style={styles.card}>
        <FeatureRow
          icon="calendar-outline"
          color="#3B8BFF"
          title="Покупка действует 1 год"
          text="Полный доступ ко всем рангам и заданиям"
        />
        <FeatureRow
          icon="pricetag-outline"
          color={colors.gold}
          title="Общая стоимость — 5000 сом"
          text="Оплата через M-Bank"
        />
        <FeatureRow
          icon="people-outline"
          color={colors.success}
          title="Пригласи 4 друзей"
          text="Если они купят Premium — получишь его бесплатно"
        />
      </View>

      <LinearGradient
        colors={[colors.purple, '#6B2FD4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.motivateCard}
      >
        <Ionicons name="rocket" size={24} color="#FFFFFF" />
        <Text style={styles.motivateTitle}>Твой путь начинается сейчас</Text>
        <Text style={styles.motivateText}>
          Учись. Практикуй. Достигай.{'\n'}Каждая пройденная тема — шаг ближе к высокому баллу ОРТ и Золотому Сертификату
        </Text>
      </LinearGradient>
    </>
  );
}

const PAGES = [PageOne, PageTwo, PageThree, PageFour];

export function OnboardingScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const goToPetName = () => navigation.replace('PetName');

  const handleNext = () => {
    if (page >= PAGES.length - 1) {
      goToPetName();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setPage(next);
  };

  return (
    <View style={styles.root}>
      <PageHeader page={page} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.flex}
      >
        {PAGES.map((PageComponent, i) => (
          <ScrollView
            key={i}
            style={{ width }}
            contentContainerStyle={styles.page}
            showsVerticalScrollIndicator={false}
          >
            <PageComponent />
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <Pressable onPress={handleNext}>
          <LinearGradient
            colors={[colors.purple, '#6B2FD4']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.nextBtnWrap}
          >
            <Text style={styles.nextBtnText}>
              {page >= PAGES.length - 1 ? 'Начать' : 'Далее'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: 8,
  },
  logoBlock: { alignItems: 'center' },
  pawLogo: { width: 36, height: 36, marginBottom: 2 },
  brand: { color: colors.purple, fontSize: 20, fontWeight: '800' },
  counterChip: {
    position: 'absolute',
    right: spacing.lg,
    top: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: { color: colors.purple, fontSize: 13, fontWeight: '800' },
  page: {
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    gap: 16,
    marginBottom: 14,
  },
  islandsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  islandsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  islandThumb: {
    width: 52,
    height: 52,
  },
  islandsTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  islandsDesc: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
  },
  goldCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,176,32,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.4)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    width: '100%',
  },
  goldCalloutText: {
    flex: 1,
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  goldCalloutBold: {
    color: colors.gold,
    fontWeight: '800',
  },
  heroImageWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  heroImage: {
    width: 150,
    height: 150,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: { color: colors.text, fontSize: 14.5, fontWeight: '800', marginBottom: 2 },
  featureDesc: { color: colors.textMuted, fontSize: 12.5, lineHeight: 17 },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statCardValue: { fontSize: 15, fontWeight: '800' },
  statCardLabel: { color: colors.textMuted, fontSize: 10.5, fontWeight: '600', textAlign: 'center' },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  previewAvatar: { width: 60, height: 60, flexShrink: 0 },
  previewInfo: { flex: 1 },
  previewRankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingRight: 10,
    paddingLeft: 3,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(144,71,255,0.18)',
    borderWidth: 1,
    borderColor: colors.purple,
    marginBottom: 8,
  },
  previewRankText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  previewTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ECE9F7',
    overflow: 'hidden',
    marginBottom: 6,
  },
  previewFill: { height: '100%', borderRadius: 4, backgroundColor: colors.purple },
  previewHint: { color: colors.textMuted, fontSize: 11.5, fontWeight: '600' },
  premiumCard: {
    backgroundColor: 'rgba(255,176,32,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.35)',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  premiumPetImage: {
    width: 110,
    height: 110,
    marginBottom: 4,
  },
  premiumRanksRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  premiumRanksText: { color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  motivateCard: {
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  motivateTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  motivateText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 8,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.purple,
  },
  nextBtnWrap: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
