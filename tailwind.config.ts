import type { Config } from 'tailwindcss';

/** Palette officielle JE SUIS KCCiste : nuit profonde, or lumineux, ivoire. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: '#0E1830', 950: '#060C1A', 900: '#0A1226', 800: '#0E1830', 700: '#13223F', 600: '#1C3157', 500: '#2A4573' },
        deep: '#13223F',
        gold: { DEFAULT: '#D6AE5C', 50: '#FCF8EE', 100: '#F7EDD3', 200: '#EFDBA8', 300: '#E5C680', 400: '#D6AE5C', 500: '#C49643', 600: '#A67B30', 700: '#7F5E26' },
        ember: '#E8875B',
        mist: '#F6F4EF',
        ink: '#1B2233',
      },
      fontFamily: {
        display: ['"Fraunces Variable"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14,24,48,.04), 0 10px 30px -14px rgba(14,24,48,.14)',
        lift: '0 2px 6px rgba(14,24,48,.05), 0 28px 60px -22px rgba(14,24,48,.32)',
        glow: '0 10px 40px -10px rgba(214,174,92,.55)',
        'inner-line': 'inset 0 1px 0 rgba(255,255,255,.08)',
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        aurora: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '50%': { transform: 'translate3d(-4%,3%,0) scale(1.08)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 7s ease-in-out infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
