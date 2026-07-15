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
        sakura: {
          50: '#FFF0F2',
          100: '#FFD9E1',
          200: '#FFB8C7',
          300: '#FF97AD',
          400: '#FF7693',
          500: '#FF5579',
          600: '#FF2A57',
          pink: '#FFC1CC',
        },
        cozy: {
          lavender: '#E6E6FA',
          peach: '#FFDAB9',
          cream: '#FFFDF0',
          skyblue: '#E0F7FA',
          purple: '#E9D5FF',
          darkBg: '#13111C',
          darkCard: '#1E1B2B',
          darkAccent: '#FF79C6',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        kosugi: ['"Kosugi Maru"', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
