/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Background & Foreground
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // Primary (Brand Color)
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    hover: "hsl(var(--primary-hover))",
                    foreground: "hsl(var(--primary-foreground))",
                },

                // Secondary
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    hover: "hsl(var(--secondary-hover))",
                    foreground: "hsl(var(--secondary-foreground))",
                },

                // Muted
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },

                // Accent
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },

                // Destructive
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    hover: "hsl(var(--destructive-hover))",
                    foreground: "hsl(var(--destructive-foreground))",
                },

                // Borders & Inputs
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",

                // Typography
                title: "hsl(var(--title))",
                subtitle: "hsl(var(--subtitle))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [],
}
