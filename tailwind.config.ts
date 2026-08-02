import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b1220',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        brand: {
          950: '#04263a',
          900: '#063a56',
          800: '#0a4d70',
          700: '#0e6089',
          600: '#1478a8',
          500: '#1c92c9',
          400: '#4bacd9',
          300: '#8ccae7',
          200: '#c3e3f2',
          100: '#e6f4fa',
          50: '#f2faff',
        },
        gold: {
          600: '#b7791f',
          500: '#d69e2e',
          400: '#ecc94b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
