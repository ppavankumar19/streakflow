/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        flame: {
          DEFAULT: '#FF6B1A',
          2: '#FF3D68',
          dim: 'rgba(255,107,26,0.10)',
          glow: 'rgba(255,107,26,0.35)',
        },
        ice: {
          DEFAULT: '#4FBEFF',
          dim: 'rgba(79,190,255,0.10)',
        },
        mint: {
          DEFAULT: '#2ECFA0',
          dim: 'rgba(46,207,160,0.10)',
        },
        gold: {
          DEFAULT: '#F5C842',
          dim: 'rgba(245,200,66,0.10)',
        },
        surface: {
          DEFAULT: '#111116',
          2: '#17171E',
          3: '#1E1E28',
        },
        border: {
          DEFAULT: '#1B1B24',
          2: 'rgba(38,38,51,0.5)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Courier New', 'monospace'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #FF6B1A 0%, #FF3D68 100%)',
        'flame-h': 'linear-gradient(90deg, #FF6B1A, #FF3D68)',
      },
      boxShadow: {
        flame: '0 0 20px rgba(255,107,26,0.35)',
        'flame-sm': '0 0 10px rgba(255,107,26,0.25)',
      },
      animation: {
        'pulse-fire': 'pulsefire 2.4s ease-in-out infinite',
        'slide-up': 'slideup 0.3s ease both',
        'fade-in': 'fadein 0.15s ease',
      },
      keyframes: {
        pulsefire: {
          '0%,100%': { transform: 'scale(1) rotate(-2deg)', filter: 'brightness(1)' },
          '50%': {
            transform: 'scale(1.1) rotate(2deg)',
            filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(255,107,26,0.4))',
          },
        },
        slideup: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadein: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
