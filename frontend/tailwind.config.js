/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'tm-blue': '#026CDF',
        'tm-blue-dark': '#0156B3',
        'tm-black': '#000000',
        'tm-dark': '#1a1a1a',
        'tm-card-dark': '#222222',
        'tm-gray-light': '#f0f2f8',
        'tm-input-bg': '#ffffff',
        'tm-border': '#e0e0e0',
        'tm-text-muted': '#767676',
        'tm-green': '#00843D',
        'tm-red': '#E31837',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
