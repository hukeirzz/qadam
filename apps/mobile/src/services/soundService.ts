import { setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const SOURCES = {
  /** Правильный ответ в квизе */
  correct: require('../../assets/sounds/correct.mp3'),
  /** Неправильный ответ */
  wrong: require('../../assets/sounds/wrong.mp3'),
  /** Квиз завершён */
  complete: require('../../assets/sounds/complete.mp3'),
  /** Провал (сейчас не используется) */
  fail: require('../../assets/sounds/fail.wav'),
  /** Нажатие основных кнопок */
  tap: require('../../assets/sounds/tap.wav'),
  /** Получение кристаллов */
  gem: require('../../assets/sounds/gem.mp3'),
  /** Новый уровень */
  level_up: require('../../assets/sounds/level_up.mp3'),
  /** Продление стрика */
  streak: require('../../assets/sounds/streak.mp3'),
  /** Открытие темы / премиума */
  unlock: require('../../assets/sounds/unlock.mp3'),
} as const;

export type SoundName = keyof typeof SOURCES;

/** Вызывается один раз при старте приложения. */
export async function initSounds() {
  try {
    // Играть даже при беззвучном режиме iOS
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch (e) {
    console.warn('setAudioModeAsync failed', e);
  }
}

/** Лёгкая вибрация — обратная связь на нажатие кнопки. */
export function vibrate() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/**
 * Звуки отключены по просьбе — сама функция и все ~15 вызовов по
 * приложению оставлены нетронутыми (меняется только SoundName), но
 * аудио больше нигде не проигрывается — остаётся только вибрация,
 * если она включена вторым аргументом.
 */
export function playSound(_name: SoundName, withVibration = true) {
  if (withVibration) vibrate();
}
