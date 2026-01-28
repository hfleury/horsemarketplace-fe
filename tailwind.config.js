/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantic colors that adapt to theme
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        border: 'var(--color-border)',

        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },

        // Dark/Neutral palette (adapts via CSS variables)
        dark: {
          DEFAULT: 'var(--color-background)', // Use background for default
          100: 'var(--color-dark-100)',
          200: 'var(--color-dark-200)',
          300: 'var(--color-dark-300)',
          400: '#38384A', // Keep these hardcoded if not variable-ized, or add vars if needed
          500: '#42425C',
        },
        // Accent colors with gradients
        accent: {
          purple: 'var(--color-accent-purple)',
          blue: 'var(--color-accent-blue)',
          pink: 'var(--color-accent-pink)',
          cyan: '#06B6D4',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        // Text colors
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },

        // Custom Admin Dashboard Colors
        boxdark: '#24303F',
        'boxdark-2': '#1A222C',
        bodydark: '#AEB7C0',
        bodydark1: '#DEE4EE',
        bodydark2: '#8A99AF',
        graydark: '#333A48',
        'meta-4': '#313D4A',
        primary: '#3C50E0',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8358FF 0%, #3B82F6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #EC4899 0%, #8358FF 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        'gradient-dark': 'linear-gradient(180deg, var(--color-background) 0%, var(--color-dark-100) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(131, 88, 255, 0.3)',
        'glow-md': '0 0 20px rgba(131, 88, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(131, 88, 255, 0.5)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 32px rgba(131, 88, 255, 0.2)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}