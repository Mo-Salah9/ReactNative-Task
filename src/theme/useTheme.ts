import { useColorScheme } from 'react-native';

export type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  cardBack: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  shadow: string;
};

const light: Palette = {
  background: '#F4F5FA',
  surface: '#FFFFFF',
  surfaceMuted: '#E7E9F2',
  cardBack: '#EEF0FF',
  text: '#1B1D29',
  textMuted: '#646A82',
  border: '#DCDFEA',
  primary: '#4F5BD5',
  onPrimary: '#FFFFFF',
  success: '#1B8F59',
  danger: '#D03F3F',
  shadow: '#1B1D29',
};

const dark: Palette = {
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceMuted: '#2A2E3D',
  cardBack: '#232845',
  text: '#F2F3F8',
  textMuted: '#9AA0B8',
  border: '#2E3242',
  primary: '#6B76EC',
  onPrimary: '#FFFFFF',
  success: '#2FA872',
  danger: '#E05858',
  shadow: '#000000',
};

export type Theme = { colors: Palette; isDark: boolean };

export function useTheme(): Theme {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
