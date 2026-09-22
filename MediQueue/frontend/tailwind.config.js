/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#1863DC",
                    dark: "#0B3B72",
                    light: "#4E8CF0",
                },
                accent: {
                    DEFAULT: "#17A673",
                    light: "#DFF6EC",
                },
                warning: {
                    DEFAULT: "#F5A524",
                    light: "#FEF3DC",
                },
                danger: {
                    DEFAULT: "#E5484D",
                    light: "#FDE8E8",
                },
                sky: {
                    DEFAULT: "#EAF3FF",
                },
                ink: {
                    DEFAULT: "#1B2430",
                    muted: "#5B6B7D",
                },
            },
            fontFamily: {
                display: ["Poppins", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            boxShadow: {
                soft: "0 2px 10px rgba(24, 99, 220, 0.08)",
                card: "0 4px 20px rgba(11, 59, 114, 0.08)",
                lift: "0 12px 28px rgba(11, 59, 114, 0.14)",
            },
            keyframes: {
                fadeInUp: {
                    "0%": { opacity: 0, transform: "translateY(12px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(24, 99, 220, 0.25)" },
                    "50%": { boxShadow: "0 0 0 10px rgba(24, 99, 220, 0)" },
                },
                heartbeat: {
                    "0%, 100%": { transform: "scale(1)" },
                    "25%": { transform: "scale(1.08)" },
                    "40%": { transform: "scale(0.98)" },
                    "60%": { transform: "scale(1.05)" },
                },
                slideIn: {
                    "0%": { opacity: 0, transform: "translateX(24px)" },
                    "100%": { opacity: 1, transform: "translateX(0)" },
                },
                drawLine: {
                    "0%": { strokeDashoffset: 240 },
                    "100%": { strokeDashoffset: 0 },
                },
            },
            animation: {
                "fade-in-up": "fadeInUp 0.45s ease-out both",
                "pulse-glow": "pulseGlow 2.2s ease-in-out infinite",
                heartbeat: "heartbeat 1.8s ease-in-out infinite",
                "slide-in": "slideIn 0.3s ease-out both",
                "draw-line": "drawLine 1.6s ease-out forwards",
            },
        },
    },
    plugins: [],
};