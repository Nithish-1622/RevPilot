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
        primary: {
          DEFAULT: '#0A2540',
          dark: '#02042B',
          light: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#0C6FEE',
          dark: '#0B5ED7',
          light: '#3B8DFC',
          50: '#F0F6FF',
        },
        tertiary: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857',
          bg: '#ECFDF5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Product Sans"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
