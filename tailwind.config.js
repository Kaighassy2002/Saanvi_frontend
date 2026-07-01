/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a34a',
          light: '#e6c883',
          dark: '#9f7a2c',
        },
        beige: {
          DEFAULT: '#f8f1e6',
          dark: '#ecdfc8',
        },
        ink: '#1f1514',
        muted: '#6f5d5b',
        subtle: '#8a7573',
        border: {
          DEFAULT: '#eadfc9',
          light: '#f0e6d4',
        },
        surface: {
          DEFAULT: '#fffdf9',
          elevated: '#ffffff',
          warm: '#f8f2e7',
        },
        cream: '#fff8ee',
        parchment: '#faf6ef',
        highlight: '#f5ead7',
        success: '#5a6b52',
        accent: '#7a2c3a',
        royal: {
          950: '#2a1116',
          900: '#3a151d',
          800: '#5a1f2b',
          700: '#7a2c3a',
          100: '#f7ecee',
        },
      },
      fontFamily: {
        'bodoni': ['Bodoni Moda', 'serif'],
        'playfair': ['Playfair Display', 'serif'],
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
