/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agGreen: '#2E7D32',
        agCream: '#CFE8BE',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      dropShadow: {
        brand: '0 6px 16px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
