import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
const THEME_KEY = 'acity-pokedex.theme.v1';

function storedTheme(): ThemePreference {
  const value = localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function applyTheme(preference: ThemePreference): void {
  const dark =
    preference === 'dark' ||
    (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

interface ThemeState {
  readonly preference: ThemePreference;
  readonly setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: typeof localStorage === 'undefined' ? 'system' : storedTheme(),
  setPreference: (preference) => {
    localStorage.setItem(THEME_KEY, preference);
    applyTheme(preference);
    set({ preference });
  },
}));

export function initializeTheme(): () => void {
  const preference = storedTheme();
  applyTheme(preference);
  const media = matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    if (storedTheme() === 'system') applyTheme('system');
  };
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
