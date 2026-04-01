/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ion: {
          nt: '#4a8fff',      /* Non-terminals, active, info */
          t: '#3dbb6e',       /* Terminals, added, complete */
          err: '#e05252',     /* Removed, error, fresh vars */
          page: '#0a0a0a',
          app: '#0e0e0e',
          panel: '#141414',
          row: '#1a1a1a',
          input: '#111111',
          'border-dim': '#1e1e1e',
          border: '#2a2a2a',
          text: '#f0f0f0',
          'text-dim': '#909090',
          muted: '#505050',
          /* Backwards compatibility */
          cyan: '#4a8fff',
          purple: '#4a8fff',
          green: '#3dbb6e',
          yellow: '#e05252',
          red: '#e05252',
          bg: '#0a0a0a',
          'panel-2': '#1a1a1a',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'focus-nt': '0 0 0 3px rgba(74, 143, 255, 0.15)',
        'focus-err': '0 0 0 3px rgba(224, 82, 82, 0.15)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'fade-up': 'fadeUp 350ms cubic-bezier(0.25,0.46,0.45,0.94) forwards',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
