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
          blue: '#1ba1f5', // Primary active blue
          navy: '#0b163f', // Dark bottom nav active border
          bg: '#fcfcfc', // Light app background
          card: '#ffffff', // Card background
          textMain: '#1e293b',
          textMuted: '#64748b',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
