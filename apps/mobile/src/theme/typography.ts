// Единый шрифт приложения — Nunito. Все веса, которые реально используются в
// коде (fontWeight: '400'..'900'), смэплены на конкретные файлы шрифта,
// загруженные в App.tsx через @expo-google-fonts/nunito.
const FONT_BY_WEIGHT: Record<string, string> = {
  '200': 'Nunito_200ExtraLight',
  '300': 'Nunito_300Light',
  '400': 'Nunito_400Regular',
  normal: 'Nunito_400Regular',
  '500': 'Nunito_500Medium',
  '600': 'Nunito_600SemiBold',
  '700': 'Nunito_700Bold',
  bold: 'Nunito_700Bold',
  '800': 'Nunito_800ExtraBold',
  '900': 'Nunito_900Black',
};

export function nunitoFamily(weight?: string | number | null): string {
  if (weight == null) return FONT_BY_WEIGHT['400'];
  return FONT_BY_WEIGHT[String(weight)] ?? FONT_BY_WEIGHT['400'];
}
