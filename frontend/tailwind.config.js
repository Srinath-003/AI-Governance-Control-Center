/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aivar: {
          black: '#000000',
          bg: '#050505',
          panel: '#0C0C0E',
          card: '#121215',
          border: '#222226',
          borderLight: '#33333B',
          textMuted: '#9999A1',
          accent: '#7C3AED',       // Electric Purple / Violet
          accentHover: '#6D28D9',
          accentLight: '#A855F7',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
