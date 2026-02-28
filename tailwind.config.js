const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",

  // تفعيل ال Dark Mode بنظام ال class بحيث نتحكم فيه من React
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],

  theme: {
    extend: {
      /* =========================
         Fonts
      ========================= */
      fontFamily: {
        sans: ["Cairo", "Inter var", ...fontFamily.sans],
      },

      /* Text sizes للموبايل مريحة */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.25rem" }],
        sm: ["0.875rem", { lineHeight: "1.5rem" }],
        base: ["1rem", { lineHeight: "1.75rem" }],
        lg: ["1.125rem", { lineHeight: "1.9rem" }],
        xl: ["1.25rem", { lineHeight: "2rem" }],
        "2xl": ["1.5rem", { lineHeight: "2.2rem" }],
      },

      /* ألوان ثيم DarkFit */
      colors: {
        primary: "#59f20d",
        "background-light": "#f6f8f5",
        "background-dark": "#0a0d08",
        darkfit: {
          bg: "#0a0d08",
          card: "#1a2318",
          border: "#2a3528",
          primary: "#59f20d",
          50: "#f5fbf7",
          100: "#e9f7ef",
          200: "#c9eedb",
          300: "#9fe0c0",
          400: "#60c99a",
          500: "#59f20d",
          600: "#4ed10a",
          700: "#3eb808",
          800: "#2e8a06",
          900: "#1f5c04",
        },
        neon: {
          400: "#59f20d",
          500: "#4ed10a",
        },
      },

      /* Radius ناعم للكروت */
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },

      /* ظلال ناعمة */
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.18)",
        hover: "0 16px 45px rgba(0,0,0,0.25)",
      },

      /* خلفيات */
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #59f20d 0%, #4ed10a 100%)",
        "app-gradient":
          "radial-gradient(900px 500px at 50% -10%, rgba(89,242,13,0.18), transparent 60%)",
      },
    },
  },

  variants: {
    extend: {
      boxShadow: ["hover"],
      backgroundColor: ["active"],
    },
  },

  plugins: [],
};
