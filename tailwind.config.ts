module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      minHeight: {
        '11': '44px', // 44px para touch targets
        '12': '48px',
        '14': '56px',
      }
    },
  },
  // ...otras configuraciones
}
