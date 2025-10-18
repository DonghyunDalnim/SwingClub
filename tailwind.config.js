/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soomgo brand colors
        primary: {
          main: '#693BF2',
          hover: '#5A2FD9',
        },
        secondary: {
          light: '#F1EEFF',
          medium: '#E3DEFF',
        },
        neutral: {
          darkest: '#293341',
          dark: '#1C242F',
          medium: '#6A7685',
          light: '#C7CED6',
          lightest: '#EFF1F5',
          background: '#F6F7F9',
        },
        accent: {
          red: '#EA1623',
          blue: '#103580',
        },
      },
      fontFamily: {
        primary: ['Pretendard', 'var(--font-pretendard)', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '16px',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1200px',
        },
      },
    },
  },
  plugins: [],
}
