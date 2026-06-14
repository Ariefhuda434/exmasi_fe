/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        exBlack: '#050505',
        exDark: '#0b0b0d',
        exRed: '#b91c1c',
        exSilver: '#d9d9d9'
      },
      boxShadow: {
        glow: '0 0 80px rgba(255,255,255,.16)',
        redGlow: '0 0 70px rgba(185,28,28,.34)'
      },
      backgroundImage: {
        ornament: 'radial-gradient(circle at 20% 0%, rgba(255,255,255,.20), transparent 24rem), radial-gradient(circle at 90% 20%, rgba(185,28,28,.18), transparent 22rem)'
      }
    }
  },
  plugins: []
}
