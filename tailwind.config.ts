import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          bg: 'var(--color-bg)',
          sidebar: 'var(--color-sidebar)',
          surface: 'var(--color-surface)',
          'surface-hover': 'var(--color-surface-hover)',
          card: 'var(--color-card)',
          'card-hover': 'var(--color-card-hover)',
          border: 'var(--color-border)',
          green: 'var(--color-green)',
          'green-dim': 'var(--color-green-dim)',
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
        },
      },
      borderRadius: {
        'ds-sm': 'var(--radius-sm)',
        'ds-md': 'var(--radius-md)',
        'ds-lg': 'var(--radius-lg)',
        'ds-xl': 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'ds-xs': 'var(--space-xs)',
        'ds-sm': 'var(--space-sm)',
        'ds-md': 'var(--space-md)',
        'ds-lg': 'var(--space-lg)',
        'ds-xl': 'var(--space-xl)',
        'ds-2xl': 'var(--space-2xl)',
      },
      maxWidth: {
        sidebar: 'var(--sidebar-width)',
      },
    },
  },
  plugins: [],
}
export default config
