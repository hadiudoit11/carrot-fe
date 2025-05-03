'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Define the Theme type
export interface Theme {
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
  backgroundMain: string;
  backgroundCard: string;
  backgroundActionCard: string;
  textPrimary: string;
  textSecondary: string;
}

// Create a context for the theme
const ThemeContext = createContext<Theme | null>(null);

// Create a hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  theme: Theme;
}

// Create the ThemeProvider component
export default function ThemeProvider({ children, theme }: ThemeProviderProps) {
  // Apply theme variables to CSS variables
  React.useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', theme.brandPrimary);
    document.documentElement.style.setProperty('--brand-secondary', theme.brandSecondary);
    document.documentElement.style.setProperty('--brand-accent', theme.brandAccent);
    document.documentElement.style.setProperty('--background-main', theme.backgroundMain);
    document.documentElement.style.setProperty('--background-card', theme.backgroundCard);
    document.documentElement.style.setProperty('--background-action-card', theme.backgroundActionCard);
    document.documentElement.style.setProperty('--text-primary', theme.textPrimary);
    document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
} 