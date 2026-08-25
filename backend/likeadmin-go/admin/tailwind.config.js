/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        colors: {
            white: 'var(--color-white)',
            primary: {
                DEFAULT: 'var(--ui-color-primary)',
                'light-3': 'var(--ui-color-primary-light-3)',
                'light-5': 'var(--ui-color-primary-light-5)',
                'light-7': 'var(--ui-color-primary-light-7)',
                'light-8': 'var(--ui-color-primary-light-8)',
                'light-9': 'var(--ui-color-primary-light-9)',
                'dark-2': 'var(--ui-color-primary-dark-2)'
            },
            success: 'var(--ui-color-success)',
            warning: 'var(--ui-color-warning)',
            danger: 'var(--ui-color-danger)',
            error: 'var(--ui-color-error)',
            info: 'var(--ui-color-info)',
            body: 'var(--ui-bg-color)',
            page: 'var(--ui-bg-color-page)',
            'tx-primary': 'var(--ui-text-color-primary)',
            'tx-regular': 'var(--ui-text-color-regular)',
            'tx-secondary': 'var(--ui-text-color-secondary)',
            'tx-placeholder': 'var(--ui-text-color-placeholder)',
            'tx-disabled': 'var(--ui-text-color-disabled)',
            br: 'var(--ui-border-color)',
            'br-light': 'var(--ui-border-color-light)',
            'br-extra-light': 'var(--ui-border-color-extra-light)',
            'br-dark': 'var(--ui-border-color-dark)',
            fill: 'var(--ui-fill-color)',
            'fill-light': 'var(--ui-fill-color-light)',
            'fill-lighter': 'var(--ui-fill-color-lighter)',
            mask: 'var(--ui-mask-color)'
        },
        fontFamily: {
            sans: ['PingFang SC', 'Arial', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif']
        },
        boxShadow: {
            DEFAULT: 'var(--ui-box-shadow)',
            light: 'var(--ui-box-shadow-light)',
            lighter: 'var(--ui-box-shadow-lighter)',
            dark: 'var(--ui-box-shadow-dark)'
        },
        fontSize: {
            xs: 'var(--ui-font-size-extra-small)',
            sm: 'var(--ui-font-size-small)',
            base: 'var(--ui-font-size-base)',
            lg: 'var(--ui-font-size-medium)',
            xl: 'var(--ui-font-size-large)',
            '2xl': 'var(--ui-font-size-extra-large)',
            '3xl': '20px',
            '4xl': '24px',
            '5xl': '28px',
            '6xl': '30px',
            '7xl': '36px',
            '8xl': '48px',
            '9xl': '60px'
        },
        spacing: {
            px: '1px',
            0: '0px',
            0.5: '2px',
            1: '4px',
            1.5: '6px',
            2: '8px',
            2.5: '10px',
            3: '12px',
            3.5: '14px',
            4: '16px',
            5: '20px',
            6: '24px',
            7: '28px',
            8: '32px',
            9: '36px',
            10: '40px',
            11: '44px',
            12: '48px',
            14: '56px',
            16: '64px',
            20: '80px',
            24: '96px',
            28: '112px',
            32: '128px',
            36: '144px',
            40: '160px',
            44: '176px',
            48: '192px',
            52: '208px',
            56: '224px',
            60: '240px',
            64: '256px',
            72: '288px',
            80: '320px',
            96: '384px'
        },
        lineHeight: {
            none: '1',
            tight: '1.25',
            snug: '1.375',
            normal: '1.5',
            relaxed: '1.625',
            loose: '2',
            3: '12px',
            4: '16px',
            5: '20px',
            6: '24px',
            7: '28px',
            8: '32px',
            9: '36px',
            10: '40px'
        }
    },

    plugins: [
        require('@tailwindcss/line-clamp') // 引入插件
    ]
}
