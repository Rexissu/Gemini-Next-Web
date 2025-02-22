module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'drawer': 'transform'
      },
      zIndex: {
        'drawer': '50',
        'floating': '60'
      }
    },
  },
  plugins: [],
}
