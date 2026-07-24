/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#060a12',
        'bg-secondary': 'rgba(6, 10, 18, 0.94)',
        'text-primary': '#e8ecf2',
        'text-secondary': 'rgba(255, 255, 255, 0.55)',
        'text-muted': 'rgba(255, 255, 255, 0.25)',
        'accent': '#d4a853',
        'node-default': '#4a5a6a',
        'node-highlight': '#aabbcc',
        'node-fade': '#3a4a5a',
        'link-default': '#7a8a9a'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif']
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px'
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'md': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'lg': '0 12px 40px rgba(0, 0, 0, 0.6)'
      },
      transitionTimingFunction: {
        'sidebar': 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
};