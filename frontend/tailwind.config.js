module.exports = {
  presets: [
    require('frappe-ui/src/utils/tailwind.config')
  ],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/frappe-ui/src/components/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SalesHub brand palette
        surface: '#F2F0EF',   // warm off-white — page & card backgrounds
        muted:   '#BBBDBC',   // warm gray — secondary text, borders, dividers
        primary: {
          DEFAULT: '#245F73', // deep teal — CTAs, active states, links
          dark:    '#1c4d5e', // hover / pressed variant
        },
        accent: {
          DEFAULT: '#733E24', // terracotta — secondary chips, badges, accents
          dark:    '#5c3119', // hover / pressed variant
        },
      },
    },
  },
  plugins: [],
}
