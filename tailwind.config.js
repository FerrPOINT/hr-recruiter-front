/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF3E6',
          100: '#FFE0BF',
          200: '#FFC180',
          300: '#FFA142',
          400: '#FF8A1A',
          500: '#FF7A00',
          600: '#E66E00',
          700: '#B35400',
          800: '#804000',
          900: '#663300',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'wmt-orange': '#FF7A00',
        'wmt-orange-dark': '#E66E00',
        'wmt-orange-light': '#FFA142',
        'wmt-orange-bg': '#FFF3E6',
        'wmt-orange-accent': '#FF8A1A',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.1)',
        'medium': '0 4px 6px rgba(0,0,0,0.1)',
        'large': '0 10px 15px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
} 