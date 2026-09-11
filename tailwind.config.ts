import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dazly: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Core brand primary Purple
          600: '#7c3aed', // Darker Purple
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          dark: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          mart: '#10b981', // Dazly Mart vibrant green
        },
      },
      fontFamily: {
        arabic: ['Vazirmatn', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(139, 92, 246, 0.45)',
        'glow-mart': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'sticky-bar': '0 -8px 30px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
