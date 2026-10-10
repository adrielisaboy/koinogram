import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172d4b',
        paper: '#f8f7f3',
        mist: '#ddeaf4',
        sky: '#527da8',
        brass: '#b99455',
        charcoal: '#26313d',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        editorial: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        paper: '0 8px 28px rgba(23, 45, 75, .06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
