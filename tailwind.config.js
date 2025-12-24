/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './html/**/*.{js,ts,jsx,tsx,html}',
    './html/components/**/*.{js,ts,jsx,tsx}',
    './html/index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // iOS-like colors
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-yellow': '#FFCC00',
        'ios-teal': '#5AC8FA',
        'ios-purple': '#AF52DE',
        'ios-pink': '#FF2D55',
        'ios-gray': '#8E8E93',

        // Background colors
        'tablet-bg': 'rgba(0, 0, 0, 0.85)',
        'tablet-card': 'rgba(255, 255, 255, 0.1)',
        'tablet-overlay': 'rgba(0, 0, 0, 0.5)',

        // Job-specific colors
        'leo-blue': '#3B82F6',
        'ems-red': '#EF4444',
        'fire-orange': '#F97316',
        'mech-yellow': '#EAB308',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'ios': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'ios-lg': '0 10px 40px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(0, 122, 255, 0.3)',
        'glow-red': '0 0 20px rgba(255, 59, 48, 0.3)',
        'glow-green': '0 0 20px rgba(52, 199, 89, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
