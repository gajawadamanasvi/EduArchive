import React, { createContext, useContext, useState, useEffect } from 'react';

export const COLOR_PALETTES = [
  {
    id: 'midnight',
    name: 'Midnight Sapphire',
    mode: 'dark',
    tag: 'Classic Dark',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    bg: '#0b0f17',
    swatches: ['#3b82f6', '#8b5cf6', '#10b981'],
    desc: 'Deep obsidian with electric sapphire and purple glows'
  },
  {
    id: 'emerald',
    name: 'Emerald Academy',
    mode: 'dark',
    tag: 'Institutional',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#fbbf24',
    bg: '#06130d',
    swatches: ['#10b981', '#059669', '#fbbf24'],
    desc: 'Prestigious collegiate emerald and warm gold seals'
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Violet',
    mode: 'dark',
    tag: 'AI Futuristic',
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#06b6d4',
    bg: '#0d0819',
    swatches: ['#a855f7', '#ec4899', '#06b6d4'],
    desc: 'High-tech neon nebula with purple and magenta highlights'
  },
  {
    id: 'ocean',
    name: 'Oceanic Teal',
    mode: 'dark',
    tag: 'Modern Maritime',
    primary: '#06b6d4',
    secondary: '#0284c7',
    accent: '#10b981',
    bg: '#06121a',
    swatches: ['#06b6d4', '#0284c7', '#3b82f6'],
    desc: 'Crisp deep cyan and oceanic turquoise palette'
  },
  {
    id: 'light-azure',
    name: 'Snow Pearl',
    mode: 'light',
    tag: 'Clean Light',
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#059669',
    bg: '#f8fafc',
    swatches: ['#2563eb', '#7c3aed', '#059669'],
    desc: 'Crisp, high-contrast pearl white with royal azure'
  },
  {
    id: 'light-amber',
    name: 'Ivory Gold',
    mode: 'light',
    tag: 'Warm Parchment',
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#1e3a8a',
    bg: '#faf7f2',
    swatches: ['#d97706', '#b45309', '#1e3a8a'],
    desc: 'Warm collegiate ivory with amber bronze highlights'
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [paletteId, setPaletteIdState] = useState(() => {
    const saved = localStorage.getItem('eduarchive_palette');
    if (COLOR_PALETTES.some(p => p.id === saved)) return saved;
    return 'midnight'; // default palette
  });

  const activePalette = COLOR_PALETTES.find(p => p.id === paletteId) || COLOR_PALETTES[0];
  const theme = activePalette.mode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-palette', paletteId);
    document.body.className = `theme-${theme} palette-${paletteId}`;
    localStorage.setItem('eduarchive_palette', paletteId);
    localStorage.setItem('eduarchive_theme', theme);
  }, [paletteId, theme]);

  const setPalette = (id) => {
    if (COLOR_PALETTES.some(p => p.id === id)) {
      setPaletteIdState(id);
    }
  };

  const setTheme = (mode) => {
    if (mode === 'light') {
      if (activePalette.mode !== 'light') {
        setPaletteIdState('light-azure');
      }
    } else if (mode === 'dark') {
      if (activePalette.mode !== 'dark') {
        setPaletteIdState('midnight');
      }
    }
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setPaletteIdState('light-azure');
    } else {
      setPaletteIdState('midnight');
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      palette: paletteId,
      activePalette,
      palettes: COLOR_PALETTES,
      setPalette,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

