import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Cosmic Theme Colors */
        cosmic: {
          gold: "hsl(var(--cosmic-gold))",
          "gold-light": "hsl(var(--cosmic-gold-light))", 
          purple: "hsl(var(--cosmic-purple))",
          "purple-light": "hsl(var(--cosmic-purple-light))",
          blue: "hsl(var(--cosmic-blue))",
          "blue-light": "hsl(var(--cosmic-blue-light))",
          green: "hsl(var(--cosmic-green))",
          "green-light": "hsl(var(--cosmic-green-light))",
          dark: "hsl(var(--cosmic-dark))",
          "dark-foreground": "hsl(var(--cosmic-dark-foreground))",
          nebula: "hsl(var(--cosmic-nebula))",
          "nebula-light": "hsl(var(--cosmic-nebula-light))",
        },
        aurum: {
          gold: "hsl(var(--aurum-gold))",
          "gold-deep": "hsl(var(--aurum-gold-deep))",
          "gold-dark": "hsl(var(--aurum-gold-dark))",
          marble: "hsl(var(--aurum-marble))",
          "marble-mid": "hsl(var(--aurum-marble-mid))",
          "marble-deep": "hsl(var(--aurum-marble-deep))",
          ink: "hsl(var(--aurum-ink))",
          "ink-soft": "hsl(var(--aurum-ink-soft))",
          cream: "hsl(var(--aurum-cream))",
          blood: "hsl(var(--aurum-blood))",
          "blood-soft": "hsl(var(--aurum-blood-soft))",
        },
      },
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        body: ['"Spectral"', "serif"],
        "mono-aurum": ['"IBM Plex Mono"', "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "cosmic-float": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-20px) rotate(180deg)",
          },
        },
        "stellar-pulse": {
          "0%, 100%": {
            opacity: "0.4",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.1)",
          },
        },
        "nebula-drift": {
          "0%": { transform: "translateX(-100%) rotate(0deg)" },
          "100%": { transform: "translateX(100vw) rotate(360deg)" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cosmic-float": "cosmic-float 6s ease-in-out infinite",
        "stellar-pulse": "stellar-pulse 2s ease-in-out infinite",
        "nebula-drift": "nebula-drift 20s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
