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
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
        razorblue: {
          DEFAULT: '#0C6FEE',
          50: '#F0F6FF',
          100: '#E0EDFF',
          500: '#0C6FEE',
          600: '#0B5ED7',
          700: '#094EB5',
        },
        razornavy: {
          DEFAULT: '#02042B',
          light: '#070D1E',
          card: '#0E162B',
        }
      },
      backgroundColor: {
        main: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
      },
      textColor: {
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
      }
    },
  },
  plugins: [],
}
