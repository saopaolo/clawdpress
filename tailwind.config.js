/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F0F1A',
        ink2: '#1A1A2E',
        violet: { DEFAULT: '#7C5CFC', light: '#9B7FFF', tint: '#EDE9FF' },
        amber: { DEFAULT: '#F59E0B', tint: '#FEF3C7' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};
