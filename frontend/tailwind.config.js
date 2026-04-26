/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          bg:      '#0d1117',
          panel:   '#111827',
          border:  '#1e2d40',
          cyan:    '#00d4ff',
          green:   '#00ff88',
          yellow:  '#ffd700',
          red:     '#ff4444',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    }
  },
  plugins: [],
}
