/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      colors: {
        weather: {
          sunny: '#FFA500',
          cloudy: '#87CEEB',
          rainy: '#4682B4',
          snowy: '#F0F8FF',
        }
      },
      backgroundImage: {
        'gradient-sunny': 'linear-gradient(45deg, #FFD700, #FFA500)',
        'gradient-cloudy': 'linear-gradient(45deg, #87CEEB, #B0C4DE)',
        'gradient-rainy': 'linear-gradient(45deg, #4682B4, #708090)',
        'gradient-snowy': 'linear-gradient(45deg, #F0F8FF, #E6E6FA)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}