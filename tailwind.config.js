/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          dark: '#0f172a',
          card: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.08)',
          orange: '#f97316',
          'orange-hover': '#ea580c',
          'orange-glow': 'rgba(249,115,22,0.3)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
