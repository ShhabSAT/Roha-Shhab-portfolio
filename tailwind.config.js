/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crimson-shadow': 'var(--crimson-shadow)',
        'crimson-velvet': 'var(--crimson-velvet)',
        'crimson-glow': 'var(--crimson-glow)',
        'parchment-light': 'var(--parchment-light)',
        'parchment-warm': 'var(--parchment-warm)',
        'ink-dark': 'var(--ink-dark)',
        'terracotta': 'var(--terracotta)',
        'gold-antique': 'var(--gold-antique)',
        'border-hairline': 'var(--border-hairline)',

        // direct color shortcuts
        crimson: {
          shadow: '#1B0405',
          velvet: '#3E090B',
          glow: '#611211',
          DEFAULT: '#3E090B',
        },
        parchment: {
          light: '#EFE5D1',
          warm: '#E2D3B7',
          DEFAULT: '#EFE5D1',
        },
        ink: {
          dark: '#1E0707',
          DEFAULT: '#1E0707',
        },
        gold: {
          antique: '#C8A86B',
          DEFAULT: '#C8A86B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      borderColor: {
        hairline: 'var(--border-hairline)',
      },
    },
  },
  plugins: [],
};
