/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2b5c8f',
          600: '#1e446c',
          700: '#163352',
          900: '#0c1c2e'
        }
      }
    },
  },
  plugins: [],
}

