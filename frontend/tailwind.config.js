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
        forest: {
          50: '#F0F7F4',
          100: '#DCEFE5',  // Soft Mint
          200: '#B8DFCE',
          300: '#91CEB4',
          400: '#70B99A',  // Sage Green
          500: '#4DA280',
          600: '#328565',  // Emerald
          700: '#205C49',  // Forest Green
          800: '#17483B',
          900: '#123C32',  // Deep Forest Green
          950: '#0B231D',
        },
        surface: {
          light: '#FFFFFF',
          'light-subtle': '#EDF5EF', // Soft Green Surface
          'light-bg': '#F7FAF7',     // Light Background
          dark: '#192A23',          // Dark Surface
          'dark-subtle': '#223830',
          'dark-bg': '#101C18',     // Dark Background
        },
        content: {
          'light-primary': '#1C2C25',   // Primary Text (Light)
          'light-secondary': '#718078', // Secondary Text (Light)
          'light-muted': '#9CA8A2',
          'dark-primary': '#E8F1EB',    // Dark Mode Text
          'dark-secondary': '#A3B8AD',
          'dark-muted': '#72897E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'forest-sm': '0 1px 2px 0 rgba(18, 60, 50, 0.05)',
        'forest-md': '0 4px 6px -1px rgba(18, 60, 50, 0.08), 0 2px 4px -1px rgba(18, 60, 50, 0.04)',
        'forest-lg': '0 10px 15px -3px rgba(18, 60, 50, 0.1), 0 4px 6px -2px rgba(18, 60, 50, 0.05)',
        'forest-xl': '0 20px 25px -5px rgba(18, 60, 50, 0.12), 0 10px 10px -5px rgba(18, 60, 50, 0.04)',
        'forest-glow': '0 0 15px rgba(50, 133, 101, 0.35)',
      }
    },
  },
  plugins: [],
}
