/**
 * Theme provider and hooks
 */

import { lightColors, darkColors, type ColorScheme } from './colors';
import { spacing, type Spacing } from './spacing';
import { typography, type Typography } from './typography';
import { useThemeContext } from './ThemeContext';

export interface Theme {
  colors: ColorScheme;
  spacing: Spacing;
  typography: Typography;
  isDark: boolean;
}

export function useTheme(): Theme {
  const { effectiveTheme } = useThemeContext();
  const isDark = effectiveTheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    spacing,
    typography,
    isDark,
  };
}

