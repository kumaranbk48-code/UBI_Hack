/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F6F2EA',
        surface: {
          DEFAULT: '#FBF9F4',
          raised: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#1C1A17',
          muted: '#5E5A52',
          /* Darkened for WCAG AA compliance (>= 4.5:1 on --surface and --bg) */
          subtle: '#6F6A60',
        },
        line: {
          DEFAULT: '#E4DDD0',
          dark: '#D3C9B8',
        },
        brand: {
          DEFAULT: '#1F3A34',
          hover: '#162B26',
          light: '#EAEFEA',
        },
        accent: {
          /* Darkened for WCAG AA compliance (>= 4.5:1 on --surface and --bg) */
          DEFAULT: '#93631D',
          tint: '#F9F5EC',
        },
        status: {
          positive: '#2F6B4F',
          'positive-tint': 'rgba(47, 107, 79, 0.08)',
          /* Darkened for WCAG AA compliance (>= 4.5:1 on --warning-tint) */
          warning: '#945511',
          'warning-tint': 'rgba(168, 102, 31, 0.08)',
          danger: '#9B3B30',
          'danger-tint': 'rgba(155, 59, 48, 0.08)',
          info: '#3A5A78',
          'info-tint': 'rgba(58, 90, 120, 0.08)',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '10px',
        xl: '10px',
        '2xl': '12px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 26, 23, 0.06)',
        popover: '0 4px 16px rgba(28, 26, 23, 0.08), 0 1px 2px rgba(28, 26, 23, 0.04)',
      },
    },
  },
  plugins: [],
}

