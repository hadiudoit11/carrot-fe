import type { Config } from "tailwindcss";
import { colors } from "./src/styles/colors";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['"Cal Sans"', 'system-ui', 'sans-serif'],
        secondary: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand colors
        primary: colors.primary,
        secondary: colors.secondary,
        tertiary: colors.tertiary,
        accent: colors.accent,
        
        // Background colors
        bg: {
          main: colors.bgMain,
          card: colors.bgCard,
          dark: colors.bgDark,
          form: colors.bgForm,
          actionCard: colors.bgActionCard,
          navbar: colors.bgNavbar,
        },
        
        // Border colors
        border: {
          accent: colors.borderAccent,
        },
        
        // Text colors
        text: {
          primary: colors.textPrimary,
          secondary: colors.textSecondary,
          light: colors.textLight,
          tertiary: colors.textTertiary,
        },
        
        // Status colors
        status: {
          success: colors.success,
          warning: colors.warning,
          error: colors.error,
          info: colors.info,
        },
        
        // Effect colors
        blur: {
          primary: colors.radialBlur.primary,
          accent: colors.radialBlur.accent,
          secondary: colors.radialBlur.secondary,
        },
        
        // Grays
        gray: {
          50: colors.gray50,
          100: colors.gray100,
          200: colors.gray200,
          300: colors.gray300,
          400: colors.gray400,
          500: colors.gray500,
          600: colors.gray600,
          700: colors.gray700,
          800: colors.gray800,
          900: colors.gray900,
        },
      },
      boxShadow: {
        'accent-offset': `8px 8px 0 ${colors.shadowAccent}`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        'onboarding-background': "url('/public/onboading_background.jpg')",
      },
    },
  },
  plugins: [
    plugin(function({ addBase }) {
      addBase({
        '.radial-blur-tl': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.radial-blur-tl::before': {
          content: '""',
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: colors.radialBlur.primary,
          filter: 'blur(25px)',
          zIndex: '0',
          pointerEvents: 'none',
        },
        '.radial-blur-tr': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.radial-blur-tr::before': {
          content: '""',
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: colors.radialBlur.primary,
          filter: 'blur(25px)',
          zIndex: '0',
          pointerEvents: 'none',
        },
        '.radial-blur-br': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.radial-blur-br::before': {
          content: '""',
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: colors.radialBlur.primary,
          filter: 'blur(25px)',
          zIndex: '0',
          pointerEvents: 'none',
        },
        '.radial-blur-bl': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.radial-blur-bl::before': {
          content: '""',
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: colors.radialBlur.primary,
          filter: 'blur(25px)',
          zIndex: '0',
          pointerEvents: 'none',
        },
        '.radial-blur-accent-tl::before': {
          background: colors.radialBlur.accent,
        },
        '.radial-blur-accent-tr::before': {
          background: colors.radialBlur.accent,
        },
        '.radial-blur-accent-br::before': {
          background: colors.radialBlur.accent,
        },
        '.radial-blur-accent-bl::before': {
          background: colors.radialBlur.accent,
        },
        '.radial-blur-secondary-tl::before': {
          background: colors.radialBlur.secondary,
        },
        '.radial-blur-secondary-tr::before': {
          background: colors.radialBlur.secondary,
        },
        '.radial-blur-secondary-br::before': {
          background: colors.radialBlur.secondary,
        },
        '.radial-blur-secondary-bl::before': {
          background: colors.radialBlur.secondary,
        },
      });
    }),
  ],
};
export default config;
