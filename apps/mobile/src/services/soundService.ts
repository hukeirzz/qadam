import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const SOUND_KEY = 'qadam_sound_enabled';

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

// Клики — едва слышные, звуки обратной связи (ответы/результаты) — заметные
const VOLUMES: Record<SoundName, number> = {
  correct: 0.5,
  wrong: 0.5,
  complete: 0.55,
  fail: 0.5,
  tap: 0.1,
  gem: 0.5,
  level_up: 0.55,
  streak: 0.5,
  unlock: 0.55,
};

let soundEnabled = true;

/** Вызывается один раз при старте приложения. */
export async function initSounds() {
  try {
    const s = await AsyncStorage.getItem(SOUND_KEY);
    soundEnabled = s !== 'false';
  } catch {}
  try {
    // Играть даже при беззвучном режиме iOS
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch (e) {
    console.warn('setAudioModeAsync failed', e);
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(v: boolean) {
  soundEnabled = v;
  AsyncStorage.setItem(SOUND_KEY, String(v)).catch(() => {});
}

/** Лёгкая вибрация — обратная связь на нажатие кнопки. */
export function vibrate() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/**
 * Проиграть эффект (+ вибрация, если не отключена вторым аргументом).
 * На каждый вызов создаётся одноразовый плеер — это надёжнее, чем
 * перезапуск общего (у expo-audio повторный play после окончания капризный).
 */
export function playSound(name: SoundName, withVibration = true) {
  if (withVibration) vibrate();
  if (!soundEnabled) return;
  try {
    const player = createAudioPlayer(SOURCES[name]);
    player.volume = VOLUMES[name];
    player.play();
    // Освобождаем нативный плеер после проигрывания (звуки короче 2 сек)
    setTimeout(() => {
      try {
        player.remove();
      } catch {}
    }, 4000);
  } catch (e) {
    console.warn('playSound failed', e);
  }
}
