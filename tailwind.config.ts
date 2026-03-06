import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'tg-main': 'var(--tg-theme-bg-color, #ffffff)',
                'tg-secondary': 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
                'tg-primary': 'var(--tg-theme-text-color, #000000)',
                'tg-hint': 'var(--tg-theme-hint-color, #999999)',
                'tg-link': 'var(--tg-theme-link-color, #2481cc)',
                'tg-button': 'var(--tg-theme-button-color, #2481cc)',
                'tg-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
            },
            spacing: {
                'safe': 'env(safe-area-inset-bottom)',
            }
        },
    },
    plugins: [],
} satisfies Config
