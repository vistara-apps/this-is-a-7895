/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 15%, 98%)',
        accent: 'hsl(160, 100%, 40%)',
        primary: 'hsl(210, 90%, 45%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(210, 15%, 15%)',
        'text-secondary': 'hsl(210, 15%, 35%)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 20%, 30%, 0.1)',
      },
    },
  },
  plugins: [],
}