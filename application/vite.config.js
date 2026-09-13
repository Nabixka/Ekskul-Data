import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
