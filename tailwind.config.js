/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: '#FF3E6C',
          'crimson-dark': '#E63946',
          'crimson-hover': '#D62839',
          slate: '#282C3F',
          'slate-dark': '#1D3557',
          gold: '#D4AF37',
          'gold-light': '#F4E0A5',
          bg: '#F5F5F6',
          surface: '#FFFFFF',
          muted: '#94A3B8',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        hover: '0 10px 25px -3px rgba(255, 62, 108, 0.15)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
