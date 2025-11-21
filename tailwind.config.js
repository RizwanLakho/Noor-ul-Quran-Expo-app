/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}', // ✅ include all screens, navigations, etc
    './components/**/*.{js,jsx,ts,tsx}', // ✅ include components folder
    './screens/**/*.{js,jsx,ts,tsx}', // ✅ if you have a separate screens folder
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        urdu: ['urdu'],
        quranic: ['quranic'],
        uthman: ['uthman'],
      },
    },
  },
  plugins: [],
};
