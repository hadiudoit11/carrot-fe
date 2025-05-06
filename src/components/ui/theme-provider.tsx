"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export interface Theme {
  name: string;
  // Brand colors
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
  // Background colors
  backgroundMain: string;
  backgroundCard: string;
  backgroundDark: string;
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textLight: string;
}

interface ThemeContextType {
  themes: Theme[];
  currentTheme: Theme | null;
  setTheme: (theme: string) => void;
}

// Create a context for custom themes
export const ThemeContext = React.createContext<ThemeContextType>({
  themes: [],
  currentTheme: null,
  setTheme: () => null,
});

export function ThemeProvider({
  themes = [],
  children,
  ...props
}: {
  themes?: Theme[];
  children: React.ReactNode;
  [key: string]: any;
}) {
  // Keep track of the selected theme
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);

  // Function to set theme
  const setThemeHandler = React.useCallback((themeName: string) => {
    // Set next-themes theme for light/dark mode
    if (themeName === "light" || themeName === "dark" || themeName === "system") {
      if (props.setTheme) {
        props.setTheme(themeName);
      }
    }
    
    // Find and set our custom theme
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [themes, props]);

  // Initialize theme
  React.useEffect(() => {
    if (themes.length > 0) {
      // First try to match with the next-themes selection
      if (props.theme) {
        const theme = themes.find(t => t.name === props.theme);
        if (theme) {
          setCurrentTheme(theme);
          return;
        }
      }
      
      // Otherwise, use the default theme
      const defaultTheme = props.defaultTheme || "system";
      const defaultThemeObj = themes.find(t => t.name === defaultTheme) || themes[0];
      setCurrentTheme(defaultThemeObj);
    }
  }, [themes, props.theme, props.defaultTheme]);

  // Apply theme CSS variables when theme changes
  React.useEffect(() => {
    if (currentTheme) {
      // Apply theme variables to document root
      document.documentElement.style.setProperty('--brand-primary', currentTheme.brandPrimary);
      document.documentElement.style.setProperty('--brand-secondary', currentTheme.brandSecondary);
      document.documentElement.style.setProperty('--brand-accent', currentTheme.brandAccent);
      document.documentElement.style.setProperty('--background-main', currentTheme.backgroundMain);
      document.documentElement.style.setProperty('--background-card', currentTheme.backgroundCard);
      document.documentElement.style.setProperty('--background-dark', currentTheme.backgroundDark);
      document.documentElement.style.setProperty('--text-primary', currentTheme.textPrimary);
      document.documentElement.style.setProperty('--text-secondary', currentTheme.textSecondary);
      document.documentElement.style.setProperty('--text-light', currentTheme.textLight);
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        themes, 
        currentTheme, 
        setTheme: setThemeHandler 
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme={props.defaultTheme || "system"}
        enableSystem={props.enableSystem !== false}
        disableTransitionOnChange={props.disableTransitionOnChange}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export const useCustomTheme = () => React.useContext(ThemeContext); 