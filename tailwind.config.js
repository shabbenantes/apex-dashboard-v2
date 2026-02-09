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
          bg: '#0F0F1A',
          card: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.08)',
          purple: '#6366F1',
          'purple-light': '#8B5CF6',
          'purple-glow': 'rgba(99,102,241,0.4)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
