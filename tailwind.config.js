/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#20C997',
          600: '#1BB882',
          700: '#16A975',
          900: '#0D5D42'
        },
        secondary: {
          50: '#F8F4FF',
          100: '#EDE9FE',
          500: '#845EF7',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#4C1D95'
        },
        success: '#37B24D',
        warning: '#FAB005',
        error: '#F03E3E',
        dark: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A'
        },
        surface: {
          base: '#121212',
          elevated: '#1E1E1E',
          raised: '#2C2C2C',
          overlay: '#333333'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body': ['1rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'label': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px'
      },
      boxShadow: {
        'glow': '0 0 20px rgba(32, 201, 151, 0.3)',
        'glow-purple': '0 0 20px rgba(132, 94, 247, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.35s ease-in-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}