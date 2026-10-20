/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 品牌语义色沿用全站令牌，透明度修饰符也从同一组 RGB 通道生成。
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--uied-color-primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--uied-color-primary-hover-rgb) / <alpha-value>)',
          soft: 'rgb(var(--uied-color-primary-soft-rgb) / <alpha-value>)',
          border: 'rgb(var(--uied-color-primary-border-rgb) / <alpha-value>)',
        },
      },
    },
    screens: {
      // 自定义响应式尺寸
      'c-xs': {'max': '768px'},
      'c-sm': {'min': '768px'}, //相当远默认的md
      'c-md': {'min': '992px'},
      'c-lg': {'min': '1200px'},
      ...defaultTheme.screens,
    },
    animation: {
      fold: 'fold 1s infinite'
    },
    keyframes: {
      fold: {
        '0%, 100%': { 
          opacity: 0
        },  
        '50%': { 
          opacity: 1
        }  
      }
    }
  },
  plugins: [],
}

