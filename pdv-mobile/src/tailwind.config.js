// tailwind.config.js
module.exports = {
    content: [ "./src/**/*.{js,jsx,ts,tsx}" ],
    theme: {
      extend: {
        keyframes: {
          // our previous fade-in-out
          "fade-in-out": {
            "0%":   { opacity: "0" },
            "20%":  { opacity: "1" },
            "80%":  { opacity: "1" },
            "100%": { opacity: "0" }
          },
          // new techno logo intro
          "logo-techno": {
            "0%":   { transform: "scale(0.5) rotate(0deg)", opacity: "0", filter: "drop-shadow(0 0 0px rgba(59,130,246,0))" },
            "30%":  { transform: "scale(1.1) rotate(180deg)", opacity: "1", filter: "drop-shadow(0 0 20px rgba(59,130,246,0.8))" },
            "70%":  { transform: "scale(1.0) rotate(270deg)", opacity: "1", filter: "drop-shadow(0 0 15px rgba(59,130,246,0.6))" },
            "100%": { transform: "scale(0.8) rotate(360deg)", opacity: "0", filter: "drop-shadow(0 0 0px rgba(59,130,246,0))" }
          }
        },
        animation: {
          "fade-in-out":   "fade-in-out 3s ease-in-out forwards",
          "logo-techno":   "logo-techno 3s ease-in-out forwards"
        }
      }
    },
    plugins: []
  }
  